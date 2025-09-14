/*
  # Create Vendor Application and Management System

  1. New Tables
    - `vendor_applications` - Vendor registration applications
    - `store_customizations` - Store branding and customization
    - `commission_transactions` - Detailed commission tracking
    - `inventory_alerts` - Stock level monitoring
    - `inventory_logs` - Stock change history
    - `notifications` - User notification system

  2. Security
    - RLS policies for vendor/admin access
    - Secure document storage references
    - Protected financial information

  3. Business Logic
    - Automated commission calculations
    - Inventory monitoring triggers
    - Application approval workflow
*/

-- Vendor Applications Table
CREATE TABLE IF NOT EXISTS vendor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type text NOT NULL CHECK (business_type IN ('individual', 'llc', 'corporation', 'partnership')),
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
  documents jsonb DEFAULT '{}',
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
  featured_products text[] DEFAULT '{}',
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

-- Inventory Alerts Table
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'restock')),
  threshold_quantity integer,
  current_quantity integer NOT NULL,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Inventory Logs Table
CREATE TABLE IF NOT EXISTS inventory_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  previous_quantity integer NOT NULL,
  new_quantity integer NOT NULL,
  change_quantity integer NOT NULL,
  operation text NOT NULL CHECK (operation IN ('set', 'add', 'subtract')),
  reason text,
  changed_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('order', 'payment', 'product', 'store', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  action_url text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_applications_user_id ON vendor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_status ON vendor_applications(status);

CREATE INDEX IF NOT EXISTS idx_commission_transactions_store_id ON commission_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_order_id ON commission_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_status ON commission_transactions(status);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_payout_id ON commission_transactions(payout_id);

CREATE INDEX IF NOT EXISTS idx_inventory_alerts_store_id ON inventory_alerts(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_id ON inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_resolved ON inventory_alerts(is_resolved);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable Row Level Security
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_applications
CREATE POLICY "Users can manage own applications"
  ON vendor_applications
  FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());

CREATE POLICY "Admin can manage all applications"
  ON vendor_applications
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for store_customizations
CREATE POLICY "Store owners can manage own customizations"
  ON store_customizations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = store_customizations.store_id 
      AND stores.user_id = uid()
    )
  );

CREATE POLICY "Anyone can read active store customizations"
  ON store_customizations
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admin can manage all customizations"
  ON store_customizations
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for commission_transactions
CREATE POLICY "Store owners can read own commissions"
  ON commission_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = commission_transactions.store_id 
      AND stores.user_id = uid()
    )
  );

CREATE POLICY "Admin can manage all commissions"
  ON commission_transactions
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for inventory_alerts
CREATE POLICY "Store owners can manage own alerts"
  ON inventory_alerts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = inventory_alerts.store_id 
      AND stores.user_id = uid()
    )
  );

CREATE POLICY "Admin can manage all alerts"
  ON inventory_alerts
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for inventory_logs
CREATE POLICY "Store owners can read own inventory logs"
  ON inventory_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      JOIN stores ON products.store_id = stores.id
      WHERE products.id = inventory_logs.product_id 
      AND stores.user_id = uid()
    )
  );

CREATE POLICY "Admin can read all inventory logs"
  ON inventory_logs
  FOR SELECT
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for notifications
CREATE POLICY "Users can manage own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());

-- Function to automatically create commission transactions
CREATE OR REPLACE FUNCTION create_commission_transaction()
RETURNS TRIGGER AS $$
DECLARE
  store_commission_rate numeric(5,2);
  commission_amount numeric(12,2);
  platform_fee numeric(12,2);
  net_amount numeric(12,2);
  sale_amount numeric(12,2);
BEGIN
  -- Get store commission rate
  SELECT commission_rate INTO store_commission_rate
  FROM stores 
  WHERE id = NEW.store_id;
  
  -- Calculate amounts
  sale_amount := NEW.price * NEW.quantity;
  commission_amount := sale_amount * (store_commission_rate / 100);
  platform_fee := commission_amount * 0.1; -- 10% platform fee
  net_amount := sale_amount - commission_amount;
  
  -- Create commission transaction
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
    sale_amount,
    store_commission_rate,
    commission_amount,
    platform_fee,
    net_amount,
    'pending'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create commission transaction on order item insert
DROP TRIGGER IF EXISTS trigger_create_commission ON order_items;
CREATE TRIGGER trigger_create_commission
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION create_commission_transaction();

-- Function to update product rating when reviews change
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating numeric(3,2);
  review_count integer;
BEGIN
  -- Calculate new average rating
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, review_count
  FROM product_reviews 
  WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
  AND is_approved = true;
  
  -- Update product
  UPDATE products 
  SET 
    rating = avg_rating,
    review_count = review_count,
    updated_at = now()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for product rating updates
DROP TRIGGER IF EXISTS trigger_update_rating_insert ON product_reviews;
CREATE TRIGGER trigger_update_rating_insert
  AFTER INSERT ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

DROP TRIGGER IF EXISTS trigger_update_rating_update ON product_reviews;
CREATE TRIGGER trigger_update_rating_update
  AFTER UPDATE ON product_reviews
  FOR EACH ROW
  WHEN (OLD.rating IS DISTINCT FROM NEW.rating OR OLD.is_approved IS DISTINCT FROM NEW.is_approved)
  EXECUTE FUNCTION update_product_rating();

DROP TRIGGER IF EXISTS trigger_update_rating_delete ON product_reviews;
CREATE TRIGGER trigger_update_rating_delete
  AFTER DELETE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Function to create inventory alerts
CREATE OR REPLACE FUNCTION check_inventory_levels()
RETURNS TRIGGER AS $$
DECLARE
  low_stock_threshold integer := 10;
BEGIN
  -- Remove old alerts for this product
  DELETE FROM inventory_alerts 
  WHERE product_id = NEW.id 
  AND alert_type IN ('low_stock', 'out_of_stock');
  
  -- Create new alerts if needed
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
      NEW.stock_quantity
    );
  ELSIF NEW.stock_quantity <= low_stock_threshold THEN
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
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for inventory monitoring
DROP TRIGGER IF EXISTS trigger_check_inventory ON products;
CREATE TRIGGER trigger_check_inventory
  AFTER UPDATE ON products
  FOR EACH ROW
  WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
  EXECUTE FUNCTION check_inventory_levels();

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  user_id_param uuid,
  type_param text,
  title_param text,
  message_param text,
  data_param jsonb DEFAULT '{}',
  action_url_param text DEFAULT NULL
)
RETURNS uuid AS $$
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