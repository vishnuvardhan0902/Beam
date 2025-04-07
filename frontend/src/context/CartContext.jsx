import React, { createContext, useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { useAuthContext } from './AuthContext';
import { updateUserCart, getUserCart, getProductDetails } from '../services/api';

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
  processingQueue: false     // Flag to prevent multiple queue processors
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
  
  console.log('Converting frontend cart to DB format:', cartItems);
  
  return cartItems.map(item => {
    // Check if productId or id is an object and convert to string if needed
    let productId = item.id || item.productId || 'unknown';
    if (typeof productId === 'object') {
      console.warn('productId is an object, converting to string:', productId);
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
    
    console.log('Mapped item:', dbItem);
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
    
    console.log(`Processing batched update with ${latestCart.length} items`);
    
    // Process the latest cart state
    await updateUserCart(mapFrontendCartToDb(latestCart));
    
    console.log('Batched cart update completed');
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
  
  // Log analytics event for monitoring
  try {
    if (window.gtag) {
      window.gtag('event', 'cart_error', {
        event_category: 'error',
        event_label: operation,
        value: isNetworkError ? 1 : 0
      });
    }
  } catch (e) {
    // Ignore analytics errors
  }
  
  // For auth errors, we'll just use local storage
  if (isAuthError) {
    console.log('Authentication error detected, falling back to local storage');
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
      console.log('Skipping cart update - user not authenticated');
      return;
    }
    
    // Add to update queue
    API_STATE.updateQueue.push([...cart]);
    
    // Debounce processing
    if (!API_STATE.processingQueue) {
      setTimeout(processBatchedUpdates, 500);
    }
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
      console.log('Skipping cart fetch - user not authenticated or initial load not completed');
      safeSetState(setLoading, false);
      return;
    }
    
    // Function to fetch cart from API with throttling and better error handling
    const fetchCartFromApi = async () => {
      // Skip if a fetch is already in progress or if we've fetched recently
      const now = Date.now();
      if (API_STATE.cartFetchInProgress || 
          (now - API_STATE.lastCartFetchTime < API_STATE.MIN_FETCH_INTERVAL)) {
        console.log('Skipping cart fetch - already in progress or too soon');
        safeSetState(setLoading, false);
        return { success: false, skipped: true };
      }
      
      // Set flags to prevent duplicate fetches
      API_STATE.cartFetchInProgress = true;
      API_STATE.lastCartFetchTime = now;
      
      try {
        console.log('Fetching cart from API');
        const userCartData = await getUserCart();
        
        if (userCartData && Array.isArray(userCartData) && userCartData.length > 0) {
          // Convert DB format to frontend format
          const frontendCart = mapDbCartToFrontend(userCartData);
          console.log('Loaded cart from database:', frontendCart);
          
          // Update state and localStorage
          safeSetState(setCartItems, frontendCart);
          saveCartToLocalStorage(frontendCart);
          
          return { success: true, cartItems: frontendCart };
        } else {
          console.log('No items in remote cart');
          
          // Check if we have local items to sync to server
          const storedCartItems = localStorage.getItem('cartItems');
          const localCart = storedCartItems ? JSON.parse(storedCartItems) : [];
          
          if (localCart.length > 0 && isMountedRef.current) {
            console.log('Local cart has items, scheduling sync to server');
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
        console.warn('productId is an object in addToCart, converting to string:', productId);
        // Extract the ID but save the entire object for product details
        productInfo = productId;
        productIdStr = String(productId._id || productId.id || 'unknown');
      }
      
      console.log(`Adding product ${productIdStr} to cart, quantity: ${quantity}`);
      
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
          console.log('Using passed product info:', initialItem);
        }
        
        updatedCart = [...cartItems, initialItem];
        
        // Only fetch product details if we don't already have them
        if (!productInfo || !productInfo.title) {
          try {
            console.log('Fetching product details for ID:', productIdStr);
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
              updateCartItemsWithBatching(newCartWithDetails);
            }
          } catch (detailsError) {
            console.error('Error fetching product details:', detailsError);
            // Continue with placeholder or existing data
          }
        }
      }
      
      // Update cart with optimistic UI
      updateCartItemsWithBatching(updatedCart);
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }, [cartItems, updateCartItemsWithBatching]);

  // Remove from cart
  const removeFromCart = useCallback((id) => {
    const updatedCart = cartItems.filter((x) => x.id !== id);
    updateCartItemsWithBatching(updatedCart);
  }, [cartItems, updateCartItemsWithBatching]);

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
  }, [cartItems, removeFromCart, updateCartItemsWithBatching]);

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