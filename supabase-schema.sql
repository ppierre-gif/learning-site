-- ============================================================
-- Full schema — run once on a fresh project
-- ============================================================

-- Profiles (one row per child)
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  avatar     TEXT NOT NULL DEFAULT '⭐',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date             DATE NOT NULL,
  module_name      TEXT NOT NULL,
  stars_earned     INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON sessions FOR ALL USING (true) WITH CHECK (true);

-- Trophies
CREATE TABLE IF NOT EXISTS trophies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  trophy_name TEXT NOT NULL,
  trophy_icon TEXT NOT NULL,
  earned_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trophies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON trophies FOR ALL USING (true) WITH CHECK (true);

-- Settings (one row per profile)
CREATE TABLE IF NOT EXISTS settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  font_size     TEXT DEFAULT 'normal',
  volume        INTEGER DEFAULT 80,
  theme         TEXT DEFAULT 'rainbow',
  session_limit INTEGER DEFAULT 30
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON settings FOR ALL USING (true) WITH CHECK (true);

-- Wrong answers
CREATE TABLE IF NOT EXISTS wrong_answers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_name   TEXT NOT NULL,
  question_text TEXT NOT NULL,
  attempted_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON wrong_answers FOR ALL USING (true) WITH CHECK (true);


-- ============================================================
-- Migration — run this if you already have the old schema
-- (tables exist but do not yet have profile_id columns)
-- ============================================================

-- ALTER TABLE sessions    ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
-- ALTER TABLE trophies    ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
-- ALTER TABLE settings    ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
-- ALTER TABLE wrong_answers ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
-- ALTER TABLE settings    DROP COLUMN IF EXISTS child_name;
