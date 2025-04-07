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
  
  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      console.log('User not logged in, redirecting to login');
      navigate('/login?redirect=orders');
      return;
    }
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await listMyOrders();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setLoading(false);
        
        // Handle authentication errors
        if (errorMessage.includes('Not authorized') || errorMessage.includes('session')) {
          console.error('Authentication error fetching orders:', errorMessage);
          // Wait a moment before redirecting to avoid too rapid redirects
          setTimeout(() => {
            navigate('/login?redirect=orders');
          }, 1500);
        }
      }
    };
    
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
          <div className="text-center">Loading orders...</div>
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
          <div className="text-center text-red-600">{error}</div>
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
          <div className="text-center py-8">
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
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">Order #{order._id}</h2>
                    <p className="text-gray-600">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Total: ${order.totalPrice}</p>
                    <p
                      className={`inline-block px-3 py-1 rounded-full text-sm ${
                        order.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.isPaid ? 'Paid' : 'Not Paid'}
                    </p>
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
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.qty} x ${item.price}
                          </p>
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