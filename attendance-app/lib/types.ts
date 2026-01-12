// Database Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  approved: boolean;
  year?: '1st' | '2nd' | '3rd'; // For task management
  created_at: string;
  updated_at: string;
}

export interface AttendanceSession {
  id: string;
  title: string;
  description: string | null;
  qr_token: string;
  expires_at: string;
  mom_pdf_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceLog {
  id: string;
  user_id: string;
  session_id: string;
  marked_at: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface FacultyViewToken {
  id: string;
  faculty_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

// Joined types for queries
export interface AttendanceLogWithUser extends AttendanceLog {
  users: Pick<User, 'id' | 'name' | 'email'>;
}

export interface AttendanceSessionWithCreator extends AttendanceSession {
  users: Pick<User, 'id' | 'name' | 'email'> | null;
}

export interface AttendanceSessionWithLogs extends AttendanceSession {
  attendance_logs: AttendanceLogWithUser[];
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  approved: boolean;
  year?: '1st' | '2nd' | '3rd'; // For task management
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  name: string;
}

export interface CreateSessionFormData {
  title: string;
  description?: string;
  expiresInHours: number;
}

export interface CreateFacultyFormData {
  name: string;
  email: string;
}

export interface GenerateTokenFormData {
  facultyId: string;
  expiresInDays: number;
}

// Task Management Types
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'cancelled';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';
export type ReviewStatus = 'approved' | 'rejected' | 'revision_requested';
export type NotificationType = 'task_assigned' | 'task_due_soon' | 'submission_received' | 'task_approved' | 'task_rejected' | 'revision_requested' | 'comment_added';
export type TaskAction = 'created' | 'assigned' | 'status_changed' | 'file_uploaded' | 'approved' | 'rejected' | 'comment_added' | 'due_date_changed' | 'priority_changed';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  assigned_to: string;
  due_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: string | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  submitted_by: string;
  submission_notes: string | null;
  status: SubmissionStatus;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface ProofFile {
  id: string;
  submission_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  uploaded_at: string;
}

export interface TaskReview {
  id: string;
  submission_id: string;
  reviewed_by: string;
  status: ReviewStatus;
  review_notes: string | null;
  reviewed_at: string;
}

export interface TaskNotification {
  id: string;
  user_id: string;
  task_id: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  commented_by: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  action: TaskAction;
  performed_by: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

// Joined types for task queries
export interface TaskWithUsers extends Task {
  creator: Pick<User, 'id' | 'name' | 'email'> | null;
  assignee: Pick<User, 'id' | 'name' | 'email'> | null;
}

export interface TaskSubmissionWithUser extends TaskSubmission {
  user: Pick<User, 'id' | 'name' | 'email'> | null;
}

export interface TaskCommentWithUser extends TaskComment {
  user: Pick<User, 'id' | 'name' | 'email'> | null;
}

export interface TaskHistoryWithUser extends TaskHistory {
  user: Pick<User, 'id' | 'name' | 'email'> | null;
}

// Task Form types
export interface CreateTaskFormData {
  title: string;
  description?: string;
  assigned_to: string;
  due_date: string;
  priority: TaskPriority;
  category?: string;
}

export interface SubmitTaskFormData {
  task_id: string;
  submission_notes?: string;
  files: File[];
}

export interface ReviewTaskFormData {
  submission_id: string;
  status: ReviewStatus;
  review_notes?: string;
}
