/*
  # Create Essential Supabase Auth Functions

  This migration creates the essential auth functions that should be available
  in Supabase for Row Level Security (RLS) policies.

  1. Functions Created
    - `uid()` - Returns the current authenticated user's ID
    - `jwt()` - Returns the current JWT token payload
    - `email()` - Returns the current user's email
    - `role()` - Returns the current user's role from JWT

  2. Security
    - These functions are essential for RLS policies
    - They provide secure access to user context in database operations
*/

-- Create the uid() function if it doesn't exist
CREATE OR REPLACE FUNCTION uid() 
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid();
$$;

-- Create the jwt() function if it doesn't exist  
CREATE OR REPLACE FUNCTION jwt() 
RETURNS jsonb 
LANGUAGE sql 
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.jwt();
$$;

-- Create the email() function for convenience
CREATE OR REPLACE FUNCTION email() 
RETURNS text 
LANGUAGE sql 
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.email();
$$;

-- Create the role() function to get user role from JWT
CREATE OR REPLACE FUNCTION role() 
RETURNS text 
LANGUAGE sql 
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'role',
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    'customer'
  );
$$;

-- Grant execute permissions to authenticated and anon users
GRANT EXECUTE ON FUNCTION uid() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION jwt() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION email() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION role() TO authenticated, anon;

-- Create notification creation function
CREATE OR REPLACE FUNCTION create_notification(
  user_id_param uuid,
  type_param text,
  title_param text,
  message_param text,
  data_param jsonb DEFAULT '{}',
  action_url_param text DEFAULT NULL
) 
RETURNS uuid 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
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
$$;

-- Grant execute permission for notification function
GRANT EXECUTE ON FUNCTION create_notification TO authenticated, service_role;

-- Create function to calculate commission for an order item
CREATE OR REPLACE FUNCTION calculate_commission(
  sale_amount numeric,
  commission_rate numeric
) 
RETURNS TABLE (
  commission_amount numeric,
  platform_fee numeric,
  net_amount numeric
) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  commission_amount := (sale_amount * commission_rate / 100);
  platform_fee := commission_amount * 0.1; -- 10% platform fee on commission
  net_amount := sale_amount - commission_amount;
  
  RETURN QUERY SELECT 
    calculate_commission.commission_amount,
    calculate_commission.platform_fee,
    calculate_commission.net_amount;
END;
$$;

-- Grant execute permission for commission calculation
GRANT EXECUTE ON FUNCTION calculate_commission TO authenticated, service_role;

-- Create function to update product rating when reviews change
CREATE OR REPLACE FUNCTION update_product_rating(product_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_rating numeric;
  review_count integer;
BEGIN
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, review_count
  FROM product_reviews 
  WHERE product_id = product_id_param 
    AND is_approved = true;
  
  UPDATE products 
  SET 
    rating = ROUND(avg_rating, 2),
    review_count = review_count,
    updated_at = now()
  WHERE id = product_id_param;
END;
$$;

-- Grant execute permission for rating update function
GRANT EXECUTE ON FUNCTION update_product_rating TO authenticated, service_role;

-- Create trigger function for commission transaction creation
CREATE OR REPLACE FUNCTION create_commission_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  commission_calc record;
  store_commission_rate numeric;
BEGIN
  -- Get store commission rate
  SELECT commission_rate INTO store_commission_rate
  FROM stores 
  WHERE id = NEW.store_id;
  
  -- Calculate commission
  SELECT * INTO commission_calc 
  FROM calculate_commission(
    NEW.price * NEW.quantity,
    COALESCE(store_commission_rate, 5.0)
  );
  
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
    NEW.price * NEW.quantity,
    COALESCE(store_commission_rate, 5.0),
    commission_calc.commission_amount,
    commission_calc.platform_fee,
    commission_calc.net_amount,
    'pending'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic commission calculation
DROP TRIGGER IF EXISTS trigger_create_commission ON order_items;
CREATE TRIGGER trigger_create_commission
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION create_commission_transaction();

-- Create trigger function for inventory alerts
CREATE OR REPLACE FUNCTION check_inventory_alerts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  low_stock_threshold integer := 10;
BEGIN
  -- Check for low stock alert
  IF NEW.stock_quantity <= low_stock_threshold AND NEW.stock_quantity > 0 THEN
    INSERT INTO inventory_alerts (
      product_id,
      store_id,
      alert_type,
      current_quantity,
      threshold_quantity
    ) VALUES (
      NEW.id,
      NEW.store_id,
      'low_stock',
      NEW.stock_quantity,
      low_stock_threshold
    )
    ON CONFLICT (product_id, alert_type) 
    WHERE is_resolved = false
    DO UPDATE SET 
      current_quantity = NEW.stock_quantity,
      created_at = now();
  END IF;
  
  -- Check for out of stock alert
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
    )
    ON CONFLICT (product_id, alert_type) 
    WHERE is_resolved = false
    DO UPDATE SET 
      current_quantity = NEW.stock_quantity,
      created_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for inventory monitoring
DROP TRIGGER IF EXISTS trigger_inventory_alerts ON products;
CREATE TRIGGER trigger_inventory_alerts
  AFTER UPDATE OF stock_quantity ON products
  FOR EACH ROW
  WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
  EXECUTE FUNCTION check_inventory_alerts();

-- Create trigger function for product review rating updates
CREATE OR REPLACE FUNCTION trigger_update_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update product rating when review is added, updated, or deleted
  IF TG_OP = 'DELETE' THEN
    PERFORM update_product_rating(OLD.product_id);
    RETURN OLD;
  ELSE
    PERFORM update_product_rating(NEW.product_id);
    RETURN NEW;
  END IF;
END;
$$;

-- Create triggers for review rating updates
DROP TRIGGER IF EXISTS trigger_review_rating_insert ON product_reviews;
CREATE TRIGGER trigger_review_rating_insert
  AFTER INSERT ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_product_rating();

DROP TRIGGER IF EXISTS trigger_review_rating_update ON product_reviews;
CREATE TRIGGER trigger_review_rating_update
  AFTER UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_product_rating();

DROP TRIGGER IF EXISTS trigger_review_rating_delete ON product_reviews;
CREATE TRIGGER trigger_review_rating_delete
  AFTER DELETE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_product_rating();