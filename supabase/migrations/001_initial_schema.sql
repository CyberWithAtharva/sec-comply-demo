-- ============================================================
-- SecComply: Initial Schema Migration
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ORGANIZATIONS (Tenants)
-- ============================================================
CREATE TABLE organizations (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        text NOT NULL,
    slug        text NOT NULL UNIQUE,
    plan        text NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
    logo_url    text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
    id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role            text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
    organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
    full_name       text,
    avatar_url      text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================
CREATE TABLE organization_members (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    org_id      uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role        text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member', 'viewer')),
    invited_by  uuid REFERENCES profiles(id),
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, org_id)
);

-- ============================================================
-- COMPLIANCE FRAMEWORKS
-- ============================================================
CREATE TABLE frameworks (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            text NOT NULL,
    version         text NOT NULL,
    description     text,
    controls_count  int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE controls (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id    uuid NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    control_id      text NOT NULL,       -- e.g. CC1.1, A.5.1
    domain          text NOT NULL,       -- e.g. Security, Availability
    category        text NOT NULL,       -- e.g. CC1: Control Environment
    title           text NOT NULL,
    description     text,
    type            text NOT NULL DEFAULT 'manual' CHECK (type IN ('automated', 'manual')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (framework_id, control_id)
);

CREATE TABLE org_frameworks (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    framework_id    uuid NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    assigned_by     uuid REFERENCES profiles(id),
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (org_id, framework_id)
);

CREATE TABLE control_status (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    control_id      uuid NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    status          text NOT NULL DEFAULT 'not_started' CHECK (status IN ('passed', 'failed', 'in_progress', 'not_started', 'na')),
    notes           text,
    last_updated    timestamptz NOT NULL DEFAULT now(),
    updated_by      uuid REFERENCES profiles(id),
    evidence_count  int NOT NULL DEFAULT 0,
    UNIQUE (org_id, control_id)
);

-- ============================================================
-- POLICIES
-- ============================================================
CREATE TABLE policies (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           text NOT NULL,
    version         text NOT NULL DEFAULT '1.0',
    status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'archived')),
    content         text,
    file_url        text,
    owner_id        uuid REFERENCES profiles(id),
    next_review     date,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE policy_acknowledgements (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id       uuid NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    acknowledged_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (policy_id, user_id)
);

CREATE TABLE policy_exceptions (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id       uuid NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    description     text NOT NULL,
    risk_level      text NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    approved_by     uuid REFERENCES profiles(id),
    expires_at      date,
    status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- RISK REGISTER
-- ============================================================
CREATE TABLE risks (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           text NOT NULL,
    category        text NOT NULL DEFAULT 'operational' CHECK (category IN ('operational', 'technical', 'compliance', 'financial', 'reputational', 'third_party')),
    description     text,
    likelihood      int NOT NULL DEFAULT 3 CHECK (likelihood BETWEEN 1 AND 5),
    impact          int NOT NULL DEFAULT 3 CHECK (impact BETWEEN 1 AND 5),
    risk_score      int GENERATED ALWAYS AS (likelihood * impact) STORED,
    status          text NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'assessed', 'mitigating', 'accepted', 'closed')),
    owner_id        uuid REFERENCES profiles(id),
    mitigation      text,
    due_date        date,
    source          text NOT NULL DEFAULT 'manual' CHECK (source IN ('aws', 'github', 'vapt', 'manual')),
    source_ref      text,   -- external ID from AWS finding / GitHub alert / VAPT finding
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- VENDORS / TPRM
-- ============================================================
CREATE TABLE vendors (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            text NOT NULL,
    tier            int NOT NULL DEFAULT 2 CHECK (tier BETWEEN 1 AND 3),
    risk_level      text NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
    contact_name    text,
    contact_email   text,
    website         text,
    status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'under_review', 'offboarded')),
    last_assessment date,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE vendor_assessments (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id       uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    type            text NOT NULL DEFAULT 'security_questionnaire' CHECK (type IN ('security_questionnaire', 'soc2', 'iso27001', 'pen_test', 'on_site')),
    status          text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'in_progress', 'completed', 'overdue')),
    due_date        date,
    completed_date  date,
    score           int CHECK (score BETWEEN 0 AND 100),
    assessor_id     uuid REFERENCES profiles(id),
    notes           text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- QUESTIONNAIRES
-- ============================================================
CREATE TABLE questionnaires (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           text NOT NULL,
    vendor_id       uuid REFERENCES vendors(id) ON DELETE SET NULL,
    sections        jsonb NOT NULL DEFAULT '[]',
    status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'in_progress', 'completed', 'archived')),
    token           text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    created_by      uuid REFERENCES profiles(id),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE questionnaire_responses (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    questionnaire_id    uuid NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
    respondent_name     text,
    respondent_email    text,
    responses           jsonb NOT NULL DEFAULT '{}',
    submitted_at        timestamptz,
    status              text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'reviewed'))
);

-- ============================================================
-- VAPT TRACKER
-- ============================================================
CREATE TABLE vapt_reports (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           text NOT NULL,
    conducted_by    text,
    report_date     date,
    scope           text,
    file_url        text,
    finding_count   int NOT NULL DEFAULT 0,
    status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_by      uuid REFERENCES profiles(id),
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE vulnerabilities (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vapt_report_id  uuid REFERENCES vapt_reports(id) ON DELETE SET NULL,
    title           text NOT NULL,
    cve_id          text,
    severity        text NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low', 'informational')),
    cvss_score      numeric(3,1) CHECK (cvss_score BETWEEN 0 AND 10),
    status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'accepted')),
    asset_id        uuid,   -- FK to assets added after assets table
    source          text NOT NULL DEFAULT 'vapt' CHECK (source IN ('vapt', 'aws', 'github', 'manual')),
    description     text,
    remediation     text,
    assignee_id     uuid REFERENCES profiles(id),
    due_date        date,
    details         jsonb DEFAULT '{}',
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ASSETS
-- ============================================================
CREATE TABLE assets (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            text NOT NULL,
    type            text NOT NULL,      -- ec2, rds, s3, lambda, server, workstation, etc.
    provider        text NOT NULL DEFAULT 'manual' CHECK (provider IN ('aws', 'github', 'manual')),
    external_id     text,               -- AWS ARN, GitHub repo ID, etc.
    region          text,
    ip_address      text,
    tags            jsonb DEFAULT '{}',
    metadata        jsonb DEFAULT '{}',
    criticality     text NOT NULL DEFAULT 'medium' CHECK (criticality IN ('critical', 'high', 'medium', 'low')),
    last_seen       timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (org_id, provider, external_id)
);

-- Add FK from vulnerabilities to assets now that assets table exists
ALTER TABLE vulnerabilities ADD CONSTRAINT vulnerabilities_asset_id_fkey
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL;

-- ============================================================
-- EVIDENCE
-- ============================================================
CREATE TABLE evidence_artifacts (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    control_id      uuid REFERENCES controls(id) ON DELETE SET NULL,
    name            text NOT NULL,
    description     text,
    file_url        text,
    file_type       text,
    file_size       bigint,
    uploaded_by     uuid REFERENCES profiles(id),
    status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'stale', 'archived')),
    expires_at      date,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- AWS INTEGRATION
-- ============================================================
CREATE TABLE aws_accounts (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id      text NOT NULL,
    account_alias   text,
    role_arn        text NOT NULL,
    external_id     text NOT NULL,
    regions         text[] NOT NULL DEFAULT ARRAY['us-east-1'],
    last_scan       timestamptz,
    status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error', 'disconnected')),
    error_message   text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (org_id, account_id)
);

CREATE TABLE aws_findings (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    aws_account_id      uuid NOT NULL REFERENCES aws_accounts(id) ON DELETE CASCADE,
    rule_id             text NOT NULL,
    title               text NOT NULL,
    resource_arn        text,
    resource_type       text,
    resource_id         text,
    severity            text NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL')),
    status              text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED', 'SUPPRESSED')),
    details             jsonb DEFAULT '{}',
    first_seen          timestamptz NOT NULL DEFAULT now(),
    last_seen           timestamptz NOT NULL DEFAULT now(),
    UNIQUE (aws_account_id, rule_id, resource_arn)
);

-- ============================================================
-- GITHUB INTEGRATION
-- ============================================================
CREATE TABLE github_installations (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id              uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    installation_id     bigint NOT NULL UNIQUE,
    github_org          text NOT NULL,
    last_sync           timestamptz,
    status              text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'error')),
    error_message       text,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE github_repos (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    installation_id     uuid NOT NULL REFERENCES github_installations(id) ON DELETE CASCADE,
    repo_name           text NOT NULL,
    repo_id             bigint NOT NULL,
    private             bool NOT NULL DEFAULT true,
    default_branch      text NOT NULL DEFAULT 'main',
    settings            jsonb DEFAULT '{}',     -- branch protection, required reviews, etc.
    compliance_issues   jsonb DEFAULT '[]',     -- list of compliance gaps
    updated_at          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (installation_id, repo_id)
);

CREATE TABLE github_findings (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    installation_id     uuid NOT NULL REFERENCES github_installations(id) ON DELETE CASCADE,
    type                text NOT NULL CHECK (type IN ('secret', 'code_scan', 'dependabot')),
    severity            text NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    repository          text NOT NULL,
    title               text NOT NULL,
    details             jsonb DEFAULT '{}',
    state               text NOT NULL DEFAULT 'open' CHECK (state IN ('open', 'resolved', 'dismissed', 'auto_dismissed')),
    external_id         text,       -- GitHub alert number/ID
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (installation_id, type, external_id)
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          uuid REFERENCES organizations(id) ON DELETE SET NULL,
    user_id         uuid REFERENCES profiles(id) ON DELETE SET NULL,
    action          text NOT NULL,          -- e.g. 'policy.created', 'vendor.updated'
    resource_type   text,
    resource_id     uuid,
    metadata        jsonb DEFAULT '{}',
    ip_address      inet,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_organization_members_user ON organization_members(user_id);
CREATE INDEX idx_organization_members_org ON organization_members(org_id);
CREATE INDEX idx_control_status_org ON control_status(org_id);
CREATE INDEX idx_control_status_control ON control_status(control_id);
CREATE INDEX idx_policies_org ON policies(org_id);
CREATE INDEX idx_risks_org ON risks(org_id);
CREATE INDEX idx_risks_score ON risks(risk_score DESC);
CREATE INDEX idx_vendors_org ON vendors(org_id);
CREATE INDEX idx_vulnerabilities_org ON vulnerabilities(org_id);
CREATE INDEX idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX idx_assets_org ON assets(org_id);
CREATE INDEX idx_aws_findings_account ON aws_findings(aws_account_id);
CREATE INDEX idx_aws_findings_severity ON aws_findings(severity);
CREATE INDEX idx_github_findings_install ON github_findings(installation_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_policies_updated BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_risks_updated BEFORE UPDATE ON risks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vendors_updated BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_questionnaires_updated BEFORE UPDATE ON questionnaires FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vulnerabilities_updated BEFORE UPDATE ON vulnerabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
