import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { CartItem, ShippingAddress, CartContextType } from '../types/cart';
import { useAuth } from './AuthContext';
import { updateUserCart, getUserCart } from '../services/api';
import axios from 'axios';

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

// Helper to convert database cart format to frontend format
const mapDbCartToFrontend = (dbCart: any[]): CartItem[] => {
  return dbCart.map(item => ({
    id: item.productId,
    title: item.name,
    price: item.price,
    image: item.image,
    quantity: item.quantity
  }));
};

// Helper to convert frontend cart format to database format
const mapFrontendCartToDb = (cartItems: CartItem[]): any[] => {
  return cartItems.map(item => ({
    productId: item.id,
    name: item.title,
    price: item.price,
    image: item.image,
    quantity: item.quantity
  }));
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { user, isAuthenticated } = useAuth();

  // Load cart from localStorage when component mounts
  useEffect(() => {
    const loadCartData = async () => {
      setLoading(true);
      try {
        // First, get cart from localStorage
        const storedCartItems = localStorage.getItem('cartItems');
        const storedShippingAddress = localStorage.getItem('shippingAddress');
        const storedPaymentMethod = localStorage.getItem('paymentMethod');
        
        let initialCart: CartItem[] = storedCartItems ? JSON.parse(storedCartItems) : [];
        
        // If user is authenticated, load cart from database
        if (isAuthenticated && user) {
          try {
            const token = localStorage.getItem('token') || user.token;
            
            if (!token) {
              console.error('No authentication token found');
              setLoading(false);
              return;
            }
            
            // Use the API function instead of direct axios call
            const userCartData = await getUserCart();
            
            if (userCartData && userCartData.length > 0) {
              // Convert DB format to frontend format
              initialCart = mapDbCartToFrontend(userCartData);
              console.log('Loaded cart from database:', initialCart);
              // Update localStorage with the latest cart data
              localStorage.setItem('cartItems', JSON.stringify(initialCart));
            } else if (initialCart.length > 0) {
              // If local cart has items but server doesn't, sync to server
              console.log('Syncing local cart to database:', initialCart);
              await updateUserCart(mapFrontendCartToDb(initialCart));
            }
          } catch (error) {
            console.error('Error loading cart from database:', error);
          }
        }
        
        setCartItems(initialCart);
        
        if (storedShippingAddress) {
          setShippingAddress(JSON.parse(storedShippingAddress));
        }
        
        if (storedPaymentMethod) {
          setPaymentMethod(storedPaymentMethod);
        }
      } catch (error) {
        console.error('Error loading cart data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCartData();
  }, [isAuthenticated, user]);

  // Monitor authentication changes to sync cart
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User logged in, syncing cart with database');
      // When user logs in, sync their cart with the database
      const syncCartOnLogin = async () => {
        try {
          if (cartItems.length > 0) {
            await syncCartWithDatabase(cartItems);
          } else {
            // If local cart is empty, try to get the cart from the database
            const userCartData = await getUserCart();
            if (userCartData && userCartData.length > 0) {
              // Convert DB format to frontend format
              const dbCartItems = mapDbCartToFrontend(userCartData);
              setCartItems(dbCartItems);
              localStorage.setItem('cartItems', JSON.stringify(dbCartItems));
            }
          }
        } catch (error) {
          console.error('Error syncing cart on login:', error);
        }
      };
      
      syncCartOnLogin();
    }
  }, [isAuthenticated, user?.token]); // Only trigger when auth status or token changes

  // Helper function to sync cart with the database
  const syncCartWithDatabase = async (items: CartItem[]) => {
    if (isAuthenticated && user) {
      try {
        const token = localStorage.getItem('token') || user.token;
        
        if (!token) {
          console.error('No authentication token found');
          return;
        }
        
        // Convert frontend cart items to DB format
        const dbCartItems = mapFrontendCartToDb(items);
        
        // Use the API function instead of direct axios call
        await updateUserCart(dbCartItems);
        console.log('Cart synced with database successfully');
      } catch (error) {
        console.error('Error syncing cart with database:', error);
      }
    }
  };

  // Add to cart
  const addToCart = (item: CartItem) => {
    console.log('Adding item to cart:', item);
    const existItem = cartItems.find((x) => x.id === item.id);
    
    let updatedCart: CartItem[];
    
    if (existItem) {
      console.log('Item already exists in cart, updating quantity');
      updatedCart = cartItems.map((x) =>
        x.id === existItem.id ? { ...x, quantity: x.quantity + item.quantity } : x
      );
    } else {
      console.log('Adding new item to cart');
      updatedCart = [...cartItems, item];
    }
    
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    
    // Sync with database if user is authenticated
    if (isAuthenticated && user) {
      console.log('User is authenticated, syncing with database');
      syncCartWithDatabase(updatedCart);
    } else {
      console.log('User is not authenticated, cart saved to localStorage only');
    }
  };

  // Remove from cart
  const removeFromCart = (id: string) => {
    console.log('Removing item from cart, id:', id);
    const updatedCart = cartItems.filter((x) => x.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    
    // Sync with database if user is authenticated
    if (isAuthenticated && user) {
      console.log('User is authenticated, syncing with database');
      syncCartWithDatabase(updatedCart);
    } else {
      console.log('User is not authenticated, cart saved to localStorage only');
    }
  };

  // Update cart item quantity
  const updateCartQuantity = (id: string, quantity: number) => {
    console.log('Updating cart item quantity, id:', id, 'quantity:', quantity);
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    
    // Sync with database if user is authenticated
    if (isAuthenticated && user) {
      console.log('User is authenticated, syncing with database');
      syncCartWithDatabase(updatedCart);
    } else {
      console.log('User is not authenticated, cart saved to localStorage only');
    }
  };

  // Save shipping address
  const saveShippingAddress = (data: ShippingAddress) => {
    setShippingAddress(data);
    localStorage.setItem('shippingAddress', JSON.stringify(data));
  };

  // Save payment method
  const savePaymentMethod = (data: string) => {
    setPaymentMethod(data);
    localStorage.setItem('paymentMethod', data);
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
    
    // Clear cart in database if user is authenticated
    if (isAuthenticated && user) {
      syncCartWithDatabase([]);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        shippingAddress,
        paymentMethod,
        loading,
        addToCart,
        removeFromCart,
        updateCartQuantity,
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