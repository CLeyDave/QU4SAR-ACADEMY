-- Migration 3: Academy 2.0 — Estructura de Datos (CORREGIDA para esquema real)
-- Combina updated_at faltantes + nuevas columnas + course names

-- ============================================================
-- 1. Add updated_at to tables that exist but don't have it yet
-- ============================================================
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE task_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE groups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE member_achievements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE rank_history ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE coach_notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE materials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE attendance_confirmations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE substitutions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE news ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE clips ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE reactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE scrims ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE team ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE curriculum ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE content ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE sections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE group_coaches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE task_completions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE media ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================
-- 2. Create trigger function (idempotent)
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. Apply triggers (only for tables that exist)
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='tasks') THEN
    DROP TRIGGER IF EXISTS set_updated_at_tasks ON tasks;
    CREATE TRIGGER set_updated_at_tasks BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='task_submissions') THEN
    DROP TRIGGER IF EXISTS set_updated_at_task_submissions ON task_submissions;
    CREATE TRIGGER set_updated_at_task_submissions BEFORE UPDATE ON task_submissions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='evaluations') THEN
    DROP TRIGGER IF EXISTS set_updated_at_evaluations ON evaluations;
    CREATE TRIGGER set_updated_at_evaluations BEFORE UPDATE ON evaluations FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='groups') THEN
    DROP TRIGGER IF EXISTS set_updated_at_groups ON groups;
    CREATE TRIGGER set_updated_at_groups BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='member_achievements') THEN
    DROP TRIGGER IF EXISTS set_updated_at_member_achievements ON member_achievements;
    CREATE TRIGGER set_updated_at_member_achievements BEFORE UPDATE ON member_achievements FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='rank_history') THEN
    DROP TRIGGER IF EXISTS set_updated_at_rank_history ON rank_history;
    CREATE TRIGGER set_updated_at_rank_history BEFORE UPDATE ON rank_history FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='quizzes') THEN
    DROP TRIGGER IF EXISTS set_updated_at_quizzes ON quizzes;
    CREATE TRIGGER set_updated_at_quizzes BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='quiz_responses') THEN
    DROP TRIGGER IF EXISTS set_updated_at_quiz_responses ON quiz_responses;
    CREATE TRIGGER set_updated_at_quiz_responses BEFORE UPDATE ON quiz_responses FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='coach_notes') THEN
    DROP TRIGGER IF EXISTS set_updated_at_coach_notes ON coach_notes;
    CREATE TRIGGER set_updated_at_coach_notes BEFORE UPDATE ON coach_notes FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='materials') THEN
    DROP TRIGGER IF EXISTS set_updated_at_materials ON materials;
    CREATE TRIGGER set_updated_at_materials BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='attendance') THEN
    DROP TRIGGER IF EXISTS set_updated_at_attendance ON attendance;
    CREATE TRIGGER set_updated_at_attendance BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='attendance_confirmations') THEN
    DROP TRIGGER IF EXISTS set_updated_at_attendance_confirmations ON attendance_confirmations;
    CREATE TRIGGER set_updated_at_attendance_confirmations BEFORE UPDATE ON attendance_confirmations FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='substitutions') THEN
    DROP TRIGGER IF EXISTS set_updated_at_substitutions ON substitutions;
    CREATE TRIGGER set_updated_at_substitutions BEFORE UPDATE ON substitutions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='achievements') THEN
    DROP TRIGGER IF EXISTS set_updated_at_achievements ON achievements;
    CREATE TRIGGER set_updated_at_achievements BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='announcements') THEN
    DROP TRIGGER IF EXISTS set_updated_at_announcements ON announcements;
    CREATE TRIGGER set_updated_at_announcements BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='news') THEN
    DROP TRIGGER IF EXISTS set_updated_at_news ON news;
    CREATE TRIGGER set_updated_at_news BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='clips') THEN
    DROP TRIGGER IF EXISTS set_updated_at_clips ON clips;
    CREATE TRIGGER set_updated_at_clips BEFORE UPDATE ON clips FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='reactions') THEN
    DROP TRIGGER IF EXISTS set_updated_at_reactions ON reactions;
    CREATE TRIGGER set_updated_at_reactions BEFORE UPDATE ON reactions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='scrims') THEN
    DROP TRIGGER IF EXISTS set_updated_at_scrims ON scrims;
    CREATE TRIGGER set_updated_at_scrims BEFORE UPDATE ON scrims FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='team') THEN
    DROP TRIGGER IF EXISTS set_updated_at_team ON team;
    CREATE TRIGGER set_updated_at_team BEFORE UPDATE ON team FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='curriculum') THEN
    DROP TRIGGER IF EXISTS set_updated_at_curriculum ON curriculum;
    CREATE TRIGGER set_updated_at_curriculum BEFORE UPDATE ON curriculum FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='content') THEN
    DROP TRIGGER IF EXISTS set_updated_at_content ON content;
    CREATE TRIGGER set_updated_at_content BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='sections') THEN
    DROP TRIGGER IF EXISTS set_updated_at_sections ON sections;
    CREATE TRIGGER set_updated_at_sections BEFORE UPDATE ON sections FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='group_coaches') THEN
    DROP TRIGGER IF EXISTS set_updated_at_group_coaches ON group_coaches;
    CREATE TRIGGER set_updated_at_group_coaches BEFORE UPDATE ON group_coaches FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='coaches') THEN
    DROP TRIGGER IF EXISTS set_updated_at_coaches ON coaches;
    CREATE TRIGGER set_updated_at_coaches BEFORE UPDATE ON coaches FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='applications') THEN
    DROP TRIGGER IF EXISTS set_updated_at_applications ON applications;
    CREATE TRIGGER set_updated_at_applications BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='task_completions') THEN
    DROP TRIGGER IF EXISTS set_updated_at_task_completions ON task_completions;
    CREATE TRIGGER set_updated_at_task_completions BEFORE UPDATE ON task_completions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename='media') THEN
    DROP TRIGGER IF EXISTS set_updated_at_media ON media;
    CREATE TRIGGER set_updated_at_media BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

-- ============================================================
-- 4. Groups → Cohortes
-- ============================================================
ALTER TABLE groups ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'cohort';
ALTER TABLE groups ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS month_current INTEGER DEFAULT 1;

-- Renombrar grupos existentes
UPDATE groups SET name = 'NOVA', type = 'cohort', month_current = 1 WHERE id = 'g1';
UPDATE groups SET name = 'QUASAR', type = 'cohort', month_current = 1 WHERE id = 'g2';

-- Seed de cohortes (si no existen)
INSERT INTO groups (id, name, type, start_date, end_date, month_current) VALUES
  ('cohort_nova_2026',  'NOVA',  'cohort', '2026-01-15', '2027-01-15', 1),
  ('cohort_quasar_2026',  'QUASAR',  'cohort', '2026-04-15', '2027-04-15', 1),
  ('cohort_gamma_2026', 'Gamma 2026', 'cohort', '2026-07-15', '2027-07-15', 1),
  ('cohort_delta_2026', 'Delta 2026', 'cohort', '2026-10-15', '2027-10-15', 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. Nuevas columnas en members
-- ============================================================
ALTER TABLE members ADD COLUMN IF NOT EXISTS current_month INTEGER DEFAULT 1;
ALTER TABLE members ADD COLUMN IF NOT EXISTS enrollment_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS academy_status TEXT DEFAULT 'active';
ALTER TABLE members ADD COLUMN IF NOT EXISTS primary_role TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS secondary_role TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS specialization TEXT;

-- ============================================================
-- 6. Academy + Evaluations + Group Coaches (nuevos campos)
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
-- 7. Tabla draft_picks (con member_id TEXT para match members.id)
-- ============================================================
CREATE TABLE IF NOT EXISTS draft_picks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  season TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scouted',
  notes TEXT,
  picked_by TEXT REFERENCES members(id),
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
