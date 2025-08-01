export interface DropshippingConfig {
  id: string;
  provider: string;
  apiKey: string;
  apiSecret?: string;
  webhookUrl?: string;
  isActive: boolean;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DropshippingProduct {
  id: string;
  externalId: string;
  provider: string;
  title: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  tags: string[];
  images: string[];
  stockLevel: number;
  shippingTime: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  variants: any[];
  apiData: Record<string, any>;
  lastSynced: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DropshippingOrder {
  id: string;
  orderId: string;
  externalOrderId?: string;
  provider: string;
  productExternalId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  quantity: number;
  status: 'pending' | 'sent' | 'processing' | 'shipped' | 'delivered' | 'failed';
  trackingNumber?: string;
  trackingUrl?: string;
  shippingMethod?: string;
  fulfillmentData: Record<string, any>;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DropshippingSyncLog {
  id: string;
  operationType: 'product_import' | 'inventory_sync' | 'order_fulfillment' | 'webhook_received';
  provider: string;
  status: 'success' | 'error' | 'partial';
  productsProcessed: number;
  productsUpdated: number;
  productsFailed: number;
  errorDetails?: Record<string, any>;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
}

export interface ImportProductsRequest {
  category?: string;
  limit?: number;
}

export interface ImportProductsResponse {
  success: boolean;
  imported: number;
  total: number;
  products: DropshippingProduct[];
}

export interface SyncInventoryResponse {
  success: boolean;
  processed: number;
  updated: number;
  failed: number;
}

export interface FulfillOrderRequest {
  orderId: string;
  productExternalId: string;
  customerInfo: {
    name: string;
    email: string;
  };
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  quantity: number;
}

export interface FulfillOrderResponse {
  success: boolean;
  fulfillmentId: string;
  trackingNumber?: string;
  tracking: DropshippingOrder;
}