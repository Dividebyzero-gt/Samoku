import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'vendor' | 'customer';
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'admin' | 'vendor' | 'customer';
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'vendor' | 'customer';
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          banner_url: string | null;
          is_approved: boolean;
          is_active: boolean;
          commission_rate: number;
          total_sales: number;
          rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          is_approved?: boolean;
          is_active?: boolean;
          commission_rate?: number;
          total_sales?: number;
          rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          is_approved?: boolean;
          is_active?: boolean;
          commission_rate?: number;
          total_sales?: number;
          rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          original_price: number | null;
          images: string[];
          category: string;
          subcategory: string | null;
          sku: string | null;
          stock_quantity: number;
          is_active: boolean;
          owner_id: string;
          store_id: string | null;
          is_dropshipped: boolean;
          dropship_metadata: Record<string, any>;
          external_id: string | null;
          provider: string | null;
          rating: number;
          review_count: number;
          sales_count: number;
          tags: string[];
          specifications: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          original_price?: number | null;
          images?: string[];
          category: string;
          subcategory?: string | null;
          sku?: string | null;
          stock_quantity?: number;
          is_active?: boolean;
          owner_id: string;
          store_id?: string | null;
          is_dropshipped?: boolean;
          dropship_metadata?: Record<string, any>;
          external_id?: string | null;
          provider?: string | null;
          rating?: number;
          review_count?: number;
          sales_count?: number;
          tags?: string[];
          specifications?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          original_price?: number | null;
          images?: string[];
          category?: string;
          subcategory?: string | null;
          sku?: string | null;
          stock_quantity?: number;
          is_active?: boolean;
          owner_id?: string;
          store_id?: string | null;
          is_dropshipped?: boolean;
          dropship_metadata?: Record<string, any>;
          external_id?: string | null;
          provider?: string | null;
          rating?: number;
          review_count?: number;
          sales_count?: number;
          tags?: string[];
          specifications?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string;
          total_amount: number;
          subtotal: number;
          tax_amount: number;
          shipping_amount: number;
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method: string | null;
          shipping_address: Record<string, any>;
          billing_address: Record<string, any>;
          tracking_number: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id: string;
          total_amount: number;
          subtotal: number;
          tax_amount?: number;
          shipping_amount?: number;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string | null;
          shipping_address: Record<string, any>;
          billing_address: Record<string, any>;
          tracking_number?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string;
          total_amount?: number;
          subtotal?: number;
          tax_amount?: number;
          shipping_amount?: number;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string | null;
          shipping_address?: Record<string, any>;
          billing_address?: Record<string, any>;
          tracking_number?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};