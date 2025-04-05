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
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API service functions

// Products
export const getProducts = async (keyword = '', pageNumber = '') => {
  try {
    const { data } = await api.get(`/products?keyword=${keyword}&pageNumber=${pageNumber}`);
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
    const { data } = await api.post('/users/login', { email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const googleLogin = async (googleData) => {
  try {
    const { data } = await api.post('/users/google', {
      googleId: googleData.googleId || googleData.uid,
      email: googleData.email,
      name: googleData.displayName || googleData.name,
      avatar: googleData.photoURL || googleData.avatar,
    });
    localStorage.setItem('userInfo', JSON.stringify(data));
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const register = async (name, email, password) => {
  try {
    const { data } = await api.post('/users', { name, email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const logout = () => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('token');
  // Don't clear cart items on logout as we want them to persist
  // localStorage.removeItem('cartItems');
  localStorage.removeItem('shippingAddress');
  localStorage.removeItem('paymentMethod');
};

export const getUserProfile = async () => {
  try {
    const { data } = await api.get('/users/profile');
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
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

// Cart
export const updateUserCart = async (cartItems) => {
  try {
    const { data } = await api.put('/users/cart', { cartItems });
    return data;
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error.response?.data?.message || error.message;
  }
};

export const getUserCart = async () => {
  try {
    const { data } = await api.get('/users/profile');
    return data.cart || [];
  } catch (error) {
    console.error('Error fetching user cart:', error);
    throw error.response?.data?.message || error.message;
  }
};

// Orders
export const createOrder = async (order) => {
  try {
    const { data } = await api.post('/orders', order);
    return data;
  } catch (error) {
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
    return data;
  } catch (error) {
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

export default api; 