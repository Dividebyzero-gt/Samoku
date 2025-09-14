import { supabase } from '../lib/supabase';
import { CommissionTransaction } from '../types/enhanced';

export interface CommissionStats {
  totalEarnings: number;
  pendingCommissions: number;
  paidCommissions: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  averageOrderValue: number;
  commissionRate: number;
}

export interface CreatePayoutRequest {
  storeId: string;
  amount: number;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  notes?: string;
}

class CommissionService {
  async getStoreCommissions(storeId: string, status?: string): Promise<CommissionTransaction[]> {
    try {
      let query = supabase
        .from('commission_transactions')
        .select(`
          *,
          order_items(product_name, product_image, quantity),
          orders(order_number, created_at)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(this.mapCommissionTransaction);
    } catch (error) {
      console.error('Failed to fetch store commissions:', error);
      throw error;
    }
  }

  async getCommissionStats(storeId: string): Promise<CommissionStats> {
    try {
      // Get all commission transactions for the store
      const { data: transactions } = await supabase
        .from('commission_transactions')
        .select('*')
        .eq('store_id', storeId);

      // Get store commission rate
      const { data: store } = await supabase
        .from('stores')
        .select('commission_rate')
        .eq('id', storeId)
        .single();

      if (!transactions || !store) {
        return this.getEmptyStats();
      }

      // Calculate stats
      const totalEarnings = transactions.reduce((sum, t) => sum + parseFloat(t.net_amount), 0);
      const pendingCommissions = transactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + parseFloat(t.net_amount), 0);
      const paidCommissions = transactions
        .filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + parseFloat(t.net_amount), 0);

      // This month calculations
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthTransactions = transactions.filter(t => 
        new Date(t.created_at) >= thisMonth
      );
      const thisMonthEarnings = thisMonthTransactions.reduce((sum, t) => sum + parseFloat(t.net_amount), 0);

      // Last month calculations
      const lastMonth = new Date(thisMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthEnd = new Date(thisMonth);
      lastMonthEnd.setDate(0); // Last day of previous month
      
      const lastMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.created_at);
        return transactionDate >= lastMonth && transactionDate <= lastMonthEnd;
      });
      const lastMonthEarnings = lastMonthTransactions.reduce((sum, t) => sum + parseFloat(t.net_amount), 0);

      // Average order value
      const averageOrderValue = transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + parseFloat(t.sale_amount), 0) / transactions.length
        : 0;

      return {
        totalEarnings,
        pendingCommissions,
        paidCommissions,
        thisMonthEarnings,
        lastMonthEarnings,
        averageOrderValue,
        commissionRate: parseFloat(store.commission_rate)
      };
    } catch (error) {
      console.error('Failed to calculate commission stats:', error);
      return this.getEmptyStats();
    }
  }

  async requestPayout(payoutRequest: CreatePayoutRequest): Promise<void> {
    try {
      // Get pending commissions for the store
      const { data: pendingCommissions } = await supabase
        .from('commission_transactions')
        .select('id')
        .eq('store_id', payoutRequest.storeId)
        .eq('status', 'pending');

      if (!pendingCommissions || pendingCommissions.length === 0) {
        throw new Error('No pending commissions available for payout');
      }

      const commissionIds = pendingCommissions.map(c => c.id);

      // Create payout record
      const { data: payout, error: payoutError } = await supabase
        .from('payouts')
        .insert({
          store_id: payoutRequest.storeId,
          amount: payoutRequest.amount,
          period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          period_end: new Date().toISOString().split('T')[0],
          status: 'pending',
          commission_transaction_ids: commissionIds,
          bank_details: payoutRequest.bankDetails,
          vendor_notes: payoutRequest.notes
        })
        .select()
        .single();

      if (payoutError) {
        throw payoutError;
      }

      // Update commission transactions to processing
      const { error: updateError } = await supabase
        .from('commission_transactions')
        .update({ 
          status: 'processing',
          payout_id: payout.id 
        })
        .in('id', commissionIds);

      if (updateError) {
        throw updateError;
      }

      // Create notification for vendor
      const { data: store } = await supabase
        .from('stores')
        .select('user_id')
        .eq('id', payoutRequest.storeId)
        .single();

      if (store) {
        await this.createNotification(
          store.user_id,
          'payout',
          'Payout Request Submitted',
          `Your payout request for $${payoutRequest.amount.toFixed(2)} has been submitted and is being processed.`,
          { payout_id: payout.id, amount: payoutRequest.amount }
        );
      }
    } catch (error) {
      console.error('Failed to request payout:', error);
      throw error;
    }
  }

  async processCommissionOnOrderComplete(orderId: string): Promise<void> {
    try {
      // Mark commissions as paid when order is completed
      const { error } = await supabase
        .from('commission_transactions')
        .update({ 
          status: 'paid',
          processed_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to process commission:', error);
      throw error;
    }
  }

  private async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data: any = {}
  ): Promise<void> {
    try {
      await supabase.rpc('create_notification', {
        user_id_param: userId,
        type_param: type,
        title_param: title,
        message_param: message,
        data_param: data
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  private getEmptyStats(): CommissionStats {
    return {
      totalEarnings: 0,
      pendingCommissions: 0,
      paidCommissions: 0,
      thisMonthEarnings: 0,
      lastMonthEarnings: 0,
      averageOrderValue: 0,
      commissionRate: 5.0
    };
  }

  private mapCommissionTransaction(dbTransaction: any): CommissionTransaction {
    return {
      id: dbTransaction.id,
      orderItemId: dbTransaction.order_item_id,
      storeId: dbTransaction.store_id,
      orderId: dbTransaction.order_id,
      saleAmount: parseFloat(dbTransaction.sale_amount),
      commissionRate: parseFloat(dbTransaction.commission_rate),
      commissionAmount: parseFloat(dbTransaction.commission_amount),
      platformFee: parseFloat(dbTransaction.platform_fee),
      netAmount: parseFloat(dbTransaction.net_amount),
      status: dbTransaction.status,
      payoutId: dbTransaction.payout_id,
      processedAt: dbTransaction.processed_at,
      createdAt: dbTransaction.created_at
    };
  }
}

export const commissionService = new CommissionService();