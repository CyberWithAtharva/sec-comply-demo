export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: { id: string; name: string; slug: string; plan: string; logo_url: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; slug: string; plan?: string; logo_url?: string | null };
        Update: { name?: string; slug?: string; plan?: string; logo_url?: string | null };
        Relationships: [];
      };
      profiles: {
        Row: { id: string; role: 'admin' | 'client'; organization_id: string | null; full_name: string | null; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: { id: string; role?: 'admin' | 'client'; organization_id?: string | null; full_name?: string | null; avatar_url?: string | null };
        Update: { role?: 'admin' | 'client'; organization_id?: string | null; full_name?: string | null; avatar_url?: string | null };
        Relationships: [
          { foreignKeyName: "profiles_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }
        ];
      };
      organization_members: {
        Row: { id: string; user_id: string; org_id: string; role: 'owner' | 'member' | 'viewer'; invited_by: string | null; created_at: string };
        Insert: { id?: string; user_id: string; org_id: string; role?: 'owner' | 'member' | 'viewer'; invited_by?: string | null };
        Update: { role?: 'owner' | 'member' | 'viewer' };
        Relationships: [
          { foreignKeyName: "organization_members_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
          { foreignKeyName: "organization_members_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      frameworks: {
        Row: { id: string; name: string; version: string; description: string | null; controls_count: number; created_at: string };
        Insert: { id?: string; name: string; version: string; description?: string | null; controls_count?: number };
        Update: { name?: string; version?: string; description?: string | null; controls_count?: number };
        Relationships: [];
      };
      controls: {
        Row: { id: string; framework_id: string; control_id: string; domain: string; category: string; title: string; description: string | null; type: 'automated' | 'manual'; created_at: string };
        Insert: { id?: string; framework_id: string; control_id: string; domain: string; category: string; title: string; description?: string | null; type?: 'automated' | 'manual' };
        Update: { domain?: string; category?: string; title?: string; description?: string | null; type?: 'automated' | 'manual' };
        Relationships: [
          { foreignKeyName: "controls_framework_id_fkey"; columns: ["framework_id"]; isOneToOne: false; referencedRelation: "frameworks"; referencedColumns: ["id"] }
        ];
      };
      org_frameworks: {
        Row: { id: string; org_id: string; framework_id: string; status: string; assigned_by: string | null; created_at: string };
        Insert: { id?: string; org_id: string; framework_id: string; status?: string; assigned_by?: string | null };
        Update: { status?: string };
        Relationships: [
          { foreignKeyName: "org_frameworks_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
          { foreignKeyName: "org_frameworks_framework_id_fkey"; columns: ["framework_id"]; isOneToOne: false; referencedRelation: "frameworks"; referencedColumns: ["id"] }
        ];
      };
      control_status: {
        Row: { id: string; org_id: string; control_id: string; status: 'verified' | 'in_progress' | 'not_started' | 'not_applicable'; notes: string | null; last_updated: string; updated_by: string | null; evidence_count: number };
        Insert: { id?: string; org_id: string; control_id: string; status?: 'verified' | 'in_progress' | 'not_started' | 'not_applicable'; notes?: string | null; updated_by?: string | null };
        Update: { status?: 'verified' | 'in_progress' | 'not_started' | 'not_applicable'; notes?: string | null; evidence_count?: number };
        Relationships: [
          { foreignKeyName: "control_status_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
          { foreignKeyName: "control_status_control_id_fkey"; columns: ["control_id"]; isOneToOne: false; referencedRelation: "controls"; referencedColumns: ["id"] }
        ];
      };
      policies: {
        Row: { id: string; org_id: string; title: string; version: string; status: 'draft' | 'under_review' | 'approved' | 'archived'; content: string | null; file_url: string | null; owner_id: string | null; next_review: string | null; framework_id: string | null; is_generated: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; org_id: string; title: string; version?: string; status?: 'draft' | 'under_review' | 'approved' | 'archived'; content?: string | null; file_url?: string | null; owner_id?: string | null; next_review?: string | null; framework_id?: string | null; is_generated?: boolean };
        Update: { title?: string; version?: string; status?: 'draft' | 'under_review' | 'approved' | 'archived'; content?: string | null; file_url?: string | null; owner_id?: string | null; next_review?: string | null; framework_id?: string | null };
        Relationships: [
          { foreignKeyName: "policies_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
          { foreignKeyName: "policies_owner_id_fkey"; columns: ["owner_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "policies_framework_id_fkey"; columns: ["framework_id"]; isOneToOne: false; referencedRelation: "frameworks"; referencedColumns: ["id"] }
        ];
      };
      policy_controls: {
        Row: { id: string; policy_id: string; control_id: string; created_at: string };
        Insert: { id?: string; policy_id: string; control_id: string };
        Update: Record<string, never>;
        Relationships: [
          { foreignKeyName: "policy_controls_policy_id_fkey"; columns: ["policy_id"]; isOneToOne: false; referencedRelation: "policies"; referencedColumns: ["id"] },
          { foreignKeyName: "policy_controls_control_id_fkey"; columns: ["control_id"]; isOneToOne: false; referencedRelation: "controls"; referencedColumns: ["id"] }
        ];
      };
      policy_acknowledgements: {
        Row: { id: string; policy_id: string; user_id: string; acknowledged_at: string };
        Insert: { id?: string; policy_id: string; user_id: string };
        Update: { acknowledged_at?: string };
        Relationships: [
          { foreignKeyName: "policy_acknowledgements_policy_id_fkey"; columns: ["policy_id"]; isOneToOne: false; referencedRelation: "policies"; referencedColumns: ["id"] }
        ];
      };
      policy_exceptions: {
        Row: { id: string; policy_id: string; org_id: string; description: string; risk_level: 'low' | 'medium' | 'high' | 'critical'; approved_by: string | null; expires_at: string | null; status: 'pending' | 'approved' | 'rejected' | 'expired'; created_at: string };
        Insert: { id?: string; policy_id: string; org_id: string; description: string; risk_level?: 'low' | 'medium' | 'high' | 'critical'; approved_by?: string | null; expires_at?: string | null; status?: 'pending' | 'approved' | 'rejected' | 'expired' };
        Update: { status?: 'pending' | 'approved' | 'rejected' | 'expired'; approved_by?: string | null };
        Relationships: [
          { foreignKeyName: "policy_exceptions_policy_id_fkey"; columns: ["policy_id"]; isOneToOne: false; referencedRelation: "policies"; referencedColumns: ["id"] }
        ];
      };
      risks: {
        Row: { id: string; org_id: string; title: string; category: string; description: string | null; likelihood: number; impact: number; risk_score: number; status: string; owner_id: string | null; mitigation: string | null; due_date: string | null; source: string; source_ref: string | null; control_id: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; org_id: string; title: string; category?: string; description?: string | null; likelihood?: number; impact?: number; status?: string; owner_id?: string | null; mitigation?: string | null; due_date?: string | null; source?: string; source_ref?: string | null; control_id?: string | null };
        Update: { title?: string; category?: string; description?: string | null; likelihood?: number; impact?: number; status?: string; owner_id?: string | null; mitigation?: string | null; due_date?: string | null; control_id?: string | null };
        Relationships: [
          { foreignKeyName: "risks_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
          { foreignKeyName: "risks_owner_id_fkey"; columns: ["owner_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "risks_control_id_fkey"; columns: ["control_id"]; isOneToOne: false; referencedRelation: "controls"; referencedColumns: ["id"] }
        ];
      };
      vendors: {
        Row: { id: string; org_id: string; name: string; tier: number; risk_level: string; contact_name: string | null; contact_email: string | null; website: string | null; status: string; last_assessment: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; org_id: string; name: string; tier?: number; risk_level?: string; contact_name?: string | null; contact_email?: string | null; website?: string | null; status?: string };
        Update: { name?: string; tier?: number; risk_level?: string; contact_name?: string | null; contact_email?: string | null; website?: string | null; status?: string; last_assessment?: string | null };
        Relationships: [
          { foreignKeyName: "vendors_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }
        ];
      };
      vendor_assessments: {
        Row: { id: string; vendor_id: string; type: string; status: string; due_date: string | null; completed_date: string | null; score: number | null; assessor_id: string | null; notes: string | null; created_at: string };
        Insert: { id?: string; vendor_id: string; type?: string; status?: string; due_date?: string | null; assessor_id?: string | null; notes?: string | null };
        Update: { status?: string; completed_date?: string | null; score?: number | null; notes?: string | null };
        Relationships: [
          { foreignKeyName: "vendor_assessments_vendor_id_fkey"; columns: ["vendor_id"]; isOneToOne: false; referencedRelation: "vendors"; referencedColumns: ["id"] }
        ];
      };
      questionnaires: {
        Row: { id: string; org_id: string; title: string; vendor_id: string | null; sections: Json; status: string; token: string; created_by: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; org_id: string; title: string; vendor_id?: string | null; sections?: Json; status?: string; created_by?: string | null };
        Update: { title?: string; sections?: Json; status?: string };
        Relationships: [
          { foreignKeyName: "questionnaires_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }
        ];
      };
      questionnaire_responses: {
        Row: { id: string; questionnaire_id: string; respondent_name: string | null; respondent_email: string | null; responses: Json; submitted_at: string | null; status: string };
        Insert: { id?: string; questionnaire_id: string; respondent_name?: string | null; respondent_email?: string | null; responses?: Json; status?: string };
        Update: { responses?: Json; submitted_at?: string | null; status?: string };
        Relationships: [
          { foreignKeyName: "questionnaire_responses_questionnaire_id_fkey"; columns: ["questionnaire_id"]; isOneToOne: false; referencedRelation: "questionnaires"; referencedColumns: ["id"] }
        ];
      };
      vapt_reports: {
        Row: { id: string; org_id: string; title: string; conducted_by: string | null; report_date: string | null; scope: string | null; file_url: string | null; finding_count: number; status: string; created_by: string | null; created_at: string };
        Insert: { id?: string; org_id: string; title: string; conducted_by?: string | null; report_date?: string | null; scope?: string | null; file_url?: string | null; created_by?: string | null };
        Update: { title?: string; conducted_by?: string | null; report_date?: string | null; scope?: string | null; file_url?: string | null; finding_count?: number; status?: string };
        Relationships: [
          { foreignKeyName: "vapt_reports_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }
        ];
      };
      vulnerabilities: {
        Row: { id: string; org_id: string; vapt_report_id: string | null; title: string; cve_id: string | null; severity: string; cvss_score: number | null; status: string; asset_id: string | null; source: string; description: string | null; remediation: string | null; assignee_id: string | null; due_date: string | null; details: Json; created_at: string; updated_at: string };
        Insert: { id?: string; org_id: string; vapt_report_id?: string | null; title: string; cve_id?: string | null; severity?: string; cvss_score?: number | null; status?: string; asset_id?: string | null; source?: string; description?: string | null; remediation?: string | null; assignee_id?: string | null; due_date?: string | null; details?: Json };
        Update: { title?: string; severity?: string; cvss_score?: number | null; status?: string; asset_id?: string | null; description?: string | null; remediation?: string | null; assignee_id?: string | null; due_date?: string | null };
        Relationships: [
          { foreignKeyName: "vulnerabilities_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
          { foreignKeyName: "vulnerabilities_assignee_id_fkey"; columns: ["assignee_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      assets: {
        Row: { id: string; org_id: string; name: string; type: string; provider: string; external_id: string | null; region: string | null; ip_address: string | null; tags: Json; metadata: Json; criticality: string; last_seen: string | null; created_at: string };
        Insert: { id?: string; org_id: string; name: string; type: string; provider?: string; external_id?: string | null; region?: string | null; ip_address?: string | null; tags?: Json; metadata?: Json; criticality?: string };
        Update: { name?: string; type?: string; external_id?: string | null; region?: string | null; ip_address?: string | null; tags?: Json; metadata?: Json; criticality?: string; last_seen?: string | null };
        Relationships: [
          { foreignKeyName: "assets_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }
        ];
      };
      evidence_artifacts: {
        Row: { id: string; org_id: string; control_id: string | null; name: string; description: string | null; file_url: string | null; file_type: string | null; file_size: number | null; uploaded_by: string | null; status: string; expires_at: string | null; created_at: string };
        Insert: { id?: string; org_id: string; control_id?: string | null; name: string; description?: string | null; file_url?: string | null; file_type?: string | null; file_size?: number | null; uploaded_by?: string | null; status?: string; expires_at?: string | null };
        Update: { control_id?: string | null; name?: string; description?: string | null; status?: string; expires_at?: string | null };
        Relationships: [
          { foreignKeyName: "evidence_artifacts_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
          { foreignKeyName: "evidence_artifacts_uploaded_by_fkey"; columns: ["uploaded_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      aws_accounts: {
        Row: { id: string; org_id: string; account_id: string; account_alias: string | null; role_arn: string; external_id: string; regions: string[]; last_scan: string | null; status: string; error_message: string | null; created_at: string };
        Insert: { id?: string; org_id: string; account_id: string; account_alias?: string | null; role_arn: string; external_id: string; regions?: string[] };
        Update: { account_alias?: string | null; role_arn?: string; regions?: string[]; last_scan?: string | null; status?: string; error_message?: string | null };
        Relationships: [
          { foreignKeyName: "aws_accounts_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }
        ];
      };
      aws_findings: {
        Row: { id: string; aws_account_id: string; rule_id: string; title: string; resource_arn: string | null; resource_type: string | null; resource_id: string | null; severity: string; status: string; details: Json; first_seen: string; last_seen: string };
        Insert: { id?: string; aws_account_id: string; rule_id: string; title: string; resource_arn?: string | null; resource_type?: string | null; resource_id?: string | null; severity: string; status?: string; details?: Json };
        Update: { status?: string; last_seen?: string; details?: Json };
        Relationships: [
          { foreignKeyName: "aws_findings_aws_account_id_fkey"; columns: ["aws_account_id"]; isOneToOne: false; referencedRelation: "aws_accounts"; referencedColumns: ["id"] }
        ];
      };
      github_installations: {
        Row: { id: string; org_id: string; installation_id: number; github_org: string; last_sync: string | null; status: string; error_message: string | null; created_at: string };
        Insert: { id?: string; org_id: string; installation_id: number; github_org: string };
        Update: { last_sync?: string | null; status?: string; error_message?: string | null };
        Relationships: [
          { foreignKeyName: "github_installations_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }
        ];
      };
      github_repos: {
        Row: { id: string; installation_id: string; repo_name: string; repo_id: number; private: boolean; default_branch: string; settings: Json; compliance_issues: Json; updated_at: string };
        Insert: { id?: string; installation_id: string; repo_name: string; repo_id: number; private?: boolean; default_branch?: string; settings?: Json; compliance_issues?: Json };
        Update: { repo_name?: string; private?: boolean; default_branch?: string; settings?: Json; compliance_issues?: Json; updated_at?: string };
        Relationships: [
          { foreignKeyName: "github_repos_installation_id_fkey"; columns: ["installation_id"]; isOneToOne: false; referencedRelation: "github_installations"; referencedColumns: ["id"] }
        ];
      };
      github_findings: {
        Row: { id: string; installation_id: string; type: 'secret' | 'code_scan' | 'dependabot'; severity: string; repository: string; title: string; details: Json; state: string; external_id: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; installation_id: string; type: 'secret' | 'code_scan' | 'dependabot'; severity?: string; repository: string; title: string; details?: Json; state?: string; external_id?: string | null };
        Update: { severity?: string; state?: string; details?: Json; updated_at?: string };
        Relationships: [
          { foreignKeyName: "github_findings_installation_id_fkey"; columns: ["installation_id"]; isOneToOne: false; referencedRelation: "github_installations"; referencedColumns: ["id"] }
        ];
      };
      audit_logs: {
        Row: { id: string; org_id: string | null; user_id: string | null; action: string; resource_type: string | null; resource_id: string | null; metadata: Json; ip_address: string | null; created_at: string };
        Insert: { id?: string; org_id?: string | null; user_id?: string | null; action: string; resource_type?: string | null; resource_id?: string | null; metadata?: Json; ip_address?: string | null };
        Update: { org_id?: string | null };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      my_org_id: { Args: Record<PropertyKey, never>; Returns: string };
      is_org_member: { Args: { p_org_id: string }; Returns: boolean };
    };
    Enums: Record<string, never>;
  };
};
