import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Settings, 
  Plus,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Star,
  Users,
  CreditCard,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import RoleGuard from '../../components/auth/RoleGuard';
import InventoryManager from '../../components/vendor/InventoryManager';
import CommissionDashboard from '../../components/vendor/CommissionDashboard';
import { vendorAnalyticsService } from '../../services/vendorAnalyticsService';
import { inventoryService } from '../../services/inventoryService';
import { VendorStats } from '../../types/enhanced';

const EnhancedVendorDashboard: React.FC = () => {
  const { user, isApprovedVendor, canManageOwnProducts } = useRoleAccess();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [vendorStats, setVendorStats] = useState<VendorStats | null>(null);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (user?.store?.id) {
      loadVendorData();
    }
  }, [user]);

  const loadVendorData = async () => {
    if (!user?.store?.id) return;

    try {
      setLoading(true);
      const [stats, alerts] = await Promise.all([
        vendorAnalyticsService.getVendorStats(user.store.id),
        inventoryService.getStoreAlerts(user.store.id, false)
      ]);

      setVendorStats(stats);
      setInventoryAlerts(alerts);
    } catch (error) {
      console.error('Failed to load vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory', icon: AlertTriangle },
    { id: 'payouts', label: 'Payouts', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Store Dashboard</h2>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Store Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                ${vendorStats?.totalSales.toLocaleString() || '0'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm text-green-600 mt-2">
            {vendorStats && vendorStats.lastMonthSales > 0 ? (
              `${((vendorStats.thisMonthSales - vendorStats.lastMonthSales) / vendorStats.lastMonthSales * 100).toFixed(1)}% vs last month`
            ) : (
              'Start of your journey'
            )}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {vendorStats?.totalOrders || 0}
              </p>
            </div>
            <ShoppingBag className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm text-orange-600 mt-2">
            {vendorStats?.pendingOrders || 0} pending
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {vendorStats?.totalProducts || 0}
              </p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Active listings</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Store Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {vendorStats?.averageRating?.toFixed(1) || '0.0'}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            From {vendorStats?.totalReviews || 0} reviews
          </p>
        </div>
      </div>

      {/* Earnings & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-green-600">
                ${vendorStats?.thisMonthSales.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Payout</span>
              <span className="font-semibold text-orange-600">
                ${vendorStats?.unpaidCommissions.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-gray-600">Commission Rate</span>
              <span className="font-semibold">5.0%</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Request Payout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          {!vendorStats?.recentOrders || vendorStats.recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vendorStats.recentOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.fullName} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
          <p className="text-gray-600">Manage your product catalog</p>
          {inventoryAlerts.length > 0 && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  {inventoryAlerts.length} inventory alert{inventoryAlerts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
        {canManageOwnProducts && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {!isApprovedVendor ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Clock className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Store Approval Pending</h3>
          <p className="text-yellow-700">
            Your store is currently under review. You'll be able to add products once approved.
          </p>
        </div>
      ) : (
        vendorStats?.topSellingProducts && vendorStats.topSellingProducts.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendorStats.topSellingProducts.slice(0, 5).map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.images[0]}
                            alt={product.name}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 max-w-48 truncate">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">{product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.stockQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.salesCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-900">{product.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first product to begin selling</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Add Your First Product
            </button>
          </div>
        )
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <p className="text-gray-600">Track and fulfill your customer orders</p>
      </div>

      {!vendorStats?.recentOrders || vendorStats.recentOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">Orders from customers will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendorStats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.shippingAddress.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderPayouts = () => (
    user?.store?.id ? <CommissionDashboard storeId={user.store.id} /> : (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Store Required</h3>
        <p className="text-gray-600">You need an approved store to view commission information</p>
      </div>
    )
  );

  const renderInventory = () => (
    user?.store?.id ? <InventoryManager storeId={user.store.id} /> : (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Store Required</h3>
        <p className="text-gray-600">You need an approved store to manage inventory</p>
      </div>
    )
  );
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'products':
        return renderProducts();
      case 'orders':
        return renderOrders();
      case 'inventory':
        return renderInventory();
      case 'payouts':
        return renderPayouts();
      case 'analytics':
        return (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Store Analytics</h3>
            <p className="text-gray-600">Detailed analytics dashboard coming soon</p>
          </div>
        );
      case 'messages':
        return (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Messages</h3>
            <p className="text-gray-600">Messaging system coming soon</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Store Settings</h3>
            <p className="text-gray-600">Store configuration interface coming soon</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <RoleGuard allowedRoles={['vendor']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Vendor Sidebar */}
            <div className="lg:w-64">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{user?.vendorInfo?.storeName || 'My Store'}</h3>
                  <p className="text-sm text-gray-600">{user?.name}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                    isApprovedVendor 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {isApprovedVendor ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>

                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === item.id
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default EnhancedVendorDashboard;