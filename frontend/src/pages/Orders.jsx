import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listMyOrders } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Attempting to fetch orders...');
      const data = await listMyOrders();
      console.log('Orders fetched successfully:', data);
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      let errorMessage = err instanceof Error ? err.message : String(err);
      
      // Make errors more user-friendly
      if (errorMessage.includes('Received non-JSON response')) {
        errorMessage = 'Unable to connect to the orders service. Please try again later.';
      } else if (errorMessage.includes('Not authorized')) {
        errorMessage = 'Your session has expired. Please log in again.';
        // Wait a moment before redirecting
        setTimeout(() => {
          navigate('/login?redirect=orders');
        }, 1500);
      } else if (errorMessage.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      console.log('User not logged in, redirecting to login');
      navigate('/login?redirect=orders');
      return;
    }
    
    fetchOrders();
  }, [user, navigate]);
  
  // Format date to a readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Orders</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchOrders}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      <Link to={`/order/${order._id}`} className="text-blue-600 hover:underline">
                        Order #{order._id}
                      </Link>
                    </h2>
                    <p className="text-gray-600">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Total: ${order.totalPrice}</p>
                    <div className="flex flex-col gap-2 mt-2">
                      <p
                        className={`inline-block px-3 py-1 rounded-full text-sm text-center ${
                          order.isPaid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.isPaid ? 'Paid' : 'Not Paid'}
                      </p>
                      <p
                        className={`inline-block px-3 py-1 rounded-full text-sm text-center ${
                          order.isDelivered
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.isDelivered ? 'Delivered' : 'Not Delivered'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Order Items:</h3>
                  <div className="space-y-2">
                    {order.orderItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.qty} x ${item.price}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">
                          ${(item.qty * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Orders;