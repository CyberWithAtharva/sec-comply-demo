-- ============================================================
-- SecComply: Row Level Security Policies
-- ============================================================

-- Helper function: check if current user is a SecComply admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get current user's org_id
CREATE OR REPLACE FUNCTION my_org_id()
RETURNS uuid AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if user is a member of a given org
CREATE OR REPLACE FUNCTION is_org_member(p_org_id uuid)
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid() AND org_id = p_org_id
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vapt_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE aws_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE aws_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE POLICY "org_select" ON organizations FOR SELECT USING (
    is_admin() OR is_org_member(id)
);
CREATE POLICY "org_insert_admin" ON organizations FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "org_update_admin" ON organizations FOR UPDATE USING (is_admin());
CREATE POLICY "org_delete_admin" ON organizations FOR DELETE USING (is_admin());

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "profile_select_own_org" ON profiles FOR SELECT USING (
    is_admin() OR organization_id = my_org_id() OR id = auth.uid()
);
CREATE POLICY "profile_update_own" ON profiles FOR UPDATE USING (id = auth.uid() OR is_admin());

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================
CREATE POLICY "members_select" ON organization_members FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "members_insert_admin" ON organization_members FOR INSERT WITH CHECK (
    is_admin() OR EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.user_id = auth.uid() AND om.org_id = org_id AND om.role = 'owner'
    )
);
CREATE POLICY "members_delete_admin" ON organization_members FOR DELETE USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.user_id = auth.uid() AND om.org_id = org_id AND om.role = 'owner'
    )
);

-- ============================================================
-- FRAMEWORKS & CONTROLS (global read, admin write)
-- ============================================================
CREATE POLICY "frameworks_select_all" ON frameworks FOR SELECT USING (true);
CREATE POLICY "frameworks_write_admin" ON frameworks FOR ALL USING (is_admin());

CREATE POLICY "controls_select_all" ON controls FOR SELECT USING (true);
CREATE POLICY "controls_write_admin" ON controls FOR ALL USING (is_admin());

-- ============================================================
-- ORG FRAMEWORKS
-- ============================================================
CREATE POLICY "org_frameworks_select" ON org_frameworks FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "org_frameworks_write_admin" ON org_frameworks FOR ALL USING (is_admin());

-- ============================================================
-- CONTROL STATUS
-- ============================================================
CREATE POLICY "control_status_select" ON control_status FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "control_status_write" ON control_status FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

-- ============================================================
-- POLICIES
-- ============================================================
CREATE POLICY "policies_select" ON policies FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "policies_write" ON policies FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

CREATE POLICY "policy_ack_select" ON policy_acknowledgements FOR SELECT USING (
    is_admin() OR user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM policies p WHERE p.id = policy_id AND p.org_id = my_org_id()
    )
);
CREATE POLICY "policy_ack_insert" ON policy_acknowledgements FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY "policy_exc_select" ON policy_exceptions FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "policy_exc_write" ON policy_exceptions FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

-- ============================================================
-- RISKS
-- ============================================================
CREATE POLICY "risks_select" ON risks FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "risks_write" ON risks FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

-- ============================================================
-- VENDORS
-- ============================================================
CREATE POLICY "vendors_select" ON vendors FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "vendors_write" ON vendors FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

CREATE POLICY "vendor_assessments_select" ON vendor_assessments FOR SELECT USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM vendors v WHERE v.id = vendor_id AND v.org_id = my_org_id()
    )
);
CREATE POLICY "vendor_assessments_write" ON vendor_assessments FOR ALL USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM vendors v WHERE v.id = vendor_id AND v.org_id = my_org_id()
    )
);

-- ============================================================
-- QUESTIONNAIRES
-- ============================================================
CREATE POLICY "questionnaires_select" ON questionnaires FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "questionnaires_write" ON questionnaires FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

-- Public token-based access for questionnaire responses (vendors fill without login)
CREATE POLICY "questionnaire_responses_select" ON questionnaire_responses FOR SELECT USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM questionnaires q WHERE q.id = questionnaire_id AND q.org_id = my_org_id()
    )
);
CREATE POLICY "questionnaire_responses_insert_public" ON questionnaire_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "questionnaire_responses_update_own" ON questionnaire_responses FOR UPDATE USING (true);

-- ============================================================
-- VAPT REPORTS & VULNERABILITIES
-- ============================================================
CREATE POLICY "vapt_reports_select" ON vapt_reports FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "vapt_reports_write" ON vapt_reports FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

CREATE POLICY "vulnerabilities_select" ON vulnerabilities FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "vulnerabilities_write" ON vulnerabilities FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

-- ============================================================
-- ASSETS
-- ============================================================
CREATE POLICY "assets_select" ON assets FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "assets_write" ON assets FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

-- ============================================================
-- EVIDENCE
-- ============================================================
CREATE POLICY "evidence_select" ON evidence_artifacts FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "evidence_write" ON evidence_artifacts FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

-- ============================================================
-- AWS INTEGRATION
-- ============================================================
CREATE POLICY "aws_accounts_select" ON aws_accounts FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "aws_accounts_write" ON aws_accounts FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

CREATE POLICY "aws_findings_select" ON aws_findings FOR SELECT USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM aws_accounts a WHERE a.id = aws_account_id AND a.org_id = my_org_id()
    )
);
CREATE POLICY "aws_findings_write" ON aws_findings FOR ALL USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM aws_accounts a WHERE a.id = aws_account_id AND a.org_id = my_org_id()
    )
);

-- ============================================================
-- GITHUB INTEGRATION
-- ============================================================
CREATE POLICY "github_installs_select" ON github_installations FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "github_installs_write" ON github_installations FOR ALL USING (
    is_admin() OR org_id = my_org_id()
);

CREATE POLICY "github_repos_select" ON github_repos FOR SELECT USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM github_installations gi
        WHERE gi.id = github_repos.installation_id AND gi.org_id = my_org_id()
    )
);
CREATE POLICY "github_repos_write" ON github_repos FOR ALL USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM github_installations gi
        WHERE gi.id = github_repos.installation_id AND gi.org_id = my_org_id()
    )
);

CREATE POLICY "github_findings_select" ON github_findings FOR SELECT USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM github_installations gi
        WHERE gi.id = github_findings.installation_id AND gi.org_id = my_org_id()
    )
);
CREATE POLICY "github_findings_write" ON github_findings FOR ALL USING (
    is_admin() OR EXISTS (
        SELECT 1 FROM github_installations gi
        WHERE gi.id = github_findings.installation_id AND gi.org_id = my_org_id()
    )
);

-- ============================================================
-- AUDIT LOGS (insert-only for non-admins)
-- ============================================================
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT USING (
    is_admin() OR org_id = my_org_id()
);
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (
    is_admin() OR org_id = my_org_id()
);
