-- Add Personal Access Token support to github_installations
ALTER TABLE github_installations ADD COLUMN IF NOT EXISTS access_token text;

-- Store org-level security settings from the last sync
ALTER TABLE github_installations ADD COLUMN IF NOT EXISTS org_settings jsonb DEFAULT '{}';
