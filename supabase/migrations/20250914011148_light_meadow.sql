/*
  # Enhanced Product Management Schema

  1. New Tables
    - `product_variants` - Product variations (size, color, etc.)
    - `product_reviews` - Customer product reviews and ratings
    - `wishlists` - Customer wishlist functionality
    - `vendor_applications` - Enhanced vendor onboarding
    - `store_customizations` - Store branding and customization

  2. Security
    - Enable RLS on all new tables
    - Add policies for customers, vendors, and admins
    - Proper access controls for sensitive data

  3. Features
    - Product variant management with inventory tracking
    - Review system with photo uploads
    - Wishlist functionality for customers
    - Enhanced vendor onboarding process
*/

-- Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL, -- e.g., "Color", "Size", "Material"
  value text NOT NULL, -- e.g., "Red", "Large", "Cotton"
  sku text,
  price_adjustment numeric(10,2) DEFAULT 0, -- Additional cost/discount for this variant
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

-- Wishlists Table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Vendor Applications Table (Enhanced)
CREATE TABLE IF NOT EXISTS vendor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type text NOT NULL, -- 'individual', 'llc', 'corporation', etc.
  business_registration_number text,
  tax_id text,
  business_address jsonb NOT NULL,
  contact_person text NOT NULL,
  phone text NOT NULL,
  website text,
  business_description text NOT NULL,
  product_categories text[] NOT NULL,
  expected_monthly_sales numeric(12,2),
  previous_experience text,
  documents jsonb DEFAULT '{}', -- Store uploaded document URLs
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  review_notes text,
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Store Customizations Table
CREATE TABLE IF NOT EXISTS store_customizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  theme_color text DEFAULT '#3B82F6',
  banner_image text,
  logo_image text,
  cover_image text,
  custom_css text,
  social_links jsonb DEFAULT '{}',
  business_hours jsonb DEFAULT '{}',
  return_policy text,
  shipping_policy text,
  about_section text,
  featured_products uuid[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id)
);

-- Commission Transactions Table
CREATE TABLE IF NOT EXISTS commission_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sale_amount numeric(12,2) NOT NULL,
  commission_rate numeric(5,2) NOT NULL,
  commission_amount numeric(12,2) NOT NULL,
  platform_fee numeric(12,2) DEFAULT 0,
  net_amount numeric(12,2) NOT NULL, -- Amount vendor receives
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  payout_id uuid REFERENCES payouts(id),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
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

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_review_votes ENABLE ROW LEVEL SECURITY;

-- Product Variants Policies
CREATE POLICY "Anyone can read active product variants"
  ON product_variants FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Product owners can manage variants"
  ON product_variants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.owner_id = uid()
    )
  );

CREATE POLICY "Admin can manage all variants"
  ON product_variants FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- Product Reviews Policies
CREATE POLICY "Anyone can read approved reviews"
  ON product_reviews FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

CREATE POLICY "Customers can create reviews for purchased products"
  ON product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = uid() AND
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.customer_id = uid() 
      AND oi.product_id = product_reviews.product_id
      AND o.status IN ('delivered', 'completed')
    )
  );

CREATE POLICY "Customers can update own reviews"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (customer_id = uid());

CREATE POLICY "Vendors can respond to reviews"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_reviews.product_id 
      AND p.owner_id = uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_reviews.product_id 
      AND p.owner_id = uid()
    )
  );

CREATE POLICY "Admin can manage all reviews"
  ON product_reviews FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- Wishlists Policies
CREATE POLICY "Users can manage own wishlists"
  ON wishlists FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());

-- Vendor Applications Policies
CREATE POLICY "Users can create own applications"
  ON vendor_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = uid());

CREATE POLICY "Users can read own applications"
  ON vendor_applications FOR SELECT
  TO authenticated
  USING (user_id = uid());

CREATE POLICY "Users can update own pending applications"
  ON vendor_applications FOR UPDATE
  TO authenticated
  USING (user_id = uid() AND status = 'pending');

CREATE POLICY "Admin can manage all applications"
  ON vendor_applications FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- Store Customizations Policies
CREATE POLICY "Anyone can read active store customizations"
  ON store_customizations FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Store owners can manage customizations"
  ON store_customizations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = store_customizations.store_id 
      AND stores.user_id = uid()
    )
  );

CREATE POLICY "Admin can manage all customizations"
  ON store_customizations FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- Commission Transactions Policies
CREATE POLICY "Store owners can read own transactions"
  ON commission_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = commission_transactions.store_id 
      AND stores.user_id = uid()
    )
  );

CREATE POLICY "Admin can manage all transactions"
  ON commission_transactions FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- Review Votes Policies
CREATE POLICY "Users can manage own review votes"
  ON product_review_votes FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());

CREATE POLICY "Anyone can read review votes"
  ON product_review_votes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_customer_id ON product_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_approved ON product_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_user_id ON vendor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_status ON vendor_applications(status);
CREATE INDEX IF NOT EXISTS idx_store_customizations_store_id ON store_customizations(store_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_store_id ON commission_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_order_id ON commission_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_status ON commission_transactions(status);