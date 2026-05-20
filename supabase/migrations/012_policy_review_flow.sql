-- ============================================================
-- SecComply: Policy Review Flow (author / reviewer / approver)
-- ============================================================
-- Adds the three roles and the awaiting_approval state to the
-- existing policies + policy_versions tables.
-- Additive — existing rows keep working.
-- ============================================================

-- 1. policies: assignment columns (the "who's on this right now" pointers).
ALTER TABLE policies
    ADD COLUMN IF NOT EXISTS author_id   uuid REFERENCES profiles(id),
    ADD COLUMN IF NOT EXISTS reviewer_id uuid REFERENCES profiles(id),
    ADD COLUMN IF NOT EXISTS approver_id uuid REFERENCES profiles(id);

-- Backfill author_id = owner_id where missing so existing rows have an author.
UPDATE policies SET author_id = owner_id WHERE author_id IS NULL AND owner_id IS NOT NULL;

-- 2. Extend the status check to include awaiting_approval.
ALTER TABLE policies DROP CONSTRAINT IF EXISTS policies_status_check;
ALTER TABLE policies ADD CONSTRAINT policies_status_check
    CHECK (status IN ('draft', 'under_review', 'approved', 'archived',
                      'in_review', 'awaiting_approval', 'active', 'superseded'));

-- 3. policy_versions: record reviewer activity per version snapshot.
ALTER TABLE policy_versions
    ADD COLUMN IF NOT EXISTS reviewer_id        uuid REFERENCES profiles(id),
    ADD COLUMN IF NOT EXISTS reviewed_at        timestamptz,
    ADD COLUMN IF NOT EXISTS reviewer_decision  text CHECK (reviewer_decision IN ('approved', 'changes_requested') OR reviewer_decision IS NULL),
    ADD COLUMN IF NOT EXISTS reviewer_comment   text;

-- Widen the policy_versions.status check the same way.
ALTER TABLE policy_versions DROP CONSTRAINT IF EXISTS policy_versions_status_check;
ALTER TABLE policy_versions ADD CONSTRAINT policy_versions_status_check
    CHECK (status IN ('draft', 'in_review', 'awaiting_approval', 'active', 'superseded'));
