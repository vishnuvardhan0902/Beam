const orders = [
  {
    orderItems: [
      {
        name: 'Wireless Noise Cancelling Headphones',
        qty: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        price: 249.99,
        color: 'Black',
      },
      {
        name: 'Premium Laptop Stand',
        qty: 2,
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500',
        price: 49.99,
        color: 'Silver',
      }
    ],
    shippingAddress: {
      address: '123 Main St',
      city: 'San Francisco',
      postalCode: '94103',
      country: 'USA',
    },
    paymentMethod: 'PayPal',
    taxPrice: 35.00,
    shippingPrice: 15.00,
    totalPrice: 399.97,
    isPaid: true,
    paidAt: new Date('2023-06-10'),
    isDelivered: true,
    deliveredAt: new Date('2023-06-15'),
  },
  {
    orderItems: [
      {
        name: 'Wireless Earbuds',
        qty: 1,
        image: 'https://images.unsplash.com/photo-1590658268037-1070eaaf0b2f?w=500',
        price: 99.99,
        color: 'White',
      },
      {
        name: 'Smartphone Tripod',
        qty: 1,
        image: 'https://images.unsplash.com/photo-1612860608808-e15e354f4ea1?w=500',
        price: 24.99,
        color: 'Black',
      },
      {
        name: 'USB-C Hub Adapter',
        qty: 1,
        image: 'https://images.unsplash.com/photo-1618440718967-a909a11768eb?w=500',
        price: 39.99,
        color: 'Gray',
      }
    ],
    shippingAddress: {
      address: '456 Market St',
      city: 'Seattle',
      postalCode: '98101',
      country: 'USA',
    },
    paymentMethod: 'Credit Card',
    taxPrice: 16.50,
    shippingPrice: 10.00,
    totalPrice: 191.47,
    isPaid: true,
    paidAt: new Date('2023-07-22'),
    isDelivered: false,
  },
  {
    orderItems: [
      {
        name: 'Mechanical Keyboard',
        qty: 1,
        image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500',
        price: 129.99,
        color: 'RGB',
      },
      {
        name: 'Ergonomic Gaming Mouse',
        qty: 1,
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500',
        price: 59.99,
        color: 'Black',
      }
    ],
    shippingAddress: {
      address: '789 Elm St',
      city: 'Austin',
      postalCode: '78701',
      country: 'USA',
    },
    paymentMethod: 'PayPal',
    taxPrice: 19.00,
    shippingPrice: 12.50,
    totalPrice: 221.48,
    isPaid: false,
    isDelivered: false,
  }
];

module.exports = orders; 