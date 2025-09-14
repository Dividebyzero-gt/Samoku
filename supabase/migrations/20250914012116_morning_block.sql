/*
  # Enhanced Multivendor Features

  1. New Tables
    - `vendor_applications` - Vendor onboarding applications
    - `product_variants` - Product size, color, material variations
    - `product_reviews` - Customer reviews and ratings
    - `product_review_votes` - Helpful/unhelpful votes on reviews
    - `wishlists` - Customer saved products
    - `notifications` - System notifications for users
    - `commission_transactions` - Individual commission records
    - `inventory_alerts` - Low stock and out of stock notifications
    - `store_customizations` - Vendor store appearance settings
    - `vendor_payouts` - Detailed payout records

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each user role
    - Vendor-specific data access controls

  3. Enhancements
    - Advanced order splitting functionality
    - Real-time inventory tracking
    - Commission calculation automation
    - Professional vendor onboarding
*/

-- Vendor Applications Table
CREATE TABLE IF NOT EXISTS vendor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type text NOT NULL CHECK (business_type IN ('individual', 'llc', 'corporation', 'partnership')),
  business_registration_number text,
  tax_id text,
  business_address jsonb NOT NULL,
  contact_person text NOT NULL,
  phone text NOT NULL,
  website text,
  business_description text NOT NULL,
  product_categories text[] DEFAULT '{}',
  expected_monthly_sales numeric(12,2),
  previous_experience text,
  documents jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  review_notes text,
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL, -- e.g., "Color", "Size"
  value text NOT NULL, -- e.g., "Red", "Large"
  sku text,
  price_adjustment numeric(10,2) DEFAULT 0,
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
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES users(id) ON DELETE CASCADE,
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
  review_id uuid REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  is_helpful boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Wishlists Table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'order', 'payment', 'product', 'store', 'system'
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  action_url text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Commission Transactions Table (Enhanced)
CREATE TABLE IF NOT EXISTS commission_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid REFERENCES order_items(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  sale_amount numeric(12,2) NOT NULL,
  commission_rate numeric(5,2) NOT NULL,
  commission_amount numeric(12,2) NOT NULL,
  platform_fee numeric(12,2) DEFAULT 0,
  net_amount numeric(12,2) NOT NULL, -- Amount vendor receives
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  payout_id uuid REFERENCES payouts(id) ON DELETE SET NULL,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Inventory Alerts Table
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'restock')),
  threshold_quantity integer,
  current_quantity integer,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Store Customizations Table
CREATE TABLE IF NOT EXISTS store_customizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
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
  updated_at timestamptz DEFAULT now()
);

-- Vendor Payouts (Enhanced from existing payouts table)
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS commission_transaction_ids uuid[];
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS vendor_notes text;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS bank_details jsonb;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_applications_user_id ON vendor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_status ON vendor_applications(status);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_customer_id ON product_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_review_votes_review_id ON product_review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_store_id ON commission_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_order_id ON commission_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_id ON inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_store_id ON inventory_alerts(store_id);

-- Enable RLS on all new tables
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_customizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_applications
CREATE POLICY "Users can read own applications"
  ON vendor_applications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own applications"
  ON vendor_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending applications"
  ON vendor_applications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can manage all applications"
  ON vendor_applications
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for product_variants
CREATE POLICY "Anyone can read active variants"
  ON product_variants
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Product owners can manage variants"
  ON product_variants
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM products 
    WHERE products.id = product_variants.product_id 
    AND products.owner_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all variants"
  ON product_variants
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for product_reviews
CREATE POLICY "Anyone can read approved reviews"
  ON product_reviews
  FOR SELECT
  TO authenticated
  USING (is_approved = true);

CREATE POLICY "Customers can create reviews"
  ON product_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own reviews"
  ON product_reviews
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admins can manage all reviews"
  ON product_reviews
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Product owners can respond to reviews"
  ON product_reviews
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM products 
    WHERE products.id = product_reviews.product_id 
    AND products.owner_id = auth.uid()
  ));

-- RLS Policies for product_review_votes
CREATE POLICY "Users can manage own votes"
  ON product_review_votes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for wishlists
CREATE POLICY "Users can manage own wishlist"
  ON wishlists
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for commission_transactions
CREATE POLICY "Store owners can read own commissions"
  ON commission_transactions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = commission_transactions.store_id 
    AND stores.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all commissions"
  ON commission_transactions
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for inventory_alerts
CREATE POLICY "Store owners can read own alerts"
  ON inventory_alerts
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = inventory_alerts.store_id 
    AND stores.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all alerts"
  ON inventory_alerts
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for store_customizations
CREATE POLICY "Store owners can manage own customizations"
  ON store_customizations
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = store_customizations.store_id 
    AND stores.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can read active customizations"
  ON store_customizations
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage all customizations"
  ON store_customizations
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- Functions for commission calculations
CREATE OR REPLACE FUNCTION calculate_commission(
  sale_amount numeric,
  commission_rate numeric
) RETURNS numeric AS $$
BEGIN
  RETURN ROUND(sale_amount * (commission_rate / 100), 2);
END;
$$ LANGUAGE plpgsql;

-- Function to create commission transaction when order item is created
CREATE OR REPLACE FUNCTION create_commission_transaction()
RETURNS TRIGGER AS $$
DECLARE
  store_commission_rate numeric;
  calculated_commission numeric;
  platform_fee_rate numeric := 0.5; -- 0.5% platform fee
  calculated_platform_fee numeric;
  net_vendor_amount numeric;
BEGIN
  -- Get commission rate for the store
  SELECT commission_rate INTO store_commission_rate
  FROM stores
  WHERE id = NEW.store_id;

  -- Calculate commission and fees
  calculated_commission := calculate_commission(NEW.price * NEW.quantity, store_commission_rate);
  calculated_platform_fee := ROUND((NEW.price * NEW.quantity) * (platform_fee_rate / 100), 2);
  net_vendor_amount := (NEW.price * NEW.quantity) - calculated_commission - calculated_platform_fee;

  -- Create commission transaction record
  INSERT INTO commission_transactions (
    order_item_id,
    store_id,
    order_id,
    sale_amount,
    commission_rate,
    commission_amount,
    platform_fee,
    net_amount,
    status
  ) VALUES (
    NEW.id,
    NEW.store_id,
    NEW.order_id,
    NEW.price * NEW.quantity,
    store_commission_rate,
    calculated_commission,
    calculated_platform_fee,
    net_vendor_amount,
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic commission calculation
CREATE TRIGGER create_commission_on_order_item
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION create_commission_transaction();

-- Function to update product rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  product_id_to_update uuid;
  avg_rating numeric;
  review_count integer;
BEGIN
  -- Determine which product to update
  IF TG_OP = 'DELETE' THEN
    product_id_to_update := OLD.product_id;
  ELSE
    product_id_to_update := NEW.product_id;
  END IF;

  -- Calculate new average rating and count
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, review_count
  FROM product_reviews
  WHERE product_id = product_id_to_update
    AND is_approved = true;

  -- Update product
  UPDATE products
  SET 
    rating = ROUND(avg_rating, 2),
    review_count = review_count,
    updated_at = now()
  WHERE id = product_id_to_update;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic rating updates
CREATE TRIGGER update_rating_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Function to create inventory alerts
CREATE OR REPLACE FUNCTION check_inventory_levels()
RETURNS TRIGGER AS $$
DECLARE
  low_stock_threshold integer := 10;
BEGIN
  -- Check for low stock
  IF NEW.stock_quantity <= low_stock_threshold AND NEW.stock_quantity > 0 THEN
    INSERT INTO inventory_alerts (
      product_id,
      store_id,
      alert_type,
      threshold_quantity,
      current_quantity
    ) VALUES (
      NEW.id,
      NEW.store_id,
      'low_stock',
      low_stock_threshold,
      NEW.stock_quantity
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- Check for out of stock
  IF NEW.stock_quantity = 0 THEN
    INSERT INTO inventory_alerts (
      product_id,
      store_id,
      alert_type,
      current_quantity
    ) VALUES (
      NEW.id,
      NEW.store_id,
      'out_of_stock',
      0
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- Resolve alerts if stock is restored
  IF NEW.stock_quantity > low_stock_threshold THEN
    UPDATE inventory_alerts
    SET is_resolved = true, resolved_at = now()
    WHERE product_id = NEW.id
      AND alert_type IN ('low_stock', 'out_of_stock')
      AND is_resolved = false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for inventory monitoring
CREATE TRIGGER monitor_inventory_levels
  AFTER UPDATE OF stock_quantity ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_inventory_levels();

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  user_id_param uuid,
  type_param text,
  title_param text,
  message_param text,
  data_param jsonb DEFAULT '{}',
  action_url_param text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    action_url
  ) VALUES (
    user_id_param,
    type_param,
    title_param,
    message_param,
    data_param,
    action_url_param
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to notify vendor when order is placed
CREATE OR REPLACE FUNCTION notify_vendor_new_order()
RETURNS TRIGGER AS $$
DECLARE
  vendor_user_id uuid;
  store_name text;
BEGIN
  -- Get vendor user ID and store name for each order item
  SELECT stores.user_id, stores.name
  INTO vendor_user_id, store_name
  FROM stores
  WHERE stores.id = NEW.store_id;

  -- Create notification for vendor
  IF vendor_user_id IS NOT NULL THEN
    PERFORM create_notification(
      vendor_user_id,
      'order',
      'New Order Received',
      'You have received a new order for ' || NEW.product_name,
      jsonb_build_object(
        'order_id', NEW.order_id,
        'order_item_id', NEW.id,
        'product_name', NEW.product_name,
        'quantity', NEW.quantity,
        'amount', NEW.price * NEW.quantity
      ),
      '/vendor'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vendor order notifications
CREATE TRIGGER notify_vendor_on_new_order
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_vendor_new_order();