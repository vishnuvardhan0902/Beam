import React, { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Mock user data
const mockUser = {
  id: 'usr_12345',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '+1 (555) 123-4567',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2670&auto=format&fit=crop',
  memberSince: '2022-03-15',
};

// Mock addresses
const mockAddresses = [
  {
    id: 'addr_1',
    type: 'Home',
    default: true,
    name: 'Alex Johnson',
    street: '123 Main Street',
    apt: 'Apt 4B',
    city: 'San Francisco',
    state: 'CA',
    zip: '94103',
    country: 'United States',
    phone: '+1 (555) 123-4567',
  },
  {
    id: 'addr_2',
    type: 'Work',
    default: false,
    name: 'Alex Johnson',
    street: '456 Market Street',
    apt: 'Suite 10',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'United States',
    phone: '+1 (555) 987-6543',
  },
];

// Mock payment methods
const mockPaymentMethods = [
  {
    id: 'pm_1',
    type: 'credit_card',
    default: true,
    brand: 'Visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2025,
  },
  {
    id: 'pm_2',
    type: 'credit_card',
    default: false,
    brand: 'Mastercard',
    last4: '5678',
    expMonth: 8,
    expYear: 2024,
  },
];

// Profile tabs
type TabType = 'account' | 'addresses' | 'payment' | 'orders' | 'wishlist';

interface UserData {
  name: string;
  email: string;
  password?: string;
}

const Profile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);
  
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setName(value);
    } else if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      const userData: UserData = {
        name,
        email,
        ...(password && { password }),
      };
      
      await updateUserProfile(userData);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
      setLoading(false);
    } catch (err: any) {
      setError(err.toString());
      setLoading(false);
    }
  };

  // Helper function to render the card icon based on brand
  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return (
          <svg className="h-8 w-12" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="24" rx="2" fill="#E6E6E6"/>
            <path d="M15 17H12L9 7H12L15 17Z" fill="#1434CB"/>
            <path d="M24 7C22.6 7 21.5 7.5 21.5 8.5C21.5 9.8 23.4 10 23.4 11.3C23.4 12 22.8 12.5 22 12.5C21 12.5 20.4 12 20.4 12L20.1 14C20.6 14.3 21.5 14.5 22.3 14.5C24 14.5 25.4 13.5 25.4 12C25.4 10.4 23.5 10.2 23.5 9.1C23.5 8.6 24 8.3 24.7 8.3C25.4 8.3 26 8.6 26 8.6L26.3 6.8C25.8 6.5 25 6.3 24 7Z" fill="#1434CB"/>
            <path d="M27.3 7.2C26.9 7.2 26.7 7.4 26.5 7.9L23 17H25L25.5 15.5H28.3L28.6 17H31L29.2 7.2H27.3ZM26.1 13.7L27.1 10.3L27.7 13.7H26.1Z" fill="#1434CB"/>
            <path d="M19.5 7L18 13.5L17.8 12.7C17.4 11.3 16 10 14.5 9.2L16.8 17H19L23 7H19.5Z" fill="#1434CB"/>
          </svg>
        );
      case 'mastercard':
        return (
          <svg className="h-8 w-12" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="24" rx="2" fill="#E6E6E6"/>
            <path d="M11 9H29V15H11V9Z" fill="#FF5F00"/>
            <path d="M12 12C12 10.3431 12.7795 8.84392 14 7.85781C12.7663 6.58335 11.0773 5.8 9.19231 5.8C5.22835 5.8 2 8.59492 2 12C2 15.4051 5.22835 18.2 9.19231 18.2C11.0773 18.2 12.7663 17.4166 14 16.1422C12.7795 15.1561 12 13.6569 12 12Z" fill="#EB001B"/>
            <path d="M38 12C38 15.4051 34.7716 18.2 30.8077 18.2C28.9227 18.2 27.2337 17.4166 26 16.1422C27.2205 15.1561 28 13.6569 28 12C28 10.3431 27.2205 8.84392 26 7.85781C27.2337 6.58335 28.9227 5.8 30.8077 5.8C34.7716 5.8 38 8.59492 38 12Z" fill="#F79E1B"/>
          </svg>
        );
      default:
        return (
          <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
            {brand}
          </div>
        );
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-64">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center space-x-4">
                  <img 
                    src={mockUser.avatarUrl} 
                    alt={mockUser.name} 
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{mockUser.name}</h2>
                    <p className="text-sm text-gray-500">Member since {new Date(mockUser.memberSince).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <nav className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => handleTabChange('account')}
                  className={`w-full text-left px-6 py-3 ${
                    activeTab === 'account' 
                      ? 'bg-indigo-50 border-l-4 border-indigo-600 text-indigo-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Account Details
                </button>
                
                <button
                  onClick={() => handleTabChange('addresses')}
                  className={`w-full text-left px-6 py-3 ${
                    activeTab === 'addresses' 
                      ? 'bg-indigo-50 border-l-4 border-indigo-600 text-indigo-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Addresses
                </button>
                
                <button
                  onClick={() => handleTabChange('payment')}
                  className={`w-full text-left px-6 py-3 ${
                    activeTab === 'payment' 
                      ? 'bg-indigo-50 border-l-4 border-indigo-600 text-indigo-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Payment Methods
                </button>
                
                <button
                  onClick={() => handleTabChange('orders')}
                  className={`w-full text-left px-6 py-3 ${
                    activeTab === 'orders' 
                      ? 'bg-indigo-50 border-l-4 border-indigo-600 text-indigo-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Order History
                </button>
                
                <button
                  onClick={() => handleTabChange('wishlist')}
                  className={`w-full text-left px-6 py-3 ${
                    activeTab === 'wishlist' 
                      ? 'bg-indigo-50 border-l-4 border-indigo-600 text-indigo-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Wishlist
                </button>
              </nav>
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Account Details */}
                {activeTab === 'account' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-medium text-gray-900">Account Details</h2>
                      <button
                        onClick={handleEditToggle}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        {isEditing ? 'Cancel' : 'Edit'}
                      </button>
                    </div>
                    
                    {isEditing ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Leave blank to keep current password"
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Leave blank to keep current password
                          </p>
                        </div>
                        
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Leave blank to keep current password"
                          />
                        </div>
                        
                        <div>
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                          >
                            {loading ? 'Updating...' : 'Update Profile'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                          <p className="mt-1 text-sm text-gray-900">{mockUser.name}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                          <p className="mt-1 text-sm text-gray-900">{mockUser.email}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                          <p className="mt-1 text-sm text-gray-900">{mockUser.phone}</p>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-3">Password</h3>
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Change Password
                          </button>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-3">Account Settings</h3>
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="marketing"
                                  name="marketing"
                                  type="checkbox"
                                  defaultChecked={true}
                                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="marketing" className="font-medium text-gray-700">Marketing emails</label>
                                <p className="text-gray-500">Receive emails about new products, features, and more.</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id="orders"
                                  name="orders"
                                  type="checkbox"
                                  defaultChecked={true}
                                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="orders" className="font-medium text-gray-700">Order updates</label>
                                <p className="text-gray-500">Receive emails about your orders and shipping updates.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Addresses */}
                {activeTab === 'addresses' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-medium text-gray-900">Your Addresses</h2>
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Add New Address
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {mockAddresses.map((address) => (
                        <div key={address.id} className="border border-gray-200 rounded-lg p-4 relative">
                          {address.default && (
                            <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Default
                            </span>
                          )}
                          <div className="mb-2">
                            <h3 className="text-sm font-medium text-gray-900">{address.type}</h3>
                          </div>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>{address.name}</p>
                            <p>{address.street}</p>
                            {address.apt && <p>{address.apt}</p>}
                            <p>{address.city}, {address.state} {address.zip}</p>
                            <p>{address.country}</p>
                            <p>{address.phone}</p>
                          </div>
                          <div className="mt-4 flex space-x-3">
                            <button
                              type="button"
                              className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              Remove
                            </button>
                            {!address.default && (
                              <button
                                type="button"
                                className="text-sm text-gray-500 hover:text-gray-700"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Payment Methods */}
                {activeTab === 'payment' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-medium text-gray-900">Payment Methods</h2>
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Add Payment Method
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {mockPaymentMethods.map((payment) => (
                        <div key={payment.id} className="border border-gray-200 rounded-lg p-4 relative">
                          {payment.default && (
                            <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Default
                            </span>
                          )}
                          <div className="flex items-center space-x-4">
                            {getCardIcon(payment.brand)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {payment.brand} •••• {payment.last4}
                              </p>
                              <p className="text-sm text-gray-500">
                                Expires {payment.expMonth}/{payment.expYear}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-3">
                            {!payment.default && (
                              <button
                                type="button"
                                className="text-sm text-gray-500 hover:text-gray-700"
                              >
                                Set as Default
                              </button>
                            )}
                            <button
                              type="button"
                              className="text-sm text-red-600 hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Order History */}
                {activeTab === 'orders' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-medium text-gray-900">Order History</h2>
                    </div>
                    
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">View all your orders and track their status</p>
                      <Link
                        to="/orders"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Go to Orders
                      </Link>
                    </div>
                  </div>
                )}
                
                {/* Wishlist */}
                {activeTab === 'wishlist' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-medium text-gray-900">Wishlist</h2>
                    </div>
                    
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No items in your wishlist</h3>
                      <p className="mt-1 text-sm text-gray-500">Start adding items to your wishlist while shopping.</p>
                      <div className="mt-6">
                        <Link
                          to="/products"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Browse Products
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile; 