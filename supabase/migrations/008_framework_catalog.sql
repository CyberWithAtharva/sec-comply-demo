-- ============================================================
-- SecComply: Framework Catalog (extends frameworks + controls)
-- ============================================================
-- Adds catalog-management metadata to the existing frameworks
-- and controls tables so /admin/frameworks can CRUD them and
-- /(main)/frameworks-catalog can browse them read-only.
--
-- Existing rows are preserved. `controls.control_id` continues
-- to serve as the human-facing "code" (e.g. CC1.1, A.5.1) and
-- `controls.title` continues to serve as "name".
-- ============================================================

-- ------------------------------------------------------------
-- frameworks: add catalog metadata
-- ------------------------------------------------------------
ALTER TABLE frameworks
    ADD COLUMN IF NOT EXISTS slug         text,
    ADD COLUMN IF NOT EXISTS category     text,
    ADD COLUMN IF NOT EXISTS icon_name    text,
    ADD COLUMN IF NOT EXISTS color        text,
    ADD COLUMN IF NOT EXISTS status       text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived')),
    ADD COLUMN IF NOT EXISTS metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS created_by   uuid REFERENCES profiles(id),
    ADD COLUMN IF NOT EXISTS updated_by   uuid REFERENCES profiles(id),
    ADD COLUMN IF NOT EXISTS updated_at   timestamptz NOT NULL DEFAULT now();

-- version becomes optional (catalog frameworks may not be versioned yet)
ALTER TABLE frameworks ALTER COLUMN version DROP NOT NULL;

-- Backfill slug from name+version for any existing rows.
-- Disambiguate collisions by appending a row-number suffix.
WITH ranked AS (
    SELECT
        id,
        regexp_replace(
            regexp_replace(
                lower(coalesce(name, '') || '-' || coalesce(version, '')),
                '[^a-z0-9]+', '-', 'g'
            ),
            '(^-+|-+$)', '', 'g'
        ) AS base_slug,
        row_number() OVER (
            PARTITION BY regexp_replace(
                regexp_replace(
                    lower(coalesce(name, '') || '-' || coalesce(version, '')),
                    '[^a-z0-9]+', '-', 'g'
                ),
                '(^-+|-+$)', '', 'g'
            )
            ORDER BY created_at, id
        ) AS rn
    FROM frameworks
    WHERE slug IS NULL OR slug = ''
)
UPDATE frameworks f
SET slug = CASE WHEN r.rn = 1 THEN r.base_slug ELSE r.base_slug || '-' || r.rn::text END
FROM ranked r
WHERE f.id = r.id;

ALTER TABLE frameworks ALTER COLUMN slug SET NOT NULL;

-- Unique constraint + indexes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'frameworks_slug_unique'
    ) THEN
        ALTER TABLE frameworks ADD CONSTRAINT frameworks_slug_unique UNIQUE (slug);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_frameworks_status ON frameworks(status);
CREATE INDEX IF NOT EXISTS idx_frameworks_slug   ON frameworks(slug);

-- ------------------------------------------------------------
-- controls: add catalog metadata
-- ------------------------------------------------------------
ALTER TABLE controls
    ADD COLUMN IF NOT EXISTS sort_order   integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS updated_at   timestamptz NOT NULL DEFAULT now();

-- Domain and category were originally NOT NULL with hard-coded
-- placeholders. The catalog model only requires code (control_id)
-- and name (title); allow nulls so bulk uploads aren't forced to
-- supply category and domain.
ALTER TABLE controls ALTER COLUMN domain   DROP NOT NULL;
ALTER TABLE controls ALTER COLUMN category DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_controls_framework_domain ON controls(framework_id, domain);
CREATE INDEX IF NOT EXISTS idx_controls_framework_sort   ON controls(framework_id, sort_order);

-- ------------------------------------------------------------
-- Keep frameworks.controls_count in sync (so the catalog list
-- can show counts without an N+1 join). Triggered on insert,
-- delete, or framework_id move.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_recount_framework_controls()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE frameworks
        SET controls_count = (SELECT count(*) FROM controls WHERE framework_id = OLD.framework_id)
        WHERE id = OLD.framework_id;
        RETURN OLD;
    ELSIF TG_OP = 'INSERT' THEN
        UPDATE frameworks
        SET controls_count = (SELECT count(*) FROM controls WHERE framework_id = NEW.framework_id)
        WHERE id = NEW.framework_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' AND OLD.framework_id IS DISTINCT FROM NEW.framework_id THEN
        UPDATE frameworks
        SET controls_count = (SELECT count(*) FROM controls WHERE framework_id = OLD.framework_id)
        WHERE id = OLD.framework_id;
        UPDATE frameworks
        SET controls_count = (SELECT count(*) FROM controls WHERE framework_id = NEW.framework_id)
        WHERE id = NEW.framework_id;
        RETURN NEW;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recount_controls ON controls;
CREATE TRIGGER trg_recount_controls
    AFTER INSERT OR DELETE OR UPDATE OF framework_id ON controls
    FOR EACH ROW
    EXECUTE FUNCTION fn_recount_framework_controls();

-- One-shot reconciliation so existing rows have correct counts.
UPDATE frameworks f
SET controls_count = sub.cnt
FROM (
    SELECT framework_id, count(*) AS cnt FROM controls GROUP BY framework_id
) sub
WHERE f.id = sub.framework_id;
