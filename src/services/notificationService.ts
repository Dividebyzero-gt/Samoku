import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'payment' | 'product' | 'store' | 'system';
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  actionUrl?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface CreateNotificationData {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  expiresAt?: string;
}

class NotificationService {
  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data.map(this.mapNotification);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  async createNotification(notificationData: CreateNotificationData): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data || {},
          action_url: notificationData.actionUrl,
          expires_at: notificationData.expiresAt
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapNotification(data);
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  async createBulkNotifications(notifications: CreateNotificationData[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert(notifications.map(n => ({
          user_id: n.userId,
          type: n.type,
          title: n.title,
          message: n.message,
          data: n.data || {},
          action_url: n.actionUrl,
          expires_at: n.expiresAt
        })));

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to create bulk notifications:', error);
      throw error;
    }
  }

  // Predefined notification templates
  async notifyOrderStatusChange(
    customerId: string, 
    orderNumber: string, 
    status: string,
    trackingNumber?: string
  ): Promise<void> {
    const statusMessages = {
      'processing': 'Your order is being processed and will ship soon.',
      'shipped': trackingNumber 
        ? `Your order has shipped! Tracking number: ${trackingNumber}`
        : 'Your order has shipped!',
      'delivered': 'Your order has been delivered. Thank you for shopping with us!'
    };

    const message = statusMessages[status as keyof typeof statusMessages] || `Your order status has been updated to ${status}.`;

    await this.createNotification({
      userId: customerId,
      type: 'order',
      title: `Order ${orderNumber} Update`,
      message,
      data: {
        order_number: orderNumber,
        status,
        tracking_number: trackingNumber
      },
      actionUrl: '/orders'
    });
  }

  async notifyVendorNewOrder(
    vendorId: string,
    orderNumber: string,
    productName: string,
    quantity: number,
    amount: number
  ): Promise<void> {
    await this.createNotification({
      userId: vendorId,
      type: 'order',
      title: 'New Order Received',
      message: `New order for ${productName} (Qty: ${quantity}) - $${amount.toFixed(2)}`,
      data: {
        order_number: orderNumber,
        product_name: productName,
        quantity,
        amount
      },
      actionUrl: '/vendor'
    });
  }

  async notifyLowStock(vendorId: string, productName: string, currentStock: number): Promise<void> {
    await this.createNotification({
      userId: vendorId,
      type: 'product',
      title: 'Low Stock Alert',
      message: `${productName} is running low on stock (${currentStock} remaining)`,
      data: {
        product_name: productName,
        current_stock: currentStock
      },
      actionUrl: '/vendor'
    });
  }

  async notifyStoreApproval(vendorId: string, storeName: string, approved: boolean): Promise<void> {
    const title = approved ? 'Store Approved!' : 'Store Application Update';
    const message = approved 
      ? `Congratulations! Your store "${storeName}" has been approved and is now live.`
      : `Your store application for "${storeName}" requires additional review.`;

    await this.createNotification({
      userId: vendorId,
      type: 'store',
      title,
      message,
      data: {
        store_name: storeName,
        approved
      },
      actionUrl: approved ? '/vendor' : '/vendor/settings'
    });
  }

  private mapNotification(dbNotification: any): Notification {
    return {
      id: dbNotification.id,
      userId: dbNotification.user_id,
      type: dbNotification.type,
      title: dbNotification.title,
      message: dbNotification.message,
      data: dbNotification.data || {},
      isRead: dbNotification.is_read,
      actionUrl: dbNotification.action_url,
      expiresAt: dbNotification.expires_at,
      createdAt: dbNotification.created_at
    };
  }
}

export const notificationService = new NotificationService();