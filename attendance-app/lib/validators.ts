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
  description: z.string().optional(),
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
  expiresAt: z.string().datetime(),
});
