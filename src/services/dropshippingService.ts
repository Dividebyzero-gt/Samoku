import { DropshippingProduct, DropshippingOrder, ImportProductsRequest, ImportProductsResponse, SyncInventoryResponse, FulfillOrderRequest, FulfillOrderResponse, DropshippingConfig } from '../types/dropshipping';
import { supabase } from '../lib/supabase';

class DropshippingService {
  private baseUrl: string;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL environment variable is not set. Please configure your Supabase project URL.');
    }
    
    this.baseUrl = `${supabaseUrl}/functions/v1`;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authenticated session found');
    }

    const headers = {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async configureAPI(provider: string, apiKey: string, apiSecret?: string, settings?: Record<string, any>): Promise<DropshippingConfig> {
    const response = await this.makeRequest('dropshipping-import', {
      method: 'POST',
      body: JSON.stringify({
        action: 'configure_api',
        provider,
        apiKey,
        apiSecret,
        settings
      })
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to configure API');
    }
    
    return response.config;
  }

  async importProducts(request: ImportProductsRequest): Promise<ImportProductsResponse> {
    const response = await this.makeRequest('dropshipping-import', {
      method: 'POST',
      body: JSON.stringify({
        action: 'import_products',
        ...request
      })
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to import products');
    }
    
    return response;
  }

  async syncInventory(): Promise<SyncInventoryResponse> {
    const response = await this.makeRequest('dropshipping-import', {
      method: 'POST',
      body: JSON.stringify({
        action: 'sync_inventory'
      })
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to sync inventory');
    }
    
    return response;
  }

  async getProducts(): Promise<{ products: DropshippingProduct[] }> {
    const response = await this.makeRequest('dropshipping-import?action=get_products');
    
    return {
      products: response.products || []
    };
  }

  async fulfillOrder(request: FulfillOrderRequest): Promise<FulfillOrderResponse> {
    const response = await this.makeRequest('dropshipping-import', {
      method: 'POST',
      body: JSON.stringify({
        action: 'fulfill_order',
        ...request
      })
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fulfill order');
    }
    
    return response;
  }

  async getOrderStatus(orderId: string): Promise<DropshippingOrder | null> {
    try {
      const response = await this.makeRequest(`dropshipping-import?action=get_order_status&orderId=${orderId}`);
      return response.order;
    } catch (error) {
      console.error('Failed to get order status:', error);
      return null;
    }
  }

  async testConnection(provider: string, apiKey: string, apiSecret?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest('dropshipping-import', {
        method: 'POST',
        body: JSON.stringify({
          action: 'test_connection',
          provider,
          apiKey,
          apiSecret,
          environment: 'production'
        })
      });
      
      return { success: response.success, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const dropshippingService = new DropshippingService();