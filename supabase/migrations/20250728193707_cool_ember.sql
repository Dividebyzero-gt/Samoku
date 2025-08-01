/*
  # Create Admin User

  1. Admin User Setup
    - Creates an admin user record in the users table
    - Sets up proper role and permissions
    - Links to Supabase auth system

  2. Instructions
    - After running this migration, create the auth user manually in Supabase
    - Use email: admin@samoku.com, password: Admin123!
    - The user ID must match the one in this migration
*/

-- Insert admin user with specific UUID that can be referenced
INSERT INTO users (
  id,
  email,
  name,
  role,
  phone,
  is_active,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@samoku.com',
  'Platform Administrator',
  'admin',
  '+1-555-ADMIN',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Create an admin store for dropshipped products
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
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Samoku Official Store',
  'Official store for dropshipped and platform-managed products',
  true,
  true,
  0.00,
  0,
  0,
  0,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_approved = EXCLUDED.is_approved,
  is_active = EXCLUDED.is_active,
  updated_at = now();