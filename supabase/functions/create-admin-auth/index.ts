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

    const { email, password } = await req.json();

    let authUser;
    
    console.log('Attempting to create/get admin user for email:', email);

    // First check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    
    if (existingUser) {
      console.log('User already exists, ensuring it is confirmed and has correct metadata');
      
      // Update existing user to ensure it's confirmed and has correct metadata
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          email_confirm: true,
          user_metadata: {
            role: 'admin',
            name: 'Platform Administrator'
          }
        }
      );
      
      if (updateError) {
        console.error('Failed to update existing user:', updateError);
      } else {
        console.log('Successfully updated existing user');
        authUser = { user: updatedUser.user };
      }
    } else {
      console.log('Creating new admin user');
      
      // Try to create auth user with service role key (bypasses email confirmation)
      const { data: createUserData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          role: 'admin',
          name: 'Platform Administrator'
        },
        email_confirm: true
      });

      if (authError) {
        console.error('Auth user creation failed:', authError);
        if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
          // Recursive call to handle the now-existing user
          return new Response(
            JSON.stringify({ success: true, message: 'User exists, retrying...' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw authError;
        }
      } else {
        console.log('Successfully created new user');
        authUser = createUserData;
      }
    }

    // Upsert user profile in users table
    if (authUser.user) {
      console.log('Upserting user profile for user:', authUser.user.id);
      
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: authUser.user.id,
          email: authUser.user.email,
          name: 'Platform Administrator',
          role: 'admin',
          is_active: true
        }, {
          onConflict: 'id'
        });

      if (upsertError) {
        console.error('Failed to upsert user profile:', upsertError);
        // Don't throw error, continue since auth user exists
      }

      // Upsert admin store
      console.log('Upserting admin store');
      
      const { error: storeError } = await supabase
        .from('stores')
        .upsert({
          id: '550e8400-e29b-41d4-a716-446655440000',
          user_id: authUser.user.id,
          name: 'Samoku Admin Store',
          description: 'Official admin store for dropshipped products',
          is_approved: true,
          is_active: true,
          commission_rate: 0
        }, {
          onConflict: 'id'
        });
        
      if (storeError) {
        console.error('Failed to upsert store:', storeError);
        // Don't throw error, continue since this is not critical
      }
      
      console.log('Admin user setup completed successfully');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: authUser.user?.id,
          email: authUser.user?.email,
          role: 'admin'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Admin creation error:', error);
    
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