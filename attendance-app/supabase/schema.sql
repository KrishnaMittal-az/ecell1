-- E-Cell Attendance & MOM Management Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Users table (Council Members)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attendance Sessions table
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  qr_token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  expires_at TIMESTAMPTZ NOT NULL,
  mom_pdf_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attendance Logs table
CREATE TABLE IF NOT EXISTS attendance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, session_id)
);

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Faculty View Tokens table
CREATE TABLE IF NOT EXISTS faculty_view_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_approved ON users(approved);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_qr_token ON attendance_sessions(qr_token);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_expires_at ON attendance_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_user_id ON attendance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_session_id ON attendance_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_faculty_view_tokens_token ON faculty_view_tokens(token);
CREATE INDEX IF NOT EXISTS idx_faculty_view_tokens_expires_at ON faculty_view_tokens(expires_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_view_tokens ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

CREATE POLICY "Anyone can insert users (signup)"
  ON users FOR INSERT
  WITH CHECK (true);

-- Attendance Sessions table policies
CREATE POLICY "Approved users can view sessions"
  ON attendance_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
    )
  );

CREATE POLICY "Admins can insert sessions"
  ON attendance_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

CREATE POLICY "Admins can update sessions"
  ON attendance_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

CREATE POLICY "Admins can delete sessions"
  ON attendance_sessions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

-- Attendance Logs table policies
CREATE POLICY "Users can view their own attendance"
  ON attendance_logs FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all attendance"
  ON attendance_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

CREATE POLICY "Approved users can mark attendance"
  ON attendance_logs FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
    )
  );

-- Faculty table policies
CREATE POLICY "Admins can manage faculty"
  ON faculty FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

-- Faculty View Tokens table policies
CREATE POLICY "Admins can manage tokens"
  ON faculty_view_tokens FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_sessions_updated_at
  BEFORE UPDATE ON attendance_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at
  BEFORE UPDATE ON faculty
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create MOM PDFs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('mom-pdfs', 'mom-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for MOM PDFs
CREATE POLICY "Admins can upload MOMs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'mom-pdfs'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );

CREATE POLICY "Authenticated users can view MOMs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'mom-pdfs'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
    )
  );

CREATE POLICY "Admins can delete MOMs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'mom-pdfs'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );
