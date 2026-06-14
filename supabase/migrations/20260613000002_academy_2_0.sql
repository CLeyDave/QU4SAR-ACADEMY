-- Migration: Academy 2.0 — Estructura de Datos (Modelo Híbrido)
-- Fase 9 — Cohorte dominante + progresión individual como excepción

-- ============================================================
-- 9.1: Groups → Cohortes
-- ============================================================
ALTER TABLE groups ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'cohort';
ALTER TABLE groups ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS month_current INTEGER DEFAULT 1;

-- Renombrar grupos existentes
UPDATE groups SET name = 'NOVA', type = 'cohort', month_current = 1 WHERE id = 'g1';
UPDATE groups SET name = 'QUASAR', type = 'cohort', month_current = 1 WHERE id = 'g2';

-- Seed de cohortes
INSERT INTO groups (id, name, type, start_date, end_date, month_current) VALUES
  ('cohort_nova_2026',  'NOVA',  'cohort', '2026-01-15', '2027-01-15', 1),
  ('cohort_quasar_2026',  'QUASAR',  'cohort', '2026-04-15', '2027-04-15', 1),
  ('cohort_gamma_2026', 'Gamma 2026', 'cohort', '2026-07-15', '2027-07-15', 1),
  ('cohort_delta_2026', 'Delta 2026', 'cohort', '2026-10-15', '2027-10-15', 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 9.2: Nuevas columnas en members
-- ============================================================
ALTER TABLE members ADD COLUMN IF NOT EXISTS current_month INTEGER DEFAULT 1;
ALTER TABLE members ADD COLUMN IF NOT EXISTS enrollment_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS academy_status TEXT DEFAULT 'active';
ALTER TABLE members ADD COLUMN IF NOT EXISTS primary_role TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS secondary_role TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS specialization TEXT;

-- Nota: academy_status puede ser: active, recovery, graduated, inactive, draft, academy_team, main_team

-- ============================================================
-- 9.3: Adaptación de tablas existentes
-- ============================================================
ALTER TABLE academy ADD COLUMN IF NOT EXISTS month INTEGER;
ALTER TABLE academy ADD COLUMN IF NOT EXISTS module_name TEXT;
ALTER TABLE academy ADD COLUMN IF NOT EXISTS subject TEXT;

ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS month INTEGER;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1;

ALTER TABLE group_coaches ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE group_coaches ADD COLUMN IF NOT EXISTS month INTEGER;

-- ============================================================
-- 9.4: Tablas nuevas
-- ============================================================
CREATE TABLE IF NOT EXISTS draft_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  season TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scouted',
  notes TEXT,
  picked_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_draft_picks_member ON draft_picks(member_id);
CREATE INDEX IF NOT EXISTS idx_draft_picks_season ON draft_picks(season);
CREATE INDEX IF NOT EXISTS idx_draft_picks_status ON draft_picks(status);

-- Trigger for draft_picks.updated_at
DROP TRIGGER IF EXISTS set_updated_at_draft_picks ON draft_picks;
CREATE TRIGGER set_updated_at_draft_picks BEFORE UPDATE ON draft_picks
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
