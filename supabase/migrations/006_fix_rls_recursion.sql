-- Fix infinite recursion in RLS policies
-- The issue is that policies checking role via profiles table cause recursion
-- Solution: Use a security definer function to check admin status

-- First, create the security definer function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'ADMIN'
  );
END;
$$;

-- Drop and recreate admin policies for profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

-- Handle questions table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'questions') THEN
    DROP POLICY IF EXISTS "Admins can insert questions" ON questions;
    DROP POLICY IF EXISTS "Admins can update questions" ON questions;
    DROP POLICY IF EXISTS "Admins can delete questions" ON questions;

    CREATE POLICY "Admins can insert questions" ON questions
      FOR INSERT WITH CHECK (is_admin());

    CREATE POLICY "Admins can update questions" ON questions
      FOR UPDATE USING (is_admin());

    CREATE POLICY "Admins can delete questions" ON questions
      FOR DELETE USING (is_admin());
  END IF;
END $$;

-- Handle question_options table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'question_options') THEN
    DROP POLICY IF EXISTS "Admins can insert question options" ON question_options;
    DROP POLICY IF EXISTS "Admins can update question options" ON question_options;
    DROP POLICY IF EXISTS "Admins can delete question options" ON question_options;

    CREATE POLICY "Admins can insert question options" ON question_options
      FOR INSERT WITH CHECK (is_admin());

    CREATE POLICY "Admins can update question options" ON question_options
      FOR UPDATE USING (is_admin());

    CREATE POLICY "Admins can delete question options" ON question_options
      FOR DELETE USING (is_admin());
  END IF;
END $$;

-- Handle round_attempts table policies
DROP POLICY IF EXISTS "Admins can view all attempts" ON round_attempts;
CREATE POLICY "Admins can view all attempts" ON round_attempts
  FOR SELECT USING (is_admin());

-- Handle submissions table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'submissions') THEN
    DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
    CREATE POLICY "Admins can view all submissions" ON submissions
      FOR SELECT USING (is_admin());
  END IF;
END $$;

-- Handle evaluations table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'evaluations') THEN
    DROP POLICY IF EXISTS "Admins can view all evaluations" ON evaluations;
    CREATE POLICY "Admins can view all evaluations" ON evaluations
      FOR SELECT USING (is_admin());
  END IF;
END $$;

-- Handle audit_logs table policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
    DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
    CREATE POLICY "Admins can view audit logs" ON audit_logs
      FOR SELECT USING (is_admin());
  END IF;
END $$;
