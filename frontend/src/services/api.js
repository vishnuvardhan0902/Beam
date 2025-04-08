// Type definitions for frontend/src/services/api.js

/* 
UserInfo {
  _id: string
  name: string
  email: string
  isAdmin: boolean
  token: string
}

Product {
  _id: string
  name: string
  price: number
  category: string
  description: string (optional)
  images: string[] (optional)
  rating: number
  numReviews: number
  countInStock: number
}

ProductsApiResponse {
  products: Product[]
  pages: number
  page: number
}

Address {
  _id: string
  name: string
  addressLine1: string
  addressLine2: string (optional)
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

PaymentMethod {
  _id: string
  cardType: string
  cardName: string
  lastFourDigits: string
  expiryMonth: string
  expiryYear: string
  isDefault: boolean
}
*/

// API service for frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable credentials for CORS
});

// Add user ID to headers if available
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const userData = JSON.parse(userInfo);
      if (userData && userData._id) {
        console.log('Adding user ID to request headers:', userData._id);
        config.headers['user-id'] = userData._id;
      }
      if (userData && userData.token) {
        config.headers['Authorization'] = `Bearer ${userData.token}`;
      }
    } catch (error) {
      console.error('Error parsing user info from localStorage:', error);
    }
  }
  return config;
});

class ApiService {
  static async login(credentials) {
    try {
      console.log('Login attempt with:', credentials);
      const endpoint = credentials.googleId ? '/api/users/google' : '/api/users/login';
      console.log('Using endpoint:', endpoint);
      const response = await api.post(endpoint, credentials);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleError(error);
    }
  }

  static async register(userData) {
    try {
      console.log('Register attempt with:', userData);
      const endpoint = userData.googleId ? '/api/users/google' : '/api/users/register';
      console.log('Using endpoint:', endpoint);
      const response = await api.post(endpoint, userData);
      console.log('Register response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw this.handleError(error);
    }
  }

  static handleError(error) {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      return new Error(error.response.data.message || 'An error occurred');
    }
    return new Error('Network error');
  }
}

export default ApiService;

// Request cache to prevent duplicate calls
const apiCache = new Map();
const cacheTTL = 60000; // 1 minute default TTL
const pendingRequests = new Map();
const loginAttemptInProgress = { value: false };

// Make sure we're not adding /api prefix twice
const formatEndpoint = (endpoint) => {
  // If the API_BASE_URL already includes '/api' and the endpoint starts with '/api', 
  // remove the duplicate '/api' from the endpoint
  if (API_URL.includes('/api') && endpoint.startsWith('/api')) {
    return endpoint.replace('/api', '');
  }
  return endpoint;
};

// Enhanced fetch function with caching
const fetchApi = async (endpoint, options = {}) => {
  try {
    // Add user ID and authorization token to headers if available
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        if (userData && userData._id) {
          console.log('Adding user ID to fetch request headers:', userData._id);
          headers['user-id'] = userData._id;
        }
        if (userData && userData.token) {
          headers['Authorization'] = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error('Error parsing user info from localStorage:', error);
      }
    }
    
    console.log(`Making API request to: ${API_URL}${endpoint}`);
    
    // Set a default timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Check if response is OK
    if (!response.ok) {
      // Clone the response before reading it
      const responseClone = response.clone();
      
      // Try to parse as JSON first
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      } catch (jsonError) {
        // If not JSON, get text from the clone
        try {
          const text = await responseClone.text();
          
          // Special handling for 401 Unauthorized errors
          if (response.status === 401) {
            console.error('Authentication error:', text);
            
            // Don't trigger multiple redirects or login attempts
            if (!loginAttemptInProgress.value) {
              loginAttemptInProgress.value = true;
              
              // Clear user info if unauthorized
              localStorage.removeItem('userInfo');
              localStorage.removeItem('tokenExpiry');
              
              // Only redirect if not already on login page and not in the middle of a payment
              const isPaymentPage = window.location.pathname.includes('checkout') || 
                                   window.location.pathname.includes('payment');
              const isLoginPage = window.location.pathname.includes('login');
              
              if (!isLoginPage && !isPaymentPage) {
                // Store the current URL to redirect back after login
                const currentPage = window.location.pathname + window.location.search;
                localStorage.setItem('redirectAfterLogin', currentPage);
                
                // Wait a moment before redirecting
                setTimeout(() => {
                  window.location.href = '/login';
                  loginAttemptInProgress.value = false;
                }, 500);
              } else {
                loginAttemptInProgress.value = false;
              }
            }
            
            throw new Error('Authentication failed. Please login again.');
          }
          
          console.error('Non-JSON error response:', text);
          throw new Error(`HTTP error! status: ${response.status}`);
        } catch (textError) {
          // If we can't read the text either, just throw a generic error
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
    }

    // Check content type to determine how to parse
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      
      // Try to parse text as JSON first (sometimes content-type is incorrectly set)
      try {
        return JSON.parse(text);
      } catch (e) {
        // It's genuinely not JSON
        console.warn('Received non-JSON response:', text);
        throw new Error('Received non-JSON response from server');
      }
    }
  } catch (error) {
    // Handle network errors specially
    if (error.name === 'AbortError') {
      console.error('Request timed out');
      throw new Error('Request timed out. Please try again later.');
    }
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.error('Network error:', error);
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    console.error('API Error:', error);
    throw error;
  }
};

// User API calls
export async function getUserProfile() {
  return fetchApi('/api/users/profile');
}

export async function updateUserProfile(userData) {
  return fetchApi('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

// Product related functions
export async function getProducts(params = {}) {
  // Build query string from params
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  try {
    console.log(`Fetching products with params: ${queryString}`);
    return await fetchApi(`/api/products${queryString}`);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getProductDetails(id) {
  // Handle case where id is an object
  if (typeof id === 'object') {
    console.warn('getProductDetails received object instead of string ID:', id);
    id = id._id || id.id || id.productId;
    
    if (!id || typeof id !== 'string') {
      console.error('Failed to extract valid ID from object:', id);
      throw new Error('Invalid product ID');
    }
  }
  
  return fetchApi(`/api/products/${id}`);
}

export async function getTopProducts() {
  try {
    console.log('Fetching top products');
    return await fetchApi(`/api/products/top`);
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
}

export async function createProduct(productData) {
  return fetchApi('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
}

export async function updateProduct(id, productData) {
  return fetchApi(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
}

export async function deleteProduct(productId) {
  return fetchApi(`/products/${productId}`, {
    method: 'DELETE',
  });
}

// Authentication and user related functions
export async function googleLogin(googleData) {
  console.log('Attempting Google login with data:', googleData);
  try {
    // Make sure to use properly formatted URL and avoid double /api prefixes
    const endpoint = '/api/users/google-login';
    const formattedEndpoint = formatEndpoint(endpoint);
    const fullUrl = `${API_URL}${formattedEndpoint}`;
    
    console.log(`Making Google login request to: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleData),
    });

    console.log(`Google login response status: ${response.status}`);
    
    // Get the response as text first
    const responseText = await response.text();
    console.log(`Google login response text: ${responseText.substring(0, 150)}...`);
    
    // Then parse it as JSON if possible
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      throw new Error(`Google login failed: Server returned invalid JSON. Status: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Google login failed: Status ${response.status}`);
      }
      
      return data;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
}

export async function googleSignup(googleData) {
  console.log('Attempting Google signup with data:', googleData);
  try {
    // Make sure to use properly formatted URL and avoid double /api prefixes
    const endpoint = '/api/users/google';
    const formattedEndpoint = formatEndpoint(endpoint);
    const fullUrl = `${API_URL}${formattedEndpoint}`;
    
    console.log(`Making Google signup request to: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleData),
    });

    console.log(`Google signup response status: ${response.status}`);
    
    // Get the response as text first
    const responseText = await response.text();
    console.log(`Google signup response text: ${responseText.substring(0, 150)}...`);
    
    // Then parse it as JSON if possible
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      throw new Error(`Google signup failed: Server returned invalid JSON. Status: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Google signup failed: Status ${response.status}`);
      }
      
      return data;
  } catch (error) {
    console.error('Google signup error:', error);
    throw error;
  }
}

// Address management functions
export async function getUserAddresses() {
  return fetchApi('/api/users/addresses');
}

export async function addUserAddress(address) {
  return fetchApi('/api/users/addresses', {
    method: 'POST',
    body: JSON.stringify(address),
  });
}

export async function updateUserAddress(addressId, address) {
  return fetchApi(`/api/users/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(address),
  });
}

export async function deleteUserAddress(addressId) {
  return fetchApi(`/api/users/addresses/${addressId}`, {
    method: 'DELETE',
  });
}

export async function setDefaultAddress(addressId) {
  return fetchApi(`/api/users/addresses/${addressId}/default`, {
    method: 'PUT',
  });
}

// Payment method management functions
export async function getUserPaymentMethods() {
  return fetchApi('/api/users/payment-methods');
}

export async function addUserPaymentMethod(paymentMethod) {
  return fetchApi('/api/users/payment-methods', {
    method: 'POST',
    body: JSON.stringify(paymentMethod),
  });
}

export async function updateUserPaymentMethod(paymentMethodId, paymentMethod) {
  return fetchApi(`/api/users/payment-methods/${paymentMethodId}`, {
    method: 'PUT',
    body: JSON.stringify(paymentMethod),
  });
}

export async function deleteUserPaymentMethod(paymentMethodId) {
  return fetchApi(`/api/users/payment-methods/${paymentMethodId}`, {
    method: 'DELETE',
  });
}

export async function setDefaultPaymentMethod(paymentMethodId) {
  return fetchApi(`/api/users/payment-methods/${paymentMethodId}/default`, {
    method: 'PUT',
  });
}

// Cart functions with optimized implementation
export async function getUserCart() {
  try {
    // Get user ID from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      console.log('Skipping cart fetch - user not logged in');
      return [];
    }
    
    let userId;
    try {
      const userData = JSON.parse(userInfo);
      userId = userData._id;
      if (!userId) {
        console.log('Skipping cart fetch - no user ID found');
        return [];
      }
    } catch (error) {
      console.error('Error parsing user info from localStorage:', error);
      return [];
    }
    
    // Check cache first
    const cacheKey = 'user_cart';
    const cachedCart = apiCache.get(cacheKey);
    
    if (cachedCart && Date.now() < cachedCart.expiry) {
      console.log('Using cached cart data');
      return cachedCart.data;
    }
    
    // Skip API call if offline or if there have been too many recent errors
    const errorCacheKey = `${formatEndpoint('/api/users/cart')}_error_count`;
    const errorCount = parseInt(sessionStorage.getItem(errorCacheKey) || '0');
    if (errorCount >= 3 && navigator.onLine === false) {
      console.log('Offline or too many errors - using cached cart or empty array');
      return cachedCart?.data || [];
    }
    
    console.log('Fetching cart from server');
    const data = await fetchApi('/api/users/cart', {
      timeout: 3000 // Shorter timeout for cart requests
    });
    
    // Process the data to ensure it matches our frontend format
    const processedData = Array.isArray(data) ? data.map(item => ({
      id: item.productId,
      title: item.name || 'Product',
      price: typeof item.price === 'number' ? item.price : 0,
      image: item.image || '/placeholder.jpg',
      quantity: typeof item.quantity === 'number' ? item.quantity : 1
    })) : [];
    
    console.log('Received and processed cart data:', processedData);
    
    // Determine appropriate TTL based on cart size and contents
    const isEmpty = !processedData || !processedData.length;
    const ttl = isEmpty ? 30000 : 5000; // Longer TTL for empty carts
    
    // Cache the result with adaptive TTL
    apiCache.set(cacheKey, {
      data: processedData,
      expiry: Date.now() + ttl
    });
    
    return processedData;
  } catch (error) {
    // For cart errors, we want to fail gracefully
    console.error('Error fetching user cart:', error);
    
    // Return cached data if available, empty array otherwise
    const cachedCart = apiCache.get('user_cart');
    return cachedCart?.data || [];
  }
}

// Track last known cart state to enable differential updates
let lastKnownCartState = null;

export async function updateUserCart(cartItems) {
  try {
    // Skip update if cart is null or undefined
    if (!cartItems) {
      console.log('Skipping cart update - cart is null or undefined');
      return { success: false };
    }
    
    // Get user ID from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      console.log('Skipping cart update - user not logged in');
      return { success: false, error: 'User not logged in' };
    }
    
    // Ensure proper format for API
    const cartItemsArray = Array.isArray(cartItems) ? cartItems : [];
    
    // Format cart items correctly for the backend - ensure all required fields
    const formattedCartItems = cartItemsArray.map(item => {
      // Handle productId - ensure it's a string
      let productId = item.productId || item.id || 'unknown';
      if (typeof productId === 'object') {
        console.warn('productId is an object, converting to string:', productId);
        productId = String(productId._id || productId.id || 'unknown');
      }
      
      const formattedItem = {
        productId: String(productId), // Ensure it's a string
        name: item.name || item.title || 'Product',
        price: typeof item.price === 'number' ? item.price : 0,
        image: item.image || '/placeholder.jpg',
        quantity: typeof item.quantity === 'number' ? item.quantity : 1
      };
      
      // Ensure quantity is a number
      if (typeof formattedItem.quantity !== 'number') {
        formattedItem.quantity = 1;
      }
      
      // Ensure price is a number
      if (typeof formattedItem.price !== 'number') {
        formattedItem.price = 0;
      }
      
      return formattedItem;
    });
    
    console.log('Sending cart update with items:', formattedCartItems);
    
    // Perform the update
    const result = await fetchApi('/api/users/cart', {
      method: 'PUT',
      body: JSON.stringify({ cartItems: formattedCartItems })
    });
    
    return result;
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
}

// Order related functions
export async function listMyOrders() {
  try {
    console.log('Fetching user orders');
    return await fetchApi('/api/orders/myorders');
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function getOrderDetails(id) {
  try {
    return await fetchApi(`/api/orders/${id}`);
  } catch (error) {
    console.error(`Error fetching order details for ${id}:`, error);
    throw error;
  }
}

export async function createOrder(orderData) {
  return fetchApi('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

export async function payOrder(orderId, paymentResult) {
  return fetchApi(`/api/orders/${orderId}/pay`, {
    method: 'PUT',
    body: JSON.stringify(paymentResult),
  });
}

// Seller related functions
export async function getSellerProducts() {
  try {
    console.log('Fetching seller products');
    return await fetchApi('/api/products/seller');
  } catch (error) {
    console.error('Error fetching seller products:', error);
    throw error;
  }
}

export async function getSellerOrders() {
  try {
    console.log('Fetching seller orders');
    return await fetchApi('/api/sellers/orders');
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    throw error;
  }
}

export async function getSellerDashboardData() {
  try {
    console.log('Fetching seller dashboard data');
    return await fetchApi('/api/sellers/dashboard');
  } catch (error) {
    console.error('Error fetching seller dashboard data:', error);
    throw error;
  }
}

export async function getSellerSales(period = 'weekly') {
  try {
    console.log(`Fetching seller sales data for period: ${period}`);
    return await fetchApi(`/api/sellers/sales?period=${period}`);
  } catch (error) {
    console.error('Error fetching seller sales data:', error);
    throw error;
  }
} 