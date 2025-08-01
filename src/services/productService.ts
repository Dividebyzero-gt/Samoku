import { supabase } from '../lib/supabase';
import { Product } from '../types';

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  ownerId?: string;
  isDropshipped?: boolean;
  isActive?: boolean;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  sku?: string;
  stockQuantity: number;
  tags: string[];
  specifications?: Record<string, any>;
}

class ProductService {
  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          stores!inner(name, user_id, is_approved)
        `);

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.ownerId) {
        query = query.eq('owner_id', filters.ownerId);
      }

      if (filters.isDropshipped !== undefined) {
        query = query.eq('is_dropshipped', filters.isDropshipped);
      }

      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      // Default to only active products for customers
      if (filters.isActive === undefined && !filters.ownerId) {
        query = query.eq('is_active', true);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('sales_count', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(this.mapProduct);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores(name, user_id, is_approved)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return this.mapProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return null;
    }
  }

  async createProduct(productData: CreateProductData, ownerId: string, storeId?: string): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          owner_id: ownerId,
          store_id: storeId,
          is_dropshipped: false,
          is_active: true,
        })
        .select(`
          *,
          stores(name, user_id, is_approved)
        `)
        .single();

      if (error) {
        throw error;
      }

      return this.mapProduct(data);
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<CreateProductData>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          stores(name, user_id, is_approved)
        `)
        .single();

      if (error) {
        throw error;
      }

      return this.mapProduct(data);
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  }

  async getVendorProducts(ownerId: string): Promise<Product[]> {
    return this.getProducts({
      ownerId,
      isDropshipped: false,
    });
  }

  async getDropshippedProducts(): Promise<Product[]> {
    return this.getProducts({
      isDropshipped: true,
    });
  }

  private mapProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      description: dbProduct.description,
      price: parseFloat(dbProduct.price),
      originalPrice: dbProduct.original_price ? parseFloat(dbProduct.original_price) : undefined,
      images: dbProduct.images || [],
      category: dbProduct.category,
      subcategory: dbProduct.subcategory,
      ownerId: dbProduct.owner_id,
      storeId: dbProduct.store_id,
      storeName: dbProduct.stores?.name,
      rating: parseFloat(dbProduct.rating),
      reviewCount: dbProduct.review_count,
      stockQuantity: dbProduct.stock_quantity,
      tags: dbProduct.tags || [],
      specifications: dbProduct.specifications || {},
      sku: dbProduct.sku,
      isDropshipped: dbProduct.is_dropshipped,
      dropshipMetadata: dbProduct.dropship_metadata || {},
      externalId: dbProduct.external_id,
      provider: dbProduct.provider,
      salesCount: dbProduct.sales_count,
      isActive: dbProduct.is_active,
      createdAt: dbProduct.created_at,
      updatedAt: dbProduct.updated_at,
    };
  }
}

export const productService = new ProductService();