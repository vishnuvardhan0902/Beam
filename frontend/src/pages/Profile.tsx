import React, { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { 
  updateUserProfile, 
  getUserProfile, 
  listMyOrders,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
  getUserPaymentMethods,
  addUserPaymentMethod,
  updateUserPaymentMethod,
  deleteUserPaymentMethod,
  setDefaultPaymentMethod
} from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Profile tabs
type TabType = 'account' | 'addresses' | 'payment' | 'orders' | 'wishlist';

interface UserData {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  createdAt?: string;
  googleId?: string;
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
}

interface Address {
  _id: string;
  type: string;
  default: boolean;
  name: string;
  street: string;
  apt?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

interface PaymentMethod {
  _id: string;
  type: string;
  default: boolean;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  orderItems: Array<{
    name: string;
    qty: number;
    image: string;
    price: number;
    product: string;
  }>;
}

const Profile: React.FC = () => {
  const { user: authUser, loading: authLoading } = useAuthContext();
  
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string>('');
  const [addressesLoading, setAddressesLoading] = useState<boolean>(false);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState<boolean>(false);
  
  // Fetch user profile data from the API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile();
        setUserData(data);
        setName(data.name || '');
        setEmail(data.email || '');
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    };
    
    if (authUser) {
      fetchUserProfile();
    }
  }, [authUser]);
  
  // Fetch user orders when the orders tab is active
  useEffect(() => {
    const fetchOrders = async () => {
      if (activeTab === 'orders') {
        try {
          setOrdersLoading(true);
          const data = await listMyOrders();
          setOrders(data);
          setOrdersLoading(false);
        } catch (err) {
          setOrdersError(err instanceof Error ? err.message : String(err));
          setOrdersLoading(false);
        }
      }
    };
    
    fetchOrders();
  }, [activeTab]);
  
  // Fetch addresses when the addresses tab is active
  useEffect(() => {
    const fetchAddresses = async () => {
      if (activeTab === 'addresses') {
        try {
          setAddressesLoading(true);
          const data = await getUserAddresses();
          setUserData(prev => prev ? { ...prev, addresses: data } : null);
          setAddressesLoading(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
          setAddressesLoading(false);
        }
      }
    };
    
    fetchAddresses();
  }, [activeTab]);

  // Fetch payment methods when the payment tab is active
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (activeTab === 'payment') {
        try {
          setPaymentMethodsLoading(true);
          const data = await getUserPaymentMethods();
          setUserData(prev => prev ? { ...prev, paymentMethods: data } : null);
          setPaymentMethodsLoading(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
          setPaymentMethodsLoading(false);
        }
      }
    };
    
    fetchPaymentMethods();
  }, [activeTab]);
  
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
      const updatedUserData: UserData = {
        name,
        email,
        ...(password && { password }),
      };
      
      const result = await updateUserProfile(updatedUserData);
      setUserData(result);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
      setLoading(false);
      setIsEditing(false);
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

  // Format date string
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle address operations
  const handleAddAddress = async (address) => {
    try {
      setAddressesLoading(true);
      const newAddress = await addUserAddress(address);
      setUserData(prev => prev ? { 
        ...prev, 
        addresses: [...(prev.addresses || []), newAddress] 
      } : null);
      setAddressesLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setAddressesLoading(false);
    }
  };

  const handleUpdateAddress = async (addressId, address) => {
    try {
      setAddressesLoading(true);
      const updatedAddress = await updateUserAddress(addressId, address);
      setUserData(prev => prev ? {
        ...prev,
        addresses: prev.addresses?.map(addr => 
          addr._id === addressId ? updatedAddress : addr
        )
      } : null);
      setAddressesLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setAddressesLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      setAddressesLoading(true);
      await deleteUserAddress(addressId);
      setUserData(prev => prev ? {
        ...prev,
        addresses: prev.addresses?.filter(addr => addr._id !== addressId)
      } : null);
      setAddressesLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setAddressesLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setAddressesLoading(true);
      const updatedAddress = await setDefaultAddress(addressId);
      setUserData(prev => prev ? {
        ...prev,
        addresses: prev.addresses?.map(addr => 
          addr._id === addressId ? updatedAddress : { ...addr, default: false }
        )
      } : null);
      setAddressesLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setAddressesLoading(false);
    }
  };

  // Handle payment method operations
  const handleAddPaymentMethod = async (paymentMethod) => {
    try {
      setPaymentMethodsLoading(true);
      const newPaymentMethod = await addUserPaymentMethod(paymentMethod);
      setUserData(prev => prev ? {
        ...prev,
        paymentMethods: [...(prev.paymentMethods || []), newPaymentMethod]
      } : null);
      setPaymentMethodsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPaymentMethodsLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async (paymentMethodId, paymentMethod) => {
    try {
      setPaymentMethodsLoading(true);
      const updatedPaymentMethod = await updateUserPaymentMethod(paymentMethodId, paymentMethod);
      setUserData(prev => prev ? {
        ...prev,
        paymentMethods: prev.paymentMethods?.map(pm => 
          pm._id === paymentMethodId ? updatedPaymentMethod : pm
        )
      } : null);
      setPaymentMethodsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPaymentMethodsLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId) => {
    try {
      setPaymentMethodsLoading(true);
      await deleteUserPaymentMethod(paymentMethodId);
      setUserData(prev => prev ? {
        ...prev,
        paymentMethods: prev.paymentMethods?.filter(pm => pm._id !== paymentMethodId)
      } : null);
      setPaymentMethodsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPaymentMethodsLoading(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId) => {
    try {
      setPaymentMethodsLoading(true);
      const updatedPaymentMethod = await setDefaultPaymentMethod(paymentMethodId);
      setUserData(prev => prev ? {
        ...prev,
        paymentMethods: prev.paymentMethods?.map(pm => 
          pm._id === paymentMethodId ? updatedPaymentMethod : { ...pm, default: false }
        )
      } : null);
      setPaymentMethodsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPaymentMethodsLoading(false);
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
                  {userData?.avatar ? (
                    <img 
                      src={userData.avatar} 
                      alt={userData.name} 
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-semibold">
                      {userData?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{userData?.name}</h2>
                    <p className="text-sm text-gray-500">
                      Member since {userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}
                    </p>
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
              </nav>
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-medium text-gray-900">Account Details</h2>
                      <button
                        onClick={handleEditToggle}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        {isEditing ? 'Cancel' : 'Edit'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {success && (
                      <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                        Profile updated successfully!
                      </div>
                    )}
                    
                    {error && (
                      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                      </div>
                    )}
                    
                    {isEditing ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={email}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            New Password
                          </label>
                          <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Leave blank to keep current password
                          </p>
                        </div>
                        
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        
                        <div className="flex items-center justify-end">
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                          <p className="mt-1 text-sm text-gray-900">{userData?.name}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                          <p className="mt-1 text-sm text-gray-900">{userData?.email}</p>
                        </div>
                        
                        {userData?.googleId && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Google Account</h3>
                            <p className="mt-1 text-sm text-gray-900">Connected to Google Account</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Order History</h2>
                  </div>
                  
                  <div className="p-6">
                    {ordersLoading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : ordersError ? (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {ordersError}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                        <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
                        <div className="mt-6">
                          <Link
                            to="/products"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            Start Shopping
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Paid
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Delivered
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                              <tr key={order._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {order._id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(order.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ${order.totalPrice.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {order.isPaid ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Paid
                                    </span>
                                  ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                      Not Paid
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {order.isDelivered ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Delivered
                                    </span>
                                  ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                      Not Delivered
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <Link
                                    to={`/order/${order._id}`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    Details
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-medium text-gray-900">Addresses</h2>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Add New Address
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {addressesLoading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : userData?.addresses?.length === 0 ? (
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses saved</h3>
                        <p className="mt-1 text-sm text-gray-500">Add an address to make checkout easier.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {userData?.addresses?.map((address) => (
                          <div key={address._id} className="border border-gray-200 rounded-lg p-4 relative">
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
                    )}
                  </div>
                </div>
              )}
              
              {/* Payment Methods Tab */}
              {activeTab === 'payment' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-medium text-gray-900">Payment Methods</h2>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Add New Card
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {paymentMethodsLoading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : userData?.paymentMethods?.length === 0 ? (
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No payment methods saved</h3>
                        <p className="mt-1 text-sm text-gray-500">Add a payment method to make checkout easier.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userData?.paymentMethods?.map((payment) => (
                          <div key={payment._id} className="border border-gray-200 rounded-lg p-4 relative">
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
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile; 