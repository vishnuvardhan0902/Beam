const products = [
  {
    name: 'Wireless Noise Cancelling Headphones',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?q=80&w=2574&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2565&auto=format&fit=crop'
    ],
    description: 'Experience premium sound quality with our latest wireless headphones. Featuring advanced noise cancellation technology, these headphones deliver an immersive audio experience. With a comfortable over-ear design and up to 30 hours of battery life, they\'re perfect for long listening sessions.',
    brand: 'SoundMaster',
    category: 'Audio',
    price: 249.99,
    countInStock: 10,
    rating: 4.5,
    numReviews: 12,
    colors: [
      { name: 'Black', value: 'black' },
      { name: 'Silver', value: 'silver' },
      { name: 'Blue', value: 'blue' }
    ],
    features: [
      'Advanced noise cancellation technology',
      'Premium sound quality with deep bass',
      'Up to 30 hours of battery life',
      'Comfortable over-ear design',
      'Fast charging - 5 hours of playback from a 10-minute charge',
      'Built-in microphone for calls and voice assistant',
      'Bluetooth 5.0 connectivity'
    ]
  },
  {
    name: 'Portable Bluetooth Speaker',
    images: [
      'https://images.unsplash.com/photo-1589256469067-ea99e9542b98?q=80&w=2574&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=2574&auto=format&fit=crop'
    ],
    description: 'Take your music anywhere with this portable Bluetooth speaker. Featuring powerful 360° sound and deep bass, this speaker delivers impressive audio quality in a compact design. With 12 hours of battery life and waterproof construction, it\'s perfect for outdoor adventures.',
    brand: 'SoundMaster',
    category: 'Audio',
    price: 79.99,
    countInStock: 15,
    rating: 4.3,
    numReviews: 8,
    colors: [
      { name: 'Black', value: 'black' },
      { name: 'Red', value: 'red' },
      { name: 'Teal', value: 'teal' }
    ],
    features: [
      '360° immersive sound',
      'Waterproof design (IPX7 rated)',
      'Up to 12 hours of battery life',
      'Built-in microphone for calls',
      'Bluetooth 5.0 connectivity',
      'Compact and portable design'
    ]
  },
  {
    name: 'Premium Laptop Stand',
    images: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2670&auto=format&fit=crop'
    ],
    description: 'Enhance your workspace with our ergonomic laptop stand. Designed to elevate your laptop to a comfortable viewing height, this stand helps reduce neck and back strain during long work sessions. Made from premium aluminum, it features a sleek design and folds flat for easy portability.',
    brand: 'TechErgonomics',
    category: 'Accessories',
    price: 49.99,
    countInStock: 20,
    rating: 4.7,
    numReviews: 15,
    colors: [
      { name: 'Silver', value: 'silver' },
      { name: 'Space Gray', value: 'gray' }
    ],
    features: [
      'Ergonomic design for better posture',
      'Premium aluminum construction',
      'Adjustable height settings',
      'Non-slip silicone pads',
      'Foldable for easy transport',
      'Compatible with laptops up to 17 inches'
    ]
  },
  {
    name: 'Ergonomic Gaming Mouse',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=2001&auto=format&fit=crop'
    ],
    description: 'Gain a competitive edge with our precision gaming mouse. Featuring an advanced optical sensor with adjustable DPI settings, this mouse delivers incredible accuracy and responsiveness. The ergonomic design with customizable RGB lighting ensures comfort during extended gaming sessions.',
    brand: 'GameMaster',
    category: 'Gaming',
    price: 59.99,
    countInStock: 8,
    rating: 4.6,
    numReviews: 10,
    colors: [
      { name: 'Black', value: 'black' }
    ],
    features: [
      'Advanced optical sensor with 16,000 DPI',
      'Programmable buttons for custom macros',
      'Customizable RGB lighting',
      'Ergonomic design for comfortable grip',
      'Adjustable weight system',
      'Durable mechanical switches rated for 50 million clicks'
    ]
  },
  {
    name: 'Mechanical Keyboard',
    images: [
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=2080&auto=format&fit=crop'
    ],
    description: 'Elevate your typing experience with our mechanical keyboard. Featuring tactile mechanical switches, this keyboard provides satisfying feedback and improved typing accuracy. With customizable RGB backlighting and a durable aluminum frame, it combines style with performance.',
    brand: 'GameMaster',
    category: 'Gaming',
    price: 129.99,
    countInStock: 5,
    rating: 4.8,
    numReviews: 18,
    colors: [
      { name: 'Black', value: 'black' },
      { name: 'White', value: 'white' }
    ],
    features: [
      'Tactile mechanical switches',
      'N-key rollover for anti-ghosting',
      'Customizable RGB backlighting',
      'Durable aluminum frame',
      'Detachable USB-C cable',
      'Programmable macro keys'
    ]
  },
  {
    name: 'Wireless Earbuds',
    images: [
      'https://images.unsplash.com/photo-1590658268037-1070eaaf0b2f?q=80&w=2579&auto=format&fit=crop'
    ],
    description: 'Experience true wireless freedom with our premium earbuds. Featuring high-fidelity sound and active noise cancellation, these earbuds deliver an exceptional listening experience. With a compact charging case that provides up to 24 hours of total battery life, you can enjoy your music all day long.',
    brand: 'SoundMaster',
    category: 'Audio',
    price: 99.99,
    countInStock: 12,
    rating: 4.4,
    numReviews: 14,
    colors: [
      { name: 'White', value: 'white' },
      { name: 'Black', value: 'black' }
    ],
    features: [
      'True wireless design',
      'Active noise cancellation',
      'High-fidelity sound with deep bass',
      'Up to 6 hours of playback (24 hours with charging case)',
      'Touch controls for easy operation',
      'IPX4 water resistance',
      'Voice assistant compatible'
    ]
  },
  {
    name: 'Smartphone Tripod',
    images: [
      'https://images.unsplash.com/photo-1612860608808-e15e354f4ea1?q=80&w=1974&auto=format&fit=crop'
    ],
    description: 'Capture perfect photos and videos with our versatile smartphone tripod. Designed for stability and flexibility, this tripod features adjustable legs and a ball head for precise positioning. The included Bluetooth remote allows for hands-free shooting, making it ideal for selfies, group photos, and vlogging.',
    brand: 'PhotoPro',
    category: 'Accessories',
    price: 24.99,
    countInStock: 25,
    rating: 4.2,
    numReviews: 9,
    colors: [
      { name: 'Black', value: 'black' }
    ],
    features: [
      'Adjustable height (up to 50 inches)',
      'Ball head for 360° rotation',
      'Bluetooth remote for wireless control',
      'Lightweight and portable design',
      'Universal smartphone mount',
      'Converts to a selfie stick'
    ]
  },
  {
    name: 'USB-C Hub Adapter',
    images: [
      'https://images.unsplash.com/photo-1618440718967-a909a11768eb?q=80&w=2070&auto=format&fit=crop'
    ],
    description: 'Expand your connectivity options with our USB-C hub adapter. This hub transforms a single USB-C port into multiple ports, including HDMI, USB-A, SD card reader, and power delivery. Perfect for laptops with limited ports, this adapter ensures you can connect all your essential devices.',
    brand: 'TechConnect',
    category: 'Accessories',
    price: 39.99,
    countInStock: 18,
    rating: 4.5,
    numReviews: 11,
    colors: [
      { name: 'Silver', value: 'silver' },
      { name: 'Space Gray', value: 'gray' }
    ],
    features: [
      '7-in-1 hub with multiple ports',
      '4K HDMI output for external displays',
      'USB-C power delivery pass-through',
      'SD and microSD card readers',
      'USB 3.0 ports for fast data transfer',
      'Compact and portable design'
    ]
  }
];

module.exports = products; 