import { supabase } from '../lib/supabase';
import { Product } from '../types';

export interface InventoryAlert {
  id: string;
  productId: string;
  storeId: string;
  alertType: 'low_stock' | 'out_of_stock' | 'restock';
  thresholdQuantity?: number;
  currentQuantity: number;
  isResolved: boolean;
  resolvedAt?: string;
  product?: {
    name: string;
    images: string[];
    sku?: string;
  };
  createdAt: string;
}

export interface InventoryUpdate {
  productId: string;
  quantity: number;
  operation: 'set' | 'add' | 'subtract';
  reason?: string;
}

export interface StockLevel {
  productId: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

class InventoryService {
  async getStoreAlerts(storeId: string, includeResolved: boolean = false): Promise<InventoryAlert[]> {
    try {
      let query = supabase
        .from('inventory_alerts')
        .select(`
          *,
          products(name, images, sku)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (!includeResolved) {
        query = query.eq('is_resolved', false);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(this.mapInventoryAlert);
    } catch (error) {
      console.error('Failed to fetch inventory alerts:', error);
      throw error;
    }
  }

  async updateProductStock(updates: InventoryUpdate): Promise<Product> {
    try {
      // Get current product
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', updates.productId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      let newQuantity: number;
      
      switch (updates.operation) {
        case 'set':
          newQuantity = updates.quantity;
          break;
        case 'add':
          newQuantity = product.stock_quantity + updates.quantity;
          break;
        case 'subtract':
          newQuantity = Math.max(0, product.stock_quantity - updates.quantity);
          break;
        default:
          throw new Error('Invalid operation type');
      }

      // Update product stock
      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', updates.productId)
        .select(`
          *,
          stores(name, user_id)
        `)
        .single();

      if (updateError) {
        throw updateError;
      }

      // Create inventory log entry
      await this.createInventoryLog(updates, product.stock_quantity, newQuantity);

      return this.mapProduct(updatedProduct);
    } catch (error) {
      console.error('Failed to update product stock:', error);
      throw error;
    }
  }

  async bulkUpdateStock(updates: InventoryUpdate[]): Promise<{ success: number; failed: number; errors: any[] }> {
    let success = 0;
    let failed = 0;
    const errors: any[] = [];

    for (const update of updates) {
      try {
        await this.updateProductStock(update);
        success++;
      } catch (error) {
        failed++;
        errors.push({
          productId: update.productId,
          error: error.message
        });
      }
    }

    return { success, failed, errors };
  }

  async getStockLevels(storeId: string): Promise<StockLevel[]> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, stock_quantity, name')
        .eq('store_id', storeId)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      // For now, we'll assume reserved stock is 0 and low stock threshold is 10
      // In a real system, you'd track reserved stock from pending orders
      return products.map(product => ({
        productId: product.id,
        currentStock: product.stock_quantity,
        reservedStock: 0, // TODO: Calculate from pending orders
        availableStock: product.stock_quantity,
        lowStockThreshold: 10,
        isLowStock: product.stock_quantity <= 10 && product.stock_quantity > 0,
        isOutOfStock: product.stock_quantity === 0
      }));
    } catch (error) {
      console.error('Failed to get stock levels:', error);
      throw error;
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('inventory_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      throw error;
    }
  }

  async createInventoryLog(
    update: InventoryUpdate,
    previousQuantity: number,
    newQuantity: number
  ): Promise<void> {
    try {
      await supabase
        .from('inventory_logs')
        .insert({
          product_id: update.productId,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          change_quantity: newQuantity - previousQuantity,
          operation: update.operation,
          reason: update.reason || 'Manual update',
          changed_by: (await supabase.auth.getUser()).data.user?.id
        });
    } catch (error) {
      console.error('Failed to create inventory log:', error);
      // Don't throw error as this is just logging
    }
  }

  async getInventoryHistory(productId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_logs')
        .select(`
          *,
          users(name)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get inventory history:', error);
      return [];
    }
  }

  async syncDropshippingInventory(): Promise<{ updated: number; errors: number }> {
    try {
      // Get all dropshipped products
      const { data: products } = await supabase
        .from('products')
        .select('id, external_id, provider')
        .eq('is_dropshipped', true)
        .eq('is_active', true);

      if (!products) {
        return { updated: 0, errors: 0 };
      }

      let updated = 0;
      let errors = 0;

      // Update stock levels from dropshipping API
      for (const product of products) {
        try {
          // Call dropshipping service to get current stock
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dropshipping-import`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({
              action: 'get_stock',
              productId: product.external_id,
              provider: product.provider
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.stock !== undefined) {
              await this.updateProductStock({
                productId: product.id,
                quantity: result.stock,
                operation: 'set',
                reason: 'Dropshipping sync'
              });
              updated++;
            }
          } else {
            errors++;
          }
        } catch (error) {
          console.error(`Failed to sync stock for product ${product.id}:`, error);
          errors++;
        }
      }

      return { updated, errors };
    } catch (error) {
      console.error('Failed to sync dropshipping inventory:', error);
      return { updated: 0, errors: 0 };
    }
  }

  private mapInventoryAlert(dbAlert: any): InventoryAlert {
    return {
      id: dbAlert.id,
      productId: dbAlert.product_id,
      storeId: dbAlert.store_id,
      alertType: dbAlert.alert_type,
      thresholdQuantity: dbAlert.threshold_quantity,
      currentQuantity: dbAlert.current_quantity,
      isResolved: dbAlert.is_resolved,
      resolvedAt: dbAlert.resolved_at,
      product: dbAlert.products ? {
        name: dbAlert.products.name,
        images: dbAlert.products.images,
        sku: dbAlert.products.sku
      } : undefined,
      createdAt: dbAlert.created_at
    };
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

export const inventoryService = new InventoryService();