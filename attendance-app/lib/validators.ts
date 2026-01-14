import { z } from 'zod';

// Auth validators
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Session validators
export const createSessionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional().default(''),
  expiresInHours: z.number().min(1).max(168), // Max 7 days
});

export const uploadMomSchema = z.object({
  sessionId: z.string().uuid(),
  file: z.instanceof(File).refine(
    (file) => file.type === 'application/pdf',
    'File must be a PDF'
  ).refine(
    (file) => file.size <= 10 * 1024 * 1024,
    'File must be less than 10MB'
  ),
});

// Faculty validators
export const createFacultySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

export const generateTokenSchema = z.object({
  facultyId: z.string().uuid(),
  expiresInDays: z.number().min(1).max(365),
});

// Attendance validators
export const markAttendanceSchema = z.object({
  qrToken: z.string().uuid(),
});

export const qrTokenSchema = z.object({
  sessionId: z.string().uuid(),
  token: z.string().uuid(),
  expiresAt: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Invalid date format"
  ),
});

// Phase 2 Validators

// Member Profile validators
export const updateProfileSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  profile_image_url: z.string().url('Invalid image URL').optional(),
});

// Skill validators
export const createSkillSchema = z.object({
  name: z.string().min(2, 'Skill name must be at least 2 characters').max(50, 'Skill name must be less than 50 characters'),
  category: z.enum(['design', 'development', 'marketing', 'operations', 'finance', 'content', 'other']),
});

export const endorseSkillSchema = z.object({
  skill_id: z.string().uuid('Invalid skill ID'),
  proficiency: z.number().min(1, 'Proficiency must be at least 1').max(5, 'Proficiency must be at most 5'),
});

// Event validators
export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  event_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ).refine(
    (date) => new Date(date) > new Date(),
    'Event date must be in the future'
  ),
  location: z.string().optional(),
  capacity: z.number().positive('Capacity must be positive').optional(),
  image_url: z.string().url('Invalid image URL').optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().optional(),
  event_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ).optional(),
  location: z.string().optional(),
  capacity: z.number().positive('Capacity must be positive').optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed']).optional(),
});

// Event Registration validators
export const eventFeedbackSchema = z.object({
  feedback_score: z.number().min(1, 'Score must be at least 1').max(5, 'Score must be at most 5'),
  feedback_text: z.string().max(500, 'Feedback must be less than 500 characters').optional(),
});

// Announcement validators
export const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  visibility: z.enum(['all', '1st_year', '2nd_year', '3rd_year']),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters').optional(),
  visibility: z.enum(['all', '1st_year', '2nd_year', '3rd_year']).optional(),
  is_pinned: z.boolean().optional(),
});

// Achievement validators
export const createAchievementSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  icon_url: z.string().url('Invalid icon URL').optional(),
  criteria: z.string().optional(),
});

export const awardAchievementSchema = z.object({
  achievement_id: z.string().uuid('Invalid achievement ID'),
});
