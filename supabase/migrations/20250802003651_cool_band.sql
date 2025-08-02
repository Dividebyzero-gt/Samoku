/*
  # Create cart_items table

  1. New Tables
    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer, default 1)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `cart_items` table
    - Add policy for users to manage their own cart items
    - Add policy for admins to manage all cart items

  3. Indexes
    - Add index on user_id for faster cart retrieval
    - Add index on product_id for better join performance
    - Add unique constraint on user_id + product_id combination
*/

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint to prevent duplicate cart items for same user/product
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'cart_items_user_product_unique'
    AND table_name = 'cart_items'
  ) THEN
    ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_product_unique UNIQUE (user_id, product_id);
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items (product_id);

-- Enable Row Level Security
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own cart items
CREATE POLICY IF NOT EXISTS "Users can manage own cart items"
  ON cart_items
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Admin can manage all cart items
CREATE POLICY IF NOT EXISTS "Admin can manage all cart items"
  ON cart_items
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_items_updated_at();