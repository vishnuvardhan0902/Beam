const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const users = require('./data/users');
const products = require('./data/products');
const orders = require('./data/orders');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

// Import seed data into database
const importData = async () => {
  try {
    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Insert seed users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;
    const regularUser = createdUsers[1]._id;

    // Add admin user as creator of all products
    const sampleProducts = products.map(product => {
      return { ...product, user: adminUser };
    });

    // Insert seed products
    const createdProducts = await Product.insertMany(sampleProducts);

    // Associate products with orders
    const sampleOrders = orders.map((order, index) => {
      // Associate each order with the correct product IDs
      const orderItems = order.orderItems.map((item, itemIndex) => {
        // Cycle through products to associate with order items
        const productId = createdProducts[(index + itemIndex) % createdProducts.length]._id;
        return {
          ...item,
          product: productId
        };
      });
      
      // Assign first order to admin, the rest to regular user
      const userId = index === 0 ? adminUser : regularUser;
      
      return {
        ...order,
        user: userId,
        orderItems
      };
    });

    // Insert seed orders
    await Order.insertMany(sampleOrders);

    console.log('Data imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Delete all data from database
const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Check command line args to determine operation
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 