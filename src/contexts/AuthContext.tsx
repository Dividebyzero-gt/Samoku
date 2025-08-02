import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, SignUpData, SignInData } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (credentials: SignInData) => Promise<boolean>;
  register: (userData: SignUpData) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    const getInitialUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to get initial user:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (credentials: SignInData): Promise<boolean> => {
    try {
      console.log('AuthContext: login called with:', credentials.email);
      setLoading(true);
      
      const { user: loggedInUser, error } = await authService.signIn(credentials);
      
      if (error) {
        console.error('Login error:', error);
        setLoading(false);
        return false;
      }

      if (loggedInUser) {
        console.log('AuthContext: Login successful for:', loggedInUser.email);
        setUser(loggedInUser);
        setLoading(false);
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      return false;
    }
  };

  const register = async (userData: SignUpData): Promise<boolean> => {
    try {
      setLoading(true);
      const { user: newUser, error } = await authService.signUp(userData);
      
      if (error) {
        console.error('Registration error:', error);
        return false;
      }

      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    try {
      if (!user) return;
      
      const updatedUser = await authService.updateUser(updates);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};