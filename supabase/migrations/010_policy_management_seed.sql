-- ============================================================
-- SecComply: Policy Management v2 — seed
-- ============================================================
-- Seeds variable definitions, 36 template policies, per-org defaults,
-- framework-control mappings, and a sample magic-link ack round.
-- Idempotent: re-runs are safe via ON CONFLICT DO NOTHING.
-- ============================================================

-- ------------------------------------------------------------
-- policy_variable_definitions (40 fields, 5 groups)
-- ------------------------------------------------------------
INSERT INTO policy_variable_definitions (id, group_id, group_label, group_icon, question, input_type, default_value, required, sort_order) VALUES
    -- Organisation (4)
    ('[Organisation_Name]',     'org',    'Organisation',      'building-2',         'Legal name of the organisation',              'text',   'Acme Technologies Pvt. Ltd.',                true,  10),
    ('[Registered_Address]',    'org',    'Organisation',      'building-2',         'Registered address',                          'text',   '14 Brigade Road, Bengaluru 560001, India',   false, 20),
    ('[Website_Domain]',        'org',    'Organisation',      'building-2',         'Primary website domain',                      'text',   'acme.tech',                                  false, 30),
    ('[Country]',               'org',    'Organisation',      'building-2',         'Country of registration',                     'text',   'India',                                      false, 40),
    -- People & Contacts (11)
    ('[Policy_Author]',         'people', 'People & Contacts', 'users',              'Policy Author — appears in Created By',       'text',   'Ravi Mehta, CISO',                           true,  10),
    ('[CISO]',                  'people', 'People & Contacts', 'users',              'Chief Information Security Officer',          'text',   'Ravi Mehta',                                 true,  20),
    ('[CEO]',                   'people', 'People & Contacts', 'users',              'Chief Executive Officer',                     'text',   'Priya Sharma',                               true,  30),
    ('[CTO]',                   'people', 'People & Contacts', 'users',              'Chief Technology Officer',                    'text',   'Arjun Reddy',                                false, 40),
    ('[DPO]',                   'people', 'People & Contacts', 'users',              'Data Protection Officer',                     'text',   'Anita Iyer',                                 false, 50),
    ('[IT_Manager]',            'people', 'People & Contacts', 'users',              'IT Manager',                                  'text',   'Karan Patel',                                false, 60),
    ('[HR_Lead]',               'people', 'People & Contacts', 'users',              'HR Lead',                                     'text',   'Meera Joshi',                                false, 70),
    ('[Legal_Counsel]',         'people', 'People & Contacts', 'users',              'Legal Counsel',                               'text',   'Anita Iyer',                                 false, 80),
    ('[Security_Email]',        'people', 'People & Contacts', 'users',              'Security contact email',                      'text',   'security@acme.tech',                         true,  90),
    ('[Privacy_Email]',         'people', 'People & Contacts', 'users',              'Privacy contact email',                       'text',   'privacy@acme.tech',                          true,  100),
    ('[Security_Hotline]',      'people', 'People & Contacts', 'users',              'Security hotline (24/7)',                     'text',   '+91 80 4040 1100',                           false, 110),
    -- Security Tools (7)
    ('[MDM_Tool]',              'tools',  'Security Tools',    'wrench',             'Mobile Device Management',                    'text',   'Jamf Pro',                                   false, 10),
    ('[EDR_Tool]',              'tools',  'Security Tools',    'wrench',             'Endpoint Detection & Response',               'text',   'CrowdStrike Falcon',                         false, 20),
    ('[VPN_ZTNA_Tool]',         'tools',  'Security Tools',    'wrench',             'VPN / ZTNA solution',                         'text',   'Cloudflare Access',                          false, 30),
    ('[Password_Manager]',      'tools',  'Security Tools',    'wrench',             'Enterprise password manager',                 'text',   '1Password Business',                         false, 40),
    ('[Secrets_Manager]',       'tools',  'Security Tools',    'wrench',             'Secrets manager',                             'text',   'HashiCorp Vault',                            false, 50),
    ('[KMS]',                   'tools',  'Security Tools',    'wrench',             'Key Management Service',                      'text',   'AWS KMS',                                    false, 60),
    ('[Ticketing_System]',      'tools',  'Security Tools',    'wrench',             'Ticketing system',                            'text',   'Linear',                                     false, 70),
    -- Security Thresholds (12)
    ('[Password_Min_Length]',   'thresholds', 'Security Thresholds', 'sliders-horizontal', 'Minimum password length',                'number', '14',                                         false, 10),
    ('[Password_Expiry_Days]',  'thresholds', 'Security Thresholds', 'sliders-horizontal', 'Password expiry (days)',                 'number', '90',                                         false, 20),
    ('[Password_History]',      'thresholds', 'Security Thresholds', 'sliders-horizontal', 'Passwords remembered',                   'number', '12',                                         false, 30),
    ('[Lockout_Attempts]',      'thresholds', 'Security Thresholds', 'sliders-horizontal', 'Failed-login lockout attempts',          'number', '5',                                          false, 40),
    ('[Account_Inactivity_Days]','thresholds','Security Thresholds', 'sliders-horizontal', 'Inactivity disable (days)',              'number', '60',                                         false, 50),
    ('[Access_Review_Frequency]','thresholds','Security Thresholds', 'sliders-horizontal', 'Access review frequency',                'text',   'Quarterly',                                  false, 60),
    ('[Log_Retention_Days]',    'thresholds', 'Security Thresholds', 'sliders-horizontal', 'Log retention (days)',                   'number', '365',                                        false, 70),
    ('[Session_Timeout_Min]',   'thresholds', 'Security Thresholds', 'sliders-horizontal', 'Session timeout (minutes)',              'number', '15',                                         false, 80),
    ('[Child_Data_Age_Limit]',  'thresholds', 'Security Thresholds', 'sliders-horizontal', 'Child data age limit (years)',           'number', '18',                                         false, 90),
    ('[Termination_Days]',      'thresholds', 'Security Thresholds', 'sliders-horizontal', 'Account termination after exit (days)',  'number', '1',                                          false, 100),
    ('[MAO_Hours]',             'thresholds', 'Security Thresholds', 'sliders-horizontal', 'Maximum acceptable outage (hours)',      'number', '24',                                         false, 110),
    ('[Log_Review_Frequency]',  'thresholds', 'Security Thresholds', 'sliders-horizontal', 'Log review frequency',                   'text',   'Weekly',                                     false, 120),
    -- Recovery & BCP (6)
    ('[RTO]',                   'recovery', 'Recovery & BCP',  'life-buoy',          'Recovery Time Objective',                     'text',   '4 hours',                                    false, 10),
    ('[RPO]',                   'recovery', 'Recovery & BCP',  'life-buoy',          'Recovery Point Objective',                    'text',   '1 hour',                                     false, 20),
    ('[MAO]',                   'recovery', 'Recovery & BCP',  'life-buoy',          'Maximum Acceptable Outage',                   'text',   '24 hours',                                   false, 30),
    ('[DR_Site]',               'recovery', 'Recovery & BCP',  'life-buoy',          'DR site / region',                            'text',   'AWS ap-south-2 (Hyderabad)',                 false, 40),
    ('[Core_Production_System]','recovery', 'Recovery & BCP',  'life-buoy',          'Core production system',                      'text',   'Acme Platform (acme.tech)',                  false, 50),
    ('[Customer_Application]',  'recovery', 'Recovery & BCP',  'life-buoy',          'Customer-facing application',                 'text',   'Acme Workspace',                             false, 60)
ON CONFLICT (id) DO UPDATE
SET group_id      = EXCLUDED.group_id,
    group_label   = EXCLUDED.group_label,
    group_icon    = EXCLUDED.group_icon,
    question      = EXCLUDED.question,
    input_type    = EXCLUDED.input_type,
    default_value = EXCLUDED.default_value,
    required      = EXCLUDED.required,
    sort_order    = EXCLUDED.sort_order;

-- ------------------------------------------------------------
-- 36 policy templates (from data.js)
-- ------------------------------------------------------------
-- Helper: focus policy content with variable chips (TPL-GOV-001)
DO $$
DECLARE
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
    target_org uuid;
BEGIN
    -- Find an org to attach the seed templates to. Prefer the first non-admin org.
    SELECT id INTO target_org FROM organizations ORDER BY created_at ASC LIMIT 1;
    IF target_org IS NULL THEN
        RAISE NOTICE 'No organizations found — skipping policy template seed.';
        RETURN;
    END IF;

    -- Templates with code, category, status, frameworks, version
    INSERT INTO policies (org_id, code, title, category, policy_type, frameworks_list, status, version, description, content, is_generated) VALUES
        (target_org, 'TPL-GOV-001', 'Information Security Policy',                 'Governance',       'Policy', ARRAY['iso','soc2','hipaa','gdpr','dpdp'], 'active',    'v2.0', 'Establishes the foundational information-security commitments of the organisation. Required by ISO 27001 A.5.1, SOC 2 CC1.1, and HIPAA §164.308(a)(1). Anchors all subordinate policies and procedures.', isp_content, true),
        (target_org, 'TPL-GOV-002', 'Acceptable Use Policy',                       'Governance',       'Policy', ARRAY['iso','soc2'],                       'active',    'v1.2', 'Defines acceptable use of organisation systems, networks, and data.', stub_content, true),
        (target_org, 'TPL-GOV-003', 'Risk Management Policy',                      'Governance',       'Policy', ARRAY['iso','soc2'],                       'active',    'v1.1', 'Governs the identification, assessment, and treatment of information-security risk.', stub_content, true),
        (target_org, 'TPL-GOV-004', 'Compliance & Legal Policy',                   'Governance',       'Policy', ARRAY['iso','soc2','gdpr','dpdp'],         'active',    'v1.0', 'Establishes commitments to legal, regulatory, and contractual obligations.', stub_content, true),
        (target_org, 'TPL-GOV-005', 'Information Asset Management Policy',         'Governance',       'Policy', ARRAY['iso','soc2'],                       'active',    'v1.0', 'Defines how information assets are identified, classified, owned, and tracked.', stub_content, true),
        (target_org, 'TPL-ACC-001', 'Access Control Policy',                       'Access Control',   'Policy', ARRAY['iso','soc2','hipaa'],               'active',    'v1.3', 'Defines how user access to systems and data is granted, reviewed, and revoked.', stub_content, true),
        (target_org, 'TPL-ACC-002', 'Password Policy',                             'Access Control',   'Policy', ARRAY['iso','soc2','hipaa'],               'active',    'v2.0', 'Establishes password complexity, rotation, and lockout requirements.', stub_content, true),
        (target_org, 'TPL-ACC-003', 'Identity & Access Management Standard',       'Access Control',   'Standard',ARRAY['iso','soc2'],                       'in_review', 'v1.2', 'Specifies identity provider use, MFA, and lifecycle management.', stub_content, true),
        (target_org, 'TPL-ACC-004', 'Privileged Access Management Procedure',      'Access Control',   'Procedure', ARRAY['iso','soc2'],                    'active',    'v1.1', 'Governs the granting, monitoring, and revocation of privileged access.', stub_content, true),
        (target_org, 'TPL-OPS-001', 'Change Management Policy',                    'Operations',       'Policy', ARRAY['iso','soc2'],                       'active',    'v1.1', 'Defines change controls for production systems.', stub_content, true),
        (target_org, 'TPL-OPS-002', 'Backup & Recovery Procedure',                 'Operations',       'Procedure', ARRAY['iso','soc2','hipaa'],            'active',    'v1.0', 'Governs backup schedules, retention, and restore testing.', stub_content, true),
        (target_org, 'TPL-OPS-003', 'Logging & Monitoring Standard',               'Operations',       'Standard',ARRAY['iso','soc2'],                       'active',    'v1.2', 'Specifies what is logged, how long it is retained, and how alerts are escalated.', stub_content, true),
        (target_org, 'TPL-OPS-004', 'Cryptography & Key Management Policy',        'Operations',       'Policy', ARRAY['iso','soc2','hipaa'],               'draft',     'v1.0', 'Defines acceptable algorithms, key lifecycle, and management responsibilities.', stub_content, true),
        (target_org, 'TPL-OPS-005', 'Vulnerability Management Standard',           'Operations',       'Standard',ARRAY['iso','soc2'],                       'active',    'v1.1', 'Specifies scanning cadence, severity classification, and remediation SLAs.', stub_content, true),
        (target_org, 'TPL-OPS-006', 'Secure Development Standard',                 'Operations',       'Standard',ARRAY['iso','soc2'],                       'draft',     'v1.0', 'Defines secure coding, code review, and SDLC controls.', stub_content, true),
        (target_org, 'TPL-INC-001', 'Incident Response Policy',                    'Incident & BCP',   'Policy', ARRAY['iso','soc2','hipaa','gdpr'],        'active',    'v2.1', 'Governs detection, triage, escalation, and post-incident review.', stub_content, true),
        (target_org, 'TPL-INC-002', 'Business Continuity Plan',                    'Incident & BCP',   'Policy', ARRAY['iso','soc2'],                       'active',    'v1.1', 'Defines continuity strategy, critical processes, and recovery responsibilities.', stub_content, true),
        (target_org, 'TPL-INC-003', 'Disaster Recovery Plan',                      'Incident & BCP',   'Policy', ARRAY['iso','soc2'],                       'active',    'v1.0', 'Specifies the disaster-recovery strategy, RTO/RPO targets, and DR-site arrangements.', stub_content, true),
        (target_org, 'TPL-INC-004', 'Breach Notification Procedure',               'Incident & BCP',   'Procedure',ARRAY['hipaa','gdpr','dpdp'],            'active',    'v1.0', 'Defines obligations and timelines for notifying regulators and data subjects.', stub_content, true),
        (target_org, 'TPL-INC-005', 'Crisis Communication Plan',                   'Incident & BCP',   'Policy', ARRAY['iso'],                              'active',    'v1.0', 'Sets out internal and external communications during a major incident.', stub_content, true),
        (target_org, 'TPL-DAT-001', 'Data Classification Policy',                  'Data',             'Policy', ARRAY['iso','soc2','gdpr','dpdp'],         'active',    'v1.2', 'Defines data classification tiers and handling requirements.', stub_content, true),
        (target_org, 'TPL-DAT-002', 'Data Retention & Disposal Policy',            'Data',             'Policy', ARRAY['iso','gdpr','dpdp','hipaa'],        'active',    'v1.0', 'Governs how long data is retained and how it is securely disposed.', stub_content, true),
        (target_org, 'TPL-DAT-003', 'Encryption Standard',                         'Data',             'Standard',ARRAY['iso','soc2','hipaa'],              'in_review', 'v1.1', 'Specifies encryption algorithms, key lengths, and protocols.', stub_content, true),
        (target_org, 'TPL-DAT-004', 'Acceptable Encryption Standard',              'Data',             'Standard',ARRAY['iso','soc2'],                      'active',    'v1.0', 'Defines approved cryptographic primitives.', stub_content, true),
        (target_org, 'TPL-HR-001',  'Human Resources Security Policy',             'HR',               'Policy', ARRAY['iso','soc2'],                       'active',    'v1.1', 'Covers screening, terms of employment, and security responsibilities.', stub_content, true),
        (target_org, 'TPL-HR-002',  'Onboarding & Offboarding Procedure',          'HR',               'Procedure',ARRAY['iso','soc2'],                     'active',    'v1.0', 'Defines security tasks completed during joiner and leaver workflows.', stub_content, true),
        (target_org, 'TPL-HR-003',  'Disciplinary Procedure',                      'HR',               'Procedure',ARRAY['iso'],                            'draft',     'v1.0', 'Defines the disciplinary process for security policy violations.', stub_content, true),
        (target_org, 'TPL-HR-004',  'Remote Working Policy',                       'HR',               'Policy', ARRAY['iso','soc2'],                       'active',    'v2.0', 'Defines security obligations for employees working remotely.', stub_content, true),
        (target_org, 'TPL-VEN-001', 'Third-Party Risk Management Policy',          'Vendor',           'Policy', ARRAY['iso','soc2'],                       'active',    'v1.1', 'Governs how third parties are assessed and monitored.', stub_content, true),
        (target_org, 'TPL-VEN-002', 'Supplier Security Standard',                  'Vendor',           'Standard',ARRAY['iso','soc2'],                      'active',    'v1.0', 'Sets out minimum security expectations for suppliers.', stub_content, true),
        (target_org, 'TPL-PHY-001', 'Physical Security Policy',                    'Physical',         'Policy', ARRAY['iso','soc2','hipaa'],               'active',    'v1.0', 'Defines physical access, premises, and equipment protection requirements.', stub_content, true),
        (target_org, 'TPL-PHY-002', 'Clean Desk & Clear Screen Procedure',         'Physical',         'Procedure',ARRAY['iso'],                            'active',    'v1.0', 'Sets out daily expectations for workstation security.', stub_content, true),
        (target_org, 'TPL-PRV-001', 'Privacy Notice',                              'Privacy',          'Policy', ARRAY['gdpr','dpdp','hipaa'],              'active',    'v1.2', 'External-facing privacy notice describing lawful basis and rights.', stub_content, true),
        (target_org, 'TPL-PRV-002', 'Data Subject Request Procedure',              'Privacy',          'Procedure',ARRAY['gdpr','dpdp'],                    'active',    'v1.1', 'Defines how data-subject access, rectification, and erasure requests are handled.', stub_content, true),
        (target_org, 'TPL-PRV-003', 'Cookies & Tracking Policy',                   'Privacy',          'Policy', ARRAY['gdpr','dpdp'],                      'active',    'v1.0', 'Specifies cookie categories, consent capture, and opt-out mechanics.', stub_content, true),
        (target_org, 'TPL-PRV-004', 'HIPAA Privacy Rule Procedure',                'Privacy',          'Procedure',ARRAY['hipaa'],                          'in_review', 'v1.0', 'Implements HIPAA privacy-rule obligations for PHI handling.', stub_content, true)
    ON CONFLICT (code) DO NOTHING;
END
$$;

-- ------------------------------------------------------------
-- policy_versions — one row per template, matching current status
-- ------------------------------------------------------------
INSERT INTO policy_versions (policy_id, version, status, content, classification, summary, created_at, approved_at, approved_by)
SELECT
    p.id,
    p.version,
    p.status,
    p.content,
    CASE WHEN p.status = 'active' THEN 'minor' ELSE NULL END,
    CASE WHEN p.status = 'active' THEN 'Initial seeded version.' ELSE NULL END,
    now() - interval '10 days',
    CASE WHEN p.status = 'active' THEN now() - interval '8 days' ELSE NULL END,
    NULL
FROM policies p
WHERE p.code IS NOT NULL
ON CONFLICT (policy_id, version) DO NOTHING;

-- Add a single superseded prior version for TPL-GOV-001 to make the
-- version history feel real on the demo's focus policy.
INSERT INTO policy_versions (policy_id, version, status, content, classification, summary, created_at, approved_at)
SELECT p.id, 'v1.0', 'superseded', p.content, 'auto', 'Initial approval — generated from SecComply template.',
       now() - interval '60 days', now() - interval '58 days'
FROM policies p
WHERE p.code = 'TPL-GOV-001'
ON CONFLICT (policy_id, version) DO NOTHING;

INSERT INTO policy_versions (policy_id, version, status, content, classification, summary, created_at, approved_at)
SELECT p.id, 'v1.1', 'superseded', p.content, 'minor', 'Minor wording corrections in scope clause.',
       now() - interval '50 days', now() - interval '48 days'
FROM policies p
WHERE p.code = 'TPL-GOV-001'
ON CONFLICT (policy_id, version) DO NOTHING;

INSERT INTO policy_versions (policy_id, version, status, content, classification, summary, created_at, approved_at)
SELECT p.id, 'v1.2', 'superseded', p.content, 'minor', 'Updated CISO contact details and security email.',
       now() - interval '30 days', now() - interval '28 days'
FROM policies p
WHERE p.code = 'TPL-GOV-001'
ON CONFLICT (policy_id, version) DO NOTHING;

-- ------------------------------------------------------------
-- policy_framework_controls
-- ------------------------------------------------------------
-- Focus policy gets the full mapping from the design's FRAMEWORK_CONTROLS array.
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

-- Every other framework-tagged policy gets a single placeholder mapping per framework,
-- so the rail isn't empty when the user opens any policy.
INSERT INTO policy_framework_controls (policy_id, framework, control_code, description)
SELECT p.id, fw, '—', 'Mapped on next template revision.'
FROM policies p, unnest(p.frameworks_list) AS fw
WHERE p.code IS NOT NULL AND p.code <> 'TPL-GOV-001'
ON CONFLICT (policy_id, framework, control_code) DO NOTHING;

-- ------------------------------------------------------------
-- org_policy_variables — defaults for every org
-- ------------------------------------------------------------
INSERT INTO org_policy_variables (org_id, var_key, value)
SELECT o.id, d.id, d.default_value
FROM organizations o
CROSS JOIN policy_variable_definitions d
ON CONFLICT (org_id, var_key) DO NOTHING;

-- ------------------------------------------------------------
-- org_branding — default row per org
-- ------------------------------------------------------------
INSERT INTO org_branding (org_id, display_name, accent_color)
SELECT o.id, o.name, '#f97316'
FROM organizations o
ON CONFLICT (org_id) DO NOTHING;

-- ------------------------------------------------------------
-- Sample acknowledgement round for TPL-GOV-001
-- ------------------------------------------------------------
DO $$
DECLARE
    p_id uuid;
    v_id uuid;
    v_label text;
BEGIN
    SELECT id, version INTO p_id, v_label FROM policies WHERE code = 'TPL-GOV-001' LIMIT 1;
    IF p_id IS NULL THEN RETURN; END IF;
    SELECT id INTO v_id FROM policy_versions WHERE policy_id = p_id AND status = 'active' LIMIT 1;

    INSERT INTO policy_ack_recipients (policy_id, version_id, policy_version_label, email, name, token, status, submitted_name, match_status, ip_address, acknowledged_at, expires_at)
    VALUES
        (p_id, v_id, v_label, 'aarav.singh@acme.tech',   'Aarav Singh',   encode(gen_random_bytes(24), 'hex'), 'acknowledged', 'Aarav Singh',   'matched',    '203.0.113.18'::inet, now() - interval '3 days', now() + interval '27 days'),
        (p_id, v_id, v_label, 'bhavna.g@acme.tech',      'Bhavna Gupta',  encode(gen_random_bytes(24), 'hex'), 'acknowledged', 'Bhavna Gupta',  'matched',    '203.0.113.18'::inet, now() - interval '3 days', now() + interval '27 days'),
        (p_id, v_id, v_label, 'chen.w@acme.tech',        'Chen Wei',      encode(gen_random_bytes(24), 'hex'), 'acknowledged', 'Chen Wei',      'matched',    '198.51.100.7'::inet, now() - interval '3 days', now() + interval '27 days'),
        (p_id, v_id, v_label, 'divya@acme.tech',         'Divya R.',      encode(gen_random_bytes(24), 'hex'), 'acknowledged', 'Divya Ranganathan','unverified','198.51.100.41'::inet,now() - interval '3 days', now() + interval '27 days'),
        (p_id, v_id, v_label, 'eshan.k@acme.tech',       'Eshan Kumar',   encode(gen_random_bytes(24), 'hex'), 'acknowledged', 'Eshan Kumar',   'matched',    '203.0.113.92'::inet, now() - interval '3 days', now() + interval '27 days'),
        (p_id, v_id, v_label, 'farah.k@acme.tech',       'Farah Khan',    encode(gen_random_bytes(24), 'hex'), 'acknowledged', 'Farah Khan',    'matched',    '203.0.113.18'::inet, now() - interval '2 days', now() + interval '28 days'),
        (p_id, v_id, v_label, 'gautam@acme.tech',        'Gautam Iyer',   encode(gen_random_bytes(24), 'hex'), 'acknowledged', 'Gautam Iyer',   'matched',    '203.0.113.55'::inet, now() - interval '2 days', now() + interval '28 days'),
        (p_id, v_id, v_label, 'hina.m@acme.tech',        'Hina Mehra',    encode(gen_random_bytes(24), 'hex'), 'acknowledged', 'Hina Mehra',    'matched',    '198.51.100.12'::inet,now() - interval '1 days', now() + interval '29 days'),
        (p_id, v_id, v_label, 'imran.s@acme.tech',       'Imran Sayyed',  encode(gen_random_bytes(24), 'hex'), 'pending',      NULL,            NULL,         NULL,                 NULL,                       now() + interval '27 days'),
        (p_id, v_id, v_label, 'jaya@acme.tech',          'Jaya Nair',     encode(gen_random_bytes(24), 'hex'), 'pending',      NULL,            NULL,         NULL,                 NULL,                       now() + interval '27 days'),
        (p_id, v_id, v_label, 'kabir.j@acme.tech',       'Kabir Joshi',   encode(gen_random_bytes(24), 'hex'), 'expired',      NULL,            NULL,         NULL,                 NULL,                       now() - interval '1 days'),
        (p_id, v_id, v_label, 'lalita@acme.tech',        'Lalita Rao',    encode(gen_random_bytes(24), 'hex'), 'acknowledged', 'Lalita Rao',    'matched',    '203.0.113.18'::inet, now() - interval '1 days', now() + interval '29 days');
END
$$;
