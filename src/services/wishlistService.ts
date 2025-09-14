import { supabase } from '../lib/supabase';
import { Wishlist, Product } from '../types';

class WishlistService {
  async getWishlist(userId: string): Promise<Wishlist[]> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          products(
            *,
            stores(name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        productId: item.product_id,
        product: item.products ? {
          id: item.products.id,
          name: item.products.name,
          description: item.products.description,
          price: parseFloat(item.products.price),
          originalPrice: item.products.original_price ? parseFloat(item.products.original_price) : undefined,
          images: item.products.images || [],
          category: item.products.category,
          subcategory: item.products.subcategory,
          ownerId: item.products.owner_id,
          storeId: item.products.store_id,
          storeName: item.products.stores?.name,
          rating: parseFloat(item.products.rating),
          reviewCount: item.products.review_count,
          stockQuantity: item.products.stock_quantity,
          tags: item.products.tags || [],
          specifications: item.products.specifications || {},
          sku: item.products.sku,
          isDropshipped: item.products.is_dropshipped,
          dropshipMetadata: item.products.dropship_metadata || {},
          externalId: item.products.external_id,
          provider: item.products.provider,
          salesCount: item.products.sales_count,
          isActive: item.products.is_active,
          createdAt: item.products.created_at,
          updatedAt: item.products.updated_at,
        } : undefined,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      throw error;
    }
  }

  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          user_id: userId,
          product_id: productId,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        userId: data.user_id,
        productId: data.product_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      throw error;
    }
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      throw error;
    }
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
      return false;
    }
  }

  async getWishlistCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Failed to get wishlist count:', error);
      return 0;
    }
  }

  async clearWishlist(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      throw error;
    }
  }
}

export const wishlistService = new WishlistService();