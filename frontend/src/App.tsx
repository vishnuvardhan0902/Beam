import React, { ReactNode, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import pages
import LandingPage from './pages/LandingPage';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';
import ProductEditor from './pages/ProductEditor';
import BecomeSeller from './pages/BecomeSeller';

// Import context providers
import { AuthContextProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Wrapper component
const ContextWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContextProvider>
        <CartProvider>{children}</CartProvider>
      </AuthContextProvider>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <ContextWrapper>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/become-seller" element={<BecomeSeller />} />
          
          {/* Seller Routes */}
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/product/new" element={<ProductEditor />} />
          <Route path="/seller/product/:id" element={<ProductEditor />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ContextWrapper>
  );
};

export default App;
