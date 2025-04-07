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

const API_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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
      const endpoint = credentials.googleId ? '/users/google' : '/users/login';
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
      const endpoint = userData.googleId ? '/users/google' : '/users';
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
          console.log('Adding authorization token to fetch request headers');
          headers['Authorization'] = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error('Error parsing user info from localStorage:', error);
      }
    }
    
    console.log(`Making API request to: ${API_URL}${endpoint}`);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

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
      console.warn('Received non-JSON response:', text);
      throw new Error('Received non-JSON response from server');
    }
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// User API calls
export const getUserProfile = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (!userInfo) {
    throw new Error('Not logged in');
  }
  
  return fetchApi('/users/profile');
};

export const updateUserProfile = async (userData) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (!userInfo) {
    throw new Error('Not logged in');
  }
  
  return fetchApi('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

// Product related functions
export async function getProducts(params = {}) {
  // Build query string from params
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return fetchApi(`/products${queryString}`);
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
  
  return fetchApi(`/products/${id}`);
}

export async function getTopProducts() {
  return fetchApi('/products/top');
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
    const endpoint = '/users/google-login';
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
    const endpoint = '/users/google';
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
  return fetchApi('/users/addresses');
}

export async function addUserAddress(address) {
  return fetchApi('/users/addresses', {
    method: 'POST',
    body: JSON.stringify(address),
  });
}

export async function updateUserAddress(addressId, address) {
  return fetchApi(`/users/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(address),
  });
}

export async function deleteUserAddress(addressId) {
  return fetchApi(`/users/addresses/${addressId}`, {
    method: 'DELETE',
  });
}

export async function setDefaultAddress(addressId) {
  return fetchApi(`/users/addresses/${addressId}/default`, {
    method: 'PUT',
  });
}

// Payment method management functions
export async function getUserPaymentMethods() {
  return fetchApi('/users/payment-methods');
}

export async function addUserPaymentMethod(paymentMethod) {
  return fetchApi('/users/payment-methods', {
    method: 'POST',
    body: JSON.stringify(paymentMethod),
  });
}

export async function updateUserPaymentMethod(paymentMethodId, paymentMethod) {
  return fetchApi(`/users/payment-methods/${paymentMethodId}`, {
    method: 'PUT',
    body: JSON.stringify(paymentMethod),
  });
}

export async function deleteUserPaymentMethod(paymentMethodId) {
  return fetchApi(`/users/payment-methods/${paymentMethodId}`, {
    method: 'DELETE',
  });
}

export async function setDefaultPaymentMethod(paymentMethodId) {
  return fetchApi(`/users/payment-methods/${paymentMethodId}/default`, {
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
    const errorCacheKey = `${formatEndpoint('/users/cart')}_error_count`;
    const errorCount = parseInt(sessionStorage.getItem(errorCacheKey) || '0');
    if (errorCount >= 3 && navigator.onLine === false) {
      console.log('Offline or too many errors - using cached cart or empty array');
      return cachedCart?.data || [];
    }
    
    console.log('Fetching cart from server');
    const data = await fetchApi('/users/cart', {
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
    const result = await fetchApi('/users/cart', {
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
  return fetchApi('/orders/myorders');
}

export async function getOrderDetails(id) {
  return fetchApi(`/orders/${id}`);
}

export async function createOrder(orderData) {
  return fetchApi('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

export async function payOrder(orderId, paymentResult) {
  return fetchApi(`/orders/${orderId}/pay`, {
    method: 'PUT',
    body: JSON.stringify(paymentResult),
  });
}

// Seller related functions
export async function getSellerProducts() {
  return fetchApi('/products/seller');
}

export async function getSellerOrders() {
  return fetchApi('/sellers/orders');
}

export async function getSellerDashboardData() {
  return fetchApi('/sellers/dashboard');
}

export async function getSellerSales(period = 'weekly') {
  return fetchApi(`/sellers/sales?period=${period}`);
} 