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
    // This would be replaced with actual API calls to providers like:
    // - Printful API
    // - Spocket API
    // - DropCommerce API
    // - Modalyst API
    // etc.

    const apiUrl = this.getApiUrl('products');
    const headers = this.getHeaders();

    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());

    const response = await fetch(`${apiUrl}?${params}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the response based on the provider's format
    return this.transformProducts(data);
  }

  async getProductStock(productId: string): Promise<number> {
    const apiUrl = this.getApiUrl(`products/${productId}/stock`);
    const headers = this.getHeaders();

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Stock check failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.stock || 0;
  }

  async createOrder(orderData: any): Promise<{ orderId: string; trackingNumber?: string }> {
    const apiUrl = this.getApiUrl('orders');
    const headers = this.getHeaders();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(this.transformOrderData(orderData))
    });

    if (!response.ok) {
      throw new Error(`Order creation failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      orderId: data.id || data.order_id,
      trackingNumber: data.tracking_number
    };
  }

  private getApiUrl(endpoint: string): string {
    // Configure API URLs based on provider
    switch (this.provider) {
      case 'printful':
        return `https://api.printful.com/${endpoint}`;
      case 'spocket':
        return `https://api.spocket.co/api/v1/${endpoint}`;
      case 'dropcommerce':
        return `https://api.dropcommerce.com/v1/${endpoint}`;
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
        headers['Authorization'] = `Bearer ${this.apiKey}`;
        break;
      case 'spocket':
        headers['Authorization'] = `Bearer ${this.apiKey}`;
        break;
      case 'dropcommerce':
        headers['X-API-Key'] = this.apiKey;
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
      default:
        return data.products || data || [];
    }
  }

  private transformPrintfulProducts(data: any): DropshippingProduct[] {
    return (data.result || []).map((item: any) => ({
      id: item.id.toString(),
      title: item.name,
      description: item.description || '',
      price: parseFloat(item.price) || 0,
      sku: item.sku || '',
      category: item.category?.name || 'general',
      tags: item.tags || [],
      images: item.files?.map((f: any) => f.preview_url) || [],
      stock_level: item.quantity || 0,
      shipping_time: '7-14 business days',
      weight: item.weight || 0,
      variants: item.variants || []
    }));
  }

  private transformSpocketProducts(data: any): DropshippingProduct[] {
    return (data.products || []).map((item: any) => ({
      id: item.id.toString(),
      title: item.name,
      description: item.description || '',
      price: parseFloat(item.price) || 0,
      sku: item.sku || '',
      category: item.category || 'general',
      tags: item.tags || [],
      images: item.images || [],
      stock_level: item.inventory || 0,
      shipping_time: item.shipping_time || '5-10 business days',
      weight: item.weight || 0
    }));
  }

  private transformOrderData(orderData: any): any {
    // Transform order data based on provider requirements
    switch (this.provider) {
      case 'printful':
        return {
          recipient: {
            name: orderData.customer.name,
            email: orderData.customer.email,
            address1: orderData.shipping.street,
            city: orderData.shipping.city,
            state_code: orderData.shipping.state,
            country_code: orderData.shipping.country,
            zip: orderData.shipping.zipCode,
            phone: orderData.shipping.phone
          },
          items: [{
            variant_id: orderData.productId,
            quantity: orderData.quantity
          }]
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