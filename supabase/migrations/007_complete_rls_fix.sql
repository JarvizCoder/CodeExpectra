-- Complete fix for all RLS policies that cause recursion
-- This replaces ALL policies that check the profiles table with the is_admin() function

-- Ensure the is_admin function exists (create or replace)
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

-- Drop ALL existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Anyone can view basic round info" ON rounds;
DROP POLICY IF EXISTS "Anyone can view non-sensitive question info" ON questions;
DROP POLICY IF EXISTS "Anyone can view question options" ON question_options;
DROP POLICY IF EXISTS "Only admins can view all test cases" ON test_cases;
DROP POLICY IF EXISTS "Participants can only view non-hidden test cases" ON test_cases;
DROP POLICY IF EXISTS "Users can view own attempts" ON round_attempts;
DROP POLICY IF EXISTS "Admins can view all attempts" ON round_attempts;
DROP POLICY IF EXISTS "Users can create own attempts" ON round_attempts;
DROP POLICY IF EXISTS "Users can update own attempts" ON round_attempts;
DROP POLICY IF EXISTS "Users can view own saved answers" ON saved_answers;
DROP POLICY IF EXISTS "Users can create own saved answers" ON saved_answers;
DROP POLICY IF EXISTS "Users can update own saved answers" ON saved_answers;
DROP POLICY IF EXISTS "Users can view own submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Users can create own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can view own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Admins can view all evaluations" ON evaluations;
DROP POLICY IF EXISTS "Anyone can view published results" ON round_results;
DROP POLICY IF EXISTS "Anyone can view qualification decisions" ON qualification_decisions;
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

DROP POLICY IF EXISTS "Admins can insert questions" ON questions;
DROP POLICY IF EXISTS "Admins can update questions" ON questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON questions;
DROP POLICY IF EXISTS "Admins can insert question options" ON question_options;
DROP POLICY IF EXISTS "Admins can update question options" ON question_options;
DROP POLICY IF EXISTS "Admins can delete question options" ON question_options;

-- Recreate all policies with the is_admin() function
-- Using DROP POLICY IF EXISTS before each CREATE to handle existing policies

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Events
DROP POLICY IF EXISTS "Anyone can view events" ON events;
CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (true);

-- Registrations
DROP POLICY IF EXISTS "Users can view own registrations" ON registrations;
CREATE POLICY "Users can view own registrations" ON registrations
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create registrations" ON registrations;
CREATE POLICY "Users can create registrations" ON registrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Rounds
DROP POLICY IF EXISTS "Anyone can view basic round info" ON rounds;
CREATE POLICY "Anyone can view basic round info" ON rounds
  FOR SELECT USING (true);

-- Questions
DROP POLICY IF EXISTS "Anyone can view non-sensitive question info" ON questions;
CREATE POLICY "Anyone can view non-sensitive question info" ON questions
  FOR SELECT USING (
    NOT EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = questions.round_id
      AND r.status = 'LOCKED'
    )
  );

DROP POLICY IF EXISTS "Admins can insert questions" ON questions;
CREATE POLICY "Admins can insert questions" ON questions
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update questions" ON questions;
CREATE POLICY "Admins can update questions" ON questions
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete questions" ON questions;
CREATE POLICY "Admins can delete questions" ON questions
  FOR DELETE USING (is_admin());

-- Question Options
DROP POLICY IF EXISTS "Anyone can view question options" ON question_options;
CREATE POLICY "Anyone can view question options" ON question_options
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert question options" ON question_options;
CREATE POLICY "Admins can insert question options" ON question_options
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update question options" ON question_options;
CREATE POLICY "Admins can update question options" ON question_options
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete question options" ON question_options;
CREATE POLICY "Admins can delete question options" ON question_options
  FOR DELETE USING (is_admin());

-- Test Cases
DROP POLICY IF EXISTS "Only admins can view all test cases" ON test_cases;
CREATE POLICY "Only admins can view all test cases" ON test_cases
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Participants can only view non-hidden test cases" ON test_cases;
CREATE POLICY "Participants can only view non-hidden test cases" ON test_cases
  FOR SELECT USING (
    NOT is_hidden AND
    EXISTS (
      SELECT 1 FROM questions q
      JOIN rounds r ON q.id = test_cases.question_id
      WHERE q.id = test_cases.question_id
      AND r.status = 'OPEN'
    )
  );

-- Round Attempts
DROP POLICY IF EXISTS "Users can view own attempts" ON round_attempts;
CREATE POLICY "Users can view own attempts" ON round_attempts
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all attempts" ON round_attempts;
CREATE POLICY "Admins can view all attempts" ON round_attempts
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Users can create own attempts" ON round_attempts;
CREATE POLICY "Users can create own attempts" ON round_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own attempts" ON round_attempts;
CREATE POLICY "Users can update own attempts" ON round_attempts
  FOR UPDATE USING (user_id = auth.uid());

-- Saved Answers
DROP POLICY IF EXISTS "Users can view own saved answers" ON saved_answers;
CREATE POLICY "Users can view own saved answers" ON saved_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM round_attempts ra
      WHERE ra.id = saved_answers.attempt_id
      AND ra.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own saved answers" ON saved_answers;
CREATE POLICY "Users can create own saved answers" ON saved_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM round_attempts ra
      WHERE ra.id = saved_answers.attempt_id
      AND ra.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own saved answers" ON saved_answers;
CREATE POLICY "Users can update own saved answers" ON saved_answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM round_attempts ra
      WHERE ra.id = saved_answers.attempt_id
      AND ra.user_id = auth.uid()
    )
  );

-- Submissions
DROP POLICY IF EXISTS "Users can view own submissions" ON submissions;
CREATE POLICY "Users can view own submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM round_attempts ra
      WHERE ra.id = submissions.attempt_id
      AND ra.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
CREATE POLICY "Admins can view all submissions" ON submissions
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Users can create own submissions" ON submissions;
CREATE POLICY "Users can create own submissions" ON submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM round_attempts ra
      WHERE ra.id = submissions.attempt_id
      AND ra.user_id = auth.uid()
    )
  );

-- Evaluations
DROP POLICY IF EXISTS "Users can view own evaluations" ON evaluations;
CREATE POLICY "Users can view own evaluations" ON evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM submissions s
      JOIN round_attempts ra ON s.id = evaluations.submission_id
      WHERE s.id = evaluations.submission_id
      AND ra.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all evaluations" ON evaluations;
CREATE POLICY "Admins can view all evaluations" ON evaluations
  FOR SELECT USING (is_admin());

-- Round Results
DROP POLICY IF EXISTS "Anyone can view published results" ON round_results;
CREATE POLICY "Anyone can view published results" ON round_results
  FOR SELECT USING (true);

-- Qualification Decisions
DROP POLICY IF EXISTS "Anyone can view qualification decisions" ON qualification_decisions;
CREATE POLICY "Anyone can view qualification decisions" ON qualification_decisions
  FOR SELECT USING (true);

-- Audit Logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (is_admin());
