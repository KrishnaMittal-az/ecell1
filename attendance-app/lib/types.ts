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
