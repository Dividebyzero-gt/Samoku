import { createClient } from 'npm:@supabase/supabase-js@2.53.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Webhook-Signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData = await req.json();
    const signature = req.headers.get('X-Webhook-Signature');

    // Verify webhook signature (implement based on your dropshipping provider)
    // if (!verifyWebhookSignature(signature, webhookData)) {
    //   return new Response('Invalid signature', { status: 401 });
    // }

    const { type, data } = webhookData;

    switch (type) {
      case 'order.status_changed': {
        // Update order status in database
        const { external_order_id, status, tracking_number, tracking_url } = data;

        const updateData: any = {
          status: status.toLowerCase(),
          updated_at: new Date().toISOString()
        };

        if (tracking_number) {
          updateData.tracking_number = tracking_number;
        }

        if (tracking_url) {
          updateData.tracking_url = tracking_url;
        }

        const { error } = await supabase
          .from('dropshipping_orders')
          .update(updateData)
          .eq('external_order_id', external_order_id);

        if (error) {
          console.error('Failed to update order status:', error);
          throw error;
        }

        break;
      }

      case 'product.stock_changed': {
        // Update product stock level
        const { product_id, stock_level } = data;

        const { error } = await supabase
          .from('dropshipping_products')
          .update({
            stock_level,
            last_synced: new Date().toISOString()
          })
          .eq('external_id', product_id);

        if (error) {
          console.error('Failed to update product stock:', error);
          throw error;
        }

        break;
      }

      case 'product.updated': {
        // Update product information
        const { product_id, title, description, price, images } = data;

        const updateData: any = {
          last_synced: new Date().toISOString()
        };

        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (price) updateData.price = price;
        if (images) updateData.images = images;

        const { error } = await supabase
          .from('dropshipping_products')
          .update(updateData)
          .eq('external_id', product_id);

        if (error) {
          console.error('Failed to update product:', error);
          throw error;
        }

        break;
      }

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    // Log webhook receipt
    await supabase.from('dropshipping_sync_logs').insert({
      operation_type: 'webhook_received',
      provider: 'mock_api',
      status: 'success',
      products_processed: 1,
      products_updated: 1,
      products_failed: 0
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);

    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});