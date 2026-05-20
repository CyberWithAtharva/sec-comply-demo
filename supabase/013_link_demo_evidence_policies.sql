-- ============================================================
-- 013: Link demo evidence_artifacts and policies to controls
--
-- The demo seed (demo_seed.sql) creates 15 evidence_artifacts and a
-- batch of policies without joining them to controls, so the Evidence
-- Vault page renders every control as "Missing" despite the artifacts
-- existing. This migration:
--   1. Sets evidence_artifacts.control_id by matching filename keywords
--      to a specific ISO 27001 control (where one is unambiguously the
--      best fit).
--   2. Inserts policy_controls rows for every approved/active policy,
--      cross-linking it to relevant controls across ISO 27001, SOC 2,
--      NIST CSF and DPDPA so framework-coverage stats render correctly.
--
-- Idempotent: artifact UPDATE only fires when control_id IS NULL; the
-- policy_controls INSERT uses ON CONFLICT (policy_id, control_id).
-- ============================================================

BEGIN;

-- ── 1. Evidence artifacts → controls (one control per artifact) ─────────
WITH artifact_map(name_pattern, control_code) AS (
    VALUES
        ('MFA_Enforcement',          'A.5.17'),
        ('Access_Review_Q',          'A.5.18'),
        ('Security_Training',        'A.6.3'),
        ('Penetration_Test',         'A.8.29'),
        ('Vuln_Scan_Report',         'A.8.8'),
        ('Incident_Response_Tabletop','A.5.27'),
        ('Backup_Restore_Test',      'A.8.13'),
        ('Change_Approval_Log',      'A.8.32'),
        ('AWS_CloudTrail',           'A.8.15'),
        ('Encryption_At_Rest',       'A.8.24'),
        ('GDPR_DPA_Agreements',      'A.5.20'),
        ('Network_Diagram',          'A.8.20'),
        ('AWS_SOC2_Report',          'A.5.19'),
        ('Okta_SOC2',                'A.5.19'),
        ('Vendor_SOC2_Salesforce',   'A.5.21')
)
UPDATE evidence_artifacts ea
SET control_id = c.id
FROM artifact_map m
JOIN controls c ON c.control_id = m.control_code
WHERE ea.name LIKE m.name_pattern || '%'
  AND ea.control_id IS NULL;

-- ── 2. Policy → controls (cross-framework) ──────────────────────────────
-- Map a policy title (matched case-insensitively, substring) to a set of
-- control codes. Codes are unique across frameworks in the seeded data:
--   - A.x.y / A.x.y.z      → ISO 27001 (Annex A)
--   - CCn.n / An.n / Cn.n  → SOC 2 Type II
--   - GV.* / ID.* / PR.* / DE.* / RS.* / RC.*  → NIST CSF
--   - DPDPA-*               → DPDPA
WITH policy_map(title_pattern, control_code) AS (
    VALUES
        -- Access Control Policy
        ('access control policy', 'A.5.15'),
        ('access control policy', 'A.5.16'),
        ('access control policy', 'A.5.18'),
        ('access control policy', 'CC6.1'),
        ('access control policy', 'CC6.2'),
        ('access control policy', 'CC6.3'),
        ('access control policy', 'PR.AA-01'),
        ('access control policy', 'PR.AA-05'),

        -- Password & Authentication Policy / Password Policy
        ('password',              'A.5.17'),
        ('password',              'A.8.5'),
        ('password',              'CC6.1'),
        ('password',              'PR.AA-01'),

        -- Acceptable Use Policy
        ('acceptable use',        'A.5.10'),
        ('acceptable use',        'A.6.7'),
        ('acceptable use',        'CC5.1'),

        -- Acceptable Encryption Standard
        ('encryption',            'A.8.24'),
        ('encryption',            'CC6.7'),
        ('encryption',            'PR.DS-01'),
        ('encryption',            'PR.DS-02'),

        -- Backup & Recovery Procedure
        ('backup',                'A.8.13'),
        ('backup',                'A.5.30'),
        ('backup',                'A1.2'),
        ('backup',                'RC.RP-04'),

        -- Breach Notification Procedure
        ('breach notification',   'A.5.25'),
        ('breach notification',   'A.5.26'),
        ('breach notification',   'CC7.4'),
        ('breach notification',   'DPDPA-8.3'),

        -- Business Continuity Plan
        ('business continuity',   'A.5.29'),
        ('business continuity',   'A.5.30'),
        ('business continuity',   'A1.2'),
        ('business continuity',   'RC.RP-01'),

        -- Change Management Policy
        ('change management',     'A.8.32'),
        ('change management',     'CC8.1'),

        -- Clean Desk & Clear Screen
        ('clean desk',            'A.7.7'),
        ('clean desk',            'A.7.14'),

        -- Compliance & Legal Policy
        ('compliance & legal',    'A.5.31'),
        ('compliance & legal',    'A.5.32'),
        ('compliance & legal',    'A.5.34'),
        ('compliance & legal',    'CC2.3'),

        -- Cookies & Tracking Policy
        ('cookies',               'DPDPA-6.1'),
        ('cookies',               'DPDPA-7.1'),

        -- Crisis Communication Plan
        ('crisis communication',  'A.5.5'),
        ('crisis communication',  'A.5.6'),

        -- Data Classification Policy
        ('data classification',   'A.5.12'),
        ('data classification',   'A.5.13'),

        -- Data Retention & Disposal Policy
        ('data retention',        'A.5.33'),
        ('data retention',        'A.5.34'),
        ('data retention',        'A.8.10'),

        -- Data Subject Request Procedure
        ('data subject',          'DPDPA-11.4'),

        -- Disaster Recovery Plan
        ('disaster recovery',     'A.5.29'),
        ('disaster recovery',     'A.5.30'),
        ('disaster recovery',     'A.8.14'),
        ('disaster recovery',     'A1.3'),
        ('disaster recovery',     'RC.RP-01'),

        -- Human Resources Security Policy
        ('human resources security', 'A.6.1'),
        ('human resources security', 'A.6.2'),
        ('human resources security', 'A.6.3'),
        ('human resources security', 'A.6.4'),
        ('human resources security', 'A.6.5'),
        ('human resources security', 'CC1.4'),

        -- Incident Response Plan / Policy
        ('incident response',     'A.5.24'),
        ('incident response',     'A.5.25'),
        ('incident response',     'A.5.26'),
        ('incident response',     'A.5.27'),
        ('incident response',     'CC7.3'),
        ('incident response',     'RS.MA-01'),
        ('incident response',     'RS.RP-01'),

        -- Information Asset Management Policy
        ('information asset',     'A.5.9'),
        ('information asset',     'A.5.10'),
        ('information asset',     'A.5.11'),

        -- Information Security Policy
        ('information security policy', 'A.5.1'),
        ('information security policy', 'A.5.2'),
        ('information security policy', 'CC1.1'),
        ('information security policy', 'GV.PO-01'),

        -- Logging & Monitoring Standard
        ('logging',               'A.8.15'),
        ('logging',               'A.8.16'),
        ('logging',               'CC7.2'),
        ('logging',               'DE.CM-01'),

        -- Onboarding & Offboarding Procedure
        ('onboarding',            'A.6.1'),
        ('onboarding',            'A.6.5'),

        -- Physical Security Policy
        ('physical security',     'A.7.1'),
        ('physical security',     'A.7.2'),
        ('physical security',     'A.7.4'),

        -- Privacy & Data Protection Policy / Privacy Notice
        ('privacy',               'DPDPA-6.1'),
        ('privacy',               'A.5.34'),

        -- Privileged Access Management Procedure
        ('privileged access',     'A.5.15'),
        ('privileged access',     'A.8.2'),
        ('privileged access',     'CC6.1'),
        ('privileged access',     'PR.AA-05'),

        -- Remote Working Policy
        ('remote working',        'A.6.7'),

        -- Risk Management Policy
        ('risk management policy','A.5.4'),
        ('risk management policy','CC3.1'),
        ('risk management policy','CC3.2'),

        -- Supplier Security Standard / Third-Party Risk / Vendor Risk Management
        ('supplier security',     'A.5.19'),
        ('supplier security',     'A.5.20'),
        ('supplier security',     'A.5.21'),
        ('third-party risk',      'A.5.19'),
        ('third-party risk',      'A.5.20'),
        ('third-party risk',      'CC9.2'),
        ('vendor risk',           'A.5.19'),
        ('vendor risk',           'A.5.20'),
        ('vendor risk',           'CC9.2'),

        -- Vulnerability Management Policy / Standard
        ('vulnerability management', 'A.8.8'),
        ('vulnerability management', 'A.8.29'),
        ('vulnerability management', 'CC7.1')
)
INSERT INTO policy_controls (policy_id, control_id)
SELECT DISTINCT p.id, c.id
FROM policy_map m
JOIN policies p ON LOWER(p.title) LIKE '%' || m.title_pattern || '%'
              AND p.status IN ('approved','active')
JOIN controls c ON c.control_id = m.control_code
ON CONFLICT (policy_id, control_id) DO NOTHING;

COMMIT;

-- ── Sanity counts ───────────────────────────────────────────
SELECT
    (SELECT COUNT(*) FROM evidence_artifacts WHERE control_id IS NOT NULL) AS artifacts_linked,
    (SELECT COUNT(*) FROM policy_controls)                                  AS policy_control_links,
    (SELECT COUNT(DISTINCT control_id) FROM policy_controls)                AS controls_covered_by_any_policy;
