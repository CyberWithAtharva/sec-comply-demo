-- ============================================================
-- SecComply: QMS Workflow module (ISO 9001 process layer)
-- ============================================================
-- The one genuinely-new build for ISO 9001. Process owners log
-- STRUCTURED records against a defined process, and each logged
-- entry auto-writes an evidence_artifacts row against the mapped
-- clause (control). This is simultaneously the process layer, the
-- evidence-generation engine, and the data source for Monitoring KPIs.
--
-- qms_processes is a global catalog (controls are global too); log
-- entries are org-scoped. Mirrors the RLS style of migration 007.
-- ============================================================

-- ------------------------------------------------------------
-- evidence_artifacts: distinguish auto-collected vs manual uploads
-- (the AUTO / MANUAL split in the Evidence Vault).
-- ------------------------------------------------------------
ALTER TABLE evidence_artifacts
    ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual'
        CHECK (source IN ('manual', 'workflow_log', 'integration'));

-- ------------------------------------------------------------
-- qms_processes — the process register (global catalog).
-- `schema` is the field definition for this process's log form.
-- `control_id` is the clause this process generates evidence for.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qms_processes (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    key         text NOT NULL UNIQUE,        -- 'incoming_inspection' etc.
    name        text NOT NULL,
    description text,
    owner_role  text,                        -- e.g. 'QC Inspector'
    clause      text,                         -- e.g. '8.4'
    control_id  uuid REFERENCES controls(id) ON DELETE SET NULL,
    schema      jsonb NOT NULL DEFAULT '{}'::jsonb,
    sort_order  integer NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- qms_log_entries — the structured records (org-scoped).
-- `payload` holds the typed fields; `result` is a normalized
-- outcome used by KPI filters (e.g. 'pass'/'reject'/'open'/'closed').
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qms_log_entries (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id      uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    process_id  uuid NOT NULL REFERENCES qms_processes(id) ON DELETE CASCADE,
    logged_by   uuid REFERENCES profiles(id),
    payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
    result      text,
    occurred_at timestamptz NOT NULL DEFAULT now(),
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS qms_log_entries_org_process_idx
    ON qms_log_entries (org_id, process_id, occurred_at DESC);

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
ALTER TABLE qms_processes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE qms_log_entries ENABLE ROW LEVEL SECURITY;

-- Process catalog: readable by all authenticated users; only admins manage it.
DROP POLICY IF EXISTS "qms_processes_select" ON qms_processes;
CREATE POLICY "qms_processes_select" ON qms_processes FOR SELECT USING (true);
DROP POLICY IF EXISTS "qms_processes_write" ON qms_processes;
CREATE POLICY "qms_processes_write" ON qms_processes FOR ALL USING (is_admin());

-- Log entries: org-scoped, reusing my_org_id() / is_admin() from migration 002.
DROP POLICY IF EXISTS "qms_log_entries_select" ON qms_log_entries;
CREATE POLICY "qms_log_entries_select" ON qms_log_entries FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
DROP POLICY IF EXISTS "qms_log_entries_write" ON qms_log_entries;
CREATE POLICY "qms_log_entries_write" ON qms_log_entries FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

-- ------------------------------------------------------------
-- Seed the four highest-evidence-yield processes, mapped to the
-- ISO 9001 clause controls seeded in migration 013.
-- ------------------------------------------------------------
INSERT INTO qms_processes (key, name, description, owner_role, clause, control_id, schema, sort_order) VALUES
(
    'incoming_inspection',
    'Incoming Inspection',
    'Inspect purchased material on receipt and record accept/reject. Feeds the reject-rate and first-pass-yield KPIs.',
    'QC Inspector',
    '8.4',
    (SELECT id FROM controls WHERE framework_id = 'f5000000-0000-0000-0000-000000000005' AND control_id = '8.4'),
    '{"resultField":"result","resultOptions":["pass","reject"],"fields":[
        {"key":"material","label":"Material","type":"text","required":true},
        {"key":"supplier","label":"Supplier","type":"text","required":true},
        {"key":"batch","label":"Batch / Lot No.","type":"text","required":true},
        {"key":"quantity","label":"Quantity","type":"number"},
        {"key":"result","label":"Result","type":"select","options":["pass","reject"],"required":true},
        {"key":"rework","label":"Required rework","type":"boolean"},
        {"key":"notes","label":"Notes","type":"textarea"}
    ]}'::jsonb,
    1
),
(
    'calibration',
    'Calibration',
    'Record calibration of monitoring & measuring instruments against due dates. Feeds the calibration-compliance KPI.',
    'Calibration In-charge',
    '7.1.5',
    (SELECT id FROM controls WHERE framework_id = 'f5000000-0000-0000-0000-000000000005' AND control_id = '7.1.5'),
    '{"resultField":"result","resultOptions":["pass","fail"],"fields":[
        {"key":"instrument_id","label":"Instrument ID","type":"text","required":true},
        {"key":"instrument_name","label":"Instrument","type":"text","required":true},
        {"key":"due_date","label":"Calibration due date","type":"date","required":true},
        {"key":"calibrated_date","label":"Calibrated on","type":"date","required":true},
        {"key":"result","label":"Result","type":"select","options":["pass","fail"],"required":true},
        {"key":"certificate_ref","label":"Certificate ref.","type":"text"},
        {"key":"notes","label":"Notes","type":"textarea"}
    ]}'::jsonb,
    2
),
(
    'ncr_capa',
    'Nonconformity & Corrective Action (NCR/CAPA)',
    'Log nonconformities with disposition, root cause and corrective action. Feeds the open-NCRs KPI.',
    'QA',
    '8.7',
    (SELECT id FROM controls WHERE framework_id = 'f5000000-0000-0000-0000-000000000005' AND control_id = '8.7'),
    '{"resultField":"status","resultOptions":["open","closed"],"fields":[
        {"key":"ncr_id","label":"NCR ID","type":"text","required":true},
        {"key":"description","label":"Nonconformity","type":"textarea","required":true},
        {"key":"disposition","label":"Disposition","type":"select","options":["rework","scrap","concession","return_to_supplier"]},
        {"key":"root_cause","label":"Root cause","type":"textarea"},
        {"key":"corrective_action","label":"Corrective action","type":"textarea"},
        {"key":"status","label":"Status","type":"select","options":["open","closed"],"required":true},
        {"key":"target_close_date","label":"Target close date","type":"date"}
    ]}'::jsonb,
    3
),
(
    'management_review',
    'Management Review',
    'Structured Clause 9.3 review. Inputs auto-populate from KPIs, audit findings, objectives and customer feedback.',
    'Top Management',
    '9.3',
    (SELECT id FROM controls WHERE framework_id = 'f5000000-0000-0000-0000-000000000005' AND control_id = '9.3'),
    '{"fields":[
        {"key":"review_date","label":"Review date","type":"date","required":true},
        {"key":"attendees","label":"Attendees","type":"text","required":true},
        {"key":"inputs_summary","label":"Inputs reviewed (KPIs, audits, objectives, feedback)","type":"textarea","required":true},
        {"key":"decisions","label":"Decisions","type":"textarea"},
        {"key":"actions","label":"Actions (owner / due date)","type":"textarea"}
    ]}'::jsonb,
    4
)
ON CONFLICT (key) DO NOTHING;
