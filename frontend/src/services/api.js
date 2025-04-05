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
    const token = localStorage.getItem('userToken');
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
    localStorage.setItem('userToken', data.token);
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
    localStorage.setItem('userToken', data.token);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const register = async (name, email, password) => {
  try {
    const { data } = await api.post('/users', { name, email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    localStorage.setItem('userToken', data.token);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const logout = () => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('userToken');
  localStorage.removeItem('cartItems');
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
export const addToCart = async (id, qty, color) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    const item = {
      product: data._id,
      name: data.name,
      image: data.images[0],
      price: data.price,
      countInStock: data.countInStock,
      qty,
      color,
    };

    // Store cart data in localStorage
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    // Check if item already exists in cart
    const existItem = cartItems.find(x => x.product === item.product && x.color === item.color);
    
    if (existItem) {
      // Update existing item
      const updatedCartItems = cartItems.map(x => 
        x.product === existItem.product && x.color === existItem.color ? item : x
      );
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
      return updatedCartItems;
    } else {
      // Add new item
      const updatedCartItems = [...cartItems, item];
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
      return updatedCartItems;
    }
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const removeFromCart = (id, color) => {
  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
  const updatedCartItems = cartItems.filter(x => !(x.product === id && x.color === color));
  localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
  return updatedCartItems;
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