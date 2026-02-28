-- Auto-assessment columns for vendors
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS security_score int;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS security_findings jsonb DEFAULT '[]';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS security_checked_at timestamptz;

-- Relax tier check to allow 4 tiers (UI uses 1-4 but schema was 1-3)
ALTER TABLE vendors DROP CONSTRAINT IF EXISTS vendors_tier_check;
ALTER TABLE vendors ADD CONSTRAINT vendors_tier_check CHECK (tier BETWEEN 1 AND 4);
