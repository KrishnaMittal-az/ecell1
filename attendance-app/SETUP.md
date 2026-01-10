# E-Cell Attendance System - Setup Guide

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Supabase account (free tier works)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd attendance-app
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: e-cell-attendance (or your choice)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your location
4. Wait for project to be created (~2 minutes)

### 3. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`, keep this secret!)

### 4. Configure Environment Variables

1. In the `attendance-app` directory, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace with your actual values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 5. Setup Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open `attendance-app/supabase/schema.sql` in a text editor
4. Copy the **entire contents**
5. Paste into the Supabase SQL Editor
6. Click **RUN** (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned" (this is correct!)

### 6. Verify Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. You should see a bucket named **mom-pdfs**
3. If not visible, click "New bucket" and create:
   - **Name**: `mom-pdfs`
   - **Public**: Unchecked (private bucket)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `application/pdf`

### 7. Start the Development Server

```bash
npm run dev
```

The app should now be running at [http://localhost:3000](http://localhost:3000)

### 8. Verify Setup

Visit these health check endpoints in your browser:

- **Database Check**: [http://localhost:3000/api/health/database](http://localhost:3000/api/health/database)
- **Storage Check**: [http://localhost:3000/api/health/storage](http://localhost:3000/api/health/storage)

Both should return `"status": "healthy"`

### 9. Create First Admin User

1. Go to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Sign up with your details
3. In Supabase dashboard, go to **SQL Editor**
4. Run this query (replace with your email):

```sql
UPDATE users 
SET role = 'admin', approved = true 
WHERE email = 'your-email@example.com';
```

5. Now you can login as admin!

## Troubleshooting

### Issue: "No rows returned" or "Table does not exist"

**Solution**: Re-run the schema.sql file in Supabase SQL Editor

### Issue: "Storage bucket not found"

**Solution**: 
1. Go to Supabase **Storage**
2. Create bucket manually named `mom-pdfs` (public: false)
3. Or re-run the storage section from schema.sql

### Issue: "Failed to fetch" errors

**Solution**: Check your `.env.local`:
- Ensure URLs don't have trailing slashes
- Verify keys are copied correctly (no extra spaces)
- Restart the dev server after changing env files

### Issue: Cannot upload PDFs

**Solution**:
1. Check storage health: [http://localhost:3000/api/health/storage](http://localhost:3000/api/health/storage)
2. Verify RLS policies were created (in schema.sql)
3. Check Supabase Storage → Policies tab
4. Ensure file size is under 10MB

### Issue: "User not approved" after login

**Solution**: Run the SQL query to approve your user (step 9 above)

## Testing the System

### Test Admin Functions
1. Login as admin
2. Go to **User Management** → Approve test users
3. Go to **Sessions** → Create a new session
4. Click "View QR" to see the QR code
5. Upload a test PDF as MOM

### Test Council Member Functions
1. Create a second user account
2. As admin, approve this user
3. Login as the council member
4. Go to **Scan QR** → Allow camera access
5. Scan the QR code you generated earlier
6. Check **My Attendance** to see the record

### Test Faculty Portal
1. As admin, go to **Faculty Management**
2. Add a faculty member
3. Generate an access token for them
4. Copy the token link
5. Open the link in an incognito window
6. You should see the sessions and attendance

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment instructions.

## Need Help?

- Check the [README.md](./README.md) for detailed documentation
- Review the [API documentation](./README.md#api-endpoints)
- Open an issue on GitHub

---

**Security Note**: Never commit your `.env.local` file to git. The `.gitignore` is already configured to exclude it.
