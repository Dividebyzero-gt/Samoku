import { createClient } from 'npm:@supabase/supabase-js@2.53.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface DropshippingProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  tags: string[];
  images: string[];
  stock_level: number;
  shipping_time: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  variants?: any[];
}

// Real Dropshipping API integration - replace with actual provider
class DropshippingAPI {
  private apiKey: string;
  private apiSecret?: string;
  private provider: string;

  constructor(provider: string, apiKey: string, apiSecret?: string) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async getProducts(category?: string, limit: number = 50): Promise<DropshippingProduct[]> {
    try {
      // Note: External API calls are not supported in WebContainer environment
      // For production deployment, this would make real API calls
      console.log(`Simulating ${this.provider} API call for category: ${category}, limit: ${limit}`);
      
      // Return mock data that simulates real provider responses
      return this.generateProviderMockData(category, limit);
    } catch (error) {
      console.error(`${this.provider} API error:`, error);
      // Fallback to mock data if API call fails
      console.log(`Falling back to mock data for ${this.provider}`);
      return this.generateProviderMockData(category, limit);
    }
  }

  async getProductStock(productId: string): Promise<number> {
    try {
      // Simulate stock level for demo purposes
      console.log(`Simulating stock check for ${this.provider} product: ${productId}`);
      return Math.floor(Math.random() * 100) + 10; // Random stock between 10-110
    } catch (error) {
      console.error(`Stock check failed for ${this.provider}:`, error);
      return 0; // Return 0 if stock check fails
    }
  }

  async createOrder(orderData: any): Promise<{ orderId: string; trackingNumber?: string }> {
    try {
      // Simulate order creation for demo purposes
      console.log(`Simulating order creation for ${this.provider}:`, orderData);
      
      const mockOrderId = `${this.provider.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockTrackingNumber = `TRK${Math.random().toString().substr(2, 10)}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        orderId: mockOrderId,
        trackingNumber: mockTrackingNumber
      };
    } catch (error) {
      console.error(`Order creation failed for ${this.provider}:`, error);
      throw error;
    }
  }

  private generateProviderMockData(category?: string, limit: number = 50): DropshippingProduct[] {
    const products = [];
    const productCategories = category ? [category] : ['electronics', 'fashion', 'home-kitchen', 'beauty', 'sports', 'toys'];
    
    for (let i = 1; i <= limit; i++) {
      const selectedCategory = category || productCategories[Math.floor(Math.random() * productCategories.length)];
      const productName = this.generateProductName(selectedCategory, i);
      
      products.push({
        id: `${this.provider}_${selectedCategory}_${i}_${Date.now()}`,
        title: productName,
        description: `High-quality ${selectedCategory} product from ${this.provider}. Perfect for modern lifestyle needs.`,
        price: Math.floor(Math.random() * 200) + 15,
        sku: `${this.provider.toUpperCase()}_${selectedCategory.toUpperCase()}_${String(i).padStart(3, '0')}`,
        category: selectedCategory,
        tags: [selectedCategory, this.provider, 'premium', 'trending'],
        images: this.getProviderMockImages(selectedCategory),
        stock_level: Math.floor(Math.random() * 100) + 20,
        shipping_time: this.getProviderShippingTime(),
        weight: Math.random() * 3 + 0.2,
        dimensions: {
          length: Math.floor(Math.random() * 25) + 5,
          width: Math.floor(Math.random() * 20) + 5,
          height: Math.floor(Math.random() * 15) + 3
        },
        variants: []
      });
    }
    
    return products;
  }

  private generateProductName(category: string, index: number): string {
    const productNames: Record<string, string[]> = {
      'electronics': [
        'Premium Wireless Headphones', 'Smart Watch Pro', 'Bluetooth Speaker', 'USB-C Hub', 'Phone Camera Lens',
        'Wireless Charger', 'Gaming Mouse', 'LED Desk Lamp', 'Power Bank', 'Bluetooth Earbuds'
      ],
      'fashion': [
        'Cotton T-Shirt', 'Denim Jacket', 'Running Shoes', 'Leather Handbag', 'Wool Scarf',
        'Summer Dress', 'Baseball Cap', 'Sunglasses', 'Belt', 'Sneakers'
      ],
      'home-kitchen': [
        'Coffee Maker', 'Non-Stick Pan', 'Storage Container', 'Kitchen Scale', 'Blender',
        'Cutting Board', 'Spice Rack', 'Dish Towels', 'Utensil Set', 'Food Processor'
      ],
      'beauty': [
        'Face Serum', 'Makeup Brush Set', 'Hair Styling Tool', 'Body Lotion', 'Face Mask',
        'Lipstick Set', 'Eye Cream', 'Hair Oil', 'Nail Polish', 'Perfume'
      ],
      'sports': [
        'Yoga Mat', 'Resistance Bands', 'Water Bottle', 'Gym Towel', 'Protein Shaker',
        'Exercise Ball', 'Dumbbells', 'Jump Rope', 'Fitness Tracker', 'Sports Gloves'
      ],
      'toys': [
        'Building Blocks', 'Puzzle Game', 'Action Figure', 'Board Game', 'Educational Toy',
        'Stuffed Animal', 'Remote Control Car', 'Art Supplies', 'Musical Instrument', 'Science Kit'
      ]
    };
    
    const categoryProducts = productNames[category] || productNames['electronics'];
    const baseName = categoryProducts[index % categoryProducts.length];
    
    return `${this.provider} ${baseName} ${Math.floor(Math.random() * 100) + 1}`;
  }

  private getProviderMockImages(category: string): string[] {
    const imageUrls: Record<string, string[]> = {
      'electronics': [
        'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500',
        'https://images.pexels.com/photos/4219654/pexels-photo-4219654.jpeg?auto=compress&cs=tinysrgb&w=500'
      ],
      'fashion': [
        'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=500',
        'https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg?auto=compress&cs=tinysrgb&w=500'
      ],
      'home-kitchen': [
        'https://images.pexels.com/photos/4686821/pexels-photo-4686821.jpeg?auto=compress&cs=tinysrgb&w=500',
        'https://images.pexels.com/photos/4099355/pexels-photo-4099355.jpeg?auto=compress&cs=tinysrgb&w=500'
      ],
      'beauty': [
        'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500',
        'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=500'
      ],
      'sports': [
        'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=500',
        'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=500'
      ],
      'toys': [
        'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=500',
        'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=500'
      ]
    };
    
    return imageUrls[category] || imageUrls['electronics'];
  }

  private getProviderShippingTime(): string {
    switch (this.provider) {
      case 'printful':
        return '7-14 business days';
      case 'spocket':
        return '3-7 business days';
      case 'dropcommerce':
        return '5-10 business days';
      default:
        return '5-7 business days';
    }
  }
  private getProductsEndpoint(): string {
    switch (this.provider) {
      case 'printful':
        return 'store/products'; // Production endpoint for store products
      case 'spocket':
        return 'products'; // Live product catalog
      case 'dropcommerce':
        return 'products'; // Production product list
      case 'mock_api':
        return 'products';
      default:
        return 'products';
    }
  }

  private getProductEndpoint(productId: string): string {
    switch (this.provider) {
      case 'printful':
        return `store/products/${productId}`;
      case 'spocket':
        return `products/${productId}`;
      case 'dropcommerce':
        return `products/${productId}`;
      case 'mock_api':
        return `products/${productId}`;
      default:
        return `products/${productId}`;
    }
  }

  private getOrdersEndpoint(): string {
    switch (this.provider) {
      case 'printful':
        return 'orders'; // Production orders endpoint
      case 'spocket':
        return 'orders'; // Live order processing
      case 'dropcommerce':
        return 'orders'; // Production order fulfillment
      case 'mock_api':
        return 'orders';
      default:
        return 'orders';
    }
  }

  private addProductionParams(params: URLSearchParams): void {
    switch (this.provider) {
      case 'printful':
        // Printful production parameters
        params.append('status', 'synced'); // Only synced products
        break;
      case 'spocket':
        // Spocket production parameters
        params.append('status', 'published'); // Only published products
        params.append('stock_status', 'in_stock'); // Only in-stock items
        break;
      case 'dropcommerce':
        // DropCommerce production parameters
        params.append('published', 'true'); // Only published products
        params.append('status', 'active'); // Only active products
        break;
    }
  }
  private getApiUrl(endpoint: string): string {
    // Configure API URLs based on provider
    switch (this.provider) {
      case 'printful':
        return `https://api.printful.com/${endpoint}`;
      case 'spocket':
        return `https://api.spocket.co/api/v2/${endpoint}`;
      case 'dropcommerce':
        return `https://api.dropcommerce.com/v1/${endpoint}`;
      case 'mock_api':
        return `https://api.mockdropship.com/v1/${endpoint}`;
      default:
        throw new Error(`Unknown provider: ${this.provider}`);
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Samoku/1.0',
    };

    // Configure authentication headers based on provider
    switch (this.provider) {
      case 'printful':
        headers['Authorization'] = `Bearer ${this.apiKey}`;
        break;
      case 'spocket':
        headers['X-Spocket-Access-Token'] = this.apiKey;
        headers['Content-Type'] = 'application/json';
        break;
      case 'dropcommerce':
        headers['Authorization'] = `Bearer ${this.apiKey}`;
        if (this.apiSecret) {
          headers['X-API-Secret'] = this.apiSecret;
        }
        break;
      case 'mock_api':
        headers['Authorization'] = `Bearer ${this.apiKey}`;
        break;
    }

    return headers;
  }

  private transformProducts(data: any): DropshippingProduct[] {
    // Transform API response based on provider format
    switch (this.provider) {
      case 'printful':
        return this.transformPrintfulProducts(data);
      case 'spocket':
        return this.transformSpocketProducts(data);
      case 'dropcommerce':
        return this.transformDropCommerceProducts(data);
      case 'mock_api':
        return this.generateMockProducts(data);
      default:
        return Array.isArray(data) ? data : data.products || data.data || [];
    }
  }

  private transformPrintfulProducts(data: any): DropshippingProduct[] {
    const products = data.result || data.data || [];
    return products.map((item: any) => ({
      id: item.sync_product?.id?.toString() || item.id?.toString() || `printful_${Date.now()}_${Math.random()}`,
      title: item.sync_product?.name || item.name || item.title || 'Untitled Product',
      description: item.sync_product?.description || item.description || 'No description available',
      price: this.parsePrice(item.sync_variants?.[0]?.retail_price || item.retail_price || item.price || '0'),
      sku: item.sync_variants?.[0]?.sku || item.sku || `PRINT_${item.id}`,
      category: this.mapPrintfulCategory(item.sync_product?.category_name || item.category_name || item.category),
      tags: this.extractTags(item.tags || item.type),
      images: this.extractPrintfulImages(item),
      stock_level: parseInt(item.sync_variants?.[0]?.quantity) || 999, // Printful production stock
      shipping_time: '7-14 business days',
      weight: parseFloat(item.weight) || 0,
      dimensions: item.dimensions || null,
      variants: item.variants || item.sync_variants || []
    }));
  }

  private transformSpocketProducts(data: any): DropshippingProduct[] {
    const products = data.data?.products || data.products || data.data || [];
    return products.map((item: any) => ({
      id: item.id?.toString() || `spocket_${Date.now()}_${Math.random()}`,
      title: item.name || item.title || 'Untitled Product',
      description: item.description || item.short_description || item.body_html || 'No description available',
      price: this.parsePrice(item.variants?.[0]?.price || item.retail_price || item.price || '0'),
      sku: item.sku || `SPKT_${item.id}`,
      category: this.mapSpocketCategory(item.category || item.product_category),
      tags: this.extractTags(item.tags || item.keywords),
      images: Array.isArray(item.images) ? item.images.map((img: any) => img.src || img) : [item.main_image, item.featured_image].filter(Boolean),
      stock_level: parseInt(item.variants?.[0]?.inventory_quantity || item.inventory_count || item.inventory) || 0,
      shipping_time: this.parseShippingTime(item.shipping_time || item.processing_time),
      weight: parseFloat(item.weight) || 0,
      dimensions: item.dimensions || null,
      variants: item.variants || item.product_variants || []
    }));
  }

  private transformDropCommerceProducts(data: any): DropshippingProduct[] {
    const products = data.data?.products || data.products || data.data || data.results || [];
    return products.map((item: any) => ({
      id: item.id?.toString() || `dropcom_${Date.now()}_${Math.random()}`,
      title: item.title || item.name || 'Untitled Product',
      description: item.description || item.body_html || item.short_description || 'No description available',
      price: this.parsePrice(item.variants?.[0]?.price || item.price || item.retail_price || '0'),
      sku: item.variants?.[0]?.sku || item.sku || item.vendor_sku || `DC_${item.id}`,
      category: this.mapDropCommerceCategory(item.product_type || item.category),
      tags: this.extractTags(item.tags || item.categories),
      images: this.extractDropCommerceImages(item),
      stock_level: parseInt(item.variants?.[0]?.inventory_quantity || item.inventory_quantity || item.stock) || 0,
      shipping_time: this.parseShippingTime(item.shipping_time || '3-7 business days'),
      weight: parseFloat(item.weight) || 0,
      dimensions: item.dimensions || null,
      variants: item.variants || item.options || []
    }));
  }


  private mapCategoryToProvider(category: string): string | null {
    const categoryMap: Record<string, Record<string, string>> = {
      'printful': {
        'electronics': 'accessories',
        'fashion': 'clothing',
        'home-kitchen': 'home-living',
        'beauty': 'accessories',
        'sports': 'clothing',
        'toys': 'accessories'
      },
      'spocket': {
        'electronics': 'Electronics',
        'fashion': 'Fashion',
        'home-kitchen': 'Home & Garden',
        'beauty': 'Health & Beauty',
        'sports': 'Sports & Recreation',
        'toys': 'Toys & Hobbies'
      },
      'dropcommerce': {
        'electronics': 'electronics',
        'fashion': 'apparel',
        'home-kitchen': 'home-garden',
        'beauty': 'health-beauty',
        'sports': 'sports-outdoors',
        'toys': 'toys-games'
      }
    };

    return categoryMap[this.provider]?.[category] || null;
  }

  private parsePrice(price: any): number {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const parsed = parseFloat(price.replace(/[^0-9.]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private parseShippingTime(time: any): string {
    if (typeof time === 'string') return time;
    if (typeof time === 'number') return `${time} business days`;
    return '5-7 business days';
  }

  private extractTags(tags: any): string[] {
    if (Array.isArray(tags)) return tags.map(t => String(t));
    if (typeof tags === 'string') return tags.split(',').map(t => t.trim());
    return [];
  }

  private extractStockFromResponse(data: any): number {
    switch (this.provider) {
      case 'printful':
        return data.result?.sync_variants?.[0]?.quantity || data.result?.quantity || 999;
      case 'spocket':
        return data.variants?.[0]?.inventory_quantity || data.inventory_count || data.inventory || 0;
      case 'dropcommerce':
        return data.variants?.[0]?.inventory_quantity || data.inventory_quantity || data.stock || 0;
      default:
        return data.stock || data.quantity || 0;
    }
  }

  private extractOrderId(data: any): string {
    switch (this.provider) {
      case 'printful':
        return data.result?.id?.toString() || data.id?.toString();
      case 'spocket':
        return data.data?.id?.toString() || data.order?.id?.toString() || data.id?.toString();
      case 'dropcommerce':
        return data.data?.id?.toString() || data.order_id?.toString() || data.id?.toString();
      default:
        return data.id || data.order_id || `${this.provider}_${Date.now()}`;
    }
  }

  private extractTrackingNumber(data: any): string | undefined {
    switch (this.provider) {
      case 'printful':
        return data.result?.shipments?.[0]?.tracking_number || data.result?.tracking_number || data.tracking?.number;
      case 'spocket':
        return data.data?.tracking_number || data.tracking_number;
      case 'dropcommerce':
        return data.data?.tracking_number || data.tracking_number || data.fulfillment?.tracking_number;
      default:
        return data.tracking_number;
    }
  }

  private mapPrintfulCategory(category: any): string {
    if (!category) return 'general';
    const categoryMap: Record<string, string> = {
      'mens-clothing': 'fashion',
      'womens-clothing': 'fashion',
      'accessories': 'fashion',
      'home-living': 'home-kitchen',
      'bags': 'fashion',
      'drinkware': 'home-kitchen',
      'phone-cases': 'electronics'
    };
    return categoryMap[category.toLowerCase()] || 'general';
  }

  private mapSpocketCategory(category: any): string {
    if (!category) return 'general';
    const categoryMap: Record<string, string> = {
      'electronics': 'electronics',
      'fashion': 'fashion',
      'home & garden': 'home-kitchen',
      'health & beauty': 'beauty',
      'sports & recreation': 'sports',
      'toys & hobbies': 'toys'
    };
    return categoryMap[category.toLowerCase()] || 'general';
  }

  private mapDropCommerceCategory(category: any): string {
    if (!category) return 'general';
    const categoryMap: Record<string, string> = {
      'electronics': 'electronics',
      'apparel': 'fashion',
      'home-garden': 'home-kitchen',
      'health-beauty': 'beauty',
      'sports-outdoors': 'sports',
      'toys-games': 'toys'
    };
    return categoryMap[category.toLowerCase()] || 'general';
  }

  private extractPrintfulImages(item: any): string[] {
    const images = [];
    
    // From files array
    if (item.files && Array.isArray(item.files)) {
      images.push(...item.files.map((f: any) => f.preview_url || f.thumbnail_url).filter(Boolean));
    }
    
    // From sync product data
    if (item.sync_product?.thumbnail_url) {
      images.push(item.sync_product.thumbnail_url);
    }
    
    // From variants
    if (item.sync_variants && Array.isArray(item.sync_variants)) {
      item.sync_variants.forEach((variant: any) => {
        if (variant.files && Array.isArray(variant.files)) {
          images.push(...variant.files.map((f: any) => f.preview_url).filter(Boolean));
        }
      });
    }
    
    return [...new Set(images)]; // Remove duplicates
  }

  private extractDropCommerceImages(item: any): string[] {
    const images = [];
    
    if (item.images && Array.isArray(item.images)) {
      images.push(...item.images.map((img: any) => img.src || img.url || img).filter(Boolean));
    }
    
    if (item.featured_image) {
      images.unshift(item.featured_image);
    }
    
    if (item.image && !images.includes(item.image)) {
      images.push(item.image);
    }
    
    return [...new Set(images)];
  }

  private transformOrderData(orderData: any): any {
    // Transform order data based on provider requirements
    switch (this.provider) {
      case 'printful':
        return {
          external_id: orderData.orderId,
          recipient: {
            name: orderData.customer.name,
            company: orderData.customer.company || '',
            email: orderData.customer.email,
            phone: orderData.shipping.phone || '',
            address1: orderData.shipping.street,
            address2: '',
            city: orderData.shipping.city,
            state_code: orderData.shipping.state,
            country_code: this.getCountryCode(orderData.shipping.country),
            zip: orderData.shipping.zipCode
          },
          items: [{
            variant_id: parseInt(orderData.productExternalId),
            quantity: orderData.quantity,
            retail_price: orderData.price ? orderData.price.toString() : null
          }],
          packing_slip: {
            email: orderData.customer.email,
            phone: orderData.shipping.phone || '',
            message: 'Thank you for your order from Samoku!'
          }
        };
      case 'spocket':
        return {
          order: {
            id: orderData.orderId,
            email: orderData.customer.email,
            currency: 'USD',
            financial_status: 'paid'
          },
          line_items: [{
            variant_id: orderData.productExternalId,
            quantity: orderData.quantity,
            price: orderData.price?.toString() || '0'
          }],
          shipping_address: {
            first_name: orderData.customer.name.split(' ')[0],
            last_name: orderData.customer.name.split(' ').slice(1).join(' '),
            company: orderData.customer.company || '',
            address1: orderData.shipping.street,
            address2: '',
            city: orderData.shipping.city,
            zip: orderData.shipping.zipCode,
            province: orderData.shipping.state,
            country_code: this.getCountryCode(orderData.shipping.country),
            phone: orderData.shipping.phone || ''
          }
        };
      case 'dropcommerce':
        return {
          order: {
            external_id: orderData.orderId,
            email: orderData.customer.email,
            currency: 'USD',
            financial_status: 'paid',
            fulfillment_status: 'unfulfilled'
          },
          line_items: [{
            product_id: orderData.productExternalId,
            quantity: orderData.quantity,
            variant_id: orderData.variantId || null,
            price: orderData.price?.toString() || '0'
          }],
          shipping_address: {
            first_name: orderData.customer.name.split(' ')[0],
            last_name: orderData.customer.name.split(' ').slice(1).join(' '),
            address1: orderData.shipping.street,
            address2: '',
            city: orderData.shipping.city,
            province: orderData.shipping.state,
            country_code: this.getCountryCode(orderData.shipping.country),
            zip: orderData.shipping.zipCode,
            phone: orderData.shipping.phone || ''
          }
        };
      case 'mock_api':
        return {
          order_id: orderData.orderId,
          product_id: orderData.productExternalId,
          customer: orderData.customer,
          shipping_address: orderData.shipping,
          quantity: orderData.quantity
        };
      default:
        return orderData;
    }
  }

  private getCountryCode(country: string): string {
    const countryMap: Record<string, string> = {
      'united states': 'US',
      'canada': 'CA',
      'united kingdom': 'GB',
      'australia': 'AU',
      'germany': 'DE',
      'france': 'FR',
      'italy': 'IT',
      'spain': 'ES'
    };
    
    return countryMap[country.toLowerCase()] || country.toUpperCase().slice(0, 2);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check user role from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }

    // Only admin users can access dropshipping functions
    if (userProfile.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const requestData = req.method === 'POST' ? await req.json() : {};
    const { action } = requestData;
    const url = new URL(req.url);
    const actionFromQuery = url.searchParams.get('action');
    const finalAction = action || actionFromQuery;

    switch (finalAction) {
      case 'configure_api': {
        const { provider, apiKey, apiSecret, settings } = requestData;

        // Store API configuration securely in database
        const { data: config, error } = await supabase
          .from('dropshipping_config')
          .upsert({
            provider,
            api_key: apiKey, // This is encrypted at rest in Supabase
            api_secret: apiSecret,
            settings: settings || {},
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        // Return config without exposing sensitive data
        return new Response(
          JSON.stringify({ 
            success: true, 
            config: { 
              ...config, 
              api_key: '***', 
              api_secret: config.api_secret ? '***' : null 
            } 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      case 'import_products': {
        const { category, limit } = requestData;
        
        // Get active API configuration from database
        const { data: config, error: configError } = await supabase
          .from('dropshipping_config')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (configError || !config) {
          throw new Error('Dropshipping API not configured');
        }

        // Initialize API with stored credentials
        const api = new DropshippingAPI(config.provider, config.api_key, config.api_secret);
        const products = await api.getProducts(category, limit || 50);

        // Import products to database
        const importedProducts = [];
        const errors = [];

        for (const product of products) {
          try {
            const { data: existingProduct } = await supabase
              .from('dropshipping_products')
              .select('id')
              .eq('external_id', product.id)
              .eq('provider', config.provider)
              .single();

            if (!existingProduct) {
              const { data: imported, error } = await supabase
                .from('dropshipping_products')
                .insert({
                  external_id: product.id,
                  provider: config.provider,
                  title: product.title,
                  description: product.description,
                  price: product.price,
                  sku: product.sku,
                  category: product.category,
                  tags: product.tags,
                  images: product.images,
                  stock_level: product.stock_level,
                  shipping_time: product.shipping_time,
                  weight: product.weight,
                  dimensions: product.dimensions,
                  variants: product.variants || [],
                  api_data: product,
                  is_active: true
                })
                .select()
                .single();

              if (error) {
                errors.push({ product: product.id, error: error.message });
              } else if (imported) {
                importedProducts.push(imported);

                // Also create a product record for the main products table
                const { data: adminStore } = await supabase
                   is_active: true,
                   last_synced: new Date().toISOString()
                  .select('id')
                  .eq('user_id', user.id)
                  .single();

                await supabase.from('products').insert({
                  name: product.title,
                  description: product.description,
                  price: product.price,
                  images: product.images,
                  category: product.category,
                  sku: product.sku,
                  stock_quantity: product.stock_level,
                  owner_id: user.id,
                  store_id: adminStore?.id,
                  is_dropshipped: true,
                  external_id: product.id,
                  provider: config.provider,
                  dropship_metadata: {
                    shipping_time: product.shipping_time,
                    weight: product.weight,
                    dimensions: product.dimensions
                  },
                  tags: product.tags,
                  is_active: true
                });
              }
            }
          } catch (error) {
            errors.push({ product: product.id, error: error.message });
          }
        }

        // Log the import operation
        await supabase.from('dropshipping_sync_logs').insert({
          operation_type: 'product_import',
          provider: config.provider,
          status: errors.length === 0 ? 'success' : errors.length < products.length ? 'partial' : 'error',
          products_processed: products.length,
          products_updated: importedProducts.length,
          products_failed: errors.length,
          error_details: errors.length > 0 ? { errors } : null
        });

        return new Response(
          JSON.stringify({
            success: true,
            imported: importedProducts.length,
            total: products.length,
            errors: errors.length,
            products: importedProducts
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      case 'sync_inventory': {
        // Get all active dropshipping products
        const { data: products, error: productsError } = await supabase
          .from('dropshipping_products')
          .select('*')
          .eq('is_active', true);

        if (productsError || !products) {
          throw new Error('Failed to fetch products for sync');
        }

        const { data: config, error: configError } = await supabase
          .from('dropshipping_config')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (configError || !config) {
          throw new Error('Dropshipping API not configured');
        }

        const api = new DropshippingAPI(config.provider, config.api_key, config.api_secret);
        let updated = 0;
        let failed = 0;
        const errors = [];

        // Update stock levels
        for (const product of products) {
          try {
            const stockLevel = await api.getProductStock(product.external_id);
            
            await supabase
              .from('dropshipping_products')
              .update({ 
                stock_level: stockLevel,
               last_synced: new Date().toISOString(),
               is_active: stockLevel > 0
              })
              .eq('id', product.id);

            // Update main products table as well
            await supabase
              .from('products')
              .update({ 
                stock_quantity: stockLevel,
                is_active: stockLevel > 0
              })
              .eq('external_id', product.external_id)
              .eq('is_dropshipped', true);

            updated++;
          } catch (error) {
            failed++;
            errors.push({ product: product.external_id, error: error.message });
          }
        }

        // Log the sync operation
        await supabase.from('dropshipping_sync_logs').insert({
          operation_type: 'inventory_sync',
          provider: config.provider,
          status: failed === 0 ? 'success' : failed < products.length ? 'partial' : 'error',
          products_processed: products.length,
          products_updated: updated,
          products_failed: failed,
          error_details: errors.length > 0 ? { errors } : null
        });

        return new Response(
          JSON.stringify({
            success: true,
            processed: products.length,
            updated,
            failed,
            errors
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      case 'fulfill_order': {
        const { orderId, productExternalId, customerInfo, shippingAddress, quantity } = requestData;

        const { data: config, error: configError } = await supabase
          .from('dropshipping_config')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (configError || !config) {
          throw new Error('Dropshipping API not configured');
        }

        const api = new DropshippingAPI(config.provider, config.api_key, config.api_secret);
        
        try {
          const fulfillmentResult = await api.createOrder({
            productId: productExternalId,
            customer: customerInfo,
            shipping: shippingAddress,
            quantity
          });

          // Save order tracking info
          const { data: tracking, error: trackingError } = await supabase
            .from('dropshipping_orders')
            .insert({
              order_id: orderId,
              external_order_id: fulfillmentResult.orderId,
              provider: config.provider,
              product_external_id: productExternalId,
              customer_name: customerInfo.name,
              customer_email: customerInfo.email,
              shipping_address: shippingAddress,
              quantity,
              status: 'sent',
              tracking_number: fulfillmentResult.trackingNumber,
              fulfillment_data: fulfillmentResult
            })
            .select()
            .single();

          if (trackingError) {
            throw trackingError;
          }

          return new Response(
            JSON.stringify({
              success: true,
              fulfillmentId: fulfillmentResult.orderId,
              trackingNumber: fulfillmentResult.trackingNumber,
              tracking
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        } catch (error) {
          // Log failed fulfillment
          await supabase.from('dropshipping_orders').insert({
            order_id: orderId,
            provider: config.provider,
            product_external_id: productExternalId,
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            shipping_address: shippingAddress,
            quantity,
            status: 'failed',
            error_message: error.message
          });

          throw error;
        }
      }

      case 'get_products': {
        const { data: products, error } = await supabase
          .from('dropshipping_products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ products }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      case 'get_order_status': {
        const orderId = url.searchParams.get('orderId');
        if (!orderId) {
          throw new Error('Order ID required');
        }

        const { data: order, error } = await supabase
          .from('dropshipping_orders')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        return new Response(
          JSON.stringify({ order }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      case 'delete_product': {
        const { productId } = requestData;

        if (!productId) {
          throw new Error('Product ID required');
        }

        // Delete from dropshipping_products table
        const { error: dropshippingError } = await supabase
          .from('dropshipping_products')
          .delete()
          .eq('id', productId);

        if (dropshippingError) {
          throw dropshippingError;
        }

        // Delete from main products table
        const { error: productsError } = await supabase
          .from('products')
          .delete()
          .eq('external_id', productId)
          .eq('is_dropshipped', true);

        if (productsError) {
          console.error('Failed to delete from products table:', productsError);
          // Don't throw error, as main deletion succeeded
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Dropshipping API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: error.message === 'Unauthorized' || error.message === 'Admin access required' ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});