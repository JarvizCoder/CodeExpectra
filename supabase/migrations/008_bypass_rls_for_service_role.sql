-- Allow service role to bypass RLS for profiles
-- This is necessary because even with service role key, some policies still get evaluated

-- Create a function to check if the current user is using service role
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role bypass: if the request is from service role, return true
  -- We can detect this by checking if the role is postgres
  RETURN current_user = 'postgres';
END;
$$;

-- Create an RPC function to insert profile bypassing RLS
CREATE OR REPLACE FUNCTION create_profile_if_not_exists(
  p_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (p_id, p_email, p_full_name, p_role)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Update profiles policies to allow service role to bypass RLS
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_service_role());

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin() OR is_service_role());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id OR is_service_role());

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR is_service_role());

-- Also update other critical policies
DROP POLICY IF EXISTS "Users can create own attempts" ON round_attempts;
CREATE POLICY "Users can create own attempts" ON round_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid() OR is_service_role());

DROP POLICY IF EXISTS "Users can update own attempts" ON round_attempts;
CREATE POLICY "Users can update own attempts" ON round_attempts
  FOR UPDATE USING (user_id = auth.uid() OR is_service_role());
