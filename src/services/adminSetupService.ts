import { supabase } from '../lib/supabase';

class AdminSetupService {
  async createAdminAuth(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('AdminSetupService: createAdminAuth started');

      // Try to create auth user via edge function
      console.log('AdminSetupService: Calling edge function to create auth user');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          email: 'admin@samoku.com',
          password: 'Admin123!'
        })
      });

      console.log('AdminSetupService: Edge function response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AdminSetupService: Edge function error response:', errorText);
        
        // Try to parse the error response
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.includes('already registered') || errorData.error?.includes('already exists')) {
            console.log('AdminSetupService: Admin user already exists, treating as success');
            return { success: true };
          }
          throw new Error(`Admin setup failed: ${errorText}`);
        } catch (parseError) {
          throw new Error(`Admin setup failed: ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('AdminSetupService: Edge function result:', result);

      if (!result.success) {
        // If user already exists in auth, that's ok
        if (result.error?.includes('already registered') || result.error?.includes('already exists')) {
          console.log('AdminSetupService: Admin auth user already exists, proceeding...');
          return { success: true };
        }
        throw new Error(result.error || 'Failed to create admin auth user');
      }

      console.log('AdminSetupService: Admin auth user created successfully');
      return { success: true };
    } catch (error) {
      console.error('AdminSetupService: Admin setup failed:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async setupAdmin(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('AdminSetupService: setupAdmin started - simplified flow');
      
      // Create auth user
      const authResult = await this.createAdminAuth();
      if (!authResult.success) {
        return authResult;
      }

      console.log('AdminSetupService: Admin setup completed successfully');
      return { success: true };
    } catch (error) {
      console.error('Admin setup error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

export const adminSetupService = new AdminSetupService();