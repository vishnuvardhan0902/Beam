const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const SellerSales = require('../models/SellerSales');
const mongoose = require('mongoose');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  // Use the limit from query params or default to 8
  const pageSize = Number(req.query.limit) || 8;
  const page = Number(req.query.pageNumber) || 1;

  // Get search keyword from query string if it exists
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  // Get total count of products that match the keyword
  const count = await Product.countDocuments({ ...keyword });
  
  // Get products with pagination
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Delete related seller sales records first
    try {
      const result = await SellerSales.deleteMany({ product: product._id });
      console.log(`Deleted ${result.deletedCount} seller sales records for product ${product._id}`);
    } catch (error) {
      console.error('Error deleting seller sales records:', error);
      // Continue with product deletion anyway
    }
    
    await product.deleteOne();
    console.log(`Product deleted successfully: ${product._id}`);
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin or Seller
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    images,
    brand,
    category,
    countInStock,
    description,
    colors,
    features
  } = req.body;

  // Validate that we have at least one image
  if (!images || images.length === 0) {
    res.status(400);
    throw new Error('At least one product image is required');
  }

  const product = new Product({
    name: name || 'Sample Product',
    price: price || 0,
    user: req.user._id,
    images: images,
    brand: brand || 'Sample Brand',
    category: category || 'Sample Category',
    countInStock: countInStock || 0,
    numReviews: 0,
    description: description || 'Sample description',
    colors: colors || [{ name: 'Black', value: 'black' }],
    features: features || ['Sample feature'],
  });

  const createdProduct = await product.save();
  console.log(`Product created successfully: ${createdProduct._id}`);
  
  // Create a sample entry in the SellerSales collection for this product
  try {
    const sellerSale = new SellerSales({
      seller: req.user._id,
      order: new mongoose.Types.ObjectId(), // Generate a dummy order ID
      product: createdProduct._id,
      productName: createdProduct.name,
      quantity: 0, // No actual sales yet
      price: createdProduct.price,
      totalAmount: 0, // No actual sales yet
      customerName: 'Sample Customer',
      customerEmail: 'sample@example.com',
      orderDate: new Date(),
      status: 'pending', // Mark as pending since it's just a placeholder
    });
    
    await sellerSale.save();
    console.log(`Created sample seller sales record for product: ${createdProduct._id}`);
  } catch (error) {
    console.error('Error creating sample seller sales record:', error);
    // Continue anyway since the product was created successfully
  }
  
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin or Seller
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    images,
    brand,
    category,
    countInStock,
    colors,
    features,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Check if the user is the product owner or an admin
    if (product.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Not authorized to update this product');
    }

    // Validate that we have at least one image
    if (!images || images.length === 0) {
      res.status(400);
      throw new Error('At least one product image is required');
    }

    const oldPrice = product.price;
    const priceChanged = price && price !== oldPrice;

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.images = images || product.images;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;
    product.colors = colors || product.colors;
    product.features = features || product.features;

    const updatedProduct = await product.save();
    console.log(`Product updated successfully: ${updatedProduct._id}`);
    
    // Update seller sales records if price changed
    if (priceChanged) {
      try {
        // Find any existing seller sales records for this product
        const salesRecords = await SellerSales.find({ product: product._id });
        
        if (salesRecords.length > 0) {
          console.log(`Found ${salesRecords.length} seller sales records to update`);
          
          // Update price in all records
          await SellerSales.updateMany(
            { product: product._id },
            { $set: { price: updatedProduct.price } }
          );
          
          // Recalculate totalAmount for each record
          for (const record of salesRecords) {
            record.price = updatedProduct.price;
            record.totalAmount = record.price * record.quantity;
            await record.save();
          }
          
          console.log(`Updated price in ${salesRecords.length} seller sales records`);
        } else {
          // Create a sample entry if none exists
          const sellerSale = new SellerSales({
            seller: product.user,
            order: new mongoose.Types.ObjectId(),
            product: product._id,
            productName: product.name,
            quantity: 0,
            price: product.price,
            totalAmount: 0,
            customerName: 'Sample Customer',
            customerEmail: 'sample@example.com',
            orderDate: new Date(),
            status: 'pending',
          });
          
          await sellerSale.save();
          console.log(`Created new sample seller sales record for updated product: ${product._id}`);
        }
      } catch (error) {
        console.error('Error updating seller sales records:', error);
        // Continue anyway since the product was updated successfully
      }
    }
    
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Check if user has already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    // Calculate average rating
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  // Find top 3 products by rating
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);

  res.json(products);
});

// @desc    Get seller's products
// @route   GET /api/products/seller
// @access  Private/Seller
const getSellerProducts = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const products = await Product.find({ user: sellerId });
  
  res.json(products);
});

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getSellerProducts,
}; 