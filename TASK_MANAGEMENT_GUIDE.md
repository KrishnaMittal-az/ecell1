# Task Management System - Setup Guide

## Overview
This is a comprehensive task management system with role-based hierarchies, task submission workflow, proof file uploads, and review system built for E-Cell.

## Features
- **Role-Based Access Control**: 3-tier hierarchy (1st, 2nd, 3rd year students)
- **Task Management**: Create, assign, track, and manage tasks
- **Submission Workflow**: File upload system for task submissions
- **Review System**: Approve/reject/revision request functionality
- **Notifications**: Real-time notifications for task events
- **Dashboard**: Statistics, quick actions, and overview
- **Analytics**: Performance tracking and insights (3rd year only)
- **File Management**: Secure file upload with preview capabilities

## Database Setup

### 1. Run Database Migration
Execute the SQL migration in your Supabase project:

```sql
-- Copy the contents of attendance-app/supabase/task-management-schema.sql
-- Execute this in your Supabase SQL Editor
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Storage Setup
The system automatically creates a `task-proofs` storage bucket when the migration runs.

## User Roles & Permissions

### 3rd Year Students
- ✅ Create tasks for any year
- ✅ Assign tasks to anyone
- ✅ Review submissions from any year
- ✅ View analytics dashboard
- ✅ Edit/delete any task
- ✅ Full system access

### 2nd Year Students
- ✅ Create tasks for 1st year only
- ✅ Assign tasks to 1st year only
- ✅ Review 1st year submissions only
- ✅ Edit own tasks
- ✅ Cannot access analytics

### 1st Year Students
- ✅ View assigned tasks only
- ✅ Submit proof files for tasks
- ✅ Add comments to tasks
- ✅ Cannot create or assign tasks
- ✅ Cannot review submissions

## Usage Guide

### Getting Started
1. **Sign Up**: Create account with email, password, name, and year
2. **Login**: Access the system with credentials
3. **Dashboard**: View your task overview and statistics

### For 2nd/3rd Year Students
1. **Create Tasks**: Use "Create Task" button to assign work
2. **Review Submissions**: Check "Review Queue" for pending submissions
3. **Monitor Progress**: Track completion rates and performance

### For 1st Year Students
1. **View Tasks**: Check "My Tasks" for assigned work
2. **Submit Work**: Upload proof files when完成任务
3. **Track Status**: Monitor submission review progress

## API Integration

### Supabase Functions Used
- Authentication (`supabase.auth`)
- Database operations (`supabase.from`)
- File storage (`supabase.storage`)
- Real-time subscriptions

### Key Database Tables
- `tasks`: Main task data
- `task_submissions`: Student submissions
- `proof_files`: Uploaded file metadata
- `task_reviews`: Review decisions
- `task_notifications`: System notifications
- `task_comments`: Task discussions
- `task_history`: Audit trail

## File Upload Specifications
- **Formats**: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX
- **Size Limits**: 10MB per file, 50MB total per submission
- **Storage**: Supabase Storage with signed URLs
- **Security**: Role-based access to files

## Notification Types
- Task assignments
- Due date reminders
- Submission received
- Review decisions
- Comment notifications

## Development

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

## Testing

### Demo Accounts
- **3rd Year**: demo3@ecell.com / password123
- **2nd Year**: demo2@ecell.com / password123  
- **1st Year**: demo1@ecell.com / password123

### Test Scenarios
1. **Task Creation**: 2nd/3rd year creates task for 1st year
2. **Submission**: 1st year uploads proof files
3. **Review**: 2nd/3rd year approves/rejects submission
4. **Notifications**: Check notification system works
5. **Analytics**: 3rd year views dashboard

## Troubleshooting

### Common Issues
1. **Login Fails**: Check Supabase credentials
2. **File Upload Errors**: Verify storage bucket permissions
3. **Permission Denied**: Check RLS policies
4. **Missing Notifications**: Verify real-time setup

### Debug Steps
1. Check browser console for errors
2. Verify Supabase connection
3. Test with demo accounts
4. Check database policies

## Architecture

### Frontend
- React 18 with hooks
- React Router for navigation
- Bootstrap for UI components
- Context API for state management

### Backend
- Supabase for authentication and database
- PostgreSQL with RLS policies
- File storage with signed URLs
- Real-time subscriptions

### Security
- Row Level Security (RLS) policies
- Role-based access control
- Signed URLs for file access
- Input validation and sanitization

## Deployment

### Prerequisites
- Supabase project setup
- Environment variables configured
- Database migration executed

### Steps
1. Build the application: `npm run build`
2. Deploy to hosting platform (Vercel, Netlify, etc.)
3. Configure environment variables
4. Test all functionality

## Support

For technical issues:
1. Check the troubleshooting section
2. Review Supabase logs
3. Test with demo accounts
4. Verify all setup steps completed

## Future Enhancements

Potential improvements:
- Email notifications
- Mobile app integration
- Advanced reporting features
- Calendar integration
- Task templates
- Bulk operations