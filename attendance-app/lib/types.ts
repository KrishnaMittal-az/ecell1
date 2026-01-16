// Database Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  approved: boolean;
  year: '1st_year' | '2nd_year' | '3rd_year' | 'member';
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
  year: '1st_year' | '2nd_year' | '3rd_year' | 'member';
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

// Phase 2 Types

export interface MemberProfile {
  id: string;
  user_id: string;
  bio: string | null;
  linkedin_url: string | null;
  phone: string | null;
  profile_image_url: string | null;
  contribution_score: number;
  created_at: string;
  updated_at: string;
}

export interface MemberProfileWithUser extends MemberProfile {
  users: Pick<User, 'id' | 'name' | 'email' | 'year' | 'role' | 'approved'>;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

export interface UserSkill {
  user_id: string;
  skill_id: string;
  proficiency: number;
  endorsed_by: string | null;
  created_at: string;
}

export interface UserSkillWithDetails extends UserSkill {
  skills: Skill;
  users?: Pick<User, 'id' | 'name'>;
}

export interface Event {
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
  event_date: string;
  location: string | null;
  capacity: number | null;
  image_url: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface EventWithCreator extends Event {
  users: Pick<User, 'id' | 'name' | 'email'>;
}

export interface EventWithRegistrations extends Event {
  users: Pick<User, 'id' | 'name' | 'email'>;
  event_registrations: EventRegistration[];
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
  attended: boolean;
  feedback_score: number | null;
  feedback_text: string | null;
}

export interface EventRegistrationWithUser extends EventRegistration {
  users: Pick<User, 'id' | 'name' | 'email'>;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  visibility: 'all' | '1st_year' | '2nd_year' | '3rd_year';
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementWithCreator extends Announcement {
  users: Pick<User, 'id' | 'name' | 'email'>;
}

export interface AnnouncementWithReadStatus extends AnnouncementWithCreator {
  announcement_reads: { user_id: string; read_at: string }[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  criteria: string | null;
  created_at: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface UserAchievementWithDetails extends UserAchievement {
  achievements: Achievement;
}

// Phase 2 Form Types
export interface UpdateProfileFormData {
  bio?: string;
  linkedin_url?: string;
  phone?: string;
  profile_image_url?: string;
}

export interface CreateSkillFormData {
  name: string;
  category: string;
}

export interface EndorseSkillFormData {
  skill_id: string;
  proficiency: number;
}

export interface CreateEventFormData {
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  capacity?: number;
  image_url?: string;
}

export interface CreateAnnouncementFormData {
  title: string;
  content: string;
  visibility: 'all' | '1st_year' | '2nd_year' | '3rd_year';
}

export interface CreateAchievementFormData {
  name: string;
  description?: string;
  icon_url?: string;
  criteria?: string;
}

export interface EventFeedbackFormData {
  feedback_score: number;
  feedback_text?: string;
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
