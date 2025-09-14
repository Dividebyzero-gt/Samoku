import { supabase } from '../lib/supabase';
import { Order, OrderItem } from '../types';
import { commissionService } from './commissionService';

export interface MultiVendorOrderData {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    storeId: string;
  }[];
  shippingAddress: Record<string, any>;
  billingAddress: Record<string, any>;
  paymentMethod: string;
  totalAmount: number;
}

export interface VendorOrderGroup {
  storeId: string;
  storeName: string;
  vendorId: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  trackingNumber?: string;
  status: Order['status'];
}

class MultiVendorOrderService {
  async createMultiVendorOrder(orderData: MultiVendorOrderData): Promise<Order> {
    try {
      // Group items by store/vendor
      const vendorGroups = await this.groupItemsByVendor(orderData.items);
      
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Calculate tax and shipping
      const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxAmount = subtotal * 0.08; // 8% tax
      const shippingAmount = this.calculateShippingCost(vendorGroups);

      // Create main order record
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: orderData.customerId,
          subtotal: subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          total_amount: subtotal + taxAmount + shippingAmount,
          shipping_address: orderData.shippingAddress,
          billing_address: orderData.billingAddress,
          payment_method: orderData.paymentMethod,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Create order items with vendor-specific details
      const orderItems: OrderItem[] = [];
      
      for (const item of orderData.items) {
        // Get product details
        const { data: product, error: productError } = await supabase
          .from('products')
          .select(`
            name, 
            images, 
            is_dropshipped, 
            provider,
            stores(name, commission_rate)
          `)
          .eq('id', item.productId)
          .single();

        if (productError) {
          throw productError;
        }

        // Create order item
        const { data: orderItem, error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.productId,
            store_id: item.storeId,
            product_name: product.name,
            product_image: product.images?.[0],
            price: item.price,
            quantity: item.quantity,
            is_dropshipped: product.is_dropshipped,
            fulfillment_status: 'pending',
            commission_rate: product.stores?.commission_rate || 5.0,
            commission_amount: (item.price * item.quantity * (product.stores?.commission_rate || 5.0)) / 100
          })
          .select()
          .single();

        if (itemError) {
          throw itemError;
        }

        orderItems.push(this.mapOrderItem(orderItem));

        // Update product stock
        await supabase
          .from('products')
          .update({
            stock_quantity: supabase.sql`stock_quantity - ${item.quantity}`,
            sales_count: supabase.sql`sales_count + ${item.quantity}`
          })
          .eq('id', item.productId);

        // Send notification to vendor about new order
        await this.notifyVendorNewOrder(item.storeId, orderItem, order);
      }

      return {
        ...this.mapOrder(order),
        items: orderItems
      };
    } catch (error) {
      console.error('Failed to create multi-vendor order:', error);
      throw error;
    }
  }

  async getOrdersByVendor(storeId: string): Promise<VendorOrderGroup[]> {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          orders(
            id,
            order_number,
            customer_id,
            status,
            payment_status,
            shipping_address,
            created_at
          ),
          stores(name, user_id)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Group items by order
      const orderGroups = data.reduce((groups, item) => {
        const orderId = item.orders.id;
        if (!groups[orderId]) {
          groups[orderId] = {
            storeId: item.store_id,
            storeName: item.stores.name,
            vendorId: item.stores.user_id,
            items: [],
            subtotal: 0,
            shippingCost: 0,
            total: 0,
            status: item.orders.status,
            orderNumber: item.orders.order_number,
            createdAt: item.orders.created_at,
            customerId: item.orders.customer_id,
            shippingAddress: item.orders.shipping_address
          };
        }
        
        groups[orderId].items.push(this.mapOrderItem(item));
        groups[orderId].subtotal += parseFloat(item.price) * item.quantity;
        
        return groups;
      }, {} as Record<string, any>);

      // Calculate shipping and totals for each group
      Object.values(orderGroups).forEach((group: any) => {
        group.shippingCost = this.calculateVendorShipping(group.items);
        group.total = group.subtotal + group.shippingCost;
      });

      return Object.values(orderGroups) as VendorOrderGroup[];
    } catch (error) {
      console.error('Failed to fetch vendor orders:', error);
      throw error;
    }
  }

  async updateOrderItemStatus(
    orderItemId: string, 
    status: OrderItem['fulfillmentStatus'],
    trackingNumber?: string
  ): Promise<void> {
    try {
      const updates: any = { 
        fulfillment_status: status,
        updated_at: new Date().toISOString()
      };

      if (trackingNumber) {
        updates.tracking_number = trackingNumber;
      }

      const { error } = await supabase
        .from('order_items')
        .update(updates)
        .eq('id', orderItemId);

      if (error) {
        throw error;
      }

      // Check if all items in the order are fulfilled to update main order status
      await this.checkAndUpdateOrderStatus(orderItemId);

      // Process commission if item is delivered
      if (status === 'delivered') {
        const { data: orderItem } = await supabase
          .from('order_items')
          .select('order_id')
          .eq('id', orderItemId)
          .single();

        if (orderItem) {
          await commissionService.processCommissionOnOrderComplete(orderItem.order_id);
        }
      }
    } catch (error) {
      console.error('Failed to update order item status:', error);
      throw error;
    }
  }

  private async groupItemsByVendor(items: MultiVendorOrderData['items']): Promise<Record<string, any>> {
    const groups: Record<string, any> = {};

    for (const item of items) {
      // Get store information
      const { data: store } = await supabase
        .from('stores')
        .select('name, user_id, commission_rate')
        .eq('id', item.storeId)
        .single();

      if (!groups[item.storeId]) {
        groups[item.storeId] = {
          storeId: item.storeId,
          storeName: store?.name || 'Unknown Store',
          vendorId: store?.user_id,
          commissionRate: store?.commission_rate || 5.0,
          items: [],
          subtotal: 0
        };
      }

      groups[item.storeId].items.push(item);
      groups[item.storeId].subtotal += item.price * item.quantity;
    }

    return groups;
  }

  private calculateShippingCost(vendorGroups: Record<string, any>): number {
    // Free shipping for orders over $50 per vendor
    let totalShipping = 0;
    
    Object.values(vendorGroups).forEach((group: any) => {
      if (group.subtotal < 50) {
        totalShipping += 9.99; // $9.99 shipping per vendor under $50
      }
    });

    return totalShipping;
  }

  private calculateVendorShipping(items: OrderItem[]): number {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return subtotal >= 50 ? 0 : 9.99;
  }

  private async checkAndUpdateOrderStatus(orderItemId: string): Promise<void> {
    try {
      // Get the order ID from the order item
      const { data: orderItem } = await supabase
        .from('order_items')
        .select('order_id')
        .eq('id', orderItemId)
        .single();

      if (!orderItem) return;

      // Get all items for this order
      const { data: allItems } = await supabase
        .from('order_items')
        .select('fulfillment_status')
        .eq('order_id', orderItem.order_id);

      if (!allItems) return;

      // Determine overall order status
      const statuses = allItems.map(item => item.fulfillment_status);
      let newOrderStatus: Order['status'] = 'pending';

      if (statuses.every(status => status === 'delivered')) {
        newOrderStatus = 'delivered';
      } else if (statuses.some(status => status === 'shipped')) {
        newOrderStatus = 'shipped';
      } else if (statuses.some(status => status === 'processing')) {
        newOrderStatus = 'processing';
      }

      // Update main order status if changed
      const { data: currentOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderItem.order_id)
        .single();

      if (currentOrder && currentOrder.status !== newOrderStatus) {
        await supabase
          .from('orders')
          .update({ 
            status: newOrderStatus,
            ...(newOrderStatus === 'shipped' && { shipped_at: new Date().toISOString() }),
            ...(newOrderStatus === 'delivered' && { delivered_at: new Date().toISOString() })
          })
          .eq('id', orderItem.order_id);

        // Notify customer of status change
        await this.notifyCustomerOrderUpdate(orderItem.order_id, newOrderStatus);
      }
    } catch (error) {
      console.error('Failed to check and update order status:', error);
    }
  }

  private async notifyVendorNewOrder(storeId: string, orderItem: any, order: any): Promise<void> {
    try {
      const { data: store } = await supabase
        .from('stores')
        .select('user_id')
        .eq('id', storeId)
        .single();

      if (store) {
        await supabase.rpc('create_notification', {
          user_id_param: store.user_id,
          type_param: 'order',
          title_param: 'New Order Received',
          message_param: `You have a new order for ${orderItem.product_name} (Qty: ${orderItem.quantity})`,
          data_param: {
            order_id: order.id,
            order_number: order.order_number,
            order_item_id: orderItem.id,
            product_name: orderItem.product_name,
            quantity: orderItem.quantity,
            amount: orderItem.price * orderItem.quantity
          },
          action_url_param: '/vendor'
        });
      }
    } catch (error) {
      console.error('Failed to notify vendor:', error);
    }
  }

  private async notifyCustomerOrderUpdate(orderId: string, status: Order['status']): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('customer_id, order_number')
        .eq('id', orderId)
        .single();

      if (order) {
        const statusMessages = {
          'processing': 'Your order is being processed',
          'shipped': 'Your order has been shipped',
          'delivered': 'Your order has been delivered'
        };

        const message = statusMessages[status as keyof typeof statusMessages] || `Order status updated to ${status}`;

        await supabase.rpc('create_notification', {
          user_id_param: order.customer_id,
          type_param: 'order',
          title_param: `Order ${order.order_number} Update`,
          message_param: message,
          data_param: {
            order_id: orderId,
            order_number: order.order_number,
            status: status
          },
          action_url_param: '/orders'
        });
      }
    } catch (error) {
      console.error('Failed to notify customer:', error);
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
      items: [],
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

export const multiVendorOrderService = new MultiVendorOrderService();