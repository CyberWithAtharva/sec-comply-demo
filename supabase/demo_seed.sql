-- ============================================================
-- SecComply Demo Seed Data
-- Populates all modules with realistic demo data.
--
-- Prerequisites: run migrations 001-006 + seed.sql first.
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query).
-- Safe to run once per org; re-runs are skipped automatically.
-- ============================================================

DO $$
DECLARE
  v_org_id  uuid;
  v_user_id uuid;
  -- framework IDs
  v_fw_soc2 uuid;
  v_fw_iso  uuid;
  v_fw_nist uuid;
  -- vendor UUIDs
  vid_sf     uuid := gen_random_uuid();
  vid_aws_v  uuid := gen_random_uuid();
  vid_gh_v   uuid := gen_random_uuid();
  vid_okta   uuid := gen_random_uuid();
  vid_slack  uuid := gen_random_uuid();
  vid_stripe uuid := gen_random_uuid();
  vid_jira   uuid := gen_random_uuid();
  vid_cf     uuid := gen_random_uuid();
  vid_hs     uuid := gen_random_uuid();
  vid_zoom   uuid := gen_random_uuid();
  -- vapt report UUIDs
  vr1 uuid := gen_random_uuid();
  vr2 uuid := gen_random_uuid();
  vr3 uuid := gen_random_uuid();
  -- integration IDs
  v_aws_acct uuid := gen_random_uuid();
  v_gh_inst  uuid := gen_random_uuid();
BEGIN
  -- ── Get org ────────────────────────────────────────────────
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found. Create one via the admin panel first.';
  END IF;

  -- ── Get a user ─────────────────────────────────────────────
  SELECT user_id INTO v_user_id
    FROM organization_members WHERE org_id = v_org_id LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM profiles LIMIT 1;
  END IF;

  -- ── Idempotency guard ──────────────────────────────────────
  IF (SELECT COUNT(*) FROM vendors WHERE org_id = v_org_id) >= 5 THEN
    RAISE NOTICE 'Demo data already seeded for org %. Skipping.', v_org_id;
    RETURN;
  END IF;

  -- ── Framework IDs ──────────────────────────────────────────
  SELECT id INTO v_fw_soc2 FROM frameworks WHERE name ILIKE '%SOC%'  LIMIT 1;
  SELECT id INTO v_fw_iso  FROM frameworks WHERE name ILIKE '%ISO%'  LIMIT 1;
  SELECT id INTO v_fw_nist FROM frameworks WHERE name ILIKE '%NIST%' LIMIT 1;

  -- ═══════════════════════════════════════════════════════════
  -- VENDORS
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO vendors (id, org_id, name, tier, risk_level, contact_name, contact_email,
                       website, status, last_assessment, security_score)
  VALUES
    (vid_sf,     v_org_id,'Salesforce',           1,'critical','Mike Chen',     'mchen@salesforce.com',  'salesforce.com', 'active','2025-02-15',87),
    (vid_aws_v,  v_org_id,'Amazon Web Services',  1,'critical','AWS TAM',       'tam@amazon.com',        'aws.amazon.com', 'active','2025-01-10',94),
    (vid_gh_v,   v_org_id,'GitHub',               1,'high',    'Sarah Torres',  'storres@github.com',    'github.com',     'active','2025-01-20',89),
    (vid_okta,   v_org_id,'Okta',                 1,'high',    'James Park',    'jpark@okta.com',        'okta.com',       'active','2025-02-01',92),
    (vid_slack,  v_org_id,'Slack',                2,'medium',  'Priya Nair',    'pnair@slack.com',       'slack.com',      'active','2024-12-10',78),
    (vid_stripe, v_org_id,'Stripe',               1,'critical','David Kim',     'dkim@stripe.com',       'stripe.com',     'active','2025-01-30',91),
    (vid_jira,   v_org_id,'Atlassian',            2,'medium',  'Laura Schmidt', 'lschmidt@atlassian.com','atlassian.com',  'active','2024-11-25',74),
    (vid_cf,     v_org_id,'Cloudflare',           2,'medium',  'Alex Rivera',   'arivera@cloudflare.com','cloudflare.com', 'active','2024-12-20',83),
    (vid_hs,     v_org_id,'HubSpot',              2,'low',     'Emily Johnson', 'ejohnson@hubspot.com',  'hubspot.com',    'active','2024-10-15',71),
    (vid_zoom,   v_org_id,'Zoom',                 2,'low',     'Chris Lee',     'clee@zoom.us',          'zoom.us',        'active','2024-11-05',69);

  INSERT INTO vendor_assessments (vendor_id, type, status, due_date, completed_date, score, assessor_id, notes)
  VALUES
    (vid_sf,    'soc2',                   'completed',  '2025-02-28','2025-02-15',92,v_user_id,'SOC 2 Type II reviewed. No material exceptions noted.'),
    (vid_sf,    'security_questionnaire', 'completed',  '2024-10-01','2024-09-28',87,v_user_id,'Annual questionnaire — 2 minor gaps identified.'),
    (vid_aws_v, 'soc2',                   'completed',  '2025-01-31','2025-01-10',96,v_user_id,'AWS SOC 2 Type II — excellent controls posture.'),
    (vid_aws_v, 'security_questionnaire', 'completed',  '2024-12-15','2024-12-12',94,v_user_id,'AWS SIG Lite — passed all critical controls.'),
    (vid_gh_v,  'security_questionnaire', 'completed',  '2025-01-25','2025-01-20',89,v_user_id,'GitHub Advanced Security reviewed. Secret scanning active.'),
    (vid_gh_v,  'pen_test',               'completed',  '2024-09-15','2024-09-10',84,v_user_id,'NCC Group pen test — 1 high finding remediated.'),
    (vid_okta,  'soc2',                   'completed',  '2025-02-10','2025-02-01',93,v_user_id,'Okta SOC 2 Type II — strong IAM controls.'),
    (vid_okta,  'security_questionnaire', 'completed',  '2024-11-30','2024-11-28',90,v_user_id,'Identity provider questionnaire passed.'),
    (vid_slack, 'soc2',                   'completed',  '2024-12-20','2024-12-10',81,v_user_id,'SOC 2 reviewed. DLP gap noted — remediation planned.'),
    (vid_slack, 'security_questionnaire', 'in_progress','2025-03-31',NULL,        NULL,v_user_id,'Annual questionnaire sent to Slack security team.'),
    (vid_stripe,'soc2',                   'completed',  '2025-02-05','2025-01-30',95,v_user_id,'Stripe SOC 1 & 2 reviewed. PCI DSS Level 1 confirmed.'),
    (vid_jira,  'security_questionnaire', 'completed',  '2024-12-01','2024-11-25',76,v_user_id,'Data residency options confirmed.'),
    (vid_jira,  'soc2',                   'scheduled',  '2025-04-30',NULL,        NULL,v_user_id,'Scheduled for Q2 2025 review cycle.'),
    (vid_cf,    'security_questionnaire', 'completed',  '2025-01-05','2024-12-20',85,v_user_id,'DDoS protection and WAF controls validated.'),
    (vid_hs,    'security_questionnaire', 'completed',  '2024-11-01','2024-10-15',73,v_user_id,'Marketing platform — GDPR compliance noted.'),
    (vid_hs,    'soc2',                   'overdue',    '2025-02-28',NULL,        NULL,v_user_id,'HubSpot has not responded to SOC 2 request.'),
    (vid_zoom,  'security_questionnaire', 'completed',  '2024-11-20','2024-11-05',71,v_user_id,'Video platform review. E2E encryption enabled.');

  -- ═══════════════════════════════════════════════════════════
  -- POLICIES
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO policies (org_id, title, version, status, content, owner_id, next_review, framework_id, is_generated)
  VALUES
    (v_org_id,'Information Security Policy','2.1','approved',
     'Establishes the information security management framework. Data classification: Public, Internal, Confidential, Restricted. Access granted on need-to-know basis, reviewed quarterly. Annual security training mandatory for all staff.',
     v_user_id,CURRENT_DATE+180,v_fw_soc2,true),

    (v_org_id,'Access Control Policy','1.4','approved',
     'Defines requirements for managing user access rights. Privileged access requires MFA and audit logging. User access reviews quarterly. Accounts disabled within 24h of offboarding. Passwords: 14+ characters, rotated every 90 days.',
     v_user_id,CURRENT_DATE+90,v_fw_soc2,true),

    (v_org_id,'Change Management Policy','1.2','approved',
     'All production changes follow the documented change management workflow. Emergency changes require post-implementation review. Release pipelines include automated security scanning. CAB reviews all security-impacting changes.',
     v_user_id,CURRENT_DATE+270,v_fw_soc2,true),

    (v_org_id,'Incident Response Plan','3.0','approved',
     'Defines the process for detecting, containing, and recovering from security incidents. Incidents classified P1-P4. P1 requires executive notification within 1 hour. IR tabletop exercises conducted quarterly.',
     v_user_id,CURRENT_DATE+180,v_fw_soc2,true),

    (v_org_id,'Business Continuity Plan','1.1','under_review',
     'Ensures continuity of critical business functions during disruptive events. RTO: 4 hours, RPO: 1 hour for Tier 1 systems. BCP testing conducted annually. DR environment in a separate geographic region.',
     v_user_id,CURRENT_DATE+365,v_fw_soc2,true),

    (v_org_id,'Vendor Risk Management Policy','1.3','approved',
     'Third-party vendors handling sensitive data must complete security assessments before onboarding and annually thereafter. Tier 1 critical vendors require SOC 2 reports. Contracts must include security and privacy addendums.',
     v_user_id,CURRENT_DATE+180,v_fw_iso,true),

    (v_org_id,'Data Retention & Disposal Policy','1.0','approved',
     'Customer data retained 7 years post-contract. Logs: 90 days hot, 1 year cold. Secure deletion uses DoD 5220.22-M standard. Cloud data deletion verified via provider API. GDPR deletion requests fulfilled within 30 days.',
     v_user_id,CURRENT_DATE+365,v_fw_iso,true),

    (v_org_id,'Risk Management Policy','2.0','approved',
     'Risk lifecycle: identification, assessment, treatment, monitoring. Risk register reviewed monthly by Risk Committee. Risks >=16 escalate to executive leadership. Risk appetite: tolerate 1-8, mitigate 9-15, executive review 16-25.',
     v_user_id,CURRENT_DATE+180,v_fw_nist,true),

    (v_org_id,'Vulnerability Management Policy','1.2','under_review',
     'Critical and high CVEs remediated within 15 and 30 days respectively. Medium within 90 days. Automated scanning runs weekly. VAPT conducted annually by accredited firm. CVEs in CISA KEV treated as Critical.',
     v_user_id,CURRENT_DATE+25,v_fw_nist,true),

    (v_org_id,'Privacy & Data Protection Policy','1.1','approved',
     'Governs collection, processing, and storage of personal data per GDPR, CCPA. PIAs required for new data processing activities. Data subject requests fulfilled within 30 days. Privacy Officer maintains the RoPA.',
     v_user_id,CURRENT_DATE+180,v_fw_iso,true),

    (v_org_id,'Password & Authentication Policy','1.5','approved',
     'All user accounts require MFA. Passwords minimum 14 characters. Privileged accounts use hardware security keys. Shared credentials prohibited. Service account passwords rotated quarterly and stored in approved vaults.',
     v_user_id,CURRENT_DATE+90,v_fw_soc2,false),

    (v_org_id,'Remote Work Security Policy','1.0','draft',
     'VPN mandatory for accessing internal resources. Company devices must have MDM enrolled and full-disk encryption. Public Wi-Fi requires VPN. Clear desk policy applies to home offices.',
     v_user_id,CURRENT_DATE+365,NULL,false);

  -- ═══════════════════════════════════════════════════════════
  -- RISK REGISTER
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO risks (org_id, title, category, description, likelihood, impact, status,
                     owner_id, mitigation, due_date, source, source_ref)
  VALUES
    (v_org_id,'Unencrypted S3 Buckets Exposing PII','technical',
     'Three S3 buckets containing customer PII detected without server-side encryption. Data at rest not protected per policy.',
     5,5,'mitigating',v_user_id,'Enable SSE-KMS on all buckets. Implement S3 Block Public Access at account level.',CURRENT_DATE+7,'aws','S3-001'),

    (v_org_id,'Root Account Usage Without MFA','technical',
     'AWS root account accessed without MFA. Root activity detected in CloudTrail for routine tasks.',
     4,5,'mitigating',v_user_id,'Enable MFA on root immediately. Create IAM admin users for daily operations.',CURRENT_DATE+3,'aws','IAM-001'),

    (v_org_id,'Exposed API Keys in GitHub Repositories','technical',
     'Secret scanning detected hardcoded API credentials in 3 repositories. Keys may have been accessible to external contributors.',
     4,4,'mitigating',v_user_id,'Rotate all exposed credentials. Add pre-commit hooks. Enable Secret Scanning on all repos.',CURRENT_DATE+5,'github','SS-2025-001'),

    (v_org_id,'Critical Dependency Vulnerabilities','technical',
     'Dependabot detected 8 critical CVEs in production dependencies. CVE-2024-45490 (CVSS 9.8) affects XML parsing library.',
     5,4,'identified',v_user_id,'Update affected packages immediately. Pin dependency versions. Add automated dependency review to CI.',CURRENT_DATE+10,'github','DB-2025-042'),

    (v_org_id,'SQL Injection in Customer Portal','technical',
     'VAPT assessment identified SQL injection in customer portal search. Allows unauthorized data access.',
     3,5,'mitigating',v_user_id,'Parameterize all database queries. Implement WAF rules. Conduct code review of user input handling.',CURRENT_DATE+14,'vapt','VPT-2025-001'),

    (v_org_id,'Third-Party Vendor SOC 2 Lapse','third_party',
     'HubSpot has not provided current SOC 2 Type II report. Previous report expired 45 days ago.',
     3,4,'assessed',v_user_id,'Issue formal cure notice. Restrict data sharing until report received. Evaluate alternative vendors.',CURRENT_DATE+30,'manual',NULL),

    (v_org_id,'Privileged Access Without PAM Controls','operational',
     '12 engineers have uncontrolled DB admin rights without a PAM solution. Violates least privilege principle.',
     4,4,'mitigating',v_user_id,'Implement HashiCorp Vault. Require just-in-time access for production. Audit and reduce DB admin permissions.',CURRENT_DATE+21,'manual',NULL),

    (v_org_id,'Overly Permissive IAM Policies','technical',
     'IAM Access Analyzer detected 7 roles with wildcard permissions.',
     3,3,'assessed',v_user_id,'Refactor IAM policies using least-privilege. Use AWS Access Analyzer recommendations.',CURRENT_DATE+30,'aws','IAM-004'),

    (v_org_id,'Missing Branch Protection Rules','technical',
     '4 production repositories lack required code review enforcement. Direct pushes to main branch are possible.',
     3,3,'identified',v_user_id,'Enable branch protection on all repos. Require 2 approvals for merges. Enforce CI checks.',CURRENT_DATE+14,'github','BP-2025-004'),

    (v_org_id,'Incomplete Employee Offboarding','operational',
     '3 terminated employees retain system access. Offboarding time exceeds 24-hour policy SLA.',
     2,4,'mitigating',v_user_id,'Automate offboarding via HR+Okta integration. Weekly access certification for ex-employees.',CURRENT_DATE+21,'manual',NULL),

    (v_org_id,'Unpatched EC2 Instances','technical',
     '15 EC2 instances running end-of-life OS. Ubuntu 18.04 and CentOS 7 no longer receive security updates.',
     3,3,'identified',v_user_id,'Upgrade all instances to supported OS versions. Implement AWS Systems Manager patch manager.',CURRENT_DATE+45,'aws','EC2-003'),

    (v_org_id,'Inadequate Backup Testing','operational',
     'Database backups not tested for restorability in 6+ months. BCP requires monthly restore tests.',
     2,4,'assessed',v_user_id,'Schedule immediate backup restore test. Automate monthly validation. Document RTO/RPO results.',CURRENT_DATE+30,'manual',NULL),

    (v_org_id,'CloudTrail Logging Gaps','compliance',
     'CloudTrail not enabled in 2 regions. Policy requires logging in all active regions.',
     2,3,'identified',v_user_id,'Enable CloudTrail in all active regions. Configure centralized S3 log aggregation.',CURRENT_DATE+60,'aws','CT-002'),

    (v_org_id,'Security Training Completion Gap','compliance',
     '18% of employees have not completed mandatory annual security awareness training.',
     2,2,'assessed',v_user_id,'Send targeted reminders. Escalate to managers. Consider policy enforcement mechanisms.',CURRENT_DATE+21,'manual',NULL),

    (v_org_id,'Vendor Contract Security Addendum Missing','third_party',
     'Contracts with 4 Tier 2 vendors lack required security addendum clauses.',
     1,3,'identified',v_user_id,'Legal team to issue updated addendums before next vendor review cycle.',CURRENT_DATE+90,'manual',NULL);

  -- ═══════════════════════════════════════════════════════════
  -- VAPT REPORTS + VULNERABILITIES
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO vapt_reports (id, org_id, title, conducted_by, report_date, scope, finding_count, status, created_by)
  VALUES
    (vr1,v_org_id,'Q4 2024 External Penetration Test',    'NCC Group',      '2024-11-15','External perimeter, web applications, API endpoints',14,'active',v_user_id),
    (vr2,v_org_id,'Q1 2025 Web Application Security Test','Synack Red Team','2025-01-20','Customer portal, admin dashboard, REST APIs',         9,'active',v_user_id),
    (vr3,v_org_id,'Q2 2025 Internal Network Assessment',  'Bishop Fox',     '2025-02-28','Internal network, AD/LDAP, lateral movement paths',   7,'active',v_user_id);

  INSERT INTO vulnerabilities (org_id, vapt_report_id, title, cve_id, severity, cvss_score,
                                status, source, description, remediation, assignee_id, due_date)
  VALUES
    -- Q4 2024
    (v_org_id,vr1,'SQL Injection in Customer Search Endpoint','CVE-2024-38817','critical',9.8,'in_progress','vapt',
     'UNION-based SQL injection in /api/customers/search allows full database dump.',
     'Use parameterized queries. Deploy WAF rule. Conduct full code review.',v_user_id,CURRENT_DATE+7),
    (v_org_id,vr1,'Stored XSS in User Profile Page',NULL,'high',7.4,'in_progress','vapt',
     'Stored XSS in profile bio allows session hijacking of any user who views the profile.',
     'Implement output encoding. Add Content-Security-Policy header.',v_user_id,CURRENT_DATE+14),
    (v_org_id,vr1,'Insecure Direct Object Reference (IDOR)',NULL,'high',8.1,'open','vapt',
     'IDOR in /api/orders/{id} allows authenticated users to access other customers'' orders.',
     'Enforce server-side authorization on all resource access. Use UUIDs.',v_user_id,CURRENT_DATE+10),
    (v_org_id,vr1,'Broken Access Control on Admin Panel',NULL,'high',7.8,'open','vapt',
     'Admin panel accessible to non-admin users due to missing server-side role verification.',
     'Implement server-side authorization. Remove reliance on client-side role checks.',v_user_id,CURRENT_DATE+14),
    (v_org_id,vr1,'Missing Security Headers',NULL,'medium',5.3,'resolved','vapt',
     'X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options all absent.',
     'Configure security headers in Nginx/CloudFront.',v_user_id,CURRENT_DATE-10),
    (v_org_id,vr1,'Verbose Error Messages Leaking Stack Traces',NULL,'medium',4.3,'resolved','vapt',
     'Unhandled exceptions return full stack traces in production.',
     'Implement global error handler. Return generic messages in production.',v_user_id,CURRENT_DATE-5),
    (v_org_id,vr1,'TLS 1.0/1.1 Still Supported',NULL,'medium',5.9,'resolved','vapt',
     'Legacy TLS versions accepted. Vulnerable to BEAST and POODLE attacks.',
     'Disable TLS 1.0/1.1 in all load balancers. Enforce TLS 1.2 minimum.',v_user_id,CURRENT_DATE-20),
    -- Q1 2025
    (v_org_id,vr2,'JWT Algorithm Confusion Vulnerability','CVE-2025-10021','critical',9.1,'in_progress','vapt',
     'JWT library accepts alg:none allowing forging of any user token without a signature.',
     'Upgrade JWT library. Explicitly whitelist accepted algorithms.',v_user_id,CURRENT_DATE+5),
    (v_org_id,vr2,'GraphQL Introspection Enabled in Production',NULL,'high',6.5,'open','vapt',
     'GraphQL introspection exposes full API schema to unauthenticated users.',
     'Disable introspection in production. Implement query depth limiting.',v_user_id,CURRENT_DATE+21),
    (v_org_id,vr2,'Insecure Password Reset Flow',NULL,'high',7.5,'in_progress','vapt',
     'Password reset tokens not invalidated after use. Remain valid for 7 days.',
     'Invalidate tokens on first use. Reduce validity to 1 hour.',v_user_id,CURRENT_DATE+14),
    (v_org_id,vr2,'Server-Side Request Forgery (SSRF)',NULL,'medium',6.8,'open','vapt',
     'SSRF in webhook config allows internal network scanning via crafted URLs.',
     'Whitelist allowed webhook URLs. Block requests to internal IP ranges.',v_user_id,CURRENT_DATE+30),
    (v_org_id,vr2,'Rate Limiting Not Enforced on Auth Endpoint',NULL,'medium',5.3,'resolved','vapt',
     'Login endpoint allows unlimited password attempts. Susceptible to credential stuffing.',
     'Implement rate limiting (5 attempts/5 min per IP). Add CAPTCHA after 3 failures.',v_user_id,CURRENT_DATE-15),
    -- Q2 2025
    (v_org_id,vr3,'Domain Admin Credential Exposure via Kerberoasting',NULL,'critical',9.0,'open','vapt',
     'Service accounts with weak passwords. Kerberoasting yielded domain admin credentials in 2 hours.',
     'Use 25+ char passwords for service accounts. Use gMSAs. Monitor Kerberos TGS requests.',v_user_id,CURRENT_DATE+7),
    (v_org_id,vr3,'NTLM Relay Attack Path',NULL,'high',8.5,'open','vapt',
     'SMB signing not enforced allowing NTLM relay from compromised host to domain controller.',
     'Enable SMB signing on all systems. Disable NTLM where possible. Deploy Credential Guard.',v_user_id,CURRENT_DATE+14),
    (v_org_id,vr3,'Lateral Movement via Exposed RDP',NULL,'high',7.2,'in_progress','vapt',
     'RDP exposed on 12 internal Windows hosts without Network Level Authentication.',
     'Enable NLA for all RDP. Restrict access to jump host only.',v_user_id,CURRENT_DATE+21),
    (v_org_id,vr3,'Hardcoded Credentials in Configuration Files',NULL,'high',8.0,'in_progress','vapt',
     'DB and API credentials found hardcoded in config files accessible to all domain users.',
     'Move credentials to secrets manager. Implement rotation. Audit all AD-accessible shares.',v_user_id,CURRENT_DATE+10);

  -- ═══════════════════════════════════════════════════════════
  -- ASSETS
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO assets (org_id, name, type, provider, external_id, region, ip_address, criticality, last_seen, tags, metadata)
  VALUES
    (v_org_id,'api-prod-01',         'ec2',        'aws','i-0a1b2c3d4e5f60001','us-east-1','10.0.1.10','critical',now(),'{"env":"prod","team":"backend"}','{"instance_type":"c6i.2xlarge","state":"running"}'),
    (v_org_id,'api-prod-02',         'ec2',        'aws','i-0a1b2c3d4e5f60002','us-east-1','10.0.1.11','critical',now(),'{"env":"prod","team":"backend"}','{"instance_type":"c6i.2xlarge","state":"running"}'),
    (v_org_id,'db-postgres-primary', 'rds',        'aws','arn:aws:rds:us-east-1:123456789012:db:prod-pg-01','us-east-1','10.0.2.50','critical',now(),'{"env":"prod","team":"data"}','{"engine":"postgres14","multi_az":true}'),
    (v_org_id,'db-postgres-replica', 'rds',        'aws','arn:aws:rds:us-east-1:123456789012:db:prod-pg-02','us-east-1','10.0.2.51','critical',now(),'{"env":"prod","team":"data"}','{"engine":"postgres14","multi_az":true}'),
    (v_org_id,'customer-data-bucket','s3',         'aws','arn:aws:s3:::acme-customer-data-prod','us-east-1',NULL,'critical',now(),'{"env":"prod","data_class":"confidential"}','{"versioning":"enabled"}'),
    (v_org_id,'logs-bucket',         's3',         'aws','arn:aws:s3:::acme-audit-logs-prod','us-east-1',NULL,'high',now(),'{"env":"prod"}','{"versioning":"enabled","lifecycle":"90d"}'),
    (v_org_id,'worker-processing-01','ec2',        'aws','i-0a1b2c3d4e5f60003','us-east-1','10.0.3.20','high',now(),'{"env":"prod","team":"workers"}','{"instance_type":"m6i.xlarge","state":"running"}'),
    (v_org_id,'lambda-auth-service', 'lambda',     'aws','arn:aws:lambda:us-east-1:123456789012:function:auth-service','us-east-1',NULL,'high',now(),'{"env":"prod"}','{"runtime":"nodejs18","memory":"512MB"}'),
    (v_org_id,'lambda-email-sender', 'lambda',     'aws','arn:aws:lambda:us-east-1:123456789012:function:email-sender','us-east-1',NULL,'medium',now(),'{"env":"prod"}','{"runtime":"nodejs18","memory":"256MB"}'),
    (v_org_id,'redis-cache-01',      'elasticache','aws','arn:aws:elasticache:us-east-1:123456789012:cluster:prod-redis','us-east-1','10.0.4.10','high',now(),'{"env":"prod"}','{"engine":"redis7","encrypted":true}'),
    (v_org_id,'cloudfront-cdn',      'cloudfront', 'aws','arn:aws:cloudfront::123456789012:distribution/E1234567890ABC','global',NULL,'high',now(),'{"env":"prod"}','{"waf_enabled":true,"https_only":true}'),
    (v_org_id,'bastion-host',        'ec2',        'aws','i-0a1b2c3d4e5f60004','us-east-1','54.22.15.88','high',now(),'{"env":"prod","purpose":"bastion"}','{"instance_type":"t3.micro"}'),
    (v_org_id,'build-server-01',     'ec2',        'aws','i-0a1b2c3d4e5f60005','us-east-1','10.0.5.10','medium',now(),'{"env":"ci","team":"devops"}','{"instance_type":"c6i.4xlarge"}'),
    (v_org_id,'seccomply-api',       'repository', 'github','repo-demo-123456781',NULL,NULL,'high',now(),'{"lang":"typescript","visibility":"private"}','{"default_branch":"main"}'),
    (v_org_id,'seccomply-frontend',  'repository', 'github','repo-demo-123456782',NULL,NULL,'high',now(),'{"lang":"typescript","visibility":"private"}','{"default_branch":"main"}'),
    (v_org_id,'eng-laptop-001',      'workstation','manual','ws-eng-001',NULL,NULL,'medium',now(),'{"team":"engineering","os":"macOS 14"}','{"mdm":"enrolled","filevault":"enabled"}'),
    (v_org_id,'eng-laptop-002',      'workstation','manual','ws-eng-002',NULL,NULL,'medium',now(),'{"team":"engineering","os":"macOS 14"}','{"mdm":"enrolled","filevault":"enabled"}'),
    (v_org_id,'eng-laptop-003',      'workstation','manual','ws-eng-003',NULL,NULL,'medium',now(),'{"team":"engineering","os":"Ubuntu 22"}','{"mdm":"enrolled","filevault":"enabled"}'),
    (v_org_id,'office-nas-01',       'other',      'manual','nas-demo-001',NULL,'192.168.1.100','medium',now()-interval'1 day','{"team":"office"}','{"model":"Synology DS923+","encrypted":true}'),
    (v_org_id,'office-printer-01',   'other',      'manual','printer-demo-001',NULL,'192.168.1.50','low',now()-interval'2 days','{"team":"office"}','{"model":"HP LaserJet 5200"}')
  ON CONFLICT (org_id, provider, external_id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════
  -- AWS ACCOUNT + FINDINGS
  -- Re-uses existing AWS account for this org if present;
  -- creates a demo account only when none exists.
  -- Demo findings are inserted only if the account has none yet.
  -- ═══════════════════════════════════════════════════════════
  SELECT id INTO v_aws_acct FROM aws_accounts WHERE org_id = v_org_id LIMIT 1;
  IF v_aws_acct IS NULL THEN
    v_aws_acct := gen_random_uuid();
    INSERT INTO aws_accounts (id, org_id, account_id, account_alias, role_arn, external_id,
                              regions, last_scan, status)
    VALUES (v_aws_acct,v_org_id,'123456789012','acme-production',
      'arn:aws:iam::123456789012:role/SecComplyScanner','seccomply-demo-ext-id',
      ARRAY['us-east-1','us-west-2','eu-west-1'],now()-interval'2 hours','active');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM aws_findings WHERE aws_account_id = v_aws_acct) THEN
    INSERT INTO aws_findings (aws_account_id, rule_id, title, resource_arn, resource_type,
                              resource_id, severity, status, details, first_seen, last_seen)
    VALUES
      (v_aws_acct,'IAM-001','Root account has no MFA enabled',
       'arn:aws:iam::123456789012:root','AWS::IAM::User','root',
       'CRITICAL','ACTIVE','{"recommendation":"Enable MFA on root account"}',
       now()-interval'5 days',now()-interval'2 hours'),
      (v_aws_acct,'IAM-002','IAM user has admin privileges without MFA',
       'arn:aws:iam::123456789012:user/deploy-bot','AWS::IAM::User','deploy-bot',
       'HIGH','ACTIVE','{"user":"deploy-bot","policy":"AdministratorAccess"}',
       now()-interval'10 days',now()-interval'2 hours'),
      (v_aws_acct,'IAM-003','IAM role with wildcard permissions',
       'arn:aws:iam::123456789012:role/LambdaExecutionRole','AWS::IAM::Role','LambdaExecutionRole',
       'HIGH','ACTIVE','{"policy_actions":["*"],"resource":"*"}',
       now()-interval'15 days',now()-interval'2 hours'),
      (v_aws_acct,'IAM-004','Access key unused for more than 90 days',
       'arn:aws:iam::123456789012:user/analytics-svc','AWS::IAM::User','analytics-svc',
       'MEDIUM','ACTIVE','{"last_used":"2024-11-15","key_age_days":107}',
       now()-interval'3 days',now()-interval'2 hours'),
      (v_aws_acct,'IAM-005','IAM password policy does not meet complexity requirements',
       'arn:aws:iam::123456789012:account-password-policy','AWS::IAM::Policy','account-password-policy',
       'MEDIUM','ACTIVE','{"min_length":8,"require_symbols":false}',
       now()-interval'20 days',now()-interval'2 hours'),
      (v_aws_acct,'S3-001','S3 bucket encryption not enabled',
       'arn:aws:s3:::acme-temp-uploads','AWS::S3::Bucket','acme-temp-uploads',
       'HIGH','ACTIVE','{"encryption":"none","public_access":"blocked"}',
       now()-interval'7 days',now()-interval'2 hours'),
      (v_aws_acct,'S3-002','S3 bucket server access logging not enabled',
       'arn:aws:s3:::acme-ml-models','AWS::S3::Bucket','acme-ml-models',
       'MEDIUM','ACTIVE','{"server_access_logging":"disabled"}',
       now()-interval'12 days',now()-interval'2 hours'),
      (v_aws_acct,'EC2-001','EC2 running deprecated OS (Ubuntu 18.04)',
       'arn:aws:ec2:us-east-1:123456789012:instance/i-0legacy001','AWS::EC2::Instance','i-0legacy001',
       'HIGH','ACTIVE','{"os":"Ubuntu 18.04 LTS","eol_date":"2023-04-30"}',
       now()-interval'8 days',now()-interval'2 hours'),
      (v_aws_acct,'EC2-002','Security group allows unrestricted SSH (0.0.0.0/0)',
       'arn:aws:ec2:us-east-1:123456789012:security-group/sg-0open001','AWS::EC2::SecurityGroup','sg-0open001',
       'HIGH','ACTIVE','{"port":22,"protocol":"tcp","source":"0.0.0.0/0"}',
       now()-interval'2 days',now()-interval'2 hours'),
      (v_aws_acct,'EC2-003','EC2 instance not managed by Systems Manager',
       'arn:aws:ec2:us-east-1:123456789012:instance/i-0unmanaged01','AWS::EC2::Instance','i-0unmanaged01',
       'MEDIUM','ACTIVE','{"ssm_agent":"not_installed"}',
       now()-interval'15 days',now()-interval'2 hours'),
      (v_aws_acct,'CT-001','CloudTrail not enabled in all regions',
       'arn:aws:cloudtrail:ap-southeast-2:123456789012:trail/default','AWS::CloudTrail::Trail','ap-southeast-2-trail',
       'MEDIUM','ACTIVE','{"region":"ap-southeast-2","status":"not_enabled"}',
       now()-interval'30 days',now()-interval'2 hours'),
      (v_aws_acct,'CT-002','CloudTrail log file validation not enabled',
       'arn:aws:cloudtrail:us-east-1:123456789012:trail/us-east-1-trail','AWS::CloudTrail::Trail','us-east-1-trail',
       'MEDIUM','ACTIVE','{"log_file_validation":"disabled"}',
       now()-interval'30 days',now()-interval'2 hours'),
      (v_aws_acct,'VPC-001','VPC flow logs not enabled',
       'arn:aws:ec2:us-east-1:123456789012:vpc/vpc-0prod','AWS::EC2::VPC','vpc-0prod',
       'MEDIUM','ACTIVE','{"flow_logs":"disabled"}',
       now()-interval'25 days',now()-interval'2 hours'),
      (v_aws_acct,'SEC-001','AWS Config not enabled in all regions',
       'arn:aws:config:eu-west-1:123456789012:config-recorder/default','AWS::Config::ConfigurationRecorder','eu-west-1',
       'LOW','ACTIVE','{"region":"eu-west-1","status":"not_recording"}',
       now()-interval'45 days',now()-interval'2 hours'),
      (v_aws_acct,'IAM-006','IAM cross-account trust without external ID (RESOLVED)',
       'arn:aws:iam::123456789012:role/CrossAccountDataShare','AWS::IAM::Role','CrossAccountDataShare',
       'HIGH','RESOLVED','{"trusted_account":"987654321098","condition":"none"}',
       now()-interval'20 days',now()-interval'1 day');
  END IF;

  -- ═══════════════════════════════════════════════════════════
  -- GITHUB INSTALLATION + REPOS + FINDINGS
  -- Re-uses existing GitHub installation for this org if present;
  -- creates a demo installation only when none exists.
  -- Demo repos/findings are inserted only if the installation
  -- has no findings yet.
  -- ═══════════════════════════════════════════════════════════
  SELECT id INTO v_gh_inst FROM github_installations WHERE org_id = v_org_id LIMIT 1;
  IF v_gh_inst IS NULL THEN
    v_gh_inst := gen_random_uuid();
    INSERT INTO github_installations (id, org_id, installation_id, github_org, last_sync, status, org_settings)
    VALUES (v_gh_inst,v_org_id,87654321,'acme-corp',now()-interval'1 hour','active',
      '{"two_factor_requirement":true,"members_can_create_repos":false,"default_repository_permission":"read","advanced_security_enabled_for_new_repos":true}');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM github_findings WHERE installation_id = v_gh_inst) THEN
    INSERT INTO github_repos (installation_id, repo_name, repo_id, private, default_branch, settings, compliance_issues)
    VALUES
      (v_gh_inst,'acme-corp/api-backend',   123456781,true,'main',
       '{"branch_protection":{"main":{"required_reviews":2,"required_status_checks":true}},"secret_scanning":true,"dependabot":true}','[]'),
      (v_gh_inst,'acme-corp/frontend-app',  123456782,true,'main',
       '{"branch_protection":{"main":{"required_reviews":1,"required_status_checks":true}},"secret_scanning":true,"dependabot":true}','[]'),
      (v_gh_inst,'acme-corp/data-pipeline', 123456783,true,'main',
       '{"branch_protection":{"main":{"required_reviews":0}},"secret_scanning":false,"dependabot":true}',
       '[{"type":"no_branch_protection","description":"Main branch has no required reviews"},{"type":"secret_scanning_disabled","description":"Secret scanning not enabled"}]'),
      (v_gh_inst,'acme-corp/infra-scripts', 123456784,true,'main',
       '{"branch_protection":{},"secret_scanning":true,"dependabot":false}',
       '[{"type":"no_branch_protection","description":"No branch protection rules configured"},{"type":"dependabot_disabled","description":"Dependabot not enabled"}]'),
      (v_gh_inst,'acme-corp/mobile-app',    123456785,true,'main',
       '{"branch_protection":{"main":{"required_reviews":2,"required_status_checks":true}},"secret_scanning":true,"dependabot":true}','[]')
    ON CONFLICT (installation_id, repo_id) DO NOTHING;

    INSERT INTO github_findings (installation_id, type, severity, repository, title, details, state, external_id)
    VALUES
      (v_gh_inst,'secret','critical','acme-corp/infra-scripts','AWS Access Key ID exposed in config file',
       '{"secret_type":"aws_access_key_id","file":"config/aws.env","line":12,"first_exposed":"2025-01-15"}','open','SS-001'),
      (v_gh_inst,'secret','critical','acme-corp/infra-scripts','AWS Secret Access Key exposed in config file',
       '{"secret_type":"aws_secret_access_key","file":"config/aws.env","line":13,"first_exposed":"2025-01-15"}','open','SS-002'),
      (v_gh_inst,'secret','high','acme-corp/data-pipeline','Stripe API key found in test fixture',
       '{"secret_type":"stripe_api_key","file":"tests/fixtures/payment.json","line":5,"first_exposed":"2025-01-22"}','open','SS-003'),
      (v_gh_inst,'secret','high','acme-corp/api-backend','GitHub Personal Access Token in CI config',
       '{"secret_type":"github_pat","file":".github/workflows/deploy.yml","line":34}','resolved','SS-004'),
      (v_gh_inst,'dependabot','critical','acme-corp/api-backend','CVE-2024-45490: CVSS 9.8 in fast-xml-parser',
       '{"cve":"CVE-2024-45490","package":"fast-xml-parser","affected_version":"<4.4.1","fixed_version":"4.4.1","cvss":9.8}','open','DB-001'),
      (v_gh_inst,'dependabot','critical','acme-corp/api-backend','CVE-2025-22150: Request smuggling in undici',
       '{"cve":"CVE-2025-22150","package":"undici","affected_version":"<6.21.1","fixed_version":"6.21.1","cvss":9.4}','open','DB-002'),
      (v_gh_inst,'dependabot','high','acme-corp/frontend-app','CVE-2025-27789: Path traversal in path-scurry',
       '{"cve":"CVE-2025-27789","package":"path-scurry","affected_version":"<2.0.0","fixed_version":"2.0.0","cvss":8.2}','open','DB-003'),
      (v_gh_inst,'dependabot','high','acme-corp/api-backend','CVE-2024-21538: ReDoS in cross-spawn',
       '{"cve":"CVE-2024-21538","package":"cross-spawn","affected_version":"<7.0.5","fixed_version":"7.0.5","cvss":7.5}','open','DB-004'),
      (v_gh_inst,'dependabot','high','acme-corp/mobile-app','CVE-2024-55565: SQL injection in sequelize',
       '{"cve":"CVE-2024-55565","package":"sequelize","affected_version":"<6.37.4","fixed_version":"6.37.4","cvss":8.8}','open','DB-005'),
      (v_gh_inst,'dependabot','medium','acme-corp/data-pipeline','CVE-2024-47764: Cookie bypass in cookie-es',
       '{"cve":"CVE-2024-47764","package":"cookie","affected_version":"<0.7.0","fixed_version":"0.7.0","cvss":5.3}','resolved','DB-006'),
      (v_gh_inst,'code_scan','high','acme-corp/api-backend','Unsanitized user input in SQL query',
       '{"rule":"js/sql-injection","file":"src/routes/search.ts","line":45,"cwe":"CWE-89","tool":"CodeQL"}','open','CS-001'),
      (v_gh_inst,'code_scan','medium','acme-corp/frontend-app','DOM-based XSS via innerHTML assignment',
       '{"rule":"js/xss","file":"src/components/RichText.tsx","line":23,"cwe":"CWE-79","tool":"CodeQL"}','open','CS-002');
  END IF;

  -- ═══════════════════════════════════════════════════════════
  -- EVIDENCE ARTIFACTS
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO evidence_artifacts (org_id, name, description, file_type, file_size, uploaded_by, status, expires_at)
  VALUES
    (v_org_id,'AWS_SOC2_Report_2024.pdf',              'AWS SOC 2 Type II Report — July 2023 to June 2024',             'application/pdf',4823042,v_user_id,'active',CURRENT_DATE+180),
    (v_org_id,'Penetration_Test_Q4_2024_NCC_Group.pdf','NCC Group External Penetration Test Report — Q4 2024',          'application/pdf',3291840,v_user_id,'active',CURRENT_DATE+365),
    (v_org_id,'MFA_Enforcement_Screenshot.png',        'MFA enabled for all admin accounts — Okta dashboard screenshot', 'image/png',248320,v_user_id,'active',CURRENT_DATE+90),
    (v_org_id,'Access_Review_Q1_2025.xlsx',            'Quarterly user access review completed by department managers',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',1048576,v_user_id,'active',CURRENT_DATE+90),
    (v_org_id,'Security_Training_Completion_Feb2025.csv','Security awareness training completion report — 94% rate',    'text/csv',102400,v_user_id,'active',CURRENT_DATE+180),
    (v_org_id,'Okta_SOC2_Type2_2024.pdf',              'Okta Identity Cloud SOC 2 Type II Report',                      'application/pdf',5234688,v_user_id,'active',CURRENT_DATE+120),
    (v_org_id,'Incident_Response_Tabletop_Q4_2024.pdf','IR tabletop exercise results and action items — Q4 2024',       'application/pdf',892928,v_user_id,'active',CURRENT_DATE+365),
    (v_org_id,'Backup_Restore_Test_Jan2025.pdf',       'DB backup restore test — RTO 45min, RPO 8min achieved',         'application/pdf',445440,v_user_id,'active',CURRENT_DATE+90),
    (v_org_id,'Vendor_SOC2_Salesforce_2024.pdf',       'Salesforce Trust and Compliance SOC 2 Type II Report 2024',     'application/pdf',6815744,v_user_id,'active',CURRENT_DATE+150),
    (v_org_id,'Change_Approval_Log_Feb2025.xlsx',      'Change Advisory Board approval log — February 2025',            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',512000,v_user_id,'active',CURRENT_DATE+180),
    (v_org_id,'AWS_CloudTrail_Config_Evidence.png',    'CloudTrail enabled in all active regions — AWS Console screenshot','image/png',312320,v_user_id,'active',CURRENT_DATE+90),
    (v_org_id,'Encryption_At_Rest_Policy_Check.pdf',   'S3 bucket encryption configuration via AWS Config rules',       'application/pdf',678912,v_user_id,'active',CURRENT_DATE+90),
    (v_org_id,'GDPR_DPA_Agreements_2024.pdf',          'Data Processing Agreements with all Tier 1 vendors — 2024',     'application/pdf',2097152,v_user_id,'active',CURRENT_DATE+365),
    (v_org_id,'Network_Diagram_Prod_v3.2.pdf',         'Production network architecture diagram — security boundaries',  'application/pdf',1572864,v_user_id,'active',CURRENT_DATE+365),
    (v_org_id,'Vuln_Scan_Report_March2025.pdf',        'Internal vulnerability scan — Nessus scan of prod environment', 'application/pdf',3145728,v_user_id,'active',CURRENT_DATE+60);

  -- ═══════════════════════════════════════════════════════════
  -- UPDATE CONTROL STATUSES
  -- Marks ~40% verified and ~25% in_progress for a realistic
  -- compliance posture. Requires migration 004 to be applied
  -- (updates the status enum to include 'verified').
  -- ═══════════════════════════════════════════════════════════

  -- Mark ~40% of controls as verified
  UPDATE control_status
  SET
    status       = 'verified',
    evidence_count = 1 + floor(random() * 4)::int,
    last_updated = now() - (floor(random() * 30)::int * interval '1 day')
  WHERE org_id = v_org_id
    AND id IN (
      SELECT id FROM control_status
      WHERE org_id = v_org_id AND status = 'not_started'
      ORDER BY id
      LIMIT (SELECT GREATEST(1, COUNT(*) * 40 / 100)
             FROM control_status WHERE org_id = v_org_id)
    );

  -- Mark ~25% of remaining not_started as in_progress
  UPDATE control_status
  SET
    status       = 'in_progress',
    evidence_count = floor(random() * 2)::int,
    last_updated = now() - (floor(random() * 14)::int * interval '1 day')
  WHERE org_id = v_org_id
    AND id IN (
      SELECT id FROM control_status
      WHERE org_id = v_org_id AND status = 'not_started'
      ORDER BY id
      LIMIT (SELECT GREATEST(1, COUNT(*) * 25 / 100)
             FROM control_status WHERE org_id = v_org_id)
    );

  RAISE NOTICE 'Demo seed complete for org: %', v_org_id;
  RAISE NOTICE '  Vendors: 10 | Assessments: 17';
  RAISE NOTICE '  Policies: 12';
  RAISE NOTICE '  Risks: 15';
  RAISE NOTICE '  VAPT Reports: 3 | Vulnerabilities: 16';
  RAISE NOTICE '  Assets: 20';
  RAISE NOTICE '  AWS: 15 findings injected into existing or new demo account';
  RAISE NOTICE '  GitHub: 5 repos + 12 findings injected into existing or new installation';
  RAISE NOTICE '  Evidence artifacts: 15';
  RAISE NOTICE '  Control statuses updated: ~40%% verified, ~25%% in_progress';
END;
$$;
