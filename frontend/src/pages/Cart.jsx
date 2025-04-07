import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateCartQuantity, loading } = useCart();

  // Calculate totals
  const itemsPrice = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = itemsPrice * 0.08;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handleQuantityChange = (id, quantity) => {
    updateCartQuantity(id, quantity);
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Helper function to safely format prices
  const formatPrice = (price) => {
    return (price || 0).toFixed(2);
  };

  return (
    <div>
      <Navbar />
      
      <div className="bg-gray-50 py-8 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-lg text-gray-600 mt-4 mb-6">Your cart is empty</p>
              <Link to="/products" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-medium">Cart Items ({cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)})</h2>
                    <span className="text-sm text-gray-500">Price</span>
                  </div>
                  
                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item.id} className="py-6 flex">
                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>
                        
                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>
                                <Link to={`/product/${item.id}`} className="hover:text-indigo-600">
                                  {item.title}
                                </Link>
                              </h3>
                              <p className="ml-4">${formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">${formatPrice(item.price)} each</p>
                          </div>
                          
                          <div className="flex-1 flex items-end justify-between text-sm">
                            <div className="flex items-center">
                              <label htmlFor={`quantity-${item.id}`} className="mr-2 text-gray-500">
                                Qty
                              </label>
                              <select
                                id={`quantity-${item.id}`}
                                value={item.quantity || 1}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                {[...Array(10).keys()].map((x) => (
                                  <option key={x + 1} value={x + 1}>
                                    {x + 1}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="flex">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-indigo-600 hover:text-indigo-500 flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                  <h2 className="text-lg font-medium mb-6">Order Summary</h2>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <p className="text-gray-600">Subtotal ({cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} items)</p>
                      <p className="font-medium">${formatPrice(itemsPrice)}</p>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <p className="text-gray-600">Shipping</p>
                      <p className="font-medium">{shippingPrice === 0 ? 'Free' : `$${formatPrice(shippingPrice)}`}</p>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <p className="text-gray-600">Tax</p>
                      <p className="font-medium">${formatPrice(taxPrice)}</p>
                    </div>
                    <div className="flex justify-between text-base font-medium mt-4 pt-4 border-t border-gray-200">
                      <p>Total</p>
                      <p>${formatPrice(totalPrice)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={cartItems.length === 0}
                      className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Link to="/products" className="text-sm text-indigo-600 hover:text-indigo-500 inline-flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart; 