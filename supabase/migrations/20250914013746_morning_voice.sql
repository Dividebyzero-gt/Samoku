/*
  # Create Advanced Search and Analytics System

  1. New Tables
    - `search_logs` - Track search queries for analytics
    - `product_views` - Track product page views
    - `vendor_analytics` - Store performance metrics
    - `category_performance` - Category-based analytics

  2. Search Enhancement
    - Full-text search indexes
    - Search ranking functions
    - Popular search tracking

  3. Analytics Features
    - View tracking for products
    - Search analytics
    - Performance metrics
*/

-- Search Logs Table
CREATE TABLE IF NOT EXISTS search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  search_query text NOT NULL,
  results_count integer DEFAULT 0,
  clicked_product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  search_filters jsonb DEFAULT '{}',
  user_agent text,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- Product Views Table
CREATE TABLE IF NOT EXISTS product_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  session_id text,
  referrer text,
  user_agent text,
  ip_address inet,
  view_duration integer, -- seconds spent on page
  created_at timestamptz DEFAULT now()
);

-- Vendor Analytics Table
CREATE TABLE IF NOT EXISTS vendor_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  total_sales numeric(12,2) DEFAULT 0,
  total_orders integer DEFAULT 0,
  conversion_rate numeric(5,4) DEFAULT 0, -- percentage as decimal
  average_order_value numeric(10,2) DEFAULT 0,
  new_customers integer DEFAULT 0,
  returning_customers integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, date)
);

-- Category Performance Table
CREATE TABLE IF NOT EXISTS category_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  date date NOT NULL,
  total_products integer DEFAULT 0,
  total_sales numeric(12,2) DEFAULT 0,
  total_orders integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0,
  top_selling_product_id uuid REFERENCES products(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(category, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs USING gin(to_tsvector('english', search_query));
CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_store_id ON product_views(store_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at);

CREATE INDEX IF NOT EXISTS idx_vendor_analytics_store_id ON vendor_analytics(store_id);
CREATE INDEX IF NOT EXISTS idx_vendor_analytics_date ON vendor_analytics(date);

CREATE INDEX IF NOT EXISTS idx_category_performance_category ON category_performance(category);
CREATE INDEX IF NOT EXISTS idx_category_performance_date ON category_performance(date);

-- Full-text search index for products
CREATE INDEX IF NOT EXISTS idx_products_search 
ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Enable Row Level Security
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for search_logs
CREATE POLICY "Users can read own search logs"
  ON search_logs
  FOR SELECT
  TO authenticated
  USING (user_id = uid());

CREATE POLICY "Admin can read all search logs"
  ON search_logs
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Anyone can insert search logs"
  ON search_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- RLS Policies for product_views
CREATE POLICY "Store owners can read own product views"
  ON product_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = product_views.store_id 
      AND stores.user_id = uid()
    )
  );

CREATE POLICY "Admin can read all product views"
  ON product_views
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Anyone can insert product views"
  ON product_views
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- RLS Policies for vendor_analytics
CREATE POLICY "Store owners can read own analytics"
  ON vendor_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = vendor_analytics.store_id 
      AND stores.user_id = uid()
    )
  );

CREATE POLICY "Admin can manage all analytics"
  ON vendor_analytics
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- RLS Policies for category_performance
CREATE POLICY "Anyone can read category performance"
  ON category_performance
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admin can manage category performance"
  ON category_performance
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- Function to log product views
CREATE OR REPLACE FUNCTION log_product_view(
  product_id_param uuid,
  user_id_param uuid DEFAULT NULL,
  session_id_param text DEFAULT NULL,
  referrer_param text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  view_id uuid;
  store_id_val uuid;
BEGIN
  -- Get store_id from product
  SELECT store_id INTO store_id_val
  FROM products 
  WHERE id = product_id_param;
  
  -- Insert view log
  INSERT INTO product_views (
    product_id,
    user_id,
    store_id,
    session_id,
    referrer
  ) VALUES (
    product_id_param,
    user_id_param,
    store_id_val,
    session_id_param,
    referrer_param
  ) RETURNING id INTO view_id;
  
  RETURN view_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update daily analytics
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS void AS $$
DECLARE
  current_date date := CURRENT_DATE;
  store_record record;
BEGIN
  -- Update vendor analytics for each store
  FOR store_record IN 
    SELECT id as store_id FROM stores WHERE is_active = true
  LOOP
    INSERT INTO vendor_analytics (
      store_id,
      date,
      total_views,
      unique_visitors,
      total_sales,
      total_orders,
      average_order_value
    )
    SELECT 
      store_record.store_id,
      current_date,
      COUNT(pv.id),
      COUNT(DISTINCT COALESCE(pv.user_id::text, pv.session_id)),
      COALESCE(SUM(ct.sale_amount), 0),
      COUNT(DISTINCT ct.order_id),
      CASE 
        WHEN COUNT(DISTINCT ct.order_id) > 0 
        THEN COALESCE(SUM(ct.sale_amount), 0) / COUNT(DISTINCT ct.order_id)
        ELSE 0 
      END
    FROM product_views pv
    LEFT JOIN commission_transactions ct ON ct.store_id = store_record.store_id 
      AND DATE(ct.created_at) = current_date
    WHERE pv.store_id = store_record.store_id
      AND DATE(pv.created_at) = current_date
    GROUP BY store_record.store_id
    ON CONFLICT (store_id, date) 
    DO UPDATE SET
      total_views = EXCLUDED.total_views,
      unique_visitors = EXCLUDED.unique_visitors,
      total_sales = EXCLUDED.total_sales,
      total_orders = EXCLUDED.total_orders,
      average_order_value = EXCLUDED.average_order_value,
      updated_at = now();
  END LOOP;
END;
$$ LANGUAGE plpgsql;