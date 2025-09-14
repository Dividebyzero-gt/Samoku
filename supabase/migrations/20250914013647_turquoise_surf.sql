/*
  # Create Product Variants and Reviews System

  1. New Tables
    - `product_variants` - Product variations (size, color, etc.)
    - `product_reviews` - Customer product reviews with ratings
    - `product_review_votes` - Helpfulness voting on reviews
    - `wishlists` - User wishlist functionality

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each user role
    - Ensure data isolation between vendors

  3. Indexes
    - Performance indexes for common queries
    - Foreign key relationships
*/

-- Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL, -- e.g., "Color", "Size"
  value text NOT NULL, -- e.g., "Red", "Large"
  sku text,
  price_adjustment numeric(10,2) DEFAULT 0, -- Additional cost (+) or discount (-)
  stock_quantity integer DEFAULT 0,
  image_urls text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  comment text,
  image_urls text[] DEFAULT '{}',
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT true,
  helpful_votes integer DEFAULT 0,
  total_votes integer DEFAULT 0,
  vendor_response text,
  vendor_response_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product Review Votes Table
CREATE TABLE IF NOT EXISTS product_review_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_helpful boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Wishlists Table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(is_active);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_customer_id ON product_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_approved ON product_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_product_review_votes_review_id ON product_review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_product_review_votes_user_id ON product_review_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- Enable Row Level Security
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_variants
CREATE POLICY "Anyone can read active product variants"
  ON product_variants
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Product owners can manage variants"
  ON product_variants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.owner_id = uid()
    )
  );

CREATE POLICY "Admin can manage all variants"
  ON product_variants
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for product_reviews
CREATE POLICY "Anyone can read approved reviews"
  ON product_reviews
  FOR SELECT
  TO authenticated, anon
  USING (is_approved = true);

CREATE POLICY "Users can create reviews for purchased products"
  ON product_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = uid());

CREATE POLICY "Users can update own reviews"
  ON product_reviews
  FOR UPDATE
  TO authenticated
  USING (customer_id = uid());

CREATE POLICY "Product owners can respond to reviews"
  ON product_reviews
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_reviews.product_id 
      AND products.owner_id = uid()
    )
  );

CREATE POLICY "Admin can manage all reviews"
  ON product_reviews
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for product_review_votes
CREATE POLICY "Users can vote on reviews"
  ON product_review_votes
  FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());

-- RLS Policies for wishlists
CREATE POLICY "Users can manage own wishlist"
  ON wishlists
  FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());