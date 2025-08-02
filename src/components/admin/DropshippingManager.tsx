import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Settings, 
  Package, 
  Eye, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { dropshippingService } from '../../services/dropshippingService';
import { DropshippingProduct, DropshippingConfig } from '../../types/dropshipping';

const DropshippingManager: React.FC = () => {
  const [products, setProducts] = useState<DropshippingProduct[]>([]);
  const [config, setConfig] = useState<DropshippingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'import' | 'config' | 'analytics'>('products');
  
  const [importForm, setImportForm] = useState({
    category: '',
    limit: 20
  });

  const [configForm, setConfigForm] = useState({
    provider: 'mock_api',
    apiKey: '',
    apiSecret: '',
    settings: {}
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await dropshippingService.getProducts();
      setProducts(response.products);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportProducts = async () => {
    try {
      setImporting(true);
      const response = await dropshippingService.importProducts(importForm);
      
      if (response.success) {
        await loadProducts();
        // Show success message
        const tempDiv = document.createElement('div');
        tempDiv.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg z-50';
        tempDiv.textContent = `Successfully imported ${response.imported} out of ${response.total} products`;
        document.body.appendChild(tempDiv);
        setTimeout(() => document.body.removeChild(tempDiv), 3000);
      }
    } catch (error) {
      console.error('Import failed:', error);
      // Show error message
      const tempDiv = document.createElement('div');
      tempDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50';
      tempDiv.textContent = `Import failed: ${error.message}`;
      document.body.appendChild(tempDiv);
      setTimeout(() => document.body.removeChild(tempDiv), 3000);
    } finally {
      setImporting(false);
    }
  };

  const handleSyncInventory = async () => {
    try {
      setSyncing(true);
      const response = await dropshippingService.syncInventory();
      
      if (response.success) {
        await loadProducts();
        // Show success message
        const tempDiv = document.createElement('div');
        tempDiv.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg z-50';
        tempDiv.textContent = `Synced ${response.updated} products. ${response.failed} failed.`;
        document.body.appendChild(tempDiv);
        setTimeout(() => document.body.removeChild(tempDiv), 3000);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      // Show error message
      const tempDiv = document.createElement('div');
      tempDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50';
      tempDiv.textContent = `Sync failed: ${error.message}`;
      document.body.appendChild(tempDiv);
      setTimeout(() => document.body.removeChild(tempDiv), 3000);
    } finally {
      setSyncing(false);
    }
  };

  const handleConfigureAPI = async () => {
    try {
      await dropshippingService.configureAPI(
        configForm.provider,
        configForm.apiKey,
        configForm.apiSecret,
        configForm.settings
      );
      
      // Show success message
      const tempDiv = document.createElement('div');
      tempDiv.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg z-50';
      tempDiv.textContent = 'API configuration saved successfully';
      document.body.appendChild(tempDiv);
      setTimeout(() => document.body.removeChild(tempDiv), 3000);
      
      // Reload products after configuration
      loadProducts();
    } catch (error) {
      console.error('Configuration failed:', error);
      // Show error message
      const tempDiv = document.createElement('div');
      tempDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50';
      tempDiv.textContent = `Configuration failed: ${error.message}`;
      document.body.appendChild(tempDiv);
      setTimeout(() => document.body.removeChild(tempDiv), 3000);
    }
  };

  const renderProductsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Dropshipped Products</h3>
          <p className="text-gray-600">{products.length} products imported</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSyncInventory}
            disabled={syncing}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Inventory'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products imported</h3>
          <p className="text-gray-600 mb-4">Start by importing products from your dropshipping provider</p>
          <button
            onClick={() => setActiveTab('import')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Import Products
          </button>
        </div>
      ) : (
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
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={product.images[0]}
                          alt={product.title}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.title}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.sku}</div>
                      <div className="text-sm text-gray-500">{product.provider}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${product.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stockLevel}</div>
                      <div className="text-xs text-gray-500">
                        Synced: {new Date(product.lastSynced).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive && product.stockLevel > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive && product.stockLevel > 0 ? 'Available' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
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

  const renderImportTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Import Products</h3>
        <p className="text-gray-600">Import products from your dropshipping provider</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Import Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Filter
              </label>
              <select
                value={importForm.category}
                onChange={(e) => setImportForm({ ...importForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home-kitchen">Home & Kitchen</option>
                <option value="beauty">Beauty</option>
                <option value="sports">Sports</option>
                <option value="toys">Toys</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Products
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={importForm.limit}
                onChange={(e) => setImportForm({ ...importForm, limit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleImportProducts}
              disabled={importing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Import Products</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Import Statistics</h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Products</span>
              <span className="font-medium">{products.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Products</span>
              <span className="font-medium text-green-600">
                {products.filter(p => p.isActive && p.stockLevel > 0).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Out of Stock</span>
              <span className="font-medium text-red-600">
                {products.filter(p => p.stockLevel === 0).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Price</span>
              <span className="font-medium">
                ${products.length > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Import Guidelines</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Products are automatically marked as dropshipped and assigned to Admin Store</li>
              <li>• Vendors cannot view or edit these products</li>
              <li>• Inventory levels are synced daily with the API</li>
              <li>• Orders are automatically fulfilled when customers purchase</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfigTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">API Configuration</h3>
        <p className="text-gray-600">Configure your dropshipping provider API settings</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider
            </label>
            <select
              value={configForm.provider}
              onChange={(e) => setConfigForm({ ...configForm, provider: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mock_api">Mock API (Demo)</option>
              <option value="printful">Printful</option>
              <option value="dropcommerce">DropCommerce</option>
              <option value="spocket">Spocket</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={configForm.apiKey}
              onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
              placeholder={getApiKeyPlaceholder()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Secret (Optional)
            </label>
            <input
              type="password"
              value={configForm.apiSecret}
              onChange={(e) => setConfigForm({ ...configForm, apiSecret: e.target.value })}
              placeholder={getApiSecretPlaceholder()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Provider-specific settings */}
          {configForm.provider === 'printful' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Printful Setup Instructions</h5>
              <div className="mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                <p className="text-xs text-yellow-800">
                  <strong>Demo Mode:</strong> Currently using simulated data due to WebContainer API limitations. In production deployment, this will connect to real Printful API.
                </p>
              </div>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Go to your Printful Dashboard → Settings → Stores</li>
                <li>2. Select your store and go to API tab</li>
                <li>3. Copy your <strong>Private Access Token</strong> (not API Key)</li>
                <li>4. Paste it in the API Key field above</li>
                <li>5. For testing, you can enter any value to see demo products</li>
              </ol>
            </div>
          )}

          {configForm.provider === 'spocket' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-2">Spocket Setup Instructions</h5>
              <div className="mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                <p className="text-xs text-yellow-800">
                  <strong>Demo Mode:</strong> Currently using simulated data due to WebContainer API limitations. In production deployment, this will connect to real Spocket API.
                </p>
              </div>
              <ol className="text-sm text-green-800 space-y-1">
                <li>1. Go to your Spocket Dashboard → Settings → Integrations</li>
                <li>2. Generate a <strong>Production API Key</strong></li>
                <li>3. Paste it in the API Key field above</li>
                <li>4. For testing, you can enter any value to see demo products</li>
              </ol>
            </div>
          )}

          {configForm.provider === 'dropcommerce' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h5 className="font-medium text-purple-900 mb-2">DropCommerce Setup Instructions</h5>
              <div className="mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                <p className="text-xs text-yellow-800">
                  <strong>Demo Mode:</strong> Currently using simulated data due to WebContainer API limitations. In production deployment, this will connect to real DropCommerce API.
                </p>
              </div>
              <ol className="text-sm text-purple-800 space-y-1">
                <li>1. Go to your DropCommerce Dashboard → API Settings</li>
                <li>2. Generate <strong>Production API Credentials</strong></li>
                <li>3. Enter both API Key and API Secret above</li>
                <li>4. For testing, you can enter any value to see demo products</li>
              </ol>
            </div>
          )}

          <button
            onClick={handleConfigureAPI}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );

  const getApiKeyPlaceholder = () => {
    switch (configForm.provider) {
      case 'printful':
        return 'Enter your Printful Production Access Token';
      case 'spocket':
        return 'Enter your Spocket Production API Key';
      case 'dropcommerce':
        return 'Enter your DropCommerce Production API Key';
      case 'mock_api':
        return 'Enter any value for testing';
      default:
        return 'Enter your API key';
    }
  };

  const getApiSecretPlaceholder = () => {
    switch (configForm.provider) {
      case 'printful':
        return 'Not required for Printful';
      case 'spocket':
        return 'Not required for Spocket';
      case 'dropcommerce':
        return 'Enter your DropCommerce Production API Secret';
      case 'mock_api':
        return 'Not required for testing';
      default:
        return 'Enter your API secret if required';
    }
  };

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Dropshipping Analytics</h3>
        <p className="text-gray-600">Performance metrics for your dropshipped products</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.isActive && p.stockLevel > 0).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900">
                ${products.length > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) : '0'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${products.reduce((sum, p) => sum + (p.price * p.stockLevel), 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Category Distribution</h4>
        <div className="space-y-3">
          {Object.entries(
            products.reduce((acc, product) => {
              acc[product.category] = (acc[product.category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">{category}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(count / products.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'import', label: 'Import', icon: Download },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div>
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ' +
                  (activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')
                }
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && renderProductsTab()}
      {activeTab === 'import' && renderImportTab()}
      {activeTab === 'config' && renderConfigTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
    </div>
  );
};

export default DropshippingManager;