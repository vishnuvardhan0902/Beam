import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Mock cart data
const initialCartItems = [
  {
    id: '1',
    title: 'Wireless Noise Cancelling Headphones',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop',
    quantity: 1,
  },
  {
    id: '3',
    title: 'Premium Laptop Stand',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2670&auto=format&fit=crop',
    quantity: 2,
  },
  {
    id: '7',
    title: 'Casual T-shirt',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=2574&auto=format&fit=crop',
    quantity: 1,
  },
];

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Calculate cart totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax - promoDiscount;

  // Item handlers
  const handleQuantityChange = (id: string, newQuantity: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Promo code handler
  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.toLowerCase() === 'discount20') {
      setPromoDiscount(subtotal * 0.2); // 20% discount
      setPromoApplied(true);
    } else {
      setPromoDiscount(0);
      setPromoApplied(false);
      alert('Invalid promo code');
    }
  };

  return (
    <div>
      <Navbar cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} />

      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item.id} className="p-6">
                        <div className="flex flex-col sm:flex-row">
                          {/* Product Image */}
                          <div className="sm:w-24 sm:h-24 flex-shrink-0 mb-4 sm:mb-0">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1 sm:ml-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-800">
                                  <Link to={`/product/${item.id}`} className="hover:text-indigo-600">
                                    {item.title}
                                  </Link>
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">Item #: {item.id}</p>
                              </div>
                              <div className="mt-2 sm:mt-0">
                                <p className="text-lg font-semibold text-gray-900">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  ${item.price.toFixed(2)} each
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center">
                                <label htmlFor={`quantity-${item.id}`} className="mr-2 text-sm text-gray-700">
                                  Qty:
                                </label>
                                <select
                                  id={`quantity-${item.id}`}
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                  className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <option key={num} value={num}>
                                      {num}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="mt-2 sm:mt-0 text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                              >
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

                <div className="mt-6 flex justify-between items-center">
                  <Link
                    to="/shop"
                    className="text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Continue Shopping
                  </Link>
                  <button
                    onClick={() => setCartItems([])}
                    className="text-red-600 hover:text-red-800"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="flow-root">
                    <dl className="-my-4 divide-y divide-gray-200">
                      <div className="py-4 flex justify-between">
                        <dt className="text-gray-600">Subtotal</dt>
                        <dd className="font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                      </div>
                      
                      <div className="py-4 flex justify-between">
                        <dt className="text-gray-600">Shipping</dt>
                        <dd className="font-medium text-gray-900">
                          {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                        </dd>
                      </div>
                      
                      <div className="py-4 flex justify-between">
                        <dt className="text-gray-600">Tax</dt>
                        <dd className="font-medium text-gray-900">${tax.toFixed(2)}</dd>
                      </div>
                      
                      {promoApplied && (
                        <div className="py-4 flex justify-between text-green-600">
                          <dt>Discount (20%)</dt>
                          <dd className="font-medium">-${promoDiscount.toFixed(2)}</dd>
                        </div>
                      )}
                      
                      <div className="py-4 flex justify-between">
                        <dt className="text-lg font-bold text-gray-900">Total</dt>
                        <dd className="text-lg font-bold text-gray-900">${total.toFixed(2)}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  {/* Promo Code Form */}
                  <form onSubmit={handlePromoSubmit} className="mt-6">
                    <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 mb-2">
                      Promo Code
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="promo-code"
                        className="flex-1 block border border-gray-300 rounded-l-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Try "DISCOUNT20" for 20% off</p>
                  </form>
                  
                  <div className="mt-6">
                    <Link
                      to="/checkout"
                      className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-center rounded-md"
                    >
                      Proceed to Checkout
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h2>
              <p className="mt-1 text-sm text-gray-500">
                Looks like you haven't added any items to your cart yet.
              </p>
              <div className="mt-6">
                <Link
                  to="/shop"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Start Shopping
                </Link>
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