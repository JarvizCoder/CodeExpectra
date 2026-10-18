# Quick Setup Guide - Fixing Current Issues

## Issue 1: Admin Portal Button Not Showing

The admin portal button only appears when the user's role is set to 'ADMIN' in the database.

### Solution: Bootstrap Admin User

After logging in, run this command in your terminal (replace with your email):

```bash
curl -X POST http://localhost:3000/api/bootstrap-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

Or use the manual SQL method:

1. Go to your Supabase project SQL Editor
2. Run the script in `supabase/bootstrap_admin.sql`
3. Replace `'admin@example.com'` with your email
4. After running it, refresh your dashboard

## Issue 2: "Failed to start attempt" Error

This error occurs when the database trigger for creating user profiles isn't working correctly.

### Solution: Apply Migration

1. Go to your Supabase project SQL Editor
2. Run the migration file: `supabase/migrations/003_fix_role_trigger.sql`

This will:
- Fix the profile creation trigger
- Create profiles for existing users who don't have one

### Alternative: Manual Profile Creation

If the migration doesn't work, run this SQL in Supabase SQL Editor:

```sql
-- Create profiles for all users who don't have one
INSERT INTO profiles (id, email, full_name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', ''),
  COALESCE(raw_user_meta_data->>'role', 'PARTICIPANT')
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;
```

## Complete Setup Steps

If you're setting up fresh:

1. **Run migrations in order:**
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`
   - `supabase/migrations/003_fix_role_trigger.sql`
   - `supabase/migrations/004_add_profile_insert_policy.sql`
   - `supabase/migrations/005_admin_question_policies.sql`

2. **Create `.env.local`** with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Optional - for AI question generation
   OPENAI_API_KEY=your_openai_api_key

   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Start the dev server:**
   ```bash
   npm run dev
   ```

4. **Register and login** at `http://localhost:3000/auth/register`

5. **Bootstrap admin** using the curl command above

6. **Refresh dashboard** - you should now see the Admin Portal button

## New Feature: Question Manager

The admin portal now includes a **Question Manager** that allows you to:

### Manual Question Creation
- Create quiz questions with multiple-choice options
- Set difficulty levels (Easy, Medium, Hard)
- Assign points to questions
- Mark correct answers
- Delete questions

### AI-Powered Question Generation
- Generate quiz questions from documents/text content
- Generate questions from YouTube videos (requires transcript service setup)
- Uses OpenAI GPT-4 to create 5 questions at a time
- Automatically formats questions with options and correct answers

**To use AI generation:**
1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Add it to your `.env.local`: `OPENAI_API_KEY=your_key_here`
3. Go to Admin Portal > Question Manager
4. Click "✨ AI Generate Questions"
5. Paste your document content or YouTube URL
6. Select the target round
7. Click "Generate Questions"

## Verification

After applying fixes:

1. Check that you can see the Admin Portal button on the dashboard
2. Click "Start Round" on Quiz Battle - it should load the quiz questions
3. Answer questions and submit - scores should be saved to the database
4. Go to Admin Portal - you should see participants and round management options
5. Click "Question Manager" - you should be able to create new questions

## Troubleshooting

### Still can't see Admin Portal button?
- Run this SQL in Supabase to check your role:
  ```sql
  SELECT id, email, full_name, role FROM profiles WHERE email = 'your-email@example.com';
  ```
- If role is not 'ADMIN', manually update it:
  ```sql
  UPDATE profiles SET role = 'ADMIN' WHERE email = 'your-email@example.com';
  ```

### Still getting "Failed to start attempt"?
- Check that your profile exists:
  ```sql
  SELECT * FROM profiles WHERE id = 'your-user-id';
  ```
- Check that the Quiz Battle round is OPEN:
  ```sql
  SELECT * FROM rounds WHERE name = 'Quiz Battle';
  ```
- If status is not 'OPEN', update it:
  ```sql
  UPDATE rounds SET status = 'OPEN' WHERE name = 'Quiz Battle';
  ```

### AI generation not working?
- Check that OPENAI_API_KEY is set in `.env.local`
- Verify your OpenAI API key has credits
- Check the browser console for error messages
- Note: YouTube transcript extraction requires additional setup (youtube-transcript-api or similar service)
