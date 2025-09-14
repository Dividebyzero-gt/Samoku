import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  CreditCard,
  BarChart3,
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { commissionService, CommissionStats, CreatePayoutRequest } from '../../services/commissionService';
import { CommissionTransaction } from '../../types/enhanced';

interface CommissionDashboardProps {
  storeId: string;
}

const CommissionDashboard: React.FC<CommissionDashboardProps> = ({ storeId }) => {
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [transactions, setTransactions] = useState<CommissionTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutForm, setPayoutForm] = useState<CreatePayoutRequest>({
    storeId,
    amount: 0,
    bankDetails: {
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      bankName: ''
    },
    notes: ''
  });

  useEffect(() => {
    loadCommissionData();
  }, [storeId]);

  const loadCommissionData = async () => {
    try {
      setLoading(true);
      const [commissionStats, commissionTransactions] = await Promise.all([
        commissionService.getCommissionStats(storeId),
        commissionService.getStoreCommissions(storeId)
      ]);

      setStats(commissionStats);
      setTransactions(commissionTransactions);
      setPayoutForm(prev => ({
        ...prev,
        amount: commissionStats.pendingCommissions
      }));
    } catch (error) {
      console.error('Failed to load commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await commissionService.requestPayout(payoutForm);
      setShowPayoutForm(false);
      await loadCommissionData();
      alert('Payout request submitted successfully!');
    } catch (error) {
      console.error('Failed to request payout:', error);
      alert('Failed to submit payout request. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading commission data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats?.pendingCommissions.toFixed(2) || '0.00'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4">
            <button
              onClick={() => setShowPayoutForm(true)}
              disabled={!stats?.pendingCommissions || stats.pendingCommissions <= 0}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Request Payout
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats?.thisMonthEarnings.toFixed(2) || '0.00'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {stats && stats.lastMonthEarnings > 0 ? (
              <>
                {((stats.thisMonthEarnings - stats.lastMonthEarnings) / stats.lastMonthEarnings * 100).toFixed(1)}% 
                vs last month
              </>
            ) : (
              'First month earnings'
            )}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats?.totalEarnings.toFixed(2) || '0.00'}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Lifetime earnings</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commission Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.commissionRate.toFixed(1) || '5.0'}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Platform commission</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.slice(0, 10).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Order #{transaction.orderId.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${transaction.saleAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${transaction.commissionAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${transaction.netAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Request Modal */}
      {showPayoutForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Payout</h3>
            
            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payout Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ 
                    ...payoutForm, 
                    amount: parseFloat(e.target.value) || 0 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available balance: ${stats?.pendingCommissions.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  value={payoutForm.bankDetails.accountName}
                  onChange={(e) => setPayoutForm({
                    ...payoutForm,
                    bankDetails: { ...payoutForm.bankDetails, accountName: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  value={payoutForm.bankDetails.accountNumber}
                  onChange={(e) => setPayoutForm({
                    ...payoutForm,
                    bankDetails: { ...payoutForm.bankDetails, accountNumber: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Routing Number
                </label>
                <input
                  type="text"
                  required
                  value={payoutForm.bankDetails.routingNumber}
                  onChange={(e) => setPayoutForm({
                    ...payoutForm,
                    bankDetails: { ...payoutForm.bankDetails, routingNumber: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={payoutForm.bankDetails.bankName}
                  onChange={(e) => setPayoutForm({
                    ...payoutForm,
                    bankDetails: { ...payoutForm.bankDetails, bankName: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={payoutForm.notes}
                  onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayoutForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionDashboard;