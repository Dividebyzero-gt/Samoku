/*
  # Fix RLS policies to prevent infinite recursion

  1. Policies
    - Remove circular references in RLS policies
    - Use auth.uid() directly instead of complex joins
    - Simplify admin access patterns

  2. Security
    - Maintain security while preventing recursion
    - Enable direct access for authenticated users to their own data
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create simple, non-recursive policies for users table
CREATE POLICY "Enable read access for own user data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update access for own user data"  
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admin access policy that doesn't cause recursion
CREATE POLICY "Enable all access for admin users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Fix stores policies
DROP POLICY IF EXISTS "Admins can manage all stores" ON stores;
DROP POLICY IF EXISTS "Anyone can read approved stores" ON stores;
DROP POLICY IF EXISTS "Vendors can manage own store" ON stores;

CREATE POLICY "Enable read for approved active stores"
  ON stores FOR SELECT
  TO authenticated
  USING (is_approved = true AND is_active = true);

CREATE POLICY "Enable store owner full access"
  ON stores FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Enable admin full access to stores"
  ON stores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );