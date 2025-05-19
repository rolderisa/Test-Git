
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService, Product, CartItem } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

type CartContextType = {
  cart: CartItem[];
  isLoading: boolean;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  updateCartItem: (id: number, quantity: number) => Promise<void>;
  removeCartItem: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const cartItems = await apiService.getCart();
          setCart(cartItems);
        } catch (error) {
          console.error('Failed to load cart:', error);
          toast.error('Failed to load your cart');
        } finally {
          setIsLoading(false);
        }
      } else {
        setCart([]);
      }
    };
    
    loadCart();
  }, [user]);

  const addToCart = async (product: Product, quantity: number) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    try {
      setIsLoading(true);
      const updatedCart = await apiService.addToCart(product, quantity);
      setCart(updatedCart);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error('Failed to add item to cart');
      console.error('Add to cart error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (id: number, quantity: number) => {
    try {
      setIsLoading(true);
      const updatedCart = await apiService.updateCartItem(id, quantity);
      setCart(updatedCart);
    } catch (error) {
      toast.error('Failed to update cart item');
      console.error('Update cart item error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCartItem = async (id: number) => {
    try {
      setIsLoading(true);
      const updatedCart = await apiService.removeCartItem(id);
      setCart(updatedCart);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item from cart');
      console.error('Remove cart item error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      await apiService.clearCart();
      setCart([]);
    } catch (error) {
      toast.error('Failed to clear cart');
      console.error('Clear cart error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkout = async () => {
    try {
      if (cart.length === 0) {
        toast.error('Your cart is empty');
        return;
      }

      setIsLoading(true);
      await apiService.checkout();
      setCart([]);
      toast.success('Checkout successful!');
    } catch (error) {
      toast.error('Checkout failed');
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        isLoading, 
        addToCart, 
        updateCartItem, 
        removeCartItem, 
        clearCart,
        checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
