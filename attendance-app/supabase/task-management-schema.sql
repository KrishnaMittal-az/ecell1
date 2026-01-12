-- Task Management System Database Schema Extension
-- ================================================

-- Add user year field to existing users table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'year') THEN
        ALTER TABLE users ADD COLUMN year TEXT CHECK (year IN ('1st', '2nd', '3rd'));
    END IF;
END $$;

-- =====================================================
-- TASK MANAGEMENT TABLES
-- =====================================================

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  due_date TIMESTAMP NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'approved', 'rejected', 'cancelled')),
  category TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Task Submissions Table
CREATE TABLE IF NOT EXISTS task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  submitted_at TIMESTAMP DEFAULT now(),
  reviewed_at TIMESTAMP,
  PRIMARY KEY (task_id, submitted_by),
  CONSTRAINT unique_submission_per_task UNIQUE(task_id, submitted_by)
);

-- Proof Files Table
CREATE TABLE IF NOT EXISTS proof_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES task_submissions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INT,
  uploaded_at TIMESTAMP DEFAULT now()
);

-- Task Reviews Table
CREATE TABLE IF NOT EXISTS task_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES task_submissions(id) ON DELETE CASCADE,
  reviewed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected', 'revision_requested')),
  review_notes TEXT,
  reviewed_at TIMESTAMP DEFAULT now(),
  CONSTRAINT unique_review_per_submission UNIQUE(submission_id, reviewed_by)
);

-- Task Notifications Table
CREATE TABLE IF NOT EXISTS task_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('task_assigned', 'task_due_soon', 'submission_received', 'task_approved', 'task_rejected', 'revision_requested', 'comment_added')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- Task Comments Table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  commented_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Task History Table
CREATE TABLE IF NOT EXISTS task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'assigned', 'status_changed', 'file_uploaded', 'approved', 'rejected', 'comment_added', 'due_date_changed', 'priority_changed')),
  performed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_submissions_task_id ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_by ON task_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_proof_files_submission_id ON proof_files(submission_id);
CREATE INDEX IF NOT EXISTS idx_task_reviews_submission_id ON task_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_task_notifications_user_id ON task_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON task_history(task_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on task management tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;

-- Tasks table policies
CREATE POLICY "Users can view assigned tasks"
  ON tasks FOR SELECT
  USING (
    assigned_to::text = auth.uid()::text
    OR created_by::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
      AND year = '3rd'
    )
  );

CREATE POLICY "3rd year users can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
      AND year IN ('2nd', '3rd')
    )
  );

CREATE POLICY "Task creators and 3rd year can update tasks"
  ON tasks FOR UPDATE
  USING (
    created_by::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
      AND year = '3rd'
    )
  );

CREATE POLICY "Task creators and 3rd year can delete tasks"
  ON tasks FOR DELETE
  USING (
    created_by::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
      AND year = '3rd'
    )
  );

-- Task Submissions table policies
CREATE POLICY "Users can view their own submissions"
  ON task_submissions FOR SELECT
  USING (
    submitted_by::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_id
      AND (t.created_by::text = auth.uid()::text OR t.assigned_to::text = auth.uid()::text)
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
      AND year IN ('2nd', '3rd')
    )
  );

CREATE POLICY "1st year users can submit tasks"
  ON task_submissions FOR INSERT
  WITH CHECK (
    submitted_by::text = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
      AND year = '1st'
    )
  );

CREATE POLICY "Submitters can update their own submissions"
  ON task_submissions FOR UPDATE
  USING (submitted_by::text = auth.uid()::text);

-- Proof Files table policies
CREATE POLICY "Users can view files from accessible submissions"
  ON proof_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM task_submissions ts
      JOIN tasks t ON t.id = ts.task_id
      WHERE ts.id = submission_id
      AND (
        ts.submitted_by::text = auth.uid()::text
        OR t.created_by::text = auth.uid()::text
        OR t.assigned_to::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM users
          WHERE id::text = auth.uid()::text
          AND approved = true
          AND year IN ('2nd', '3rd')
        )
      )
    )
  );

CREATE POLICY "Submitters can upload files"
  ON proof_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM task_submissions
      WHERE id = submission_id
      AND submitted_by::text = auth.uid()::text
    )
  );

CREATE POLICY "Submitters can delete their own files"
  ON proof_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM task_submissions
      WHERE id = submission_id
      AND submitted_by::text = auth.uid()::text
    )
  );

-- Task Reviews table policies
CREATE POLICY "Users can view reviews for accessible tasks"
  ON task_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM task_submissions ts
      JOIN tasks t ON t.id = ts.task_id
      WHERE ts.id = submission_id
      AND (
        ts.submitted_by::text = auth.uid()::text
        OR t.created_by::text = auth.uid()::text
        OR t.assigned_to::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM users
          WHERE id::text = auth.uid()::text
          AND approved = true
          AND year IN ('2nd', '3rd')
        )
      )
    )
  );

CREATE POLICY "2nd and 3rd year users can create reviews"
  ON task_reviews FOR INSERT
  WITH CHECK (
    reviewed_by::text = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
      AND year IN ('2nd', '3rd')
    )
  );

-- Task Notifications table policies
CREATE POLICY "Users can view their own notifications"
  ON task_notifications FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "System can create notifications"
  ON task_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON task_notifications FOR UPDATE
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own notifications"
  ON task_notifications FOR DELETE
  USING (user_id::text = auth.uid()::text);

-- Task Comments table policies
CREATE POLICY "Users can view comments on accessible tasks"
  ON task_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE id = task_id
      AND (
        created_by::text = auth.uid()::text
        OR assigned_to::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM users
          WHERE id::text = auth.uid()::text
          AND approved = true
        )
      )
    )
  );

CREATE POLICY "Authenticated users can add comments"
  ON task_comments FOR INSERT
  WITH CHECK (
    commented_by::text = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
    )
  );

CREATE POLICY "Comment authors can edit their comments"
  ON task_comments FOR UPDATE
  USING (commented_by::text = auth.uid()::text);

CREATE POLICY "Comment authors can delete their comments"
  ON task_comments FOR DELETE
  USING (commented_by::text = auth.uid()::text);

-- Task History table policies
CREATE POLICY "Users can view history for accessible tasks"
  ON task_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE id = task_id
      AND (
        created_by::text = auth.uid()::text
        OR assigned_to::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM users
          WHERE id::text = auth.uid()::text
          AND approved = true
          AND year = '3rd'
        )
      )
    )
  );

CREATE POLICY "System can create history entries"
  ON task_history FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKET FOR TASK PROOFS
-- =====================================================

-- Create Task Proofs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-proofs', 'task-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for Task Proofs
CREATE POLICY "Authenticated users can upload task proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'task-proofs'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND approved = true
    )
  );

CREATE POLICY "Users can view accessible task proof files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'task-proofs'
    AND (
      EXISTS (
        SELECT 1 FROM proof_files pf
        JOIN task_submissions ts ON ts.id = pf.submission_id
        JOIN tasks t ON t.id = ts.task_id
        WHERE pf.file_url = storage.objects.name
        AND (
          ts.submitted_by::text = auth.uid()::text
          OR t.created_by::text = auth.uid()::text
          OR t.assigned_to::text = auth.uid()::text
          OR EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND approved = true
            AND year IN ('2nd', '3rd')
          )
        )
      )
    )
  );

CREATE POLICY "Users can delete their own task proof files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'task-proofs'
    AND EXISTS (
      SELECT 1 FROM proof_files pf
      JOIN task_submissions ts ON ts.id = pf.submission_id
      WHERE pf.file_url = storage.objects.name
      AND ts.submitted_by::text = auth.uid()::text
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user can assign task to target user
CREATE OR REPLACE FUNCTION can_assign_task(assignor_id UUID, assignee_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    assignor_year TEXT;
    assignee_year TEXT;
BEGIN
    SELECT year INTO assignor_year FROM users WHERE id = assignor_id;
    SELECT year INTO assignee_year FROM users WHERE id = assignee_id;
    
    -- 3rd year can assign to anyone
    IF assignor_year = '3rd' THEN
        RETURN true;
    END IF;
    
    -- 2nd year can only assign to 1st year
    IF assignor_year = '2nd' AND assignee_year = '1st' THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can review submission
CREATE OR REPLACE FUNCTION can_review_submission(reviewer_id UUID, submission_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    reviewer_year TEXT;
    submitter_year TEXT;
    task_creator_id UUID;
BEGIN
    SELECT year INTO reviewer_year FROM users WHERE id = reviewer_id;
    SELECT ts.submitted_by, t.created_by INTO submitter_year, task_creator_id
    FROM task_submissions ts
    JOIN tasks t ON t.id = ts.task_id
    WHERE ts.id = submission_id;
    
    SELECT year INTO submitter_year FROM users WHERE id = submitter_year;
    
    -- Task creator can review
    IF task_creator_id = reviewer_id THEN
        RETURN true;
    END IF;
    
    -- 3rd year can review anyone
    IF reviewer_year = '3rd' THEN
        RETURN true;
    END IF;
    
    -- 2nd year can only review 1st year
    IF reviewer_year = '2nd' AND submitter_year = '1st' THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;