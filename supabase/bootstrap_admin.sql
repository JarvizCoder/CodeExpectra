-- Bootstrap Admin User
-- Run this SQL in your Supabase SQL Editor to create or promote a user to admin
-- Replace 'admin@example.com' with the email of the user you want to make admin

-- First, ensure the user has a profile (if they registered through the app)
INSERT INTO profiles (id, email, full_name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  'PARTICIPANT'
FROM auth.users
WHERE email = 'admin@example.com'
AND id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Promote the user to ADMIN
UPDATE profiles
SET role = 'ADMIN'
WHERE email = 'admin@example.com';

-- Verify the admin user
SELECT id, email, full_name, role FROM profiles WHERE role = 'ADMIN';

-- NOTE: If you get an error that the user doesn't exist, first register them through
-- the registration page at /auth/register, then run this script again.
