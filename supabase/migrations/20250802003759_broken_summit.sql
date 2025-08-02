/*
  # Add foreign key constraint to cart_items table

  1. Foreign Key Constraints
    - Add foreign key from `cart_items.product_id` to `products.id`
    - Add foreign key from `cart_items.user_id` to `users.id`
  
  2. Security
    - Enable RLS on `cart_items` table if not already enabled
    - Add policy for users to manage their own cart items

  This migration fixes the relationship error between cart_items and products tables.
*/

-- Create cart_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Add foreign key constraints
DO $$
BEGIN
  -- Add foreign key to products table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cart_items_product_id_fkey'
    AND table_name = 'cart_items'
  ) THEN
    ALTER TABLE cart_items 
    ADD CONSTRAINT cart_items_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key to users table  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cart_items_user_id_fkey'
    AND table_name = 'cart_items'
  ) THEN
    ALTER TABLE cart_items 
    ADD CONSTRAINT cart_items_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies for cart items
DO $$
BEGIN
  -- Policy for users to manage their own cart items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cart_items' 
    AND policyname = 'Users can manage own cart items'
  ) THEN
    CREATE POLICY "Users can manage own cart items"
      ON cart_items
      FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);