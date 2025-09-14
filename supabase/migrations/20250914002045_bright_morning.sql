/*
  # Add anonymous access to products

  1. Security Changes
    - Add policy for anonymous users to read active products
    - Allows non-logged in users to browse the marketplace
    - Maintains security for product management operations

  2. Policy Details
    - Anonymous users can only SELECT active products
    - No access to inactive or draft products
    - Read-only access for browsing and purchasing
*/

-- Add policy for anonymous users to read active products
CREATE POLICY "Anonymous users can read active products"
  ON products
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Add policy for anonymous users to read approved active stores
CREATE POLICY "Anonymous users can read approved active stores"
  ON stores
  FOR SELECT
  TO anon
  USING (is_approved = true AND is_active = true);