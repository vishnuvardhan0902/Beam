import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import NotFound from './pages/NotFound';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import BecomeSeller from './pages/BecomeSeller';
import SellerDashboard from './pages/SellerDashboard';
import ProductEditor from './pages/ProductEditor';
import LandingPage from './pages/LandingPage';
import Products from './pages/Products';
import Shop from './pages/Shop';

const App = () => {
  // Add debug logging
  useEffect(() => {
    console.log('App component mounted');
    const token = localStorage.getItem('userToken');
    const userInfo = localStorage.getItem('userInfo');
    console.log('User data in localStorage:', {
      hasToken: !!token,
      hasUserInfo: !!userInfo,
    });
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        console.log('User in localStorage:', userData.name);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order/:id" element={<OrderDetail />} />
            <Route path="/become-seller" element={<BecomeSeller />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/products/add" element={<ProductEditor />} />
            <Route path="/seller/products/edit/:id" element={<ProductEditor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
