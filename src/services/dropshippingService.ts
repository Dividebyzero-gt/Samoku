import { DropshippingProduct, DropshippingOrder, ImportProductsRequest, ImportProductsResponse, SyncInventoryResponse, FulfillOrderRequest, FulfillOrderResponse, DropshippingConfig } from '../types/dropshipping';

class DropshippingService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
    this.apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
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
    return this.makeRequest('dropshipping-import', {
      method: 'POST',
      body: JSON.stringify({
        action: 'configure_api',
        provider,
        apiKey,
        apiSecret,
        settings
      })
    });
  }

  async importProducts(request: ImportProductsRequest): Promise<ImportProductsResponse> {
    return this.makeRequest('dropshipping-import', {
      method: 'POST',
      body: JSON.stringify({
        action: 'import_products',
        ...request
      })
    });
  }

  async syncInventory(): Promise<SyncInventoryResponse> {
    return this.makeRequest('dropshipping-import', {
      method: 'POST',
      body: JSON.stringify({
        action: 'sync_inventory'
      })
    });
  }

  async getProducts(): Promise<{ products: DropshippingProduct[] }> {
    return this.makeRequest('dropshipping-import?action=get_products');
  }

  async fulfillOrder(request: FulfillOrderRequest): Promise<FulfillOrderResponse> {
    return this.makeRequest('dropshipping-import', {
      method: 'POST',
      body: JSON.stringify({
        action: 'fulfill_order',
        ...request
      })
    });
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
}

export const dropshippingService = new DropshippingService();