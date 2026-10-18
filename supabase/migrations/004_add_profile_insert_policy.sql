-- Add RLS policy to allow users to insert their own profile
-- This fixes the issue where the API cannot create profiles due to RLS

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
