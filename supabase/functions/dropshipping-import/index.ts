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
      const apiUrl = this.getApiUrl('products');
      const headers = this.getHeaders();

      const params = new URLSearchParams();
      if (category) {
        // Map our categories to provider-specific categories
        const providerCategory = this.mapCategoryToProvider(category);
        if (providerCategory) params.append('category', providerCategory);
      }
      params.append('limit', limit.toString());

      const response = await fetch(`${apiUrl}?${params}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Transform the response based on the provider's format
      return this.transformProducts(data);
    } catch (error) {
      console.error(`${this.provider} API error:`, error);
      throw new Error(`Failed to fetch products from ${this.provider}: ${error.message}`);
    }
  }

  async getProductStock(productId: string): Promise<number> {
    try {
      const apiUrl = this.getApiUrl(`products/${productId}`);
      const headers = this.getHeaders();

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Stock check failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.extractStockFromResponse(data);
    } catch (error) {
      console.error(`Stock check failed for ${this.provider}:`, error);
      return 0; // Return 0 if stock check fails
    }
  }

  async createOrder(orderData: any): Promise<{ orderId: string; trackingNumber?: string }> {
    try {
      const apiUrl = this.getApiUrl('orders');
      const headers = this.getHeaders();
      const transformedData = this.transformOrderData(orderData);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(transformedData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Order creation failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      return {
        orderId: this.extractOrderId(data),
        trackingNumber: this.extractTrackingNumber(data)
      };
    } catch (error) {
      console.error(`Order creation failed for ${this.provider}:`, error);
      throw error;
    }
  }

  private getApiUrl(endpoint: string): string {
    // Configure API URLs based on provider
    switch (this.provider) {
      case 'printful':
        return `https://api.printful.com/store/${endpoint}`;
      case 'spocket':
        return `https://api.spocket.co/v2/${endpoint}`;
      case 'dropcommerce':
        return `https://api.dropcommerce.com/api/v2/${endpoint}`;
      case 'mock_api':
        return `https://api.mockdropship.com/v1/${endpoint}`;
      default:
        throw new Error(`Unknown provider: ${this.provider}`);
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Configure authentication headers based on provider
    switch (this.provider) {
      case 'printful':
        headers['Authorization'] = `Basic ${btoa(this.apiKey)}`;
        break;
      case 'spocket':
        headers['X-Spocket-Access-Token'] = this.apiKey;
        break;
      case 'dropcommerce':
        headers['X-API-Key'] = this.apiKey;
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
    const products = data.result || data.products || [];
    return products.map((item: any) => ({
      id: item.id?.toString() || `printful_${Date.now()}_${Math.random()}`,
      title: item.name || item.title || 'Untitled Product',
      description: item.description || 'No description available',
      price: this.parsePrice(item.retail_price || item.price || '0'),
      sku: item.sku || `PRINT_${item.id}`,
      category: this.mapPrintfulCategory(item.category_name || item.category),
      tags: this.extractTags(item.tags || item.type),
      images: this.extractPrintfulImages(item),
      stock_level: parseInt(item.quantity) || 999, // Printful typically has unlimited stock
      shipping_time: '7-14 business days',
      weight: parseFloat(item.weight) || 0,
      dimensions: item.dimensions || null,
      variants: item.variants || item.sync_variants || []
    }));
  }

  private transformSpocketProducts(data: any): DropshippingProduct[] {
    const products = data.products || data.data || [];
    return products.map((item: any) => ({
      id: item.id?.toString() || `spocket_${Date.now()}_${Math.random()}`,
      title: item.name || item.title || 'Untitled Product',
      description: item.description || item.short_description || 'No description available',
      price: this.parsePrice(item.retail_price || item.price || '0'),
      sku: item.sku || `SPKT_${item.id}`,
      category: this.mapSpocketCategory(item.category || item.product_category),
      tags: this.extractTags(item.tags || item.keywords),
      images: Array.isArray(item.images) ? item.images : [item.main_image].filter(Boolean),
      stock_level: parseInt(item.inventory_count || item.inventory) || 0,
      shipping_time: this.parseShippingTime(item.shipping_time || item.processing_time),
      weight: parseFloat(item.weight) || 0,
      dimensions: item.dimensions || null,
      variants: item.variants || item.product_variants || []
    }));
  }

  private transformDropCommerceProducts(data: any): DropshippingProduct[] {
    const products = data.products || data.data || data.results || [];
    return products.map((item: any) => ({
      id: item.id?.toString() || `dropcom_${Date.now()}_${Math.random()}`,
      title: item.title || item.name || 'Untitled Product',
      description: item.description || item.body_html || 'No description available',
      price: this.parsePrice(item.price || item.retail_price || '0'),
      sku: item.sku || item.vendor_sku || `DC_${item.id}`,
      category: this.mapDropCommerceCategory(item.product_type || item.category),
      tags: this.extractTags(item.tags || item.categories),
      images: this.extractDropCommerceImages(item),
      stock_level: parseInt(item.inventory_quantity || item.stock) || 0,
      shipping_time: this.parseShippingTime(item.shipping_time || '3-7 business days'),
      weight: parseFloat(item.weight) || 0,
      dimensions: item.dimensions || null,
      variants: item.variants || item.options || []
    }));
  }

  private generateMockProducts(data: any): DropshippingProduct[] {
    // Generate mock products for testing when using mock_api
    const mockCategories = ['electronics', 'fashion', 'home-kitchen', 'beauty', 'sports', 'toys'];
    const limit = data.limit || 20;
    const category = data.category || null;
    
    const products = [];
    for (let i = 1; i <= limit; i++) {
      const productCategory = category || mockCategories[Math.floor(Math.random() * mockCategories.length)];
      products.push({
        id: `mock_${i}_${Date.now()}`,
        title: `Mock ${productCategory} Product ${i}`,
        description: `High quality ${productCategory} product for testing purposes`,
        price: Math.floor(Math.random() * 200) + 10,
        sku: `MOCK_${i}_${productCategory.toUpperCase()}`,
        category: productCategory,
        tags: [productCategory, 'mock', 'testing'],
        images: [
          `https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=500`,
          `https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=500`
        ],
        stock_level: Math.floor(Math.random() * 100) + 10,
        shipping_time: '3-5 business days',
        weight: Math.random() * 2 + 0.1,
        dimensions: {
          length: Math.floor(Math.random() * 20) + 5,
          width: Math.floor(Math.random() * 15) + 5,
          height: Math.floor(Math.random() * 10) + 2
        },
        variants: []
      });
    }
    return products;
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
        return data.result?.quantity || 999; // Printful usually has unlimited stock
      case 'spocket':
        return data.inventory_count || data.inventory || 0;
      case 'dropcommerce':
        return data.inventory_quantity || data.stock || 0;
      default:
        return data.stock || data.quantity || 0;
    }
  }

  private extractOrderId(data: any): string {
    switch (this.provider) {
      case 'printful':
        return data.result?.id || data.id;
      case 'spocket':
        return data.order?.id || data.id;
      case 'dropcommerce':
        return data.order_id || data.id;
      default:
        return data.id || data.order_id || `${this.provider}_${Date.now()}`;
    }
  }

  private extractTrackingNumber(data: any): string | undefined {
    switch (this.provider) {
      case 'printful':
        return data.result?.tracking_number || data.tracking?.number;
      case 'spocket':
        return data.tracking_number;
      case 'dropcommerce':
        return data.tracking_number || data.fulfillment?.tracking_number;
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
          recipient: {
            name: orderData.customer.name,
            company: '',
            email: orderData.customer.email,
            phone: orderData.shipping.phone || '',
            address1: orderData.shipping.street,
            address2: '',
            city: orderData.shipping.city,
            state_code: orderData.shipping.state,
            country_code: orderData.shipping.country,
            zip: orderData.shipping.zipCode
          },
          items: [{
            sync_variant_id: parseInt(orderData.productExternalId),
            quantity: orderData.quantity,
            retail_price: orderData.price || null
          }],
          retail_costs: {
            currency: 'USD',
            subtotal: orderData.subtotal || null,
            discount: orderData.discount || null,
            shipping: orderData.shipping_cost || null,
            tax: orderData.tax || null
          }
        };
      case 'spocket':
        return {
          line_items: [{
            spocket_product_id: orderData.productExternalId,
            quantity: orderData.quantity,
            product_variant_id: orderData.variantId || null
          }],
          shipping_address: {
            first_name: orderData.customer.name.split(' ')[0],
            last_name: orderData.customer.name.split(' ').slice(1).join(' '),
            company: '',
            address1: orderData.shipping.street,
            address2: '',
            city: orderData.shipping.city,
            zip: orderData.shipping.zipCode,
            province: orderData.shipping.state,
            country: orderData.shipping.country,
            phone: orderData.shipping.phone || ''
          },
          email: orderData.customer.email,
          order_id: orderData.orderId
        };
      case 'dropcommerce':
        return {
          external_order_id: orderData.orderId,
          line_items: [{
            product_id: orderData.productExternalId,
            quantity: orderData.quantity,
            variant_id: orderData.variantId || null
          }],
          shipping_address: {
            first_name: orderData.customer.name.split(' ')[0],
            last_name: orderData.customer.name.split(' ').slice(1).join(' '),
            address1: orderData.shipping.street,
            address2: '',
            city: orderData.shipping.city,
            province: orderData.shipping.state,
            country: orderData.shipping.country,
            zip: orderData.shipping.zipCode,
            phone: orderData.shipping.phone || ''
          },
          customer: {
            email: orderData.customer.email,
            first_name: orderData.customer.name.split(' ')[0],
            last_name: orderData.customer.name.split(' ').slice(1).join(' ')
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
                await supabase.from('products').insert({
                  name: product.title,
                  description: product.description,
                  price: product.price,
                  images: product.images,
                  category: product.category,
                  sku: product.sku,
                  stock_quantity: product.stock_level,
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
                last_synced: new Date().toISOString() 
              })
              .eq('id', product.id);

            // Update main products table as well
            await supabase
              .from('products')
              .update({ 
                stock_quantity: stockLevel 
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