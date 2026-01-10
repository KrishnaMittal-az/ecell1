# Supabase Setup Checklist

Quick reference to ensure your Supabase database and storage are properly configured for PDF storage.

## ✅ Pre-Setup Checklist

- [ ] Supabase account created
- [ ] New project created
- [ ] Project URL and API keys copied
- [ ] `.env.local` file configured with credentials

## ✅ Database Setup

### Run Schema SQL

1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `supabase/schema.sql`
3. Paste and execute
4. Verify success message

### Verify Tables Created

Run this query in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected tables:
- [x] users
- [x] attendance_sessions
- [x] attendance_logs
- [x] faculty
- [x] faculty_view_tokens

### Verify RLS Enabled

Run this query:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`

## ✅ Storage Setup

### Verify Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Check for bucket: **mom-pdfs**
3. Settings should be:
   - Public: ❌ (private)
   - File size limit: 10 MB
   - Allowed MIME types: application/pdf

### Create Bucket Manually (if needed)

If bucket doesn't exist:
1. Click "New bucket"
2. Name: `mom-pdfs`
3. Public: Uncheck
4. Click "Create bucket"

### Verify Storage Policies

Run in SQL Editor:
```sql
SELECT policyname, tablename, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage';
```

Expected policies on `storage.objects`:
- Admins can upload MOMs
- Authenticated users can view MOMs
- Admins can delete MOMs

## ✅ Test Database Connection

### Method 1: Health Check API

Start your dev server and visit:
```
http://localhost:3000/api/health/database
http://localhost:3000/api/health/storage
```

Both should return `"status": "healthy"`

### Method 2: Admin Dashboard

1. Login as admin
2. Check the "System Health Check" card on dashboard
3. All checks should be green ✅

### Method 3: Manual SQL Query

Run in Supabase SQL Editor:
```sql
-- Test users table
SELECT COUNT(*) FROM users;

-- Test sessions table
SELECT COUNT(*) FROM attendance_sessions;

-- Test storage bucket
SELECT * FROM storage.buckets WHERE id = 'mom-pdfs';
```

## ✅ Test PDF Storage

### Upload Test

1. Login as admin
2. Create a test session
3. Try uploading a small PDF file
4. Check Supabase Storage → mom-pdfs to see the file

### Verify File Access

1. After upload, note the file URL
2. Try accessing it (should require authentication)
3. Check in faculty portal (should work with valid token)

## 🔧 Troubleshooting

### Issue: Tables not found
```bash
# Solution: Re-run schema.sql
```

### Issue: Storage bucket not found
```sql
-- Run this in SQL Editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('mom-pdfs', 'mom-pdfs', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
```

### Issue: Cannot upload files
```sql
-- Check storage policies exist:
SELECT * FROM pg_policies WHERE schemaname = 'storage';

-- If none found, re-run the storage policy section from schema.sql
```

### Issue: RLS blocking requests
```sql
-- Temporarily disable RLS for testing (NOT for production):
ALTER TABLE attendance_sessions DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing:
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
```

### Issue: Environment variables not working
1. Ensure no trailing slashes in URLs
2. Restart dev server after .env.local changes
3. Verify keys have no extra spaces/newlines
4. Check keys match Supabase dashboard exactly

## 📊 Monitoring

### Check Storage Usage

Dashboard → Settings → Usage
- Storage: Check current usage
- Bandwidth: Monitor file access

### Check Database Connections

Dashboard → Database → Connection Pooling
- Verify connection count
- Check for connection leaks

### View Logs

Dashboard → Logs
- Database: SQL query logs
- Storage: Upload/download logs
- Auth: Authentication logs

## 🔐 Security Verification

### Verify RLS is Active

Try these queries as a non-admin user (should fail):
```sql
DELETE FROM attendance_sessions WHERE id = '...';
UPDATE users SET role = 'admin' WHERE id = auth.uid();
```

### Test Storage Security

1. Try accessing PDF URL without authentication (should fail)
2. Try uploading as non-admin (should fail)
3. Generate faculty token and verify access works

## ✅ Production Checklist

Before deploying to production:

- [ ] All health checks pass
- [ ] Test data cleared
- [ ] First admin user created and tested
- [ ] Environment variables set in Vercel
- [ ] Database backups configured
- [ ] Storage quotas reviewed
- [ ] RLS policies tested thoroughly
- [ ] API rate limits configured
- [ ] Error monitoring setup

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Storage Guide**: https://supabase.com/docs/guides/storage
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Community**: https://github.com/supabase/supabase/discussions

---

**Last Updated**: After schema.sql execution
**Version**: 1.0
