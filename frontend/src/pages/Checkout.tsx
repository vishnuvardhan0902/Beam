import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { createRazorpayOrder, initializeRazorpayPayment, isRazorpayLoaded } from '../services/razorpay';
import { useAuth } from '../context/AuthContext';

// Mock cart data (in a real app, this would come from a cart context/state)
const cartItems = [
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
];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');
  
  // Payment states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Calculate order totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10.99;
  const tax = subtotal * 0.08; // 8% tax
  const rawTotal = subtotal + shipping + tax;
  const discount = rawTotal - 1; // Discount to make total 1 rupee when converted to INR
  const total = 1; // Set final total to 1 rupee (for Razorpay testing)

  // Check if Razorpay is loaded
  useEffect(() => {
    if (!isRazorpayLoaded()) {
      console.warn('Razorpay script not loaded. Please check your internet connection.');
    }
  }, []);

  // Handle shipping form submission
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  // Handle direct Razorpay payment
  const handleDirectRazorpayPayment = () => {
    if (!isRazorpayLoaded()) {
      console.error('Razorpay script not loaded');
      alert('Payment gateway is not available. Please try again later.');
      return;
    }

    setIsProcessing(true);
    
    // Using Razorpay directly with 1 rupee total
    const options = {
      key: 'rzp_test_Bv9HsrboraxaMb',
      amount: 100, // 1 rupee = 100 paise
      currency: 'INR',
      name: 'Beam',
      description: `Order for ${cartItems.length} items`,
      handler: function(response: any) {
        console.log("Payment successful:", response);
        // Generate a local order ID
        const localOrderId = 'order_' + Math.random().toString(36).substring(2, 9).toUpperCase();
        setOrderId(localOrderId);
        setIsProcessing(false);
        setIsOrderComplete(true);
      },
      prefill: {
        name: `${firstName} ${lastName}`,
        email: email,
        contact: '',
      },
      theme: {
        color: '#4F46E5',
      }
    };

    try {
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Error opening Razorpay:", err);
      setIsProcessing(false);
      alert('There was an error opening the payment gateway. Please try again.');
    }
  };

  // Handle payment form submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    if (paymentMethod === 'razorpay') {
      try {
        if (!isRazorpayLoaded()) {
          throw new Error('Razorpay is not available. Please try another payment method.');
        }
        
        // Use direct checkout for simplicity
        handleDirectRazorpayPayment();
      } catch (error) {
        console.error('Payment failed:', error);
        setIsProcessing(false);
        alert('Payment failed. Please try again.');
      }
    } else {
      // Original card payment code (simulation)
      setTimeout(() => {
        const randomOrderId = Math.random().toString(36).substring(2, 9).toUpperCase();
        setOrderId(randomOrderId);
        setIsProcessing(false);
        setIsOrderComplete(true);
      }, 2000);
    }
  };

  // Handle continuing shopping after order
  const handleContinueShopping = () => {
    navigate('/');
  };

  return (
    <div>
      <Navbar />
      
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Order Complete Page */}
          {isOrderComplete ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-2xl font-bold mt-4">Order Complete!</h2>
              <p className="mt-2 text-gray-600">Thank you for your purchase. Your order has been placed successfully.</p>
              <p className="mt-1 text-gray-500">Your order number is: <span className="font-medium">{orderId}</span></p>
              <p className="mt-1 text-gray-500">We've sent a confirmation email to {email}</p>
              
              <div className="mt-8 flex justify-center space-x-4">
                <button
                  onClick={handleContinueShopping}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Continue Shopping
                </button>
                <Link 
                  to="/orders" 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  View My Orders
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Checkout Steps */}
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
              
              <div className="flex items-center mb-8">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full text-white">
                  1
                </div>
                <div className={`h-1 flex-1 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  {/* Shipping Information */}
                  {currentStep === 1 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-lg font-medium mb-6">Shipping Information</h2>
                      
                      <form onSubmit={handleShippingSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              id="firstName"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              id="lastName"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          
                          <div className="sm:col-span-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          
                          <div className="sm:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <input
                              type="text"
                              id="address"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              id="city"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                              State / Province
                            </label>
                            <input
                              type="text"
                              id="state"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                              ZIP / Postal Code
                            </label>
                            <input
                              type="text"
                              id="zip"
                              value={zip}
                              onChange={(e) => setZip(e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                              Country
                            </label>
                            <select
                              id="country"
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="United States">United States</option>
                              <option value="Canada">Canada</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="Australia">Australia</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end">
                          <Link 
                            to="/cart" 
                            className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            Back to Cart
                          </Link>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          >
                            Continue to Payment
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  {/* Payment Information */}
                  {currentStep === 2 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-lg font-medium mb-6">Payment Information</h2>
                      
                      <form onSubmit={handlePaymentSubmit}>
                        <div className="mb-6">
                          <p className="flex items-center text-sm text-gray-700">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            All transactions are secure and encrypted
                          </p>
                        </div>
                        
                        <div className="mb-6 space-y-4">
                          {/* Credit Card Option */}
                          <div className="flex items-center space-x-3">
                            <input
                              id="card"
                              name="paymentMethod"
                              type="radio"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                              checked={paymentMethod === 'card'}
                              onChange={() => setPaymentMethod('card')}
                            />
                            <label htmlFor="card" className="text-sm font-medium text-gray-700">
                              Credit / Debit Card
                            </label>
                          </div>
                          
                          {/* Razorpay Option */}
                          <div className="flex items-center space-x-3">
                            <input
                              id="razorpay"
                              name="paymentMethod"
                              type="radio"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                              checked={paymentMethod === 'razorpay'}
                              onChange={() => setPaymentMethod('razorpay')}
                            />
                            <label htmlFor="razorpay" className="text-sm font-medium text-gray-700 flex items-center">
                              Razorpay
                              <img src="https://razorpay.com/assets/razorpay-logo-white.svg" alt="Razorpay" className="h-6 ml-2 bg-indigo-600 p-1 rounded" />
                            </label>
                          </div>
                        </div>
                        
                        {/* Show card form only if card payment method is selected */}
                        {paymentMethod === 'card' && (
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                                Cardholder Name
                              </label>
                              <input
                                type="text"
                                id="cardName"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Card Number
                              </label>
                              <input
                                type="text"
                                id="cardNumber"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                placeholder="1234 5678 9012 3456"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label htmlFor="expMonth" className="block text-sm font-medium text-gray-700 mb-1">
                                  Exp. Month
                                </label>
                                <select
                                  id="expMonth"
                                  value={expMonth}
                                  onChange={(e) => setExpMonth(e.target.value)}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                  <option value="">Month</option>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i} value={String(i + 1).padStart(2, '0')}>
                                      {String(i + 1).padStart(2, '0')}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label htmlFor="expYear" className="block text-sm font-medium text-gray-700 mb-1">
                                  Exp. Year
                                </label>
                                <select
                                  id="expYear"
                                  value={expYear}
                                  onChange={(e) => setExpYear(e.target.value)}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                  <option value="">Year</option>
                                  {Array.from({ length: 10 }, (_, i) => (
                                    <option key={i} value={String(new Date().getFullYear() + i)}>
                                      {new Date().getFullYear() + i}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                                  CVV
                                </label>
                                <input
                                  type="text"
                                  id="cvv"
                                  value={cvv}
                                  onChange={(e) => setCvv(e.target.value)}
                                  placeholder="123"
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {paymentMethod === 'razorpay' && (
                          <div className="p-4 bg-indigo-50 rounded-md mb-4">
                            <p className="text-sm text-indigo-700">
                              You will be redirected to Razorpay's secure payment gateway to complete your payment.
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-8 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={isProcessing}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </span>
                            ) : (
                              'Place Order'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
                
                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-medium mb-6">Order Summary</h2>
                    
                    <div className="mb-6">
                      <ul className="divide-y divide-gray-200">
                        {cartItems.map((item) => (
                          <li key={item.id} className="py-4 flex">
                            <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-center object-cover"
                              />
                            </div>
                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3 className="text-sm">{item.title}</h3>
                                  <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <p className="text-gray-600">Subtotal</p>
                        <p className="font-medium">${subtotal.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <p className="text-gray-600">Shipping</p>
                        <p className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</p>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <p className="text-gray-600">Tax</p>
                        <p className="font-medium">${tax.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between text-sm mb-2 text-red-600">
                        <p className="font-medium">Special Discount</p>
                        <p className="font-medium">-${discount.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between text-base font-medium mt-4 pt-4 border-t border-gray-200">
                        <p>Total</p>
                        <p>₹{total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout; 