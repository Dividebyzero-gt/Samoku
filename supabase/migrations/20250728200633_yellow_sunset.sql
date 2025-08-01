/*
  # Fix infinite recursion in users table RLS policy

  1. Security Changes
    - Remove problematic admin policy that queries users table
    - Add new admin policy using JWT metadata to avoid recursion
    - Keep existing user policies for reading/updating own data

  This fixes the infinite recursion error that occurs when the admin policy
  tries to query the users table while being applied to the users table.
*/

-- Drop the problematic admin policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Create new admin policy using JWT metadata instead of querying users table
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'admin'
    OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );