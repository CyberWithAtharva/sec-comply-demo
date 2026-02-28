-- ─── 004_automation.sql ───────────────────────────────────────────────────────
-- Interconnected compliance architecture:
--   1. Fix control_status enum to match TypeScript types
--   2. Add 'gap' source + control_id FK to risks
--   3. Add framework_id + is_generated to policies
--   4. New policy_controls junction table
--   5. Trigger: auto-populate control_status when framework is assigned

-- ─── 1. Fix control_status status enum ───────────────────────────────────────
ALTER TABLE control_status DROP CONSTRAINT IF EXISTS control_status_status_check;
ALTER TABLE control_status
  ADD CONSTRAINT control_status_status_check
  CHECK (status IN ('verified', 'in_progress', 'not_started', 'not_applicable'));

-- ─── 2. Risks: add 'gap' source + control_id FK ───────────────────────────────
ALTER TABLE risks DROP CONSTRAINT IF EXISTS risks_source_check;
ALTER TABLE risks
  ADD CONSTRAINT risks_source_check
  CHECK (source IN ('aws', 'github', 'vapt', 'manual', 'gap'));

ALTER TABLE risks
  ADD COLUMN IF NOT EXISTS control_id uuid REFERENCES controls(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_risks_control ON risks(control_id);

-- ─── 3. Policies: add framework_id + is_generated ─────────────────────────────
ALTER TABLE policies
  ADD COLUMN IF NOT EXISTS framework_id uuid REFERENCES frameworks(id) ON DELETE SET NULL;

ALTER TABLE policies
  ADD COLUMN IF NOT EXISTS is_generated boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_policies_framework ON policies(framework_id);

-- ─── 4. policy_controls junction table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS policy_controls (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id  uuid NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  control_id uuid NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (policy_id, control_id)
);

CREATE INDEX IF NOT EXISTS idx_policy_controls_policy  ON policy_controls(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_controls_control ON policy_controls(control_id);

ALTER TABLE policy_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policy_controls_select" ON policy_controls
  FOR SELECT USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM policies p WHERE p.id = policy_id AND p.org_id = my_org_id()
    )
  );

CREATE POLICY "policy_controls_insert" ON policy_controls
  FOR INSERT WITH CHECK (
    is_admin() OR EXISTS (
      SELECT 1 FROM policies p WHERE p.id = policy_id AND p.org_id = my_org_id()
    )
  );

CREATE POLICY "policy_controls_delete" ON policy_controls
  FOR DELETE USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM policies p WHERE p.id = policy_id AND p.org_id = my_org_id()
    )
  );

-- ─── 5. Trigger: auto-populate control_status on framework assignment ──────────
CREATE OR REPLACE FUNCTION fn_init_control_status()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO control_status (org_id, control_id, status)
  SELECT NEW.org_id, c.id, 'not_started'
  FROM controls c
  WHERE c.framework_id = NEW.framework_id
  ON CONFLICT (org_id, control_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_init_control_status ON org_frameworks;

CREATE TRIGGER trg_init_control_status
  AFTER INSERT ON org_frameworks
  FOR EACH ROW EXECUTE FUNCTION fn_init_control_status();
