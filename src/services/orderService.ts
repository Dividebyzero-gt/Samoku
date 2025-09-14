import { supabase } from '../lib/supabase';
import { Order, OrderItem } from '../types';
import { multiVendorOrderService } from './multiVendorOrderService';
import { notificationService } from './notificationService';

export interface CreateOrderData {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: Record<string, any>;
  billingAddress: Record<string, any>;
  paymentMethod: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
}

class OrderService {
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      // Use multi-vendor order service for proper vendor splitting
      const enhancedOrderData = {
        customerId: orderData.customerId,
        items: await Promise.all(orderData.items.map(async (item) => {
          const { data: product } = await supabase
            .from('products')
            .select('store_id')
            .eq('id', item.productId)
            .single();
          
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            storeId: product?.store_id || ''
          };
        })),
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        paymentMethod: orderData.paymentMethod,
        totalAmount: orderData.totalAmount
      };

      return await multiVendorOrderService.createMultiVendorOrder(enhancedOrderData);
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  async getOrders(customerId?: string, storeId?: string): Promise<Order[]> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `);

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      if (storeId) {
        query = query.eq('order_items.store_id', storeId);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(order => ({
        ...this.mapOrder(order),
        items: order.order_items.map(this.mapOrderItem),
      }));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }

  async getOrder(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return {
        ...this.mapOrder(data),
        items: data.order_items.map(this.mapOrderItem),
      };
    } catch (error) {
      console.error('Failed to fetch order:', error);
      return null;
    }
  }

  async updateOrderStatus(id: string, status: Order['status'], trackingNumber?: string): Promise<Order> {
    try {
      const updates: any = { status };
      
      if (status === 'shipped' && trackingNumber) {
        updates.tracking_number = trackingNumber;
        updates.shipped_at = new Date().toISOString();
      }
      
      if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          order_items(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      return {
        ...this.mapOrder(data),
        items: data.order_items.map(this.mapOrderItem),
      };
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }

  async updatePaymentStatus(id: string, paymentStatus: Order['paymentStatus']): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
      throw error;
    }
  }

  private mapOrder(dbOrder: any): Order {
    return {
      id: dbOrder.id,
      orderNumber: dbOrder.order_number,
      customerId: dbOrder.customer_id,
      totalAmount: parseFloat(dbOrder.total_amount),
      subtotal: parseFloat(dbOrder.subtotal),
      taxAmount: parseFloat(dbOrder.tax_amount),
      shippingAmount: parseFloat(dbOrder.shipping_amount),
      status: dbOrder.status,
      shippingAddress: dbOrder.shipping_address,
      billingAddress: dbOrder.billing_address,
      paymentMethod: dbOrder.payment_method,
      paymentStatus: dbOrder.payment_status,
      trackingNumber: dbOrder.tracking_number,
      shippedAt: dbOrder.shipped_at,
      deliveredAt: dbOrder.delivered_at,
      items: [], // Will be populated by caller
      createdAt: dbOrder.created_at,
      updatedAt: dbOrder.updated_at,
    };
  }

  private mapOrderItem(dbItem: any): OrderItem {
    return {
      id: dbItem.id,
      orderId: dbItem.order_id,
      productId: dbItem.product_id,
      storeId: dbItem.store_id,
      productName: dbItem.product_name,
      productImage: dbItem.product_image,
      price: parseFloat(dbItem.price),
      quantity: dbItem.quantity,
      isDropshipped: dbItem.is_dropshipped,
      fulfillmentStatus: dbItem.fulfillment_status,
      trackingNumber: dbItem.tracking_number,
      commissionRate: parseFloat(dbItem.commission_rate),
      commissionAmount: parseFloat(dbItem.commission_amount),
      createdAt: dbItem.created_at,
      updatedAt: dbItem.updated_at,
    };
  }
}

export const orderService = new OrderService();