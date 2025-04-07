import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const Profile = () => {
  const { user, updateUserState } = useAuthContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if user is logged in
        const userInfo = localStorage.getItem('userInfo');
        
        if (!userInfo) {
          throw new Error('You are not logged in. Please log in to view your profile.');
        }
        
        // Fetch user profile data
        const profileData = await getUserProfile();
        
        // Set the user data
        setUserData(profileData);
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        // Optionally fetch additional data
        try {
          const ordersData = await listMyOrders();
          setOrders(ordersData);
        } catch (err) {
          console.error('Error fetching orders:', err);
        }
        
        try {
          const addressesData = await getUserAddresses();
          setAddresses(addressesData);
        } catch (err) {
          console.error('Error fetching addresses:', err);
        }
        
        try {
          const paymentData = await getUserPaymentMethods();
          setPaymentMethods(paymentData);
        } catch (err) {
          console.error('Error fetching payment methods:', err);
        }
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load profile data');
        
        // If user is not logged in, redirect to login
        if (err.message.includes('not logged in')) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleEditToggle = () => {
    // Reset form data when toggling edit mode
    if (!isEditing) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate passwords if changing
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        
        if (formData.newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
      }
      
      // Prepare update data
      const updateData = {
        name: formData.name,
        email: formData.email,
      };
      
      // Add password if changing
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }
      
      // Update profile
      const updatedUser = await updateUserProfile(updateData);
      
      // Update local state
      setUserData(updatedUser);
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Show success message
      setSuccessMessage('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !userData) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-100 py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Render tab content based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Account Information</h2>
              <button
                onClick={handleEditToggle}
                className="text-indigo-600 hover:text-indigo-800"
                disabled={isLoading}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="mt-8 mb-4">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <div className="mb-4">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={userData?.avatar || "https://via.placeholder.com/150"}
                      alt={userData?.name}
                      className="w-20 h-20 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-medium">{userData?.name}</h3>
                      <p className="text-gray-600">{userData?.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Account created: </span>
                      {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                    {userData?.isSeller && (
                      <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Seller Account
                      </div>
                    )}
                    {userData?.isAdmin && (
                      <div className="mt-2 ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Admin
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium mb-2">Security</h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Password: </span>
                    ••••••••
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      
      // Implement the rest of the tabs as needed
      case 'orders':
      case 'addresses':
      case 'payment':
      case 'wishlist':
      default:
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            </div>
            <p>This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-1/4 mb-8 md:mb-0 md:pr-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex flex-col space-y-2">
                  <button
                    className={`text-left px-4 py-2 rounded-md ${
                      activeTab === 'account' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleTabChange('account')}
                  >
                    Account
                  </button>
                  <button
                    className={`text-left px-4 py-2 rounded-md ${
                      activeTab === 'orders' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleTabChange('orders')}
                  >
                    Orders
                  </button>
                  <button
                    className={`text-left px-4 py-2 rounded-md ${
                      activeTab === 'addresses' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleTabChange('addresses')}
                  >
                    Addresses
                  </button>
                  <button
                    className={`text-left px-4 py-2 rounded-md ${
                      activeTab === 'payment' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleTabChange('payment')}
                  >
                    Payment Methods
                  </button>
                  <button
                    className={`text-left px-4 py-2 rounded-md ${
                      activeTab === 'wishlist' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleTabChange('wishlist')}
                  >
                    Wishlist
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-3/4">{renderTabContent()}</div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile; 