export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  ownerId: string;
  storeId?: string;
  storeName?: string;
  rating: number;
  reviewCount: number;
  stockQuantity: number;
  tags: string[];
  specifications?: Record<string, string>;
  sku?: string;
  isDropshipped: boolean;
  dropshipMetadata?: Record<string, any>;
  externalId?: string;
  provider?: string;
  salesCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  userId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  isApproved: boolean;
  isActive: boolean;
  commissionRate: number;
  totalSales: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'vendor' | 'customer';
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  store?: Store;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  storeId?: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  isDropshipped: boolean;
  fulfillmentStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'failed';
  trackingNumber?: string;
  commissionRate: number;
  commissionAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  storeId: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  paymentMethod?: string;
  paymentReference?: string;
  processedAt?: string;
  createdAt: string;
}

export interface CommissionSetting {
  id: string;
  category?: string;
  storeId?: string;
  commissionRate: number;
  isActive: boolean;
  createdAt: string;
}

// Legacy interface for backward compatibility
export interface LegacyOrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}
