

-- ============================================================
-- SecComply: Policy Management v2
-- ============================================================
-- Extends the policies module per the Policy Management Feature
-- Doc: variables, version history, framework-control mapping,
-- magic-link acknowledgement, org branding.
--
-- Additive only. Existing policies rows keep working.
-- ============================================================

-- ------------------------------------------------------------
-- policies: extend with template metadata
-- ------------------------------------------------------------
ALTER TABLE policies
    ADD COLUMN IF NOT EXISTS code            text UNIQUE,
    ADD COLUMN IF NOT EXISTS category        text,
    ADD COLUMN IF NOT EXISTS policy_type     text DEFAULT 'Policy',
    ADD COLUMN IF NOT EXISTS description     text,
    ADD COLUMN IF NOT EXISTS frameworks_list text[] DEFAULT '{}'::text[];

-- Widen the status check to include the v2 lifecycle.
-- We preserve the original values so any existing rows remain valid.
ALTER TABLE policies DROP CONSTRAINT IF EXISTS policies_status_check;
ALTER TABLE policies ADD CONSTRAINT policies_status_check
    CHECK (status IN ('draft', 'under_review', 'approved', 'archived',
                      'in_review', 'active', 'superseded'));

CREATE INDEX IF NOT EXISTS policies_category_idx        ON policies (category);
CREATE INDEX IF NOT EXISTS policies_frameworks_list_idx ON policies USING GIN (frameworks_list);

-- ------------------------------------------------------------
-- policy_versions: immutable version history + in-flight drafts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_versions (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id       uuid NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    version         text NOT NULL,                  -- e.g. v1.0, v1.2, v2.0
    status          text NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'in_review', 'active', 'superseded')),
    content         text,                           -- snapshot at approval (rich text / markdown)
    classification  text CHECK (classification IN ('auto', 'minor', 'major') OR classification IS NULL),
    summary         text,                           -- change summary or rejection comment
    created_by      uuid REFERENCES profiles(id),
    created_at      timestamptz NOT NULL DEFAULT now(),
    approved_by     uuid REFERENCES profiles(id),
    approved_at     timestamptz,
    UNIQUE (policy_id, version)
);

CREATE INDEX IF NOT EXISTS policy_versions_policy_idx ON policy_versions (policy_id, status);

ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS policy_versions_select ON policy_versions;
CREATE POLICY policy_versions_select ON policy_versions FOR SELECT USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM policies p WHERE p.id = policy_id AND p.org_id = my_org_id()
    )
);

DROP POLICY IF EXISTS policy_versions_write ON policy_versions;
CREATE POLICY policy_versions_write ON policy_versions FOR ALL USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM policies p WHERE p.id = policy_id AND p.org_id = my_org_id()
    )
);

-- ------------------------------------------------------------
-- policy_framework_controls: clauses satisfied per policy
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_framework_controls (
    id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id     uuid NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    framework     text NOT NULL,            -- slug: iso, soc2, hipaa, gdpr, dpdp
    control_code  text NOT NULL,            -- e.g. A.5.1, CC1.1, §164.308(a)(1)
    description   text,
    created_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (policy_id, framework, control_code)
);

CREATE INDEX IF NOT EXISTS pfc_policy_idx ON policy_framework_controls (policy_id);

ALTER TABLE policy_framework_controls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pfc_select ON policy_framework_controls;
CREATE POLICY pfc_select ON policy_framework_controls FOR SELECT USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM policies p WHERE p.id = policy_id AND p.org_id = my_org_id()
    )
);

DROP POLICY IF EXISTS pfc_write ON policy_framework_controls;
CREATE POLICY pfc_write ON policy_framework_controls FOR ALL USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM policies p WHERE p.id = policy_id AND p.org_id = my_org_id()
    )
);

-- ------------------------------------------------------------
-- policy_variable_definitions: global catalog of variables
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_variable_definitions (
    id              text PRIMARY KEY,                  -- the placeholder key, e.g. [Organisation_Name]
    group_id        text NOT NULL CHECK (group_id IN ('org', 'people', 'tools', 'thresholds', 'recovery')),
    group_label     text NOT NULL,
    group_icon      text,
    question        text NOT NULL,
    input_type      text NOT NULL DEFAULT 'text' CHECK (input_type IN ('text', 'number', 'dropdown', 'date')),
    default_value   text,
    required        boolean NOT NULL DEFAULT false,
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE policy_variable_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pvd_select ON policy_variable_definitions;
CREATE POLICY pvd_select ON policy_variable_definitions FOR SELECT USING (true);

DROP POLICY IF EXISTS pvd_write_admin ON policy_variable_definitions;
CREATE POLICY pvd_write_admin ON policy_variable_definitions FOR ALL USING (is_admin());

-- ------------------------------------------------------------
-- org_policy_variables: per-org variable values
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_policy_variables (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    var_key         text NOT NULL REFERENCES policy_variable_definitions(id) ON DELETE CASCADE,
    value           text,
    updated_by      uuid REFERENCES profiles(id),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (org_id, var_key)
);

CREATE INDEX IF NOT EXISTS opv_org_idx ON org_policy_variables (org_id);

ALTER TABLE org_policy_variables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS opv_select ON org_policy_variables;
CREATE POLICY opv_select ON org_policy_variables FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);

DROP POLICY IF EXISTS opv_write ON org_policy_variables;
CREATE POLICY opv_write ON org_policy_variables FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

-- ------------------------------------------------------------
-- org_branding: logo, display name, accent
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_branding (
    org_id          uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    display_name    text,
    logo_url        text,
    accent_color    text DEFAULT '#f97316',
    updated_by      uuid REFERENCES profiles(id),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE org_branding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS branding_select ON org_branding;
CREATE POLICY branding_select ON org_branding FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);

DROP POLICY IF EXISTS branding_write ON org_branding;
CREATE POLICY branding_write ON org_branding FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

-- ------------------------------------------------------------
-- policy_ack_recipients: magic-link acknowledgement table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_ack_recipients (
    id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id             uuid NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    version_id            uuid REFERENCES policy_versions(id) ON DELETE SET NULL,
    policy_version_label  text,                       -- denormalised, e.g. "v1.2"
    email                 text NOT NULL,
    name                  text,                       -- name from upload list
    token                 text NOT NULL UNIQUE,
    status                text NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'acknowledged', 'expired')),
    submitted_name        text,                       -- name typed by employee on the portal
    match_status          text CHECK (match_status IN ('matched', 'unverified') OR match_status IS NULL),
    ip_address            inet,
    user_agent            text,
    sent_by               uuid REFERENCES profiles(id),
    expires_at            timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
    acknowledged_at       timestamptz,
    created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS par_token_idx        ON policy_ack_recipients (token);
CREATE INDEX IF NOT EXISTS par_policy_idx       ON policy_ack_recipients (policy_id, status);
CREATE INDEX IF NOT EXISTS par_version_idx      ON policy_ack_recipients (version_id);

ALTER TABLE policy_ack_recipients ENABLE ROW LEVEL SECURITY;

-- Owners (org members) can see and manage their own org's recipients.
DROP POLICY IF EXISTS par_org_select ON policy_ack_recipients;
CREATE POLICY par_org_select ON policy_ack_recipients FOR SELECT USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM policies p WHERE p.id = policy_id AND p.org_id = my_org_id()
    )
);

DROP POLICY IF EXISTS par_org_write ON policy_ack_recipients;
CREATE POLICY par_org_write ON policy_ack_recipients FOR ALL USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM policies p WHERE p.id = policy_id AND p.org_id = my_org_id()
    )
);

-- Note: the public magic-link API route uses the service role to read/update
-- by exact token match — no anon-readable policy is needed.

-- ------------------------------------------------------------
-- policy_acknowledgements: backwards-compatible additions
-- ------------------------------------------------------------
-- The original policy_acknowledgements table requires user_id NOT NULL and
-- is keyed (policy_id, user_id). We leave it alone for the existing in-app
-- "Acknowledge" button; the new magic-link flow uses policy_ack_recipients
-- as its source of truth.
