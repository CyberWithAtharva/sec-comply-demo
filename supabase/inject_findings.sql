-- ============================================================
-- SecComply: Enterprise Demo Dataset — AcmeCorp
-- Series B SaaS startup · 150 employees · Microservices on AWS
--
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run — idempotent via ON CONFLICT DO NOTHING.
-- ============================================================

DO $$
DECLARE
  v_org_id    uuid;
  v_aws_acct  uuid;
  v_gh_inst   uuid;
  v_aws_cnt   int;
  v_gh_cnt    int;
  v_ctrl_ids  uuid[];
  v_ctrl_id   uuid;
  v_ctrl_idx  int := 0;
  v_ctrl_tot  int;
  v_status    text;
  v_ev_cnt    int;
BEGIN
  -- ── Resolve org ────────────────────────────────────────────
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found. Create one via the admin panel first.';
  END IF;
  RAISE NOTICE 'Org: %', v_org_id;

  -- ════════════════════════════════════════════════════════════
  -- AWS ACCOUNT
  -- ════════════════════════════════════════════════════════════
  SELECT id INTO v_aws_acct FROM aws_accounts WHERE org_id = v_org_id LIMIT 1;

  IF v_aws_acct IS NULL THEN
    v_aws_acct := gen_random_uuid();
    INSERT INTO aws_accounts (id, org_id, account_id, account_alias, role_arn, external_id,
                              regions, last_scan, status)
    VALUES (v_aws_acct, v_org_id, '123456789012', 'acme-production',
      'arn:aws:iam::123456789012:role/SecComplyScanner', 'seccomply-demo-ext-id',
      ARRAY['us-east-1','us-west-2','eu-west-1','ap-southeast-1'], now()-interval'2 hours', 'active');
    RAISE NOTICE 'Created demo AWS account: %', v_aws_acct;
  ELSE
    RAISE NOTICE 'Using existing AWS account: %', v_aws_acct;
  END IF;

  -- ════════════════════════════════════════════════════════════
  -- AWS FINDINGS  (30 ACTIVE + 3 RESOLVED)
  -- ════════════════════════════════════════════════════════════
  INSERT INTO aws_findings (aws_account_id, rule_id, title, resource_arn, resource_type,
                            resource_id, severity, status, details, first_seen, last_seen)
  VALUES
  -- IAM findings
    (v_aws_acct,'IAM-001','Root account has no MFA enabled',
     'arn:aws:iam::123456789012:root','AWS::IAM::User','root',
     'CRITICAL','ACTIVE','{"recommendation":"Enable MFA on root account","impact":"Full account compromise if credentials leaked"}',
     now()-interval'5 days', now()-interval'2 hours'),

    (v_aws_acct,'IAM-002','IAM user with admin privileges and no MFA',
     'arn:aws:iam::123456789012:user/deploy-bot','AWS::IAM::User','deploy-bot',
     'HIGH','ACTIVE','{"user":"deploy-bot","policy":"AdministratorAccess","mfa_enabled":false}',
     now()-interval'10 days', now()-interval'2 hours'),

    (v_aws_acct,'IAM-003','IAM role with wildcard resource permissions',
     'arn:aws:iam::123456789012:role/LambdaExecutionRole','AWS::IAM::Role','LambdaExecutionRole',
     'HIGH','ACTIVE','{"policy_actions":["*"],"resource":"*","policy_name":"lambda-over-permissive"}',
     now()-interval'15 days', now()-interval'2 hours'),

    (v_aws_acct,'IAM-004','Access key unused for more than 90 days',
     'arn:aws:iam::123456789012:user/analytics-svc','AWS::IAM::User','analytics-svc',
     'MEDIUM','ACTIVE','{"last_used":"2024-11-15","key_age_days":107,"access_key_id":"AKIA...DEMO"}',
     now()-interval'3 days', now()-interval'2 hours'),

    (v_aws_acct,'IAM-005','IAM password policy does not meet complexity requirements',
     'arn:aws:iam::123456789012:account-password-policy','AWS::IAM::Policy','account-password-policy',
     'MEDIUM','ACTIVE','{"min_length":8,"require_symbols":false,"require_numbers":true,"require_uppercase":false}',
     now()-interval'20 days', now()-interval'2 hours'),

    (v_aws_acct,'IAM-006','IAM cross-account trust without External ID condition',
     'arn:aws:iam::123456789012:role/CrossAccountDataShare','AWS::IAM::Role','CrossAccountDataShare',
     'HIGH','ACTIVE','{"trusted_account":"987654321098","condition":"none","risk":"confused_deputy"}',
     now()-interval'20 days', now()-interval'2 hours'),

    (v_aws_acct,'IAM-007','Service account has inline policy with overly broad EC2 permissions',
     'arn:aws:iam::123456789012:user/ci-runner','AWS::IAM::User','ci-runner',
     'MEDIUM','ACTIVE','{"inline_policy":"ci-runner-inline","actions":["ec2:*"],"resource":"*"}',
     now()-interval'8 days', now()-interval'2 hours'),

    (v_aws_acct,'IAM-008','Multiple active access keys for single IAM user',
     'arn:aws:iam::123456789012:user/data-export-svc','AWS::IAM::User','data-export-svc',
     'LOW','ACTIVE','{"active_key_count":2,"recommendation":"Rotate and deactivate old key"}',
     now()-interval'45 days', now()-interval'2 hours'),

  -- S3 findings
    (v_aws_acct,'S3-001','S3 bucket server-side encryption not enabled',
     'arn:aws:s3:::acme-temp-uploads','AWS::S3::Bucket','acme-temp-uploads',
     'HIGH','ACTIVE','{"encryption":"none","public_access":"blocked","contains":"user_uploads"}',
     now()-interval'7 days', now()-interval'2 hours'),

    (v_aws_acct,'S3-002','S3 bucket server access logging not enabled',
     'arn:aws:s3:::acme-ml-models','AWS::S3::Bucket','acme-ml-models',
     'MEDIUM','ACTIVE','{"server_access_logging":"disabled","versioning":"enabled"}',
     now()-interval'12 days', now()-interval'2 hours'),

    (v_aws_acct,'S3-003','S3 bucket versioning not enabled on backup bucket',
     'arn:aws:s3:::acme-db-backups','AWS::S3::Bucket','acme-db-backups',
     'MEDIUM','ACTIVE','{"versioning":"disabled","replication":"none","lifecycle":"none"}',
     now()-interval'18 days', now()-interval'2 hours'),

    (v_aws_acct,'S3-004','S3 bucket public read access enabled',
     'arn:aws:s3:::acme-legacy-assets','AWS::S3::Bucket','acme-legacy-assets',
     'CRITICAL','ACTIVE','{"public_access_block":false,"acl":"public-read","contains":"PII_risk"}',
     now()-interval'1 day', now()-interval'2 hours'),

  -- EC2 findings
    (v_aws_acct,'EC2-001','EC2 instance running end-of-life OS (Ubuntu 18.04)',
     'arn:aws:ec2:us-east-1:123456789012:instance/i-0legacy001','AWS::EC2::Instance','i-0legacy001',
     'HIGH','ACTIVE','{"os":"Ubuntu 18.04 LTS","eol_date":"2023-04-30","region":"us-east-1","role":"legacy-api"}',
     now()-interval'8 days', now()-interval'2 hours'),

    (v_aws_acct,'EC2-002','Security group allows unrestricted SSH from 0.0.0.0/0',
     'arn:aws:ec2:us-east-1:123456789012:security-group/sg-0open001','AWS::EC2::SecurityGroup','sg-0open001',
     'HIGH','ACTIVE','{"port":22,"protocol":"tcp","source":"0.0.0.0/0","attached_instances":3}',
     now()-interval'2 days', now()-interval'2 hours'),

    (v_aws_acct,'EC2-003','EC2 instance not registered with AWS Systems Manager',
     'arn:aws:ec2:us-east-1:123456789012:instance/i-0unmanaged01','AWS::EC2::Instance','i-0unmanaged01',
     'MEDIUM','ACTIVE','{"ssm_agent":"not_installed","patch_status":"unknown"}',
     now()-interval'15 days', now()-interval'2 hours'),

    (v_aws_acct,'EC2-004','EBS volume not encrypted at rest',
     'arn:aws:ec2:us-east-1:123456789012:volume/vol-0unenc01','AWS::EC2::Volume','vol-0unenc01',
     'HIGH','ACTIVE','{"encrypted":false,"size_gb":500,"attached_to":"i-0legacy001","contains":"application_data"}',
     now()-interval'30 days', now()-interval'2 hours'),

    (v_aws_acct,'EC2-005','EC2 instance with public IP and no WAF association',
     'arn:aws:ec2:us-west-2:123456789012:instance/i-0public01','AWS::EC2::Instance','i-0public01',
     'MEDIUM','ACTIVE','{"public_ip":"54.201.100.42","waf":"none","region":"us-west-2"}',
     now()-interval'6 days', now()-interval'2 hours'),

  -- RDS findings
    (v_aws_acct,'RDS-001','RDS instance publicly accessible',
     'arn:aws:rds:us-east-1:123456789012:db:acme-analytics-db','AWS::RDS::DBInstance','acme-analytics-db',
     'CRITICAL','ACTIVE','{"publicly_accessible":true,"engine":"postgres","version":"13.8","port":5432}',
     now()-interval'4 days', now()-interval'2 hours'),

    (v_aws_acct,'RDS-002','RDS automated backups disabled',
     'arn:aws:rds:us-east-1:123456789012:db:acme-session-db','AWS::RDS::DBInstance','acme-session-db',
     'HIGH','ACTIVE','{"backup_retention_period":0,"multi_az":false,"engine":"mysql"}',
     now()-interval'22 days', now()-interval'2 hours'),

    (v_aws_acct,'RDS-003','RDS storage not encrypted',
     'arn:aws:rds:eu-west-1:123456789012:db:acme-billing-db','AWS::RDS::DBInstance','acme-billing-db',
     'CRITICAL','ACTIVE','{"encrypted":false,"engine":"postgres","contains":"payment_data","region":"eu-west-1"}',
     now()-interval'40 days', now()-interval'2 hours'),

  -- Lambda findings
    (v_aws_acct,'LAMBDA-001','Lambda function using deprecated Node.js runtime (12.x)',
     'arn:aws:lambda:us-east-1:123456789012:function:image-processor','AWS::Lambda::Function','image-processor',
     'HIGH','ACTIVE','{"runtime":"nodejs12.x","eol_date":"2023-04-30","invocations_24h":4200}',
     now()-interval'9 days', now()-interval'2 hours'),

    (v_aws_acct,'LAMBDA-002','Lambda function with overly permissive execution role',
     'arn:aws:lambda:us-east-1:123456789012:function:data-sync','AWS::Lambda::Function','data-sync',
     'MEDIUM','ACTIVE','{"role_policies":["AmazonS3FullAccess","AmazonDynamoDBFullAccess"],"least_privilege":false}',
     now()-interval'17 days', now()-interval'2 hours'),

  -- CloudTrail findings
    (v_aws_acct,'CT-001','CloudTrail not enabled in ap-southeast-1 region',
     'arn:aws:cloudtrail:ap-southeast-1:123456789012:trail/default','AWS::CloudTrail::Trail','ap-southeast-1',
     'MEDIUM','ACTIVE','{"region":"ap-southeast-1","status":"not_enabled","risk":"blind_spot"}',
     now()-interval'30 days', now()-interval'2 hours'),

    (v_aws_acct,'CT-002','CloudTrail log file integrity validation disabled',
     'arn:aws:cloudtrail:us-east-1:123456789012:trail/us-east-1-trail','AWS::CloudTrail::Trail','us-east-1-trail',
     'MEDIUM','ACTIVE','{"log_file_validation":"disabled","s3_bucket":"acme-cloudtrail-logs"}',
     now()-interval'30 days', now()-interval'2 hours'),

  -- GuardDuty findings
    (v_aws_acct,'GD-001','GuardDuty: Unusual API call from Tor exit node',
     'arn:aws:guardduty:us-east-1:123456789012:detector/demo01','AWS::GuardDuty::Finding','GDFinding-001',
     'HIGH','ACTIVE','{"threat_name":"UnauthorizedAccess:IAMUser/TorIPCaller","api":"GetSecretValue","ip":"185.220.101.5","tor_exit":true}',
     now()-interval'1 day', now()-interval'3 hours'),

    (v_aws_acct,'GD-002','GuardDuty: Credential exfiltration behavior detected',
     'arn:aws:guardduty:us-east-1:123456789012:detector/demo02','AWS::GuardDuty::Finding','GDFinding-002',
     'CRITICAL','ACTIVE','{"threat_name":"CredentialAccess:IAMUser/AnomalousBehavior","user":"analytics-svc","api_calls":["GetSecretValue","DescribeInstances","ListBuckets"]}',
     now()-interval'6 hours', now()-interval'1 hour'),

  -- KMS finding
    (v_aws_acct,'KMS-001','KMS CMK automatic key rotation disabled',
     'arn:aws:kms:us-east-1:123456789012:key/demo-key-001','AWS::KMS::Key','demo-key-001',
     'MEDIUM','ACTIVE','{"key_rotation":"disabled","key_alias":"acme-data-key","key_age_days":395}',
     now()-interval'14 days', now()-interval'2 hours'),

  -- VPC findings
    (v_aws_acct,'VPC-001','VPC flow logs not enabled for production VPC',
     'arn:aws:ec2:us-east-1:123456789012:vpc/vpc-0prod','AWS::EC2::VPC','vpc-0prod',
     'MEDIUM','ACTIVE','{"flow_logs":"disabled","cidr":"10.0.0.0/16","subnets":12}',
     now()-interval'25 days', now()-interval'2 hours'),

    (v_aws_acct,'VPC-002','Network ACL allows unrestricted inbound traffic on port 3306',
     'arn:aws:ec2:us-east-1:123456789012:network-acl/acl-0mysql01','AWS::EC2::NetworkAcl','acl-0mysql01',
     'HIGH','ACTIVE','{"port":3306,"source":"0.0.0.0/0","protocol":"tcp","service":"MySQL"}',
     now()-interval'5 days', now()-interval'2 hours'),

  -- CloudWatch / Config
    (v_aws_acct,'CW-001','CloudWatch alarm not configured for root account usage',
     'arn:aws:cloudwatch:us-east-1:123456789012:alarm/root-usage','AWS::CloudWatch::Alarm','root-usage-alarm',
     'MEDIUM','ACTIVE','{"alarm_state":"INSUFFICIENT_DATA","metric":"RootAccountUsage","recommendation":"Create alarm"}',
     now()-interval'60 days', now()-interval'2 hours'),

    (v_aws_acct,'SEC-001','AWS Config not enabled in eu-west-1 region',
     'arn:aws:config:eu-west-1:123456789012:config-recorder/default','AWS::Config::ConfigurationRecorder','eu-west-1',
     'LOW','ACTIVE','{"region":"eu-west-1","status":"not_recording","resource_types_covered":0}',
     now()-interval'45 days', now()-interval'2 hours'),

  -- RESOLVED (historical, closed findings)
    (v_aws_acct,'IAM-009','IAM user console access with no MFA — remediated',
     'arn:aws:iam::123456789012:user/old-dev-user','AWS::IAM::User','old-dev-user',
     'HIGH','RESOLVED','{"remediation":"User account deactivated","resolved_by":"security-team"}',
     now()-interval'30 days', now()-interval'5 days'),

    (v_aws_acct,'S3-005','S3 bucket with public read ACL — remediated',
     'arn:aws:s3:::acme-old-public','AWS::S3::Bucket','acme-old-public',
     'CRITICAL','RESOLVED','{"remediation":"Public access block enabled","resolved_by":"devops"}',
     now()-interval'25 days', now()-interval'10 days'),

    (v_aws_acct,'EC2-006','Security group with open RDP removed',
     'arn:aws:ec2:us-east-1:123456789012:security-group/sg-oldrdp01','AWS::EC2::SecurityGroup','sg-oldrdp01',
     'HIGH','RESOLVED','{"port":3389,"remediation":"Security group rule removed","resolved_by":"devops"}',
     now()-interval'20 days', now()-interval'8 days')

  ON CONFLICT (aws_account_id, rule_id, resource_arn) DO NOTHING;

  SELECT COUNT(*) INTO v_aws_cnt FROM aws_findings WHERE aws_account_id = v_aws_acct;
  RAISE NOTICE 'AWS findings in DB: % total', v_aws_cnt;

  -- ════════════════════════════════════════════════════════════
  -- GITHUB INSTALLATION
  -- ════════════════════════════════════════════════════════════
  SELECT id INTO v_gh_inst FROM github_installations WHERE org_id = v_org_id LIMIT 1;

  IF v_gh_inst IS NULL THEN
    v_gh_inst := gen_random_uuid();
    INSERT INTO github_installations (id, org_id, installation_id, github_org, last_sync, status, org_settings)
    VALUES (v_gh_inst, v_org_id, 87654321, 'acme-corp', now()-interval'1 hour', 'active',
      '{"two_factor_requirement":true,"members_can_create_repos":false,"default_repository_permission":"read","advanced_security_enabled_for_new_repos":true,"saml_enabled":true,"verified_domains":["acmecorp.com"]}');
    RAISE NOTICE 'Created demo GitHub installation: %', v_gh_inst;
  ELSE
    RAISE NOTICE 'Using existing GitHub installation: %', v_gh_inst;
  END IF;

  -- ── 10 Repos ─────────────────────────────────────────────
  INSERT INTO github_repos (installation_id, repo_name, repo_id, private, default_branch, settings, compliance_issues)
  VALUES
    (v_gh_inst, 'acme-corp/api-backend', 123456781, true, 'main',
     '{"branch_protection":{"main":{"required_reviews":2,"required_status_checks":true,"dismiss_stale":true}},"secret_scanning":true,"dependabot":true,"code_scanning":true}',
     '[]'),

    (v_gh_inst, 'acme-corp/frontend-app', 123456782, true, 'main',
     '{"branch_protection":{"main":{"required_reviews":1,"required_status_checks":true}},"secret_scanning":true,"dependabot":true,"code_scanning":false}',
     '[{"type":"code_scanning_disabled","description":"Code scanning not enabled for this repository"}]'),

    (v_gh_inst, 'acme-corp/data-pipeline', 123456783, true, 'main',
     '{"branch_protection":{"main":{"required_reviews":0}},"secret_scanning":false,"dependabot":true,"code_scanning":false}',
     '[{"type":"no_required_reviews","description":"Main branch has no required PR reviews"},{"type":"secret_scanning_disabled","description":"Secret scanning not enabled"},{"type":"code_scanning_disabled","description":"Code scanning not configured"}]'),

    (v_gh_inst, 'acme-corp/infra-scripts', 123456784, true, 'main',
     '{"branch_protection":{},"secret_scanning":true,"dependabot":false,"code_scanning":false}',
     '[{"type":"no_branch_protection","description":"No branch protection rules configured on main"},{"type":"dependabot_disabled","description":"Dependabot not enabled — IaC dependencies unmonitored"},{"type":"code_scanning_disabled","description":"No code scanning for infrastructure scripts"}]'),

    (v_gh_inst, 'acme-corp/mobile-app', 123456785, true, 'main',
     '{"branch_protection":{"main":{"required_reviews":2,"required_status_checks":true}},"secret_scanning":true,"dependabot":true,"code_scanning":true}',
     '[]'),

    (v_gh_inst, 'acme-corp/auth-service', 123456786, true, 'main',
     '{"branch_protection":{"main":{"required_reviews":2,"required_status_checks":true,"dismiss_stale":true}},"secret_scanning":true,"dependabot":true,"code_scanning":true}',
     '[]'),

    (v_gh_inst, 'acme-corp/billing-service', 123456787, true, 'main',
     '{"branch_protection":{"main":{"required_reviews":1,"required_status_checks":false}},"secret_scanning":true,"dependabot":true,"code_scanning":false}',
     '[{"type":"no_required_status_checks","description":"Status checks not required before merge"},{"type":"code_scanning_disabled","description":"Code scanning not enabled — payment code unscanned"}]'),

    (v_gh_inst, 'acme-corp/notification-service', 123456788, true, 'main',
     '{"branch_protection":{"main":{"required_reviews":1,"required_status_checks":true}},"secret_scanning":false,"dependabot":true,"code_scanning":false}',
     '[{"type":"secret_scanning_disabled","description":"Secret scanning not enabled — API keys may be exposed"},{"type":"code_scanning_disabled","description":"Code scanning not configured"}]'),

    (v_gh_inst, 'acme-corp/analytics-engine', 123456789, true, 'main',
     '{"branch_protection":{},"secret_scanning":false,"dependabot":false,"code_scanning":false}',
     '[{"type":"no_branch_protection","description":"No branch protection on main"},{"type":"secret_scanning_disabled","description":"Secret scanning disabled"},{"type":"dependabot_disabled","description":"Dependabot disabled"},{"type":"code_scanning_disabled","description":"No code scanning"}]'),

    (v_gh_inst, 'acme-corp/shared-components', 123456790, false, 'main',
     '{"branch_protection":{"main":{"required_reviews":1,"required_status_checks":true}},"secret_scanning":true,"dependabot":true,"code_scanning":false}',
     '[{"type":"repo_public","description":"Repository is public — shared components visible externally"},{"type":"code_scanning_disabled","description":"Code scanning not enabled for public repo"}]')

  ON CONFLICT (installation_id, repo_id) DO NOTHING;

  -- ── GitHub Findings ──────────────────────────────────────
  INSERT INTO github_findings (installation_id, type, severity, repository, title, details, state, external_id)
  VALUES
  -- Secrets (7 findings)
    (v_gh_inst, 'secret', 'critical', 'acme-corp/infra-scripts',
     'AWS Access Key ID exposed in Terraform variable file',
     '{"secret_type":"aws_access_key_id","file":"terraform/vars/prod.tfvars","line":12,"commit":"a1b2c3d","age_days":4}',
     'open', 'DEMO-SS-001'),

    (v_gh_inst, 'secret', 'critical', 'acme-corp/infra-scripts',
     'AWS Secret Access Key exposed in Terraform variable file',
     '{"secret_type":"aws_secret_access_key","file":"terraform/vars/prod.tfvars","line":13,"commit":"a1b2c3d","age_days":4}',
     'open', 'DEMO-SS-002'),

    (v_gh_inst, 'secret', 'high', 'acme-corp/data-pipeline',
     'Stripe Live Secret Key found in test fixture',
     '{"secret_type":"stripe_secret_key","file":"tests/fixtures/payment.json","line":5,"commit":"d4e5f6g","age_days":12}',
     'open', 'DEMO-SS-003'),

    (v_gh_inst, 'secret', 'high', 'acme-corp/analytics-engine',
     'SendGrid API key hardcoded in notification handler',
     '{"secret_type":"sendgrid_api_key","file":"src/email/sender.py","line":8,"commit":"h7i8j9k","age_days":21}',
     'open', 'DEMO-SS-004'),

    (v_gh_inst, 'secret', 'high', 'acme-corp/notification-service',
     'Twilio Account SID and Auth Token in config file',
     '{"secret_type":"twilio_credentials","file":"config/twilio.js","line":3,"commit":"l0m1n2o","age_days":7}',
     'open', 'DEMO-SS-005'),

    (v_gh_inst, 'secret', 'medium', 'acme-corp/billing-service',
     'Google OAuth client secret in environment template',
     '{"secret_type":"google_oauth_secret","file":".env.example","line":19,"commit":"p3q4r5s","age_days":45}',
     'open', 'DEMO-SS-006'),

    (v_gh_inst, 'secret', 'high', 'acme-corp/api-backend',
     'GitHub Personal Access Token in CI workflow — now revoked',
     '{"secret_type":"github_pat","file":".github/workflows/deploy.yml","line":34,"commit":"t6u7v8w","remediation":"Token revoked and replaced with GITHUB_TOKEN"}',
     'resolved', 'DEMO-SS-007'),

  -- Dependabot CVEs (12 findings)
    (v_gh_inst, 'dependabot', 'critical', 'acme-corp/api-backend',
     'CVE-2024-45490: XML parser RCE in fast-xml-parser < 4.4.1',
     '{"cve":"CVE-2024-45490","package":"fast-xml-parser","affected_version":"4.3.2","fixed_version":"4.4.1","cvss":9.8,"ecosystem":"npm","cwe":"CWE-776"}',
     'open', 'DEMO-DB-001'),

    (v_gh_inst, 'dependabot', 'critical', 'acme-corp/api-backend',
     'CVE-2025-22150: Request smuggling in undici < 6.21.1',
     '{"cve":"CVE-2025-22150","package":"undici","affected_version":"6.19.2","fixed_version":"6.21.1","cvss":9.4,"ecosystem":"npm","cwe":"CWE-444"}',
     'open', 'DEMO-DB-002'),

    (v_gh_inst, 'dependabot', 'high', 'acme-corp/frontend-app',
     'CVE-2025-27789: Path traversal in path-scurry < 2.0.0',
     '{"cve":"CVE-2025-27789","package":"path-scurry","affected_version":"1.11.1","fixed_version":"2.0.0","cvss":8.2,"ecosystem":"npm","cwe":"CWE-22"}',
     'open', 'DEMO-DB-003'),

    (v_gh_inst, 'dependabot', 'high', 'acme-corp/api-backend',
     'CVE-2024-21538: ReDoS in cross-spawn < 7.0.5',
     '{"cve":"CVE-2024-21538","package":"cross-spawn","affected_version":"7.0.3","fixed_version":"7.0.5","cvss":7.5,"ecosystem":"npm","cwe":"CWE-1333"}',
     'open', 'DEMO-DB-004'),

    (v_gh_inst, 'dependabot', 'high', 'acme-corp/mobile-app',
     'CVE-2024-55565: SQL injection via Sequelize ORM < 6.37.4',
     '{"cve":"CVE-2024-55565","package":"sequelize","affected_version":"6.35.0","fixed_version":"6.37.4","cvss":8.8,"ecosystem":"npm","cwe":"CWE-89"}',
     'open', 'DEMO-DB-005'),

    (v_gh_inst, 'dependabot', 'high', 'acme-corp/auth-service',
     'CVE-2024-39338: SSRF vulnerability in axios < 1.7.4',
     '{"cve":"CVE-2024-39338","package":"axios","affected_version":"1.6.8","fixed_version":"1.7.4","cvss":7.5,"ecosystem":"npm","cwe":"CWE-918"}',
     'open', 'DEMO-DB-006'),

    (v_gh_inst, 'dependabot', 'high', 'acme-corp/billing-service',
     'CVE-2024-37890: Prototype pollution in ws < 8.17.1',
     '{"cve":"CVE-2024-37890","package":"ws","affected_version":"8.16.0","fixed_version":"8.17.1","cvss":7.5,"ecosystem":"npm","cwe":"CWE-1321"}',
     'open', 'DEMO-DB-007'),

    (v_gh_inst, 'dependabot', 'high', 'acme-corp/data-pipeline',
     'CVE-2024-28863: Tar directory traversal in node-tar < 6.2.1',
     '{"cve":"CVE-2024-28863","package":"node-tar","affected_version":"6.1.15","fixed_version":"6.2.1","cvss":6.5,"ecosystem":"npm","cwe":"CWE-22"}',
     'open', 'DEMO-DB-008'),

    (v_gh_inst, 'dependabot', 'medium', 'acme-corp/analytics-engine',
     'CVE-2024-47764: Cookie bypass in cookie < 0.7.0',
     '{"cve":"CVE-2024-47764","package":"cookie","affected_version":"0.6.0","fixed_version":"0.7.0","cvss":5.3,"ecosystem":"npm","cwe":"CWE-20"}',
     'open', 'DEMO-DB-009'),

    (v_gh_inst, 'dependabot', 'medium', 'acme-corp/notification-service',
     'CVE-2024-45296: Path-to-regexp ReDoS < 0.1.10',
     '{"cve":"CVE-2024-45296","package":"path-to-regexp","affected_version":"0.1.7","fixed_version":"0.1.10","cvss":5.3,"ecosystem":"npm","cwe":"CWE-1333"}',
     'open', 'DEMO-DB-010'),

    (v_gh_inst, 'dependabot', 'medium', 'acme-corp/shared-components',
     'CVE-2024-52798: path-to-regexp ReDoS backtrack in < 8.1.0',
     '{"cve":"CVE-2024-52798","package":"path-to-regexp","affected_version":"8.0.0","fixed_version":"8.1.0","cvss":5.3,"ecosystem":"npm","cwe":"CWE-1333"}',
     'open', 'DEMO-DB-011'),

    (v_gh_inst, 'dependabot', 'medium', 'acme-corp/data-pipeline',
     'CVE-2024-47764: Cookie bypass — now fixed',
     '{"cve":"CVE-2024-47764","package":"cookie","affected_version":"0.5.0","fixed_version":"0.7.0","cvss":5.3,"remediation":"Upgraded to 0.7.0"}',
     'resolved', 'DEMO-DB-012'),

  -- Code Scan (6 findings)
    (v_gh_inst, 'code_scan', 'high', 'acme-corp/api-backend',
     'SQL injection via unsanitized user input in search route',
     '{"rule":"js/sql-injection","file":"src/routes/search.ts","line":45,"snippet":"db.query(`SELECT * FROM products WHERE name = ${req.query.q}`)","cwe":"CWE-89","tool":"CodeQL"}',
     'open', 'DEMO-CS-001'),

    (v_gh_inst, 'code_scan', 'high', 'acme-corp/auth-service',
     'JWT algorithm confusion — accepts "none" algorithm',
     '{"rule":"js/jwt-missing-verification","file":"src/middleware/auth.ts","line":22,"snippet":"jwt.verify(token, secret, { algorithms: [algorithm] })","cwe":"CWE-347","tool":"CodeQL"}',
     'open', 'DEMO-CS-002'),

    (v_gh_inst, 'code_scan', 'medium', 'acme-corp/frontend-app',
     'DOM-based XSS via innerHTML assignment',
     '{"rule":"js/xss-dom","file":"src/components/RichText.tsx","line":23,"snippet":"element.innerHTML = userContent","cwe":"CWE-79","tool":"CodeQL"}',
     'open', 'DEMO-CS-003'),

    (v_gh_inst, 'code_scan', 'medium', 'acme-corp/billing-service',
     'Missing CSRF protection on state-changing POST endpoints',
     '{"rule":"js/csrf-protection","file":"src/routes/payments.ts","line":67,"snippet":"router.post(''/charge'', handler)","cwe":"CWE-352","tool":"CodeQL"}',
     'open', 'DEMO-CS-004'),

    (v_gh_inst, 'code_scan', 'medium', 'acme-corp/api-backend',
     'Sensitive data exposed in error response body',
     '{"rule":"js/sensitive-data-in-error","file":"src/middleware/errorHandler.ts","line":14,"snippet":"res.json({ error: err.stack })","cwe":"CWE-209","tool":"CodeQL"}',
     'open', 'DEMO-CS-005'),

    (v_gh_inst, 'code_scan', 'low', 'acme-corp/data-pipeline',
     'Server-side request forgery via unvalidated URL parameter',
     '{"rule":"js/server-side-request-forgery","file":"src/jobs/fetch-external.ts","line":38,"snippet":"axios.get(req.body.url)","cwe":"CWE-918","tool":"CodeQL"}',
     'open', 'DEMO-CS-006')

  ON CONFLICT (installation_id, type, external_id) DO NOTHING;

  SELECT COUNT(*) INTO v_gh_cnt FROM github_findings WHERE installation_id = v_gh_inst;
  RAISE NOTICE 'GitHub findings in DB: % total', v_gh_cnt;

  -- ════════════════════════════════════════════════════════════
  -- VAPT / PENETRATION TEST VULNERABILITIES (18 findings)
  -- Simulates results from an external pen test engagement.
  -- vulnerabilities table has no unique constraint, so use
  -- an EXISTS guard to remain idempotent.
  -- ════════════════════════════════════════════════════════════
  IF NOT EXISTS (SELECT 1 FROM vulnerabilities WHERE org_id = v_org_id AND cve_id = 'CVE-2024-VAPT-001') THEN
    INSERT INTO vulnerabilities (org_id, title, cve_id, severity, cvss_score, status, source, description, remediation, details)
    VALUES

    -- Critical
    (v_org_id, 'Broken Object Level Authorization in /api/invoices/{id}',
     'CVE-2024-VAPT-001', 'critical', 9.8, 'open', 'vapt',
     'Any authenticated user can access any other user''s invoice by incrementing the invoice ID in the API path. No ownership check is performed.',
     'Implement ownership validation: verify that the requesting user owns the resource before returning data.',
     '{"endpoint":"/api/v2/invoices/{id}","method":"GET","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H","cwe":"CWE-639","found_by":"manual_testing","engagement":"Q4-2024-External-Pentest"}'),

    (v_org_id, 'SQL Injection in product search endpoint',
     'CVE-2024-VAPT-002', 'critical', 9.1, 'open', 'vapt',
     'The /api/products/search endpoint passes the q parameter directly into a raw SQL query without parameterization, allowing full database dump.',
     'Replace raw SQL with parameterized queries or ORM. Validate and sanitize all user inputs at API boundary.',
     '{"endpoint":"/api/v1/products/search","method":"GET","parameter":"q","payload":"'' OR 1=1--","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N","cwe":"CWE-89","tool":"sqlmap + manual","engagement":"Q4-2024-External-Pentest"}'),

    -- High
    (v_org_id, 'JWT "none" algorithm accepted by authentication middleware',
     'CVE-2024-VAPT-003', 'high', 8.8, 'open', 'vapt',
     'The authentication service accepts JWTs with alg=none, allowing attackers to forge tokens for any user without knowing the signing secret.',
     'Pin accepted JWT algorithms to RS256/ES256. Reject tokens where alg=none or alg is not in an allow-list.',
     '{"endpoint":"/api/auth/verify","cwe":"CWE-347","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N","tool":"jwt_tool","engagement":"Q4-2024-External-Pentest"}'),

    (v_org_id, 'Server-Side Request Forgery in webhook URL validator',
     'CVE-2024-VAPT-004', 'high', 8.6, 'open', 'vapt',
     'The webhook configuration endpoint allows arbitrary URLs, enabling SSRF to AWS metadata service (169.254.169.254) and internal services.',
     'Implement allowlist-based URL validation. Block private IP ranges and metadata service IPs. Use a dedicated outbound proxy.',
     '{"endpoint":"/api/webhooks","parameter":"url","payload":"http://169.254.169.254/latest/meta-data/","cwe":"CWE-918","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:N/A:N","engagement":"Q4-2024-External-Pentest"}'),

    (v_org_id, 'Broken Function Level Authorization — admin endpoints accessible to regular users',
     'CVE-2024-VAPT-005', 'high', 8.1, 'open', 'vapt',
     'Admin-only endpoints under /api/admin/* return 403 for unauthenticated users but respond with full data for any authenticated user regardless of role.',
     'Implement role-based middleware that checks user.role === "admin" on all /api/admin/* routes.',
     '{"endpoints":["/api/admin/users","/api/admin/audit-logs","/api/admin/billing"],"cwe":"CWE-285","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N","engagement":"Q4-2024-External-Pentest"}'),

    (v_org_id, 'Insecure Direct Object Reference on file download endpoint',
     'CVE-2024-VAPT-006', 'high', 7.7, 'open', 'vapt',
     'The /api/files/download?id= endpoint accepts arbitrary file IDs and does not verify that the requesting user has access to the file.',
     'Add authorization check on every file access. Consider signed, time-limited download URLs (S3 pre-signed) instead of open IDs.',
     '{"endpoint":"/api/files/download","parameter":"id","cwe":"CWE-639","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N","engagement":"Q4-2024-External-Pentest"}'),

    (v_org_id, 'Missing rate limiting on login endpoint — brute force possible',
     'CVE-2024-VAPT-007', 'high', 7.5, 'in_progress', 'vapt',
     'The /auth/login endpoint has no rate limiting or account lockout, enabling automated credential stuffing attacks.',
     'Implement rate limiting (e.g., 10 attempts / IP / 15 min). Add CAPTCHA after 5 failed attempts. Enable account lockout after 20 failures.',
     '{"endpoint":"/auth/login","attempts_per_second":50,"cwe":"CWE-307","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N","engagement":"Q4-2024-External-Pentest"}'),

    (v_org_id, 'Stored XSS in user profile display name field',
     'CVE-2024-VAPT-008', 'high', 7.4, 'open', 'vapt',
     'The user profile display name field accepts and stores arbitrary HTML/JavaScript which is then rendered in the admin dashboard without sanitization.',
     'Sanitize all user-supplied input on write. Escape HTML on render. Apply Content-Security-Policy to prevent inline script execution.',
     '{"field":"display_name","render_location":"/admin/users","payload":"<img src=x onerror=alert(document.cookie)>","cwe":"CWE-79","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:H/I:L/A:N","engagement":"Q4-2024-External-Pentest"}'),

    -- Medium
    (v_org_id, 'Race condition in subscription upgrade allows free tier access',
     'CVE-2024-VAPT-009', 'medium', 6.5, 'open', 'vapt',
     'Simultaneous POST requests to /api/billing/upgrade can bypass subscription validation due to a TOCTOU race condition, granting enterprise features temporarily.',
     'Wrap subscription state transitions in a database transaction with row-level locking. Validate tier after lock acquisition.',
     '{"endpoint":"/api/billing/upgrade","cwe":"CWE-362","cvss_vector":"CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:L/I:H/A:N","engagement":"Q4-2024-External-Pentest"}'),

    (v_org_id, 'Sensitive PII returned in API error responses',
     'CVE-2024-VAPT-010', 'medium', 5.9, 'open', 'vapt',
     'Internal server errors return full stack traces and database query details including customer email addresses in the JSON error body.',
     'Implement a centralized error handler that returns generic messages in production. Log full errors server-side only.',
     '{"endpoint":"multiple","example_leak":{"sql":"SELECT * FROM users WHERE email=admin@acme.com","stack":"TypeError: Cannot read property..."},"cwe":"CWE-209","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:M/I:N/A:N","engagement":"Q4-2024-External-Pentest"}'),

    (v_org_id, 'GraphQL introspection enabled in production',
     'CVE-2024-VAPT-011', 'medium', 5.3, 'open', 'vapt',
     'The GraphQL API exposes the full schema via introspection queries in production, helping attackers map all available types, queries, and mutations.',
     'Disable GraphQL introspection in production builds. Use query depth limits and query complexity analysis.',
     '{"endpoint":"/graphql","query":"{ __schema { types { name } } }","cwe":"CWE-200","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:M/I:N/A:N","engagement":"Q4-2024-External-Pentest"}'),

    (v_org_id, 'Unrestricted file upload — executable files accepted',
     'CVE-2024-VAPT-012', 'medium', 5.5, 'in_progress', 'vapt',
     'The document upload endpoint accepts any file type including .php, .sh, and .exe files. No MIME type validation is performed.',
     'Whitelist allowed MIME types (PDF, PNG, JPG, DOCX). Validate both Content-Type header and file magic bytes. Store uploads outside web root.',
     '{"endpoint":"/api/documents/upload","accepted_types":"*/*","test_file":"shell.php","cwe":"CWE-434","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:M/A:N","engagement":"Q4-2024-External-Pentest"}'),

    (v_org_id, 'Missing CSRF protection on account settings endpoints',
     'CVE-2024-VAPT-013', 'medium', 5.4, 'open', 'vapt',
     'POST endpoints for changing email, password, and payment methods do not validate CSRF tokens, enabling cross-site request forgery attacks from malicious websites.',
     'Implement CSRF token validation using the Synchronizer Token Pattern or SameSite=Strict cookies.',
     '{"endpoints":["/api/account/email","/api/account/password","/api/billing/card"],"cwe":"CWE-352","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:M/A:N","engagement":"Q4-2024-External-Pentest"}'),

    (v_org_id, 'Open redirect via unvalidated redirect_uri parameter',
     'CVE-2024-VAPT-014', 'medium', 4.7, 'open', 'vapt',
     'The OAuth callback endpoint accepts any redirect_uri without validating against a registered allowlist, enabling phishing via redirect to attacker-controlled domains.',
     'Maintain a server-side allowlist of registered redirect URIs per OAuth client. Reject any URI not in the allowlist.',
     '{"endpoint":"/auth/callback","parameter":"redirect_uri","payload":"https://evil.com","cwe":"CWE-601","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N","engagement":"Q4-2024-External-Pentest"}'),

    -- Low
    (v_org_id, 'Admin panel accessible without additional authentication step',
     'CVE-2024-VAPT-015', 'low', 4.3, 'open', 'vapt',
     'The /admin panel is accessible to admin-role users using the same session token with no step-up authentication (re-auth or MFA challenge).',
     'Require re-authentication or MFA verification when accessing admin panel, even for existing sessions.',
     '{"endpoint":"/admin","cwe":"CWE-306","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:L/I:L/A:N","engagement":"Q4-2024-External-Pentest"}'),

    (v_org_id, 'Verbose server headers reveal application stack details',
     'CVE-2024-VAPT-016', 'low', 3.7, 'open', 'vapt',
     'HTTP responses include Server: Express/4.18.2, X-Powered-By: Node.js/18.19.0 headers that reveal framework and version information.',
     'Remove or mask Server and X-Powered-By headers. Use helmet.js: app.use(helmet.hidePoweredBy())',
     '{"headers":{"Server":"Express/4.18.2","X-Powered-By":"Node.js/18.19.0"},"cwe":"CWE-200","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N","engagement":"Q4-2024-External-Pentest"}'),

    (v_org_id, 'Missing security headers — no Content-Security-Policy',
     'CVE-2024-VAPT-017', 'low', 3.5, 'open', 'vapt',
     'The application does not set Content-Security-Policy, X-Frame-Options, or X-Content-Type-Options headers, increasing exposure to XSS and clickjacking.',
     'Add helmet.js middleware to set all recommended security headers. Define a strict CSP that disallows inline scripts.',
     '{"missing_headers":["Content-Security-Policy","X-Frame-Options","X-Content-Type-Options","Referrer-Policy"],"cwe":"CWE-693","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:N/A:N","engagement":"Q4-2024-External-Pentest"}'),

    -- Resolved
    (v_org_id, 'Subdomain takeover on staging.acmecorp.com — REMEDIATED',
     'CVE-2024-VAPT-018', 'high', 7.5, 'resolved', 'vapt',
     'staging.acmecorp.com CNAME pointed to an unclaimed Heroku app dyno, allowing subdomain takeover. Now resolved by removing stale DNS record.',
     'Audit all DNS CNAME records for dangling pointers. Automate DNS monitoring for takeover indicators.',
     '{"domain":"staging.acmecorp.com","cname_target":"acme-staging.herokuapp.com","remediation":"DNS record removed 2024-11-28","cwe":"CWE-350","cvss_vector":"CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N","engagement":"Q4-2024-External-Pentest"}')

  ;
  RAISE NOTICE 'VAPT vulnerabilities inserted.';
  ELSE
    RAISE NOTICE 'VAPT vulnerabilities already present — skipping.';
  END IF;

  -- ════════════════════════════════════════════════════════════
  -- CONTROL STATUS — enterprise distribution
  --   ~38% verified · ~22% in_progress · ~40% not_started
  -- Uses ON CONFLICT DO UPDATE so re-running resets to demo state.
  -- ════════════════════════════════════════════════════════════
  SELECT ARRAY_AGG(c.id ORDER BY c.id)
    INTO v_ctrl_ids
    FROM controls c
    JOIN org_frameworks of ON of.framework_id = c.framework_id
   WHERE of.org_id = v_org_id;

  IF v_ctrl_ids IS NULL THEN
    RAISE NOTICE 'No controls found — skipping control_status seeding.';
  ELSE
    v_ctrl_tot := array_length(v_ctrl_ids, 1);
    v_ctrl_idx := 0;

    FOREACH v_ctrl_id IN ARRAY v_ctrl_ids LOOP
      IF v_ctrl_idx < round(v_ctrl_tot * 0.38) THEN
        v_status := 'verified';
        v_ev_cnt := floor(random() * 4 + 1);   -- 1-4 evidence artifacts
      ELSIF v_ctrl_idx < round(v_ctrl_tot * 0.60) THEN
        v_status := 'in_progress';
        v_ev_cnt := floor(random() * 2);        -- 0-1 evidence artifacts
      ELSE
        v_status := 'not_started';
        v_ev_cnt := 0;
      END IF;

      INSERT INTO control_status (org_id, control_id, status, evidence_count, last_updated)
      VALUES (v_org_id, v_ctrl_id, v_status, v_ev_cnt,
              now() - (random() * interval '60 days'))
      ON CONFLICT (org_id, control_id) DO UPDATE
        SET status         = EXCLUDED.status,
            evidence_count = EXCLUDED.evidence_count,
            last_updated   = EXCLUDED.last_updated;

      v_ctrl_idx := v_ctrl_idx + 1;
    END LOOP;

    RAISE NOTICE 'Control status seeded: % total | % verified | % in_progress | % not_started',
      v_ctrl_tot,
      (SELECT COUNT(*) FROM control_status WHERE org_id = v_org_id AND status = 'verified'),
      (SELECT COUNT(*) FROM control_status WHERE org_id = v_org_id AND status = 'in_progress'),
      (SELECT COUNT(*) FROM control_status WHERE org_id = v_org_id AND status = 'not_started');
  END IF;

  RAISE NOTICE '------------------------------------------------------------';
  RAISE NOTICE 'AcmeCorp enterprise demo dataset loaded successfully.';
  RAISE NOTICE '  AWS account    : %', v_aws_acct;
  RAISE NOTICE '  GitHub install : %', v_gh_inst;
  RAISE NOTICE 'Refresh the dashboard to see all findings.';
  RAISE NOTICE '------------------------------------------------------------';
END;
$$;
