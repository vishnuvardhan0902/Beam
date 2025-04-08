import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateCartQuantity, loading } = useCart();
  const { user } = useAuthContext();
  const [removingItemId, setRemovingItemId] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const previousCartRef = useRef([]);
  
  // Calculate totals
  const itemsPrice = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = itemsPrice * 0.08;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // Handle initial loading state
  useEffect(() => {
    // Set a timeout for the initial loading state to prevent flashing
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Effect to show notification when cart is updated via WebSocket
  useEffect(() => {
    // Check if cart has changed
    if (previousCartRef.current.length > 0 && JSON.stringify(previousCartRef.current) !== JSON.stringify(cartItems)) {
      // Check if it's a remote update (item count changed)
      const prevCount = previousCartRef.current.reduce((count, item) => count + item.quantity, 0);
      const currentCount = cartItems.reduce((count, item) => count + item.quantity, 0);
      
      // If the item count changed and we didn't have a loading or removal state
      if (prevCount !== currentCount && !loading && !removingItemId && !updatingItemId) {
        if (currentCount > prevCount) {
          toast.info('Cart updated from another device - item added', {
            position: 'bottom-right',
            autoClose: 3000
          });
        } else if (currentCount < prevCount) {
          toast.info('Cart updated from another device - item removed', {
            position: 'bottom-right',
            autoClose: 3000
          });
        }
      }
    }
    
    // Update the ref with the current cart items
    previousCartRef.current = [...cartItems];
  }, [cartItems, loading, removingItemId, updatingItemId]);

  // Combined loading state
  const isLoading = loading || localLoading;

  const handleQuantityChange = async (id, newQuantity) => {
    try {
      setUpdatingItemId(id);
      await updateCartQuantity(id, newQuantity);
    } catch (error) {
      toast.error('Could not update quantity');
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (id, title) => {
    try {
      setRemovingItemId(id);
      await removeFromCart(id);
      toast.info(`${title} removed from cart`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error('Could not remove item');
      console.error('Error removing item:', error);
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.info('Please log in to checkout', {
        position: "bottom-right",
        autoClose: 3000,
      });
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  // Helper function to safely format prices
  const formatPrice = (price) => {
    return (price || 0).toFixed(2);
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Loading your cart...</p>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-lg shadow-sm text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
              <Link to="/products" className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm inline-flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              {/* Cart Items */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-8"
              >
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Cart Items ({cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)})
                    </h2>
                  </div>
                  
                  <ul className="divide-y divide-gray-200">
                    <AnimatePresence>
                      {cartItems.map((item) => (
                        <motion.li 
                          key={item.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 py-6"
                        >
                          <div className="flex flex-col sm:flex-row">
                            <div className="flex-shrink-0 w-full sm:w-32 h-32 bg-gray-100 rounded-md overflow-hidden mb-4 sm:mb-0">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-center object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/300';
                                }}
                              />
                            </div>
                            
                            <div className="flex-1 sm:ml-6 flex flex-col">
                              <div className="flex justify-between">
                                <h3 className="text-base font-medium text-gray-900 mb-1 max-w-xs">
                                  <Link 
                                    to={`/product/${item.id}`} 
                                    className="hover:text-indigo-600 transition-colors inline-block"
                                    title={item.title}
                                  >
                                    {truncateText(item.title, 50)}
                                  </Link>
                                </h3>
                                <p className="ml-4 text-base font-medium text-gray-900 whitespace-nowrap">
                                  ${formatPrice((item.price || 0) * (item.quantity || 1))}
                                </p>
                              </div>
                              
                              <p className="text-sm text-gray-500 mb-4">${formatPrice(item.price)} each</p>
                              
                              <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center mb-4 sm:mb-0">
                                  <span className="mr-3 text-sm text-gray-700">Quantity:</span>
                                  <div className="flex items-center border border-gray-300 rounded-md">
                                    <button
                                      type="button"
                                      disabled={item.quantity <= 1 || updatingItemId === item.id}
                                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                      className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                                      </svg>
                                    </button>
                                    <span className="px-2 py-1 text-gray-700 w-8 text-center">
                                      {updatingItemId === item.id ? (
                                        <div className="w-4 h-4 mx-auto border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
                                      ) : (
                                        item.quantity
                                      )}
                                    </span>
                                    <button
                                      type="button"
                                      disabled={item.quantity >= 10 || updatingItemId === item.id}
                                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                      className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id, item.title)}
                                  disabled={removingItemId === item.id}
                                  className="inline-flex items-center text-sm text-red-600 hover:text-red-800 transition-colors"
                                >
                                  {removingItemId === item.id ? (
                                    <>
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Removing...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      Remove
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                  
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <Link to="/products" className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center transition-colors">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </motion.div>
              
              {/* Cart Summary */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="lg:col-span-4 mt-8 lg:mt-0"
              >
                <div className="bg-white rounded-lg shadow-sm sticky top-8">
                  <div className="px-6 py-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                  </div>
                  
                  <div className="px-6 py-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-600">Subtotal</p>
                      <p className="font-medium">${formatPrice(itemsPrice)}</p>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-600">Shipping</p>
                      <p className="font-medium">
                        {shippingPrice === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `$${formatPrice(shippingPrice)}`
                        )}
                      </p>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-600">Tax (8%)</p>
                      <p className="font-medium">${formatPrice(taxPrice)}</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 flex justify-between">
                      <p className="text-base font-semibold text-gray-900">Total</p>
                      <p className="text-base font-semibold text-gray-900">${formatPrice(totalPrice)}</p>
                    </div>
                  </div>
                  
                  <div className="px-6 py-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={cartItems.length === 0}
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      Proceed to Checkout
                    </button>
                    
                    {cartItems.length > 0 && shippingPrice > 0 && (
                      <p className="mt-2 text-xs text-center text-gray-500">
                        Add ${formatPrice(100 - itemsPrice)} more to get free shipping
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart; 