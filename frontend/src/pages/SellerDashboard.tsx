import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { 
  getSellerProducts, 
  getSellerOrders, 
  getSellerDashboardData,
  getSellerSales,
  deleteProduct
} from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isSeller } = useAuthContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [salesPeriod, setSalesPeriod] = useState<string>('monthly');

  // Ensure only sellers can access this page
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isSeller)) {
      navigate('/login');
    }
  }, [isAuthenticated, isSeller, loading, navigate]);

  // Fetch initial data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        switch (activeTab) {
          case 'dashboard':
            const dashboardData = await getSellerDashboardData();
            setDashboardData(dashboardData);
            break;
          case 'products':
            const products = await getSellerProducts();
            setProducts(products);
            break;
          case 'orders':
            const orders = await getSellerOrders();
            setOrders(orders);
            break;
          case 'sales':
            const salesData = await getSellerSales(salesPeriod);
            setSalesData(salesData);
            break;
        }
        
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isSeller) {
      fetchDashboardData();
    }
  }, [activeTab, isAuthenticated, isSeller, salesPeriod]);

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        // Refresh products list
        setProducts(products.filter(product => product._id !== productId));
      } catch (err: any) {
        setError(err.message || 'Failed to delete product');
      }
    }
  };

  const handleAddNewProduct = () => {
    navigate('/seller/product/new');
  };

  const handleEditProduct = (productId: string) => {
    navigate(`/seller/product/${productId}`);
  };

  // Prepare chart data for sales
  const getSalesChartData = () => {
    if (!salesData) return null;

    return {
      labels: salesData.map((item: any) => item.period),
      datasets: [
        {
          label: 'Revenue',
          data: salesData.map((item: any) => item.revenue),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Orders',
          data: salesData.map((item: any) => item.orders),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };
  };

  const renderDashboardTab = () => {
    if (!dashboardData) return <div>No dashboard data available</div>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">${dashboardData.totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Lifetime sales</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
          <p className="text-3xl font-bold mt-2">{dashboardData.totalOrders}</p>
          <p className="text-sm text-gray-500 mt-1">Across all products</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900">Products</h3>
          <p className="text-3xl font-bold mt-2">{dashboardData.totalProducts}</p>
          <p className="text-sm text-gray-500 mt-1">Active listings</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900">Avg. Order Value</h3>
          <p className="text-3xl font-bold mt-2">
            ${dashboardData.totalOrders > 0 
              ? (dashboardData.totalRevenue / dashboardData.totalOrders).toFixed(2) 
              : '0.00'}
          </p>
        </div>
      </div>
    );
  };

  const renderProductsTab = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Your Products</h2>
          <button 
            onClick={handleAddNewProduct}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add New Product
          </button>
        </div>
        
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-600">You haven't added any products yet.</p>
            <button 
              onClick={handleAddNewProduct}
              className="px-4 py-2 mt-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={product.image} 
                            alt={product.name} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.countInStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.sales || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditProduct(product._id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderOrdersTab = () => {
    return (
      <div>
        <h2 className="text-xl font-medium mb-6">Recent Orders</h2>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-600">No orders found for your products.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-indigo-600">#{order._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.user.name}</div>
                      <div className="text-sm text-gray-500">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${order.totalPrice.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderSalesTab = () => {
    const chartData = getSalesChartData();
    
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Sales Analytics</h2>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setSalesPeriod('weekly')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md 
                ${salesPeriod === 'weekly' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setSalesPeriod('monthly')}
              className={`px-4 py-2 text-sm font-medium 
                ${salesPeriod === 'monthly' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-t border-b border-gray-300`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setSalesPeriod('yearly')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md 
                ${salesPeriod === 'yearly' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300`}
            >
              Yearly
            </button>
          </div>
        </div>
        
        {!chartData ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-600">No sales data available for the selected period.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: `Sales Overview (${salesPeriod.charAt(0).toUpperCase() + salesPeriod.slice(1)})`,
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'products':
        return renderProductsTab();
      case 'orders':
        return renderOrdersTab();
      case 'sales':
        return renderSalesTab();
      default:
        return null;
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className="bg-gray-50 py-8 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`pb-4 px-1 ${
                  activeTab === 'dashboard'
                    ? 'border-indigo-500 text-indigo-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } font-medium`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`pb-4 px-1 ${
                  activeTab === 'products'
                    ? 'border-indigo-500 text-indigo-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } font-medium`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-4 px-1 ${
                  activeTab === 'orders'
                    ? 'border-indigo-500 text-indigo-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } font-medium`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`pb-4 px-1 ${
                  activeTab === 'sales'
                    ? 'border-indigo-500 text-indigo-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } font-medium`}
              >
                Sales Analytics
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          {renderContent()}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SellerDashboard; 