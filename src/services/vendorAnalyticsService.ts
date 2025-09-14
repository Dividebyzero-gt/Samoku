import { supabase } from '../lib/supabase';
import { VendorStats } from '../types/enhanced';
import { Product, Order } from '../types';

export interface VendorAnalytics {
  salesTrend: { date: string; amount: number; orders: number }[];
  topProducts: Product[];
  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    averageOrderValue: number;
    customerRetentionRate: number;
  };
  performanceMetrics: {
    fulfillmentTime: number; // Average days to fulfill
    responseTime: number; // Average response time to customer inquiries
    returnRate: number; // Percentage of orders returned
    satisfactionScore: number; // Average rating
  };
}

class VendorAnalyticsService {
  async getVendorStats(storeId: string): Promise<VendorStats> {
    try {
      // Get basic store stats
      const [orderStats, productStats, commissionStats, recentOrders] = await Promise.all([
        this.getOrderStats(storeId),
        this.getProductStats(storeId),
        this.getCommissionStats(storeId),
        this.getRecentOrders(storeId)
      ]);

      return {
        ...orderStats,
        ...productStats,
        ...commissionStats,
        recentOrders
      };
    } catch (error) {
      console.error('Failed to get vendor stats:', error);
      throw error;
    }
  }

  async getVendorAnalytics(storeId: string, days: number = 30): Promise<VendorAnalytics> {
    try {
      const [salesTrend, topProducts, customerMetrics, performanceMetrics] = await Promise.all([
        this.getSalesTrend(storeId, days),
        this.getTopProducts(storeId),
        this.getCustomerMetrics(storeId, days),
        this.getPerformanceMetrics(storeId, days)
      ]);

      return {
        salesTrend,
        topProducts,
        customerMetrics,
        performanceMetrics
      };
    } catch (error) {
      console.error('Failed to get vendor analytics:', error);
      throw error;
    }
  }

  private async getOrderStats(storeId: string) {
    try {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          price,
          quantity,
          fulfillment_status,
          created_at,
          orders!inner(status, payment_status)
        `)
        .eq('store_id', storeId);

      const totalSales = orderItems?.reduce((sum, item) => 
        sum + (parseFloat(item.price) * item.quantity), 0
      ) || 0;

      const totalOrders = new Set(orderItems?.map(item => item.orders)).size || 0;
      const pendingOrders = orderItems?.filter(item => 
        item.fulfillment_status === 'pending'
      ).length || 0;

      return { totalSales, totalOrders, pendingOrders };
    } catch (error) {
      console.error('Failed to get order stats:', error);
      return { totalSales: 0, totalOrders: 0, pendingOrders: 0 };
    }
  }

  private async getProductStats(storeId: string) {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('rating, review_count')
        .eq('store_id', storeId)
        .eq('is_active', true);

      const totalProducts = products?.length || 0;
      const averageRating = products && products.length > 0
        ? products.reduce((sum, p) => sum + parseFloat(p.rating), 0) / products.length
        : 0;
      const totalReviews = products?.reduce((sum, p) => sum + p.review_count, 0) || 0;

      const { data: topProducts } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('sales_count', { ascending: false })
        .limit(5);

      return {
        totalProducts,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        topSellingProducts: topProducts || []
      };
    } catch (error) {
      console.error('Failed to get product stats:', error);
      return {
        totalProducts: 0,
        averageRating: 0,
        totalReviews: 0,
        topSellingProducts: []
      };
    }
  }

  private async getCommissionStats(storeId: string) {
    try {
      const { data: commissions } = await supabase
        .from('commission_transactions')
        .select('net_amount, status')
        .eq('store_id', storeId);

      const totalCommissions = commissions?.reduce((sum, c) => 
        sum + parseFloat(c.net_amount), 0
      ) || 0;

      const unpaidCommissions = commissions?.filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + parseFloat(c.net_amount), 0) || 0;

      // This month's earnings
      const thisMonth = new Date();
      thisMonth.setDate(1);
      
      const { data: thisMonthCommissions } = await supabase
        .from('commission_transactions')
        .select('net_amount')
        .eq('store_id', storeId)
        .gte('created_at', thisMonth.toISOString());

      const thisMonthSales = thisMonthCommissions?.reduce((sum, c) => 
        sum + parseFloat(c.net_amount), 0
      ) || 0;

      // Last month's earnings
      const lastMonth = new Date(thisMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthEnd = new Date(thisMonth);
      lastMonthEnd.setDate(0);

      const { data: lastMonthCommissions } = await supabase
        .from('commission_transactions')
        .select('net_amount')
        .eq('store_id', storeId)
        .gte('created_at', lastMonth.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());

      const lastMonthSales = lastMonthCommissions?.reduce((sum, c) => 
        sum + parseFloat(c.net_amount), 0
      ) || 0;

      return {
        totalCommissions,
        unpaidCommissions,
        thisMonthSales,
        lastMonthSales
      };
    } catch (error) {
      console.error('Failed to get commission stats:', error);
      return {
        totalCommissions: 0,
        unpaidCommissions: 0,
        thisMonthSales: 0,
        lastMonthSales: 0
      };
    }
  }

  private async getRecentOrders(storeId: string): Promise<Order[]> {
    try {
      const { data } = await supabase
        .from('order_items')
        .select(`
          *,
          orders!inner(*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Convert to Order format (simplified)
      return data?.map(item => ({
        id: item.orders.id,
        orderNumber: item.orders.order_number,
        customerId: item.orders.customer_id,
        totalAmount: parseFloat(item.price) * item.quantity,
        subtotal: parseFloat(item.price) * item.quantity,
        taxAmount: 0,
        shippingAmount: 0,
        status: item.orders.status,
        shippingAddress: item.orders.shipping_address,
        billingAddress: item.orders.billing_address,
        paymentMethod: item.orders.payment_method,
        paymentStatus: item.orders.payment_status,
        trackingNumber: item.orders.tracking_number,
        shippedAt: item.orders.shipped_at,
        deliveredAt: item.orders.delivered_at,
        items: [], // Simplified for stats
        createdAt: item.orders.created_at,
        updatedAt: item.orders.updated_at
      })) || [];
    } catch (error) {
      console.error('Failed to get recent orders:', error);
      return [];
    }
  }

  private async getSalesTrend(storeId: string, days: number) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data } = await supabase
        .from('commission_transactions')
        .select('net_amount, created_at')
        .eq('store_id', storeId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Group by date
      const dailyStats = data?.reduce((acc, transaction) => {
        const date = new Date(transaction.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { amount: 0, orders: 0 };
        }
        acc[date].amount += parseFloat(transaction.net_amount);
        acc[date].orders += 1;
        return acc;
      }, {} as Record<string, { amount: number; orders: number }>) || {};

      return Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        amount: stats.amount,
        orders: stats.orders
      }));
    } catch (error) {
      console.error('Failed to get sales trend:', error);
      return [];
    }
  }

  private async getTopProducts(storeId: string): Promise<Product[]> {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('sales_count', { ascending: false })
        .limit(5);

      return data?.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
        images: product.images || [],
        category: product.category,
        subcategory: product.subcategory,
        ownerId: product.owner_id,
        storeId: product.store_id,
        storeName: '', // Will be populated if needed
        rating: parseFloat(product.rating),
        reviewCount: product.review_count,
        stockQuantity: product.stock_quantity,
        tags: product.tags || [],
        specifications: product.specifications || {},
        sku: product.sku,
        isDropshipped: product.is_dropshipped,
        dropshipMetadata: product.dropship_metadata || {},
        externalId: product.external_id,
        provider: product.provider,
        salesCount: product.sales_count,
        isActive: product.is_active,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      })) || [];
    } catch (error) {
      console.error('Failed to get top products:', error);
      return [];
    }
  }

  private async getCustomerMetrics(storeId: string, days: number) {
    // This would require more complex queries to track customer behavior
    // For now, return placeholder that could be implemented with real data
    return {
      newCustomers: 0,
      returningCustomers: 0,
      averageOrderValue: 0,
      customerRetentionRate: 0
    };
  }

  private async getPerformanceMetrics(storeId: string, days: number) {
    // This would require tracking fulfillment times, response times, etc.
    // For now, return placeholder that could be implemented with real data
    return {
      fulfillmentTime: 0,
      responseTime: 0,
      returnRate: 0,
      satisfactionScore: 0
    };
  }
}

export const vendorAnalyticsService = new VendorAnalyticsService();