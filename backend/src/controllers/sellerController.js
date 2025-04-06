const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const SellerSales = require('../models/SellerSales');

// @desc    Get seller dashboard data (summary statistics)
// @route   GET /api/sellers/dashboard
// @access  Private/Seller
const getSellerDashboard = asyncHandler(async (req, res) => {
  // Get seller id from authenticated user
  const sellerId = req.user._id;

  try {
    // Get total products for this seller
    const totalProducts = await Product.countDocuments({ user: sellerId }) || 0;

    // Get seller sales data from SellerSales collection
    const salesData = await SellerSales.find({ seller: sellerId });

    // Calculate statistics from sales data
    let totalRevenue = 0;
    let totalItemsSold = 0;
    const uniqueOrderIds = new Set();
    
    salesData.forEach(sale => {
      totalRevenue += sale.totalAmount;
      totalItemsSold += sale.quantity;
      uniqueOrderIds.add(sale.order.toString());
    });
    
    const totalOrders = uniqueOrderIds.size;

    // Get top selling products based on sales collection
    let topProducts = [];
    try {
      // Aggregate to find top products
      const topProductsAgg = await SellerSales.aggregate([
        { $match: { seller: sellerId } },
        { $group: { 
            _id: '$product', 
            totalSold: { $sum: '$quantity' },
            totalRevenue: { $sum: '$totalAmount' },
            productName: { $first: '$productName' }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
      ]);
      
      // Get the actual product details
      if (topProductsAgg.length > 0) {
        const productIds = topProductsAgg.map(item => item._id);
        const products = await Product.find({ _id: { $in: productIds } });
        
        // Merge product details with aggregation results
        topProducts = topProductsAgg.map(agg => {
          const productDetails = products.find(p => p._id.toString() === agg._id.toString());
          return {
            ...productDetails?.toObject(),
            totalSold: agg.totalSold,
            totalRevenue: agg.totalRevenue
          };
        });
      }
    } catch (error) {
      console.log('Error finding top products, using empty array:', error);
      // Continue with empty products array
    }

    // Get recent orders
    let recentOrders = [];
    try {
      // Get the most recent sales by order
      const recentSales = await SellerSales.find({ seller: sellerId })
        .sort({ createdAt: -1 })
        .limit(20);
        
      // Extract unique order IDs
      const recentOrderIds = [...new Set(recentSales.map(sale => sale.order))];
      
      // Get the actual orders
      recentOrders = await Order.find({ 
        _id: { $in: recentOrderIds.slice(0, 5) } 
      }).populate('user', 'name email');
    } catch (error) {
      console.log('Error finding recent orders, using empty array:', error);
    }

    // If there's no real data yet, provide sample data for UI testing
    if (totalProducts === 0 && totalOrders === 0) {
      return res.json({
        totalRevenue: 5250.75,
        totalOrders: 32,
        totalProducts: 8,
        totalItemsSold: 48,
        topProducts: [],
        recentOrders: []
      });
    }

    // Return real dashboard data
    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalItemsSold,
      topProducts,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching seller dashboard:', error);
    res.status(500);
    throw new Error('Error fetching dashboard data');
  }
});

// @desc    Get seller sales data for analytics
// @route   GET /api/sellers/sales
// @access  Private/Seller
const getSellerSales = asyncHandler(async (req, res) => {
  // Get seller id from authenticated user
  const sellerId = req.user._id;
  const { period = 'monthly' } = req.query;

  try {
    // Initialize sales data based on period
    let salesData = [];
    const now = new Date();
    
    if (period === 'weekly') {
      // Define dates for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        salesData.push({
          period: day,
          date: date.toISOString().split('T')[0],
          revenue: 0,
          orders: 0
        });
      }
    } else if (period === 'monthly') {
      // Define dates for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        
        salesData.push({
          period: month,
          date: `${date.getFullYear()}-${date.getMonth() + 1}`,
          revenue: 0,
          orders: 0
        });
      }
    } else if (period === 'yearly') {
      // Define dates for the last 5 years
      for (let i = 4; i >= 0; i--) {
        const date = new Date(now);
        date.setFullYear(date.getFullYear() - i);
        
        salesData.push({
          period: date.getFullYear().toString(),
          date: date.getFullYear().toString(),
          revenue: 0,
          orders: 0
        });
      }
    }

    // Get seller sales data from the database
    const sellerSales = await SellerSales.find({ seller: sellerId });

    // No sales data found - return sample data
    if (sellerSales.length === 0) {
      if (period === 'weekly') {
        // Sample weekly data
        salesData = salesData.map((item, index) => {
          return {
            ...item,
            revenue: Math.floor(Math.random() * 1000) + 500,
            orders: Math.floor(Math.random() * 10) + 1
          };
        });
      } else if (period === 'monthly') {
        // Sample monthly data with an upward trend
        salesData = salesData.map((item, index) => {
          return {
            ...item,
            revenue: 1000 + (index * 500) + Math.floor(Math.random() * 300),
            orders: 5 + index + Math.floor(Math.random() * 3)
          };
        });
      } else if (period === 'yearly') {
        // Sample yearly data with growth
        salesData = salesData.map((item, index) => {
          return {
            ...item,
            revenue: 5000 + (index * 2000) + Math.floor(Math.random() * 1000),
            orders: 20 + (index * 10) + Math.floor(Math.random() * 5)
          };
        });
      }
      return res.json(salesData);
    }

    // Process real sales data to populate the salesData array
    sellerSales.forEach(sale => {
      const saleDate = new Date(sale.orderDate);
      let periodKey;
      
      if (period === 'weekly') {
        periodKey = saleDate.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (period === 'monthly') {
        periodKey = saleDate.toLocaleDateString('en-US', { month: 'short' });
      } else if (period === 'yearly') {
        periodKey = saleDate.getFullYear().toString();
      }
      
      // Find matching period in salesData
      const periodData = salesData.find(item => item.period === periodKey);
      if (periodData) {
        // Add sale revenue to period
        periodData.revenue += sale.totalAmount;
        
        // Track unique orders per period
        // Create a unique key for this order in this period
        const orderKey = `${sale.order.toString()}-${periodKey}`;
        
        // Use a Set to track unique orders in this period
        if (!periodData.uniqueOrders) {
          periodData.uniqueOrders = new Set();
        }
        
        periodData.uniqueOrders.add(orderKey);
        periodData.orders = periodData.uniqueOrders.size;
      }
    });

    // Clean up by removing the uniqueOrders Set which we don't want to return in the API
    salesData.forEach(data => {
      if (data.uniqueOrders) {
        delete data.uniqueOrders;
      }
    });

    res.json(salesData);
  } catch (error) {
    console.error('Error fetching seller sales:', error);
    res.status(500);
    throw new Error('Error fetching sales data');
  }
});

// @desc    Get seller orders
// @route   GET /api/sellers/orders
// @access  Private/Seller
const getSellerOrders = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  
  try {
    // Find all orders that contain products from this seller
    const orders = await Order.find({ 'orderItems.seller': sellerId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    // Filter order items to only include this seller's items
    const sellerOrders = orders.map(order => {
      // Create a copy of the order
      const sellerOrder = {
        ...order.toObject(),
        orderItems: order.orderItems.filter(
          item => item.seller && item.seller.toString() === sellerId.toString()
        )
      };
      
      // Recalculate totals for this seller's items only
      sellerOrder.itemsPrice = sellerOrder.orderItems.reduce(
        (acc, item) => acc + item.price * item.qty, 0
      );
      
      return sellerOrder;
    });
    
    res.json(sellerOrders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500);
    throw new Error('Error fetching seller orders');
  }
});

// @desc    Get seller sales history
// @route   GET /api/sellers/sales-history
// @access  Private/Seller
const getSellerSalesHistory = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const { limit = 50, page = 1 } = req.query;
  
  try {
    // Pagination
    const pageSize = parseInt(limit);
    const currentPage = parseInt(page);
    const skip = (currentPage - 1) * pageSize;
    
    // Get sales history
    const salesHistory = await SellerSales.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);
      
    // Get total count
    const total = await SellerSales.countDocuments({ seller: sellerId });
    
    res.json({
      sales: salesHistory,
      page: currentPage,
      pages: Math.ceil(total / pageSize),
      total
    });
  } catch (error) {
    console.error('Error fetching seller sales history:', error);
    res.status(500);
    throw new Error('Error fetching sales history');
  }
});

module.exports = {
  getSellerDashboard,
  getSellerSales,
  getSellerOrders,
  getSellerSalesHistory
}; 