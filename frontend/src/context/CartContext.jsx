import React, { createContext, useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { useAuthContext } from './AuthContext';
import { updateUserCart, getUserCart, getProductDetails } from '../services/api';
import { io } from 'socket.io-client';

const CartContext = createContext(null);

// Global optimization settings
const API_STATE = {
  cartFetchInProgress: false,
  lastCartFetchTime: 0,
  cartUpdateInProgress: false,
  lastCartUpdateTime: 0,
  MIN_FETCH_INTERVAL: 60000, // Increase to 60 seconds minimum between fetches
  MIN_UPDATE_INTERVAL: 2000,  // 2 seconds minimum between updates
  updateQueue: [],           // Queue for batching updates
  processingQueue: false,     // Flag to prevent multiple queue processors
  socket: null               // WebSocket connection
};

// Enhanced helper to convert database cart format to frontend format
const mapDbCartToFrontend = (dbCart) => {
  if (!dbCart || !Array.isArray(dbCart)) return [];
  
  return dbCart.map(item => ({
    id: item.productId,
    title: item.name,
    price: item.price,
    image: item.image,
    quantity: item.quantity
  }));
};

// Enhanced helper to convert frontend cart format to database format
const mapFrontendCartToDb = (cartItems) => {
  if (!cartItems || !Array.isArray(cartItems)) return [];
  
  return cartItems.map(item => {
    // Check if productId or id is an object and convert to string if needed
    let productId = item.id || item.productId || 'unknown';
    if (typeof productId === 'object') {
      productId = String(productId._id || productId.id || 'unknown');
    }
    
    // Preserve title first, then check for name - don't default to 'Loading...'
    const itemName = item.title && item.title !== 'Loading...' 
      ? item.title 
      : item.name || 'Product';
    
    // Ensure all required fields are present with proper types
    const dbItem = {
      productId: productId,
      name: itemName,
      price: typeof item.price === 'number' ? item.price : 0,
      image: item.image || '/placeholder.jpg',
      quantity: typeof item.quantity === 'number' ? item.quantity : 1
    };
    
    return dbItem;
  });
};

// Utility for batched updates
const processBatchedUpdates = async () => {
  if (API_STATE.processingQueue || API_STATE.updateQueue.length === 0) {
    return;
  }
  
  API_STATE.processingQueue = true;
  
  try {
    // Get the latest cart state from the queue
    const latestCart = API_STATE.updateQueue.pop();
    
    // Clear the queue
    API_STATE.updateQueue = [];
    
    // Process the latest cart state
    await updateUserCart(mapFrontendCartToDb(latestCart));
    
  } catch (error) {
    console.error('Error processing batched cart update:', error);
  } finally {
    API_STATE.processingQueue = false;
    
    // If more updates came in while processing, start a new batch
    if (API_STATE.updateQueue.length > 0) {
      setTimeout(processBatchedUpdates, 100);
    }
  }
};

// Error handling utility
const handleApiError = (error, operation) => {
  console.error(`Cart operation failed (${operation}):`, error);
  
  // Track if the error is network-related
  const isNetworkError = 
    error.message?.includes('Failed to fetch') || 
    error.message?.includes('Network error') ||
    error.message?.includes('ERR_INSUFFICIENT_RESOURCES');
  
  // Check for authentication errors
  const isAuthError = 
    error.message?.includes('Not authorized') || 
    error.message?.includes('401') ||
    error.message?.includes('unauthorized');
  
  // For auth errors, we'll just use local storage
  if (isAuthError) {
    return {
      success: false,
      isAuthError: true,
      message: 'Authentication error, using local cart'
    };
  }
  
  return {
    success: false,
    isNetworkError,
    message: error.message || 'An unknown error occurred'
  };
};

// Initialize Socket.io with connection
const initializeSocket = (user) => {
  if (!user || !user._id) return null;
  // Clean up existing socket if any
  cleanupSocket();
  try {
    console.log('Initializing socket connection...');
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    console.log('Using backend URL for socket:', BACKEND_URL);
    API_STATE.socket = io(BACKEND_URL, {
      withCredentials: true,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });
    // Set up event handlers with backend protocol
    API_STATE.socket.on('connect', () => {
      console.log(`Socket connected successfully with ID: ${API_STATE.socket.id}`);
      // Authenticate after connect
      API_STATE.socket.emit('authenticate', { userId: user._id });
    });
    API_STATE.socket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
    });
    API_STATE.socket.on('auth_error', (error) => {
      console.error('Socket authentication error:', error);
    });
    
    API_STATE.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      
      // Try to reconnect with exponential backoff
      const reconnectDelay = Math.min(1000 * Math.pow(2, API_STATE.socket.reconnectAttempts || 0), 10000);
      
      setTimeout(() => {
        if (API_STATE.socket) {
          console.log(`Attempting to reconnect socket after ${reconnectDelay}ms...`);
          API_STATE.socket.connect();
        }
      }, reconnectDelay);
    });
    
    API_STATE.socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected, reason: ${reason}`);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, attempt reconnection
        setTimeout(() => {
          if (API_STATE.socket) {
            console.log('Attempting to reconnect after server disconnect...');
            API_STATE.socket.connect();
          }
        }, 1000);
      }
    });
    
    // Handle cart update events
    API_STATE.socket.on('cart_updated', (data) => {
      if (!data || !data.cart) {
        console.error('Received invalid cart update:', data);
        return;
      }
      
      console.log('Received cart update:', data);
      
      // Set flag to prevent echo
      isWebSocketUpdateRef.current = true;
      
      try {
        const frontendCart = mapDbCartToFrontend(data.cart);
        if (isMountedRef.current) {
          setCartItems(frontendCart);
          saveCartToLocalStorage(frontendCart);
        }
      } catch (error) {
        console.error('Error processing cart update:', error);
      } finally {
        // Reset flag after a delay
        setTimeout(() => {
          isWebSocketUpdateRef.current = false;
        }, 100);
      }
    });
    
    return API_STATE.socket;
  } catch (error) {
    console.error('Error initializing socket:', error);
    return null;
  }
};

// Clean up socket connection
const cleanupSocket = () => {
  if (API_STATE.socket) {
    console.log('Cleaning up existing socket connection');
    try {
      API_STATE.socket.disconnect();
    } catch (error) {
      console.error('Error disconnecting socket:', error);
    }
    API_STATE.socket = null;
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  
  // Use a ref to maintain component mount state
  const isMountedRef = useRef(true);
  // Track if initial cart load has completed
  const initialLoadCompletedRef = useRef(false);
  // Track if the update is from WebSocket to prevent loops
  const isWebSocketUpdateRef = useRef(false);
  
  // Helper function to safely update state only if component is mounted
  const safeSetState = (setter, value) => {
    if (isMountedRef.current) {
      setter(value);
    }
  };

  // Helper function to save cart to localStorage
  const saveCartToLocalStorage = (cart) => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  };
  
  // Queue cart update for batched processing
  const queueCartUpdate = useCallback((cart) => {
    if (!user || !user._id) {
      return;
    }
    
    // Add to update queue
    API_STATE.updateQueue.push([...cart]);
    
    // Send update to other devices via WebSocket
    if (API_STATE.socket && !isWebSocketUpdateRef.current) {
      API_STATE.socket.emit('cart_update', { 
        cart: mapFrontendCartToDb(cart),
        userId: user._id
      });
    }
    
    // Debounce processing
    if (!API_STATE.processingQueue) {
      setTimeout(processBatchedUpdates, 500);
    }
  }, [user]);

  // Initialize WebSocket when user changes
  useEffect(() => {
    let socketInitTimer;
    
    const initSocket = () => {
      if (user && user._id) {
        console.log('Initializing socket for user:', user._id);
        const socket = initializeSocket(user);
        
        if (!socket) {
          // Retry socket initialization after delay
          socketInitTimer = setTimeout(initSocket, 5000);
        }
      } else {
        cleanupSocket();
      }
    };
    
    initSocket();
    
    return () => {
      cleanupSocket();
      if (socketInitTimer) {
        clearTimeout(socketInitTimer);
      }
    };
  }, [user]);
  
  // Load cart from localStorage when component mounts (ONCE ONLY)
  useEffect(() => {
    const loadLocalCart = () => {
      try {
        // First, get cart from localStorage
        const storedCartItems = localStorage.getItem('cartItems');
        const storedShippingAddress = localStorage.getItem('shippingAddress');
        const storedPaymentMethod = localStorage.getItem('paymentMethod');
        
        const initialCart = storedCartItems ? JSON.parse(storedCartItems) : [];
        
        safeSetState(setCartItems, initialCart);
        
        if (storedShippingAddress) {
          safeSetState(setShippingAddress, JSON.parse(storedShippingAddress));
        }
        
        if (storedPaymentMethod) {
          safeSetState(setPaymentMethod, storedPaymentMethod);
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      } finally {
        // Regardless of outcome, mark initial load as completed
        initialLoadCompletedRef.current = true;
      }
    };
    
    // Load initial cart from localStorage immediately
    loadLocalCart();
    
    // Clean up function
    return () => {
      isMountedRef.current = false;
    };
  }, []); // Empty dependency array - run once on mount

  // Handle cart synchronization with API with proper throttling
  useEffect(() => {
    // Skip if not authenticated or if initial load hasn't completed
    if (!user || !user._id || !initialLoadCompletedRef.current) {
      safeSetState(setLoading, false);
      return;
    }
    
    // Function to fetch cart from API with throttling and better error handling
    const fetchCartFromApi = async () => {
      // Skip if a fetch is already in progress or if we've fetched recently
      const now = Date.now();
      if (API_STATE.cartFetchInProgress || 
          (now - API_STATE.lastCartFetchTime < API_STATE.MIN_FETCH_INTERVAL)) {
        safeSetState(setLoading, false);
        return { success: false, skipped: true };
      }
      
      // Set flags to prevent duplicate fetches
      API_STATE.cartFetchInProgress = true;
      API_STATE.lastCartFetchTime = now;
      
      try {
        const userCartData = await getUserCart();
        
        if (userCartData && Array.isArray(userCartData) && userCartData.length > 0) {
          // Convert DB format to frontend format
          const frontendCart = mapDbCartToFrontend(userCartData);
          
          // Update state and localStorage
          safeSetState(setCartItems, frontendCart);
          saveCartToLocalStorage(frontendCart);
          
          return { success: true, cartItems: frontendCart };
        } else {
          // Check if we have local items to sync to server
          const storedCartItems = localStorage.getItem('cartItems');
          const localCart = storedCartItems ? JSON.parse(storedCartItems) : [];
          
          if (localCart.length > 0 && isMountedRef.current) {
            queueCartUpdate(localCart);
          }
          
          return { success: true, cartItems: [] };
        }
      } catch (error) {
        const errorResult = handleApiError(error, 'fetch_cart');
        // Don't clear local cart on API errors
        return errorResult;
      } finally {
        API_STATE.cartFetchInProgress = false;
        safeSetState(setLoading, false);
      }
    };
    
    // Fetch cart with a delay to avoid race conditions
    const timerId = setTimeout(() => {
      fetchCartFromApi();
    }, 2000); // Increased delay to 2 seconds
    
    return () => {
      clearTimeout(timerId);
    };
  }, [user, queueCartUpdate]); // Only depends on user changes

  // Efficient wrapped update function with batching
  const updateCartItemsWithBatching = useCallback((newCartItems) => {
    // Update local state immediately
    safeSetState(setCartItems, newCartItems);
    saveCartToLocalStorage(newCartItems);
    
    // Queue update to server if authenticated
    if (user) {
      queueCartUpdate(newCartItems);
    }
  }, [user, queueCartUpdate]);

  // Add to cart (optimistic local update first, then sync to server)
  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      // Ensure productId is a string
      let productIdStr = productId;
      let productInfo = null;
      
      if (typeof productId === 'object') {
        // Extract the ID but save the entire object for product details
        productInfo = productId;
        productIdStr = String(productId._id || productId.id || 'unknown');
      }
      
      // Find in existing cart
      const existingItem = cartItems.find(item => item.id === productIdStr);
      
      let updatedCart;
      if (existingItem) {
        // Update quantity if item exists
        updatedCart = cartItems.map(item => 
          item.id === productIdStr 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        // If we already have product info from the passed object, use it
        let initialItem = {
          id: productIdStr,
          title: 'Loading...',
          price: 0,
          image: '/placeholder.jpg',
          quantity: quantity
        };
        
        // If product information was passed in as an object, use it
        if (productInfo) {
          initialItem = {
            id: productIdStr,
            title: productInfo.title || productInfo.name || 'Loading...',
            price: typeof productInfo.price === 'number' ? productInfo.price : 0,
            image: productInfo.image || '/placeholder.jpg',
            quantity: quantity
          };
        }
        
        updatedCart = [...cartItems, initialItem];
        
        // Only fetch product details if we don't already have them
        if (!productInfo || !productInfo.title) {
          try {
            const productDetails = await getProductDetails(productIdStr);
            if (productDetails && isMountedRef.current) {
              // Update with proper details once available
              const newCartWithDetails = updatedCart.map(item => 
                item.id === productIdStr 
                  ? { 
                      ...item, 
                      title: productDetails.name,
                      price: productDetails.price,
                      image: productDetails.images?.[0] || '/placeholder.jpg'
                    }
                  : item
              );
              
              // Update cart with product details
              updateCartItemsWithBatching(newCartWithDetails);
              return true;
            }
          } catch (detailsError) {
            console.error('Error fetching product details:', detailsError);
            // Continue with placeholder or existing data
          }
        }
      }
      
      // Update cart with optimistic UI
      updateCartItemsWithBatching(updatedCart);
      
      // Explicitly send the update via WebSocket
      if (user && API_STATE.socket && !isWebSocketUpdateRef.current) {
        API_STATE.socket.emit('cart_update', {
          cart: mapFrontendCartToDb(updatedCart),
          userId: user._id
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }, [cartItems, updateCartItemsWithBatching, user]);

  // Remove from cart
  const removeFromCart = useCallback((id) => {
    const updatedCart = cartItems.filter((x) => x.id !== id);
    updateCartItemsWithBatching(updatedCart);
    
    // Explicitly send the update via WebSocket
    if (user && API_STATE.socket && !isWebSocketUpdateRef.current) {
      API_STATE.socket.emit('cart_update', {
        cart: mapFrontendCartToDb(updatedCart),
        userId: user._id
      });
    }
  }, [cartItems, updateCartItemsWithBatching, user]);

  // Update cart item quantity
  const updateCartQuantity = useCallback((id, quantity) => {
    if (quantity <= 0) {
      // Remove item if quantity is zero or negative
      removeFromCart(id);
      return;
    }
    
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    updateCartItemsWithBatching(updatedCart);
    
    // Explicitly send the update via WebSocket
    if (user && API_STATE.socket && !isWebSocketUpdateRef.current) {
      API_STATE.socket.emit('cart_update', {
        cart: mapFrontendCartToDb(updatedCart),
        userId: user._id
      });
    }
  }, [cartItems, removeFromCart, updateCartItemsWithBatching, user]);

  // Save shipping address
  const saveShippingAddress = useCallback((data) => {
    setShippingAddress(data);
    localStorage.setItem('shippingAddress', JSON.stringify(data));
  }, []);

  // Save payment method
  const savePaymentMethod = useCallback((data) => {
    setPaymentMethod(data);
    localStorage.setItem('paymentMethod', data);
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
    
    // Also clear on server if authenticated
    if (user) {
      queueCartUpdate([]);
    }
  }, [user, queueCartUpdate]);

  // Calculate total items count for cart badge (memoized)
  const itemCount = useMemo(() => 
    cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems]
  );

  // Cleanup effect - ensure WebSocket connection is closed when unmounting
  useEffect(() => {
    return () => {
      cleanupSocket();
    };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
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
  }), [
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
    clearCart
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 