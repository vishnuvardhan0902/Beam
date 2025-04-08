import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchBarWrapper from './SearchBarWrapper';
import { useAuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

// Add a CSS keyframes animation to the stylesheet
const pulseAnimation = `
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
  }
  
  70% {
    transform: scale(1.2);
    box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
  }
  
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}
`;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const profileButtonRef = useRef(null);
  const prevItemCount = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get auth and cart state
  const { user, logout } = useAuthContext();
  const { cartItems } = useCart();
  
  // Get seller status
  const isSeller = user?.isSeller || false;

  // Calculate item count from cart items
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger pulse animation when item count changes
  useEffect(() => {
    if (prevItemCount.current !== itemCount && prevItemCount.current !== 0) {
      setIsPulsing(true);
      const timer = setTimeout(() => {
        setIsPulsing(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
    prevItemCount.current = itemCount;
  }, [itemCount]);

  // Desktop cart icon badge with conditional animation
  const cartBadgeClass = isPulsing 
    ? "absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md transition-all duration-200 ease-in-out group-hover:bg-indigo-700"
    : "absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm transition-all duration-200 ease-in-out group-hover:bg-indigo-700";

  const pulseStyle = isPulsing ? { animation: 'pulse 1s' } : {};

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        profileButtonRef.current && 
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Create a style element to add the animation to the document
  useEffect(() => {
    // Add the animation styles to the document
    const styleEl = document.createElement('style');
    styleEl.textContent = pulseAnimation;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Add logging for debugging
  useEffect(() => {
    console.log('Navbar component - Authentication state:', { 
      user: user ? user.name : 'null',
      cartItemsCount: cartItems.length
    });
    
    // Check localStorage directly for comparison
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const localUser = JSON.parse(userInfo);
        console.log('User from localStorage:', localUser.name);
      } catch (err) {
        console.error('Error parsing localStorage user:', err);
      }
    }
  }, [user, cartItems]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">Beam</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link 
              to="/products" 
              className={`text-sm font-medium transition-colors duration-200 ${
                location.pathname === '/products' 
                  ? 'text-indigo-600' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              Products
            </Link>
            <Link 
              to="/cart" 
              className={`text-sm font-medium transition-colors duration-200 ${
                location.pathname === '/cart' 
                  ? 'text-indigo-600' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              Cart
            </Link>
            {user && (
              <Link 
                to="/orders" 
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === '/orders' 
                    ? 'text-indigo-600' 
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                Orders
              </Link>
            )}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block md:flex-1 md:max-w-md md:mx-8">
            <SearchBarWrapper />
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200">
              <FiShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className={cartBadgeClass} style={pulseStyle}>
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User is authenticated - show profile dropdown */}
            {user ? (
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={toggleDropdown}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Orders
                    </Link>
                    {isSeller ? (
                      <Link
                        to="/seller/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Seller Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/become-seller"
                        className="block px-4 py-2 text-sm text-indigo-600 font-medium hover:bg-gray-100"
                      >
                        Become a Seller
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* User not authenticated - show login/register buttons */
              <div className="hidden md:flex md:items-center md:space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <div className="mb-4">
              <SearchBarWrapper />
            </div>
            <Link
              to="/products"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/products'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              Products
            </Link>
            <Link
              to="/cart"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/cart'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              Cart
            </Link>
            {user ? (
              /* Show authenticated user options in mobile menu */
              <>
                <Link
                  to="/orders"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/orders'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                  }`}
                >
                  Orders
                </Link>
                <Link
                  to="/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/profile'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                  }`}
                >
                  Profile
                </Link>
                {isSeller && (
                  <Link
                    to="/seller/dashboard"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname.startsWith('/seller')
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                    }`}
                  >
                    Seller Dashboard
                  </Link>
                )}
                {!isSeller && (
                  <Link
                    to="/become-seller"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-indigo-50 text-indigo-600"
                  >
                    Become a Seller
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                >
                  Sign out
                </button>
              </>
            ) : (
              /* Show login/register options in mobile menu */
              <>
                <Link
                  to="/login"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/login'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/register'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;