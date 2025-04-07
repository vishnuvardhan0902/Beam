import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { updateUserProfile } from '../services/api';

const BecomeSeller = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, isSeller, updateUserState } = useAuthContext();
  
  // Form state
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [description, setDescription] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Redirect if already a seller
  useEffect(() => {
    if (!user) {
      console.log('User not logged in, redirecting to login');
      navigate('/login?redirect=become-seller');
      return;
    }
    
    if (isSeller) {
      console.log('User is already a seller, redirecting to dashboard');
      navigate('/seller/dashboard');
    }
  }, [isSeller, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      setError('You must accept the terms and conditions to become a seller.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare seller application data
      const sellerData = {
        isSeller: true, // Set user as seller
        sellerInfo: {
          businessName,
          phoneNumber,
          address,
          taxId,
          description
        }
      };
      
      // Update user profile to become a seller
      const updatedUserData = await updateUserProfile(sellerData);
      
      // Update the user state in context
      if (user) {
        updateUserState({
          ...user,
          isSeller: true,
          sellerInfo: {
            businessName,
            phoneNumber,
            address,
            taxId,
            description
          }
        });
      }
      
      setSuccess(true);
      
      // Redirect to seller dashboard after successful registration
      setTimeout(() => {
        navigate('/seller/dashboard');
        // No need to force reload anymore
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to register as a seller. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className="bg-gray-50 py-8 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Become a Seller</h1>
            <p className="mt-2 text-lg text-gray-600">
              Start selling your products on our platform
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">Success! Your seller account has been approved.</p>
              <p>Redirecting you to your seller dashboard...</p>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  {/* Business Name */}
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  {/* Business Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Address
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                  </div>
                  
                  {/* Tax ID */}
                  <div>
                    <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                      Tax ID / Business Registration Number
                    </label>
                    <input
                      type="text"
                      id="taxId"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  {/* Business Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Tell us about your business
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      placeholder="What products do you sell? What makes your business unique?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                  </div>
                  
                  {/* Terms and Conditions */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="text-gray-700">
                          I agree to the <a href="/terms" className="text-indigo-600 hover:underline">Terms and Conditions</a> and <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a> for sellers.
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading || !termsAccepted}
                      className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Apply to Become a Seller'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <h3 className="text-base font-medium text-gray-900 mb-2">
                Benefits of becoming a seller
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Access to millions of customers</li>
                <li>Easy-to-use dashboard to manage your products</li>
                <li>Detailed analytics and sales reports</li>
                <li>Secure payment processing</li>
                <li>24/7 seller support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BecomeSeller; 