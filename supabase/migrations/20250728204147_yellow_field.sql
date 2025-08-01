/*
  # Fix Authentication and RLS Policies

  1. Disable RLS temporarily to clean up
  2. Drop all existing problematic policies
  3. Ensure admin user and store exist
  4. Create simplified RLS policies that avoid recursion
  5. Re-enable RLS with working policies
*/

-- Temporarily disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE commission_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE dropshipping_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE dropshipping_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE dropshipping_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE dropshipping_sync_logs DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Ensure admin user exists
INSERT INTO users (
    id,
    email,
    name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    '115b77ff-cb66-4164-9dd3-4728ca019c53',
    'admin@samoku.com',
    'Platform Administrator',
    'admin',
    true,
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Ensure admin store exists
INSERT INTO stores (
    id,
    user_id,
    name,
    description,
    is_approved,
    is_active,
    commission_rate,
    total_sales,
    rating,
    review_count,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '115b77ff-cb66-4164-9dd3-4728ca019c53',
    'Samoku Admin Store',
    'Official admin store for dropshipped products',
    true,
    true,
    0,
    0,
    0,
    0,
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_approved = EXCLUDED.is_approved,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropshipping_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropshipping_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropshipping_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropshipping_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create simplified users policies
CREATE POLICY "Users can read own data" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can manage all users" ON users
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin');

-- Create simplified stores policies
CREATE POLICY "Anyone can read approved active stores" ON stores
    FOR SELECT TO authenticated
    USING (is_approved = true AND is_active = true);

CREATE POLICY "Store owners can manage own store" ON stores
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admin can manage all stores" ON stores
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin');

-- Create simplified products policies
CREATE POLICY "Anyone can read active products" ON products
    FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "Product owners can manage own products" ON products
    FOR ALL TO authenticated
    USING (owner_id = auth.uid());

CREATE POLICY "Admin can manage all products" ON products
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin');

-- Create simplified orders policies
CREATE POLICY "Customers can read own orders" ON orders
    FOR SELECT TO authenticated
    USING (customer_id = auth.uid());

CREATE POLICY "Admin can manage all orders" ON orders
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin');

-- Create simplified order_items policies
CREATE POLICY "Users can read order items from own orders" ON order_items
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.customer_id = auth.uid()
    ));

CREATE POLICY "Admin can manage all order items" ON order_items
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin');

-- Create simplified payouts policies
CREATE POLICY "Store owners can read own payouts" ON payouts
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE stores.id = payouts.store_id 
        AND stores.user_id = auth.uid()
    ));

CREATE POLICY "Admin can manage all payouts" ON payouts
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin');

-- Create simplified commission_settings policies
CREATE POLICY "Store owners can read commission settings" ON commission_settings
    FOR SELECT TO authenticated
    USING (store_id IS NULL OR EXISTS (
        SELECT 1 FROM stores 
        WHERE stores.id = commission_settings.store_id 
        AND stores.user_id = auth.uid()
    ));

CREATE POLICY "Admin can manage commission settings" ON commission_settings
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin');

-- Create admin-only dropshipping policies
CREATE POLICY "Admin only dropshipping config access" ON dropshipping_config
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admin only dropshipping products access" ON dropshipping_products
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admin only dropshipping orders access" ON dropshipping_orders
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admin only dropshipping sync logs access" ON dropshipping_sync_logs
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin');