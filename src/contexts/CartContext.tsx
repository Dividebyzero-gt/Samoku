import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth, AuthContext } from './AuthContext';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  vendorId: string;
  vendorName: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalAmount: number;
  totalItems: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// For guests, we'll use localStorage. For authenticated users, we'll sync with database
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadCartFromDatabase();
    } else {
      loadCartFromLocalStorage();
    }
  }, [user]);

  const loadCartFromDatabase = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products(name, images, price, stores(name))
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to load cart:', error);
        return;
      }

      const cartItems: CartItem[] = data.map(item => ({
        id: item.id,
        productId: item.product_id,
        name: item.products.name,
        price: parseFloat(item.products.price),
        image: item.products.images?.[0] || '',
        quantity: item.quantity,
        vendorId: item.products.stores?.user_id || '',
        vendorName: item.products.stores?.name || '',
      }));

      setItems(cartItems);
    } catch (error) {
      console.error('Failed to load cart from database:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCartFromLocalStorage = () => {
    try {
      const storedCart = localStorage.getItem('samoku_cart');
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  };

  const saveToLocalStorage = (cartItems: CartItem[]) => {
    try {
      localStorage.setItem('samoku_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  };

  const addToCart = async (product: Omit<CartItem, 'quantity'>) => {
    const newItems = [...items];
    const existingItemIndex = newItems.findIndex(item => item.productId === product.productId);

    if (existingItemIndex >= 0) {
      newItems[existingItemIndex].quantity += 1;
    } else {
      newItems.push({ ...product, quantity: 1 });
    }

    setItems(newItems);

    if (user) {
      try {
        await supabase
          .from('cart_items')
          .upsert({
            user_id: user.id,
            product_id: product.productId,
            quantity: existingItemIndex >= 0 
              ? newItems[existingItemIndex].quantity 
              : 1,
          });
      } catch (error) {
        console.error('Failed to sync cart with database:', error);
      }
    } else {
      saveToLocalStorage(newItems);
    }
  };

  const removeFromCart = async (productId: string) => {
    const newItems = items.filter(item => item.productId !== productId);
    setItems(newItems);

    if (user) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } catch (error) {
        console.error('Failed to remove item from database:', error);
      }
    } else {
      saveToLocalStorage(newItems);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const newItems = items.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    );

    setItems(newItems);

    if (user) {
      try {
        await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } catch (error) {
        console.error('Failed to update quantity in database:', error);
      }
    } else {
      saveToLocalStorage(newItems);
    }
  };

  const clearCart = async () => {
    setItems([]);

    if (user) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to clear cart in database:', error);
      }
    } else {
      localStorage.removeItem('samoku_cart');
    }
  };

  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount,
    totalItems,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};