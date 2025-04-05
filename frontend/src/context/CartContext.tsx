import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { addToCart as addToCartApi, removeFromCart as removeFromCartApi } from '../services/api';
import { CartItem, ShippingAddress, CartContextType } from '../types/cart';

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load cart items and other data from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    const storedShippingAddress = localStorage.getItem('shippingAddress');
    const storedPaymentMethod = localStorage.getItem('paymentMethod');
    
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    if (storedShippingAddress) {
      setShippingAddress(JSON.parse(storedShippingAddress));
    }
    if (storedPaymentMethod) {
      setPaymentMethod(storedPaymentMethod);
    }
  }, []);
  
  // Calculate total number of items in cart
  const itemCount = cartItems.reduce((count, item) => count + item.qty, 0);
  
  const addToCart = async (id: string, qty: number, color: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await addToCartApi(id, qty, color);
      setCartItems(updatedCart);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.toString());
    }
  };
  
  const removeFromCart = (id: string, color: string): void => {
    try {
      const updatedCart = removeFromCartApi(id, color);
      setCartItems(updatedCart);
    } catch (err: any) {
      setError(err.toString());
    }
  };
  
  const updateCartItemQty = (id: string, qty: number, color: string): void => {
    const updatedCartItems = cartItems.map(item => {
      if (item.product === id && item.color === color) {
        return { ...item, qty };
      }
      return item;
    });
    
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    setCartItems(updatedCartItems);
  };
  
  const saveShippingAddress = (data: ShippingAddress): void => {
    localStorage.setItem('shippingAddress', JSON.stringify(data));
    setShippingAddress(data);
  };
  
  const savePaymentMethod = (method: string): void => {
    localStorage.setItem('paymentMethod', method);
    setPaymentMethod(method);
  };
  
  const clearCart = (): void => {
    localStorage.removeItem('cartItems');
    setCartItems([]);
  };
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        shippingAddress,
        paymentMethod,
        itemCount,
        addToCart,
        removeFromCart,
        updateCartItemQty,
        saveShippingAddress,
        savePaymentMethod,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 