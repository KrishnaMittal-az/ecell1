# Is the Database Connected to Store PDFs?

## ✅ Yes - Here's How It Works

The system uses **Supabase** which provides both:
1. **Database** (PostgreSQL) - Stores data
2. **Storage** (Object Storage) - Stores PDFs

## 📁 PDF Storage Architecture

```
Admin uploads PDF → Supabase Storage (mom-pdfs bucket) → URL saved to database
```

### What Gets Stored Where?

| Storage Type | What's Stored | Example |
|--------------|---------------|---------|
| **Supabase Storage** | Actual PDF files | `session123-1704892800.pdf` |
| **Database** | PDF URLs | `https://xxx.supabase.co/storage/v1/object/public/mom-pdfs/...` |

## 🔧 Setup Requirements

### 1. Run the Schema SQL

The `supabase/schema.sql` file creates **BOTH**:
- ✅ Database tables
- ✅ Storage bucket (`mom-pdfs`)

```sql
-- This line creates the storage bucket:
INSERT INTO storage.buckets (id, name, public)
VALUES ('mom-pdfs', 'mom-pdfs', false);
```

### 2. Configure Environment Variables

Your `.env.local` needs Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## ✅ How to Verify It's Working

### Option 1: Health Check API (Easiest)

1. Start the app: `npm run dev`
2. Visit: `http://localhost:3000/api/health/storage`
3. Look for: `"status": "healthy"`

### Option 2: Admin Dashboard

1. Login as admin
2. Check the "System Health Check" card
3. Should show green checkmarks ✅

### Option 3: Manual Test

1. Login as admin
2. Create a session
3. Upload a test PDF
4. Check Supabase Dashboard → Storage → `mom-pdfs` folder
5. File should appear there

## 🚨 Common Issues

### "Storage bucket not found"

**Problem**: The `schema.sql` wasn't executed completely

**Solution**:
1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire `schema.sql` file
3. Execute it
4. Or manually create bucket in Storage section

### "Cannot upload files"

**Problem**: Storage policies not created

**Solution**:
- Re-run the storage policies section from `schema.sql`
- Check you're logged in as an approved admin

## 📚 Documentation Files

For more details, see:
- **[SETUP.md](./SETUP.md)** - Complete setup guide
- **[DATABASE_STORAGE_INFO.md](./DATABASE_STORAGE_INFO.md)** - Detailed architecture
- **[SUPABASE_CHECKLIST.md](./SUPABASE_CHECKLIST.md)** - Verification checklist

## 🎯 Quick Summary

**Question**: Is the database connected to store PDFs?

**Answer**: Yes! The system is fully configured to:
- ✅ Store PDF files in Supabase Storage
- ✅ Save PDF URLs in the database
- ✅ Secure access with Row Level Security
- ✅ Allow only admins to upload
- ✅ Let council members and faculty view with proper authentication

**Next Step**: Run the `schema.sql` in your Supabase project to activate everything!

---

**Run this to check your setup:**
```bash
./verify-setup.sh
```
