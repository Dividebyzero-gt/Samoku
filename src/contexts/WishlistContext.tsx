import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';
import { Wishlist, Product } from '../types';

interface WishlistContextType {
  items: Wishlist[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  totalItems: number;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setItems([]);
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const wishlistItems = await wishlistService.getWishlist(user.id);
      setItems(wishlistItems);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product: Product) => {
    if (!user) {
      // Could redirect to login or show a message
      alert('Please login to add items to your wishlist');
      return;
    }

    try {
      await wishlistService.addToWishlist(user.id, product.id);
      await loadWishlist(); // Reload to get the full product data
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      await wishlistService.removeFromWishlist(user.id, productId);
      setItems(prev => prev.filter(item => item.productId !== productId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      throw error;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return items.some(item => item.productId === productId);
  };

  const clearWishlist = async () => {
    if (!user) return;

    try {
      await wishlistService.clearWishlist(user.id);
      setItems([]);
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      throw error;
    }
  };

  const totalItems = items.length;

  const value = {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    totalItems,
    loading,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};