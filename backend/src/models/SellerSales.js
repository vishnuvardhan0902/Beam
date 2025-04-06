const mongoose = require('mongoose');

const sellerSalesSchema = mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      default: 'completed',
      enum: ['pending', 'completed', 'refunded', 'cancelled'],
    },
  },
  {
    timestamps: true,
  }
);

// Creating indexes for better query performance
sellerSalesSchema.index({ seller: 1, orderDate: -1 });
sellerSalesSchema.index({ product: 1 });

const SellerSales = mongoose.model('SellerSales', sellerSalesSchema);

module.exports = SellerSales; 