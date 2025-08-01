import { createClient } from 'npm:@supabase/supabase-js@2.53.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

    const { userId, email, name, role, storeName, storeDescription } = await req.json();

    console.log('Creating user profile for:', email);

    // Create user profile using service role to bypass RLS
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: email,
        name: name,
        role: role,
        is_active: true
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Failed to create user profile:', profileError);
      throw profileError;
    }

    console.log('User profile created successfully');

    // Create store if vendor
    if (role === 'vendor' && storeName) {
      console.log('Creating vendor store:', storeName);
      
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert({
          user_id: userId,
          name: storeName,
          description: storeDescription || '',
          is_approved: false,
          is_active: true,
        })
        .select()
        .single();

      if (storeError) {
        console.error('Failed to create store:', storeError);
        // Don't fail completely if store creation fails
      } else {
        console.log('Store created successfully');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userProfile
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('User profile creation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});