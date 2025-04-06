import axios from 'axios';

// Create an axios instance with base URL and default headers
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API service functions

// Products
export const getProducts = async (params = {}) => {
  try {
    const { keyword = '', pageNumber = '', limit = 10, category = '' } = params;
    const queryParams = new URLSearchParams();
    
    if (keyword) queryParams.append('keyword', keyword);
    if (pageNumber) queryParams.append('pageNumber', pageNumber);
    if (limit) queryParams.append('limit', limit);
    if (category) queryParams.append('category', category);
    
    const { data } = await api.get(`/products?${queryParams.toString()}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getProductDetails = async (id) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getTopProducts = async () => {
  try {
    const { data } = await api.get('/products/top');
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// Auth
export const login = async (email, password) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    return data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Login failed';
    throw new Error(message);
  }
};

export const googleLogin = async (googleData) => {
  try {
    // Log the data being sent
    console.log('Sending Google data to backend:', googleData);
    
    const { data } = await api.post('/users/google', {
      googleId: googleData.googleId,
      email: googleData.email,
      name: googleData.name,
      avatar: googleData.avatar,
    });
    
    console.log('Received response from backend:', data);
    
    if (data.token) {
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    return data;
  } catch (error) {
    console.error('Google auth API error:', error);
    const message = error.response?.data?.message || error.message || 'Google login failed';
    throw new Error(message);
  }
};

export const register = async (name, email, password) => {
  try {
    const { data } = await api.post('/auth/register', { name, email, password });
    if (data.token) {
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    return data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Registration failed';
    throw new Error(message);
  }
};

export const logout = () => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
  // Don't clear cart items on logout as we want them to persist
  // localStorage.removeItem('cartItems');
  localStorage.removeItem('shippingAddress');
  localStorage.removeItem('paymentMethod');
};

export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping profile fetch');
      return null;
    }
    const { data } = await api.get('/users/profile');
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (user) => {
  try {
    const { data } = await api.put('/users/profile', user);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// Addresses
export const getUserAddresses = async () => {
  try {
    const { data } = await api.get('/users/addresses');
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const addUserAddress = async (address) => {
  try {
    const { data } = await api.post('/users/addresses', address);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateUserAddress = async (addressId, address) => {
  try {
    const { data } = await api.put(`/users/addresses/${addressId}`, address);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const deleteUserAddress = async (addressId) => {
  try {
    const { data } = await api.delete(`/users/addresses/${addressId}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const setDefaultAddress = async (addressId) => {
  try {
    const { data } = await api.put(`/users/addresses/${addressId}/default`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// Payment Methods
export const getUserPaymentMethods = async () => {
  try {
    const { data } = await api.get('/users/payment-methods');
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const addUserPaymentMethod = async (paymentMethod) => {
  try {
    const { data } = await api.post('/users/payment-methods', paymentMethod);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateUserPaymentMethod = async (paymentMethodId, paymentMethod) => {
  try {
    const { data } = await api.put(`/users/payment-methods/${paymentMethodId}`, paymentMethod);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const deleteUserPaymentMethod = async (paymentMethodId) => {
  try {
    const { data } = await api.delete(`/users/payment-methods/${paymentMethodId}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const setDefaultPaymentMethod = async (paymentMethodId) => {
  try {
    const { data } = await api.put(`/users/payment-methods/${paymentMethodId}/default`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// Cart
export const updateUserCart = async (cartItems) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping cart update');
      return [];
    }

    const { data } = await api.put('/users/profile', { 
      cart: cartItems 
    });
    return data.cart || [];
  } catch (error) {
    console.error('Error updating cart:', error);
    // Don't throw the error, just log it and return empty array
    // This prevents the app from crashing when there are auth issues
    return [];
  }
};

// Get user cart safely
export const getUserCart = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping cart fetch');
      return [];
    }
    
    const { data } = await api.get('/users/profile');
    return data.cart || [];
  } catch (error) {
    console.error('Error fetching user cart:', error);
    // Don't throw the error, just log it and return empty array
    return [];
  }
};

// Orders
export const createOrder = async (order) => {
  try {
    // Ensure all required fields are present
    const processedOrder = {
      ...order,
      orderItems: order.orderItems.map(item => ({
        ...item,
        // Ensure required fields exist
        qty: item.qty || item.quantity || 1,
        color: item.color || 'default'
      }))
    };
    
    const { data } = await api.post('/orders', processedOrder);
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error.response?.data?.message || error.message;
  }
};

export const getOrderDetails = async (id) => {
  try {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const payOrder = async (orderId, paymentResult) => {
  try {
    const { data } = await api.put(`/orders/${orderId}/pay`, paymentResult);
    console.log('Order marked as paid:', data);
    return data;
  } catch (error) {
    console.error('Error marking order as paid:', error);
    throw error.response?.data?.message || error.message;
  }
};

export const listMyOrders = async () => {
  try {
    const { data } = await api.get('/orders/myorders');
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// Seller API functions
export const getSellerProducts = async () => {
  try {
    const { data } = await api.get('/products/seller');
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const createProduct = async (productData) => {
  try {
    const { data } = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const { data } = await api.put(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const deleteProduct = async (id) => {
  try {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getSellerOrders = async () => {
  try {
    const { data } = await api.get('/orders/seller');
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getSellerDashboardData = async () => {
  try {
    const { data } = await api.get('/sellers/dashboard');
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getSellerSales = async (period = 'monthly') => {
  try {
    const { data } = await api.get(`/sellers/sales?period=${period}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getSellerSalesHistory = async (page = 1, limit = 50) => {
  try {
    const { data } = await api.get(`/sellers/sales-history?page=${page}&limit=${limit}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// Get optimized price recommendation from Gemini API
export const getOptimizedPrice = async (productDetails) => {
  try {
    const geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";
    const geminiApiKey = "AIzaSyC_uXWIh-_J0xOZq9MGtS9pMy5a0zEZXNo";
    
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Based on the following product details, recommend an optimized price in USD that would be competitive in the market while maximizing profit potential. Format your response as a number only (e.g., 49.99).

Product name: ${productDetails.name}
Category: ${productDetails.category}
Brand: ${productDetails.brand}
Description: ${productDetails.description}
Features: ${productDetails.features.join(', ')}
Stock quantity: ${productDetails.countInStock}
Current suggested price: ${productDetails.price || 0}
`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 100
      }
    };

    console.log('Sending request to Gemini API:', payload);
    
    const response = await fetch(`${geminiEndpoint}${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log('Gemini API response:', data);
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const priceText = data.candidates[0].content.parts[0].text.trim();
      
      // Try to extract just the number from the response
      const priceMatch = priceText.match(/\$?(\d+\.?\d*)/);
      if (priceMatch && priceMatch[1]) {
        return parseFloat(priceMatch[1]);
      }
      
      // If we can't extract a number pattern, try to parse the whole response
      const parsedPrice = parseFloat(priceText);
      if (!isNaN(parsedPrice)) {
        return parsedPrice;
      }
      
      // If all else fails, return the original price
      console.log('Could not extract price from Gemini response');
      return productDetails.price || 0;
    } else {
      console.error('Invalid response from Gemini API');
      return productDetails.price || 0;
    }
  } catch (error) {
    console.error('Error getting optimized price:', error);
    return productDetails.price || 0; // Return original price on error
  }
};

export default api; 