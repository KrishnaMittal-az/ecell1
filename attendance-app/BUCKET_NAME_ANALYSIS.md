# Storage Bucket Name Analysis Report

## Current Status: ✅ CORRECTLY CONFIGURED

After comprehensive analysis of the codebase, all storage operations are using the correct bucket name: `mom-pdfs`

## Storage Operations Using `mom-pdfs`

### 1. Upload API
**File:** `app/api/admin/sessions/upload-mom/route.ts`
- Line 38: `.from('mom-pdfs')` - Uploading files
- Line 52: `.from('mom-pdfs')` - Getting public URL

### 2. Storage Health Check API
**File:** `app/api/health/storage/route.ts`
- Line 23: `b.id === 'mom-pdfs'` - Looking for bucket
- Line 28: Message `"Storage bucket \"mom-pdfs\" not found"`
- Line 39: `.from('mom-pdfs')` - Testing file access

### 3. Database Schema
**File:** `supabase/schema.sql`
- Line 251: Creates bucket `VALUES ('mom-pdfs', 'mom-pdfs', false)`
- Lines 258, 270, 281: Storage policies reference `bucket_id = 'mom-pdfs'`

## References to "moms" (Non-Bucket Related)

### URL Routes
- `/council/moms` - Page route, not bucket name
- Used in `components/council/council-sidebar.tsx`

### Database Columns
- `sessions_with_moms` - SQL column name, descriptive
- Used in queries and documentation

## Verification Commands Run

```bash
# Search for bucket operations
grep -rn "mom-pdfs\|moms" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .

# Search for storage operations  
grep -rn "storage.*bucket\|bucket.*storage" --include="*.ts" --include="*.tsx" .

# Search for environment variables
grep -rn "process\.env\|NEXT_PUBLIC\|STORAGE_\|BUCKET_" --include="*.ts" --include="*.tsx" .
```

## Conclusion

✅ **All code is already correctly configured to use `mom-pdfs`**

The bucket name `mom-pdfs` is used consistently in:
- Upload API endpoints
- Storage health checks  
- Database schema and policies
- File access operations

**No changes required** - the codebase is already using the correct bucket name.