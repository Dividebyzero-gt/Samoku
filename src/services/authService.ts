import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: 'vendor' | 'customer';
  storeName?: string;
  storeDescription?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  async signUp(userData: SignUpData): Promise<{ user: User | null; error: string | null }> {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured || !supabase) {
        return { 
          user: null, 
          error: 'Supabase not configured. Please click "Connect to Supabase" in the top right corner.' 
        };
      }

      console.log('AuthService: signUp called for email:', userData.email);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            name: userData.name,
            role: userData.role,
          }
        }
      });

      console.log('AuthService: signUp auth result:', { 
        user: !!authData.user, 
        session: !!authData.session,
        error: authError?.message 
      });

      if (authError) {
        console.log('AuthService: signUp auth error:', authError.message);
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        console.log('AuthService: No user returned from signUp');
        return { user: null, error: 'Failed to create user' };
      }

      console.log('AuthService: Creating user profile via edge function');
      
      // Use edge function to create user profile to avoid RLS issues
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            userId: authData.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            storeName: userData.storeName,
            storeDescription: userData.storeDescription
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to create user profile:', errorText);
          // Continue with basic user object instead of failing completely
        }

        const result = await response.json().catch(() => null);
        console.log('User profile creation result:', result);
      } catch (error) {
        console.error('Failed to call user profile edge function:', error);
        // Continue with basic user object instead of failing completely
      }

      // Return a basic user object based on auth data
      const user: User = {
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: null,
        avatarUrl: null,
        isActive: true,
        createdAt: authData.user.created_at || new Date().toISOString(),
        updatedAt: authData.user.updated_at || new Date().toISOString(),
      };

      console.log('AuthService: Successfully created user');
      return { user, error: null };
    } catch (error) {
      console.error('AuthService: signUp exception:', error);
      return { user: null, error: error.message };
    }
  }

  async signIn(credentials: SignInData): Promise<{ user: User | null; error: string | null }> {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured || !supabase) {
        return { 
          user: null, 
          error: 'Supabase not configured. Please click "Connect to Supabase" in the top right corner.' 
        };
      }

      console.log('AuthService: Starting signIn for:', credentials.email);
      
      console.log('AuthService: Calling supabase.auth.signInWithPassword...');
      
      // Add timeout to prevent hanging
      const authPromise = supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Authentication timeout')), 60000)
      );
      
      const { data: authData, error: authError } = await Promise.race([
        authPromise,
        timeoutPromise
      ]) as any;
      
      console.log('AuthService: Supabase auth response:', { 
        hasUser: !!authData.user, 
        hasSession: !!authData.session,
        error: authError?.message 
      });

      if (authError) {
        console.error('AuthService: Authentication failed:', authError.message);
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        console.error('AuthService: No user in auth response');
        return { user: null, error: 'Invalid credentials' };
      }

      console.log('AuthService: Creating user from auth data');
      const user = this.createUserFromAuthData(authData, credentials.email);
      console.log('AuthService: User created successfully:', user.email);
      
      return { user, error: null };
    } catch (error) {
      console.error('AuthService: Unexpected error during signIn:', error);
      return { user: null, error: error.message || 'Authentication failed' };
    }
  }

  private createUserFromAuthData(authData: any, email: string): User {
    // Get basic user info from auth metadata or defaults
    const userRole = authData.user.user_metadata?.role || 'customer';
    const userName = authData.user.user_metadata?.name || 'User';
    
    console.log('AuthService: Creating user with role:', userRole, 'name:', userName);
    
    // Create simplified user object
    const user: User = {
      id: authData.user.id,
      email: authData.user.email || email,
      name: userName,
      role: userRole as 'admin' | 'vendor' | 'customer',
      phone: null,
      avatarUrl: null,
      isActive: true,
      createdAt: authData.user.created_at || new Date().toISOString(),
      updatedAt: authData.user.updated_at || new Date().toISOString(),
    };
    
    // Add store info for admin user specifically
    if (userRole === 'admin' && email === 'admin@samoku.com') {
      console.log('AuthService: Adding admin store info');
      user.store = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: authData.user.id,
        name: 'Samoku Admin Store',
        description: 'Official admin store for dropshipped products',
        logoUrl: null,
        bannerUrl: null,
        isApproved: true,
        isActive: true,
        commissionRate: 0,
        totalSales: 0,
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return user;
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { error: error.message };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      if (!isSupabaseConfigured || !supabase) {
        return null;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        return null;
      }

      // Fallback: create user object from auth metadata
      const userRole = authUser.user_metadata?.role || 'customer';
      const userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
      
      const user: User = {
        id: authUser.id,
        email: authUser.email || '',
        name: userName,
        role: userRole as 'admin' | 'vendor' | 'customer',
        phone: null,
        avatarUrl: null,
        isActive: true,
        createdAt: authUser.created_at || new Date().toISOString(),
        updatedAt: authUser.updated_at || new Date().toISOString(),
      };

      // Add admin store info if admin user
      if (userRole === 'admin' && authUser.email === 'admin@samoku.com') {
        user.store = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId: authUser.id,
          name: 'Samoku Admin Store',
          description: 'Official admin store for dropshipped products',
          logoUrl: null,
          bannerUrl: null,
          isApproved: true,
          isActive: true,
          commissionRate: 0,
          totalSales: 0,
          rating: 0,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      return user;
    } catch (error) {
      console.error('Auth service error:', error);
      return null;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    if (!isSupabaseConfigured || !supabase) {
      callback(null);
      return { data: { subscription: null } };
    }

    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use auth metadata directly to avoid RLS issues during auth
        const authUser = session.user;
        const userRole = authUser.user_metadata?.role || 'customer';
        const userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
        
        const user: User = {
          id: authUser.id,
          email: authUser.email || '',
          name: userName,
          role: userRole as 'admin' | 'vendor' | 'customer',
          phone: null,
          avatarUrl: null,
          isActive: true,
          createdAt: authUser.created_at || new Date().toISOString(),
          updatedAt: authUser.updated_at || new Date().toISOString(),
        };

        // Add admin store info if admin user
        if (userRole === 'admin' && authUser.email === 'admin@samoku.com') {
          user.store = {
            id: '550e8400-e29b-41d4-a716-446655440000',
            userId: authUser.id,
            name: 'Samoku Admin Store',
            description: 'Official admin store for dropshipped products',
            logoUrl: null,
            bannerUrl: null,
            isApproved: true,
            isActive: true,
            commissionRate: 0,
            totalSales: 0,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        callback(user);
      } else {
        callback(null);
      }
    });
  }

  async updateUser(updates: Partial<User>): Promise<User> {
    // Implementation for updating user
    throw new Error('Not implemented');
  }

  private mapUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      phone: dbUser.phone,
      avatarUrl: dbUser.avatar_url,
      isActive: dbUser.is_active,
      store: dbUser.stores?.[0] ? {
        id: dbUser.stores[0].id,
        userId: dbUser.stores[0].user_id,
        name: dbUser.stores[0].name,
        description: dbUser.stores[0].description,
        logoUrl: dbUser.stores[0].logo_url,
        bannerUrl: dbUser.stores[0].banner_url,
        isApproved: dbUser.stores[0].is_approved,
        isActive: dbUser.stores[0].is_active,
        commissionRate: dbUser.stores[0].commission_rate,
        totalSales: dbUser.stores[0].total_sales,
        rating: dbUser.stores[0].rating,
        reviewCount: dbUser.stores[0].review_count,
        createdAt: dbUser.stores[0].created_at,
        updatedAt: dbUser.stores[0].updated_at,
      } : undefined,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };
  }
}

export const authService = new AuthService();