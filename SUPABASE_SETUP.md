# LifeDesk AI — Supabase Production Setup Guide

This guide details how to configure a free, production-ready Supabase PostgreSQL backend with Row Level Security (RLS) for LifeDesk AI.

---

## 1. Create a Supabase Project

1. Navigate to [Supabase](https://supabase.com) and sign in.
2. Click **New project**.
3. Fill in the project details:
   - **Name**: `lifedesk-ai` (or your preferred name)
   - **Database Password**: Choose a strong, secure password and record it safely.
   - **Region**: Choose a cloud region closest to your users.
   - **Pricing Plan**: Free Tier.
4. Click **Create new project** and wait ~1-2 minutes for provisioning to complete.

---

## 2. Execute the Database Migration Schema

1. In your Supabase dashboard, click **SQL Editor** from the left navigation sidebar.
2. Click **New query**.
3. Open the file `supabase/schema.sql` from the LifeDesk AI project root.
4. Paste the entire SQL schema into the query editor.
5. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).

### What this migration creates:
- **`public.profiles`**: Stores user display names, email addresses, and avatar URLs.
- **`public.tasks`**: Stores tasks with priority (`High`, `Medium`, `Low`), status (`Pending`, `In Progress`, `Completed`), and due dates.
- **`public.notes`**: Stores rich notes, tags, and AI-generated executive summaries.
- **`public.expenses`**: Stores transaction logs, categories, amounts, and dates.
- **`public.documents`**: Stores uploaded document metadata, extracted text, and summaries.
- **`public.ai_chat_history`**: Stores conversational memory and intelligence history.
- **Database Trigger (`on_auth_user_created`)**: Automatically creates a record in `public.profiles` when a user signs up.
- **Automated Timestamp Triggers**: Keeps `updated_at` timestamps accurate across all tables.

---

## 3. Verify Row Level Security (RLS)

LifeDesk AI enforces strict multi-tenant data isolation. Each user can only read, insert, update, and delete their own rows.

To verify RLS is active:
1. Go to **Table Editor** in the Supabase dashboard.
2. Click on each table (`profiles`, `tasks`, `notes`, `expenses`, `documents`, `ai_chat_history`).
3. Confirm that each table displays the green badge: **RLS Enabled**.
4. Click on **Authentication** > **Policies** to confirm that the policies (e.g., `Users can view own tasks`, `Users can insert own tasks`, etc.) are active.

---

## 4. Retrieve API Credentials

1. In the Supabase dashboard, navigate to **Project Settings** (gear icon) > **API**.
2. Locate the following values:
   - **Project URL**: e.g., `https://xyzcompany.supabase.co`
   - **Project API Keys**:
     - `anon` `public`: The safe client-side key.
     - `service_role` `secret`: The elevated server key (keep private!).

---

## 5. Configure LifeDesk AI Environment Variables

### In Local Development (`.env`):
```env
VITE_SUPABASE_URL="https://xyzcompany.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key-here"
```

### In Production Hosting (Vercel / Netlify / Render / GitHub Secrets):
Add these environment variables to your hosting dashboard:
- `VITE_SUPABASE_URL`: `https://xyzcompany.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `your-anon-public-key-here`
- `GEMINI_API_KEY`: `your-google-gemini-api-key`
- 

---

## 6. Authentication Settings & Redirect URLs

1. In your Supabase dashboard, navigate to **Authentication** > **URL Configuration**.
2. Under **Site URL**, set your production live website domain (e.g. `https://your-domain.vercel.app` or `https://your-username.github.io/lifedesk-ai`).
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/**`
   - `https://your-domain.vercel.app/**`
   - `https://your-domain.netlify.app/**`
4. Click **Save**.

---

## 7. Storage Bucket Setup (Optional for Document Blobs)

If you plan to store raw binary document uploads (PDFs, images) in Supabase Storage:
1. Go to **Storage** in the Supabase dashboard.
2. Click **New bucket**.
3. Name it: `documents`.
4. Set visibility: **Private**.
5. Click **Save bucket**.
6. Add an RLS policy for the `documents` bucket:
   - Allow authenticated users to upload and read files in `(storage.foldername(name))[1] = auth.uid()::text`.
