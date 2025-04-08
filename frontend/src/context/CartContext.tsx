import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { CartItem } from '../types/cart';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const updateQueue = useRef<CartItem[]>([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (user?.id) {
      const initSocket = () => {
        try {
          socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5001', {
            transports: ['websocket'],
            timeout: 10000,
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
          });

          const socket = socketRef.current;

          socket.on('connect', () => {
            console.log('Socket connected');
            reconnectAttempts.current = 0;
            socket.emit('authenticate', { userId: user.id });
          });

          socket.on('authenticated', (data) => {
            console.log('Socket authenticated:', data);
            setError(null);
          });

          socket.on('auth_error', (error) => {
            console.error('Socket authentication error:', error);
            setError('Failed to authenticate socket connection');
          });

          socket.on('cart_updated', (data) => {
            if (data.source !== socket.id) {
              setCart(data.cart);
              toast.success('Cart updated from another device');
            }
          });

          socket.on('error', (error) => {
            console.error('Socket error:', error);
            toast.error(error.message || 'Error updating cart');
          });

          socket.on('ping', () => {
            socket.emit('pong');
          });

          socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            if (reason === 'io server disconnect') {
              // Server initiated disconnect, attempt to reconnect
              socket.connect();
            }
          });

          socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            reconnectAttempts.current++;
            if (reconnectAttempts.current >= maxReconnectAttempts) {
              setError('Failed to connect to server');
              socket.disconnect();
            }
          });
        } catch (error) {
          console.error('Socket initialization error:', error);
          setError('Failed to initialize socket connection');
        }
      };

      initSocket();
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
      };
    } else {
      // Clear cart when user logs out
      setCart([]);
      setError(null);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }
  }, [user?.id]);

  // Batch cart updates
  const queueCartUpdate = (newCart: CartItem[]) => {
    updateQueue.current = newCart;
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (socketRef.current?.connected && updateQueue.current.length > 0) {
        socketRef.current.emit('cart_update', { cart: updateQueue.current });
        updateQueue.current = [];
      }
    }, 500);
  };

  const addToCart = (item: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.productId === item.productId);
      let newCart;
      
      if (existingItem) {
        newCart = prevCart.map(i => 
          i.productId === item.productId 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        newCart = [...prevCart, item];
      }
      
      queueCartUpdate(newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.productId !== productId);
      queueCartUpdate(newCart);
      return newCart;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );
      queueCartUpdate(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    queueCartUpdate([]);
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      loading,
      error
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 