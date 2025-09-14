import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Edit, 
  Save, 
  X,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { inventoryService, InventoryAlert, StockLevel, InventoryUpdate } from '../../services/inventoryService';
import { productService } from '../../services/productService';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types';

interface InventoryManagerProps {
  storeId: string;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ storeId }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);

  useEffect(() => {
    loadInventoryData();
  }, [storeId]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [storeProducts, storeAlerts, stockData] = await Promise.all([
        productService.getProducts({ ownerId: user?.id, isActive: true }),
        inventoryService.getStoreAlerts(storeId),
        inventoryService.getStockLevels(storeId)
      ]);

      setProducts(storeProducts);
      setAlerts(storeAlerts);
      setStockLevels(stockData);
    } catch (error) {
      console.error('Failed to load inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (productId: string, newQuantity: number) => {
    try {
      const update: InventoryUpdate = {
        productId,
        quantity: newQuantity,
        operation: 'set',
        reason: 'Manual update by vendor'
      };

      await inventoryService.updateProductStock(update);
      await loadInventoryData(); // Reload to get updated data
      setEditingStock(null);
    } catch (error) {
      console.error('Failed to update stock:', error);
      alert('Failed to update stock. Please try again.');
    }
  };

  const handleSyncDropshippingInventory = async () => {
    try {
      setSyncing(true);
      const result = await inventoryService.syncDropshippingInventory();
      
      if (result.updated > 0) {
        await loadInventoryData();
        alert(`Successfully updated ${result.updated} products. ${result.errors} errors.`);
      } else {
        alert('No products were updated.');
      }
    } catch (error) {
      console.error('Failed to sync inventory:', error);
      alert('Failed to sync inventory. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await inventoryService.resolveAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (quantity <= 10) {
      return { text: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-100' };
    } else {
      return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Inventory Management</h3>
          <p className="text-gray-600">Monitor and manage your product stock levels</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSyncDropshippingInventory}
            disabled={syncing}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Dropship'}</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Inventory Alerts ({alerts.length})
          </h4>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-orange-200">
                <div className="flex items-center space-x-3">
                  <img
                    src={alert.product?.images[0] || ''}
                    alt={alert.product?.name || ''}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div>
                    <h5 className="font-medium text-gray-900">{alert.product?.name}</h5>
                    <p className="text-sm text-orange-700">
                      {alert.alertType === 'out_of_stock' ? 'Out of stock' : 
                       alert.alertType === 'low_stock' ? `Low stock: ${alert.currentQuantity} remaining` :
                       'Stock alert'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleResolveAlert(alert.id)}
                  className="text-orange-600 hover:text-orange-700 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">
                {stockLevels.filter(s => s.isLowStock).length}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {stockLevels.filter(s => s.isOutOfStock).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stock Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stockQuantity);
                const isEditing = editingStock === product.id;
                
                return (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            value={newStockValue}
                            onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={() => handleStockUpdate(product.id, newStockValue)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingStock(null)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {product.stockQuantity}
                          </span>
                          <button
                            onClick={() => {
                              setEditingStock(product.id);
                              setNewStockValue(product.stockQuantity);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(product.price * product.stockQuantity).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingStock(product.id);
                            setNewStockValue(product.stockQuantity);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Stock"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Operations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Bulk Operations</h4>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export Inventory</span>
          </button>
          <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <Upload className="h-4 w-4" />
            <span>Import CSV</span>
          </button>
          <button className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            <AlertTriangle className="h-4 w-4" />
            <span>Set Low Stock Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;