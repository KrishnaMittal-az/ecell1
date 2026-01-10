# Database & Storage Configuration Guide

## 📊 Overview

The E-Cell Attendance & MOM Management system uses **Supabase** for both database storage (PostgreSQL) and file storage (Supabase Storage). This document explains how PDFs are stored and accessed.

## 🗄️ Database vs Storage

### Database (PostgreSQL)
Stores structured data:
- User accounts and roles
- Attendance sessions
- Attendance logs
- Faculty information
- Access tokens

### Storage (Supabase Storage)
Stores binary files:
- **MOM PDFs** in the `mom-pdfs` bucket
- Files are stored with unique filenames
- URLs are saved in the database for reference

## 📁 PDF Storage Architecture

### How PDFs are Stored

```
┌─────────────────────────────────────────────┐
│  Admin uploads PDF via Upload MOM dialog    │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│  API Route: /api/admin/sessions/upload-mom  │
│  - Validates PDF (type, size < 10MB)        │
│  - Generates unique filename                 │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│  Supabase Storage: mom-pdfs bucket          │
│  - File stored: {sessionId}-{timestamp}.pdf │
│  - Returns public URL                        │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│  Database: attendance_sessions table        │
│  - mom_pdf_url column updated with URL      │
└─────────────────────────────────────────────┘
```

### Storage Bucket Details

**Bucket Name**: `mom-pdfs`
- **Type**: Private (not publicly accessible)
- **Location**: Created by `schema.sql`
- **Security**: Protected by Row Level Security (RLS)
- **File Naming**: `{sessionId}-{timestamp}.pdf`

## 🔐 Security & Access Control

### Who Can Upload PDFs?

Only **approved admins** can upload:
```sql
-- Storage policy from schema.sql
CREATE POLICY "Admins can upload MOMs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'mom-pdfs'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
      AND approved = true
    )
  );
```

### Who Can View PDFs?

Three groups can view PDFs:

1. **Approved Council Members**
   - Can view via Council Dashboard → MOMs
   - Must be logged in and approved

2. **Faculty with Valid Tokens**
   - Token-based access (no login required)
   - Time-limited access
   - Token must not be expired

3. **Admins**
   - Full access to all PDFs
   - Can view, upload, and delete

## 🔗 How PDF URLs Work

### URL Structure

When a PDF is uploaded, Supabase generates a URL:
```
https://{project-id}.supabase.co/storage/v1/object/public/mom-pdfs/{filename}
```

### URL Storage

The URL is stored in the database:
```sql
-- attendance_sessions table
CREATE TABLE attendance_sessions (
  ...
  mom_pdf_url TEXT,  -- Stores the full URL
  ...
);
```

### URL Access

The URL can be accessed:
- **Direct link**: Opens PDF in browser
- **API endpoint**: Serves with authentication check
- **Signed URL**: Temporary access for faculty

## 📝 Code Reference

### Upload Logic
File: `app/api/admin/sessions/upload-mom/route.ts`

```typescript
// 1. Validate file
if (file.type !== 'application/pdf') { /* error */ }
if (file.size > 10 * 1024 * 1024) { /* error */ }

// 2. Upload to storage
const fileName = `${sessionId}-${Date.now()}.pdf`;
const { data: uploadData } = await supabase.storage
  .from('mom-pdfs')
  .upload(fileName, file);

// 3. Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('mom-pdfs')
  .getPublicUrl(uploadData.path);

// 4. Save URL to database
await supabase
  .from('attendance_sessions')
  .update({ mom_pdf_url: publicUrl })
  .eq('id', sessionId);
```

### View Logic
File: `app/(protected)/council/moms/page.tsx`

```typescript
// Fetch sessions with MOMs
const { data } = await supabase
  .from('attendance_sessions')
  .select('id, title, description, created_at, mom_pdf_url')
  .not('mom_pdf_url', 'is', null);

// Display PDFs
<a href={session.mom_pdf_url} target="_blank">
  View MOM
</a>
```

## 🛠️ Setup Requirements

### 1. Storage Bucket Creation

The `schema.sql` file includes:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('mom-pdfs', 'mom-pdfs', false);
```

**Important**: This must be executed for PDF storage to work!

### 2. Storage Policies

Three policies are created:
1. **Upload**: Admins only
2. **View**: Authenticated users
3. **Delete**: Admins only

### 3. Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## ✅ Verification Steps

### Step 1: Check Bucket Exists

**Method 1 - Supabase Dashboard**:
1. Go to Storage section
2. Look for `mom-pdfs` bucket
3. Should be marked as "Private"

**Method 2 - Health Check API**:
```bash
curl http://localhost:3000/api/health/storage
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "supabaseConnection": true,
    "storageBucket": true,
    "storageAccess": true
  }
}
```

### Step 2: Test Upload

1. Login as admin
2. Create a test session
3. Upload a small PDF (< 10MB)
4. Check Supabase Storage → `mom-pdfs` → File should appear

### Step 3: Test Access

1. As council member: View MOMs page
2. As faculty: Use generated token link
3. Both should be able to access the PDF

## 🐛 Troubleshooting

### Issue: Bucket not found

**Symptoms**:
- Upload fails with "bucket not found"
- Health check shows `storageBucket: false`

**Solution**:
1. Re-run `schema.sql` in Supabase SQL Editor
2. Or manually create bucket:
   - Go to Storage → New Bucket
   - Name: `mom-pdfs`
   - Public: Unchecked

### Issue: Upload permission denied

**Symptoms**:
- Admin cannot upload files
- Error: "new row violates row-level security policy"

**Solution**:
1. Verify user is admin: `SELECT role FROM users WHERE id = '...'`
2. Verify RLS policies exist:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'storage';
   ```
3. Re-run storage policies section from `schema.sql`

### Issue: PDF URL not accessible

**Symptoms**:
- URL returns 404 or access denied
- Council members/faculty cannot view

**Solution**:
1. Check if URL is stored correctly in database
2. Verify storage policies allow viewing
3. Ensure user is authenticated (for council)
4. Verify token is not expired (for faculty)

### Issue: File size limit

**Symptoms**:
- Large files fail to upload
- No error message shown

**Solution**:
- Current limit: 10MB (defined in code)
- To increase, modify `app/api/admin/sessions/upload-mom/route.ts`
- Also update Supabase bucket settings

## 📊 Storage Monitoring

### Check Storage Usage

**Supabase Dashboard**:
- Settings → Usage
- View "Storage" section
- Monitor file count and size

### View All Uploaded Files

**SQL Query**:
```sql
SELECT 
  name, 
  created_at, 
  metadata->>'size' as size_bytes
FROM storage.objects 
WHERE bucket_id = 'mom-pdfs'
ORDER BY created_at DESC;
```

### Count MOMs per Session

```sql
SELECT 
  COUNT(*) as total_sessions,
  COUNT(mom_pdf_url) as sessions_with_moms,
  COUNT(*) - COUNT(mom_pdf_url) as sessions_without_moms
FROM attendance_sessions;
```

## 🔒 Security Best Practices

1. **Never make bucket public**: Keep `public: false`
2. **Use signed URLs for temporary access**: For faculty tokens
3. **Validate file types**: Only allow PDFs
4. **Enforce size limits**: Prevent storage abuse
5. **Regular backups**: Use Supabase backup features
6. **Monitor access logs**: Check Storage logs regularly
7. **Rotate faculty tokens**: Set reasonable expiration times

## 📚 Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage/uploads)

---

**Last Updated**: January 2025  
**Maintained by**: E-Cell Development Team
