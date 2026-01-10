# E-Cell Attendance & MOM Management System

A comprehensive attendance tracking and meeting management system built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## Features

### Admin Dashboard
- User approval system for council member signups
- Create attendance sessions with QR code generation
- Upload and manage Minutes of Meeting (MOM) PDFs
- Generate secure faculty access tokens
- View attendance overview for all sessions

### Council Member Dashboard
- In-app QR code scanner for marking attendance
- View personal attendance history
- Access uploaded MOMs
- Real-time attendance tracking

### Faculty Portal
- Token-based secure access (no login required)
- View all meeting sessions
- Access attendance records and MOMs
- Printable attendance sheets

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **QR Codes**: qrcode.react (generation), jsQR (scanning)
- **Forms**: React Hook Form + Zod validation
- **PDF Handling**: Supabase Storage

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd attendance-app
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql` in the SQL Editor
3. Get your project credentials from Settings > API

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create First Admin User

1. Sign up through the signup page
2. In Supabase SQL Editor, run:

```sql
UPDATE users 
SET role = 'admin', approved = true 
WHERE email = 'your-email@example.com';
```

## Usage Guide

### Admin Workflow

1. **Login** as admin
2. **Approve users** from User Management
3. **Create session** with title, description, and expiry time
4. **Generate QR code** for the session
5. **Upload MOM** PDF after the meeting
6. **Add faculty** and generate access tokens
7. **Share token link** with faculty members

### Council Member Workflow

1. **Sign up** and wait for approval
2. **Login** after approval
3. **Scan QR code** at meeting venues
4. **View attendance** history
5. **Access MOMs** for past meetings

### Faculty Workflow

1. **Receive access link** from admin
2. **View all sessions** and attendance
3. **Download MOMs** for meetings
4. **Export attendance** records

## Project Structure

```
attendance-app/
├── app/
│   ├── (auth)/              # Login, signup
│   ├── (protected)/
│   │   ├── admin/           # Admin dashboard
│   │   └── council/         # Council dashboard
│   ├── faculty/[token]/     # Faculty portal
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── admin/               # Admin components
│   ├── council/             # Council components
│   └── providers/           # React contexts
├── lib/
│   ├── supabase/            # Supabase clients
│   ├── types.ts             # TypeScript types
│   ├── validators.ts        # Zod schemas
│   ├── auth.ts              # Auth helpers
│   └── qr.ts                # QR utilities
└── supabase/
    └── schema.sql           # Database schema
```

## Security Features

- **Row Level Security (RLS)** on all database tables
- **JWT-based authentication** with Supabase Auth
- **Token-based faculty access** with expiration
- **File upload validation** (PDF only, max 10MB)
- **QR token expiration** and duplication prevention
- **Secure storage** for MOM PDFs
- **Protected API routes** with middleware

## Database Schema

- **users**: Council members with approval workflow
- **attendance_sessions**: Meeting sessions with QR tokens
- **attendance_logs**: Attendance records (unique per user/session)
- **faculty**: Faculty members database
- **faculty_view_tokens**: Secure access tokens with expiration

## API Endpoints

### Admin
- `POST /api/admin/users/approve` - Approve/reject users
- `POST /api/admin/sessions/create` - Create session
- `POST /api/admin/sessions/upload-mom` - Upload MOM PDF
- `POST /api/admin/faculty/create` - Add faculty
- `POST /api/admin/faculty/generate-token` - Generate access token

### Council
- `POST /api/council/mark-attendance` - Mark attendance via QR

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Supabase Production

1. Use production Supabase project
2. Update environment variables
3. Run schema migrations

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for E-Cell GLA University
