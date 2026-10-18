-- Add UPDATE policy for rounds table to allow admins to update round status
DROP POLICY IF EXISTS "Admins can update rounds" ON rounds;

CREATE POLICY "Admins can update rounds" ON rounds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
