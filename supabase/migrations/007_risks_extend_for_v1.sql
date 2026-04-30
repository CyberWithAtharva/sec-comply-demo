-- ============================================================
-- Risk Management v1 — extend risks table + add status history
-- Spec: Risk_Management_Feature_Doc 1.docx (Apr 2026)
-- ============================================================

-- 1. Status taxonomy migration
--    Old: identified | assessed | mitigating | accepted | closed
--    New: open | in_progress | mitigated | accepted | transferred | closed
ALTER TABLE risks DROP CONSTRAINT IF EXISTS risks_status_check;
UPDATE risks SET status = 'open'         WHERE status = 'identified';
UPDATE risks SET status = 'in_progress'  WHERE status = 'assessed';
UPDATE risks SET status = 'mitigated'    WHERE status = 'mitigating';
ALTER TABLE risks ADD CONSTRAINT risks_status_check
    CHECK (status IN ('open', 'in_progress', 'mitigated', 'accepted', 'transferred', 'closed'));

-- 2. Category — drop strict whitelist; library uses 17 categories.
ALTER TABLE risks DROP CONSTRAINT IF EXISTS risks_category_check;
-- (left intentionally unconstrained; UI is the source of truth for category names)

-- 3. New columns
ALTER TABLE risks ADD COLUMN IF NOT EXISTS display_id           text;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS library_risk_id      text;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS treatment            text
    CHECK (treatment IS NULL OR treatment IN ('mitigate', 'accept', 'transfer', 'avoid'));
ALTER TABLE risks ADD COLUMN IF NOT EXISTS residual_likelihood  int
    CHECK (residual_likelihood IS NULL OR residual_likelihood BETWEEN 1 AND 5);
ALTER TABLE risks ADD COLUMN IF NOT EXISTS residual_impact      int
    CHECK (residual_impact IS NULL OR residual_impact BETWEEN 1 AND 5);
-- Generated column: residual_score
ALTER TABLE risks ADD COLUMN IF NOT EXISTS residual_score       int
    GENERATED ALWAYS AS (residual_likelihood * residual_impact) STORED;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS framework_mappings   jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS recommendation       text;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS notes                text;

-- 4. Status history (audit trail) — see spec §5.2 "Status History"
CREATE TABLE IF NOT EXISTS risk_status_history (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id     uuid NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    field       text NOT NULL,           -- 'status' | 'likelihood' | 'impact' | 'treatment' | 'owner_id' | 'residual_likelihood' | 'residual_impact' | 'note'
    from_value  text,
    to_value    text,
    changed_by  uuid REFERENCES profiles(id),
    changed_at  timestamptz NOT NULL DEFAULT now(),
    note        text
);

CREATE INDEX IF NOT EXISTS risk_status_history_risk_idx
    ON risk_status_history (risk_id, changed_at DESC);

ALTER TABLE risk_status_history ENABLE ROW LEVEL SECURITY;

-- Reuse the existing my_org_id() / is_admin() helpers from migration 002
CREATE POLICY "risk_status_history_select" ON risk_status_history FOR SELECT USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM risks r
        WHERE r.id = risk_status_history.risk_id
          AND r.org_id = my_org_id()
    )
);
CREATE POLICY "risk_status_history_insert" ON risk_status_history FOR INSERT WITH CHECK (
    is_admin() OR EXISTS (
        SELECT 1 FROM risks r
        WHERE r.id = risk_status_history.risk_id
          AND r.org_id = my_org_id()
    )
);
