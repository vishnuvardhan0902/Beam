import React, { createContext, useState, useContext, useEffect } from 'react';
import ApiService from '../services/api';
import { signInWithGoogle } from '../config/firebase';

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);

  // Check if token is expired
  const isTokenExpired = () => {
    if (!tokenExpiry) return false;
    // Add a 5-minute buffer to prevent edge cases
    return new Date(tokenExpiry).getTime() - 300000 < new Date().getTime();
  };

  // Set token expiry date based on JWT expiry (30 days from current time)
  const setExpiryFromNow = () => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    setTokenExpiry(expiry.toISOString());
    localStorage.setItem('tokenExpiry', expiry.toISOString());
  };

  // Check if user is logged in on initial load
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    const savedTokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        console.log('Loading user from localStorage:', parsedUser.name);
        setUser(parsedUser);
        
        // Set token expiry if available or set a new one
        if (savedTokenExpiry) {
          setTokenExpiry(savedTokenExpiry);
        } else {
          setExpiryFromNow();
        }
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('tokenExpiry');
      }
    }
    setLoading(false);
  }, []);

  // Login with email and password
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting login with:', { email });
      const userData = await ApiService.login({ email, password });
      console.log('Login successful:', userData);
      setUser(userData);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setExpiryFromNow();
      return userData;
    } catch (err) {
      console.error('Login error in AuthContext:', err);
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const googleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get Google credentials
      const googleData = await signInWithGoogle();
      console.log('Google login data:', googleData);
      
      // Send to backend for authentication
      const userData = await ApiService.login(googleData);
      setUser(userData);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setExpiryFromNow();
      return userData;
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || 'Google login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register with email and password
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting registration with:', { name: userData.name, email: userData.email });
      const newUser = await ApiService.register(userData);
      console.log('Registration successful:', newUser);
      setUser(newUser);
      localStorage.setItem('userInfo', JSON.stringify(newUser));
      setExpiryFromNow();
      return newUser;
    } catch (err) {
      console.error('Registration error in AuthContext:', err);
      setError(err.message || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register with Google
  const googleSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get Google credentials
      const googleData = await signInWithGoogle();
      console.log('Google signup data:', googleData);
      
      // Send to backend for registration
      const userData = await ApiService.register(googleData);
      setUser(userData);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setExpiryFromNow();
      return userData;
    } catch (err) {
      console.error('Google signup error:', err);
      setError(err.message || 'Google signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    // Clear user state
    setUser(null);
    setTokenExpiry(null);
    
    // Clear all user-related data from localStorage
    localStorage.removeItem('userInfo');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    
    // Clear any pending cart items
    sessionStorage.removeItem('pendingCartItem');
    sessionStorage.removeItem('redirectAfterLogin');
    
    // Clear socket connection if it exists
    if (window.socket) {
      window.socket.disconnect();
      window.socket = null;
    }
  };

  // Update user state
  const updateUserState = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setExpiryFromNow();
    }
  };

  // Helper function to check if user is a seller
  const isSeller = user?.isSeller || false;

  // Helper function to check if user is an admin
  const isAdmin = user?.isAdmin || false;
  
  // Check if user is authenticated
  const isAuthenticated = !!user && !isTokenExpired();

  const value = {
    user,
    loading,
    error,
    login,
    googleLogin,
    register,
    googleSignup,
    logout,
    updateUserState,
    isSeller,
    isAdmin,
    isAuthenticated,
    isTokenExpired
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 