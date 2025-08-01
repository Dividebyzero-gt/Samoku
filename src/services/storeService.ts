import { supabase } from '../lib/supabase';
import { Store } from '../types';

export interface CreateStoreData {
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

class StoreService {
  async getStores(filters: { isApproved?: boolean; isActive?: boolean } = {}): Promise<Store[]> {
    try {
      let query = supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.isApproved !== undefined) {
        query = query.eq('is_approved', filters.isApproved);
      }

      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(this.mapStore);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      throw error;
    }
  }

  async getStore(id: string): Promise<Store | null> {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return this.mapStore(data);
    } catch (error) {
      console.error('Failed to fetch store:', error);
      return null;
    }
  }

  async getStoreByUserId(userId: string): Promise<Store | null> {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No store found
        }
        throw error;
      }

      return this.mapStore(data);
    } catch (error) {
      console.error('Failed to fetch store by user ID:', error);
      return null;
    }
  }

  async createStore(storeData: CreateStoreData, userId: string): Promise<Store> {
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert({
          user_id: userId,
          name: storeData.name,
          description: storeData.description,
          logo_url: storeData.logoUrl,
          banner_url: storeData.bannerUrl,
          is_approved: false,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapStore(data);
    } catch (error) {
      console.error('Failed to create store:', error);
      throw error;
    }
  }

  async updateStore(id: string, updates: Partial<CreateStoreData>): Promise<Store> {
    try {
      const { data, error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapStore(data);
    } catch (error) {
      console.error('Failed to update store:', error);
      throw error;
    }
  }

  async approveStore(id: string, approved: boolean): Promise<Store> {
    try {
      const { data, error } = await supabase
        .from('stores')
        .update({ is_approved: approved })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapStore(data);
    } catch (error) {
      console.error('Failed to approve/reject store:', error);
      throw error;
    }
  }

  async getStoreStats(storeId: string): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    pendingOrders: number;
    averageRating: number;
  }> {
    try {
      // Get store sales and orders
      const { data: orderStats } = await supabase
        .from('order_items')
        .select('price, quantity, fulfillment_status')
        .eq('store_id', storeId);

      // Get product count
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('store_id', storeId)
        .eq('is_active', true);

      // Get store rating
      const { data: store } = await supabase
        .from('stores')
        .select('rating, total_sales')
        .eq('id', storeId)
        .single();

      const totalSales = store?.total_sales || 0;
      const totalOrders = orderStats?.length || 0;
      const totalProducts = products?.length || 0;
      const pendingOrders = orderStats?.filter(item => item.fulfillment_status === 'pending').length || 0;
      const averageRating = store?.rating || 0;

      return {
        totalSales,
        totalOrders,
        totalProducts,
        pendingOrders,
        averageRating,
      };
    } catch (error) {
      console.error('Failed to get store stats:', error);
      return {
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        pendingOrders: 0,
        averageRating: 0,
      };
    }
  }

  private mapStore(dbStore: any): Store {
    return {
      id: dbStore.id,
      userId: dbStore.user_id,
      name: dbStore.name,
      description: dbStore.description,
      logoUrl: dbStore.logo_url,
      bannerUrl: dbStore.banner_url,
      isApproved: dbStore.is_approved,
      isActive: dbStore.is_active,
      commissionRate: parseFloat(dbStore.commission_rate),
      totalSales: parseFloat(dbStore.total_sales),
      rating: parseFloat(dbStore.rating),
      reviewCount: dbStore.review_count,
      createdAt: dbStore.created_at,
      updatedAt: dbStore.updated_at,
    };
  }
}

export const storeService = new StoreService();