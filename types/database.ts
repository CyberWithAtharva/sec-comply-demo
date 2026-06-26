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
        Row: { id: string; name: string; version: string | null; description: string | null; controls_count: number; created_at: string; slug: string; category: string | null; icon_name: string | null; color: string | null; status: 'active' | 'archived'; metadata: Json; created_by: string | null; updated_by: string | null; updated_at: string };
        Insert: { id?: string; name: string; version?: string | null; description?: string | null; controls_count?: number; slug: string; category?: string | null; icon_name?: string | null; color?: string | null; status?: 'active' | 'archived'; metadata?: Json; created_by?: string | null; updated_by?: string | null; updated_at?: string };
        Update: { name?: string; version?: string | null; description?: string | null; controls_count?: number; slug?: string; category?: string | null; icon_name?: string | null; color?: string | null; status?: 'active' | 'archived'; metadata?: Json; created_by?: string | null; updated_by?: string | null; updated_at?: string };
        Relationships: [];
      };
      controls: {
        Row: { id: string; framework_id: string; control_id: string; domain: string | null; category: string | null; title: string; description: string | null; type: 'automated' | 'manual'; created_at: string; sort_order: number; metadata: Json; updated_at: string };
        Insert: { id?: string; framework_id: string; control_id: string; domain?: string | null; category?: string | null; title: string; description?: string | null; type?: 'automated' | 'manual'; sort_order?: number; metadata?: Json; updated_at?: string };
        Update: { domain?: string | null; category?: string | null; title?: string; description?: string | null; type?: 'automated' | 'manual'; sort_order?: number; metadata?: Json; updated_at?: string };
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
        Row: { id: string; org_id: string; title: string; version: string; status: 'draft' | 'under_review' | 'approved' | 'archived' | 'in_review' | 'awaiting_approval' | 'active' | 'superseded'; content: string | null; file_url: string | null; owner_id: string | null; next_review: string | null; framework_id: string | null; is_generated: boolean; code: string | null; category: string | null; policy_type: string | null; description: string | null; frameworks_list: string[]; author_id: string | null; reviewer_id: string | null; approver_id: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; org_id: string; title: string; version?: string; status?: 'draft' | 'under_review' | 'approved' | 'archived' | 'in_review' | 'awaiting_approval' | 'active' | 'superseded'; content?: string | null; file_url?: string | null; owner_id?: string | null; next_review?: string | null; framework_id?: string | null; is_generated?: boolean; code?: string | null; category?: string | null; policy_type?: string | null; description?: string | null; frameworks_list?: string[]; author_id?: string | null; reviewer_id?: string | null; approver_id?: string | null };
        Update: { title?: string; version?: string; status?: 'draft' | 'under_review' | 'approved' | 'archived' | 'in_review' | 'awaiting_approval' | 'active' | 'superseded'; content?: string | null; file_url?: string | null; owner_id?: string | null; next_review?: string | null; framework_id?: string | null; code?: string | null; category?: string | null; policy_type?: string | null; description?: string | null; frameworks_list?: string[]; author_id?: string | null; reviewer_id?: string | null; approver_id?: string | null; updated_at?: string };
        Relationships: [
          { foreignKeyName: "policies_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
          { foreignKeyName: "policies_owner_id_fkey"; columns: ["owner_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "policies_framework_id_fkey"; columns: ["framework_id"]; isOneToOne: false; referencedRelation: "frameworks"; referencedColumns: ["id"] }
        ];
      };
      policy_versions: {
        Row: { id: string; policy_id: string; version: string; status: 'draft' | 'in_review' | 'awaiting_approval' | 'active' | 'superseded'; content: string | null; classification: 'auto' | 'minor' | 'major' | null; summary: string | null; created_by: string | null; created_at: string; approved_by: string | null; approved_at: string | null; reviewer_id: string | null; reviewed_at: string | null; reviewer_decision: 'approved' | 'changes_requested' | null; reviewer_comment: string | null };
        Insert: { id?: string; policy_id: string; version: string; status?: 'draft' | 'in_review' | 'awaiting_approval' | 'active' | 'superseded'; content?: string | null; classification?: 'auto' | 'minor' | 'major' | null; summary?: string | null; created_by?: string | null; approved_by?: string | null; approved_at?: string | null; reviewer_id?: string | null; reviewed_at?: string | null; reviewer_decision?: 'approved' | 'changes_requested' | null; reviewer_comment?: string | null };
        Update: { version?: string; status?: 'draft' | 'in_review' | 'awaiting_approval' | 'active' | 'superseded'; content?: string | null; classification?: 'auto' | 'minor' | 'major' | null; summary?: string | null; approved_by?: string | null; approved_at?: string | null; reviewer_id?: string | null; reviewed_at?: string | null; reviewer_decision?: 'approved' | 'changes_requested' | null; reviewer_comment?: string | null };
        Relationships: [
          { foreignKeyName: "policy_versions_policy_id_fkey"; columns: ["policy_id"]; isOneToOne: false; referencedRelation: "policies"; referencedColumns: ["id"] },
          { foreignKeyName: "policy_versions_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "policy_versions_approved_by_fkey"; columns: ["approved_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      policy_framework_controls: {
        Row: { id: string; policy_id: string; framework: string; control_code: string; description: string | null; created_at: string };
        Insert: { id?: string; policy_id: string; framework: string; control_code: string; description?: string | null };
        Update: { framework?: string; control_code?: string; description?: string | null };
        Relationships: [
          { foreignKeyName: "pfc_policy_id_fkey"; columns: ["policy_id"]; isOneToOne: false; referencedRelation: "policies"; referencedColumns: ["id"] }
        ];
      };
      policy_variable_definitions: {
        Row: { id: string; group_id: 'org' | 'people' | 'tools' | 'thresholds' | 'recovery'; group_label: string; group_icon: string | null; question: string; input_type: 'text' | 'number' | 'dropdown' | 'date'; default_value: string | null; required: boolean; sort_order: number; created_at: string };
        Insert: { id: string; group_id: 'org' | 'people' | 'tools' | 'thresholds' | 'recovery'; group_label: string; group_icon?: string | null; question: string; input_type?: 'text' | 'number' | 'dropdown' | 'date'; default_value?: string | null; required?: boolean; sort_order?: number };
        Update: { group_id?: 'org' | 'people' | 'tools' | 'thresholds' | 'recovery'; group_label?: string; group_icon?: string | null; question?: string; input_type?: 'text' | 'number' | 'dropdown' | 'date'; default_value?: string | null; required?: boolean; sort_order?: number };
        Relationships: [];
      };
      org_policy_variables: {
        Row: { id: string; org_id: string; var_key: string; value: string | null; updated_by: string | null; updated_at: string };
        Insert: { id?: string; org_id: string; var_key: string; value?: string | null; updated_by?: string | null };
        Update: { value?: string | null; updated_by?: string | null; updated_at?: string };
        Relationships: [
          { foreignKeyName: "opv_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
          { foreignKeyName: "opv_var_key_fkey"; columns: ["var_key"]; isOneToOne: false; referencedRelation: "policy_variable_definitions"; referencedColumns: ["id"] }
        ];
      };
      org_branding: {
        Row: { org_id: string; display_name: string | null; logo_url: string | null; accent_color: string | null; updated_by: string | null; updated_at: string };
        Insert: { org_id: string; display_name?: string | null; logo_url?: string | null; accent_color?: string | null; updated_by?: string | null };
        Update: { display_name?: string | null; logo_url?: string | null; accent_color?: string | null; updated_by?: string | null };
        Relationships: [
          { foreignKeyName: "org_branding_org_id_fkey"; columns: ["org_id"]; isOneToOne: true; referencedRelation: "organizations"; referencedColumns: ["id"] }
        ];
      };
      policy_ack_recipients: {
        Row: { id: string; policy_id: string; version_id: string | null; policy_version_label: string | null; email: string; name: string | null; token: string; status: 'pending' | 'acknowledged' | 'expired'; submitted_name: string | null; match_status: 'matched' | 'unverified' | null; ip_address: string | null; user_agent: string | null; sent_by: string | null; expires_at: string; acknowledged_at: string | null; created_at: string };
        Insert: { id?: string; policy_id: string; version_id?: string | null; policy_version_label?: string | null; email: string; name?: string | null; token: string; status?: 'pending' | 'acknowledged' | 'expired'; submitted_name?: string | null; match_status?: 'matched' | 'unverified' | null; ip_address?: string | null; user_agent?: string | null; sent_by?: string | null; expires_at?: string };
        Update: { status?: 'pending' | 'acknowledged' | 'expired'; submitted_name?: string | null; match_status?: 'matched' | 'unverified' | null; ip_address?: string | null; user_agent?: string | null; acknowledged_at?: string | null };
        Relationships: [
          { foreignKeyName: "par_policy_id_fkey"; columns: ["policy_id"]; isOneToOne: false; referencedRelation: "policies"; referencedColumns: ["id"] },
          { foreignKeyName: "par_version_id_fkey"; columns: ["version_id"]; isOneToOne: false; referencedRelation: "policy_versions"; referencedColumns: ["id"] }
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
        Row: { id: string; org_id: string; title: string; category: string; description: string | null; likelihood: number; impact: number; risk_score: number; status: string; owner_id: string | null; mitigation: string | null; due_date: string | null; source: string; source_ref: string | null; control_id: string | null; display_id: string | null; library_risk_id: string | null; treatment: 'mitigate' | 'accept' | 'transfer' | 'avoid' | null; residual_likelihood: number | null; residual_impact: number | null; residual_score: number | null; framework_mappings: Json; recommendation: string | null; notes: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; org_id: string; title: string; category?: string; description?: string | null; likelihood?: number; impact?: number; status?: string; owner_id?: string | null; mitigation?: string | null; due_date?: string | null; source?: string; source_ref?: string | null; control_id?: string | null; display_id?: string | null; library_risk_id?: string | null; treatment?: 'mitigate' | 'accept' | 'transfer' | 'avoid' | null; residual_likelihood?: number | null; residual_impact?: number | null; framework_mappings?: Json; recommendation?: string | null; notes?: string | null };
        Update: { title?: string; category?: string; description?: string | null; likelihood?: number; impact?: number; status?: string; owner_id?: string | null; mitigation?: string | null; due_date?: string | null; control_id?: string | null; display_id?: string | null; library_risk_id?: string | null; treatment?: 'mitigate' | 'accept' | 'transfer' | 'avoid' | null; residual_likelihood?: number | null; residual_impact?: number | null; framework_mappings?: Json; recommendation?: string | null; notes?: string | null };
        Relationships: [
          { foreignKeyName: "risks_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
          { foreignKeyName: "risks_owner_id_fkey"; columns: ["owner_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "risks_control_id_fkey"; columns: ["control_id"]; isOneToOne: false; referencedRelation: "controls"; referencedColumns: ["id"] }
        ];
      };
      risk_status_history: {
        Row: { id: string; risk_id: string; field: string; from_value: string | null; to_value: string | null; changed_by: string | null; changed_at: string; note: string | null };
        Insert: { id?: string; risk_id: string; field: string; from_value?: string | null; to_value?: string | null; changed_by?: string | null; note?: string | null };
        Update: { note?: string | null };
        Relationships: [
          { foreignKeyName: "risk_status_history_risk_id_fkey"; columns: ["risk_id"]; isOneToOne: false; referencedRelation: "risks"; referencedColumns: ["id"] },
          { foreignKeyName: "risk_status_history_changed_by_fkey"; columns: ["changed_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      vendors: {
        Row: { id: string; org_id: string; name: string; tier: number; risk_level: string; contact_name: string | null; contact_email: string | null; website: string | null; status: string; last_assessment: string | null; security_score: number | null; security_findings: Json | null; security_checked_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; org_id: string; name: string; tier?: number; risk_level?: string; contact_name?: string | null; contact_email?: string | null; website?: string | null; status?: string };
        Update: { name?: string; tier?: number; risk_level?: string; contact_name?: string | null; contact_email?: string | null; website?: string | null; status?: string; last_assessment?: string | null; security_score?: number | null; security_findings?: Json | null; security_checked_at?: string | null };
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
        Row: { id: string; org_id: string; control_id: string | null; name: string; description: string | null; file_url: string | null; file_type: string | null; file_size: number | null; uploaded_by: string | null; status: string; source: 'manual' | 'workflow_log' | 'integration'; expires_at: string | null; created_at: string };
        Insert: { id?: string; org_id: string; control_id?: string | null; name: string; description?: string | null; file_url?: string | null; file_type?: string | null; file_size?: number | null; uploaded_by?: string | null; status?: string; source?: 'manual' | 'workflow_log' | 'integration'; expires_at?: string | null };
        Update: { control_id?: string | null; name?: string; description?: string | null; status?: string; source?: 'manual' | 'workflow_log' | 'integration'; expires_at?: string | null };
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
        Row: { id: string; org_id: string; installation_id: number; github_org: string; last_sync: string | null; status: string; error_message: string | null; org_settings: Json | null; created_at: string };
        Insert: { id?: string; org_id: string; installation_id: number; github_org: string };
        Update: { last_sync?: string | null; status?: string; error_message?: string | null; org_settings?: Json | null };
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
      qms_processes: {
        Row: { id: string; key: string; name: string; description: string | null; owner_role: string | null; clause: string | null; control_id: string | null; schema: Json; sort_order: number; created_at: string };
        Insert: { id?: string; key: string; name: string; description?: string | null; owner_role?: string | null; clause?: string | null; control_id?: string | null; schema?: Json; sort_order?: number };
        Update: { name?: string; description?: string | null; owner_role?: string | null; clause?: string | null; control_id?: string | null; schema?: Json; sort_order?: number };
        Relationships: [
          { foreignKeyName: "qms_processes_control_id_fkey"; columns: ["control_id"]; isOneToOne: false; referencedRelation: "controls"; referencedColumns: ["id"] }
        ];
      };
      qms_log_entries: {
        Row: { id: string; org_id: string; process_id: string; logged_by: string | null; payload: Json; result: string | null; occurred_at: string; created_at: string };
        Insert: { id?: string; org_id: string; process_id: string; logged_by?: string | null; payload?: Json; result?: string | null; occurred_at?: string };
        Update: { payload?: Json; result?: string | null; occurred_at?: string };
        Relationships: [
          { foreignKeyName: "qms_log_entries_org_id_fkey"; columns: ["org_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
          { foreignKeyName: "qms_log_entries_process_id_fkey"; columns: ["process_id"]; isOneToOne: false; referencedRelation: "qms_processes"; referencedColumns: ["id"] },
          { foreignKeyName: "qms_log_entries_logged_by_fkey"; columns: ["logged_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
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
