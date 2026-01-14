// Database Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  approved: boolean;
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
export type UserYear = '1st' | '2nd' | '3rd';
export type NotificationType = 'task_assigned' | 'task_due_soon' | 'submission_received' | 'task_approved' | 'task_rejected' | 'revision_requested' | 'comment_added';

export interface TaskUser {
  id: string;
  name: string;
  email?: string;
  year?: UserYear;
}

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
  // Joined data
  creator?: TaskUser;
  assignee?: TaskUser;
  submissions?: TaskSubmission[];
  comments?: { count: number }[];
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  submitted_by: string;
  submission_notes: string | null;
  status: SubmissionStatus;
  submitted_at: string;
  reviewed_at: string | null;
  // Joined data
  submitter?: TaskUser;
  proof_files?: ProofFile[];
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
  status: SubmissionStatus;
  review_notes: string | null;
  reviewed_at: string;
  // Joined data
  reviewer?: TaskUser;
}

export interface TaskNotification {
  id: string;
  user_id: string;
  task_id: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
  // Joined data
  task?: Pick<Task, 'id' | 'title'>;
}

export interface TaskComment {
  id: string;
  task_id: string;
  commented_by: string;
  comment: string;
  created_at: string;
  updated_at: string;
  // Joined data
  commenter?: TaskUser;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  action: string;
  performed_by: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  // Joined data
  performer?: TaskUser;
}

export interface TaskDashboardStats {
  pending_count: number;
  in_progress_count: number;
  submitted_count: number;
  approved_count: number;
  rejected_count: number;
  cancelled_count: number;
  overdue_count: number;
}

export interface TaskUserProfile extends AuthUser {
  year?: UserYear;
}

export interface CreateTaskFormData {
  title: string;
  description?: string;
  assigned_to: string;
  due_date: string;
  priority: TaskPriority;
  category?: string;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  assigned_to?: string;
}
