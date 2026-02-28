-- ============================================================
-- SecComply: Supabase Storage Buckets & Policies
-- ============================================================

-- Evidence artifacts bucket (private, org-scoped)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'evidence-artifacts',
    'evidence-artifacts',
    false,
    52428800,  -- 50MB
    ARRAY['application/pdf','image/png','image/jpeg','image/gif','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
) ON CONFLICT (id) DO NOTHING;

-- Policy documents bucket (private, org-scoped)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'policy-documents',
    'policy-documents',
    false,
    52428800,  -- 50MB
    ARRAY['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain']
) ON CONFLICT (id) DO NOTHING;

-- VAPT reports bucket (private, org-scoped)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'vapt-reports',
    'vapt-reports',
    false,
    104857600,  -- 100MB
    ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE RLS POLICIES
-- Pattern: {org_id}/{resource_id}/{filename}
-- Users can only access files within their org's folder
-- ============================================================

-- Evidence artifacts
CREATE POLICY "evidence_upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'evidence-artifacts' AND
    (is_admin() OR (storage.foldername(name))[1] = my_org_id()::text)
);
CREATE POLICY "evidence_select" ON storage.objects FOR SELECT USING (
    bucket_id = 'evidence-artifacts' AND
    (is_admin() OR (storage.foldername(name))[1] = my_org_id()::text)
);
CREATE POLICY "evidence_delete" ON storage.objects FOR DELETE USING (
    bucket_id = 'evidence-artifacts' AND
    (is_admin() OR (storage.foldername(name))[1] = my_org_id()::text)
);

-- Policy documents
CREATE POLICY "policy_docs_upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'policy-documents' AND
    (is_admin() OR (storage.foldername(name))[1] = my_org_id()::text)
);
CREATE POLICY "policy_docs_select" ON storage.objects FOR SELECT USING (
    bucket_id = 'policy-documents' AND
    (is_admin() OR (storage.foldername(name))[1] = my_org_id()::text)
);
CREATE POLICY "policy_docs_delete" ON storage.objects FOR DELETE USING (
    bucket_id = 'policy-documents' AND
    (is_admin() OR (storage.foldername(name))[1] = my_org_id()::text)
);

-- VAPT reports
CREATE POLICY "vapt_upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'vapt-reports' AND
    (is_admin() OR (storage.foldername(name))[1] = my_org_id()::text)
);
CREATE POLICY "vapt_select" ON storage.objects FOR SELECT USING (
    bucket_id = 'vapt-reports' AND
    (is_admin() OR (storage.foldername(name))[1] = my_org_id()::text)
);
CREATE POLICY "vapt_delete" ON storage.objects FOR DELETE USING (
    bucket_id = 'vapt-reports' AND
    (is_admin() OR (storage.foldername(name))[1] = my_org_id()::text)
);
