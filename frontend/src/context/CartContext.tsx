import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { CartItem, ShippingAddress, CartContextType } from '../types/cart';
import { useAuthContext } from './AuthContext';
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
  const { user, isAuthenticated } = useAuthContext();

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
              try {
                await updateUserCart(mapFrontendCartToDb(initialCart));
              } catch (error) {
                console.error('Error syncing local cart to database:', error);
              }
            }
          } catch (error) {
            console.error('Error loading cart from database:', error);
            // Continue with local cart if database fetch fails
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

  // Sync cart with database when user logs in/out
  useEffect(() => {
    const syncCartWithDatabase = async () => {
      if (!user) {
        // User logged out, clear cart
        setCartItems([]);
        localStorage.removeItem('cartItems');
        return;
      }

      try {
        // Get cart from database
        const dbCart = await getUserCart();
        
        if (dbCart && dbCart.length > 0) {
          // Merge local cart with database cart
          const mergedCart = mergeCarts(cartItems, dbCart);
          // Only update if there are actual changes
          if (JSON.stringify(mergedCart) !== JSON.stringify(cartItems)) {
            setCartItems(mergedCart);
            localStorage.setItem('cartItems', JSON.stringify(mergedCart));
          }
        } else if (cartItems.length > 0) {
          // If no cart in database but we have local items, save to database
          try {
            await updateUserCart(mapFrontendCartToDb(cartItems));
          } catch (error) {
            console.error('Error saving local cart to database:', error);
          }
        }
      } catch (error) {
        console.error('Error syncing cart:', error);
        // Don't throw error, just log it
      }
    };

    // Only sync when user changes
    syncCartWithDatabase();
  }, [user]); // Only depend on user changes

  // Helper function to merge carts
  const mergeCarts = (localCart: CartItem[], dbCart: CartItem[]) => {
    const mergedCart = [...localCart];
    
    dbCart.forEach(dbItem => {
      const existingItem = mergedCart.find(item => item.id === dbItem.id);
      if (existingItem) {
        // If item exists in both carts, take the larger quantity
        existingItem.quantity = Math.max(existingItem.quantity, dbItem.quantity);
      } else {
        // If item only exists in db cart, add it to merged cart
        mergedCart.push(dbItem);
      }
    });
    
    return mergedCart;
  };

  // Add to cart
  const addToCart = async (item: CartItem) => {
    const existItem = cartItems.find((x) => x.id === item.id);
    
    let updatedCart: CartItem[];
    
    if (existItem) {
      updatedCart = cartItems.map((x) =>
        x.id === existItem.id ? { ...x, quantity: x.quantity + item.quantity } : x
      );
    } else {
      updatedCart = [...cartItems, item];
    }
    
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    
    // Sync with database if user is authenticated
    if (user) {
      try {
        await updateUserCart(updatedCart);
      } catch (error) {
        console.error('Error syncing cart with database:', error);
      }
    }
  };

  // Remove from cart
  const removeFromCart = async (id: string) => {
    const updatedCart = cartItems.filter((x) => x.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    
    // Sync with database if user is authenticated
    if (user) {
      try {
        await updateUserCart(updatedCart);
      } catch (error) {
        console.error('Error syncing cart with database:', error);
      }
    }
  };

  // Update cart item quantity
  const updateCartQuantity = async (id: string, quantity: number) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    
    // Sync with database if user is authenticated
    if (user) {
      try {
        await updateUserCart(updatedCart);
      } catch (error) {
        console.error('Error syncing cart with database:', error);
      }
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
      syncCartWithDatabase();
    }
  };

  // Calculate total items count for cart badge
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        shippingAddress,
        paymentMethod,
        loading,
        itemCount,
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