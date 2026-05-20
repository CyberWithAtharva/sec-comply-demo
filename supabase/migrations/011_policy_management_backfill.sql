-- ============================================================
-- SecComply: Policy Management v2 — backfill + multi-org seed
-- ============================================================
-- 1. Repoint the `code` UNIQUE so the same template code can exist
--    in multiple orgs (each client gets their own copy).
-- 2. Backfill legacy policies (created by the old generate route)
--    with sensible code/category/frameworks_list/description so they
--    render with chips and metadata in the v2 library.
-- 3. Re-run the 36-template seed for every org, not just the first.
-- ============================================================

-- 1. Make code unique per org instead of globally unique.
ALTER TABLE policies DROP CONSTRAINT IF EXISTS policies_code_key;
CREATE UNIQUE INDEX IF NOT EXISTS policies_org_code_uidx ON policies (org_id, code) WHERE code IS NOT NULL;

-- 2. Backfill: legacy policies without v2 metadata.
-- Convert framework_id → frameworks_list (single-element array from frameworks.slug or .name).
UPDATE policies p
SET frameworks_list = ARRAY[lower(coalesce(f.slug, regexp_replace(f.name, '[^a-zA-Z0-9]+', '', 'g')))]
FROM frameworks f
WHERE p.framework_id = f.id
  AND (p.frameworks_list IS NULL OR array_length(p.frameworks_list, 1) IS NULL);

-- Guess category from title for legacy rows.
UPDATE policies SET category = CASE
    WHEN title ILIKE '%information security%' THEN 'Governance'
    WHEN title ILIKE '%access control%' OR title ILIKE '%password%' OR title ILIKE '%identity%' THEN 'Access Control'
    WHEN title ILIKE '%change management%' OR title ILIKE '%backup%' OR title ILIKE '%logging%' OR title ILIKE '%vulnerability%' THEN 'Operations'
    WHEN title ILIKE '%incident%' OR title ILIKE '%business continuity%' OR title ILIKE '%disaster recovery%' OR title ILIKE '%breach%' THEN 'Incident & BCP'
    WHEN title ILIKE '%data classification%' OR title ILIKE '%encryption%' OR title ILIKE '%retention%' THEN 'Data'
    WHEN title ILIKE '%human resources%' OR title ILIKE '%onboarding%' OR title ILIKE '%remote%' OR title ILIKE '%disciplinary%' THEN 'HR'
    WHEN title ILIKE '%vendor%' OR title ILIKE '%third-party%' OR title ILIKE '%supplier%' THEN 'Vendor'
    WHEN title ILIKE '%physical%' OR title ILIKE '%clean desk%' THEN 'Physical'
    WHEN title ILIKE '%privacy%' OR title ILIKE '%data subject%' OR title ILIKE '%cookie%' OR title ILIKE '%hipaa%' THEN 'Privacy'
    ELSE 'Governance'
END
WHERE category IS NULL;

-- Default policy_type
UPDATE policies SET policy_type = 'Policy' WHERE policy_type IS NULL;

-- Default description
UPDATE policies SET description = 'Generated policy template — review, customise, and submit for approval.'
WHERE description IS NULL OR description = '';

-- 3. Re-seed the 36 templates for every org that doesn't already have them.
DO $$
DECLARE
    org_row RECORD;
    isp_content text := '## 1. Purpose
This Information Security Policy establishes how [Organisation_Name] protects the confidentiality, integrity, and availability of all information assets it owns, processes, or stores. It applies to every employee, contractor, and third party with access to [Organisation_Name] systems and data.

## 2. Scope
This policy covers all information assets — including systems hosted on [Core_Production_System], the customer-facing [Customer_Application], and managed devices enrolled in [MDM_Tool]. It is mandatory across the organisation registered at [Registered_Address].

## 3. Roles & Responsibilities
The Chief Information Security Officer ([CISO]) owns this policy and reports security posture quarterly to the Chief Executive Officer ([CEO]). The Data Protection Officer ([DPO]) maintains lawful basis for processing.

- Security incidents are reported to the security team at [Security_Email].
- Privacy concerns and Data Subject Requests are routed to [Privacy_Email].
- A 24/7 security hotline is maintained: [Security_Hotline].

## 4. Access Control Principles
Access is granted on a least-privilege, need-to-know basis. Passwords must be at least [Password_Min_Length] characters, rotate every [Password_Expiry_Days] days, and remember the prior [Password_History] values. Accounts inactive for [Account_Inactivity_Days] days are automatically disabled. Sessions time out after [Session_Timeout_Min] minutes of inactivity.

## 5. Recovery & Continuity
In the event of a major disruption, [Organisation_Name] targets a Recovery Time Objective of [RTO] and a Recovery Point Objective of [RPO] for production systems. The disaster recovery site is [DR_Site].

## 6. Review
This policy is reviewed annually or upon significant change to the threat landscape, regulatory environment, or organisational structure. Version history is maintained in Overwatch.';
    stub_content text := '## 1. Purpose
This policy is part of the [Organisation_Name] information-security programme. It establishes the obligations, scope, and ownership that apply to this control area.

## 2. Scope
Applies to all employees, contractors, and systems of [Organisation_Name].

## 3. Responsibilities
The policy is owned by [CISO] and reviewed annually. Questions: [Security_Email].

## 4. Review
This policy is reviewed annually or upon significant change.';
BEGIN
    FOR org_row IN SELECT id FROM organizations LOOP
        INSERT INTO policies (org_id, code, title, category, policy_type, frameworks_list, status, version, description, content, is_generated) VALUES
            (org_row.id, 'TPL-GOV-001', 'Information Security Policy',                 'Governance',       'Policy',  ARRAY['iso','soc2','hipaa','gdpr','dpdp'], 'active',    'v2.0', 'Establishes the foundational information-security commitments of the organisation. Required by ISO 27001 A.5.1, SOC 2 CC1.1, and HIPAA §164.308(a)(1).', isp_content, true),
            (org_row.id, 'TPL-GOV-002', 'Acceptable Use Policy',                       'Governance',       'Policy',  ARRAY['iso','soc2'],                       'active',    'v1.2', 'Defines acceptable use of organisation systems, networks, and data.', stub_content, true),
            (org_row.id, 'TPL-GOV-003', 'Risk Management Policy',                      'Governance',       'Policy',  ARRAY['iso','soc2'],                       'active',    'v1.1', 'Governs the identification, assessment, and treatment of information-security risk.', stub_content, true),
            (org_row.id, 'TPL-GOV-004', 'Compliance & Legal Policy',                   'Governance',       'Policy',  ARRAY['iso','soc2','gdpr','dpdp'],         'active',    'v1.0', 'Establishes commitments to legal, regulatory, and contractual obligations.', stub_content, true),
            (org_row.id, 'TPL-GOV-005', 'Information Asset Management Policy',         'Governance',       'Policy',  ARRAY['iso','soc2'],                       'active',    'v1.0', 'Defines how information assets are identified, classified, owned, and tracked.', stub_content, true),
            (org_row.id, 'TPL-ACC-001', 'Access Control Policy',                       'Access Control',   'Policy',  ARRAY['iso','soc2','hipaa'],               'active',    'v1.3', 'Defines how user access to systems and data is granted, reviewed, and revoked.', stub_content, true),
            (org_row.id, 'TPL-ACC-002', 'Password Policy',                             'Access Control',   'Policy',  ARRAY['iso','soc2','hipaa'],               'active',    'v2.0', 'Establishes password complexity, rotation, and lockout requirements.', stub_content, true),
            (org_row.id, 'TPL-ACC-003', 'Identity & Access Management Standard',       'Access Control',   'Standard',ARRAY['iso','soc2'],                       'in_review', 'v1.2', 'Specifies identity provider use, MFA, and lifecycle management.', stub_content, true),
            (org_row.id, 'TPL-ACC-004', 'Privileged Access Management Procedure',      'Access Control',   'Procedure',ARRAY['iso','soc2'],                      'active',    'v1.1', 'Governs the granting, monitoring, and revocation of privileged access.', stub_content, true),
            (org_row.id, 'TPL-OPS-001', 'Change Management Policy',                    'Operations',       'Policy',  ARRAY['iso','soc2'],                       'active',    'v1.1', 'Defines change controls for production systems.', stub_content, true),
            (org_row.id, 'TPL-OPS-002', 'Backup & Recovery Procedure',                 'Operations',       'Procedure',ARRAY['iso','soc2','hipaa'],             'active',    'v1.0', 'Governs backup schedules, retention, and restore testing.', stub_content, true),
            (org_row.id, 'TPL-OPS-003', 'Logging & Monitoring Standard',               'Operations',       'Standard',ARRAY['iso','soc2'],                       'active',    'v1.2', 'Specifies what is logged, how long it is retained, and how alerts are escalated.', stub_content, true),
            (org_row.id, 'TPL-OPS-004', 'Cryptography & Key Management Policy',        'Operations',       'Policy',  ARRAY['iso','soc2','hipaa'],               'draft',     'v1.0', 'Defines acceptable algorithms, key lifecycle, and management responsibilities.', stub_content, true),
            (org_row.id, 'TPL-OPS-005', 'Vulnerability Management Standard',           'Operations',       'Standard',ARRAY['iso','soc2'],                       'active',    'v1.1', 'Specifies scanning cadence, severity classification, and remediation SLAs.', stub_content, true),
            (org_row.id, 'TPL-OPS-006', 'Secure Development Standard',                 'Operations',       'Standard',ARRAY['iso','soc2'],                       'draft',     'v1.0', 'Defines secure coding, code review, and SDLC controls.', stub_content, true),
            (org_row.id, 'TPL-INC-001', 'Incident Response Policy',                    'Incident & BCP',   'Policy',  ARRAY['iso','soc2','hipaa','gdpr'],        'active',    'v2.1', 'Governs detection, triage, escalation, and post-incident review.', stub_content, true),
            (org_row.id, 'TPL-INC-002', 'Business Continuity Plan',                    'Incident & BCP',   'Policy',  ARRAY['iso','soc2'],                       'active',    'v1.1', 'Defines continuity strategy, critical processes, and recovery responsibilities.', stub_content, true),
            (org_row.id, 'TPL-INC-003', 'Disaster Recovery Plan',                      'Incident & BCP',   'Policy',  ARRAY['iso','soc2'],                       'active',    'v1.0', 'Specifies the disaster-recovery strategy, RTO/RPO targets, and DR-site arrangements.', stub_content, true),
            (org_row.id, 'TPL-INC-004', 'Breach Notification Procedure',               'Incident & BCP',   'Procedure',ARRAY['hipaa','gdpr','dpdp'],             'active',    'v1.0', 'Defines obligations and timelines for notifying regulators and data subjects.', stub_content, true),
            (org_row.id, 'TPL-INC-005', 'Crisis Communication Plan',                   'Incident & BCP',   'Policy',  ARRAY['iso'],                              'active',    'v1.0', 'Sets out internal and external communications during a major incident.', stub_content, true),
            (org_row.id, 'TPL-DAT-001', 'Data Classification Policy',                  'Data',             'Policy',  ARRAY['iso','soc2','gdpr','dpdp'],         'active',    'v1.2', 'Defines data classification tiers and handling requirements.', stub_content, true),
            (org_row.id, 'TPL-DAT-002', 'Data Retention & Disposal Policy',            'Data',             'Policy',  ARRAY['iso','gdpr','dpdp','hipaa'],        'active',    'v1.0', 'Governs how long data is retained and how it is securely disposed.', stub_content, true),
            (org_row.id, 'TPL-DAT-003', 'Encryption Standard',                         'Data',             'Standard',ARRAY['iso','soc2','hipaa'],              'in_review', 'v1.1', 'Specifies encryption algorithms, key lengths, and protocols.', stub_content, true),
            (org_row.id, 'TPL-DAT-004', 'Acceptable Encryption Standard',              'Data',             'Standard',ARRAY['iso','soc2'],                      'active',    'v1.0', 'Defines approved cryptographic primitives.', stub_content, true),
            (org_row.id, 'TPL-HR-001',  'Human Resources Security Policy',             'HR',               'Policy',  ARRAY['iso','soc2'],                       'active',    'v1.1', 'Covers screening, terms of employment, and security responsibilities.', stub_content, true),
            (org_row.id, 'TPL-HR-002',  'Onboarding & Offboarding Procedure',          'HR',               'Procedure',ARRAY['iso','soc2'],                     'active',    'v1.0', 'Defines security tasks completed during joiner and leaver workflows.', stub_content, true),
            (org_row.id, 'TPL-HR-003',  'Disciplinary Procedure',                      'HR',               'Procedure',ARRAY['iso'],                            'draft',     'v1.0', 'Defines the disciplinary process for security policy violations.', stub_content, true),
            (org_row.id, 'TPL-HR-004',  'Remote Working Policy',                       'HR',               'Policy',  ARRAY['iso','soc2'],                       'active',    'v2.0', 'Defines security obligations for employees working remotely.', stub_content, true),
            (org_row.id, 'TPL-VEN-001', 'Third-Party Risk Management Policy',          'Vendor',           'Policy',  ARRAY['iso','soc2'],                       'active',    'v1.1', 'Governs how third parties are assessed and monitored.', stub_content, true),
            (org_row.id, 'TPL-VEN-002', 'Supplier Security Standard',                  'Vendor',           'Standard',ARRAY['iso','soc2'],                      'active',    'v1.0', 'Sets out minimum security expectations for suppliers.', stub_content, true),
            (org_row.id, 'TPL-PHY-001', 'Physical Security Policy',                    'Physical',         'Policy',  ARRAY['iso','soc2','hipaa'],               'active',    'v1.0', 'Defines physical access, premises, and equipment protection requirements.', stub_content, true),
            (org_row.id, 'TPL-PHY-002', 'Clean Desk & Clear Screen Procedure',         'Physical',         'Procedure',ARRAY['iso'],                            'active',    'v1.0', 'Sets out daily expectations for workstation security.', stub_content, true),
            (org_row.id, 'TPL-PRV-001', 'Privacy Notice',                              'Privacy',          'Policy',  ARRAY['gdpr','dpdp','hipaa'],              'active',    'v1.2', 'External-facing privacy notice describing lawful basis and rights.', stub_content, true),
            (org_row.id, 'TPL-PRV-002', 'Data Subject Request Procedure',              'Privacy',          'Procedure',ARRAY['gdpr','dpdp'],                    'active',    'v1.1', 'Defines how data-subject access, rectification, and erasure requests are handled.', stub_content, true),
            (org_row.id, 'TPL-PRV-003', 'Cookies & Tracking Policy',                   'Privacy',          'Policy',  ARRAY['gdpr','dpdp'],                      'active',    'v1.0', 'Specifies cookie categories, consent capture, and opt-out mechanics.', stub_content, true),
            (org_row.id, 'TPL-PRV-004', 'HIPAA Privacy Rule Procedure',                'Privacy',          'Procedure',ARRAY['hipaa'],                          'in_review', 'v1.0', 'Implements HIPAA privacy-rule obligations for PHI handling.', stub_content, true)
        ON CONFLICT (org_id, code) DO NOTHING;
    END LOOP;
END
$$;

-- 4. Make sure every (org, policy) has at least one version row.
INSERT INTO policy_versions (policy_id, version, status, content, classification, summary, created_at, approved_at)
SELECT
    p.id, p.version,
    CASE
        WHEN p.status IN ('active', 'approved') THEN 'active'
        WHEN p.status IN ('in_review', 'under_review') THEN 'in_review'
        WHEN p.status = 'superseded' OR p.status = 'archived' THEN 'superseded'
        ELSE 'draft'
    END,
    p.content,
    CASE WHEN p.status IN ('active', 'approved') THEN 'minor' ELSE NULL END,
    CASE WHEN p.status IN ('active', 'approved') THEN 'Initial seeded version.' ELSE NULL END,
    now() - interval '10 days',
    CASE WHEN p.status IN ('active', 'approved') THEN now() - interval '8 days' ELSE NULL END
FROM policies p
WHERE NOT EXISTS (SELECT 1 FROM policy_versions v WHERE v.policy_id = p.id AND v.version = p.version)
ON CONFLICT (policy_id, version) DO NOTHING;

-- 5. Make sure every org has variable values + branding.
INSERT INTO org_policy_variables (org_id, var_key, value)
SELECT o.id, d.id, d.default_value
FROM organizations o
CROSS JOIN policy_variable_definitions d
ON CONFLICT (org_id, var_key) DO NOTHING;

INSERT INTO org_branding (org_id, display_name, accent_color)
SELECT o.id, o.name, '#f97316'
FROM organizations o
ON CONFLICT (org_id) DO NOTHING;

-- 6. Framework controls: at least one per (policy, framework) for every templated policy.
INSERT INTO policy_framework_controls (policy_id, framework, control_code, description)
SELECT p.id, fw, '—', 'Mapped on next template revision.'
FROM policies p, unnest(p.frameworks_list) AS fw
WHERE p.code IS NOT NULL
ON CONFLICT (policy_id, framework, control_code) DO NOTHING;

-- Focus policy: full mapping for every org's TPL-GOV-001.
INSERT INTO policy_framework_controls (policy_id, framework, control_code, description)
SELECT p.id, fw.framework, fw.code, fw.descr
FROM policies p
CROSS JOIN (VALUES
    ('iso',   'A.5.1',           'Policies for information security'),
    ('iso',   'A.5.2',           'Information security roles and responsibilities'),
    ('iso',   'A.5.4',           'Management responsibilities'),
    ('soc2',  'CC1.1',           'Demonstrates commitment to integrity & ethical values'),
    ('soc2',  'CC2.2',           'Communicates internal control responsibilities'),
    ('soc2',  'CC5.3',           'Establishes policies and procedures'),
    ('hipaa', '§164.308(a)(1)',  'Security management process'),
    ('gdpr',  'Art. 5',          'Principles relating to processing of personal data'),
    ('dpdp',  'S. 8',            'Obligations of Data Fiduciary')
) AS fw(framework, code, descr)
WHERE p.code = 'TPL-GOV-001'
ON CONFLICT (policy_id, framework, control_code) DO NOTHING;
