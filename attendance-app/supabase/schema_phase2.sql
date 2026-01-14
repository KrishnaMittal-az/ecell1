-- E-Cell Phase 2: Member Profiles, Events & Announcements
-- =====================================================

-- =====================================================
-- TABLES
-- =====================================================

-- Add year field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS year TEXT DEFAULT 'member' CHECK (year IN ('1st_year', '2nd_year', '3rd_year', 'member'));

-- Member Profiles table
CREATE TABLE IF NOT EXISTS member_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  linkedin_url TEXT,
  phone TEXT,
  profile_image_url TEXT,
  contribution_score INTEGER DEFAULT 0 CHECK (contribution_score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('design', 'development', 'marketing', 'operations', 'finance', 'content', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Skills table (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_skills (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency INTEGER NOT NULL CHECK (proficiency >= 1 AND proficiency <= 5),
  endorsed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, skill_id)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  capacity INTEGER CHECK (capacity > 0),
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event Registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attended BOOLEAN DEFAULT false,
  feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 5),
  feedback_text TEXT,
  UNIQUE(event_id, user_id)
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'all' CHECK (visibility IN ('all', '1st_year', '2nd_year', '3rd_year')),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Announcement Reads table
CREATE TABLE IF NOT EXISTS announcement_reads (
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (announcement_id, user_id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  criteria TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Member Profiles
CREATE INDEX IF NOT EXISTS idx_member_profiles_user_id ON member_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_member_profiles_contribution ON member_profiles(contribution_score DESC);

-- Skills
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON user_skills(skill_id);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON event_registrations(user_id);

-- Announcements
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_visibility ON announcements(visibility);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(is_pinned DESC);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_user ON announcement_reads(user_id);

-- Achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Member Profiles policies
CREATE POLICY "Users can view their own profile"
  ON member_profiles FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Approved members can view all approved members profiles"
  ON member_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
    )
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id::text = member_profiles.user_id::text
      AND u.approved = true
    )
  );

CREATE POLICY "Users can update their own profile"
  ON member_profiles FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own profile"
  ON member_profiles FOR DELETE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can insert profile on signup"
  ON member_profiles FOR INSERT
  WITH CHECK (true);

-- Skills policies
CREATE POLICY "Anyone can view skills"
  ON skills FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage skills"
  ON skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

-- User Skills policies
CREATE POLICY "Anyone can view user skills"
  ON user_skills FOR SELECT
  USING (true);

CREATE POLICY "Approved members can endorse others"
  ON user_skills FOR INSERT
  WITH CHECK (
    auth.uid()::text != user_id::text
    AND auth.uid()::text = endorsed_by::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
    )
  );

CREATE POLICY "Users can update their own skill endorsements"
  ON user_skills FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own skill endorsements"
  ON user_skills FOR DELETE
  USING (
    auth.uid()::text = user_id::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

-- Events policies
CREATE POLICY "Approved members can view events"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
    )
  );

CREATE POLICY "3rd year members can create events"
  ON events FOR INSERT
  WITH CHECK (
    auth.uid()::text = created_by::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
      AND (year = '3rd_year' OR role = 'admin')
    )
  );

CREATE POLICY "Event creator or admin can update events"
  ON events FOR UPDATE
  USING (
    auth.uid()::text = created_by::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

CREATE POLICY "Event creator or admin can delete events"
  ON events FOR DELETE
  USING (
    auth.uid()::text = created_by::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

-- Event Registrations policies
CREATE POLICY "Users can view their own registrations"
  ON event_registrations FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all registrations"
  ON event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

CREATE POLICY "Approved members can register for events"
  ON event_registrations FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
    )
  );

CREATE POLICY "Users can update their own registration"
  ON event_registrations FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own registration"
  ON event_registrations FOR DELETE
  USING (
    auth.uid()::text = user_id::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

-- Announcements policies
CREATE POLICY "Approved members can view announcements"
  ON announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
    )
  );

CREATE POLICY "3rd year+ members can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (
    auth.uid()::text = created_by::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
      AND (year = '3rd_year' OR role = 'admin')
    )
  );

CREATE POLICY "Announcement creator or admin can update"
  ON announcements FOR UPDATE
  USING (
    auth.uid()::text = created_by::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

CREATE POLICY "Announcement creator or admin can delete"
  ON announcements FOR DELETE
  USING (
    auth.uid()::text = created_by::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

-- Announcement Reads policies
CREATE POLICY "Users can view their own read status"
  ON announcement_reads FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can mark announcements as read"
  ON announcement_reads FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
    )
  );

CREATE POLICY "Users can update their own read status"
  ON announcement_reads FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Achievements policies
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage achievements"
  ON achievements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

-- User Achievements policies
CREATE POLICY "Anyone can view user achievements"
  ON user_achievements FOR SELECT
  USING (true);

CREATE POLICY "Admins can award achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

CREATE POLICY "Admins can manage user achievements"
  ON user_achievements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at triggers for new tables
CREATE TRIGGER update_member_profiles_updated_at
  BEFORE UPDATE ON member_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample skills
INSERT INTO skills (name, category) VALUES
  ('UI/UX Design', 'design'),
  ('Graphic Design', 'design'),
  ('React', 'development'),
  ('Node.js', 'development'),
  ('Python', 'development'),
  ('Social Media Marketing', 'marketing'),
  ('Content Writing', 'content'),
  ('Event Management', 'operations'),
  ('Financial Planning', 'finance'),
  ('Team Leadership', 'operations')
ON CONFLICT (name) DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (name, description, icon_url, criteria) VALUES
  ('First Event', 'Organized your first event', '🎯', 'Organize your first event'),
  ('Perfect Attendance', '100% attendance for a month', '⭐', 'Maintain 100% attendance for a month'),
  ('Team Player', 'Participated in 5+ events', '🤝', 'Participate in 5+ events'),
  ('Innovator', 'Created a new initiative', '💡', 'Create and execute a new initiative'),
  ('Contributor', 'Scored 100+ contribution points', '🏆', 'Accumulate 100+ contribution points')
ON CONFLICT (name) DO NOTHING;
