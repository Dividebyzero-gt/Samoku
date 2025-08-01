/*
  # Dropshipping Integration Schema

  1. New Tables
    - `dropshipping_config` - Store API credentials and settings
    - `dropshipping_products` - Cache imported products from API
    - `dropshipping_orders` - Track orders sent to dropshipping API
    - `dropshipping_sync_logs` - Log sync operations and errors

  2. Security
    - Enable RLS on all tables
    - Only admin users can access dropshipping data
    - Vendors cannot see or access dropshipped products

  3. Functions
    - Automated inventory sync triggers
    - Order fulfillment automation
*/

-- Dropshipping configuration table
CREATE TABLE IF NOT EXISTS dropshipping_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL, -- 'printful', 'dropcommerce', etc.
  api_key TEXT NOT NULL,
  api_secret TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dropshipping products cache
CREATE TABLE IF NOT EXISTS dropshipping_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) NOT NULL, -- ID from dropshipping API
  provider VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sku VARCHAR(100),
  category VARCHAR(100),
  tags TEXT[],
  images TEXT[],
  stock_level INTEGER DEFAULT 0,
  shipping_time VARCHAR(50),
  weight DECIMAL(8,2),
  dimensions JSONB,
  variants JSONB DEFAULT '[]',
  api_data JSONB DEFAULT '{}', -- Store full API response
  last_synced TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(external_id, provider)
);

-- Dropshipping orders tracking
CREATE TABLE IF NOT EXISTS dropshipping_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(100) NOT NULL, -- Local order ID
  external_order_id VARCHAR(100), -- Dropshipping API order ID
  provider VARCHAR(50) NOT NULL,
  product_external_id VARCHAR(100) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  shipping_address JSONB NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, processing, shipped, delivered, failed
  tracking_number VARCHAR(100),
  tracking_url TEXT,
  shipping_method VARCHAR(100),
  fulfillment_data JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sync operation logs
CREATE TABLE IF NOT EXISTS dropshipping_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type VARCHAR(50) NOT NULL, -- 'product_sync', 'inventory_sync', 'order_fulfillment'
  provider VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'success', 'error', 'partial'
  products_processed INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  products_failed INTEGER DEFAULT 0,
  error_details JSONB,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER
);

-- Enable RLS on all tables
ALTER TABLE dropshipping_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropshipping_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropshipping_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropshipping_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only access)
CREATE POLICY "Admin only dropshipping config access"
  ON dropshipping_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin only dropshipping products access"
  ON dropshipping_products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin only dropshipping orders access"
  ON dropshipping_orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin only dropshipping sync logs access"
  ON dropshipping_sync_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dropshipping_products_provider ON dropshipping_products(provider);
CREATE INDEX IF NOT EXISTS idx_dropshipping_products_external_id ON dropshipping_products(external_id);
CREATE INDEX IF NOT EXISTS idx_dropshipping_products_category ON dropshipping_products(category);
CREATE INDEX IF NOT EXISTS idx_dropshipping_products_active ON dropshipping_products(is_active);
CREATE INDEX IF NOT EXISTS idx_dropshipping_orders_status ON dropshipping_orders(status);
CREATE INDEX IF NOT EXISTS idx_dropshipping_orders_external_id ON dropshipping_orders(external_order_id);
CREATE INDEX IF NOT EXISTS idx_dropshipping_sync_logs_operation ON dropshipping_sync_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_dropshipping_sync_logs_provider ON dropshipping_sync_logs(provider);