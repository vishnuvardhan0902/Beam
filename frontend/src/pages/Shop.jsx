import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

// Mock product data
const mockProducts = [
  {
    id: '1',
    title: 'Wireless Headphones',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop',
    rating: 4.5,
    category: 'electronics',
    inStock: true,
  },
  {
    id: '2',
    title: 'Smart Watch Series 7',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=2672&auto=format&fit=crop',
    rating: 4.8,
    category: 'electronics',
    inStock: true,
  },
  {
    id: '3',
    title: 'Premium Laptop Stand',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2670&auto=format&fit=crop',
    rating: 4.3,
    category: 'electronics',
    inStock: true,
  },
  {
    id: '4',
    title: 'Ergonomic Mouse',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=2624&auto=format&fit=crop',
    rating: 4.1,
    category: 'electronics',
    inStock: false,
  },
  {
    id: '5',
    title: 'Smart Home Speaker',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1589256469067-ea99e9542b98?q=80&w=2574&auto=format&fit=crop',
    rating: 4.6,
    category: 'electronics',
    inStock: true,
  },
  {
    id: '6',
    title: 'Fitness Tracker',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?q=80&w=2574&auto=format&fit=crop',
    rating: 4.2,
    category: 'electronics',
    inStock: true,
  },
  {
    id: '7',
    title: 'Casual T-shirt',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=2574&auto=format&fit=crop',
    rating: 4.0,
    category: 'clothing',
    inStock: true,
  },
  {
    id: '8',
    title: 'Denim Jeans',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=2626&auto=format&fit=crop',
    rating: 4.3,
    category: 'clothing',
    inStock: true,
  },
  {
    id: '9',
    title: 'Decorative Plant',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?q=80&w=2670&auto=format&fit=crop',
    rating: 4.4,
    category: 'home',
    inStock: true,
  },
  {
    id: '10',
    title: 'Moisturizing Cream',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1614859093916-71fec05a3033?q=80&w=2670&auto=format&fit=crop',
    rating: 4.7,
    category: 'beauty',
    inStock: true,
  },
  {
    id: '11',
    title: 'Ceramic Coffee Mug',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=2670&auto=format&fit=crop',
    rating: 4.2,
    category: 'home',
    inStock: true,
  },
  {
    id: '12',
    title: 'Face Serum',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2487&auto=format&fit=crop',
    rating: 4.8,
    category: 'beauty',
    inStock: false,
  },
];

const Shop = () => {
  // States for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [showInStock, setShowInStock] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // Mock function for adding to cart
  const handleAddToCart = (id) => {
    console.log(`Added product ${id} to cart`);
  };

  // Filter products based on state
  const filteredProducts = mockProducts.filter((product) => {
    // Search query
    if (
      searchQuery &&
      !product.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }

    // Price range filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }

    // Rating filter
    if (product.rating < minRating) {
      return false;
    }

    // In stock filter
    if (showInStock && !product.inStock) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low-high':
        return a.price - b.price;
      case 'price-high-low':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0; // No sort (featured)
    }
  });

  return (
    <div>
      <Navbar />

      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Shop All Products</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="col-span-1 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>

              {/* Search */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                <div className="space-y-2">
                  <CategoryCheckbox
                    label="All Categories"
                    checked={selectedCategory === null}
                    onChange={() => setSelectedCategory(null)}
                  />
                  <CategoryCheckbox
                    label="Electronics"
                    checked={selectedCategory === 'electronics'}
                    onChange={() => setSelectedCategory('electronics')}
                  />
                  <CategoryCheckbox
                    label="Clothing"
                    checked={selectedCategory === 'clothing'}
                    onChange={() => setSelectedCategory('clothing')}
                  />
                  <CategoryCheckbox
                    label="Home & Garden"
                    checked={selectedCategory === 'home'}
                    onChange={() => setSelectedCategory('home')}
                  />
                  <CategoryCheckbox
                    label="Beauty"
                    checked={selectedCategory === 'beauty'}
                    onChange={() => setSelectedCategory('beauty')}
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </h3>
                <div className="flex space-x-4 mb-2">
                  <input
                    type="number"
                    min="0"
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    min={priceRange[0]}
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full"
                />
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Min Rating</h3>
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <button
                      key={rating}
                      className={`${
                        minRating > rating ? 'text-yellow-400' : 'text-gray-300'
                      } focus:outline-none`}
                      onClick={() => setMinRating(rating + 1)}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    & Up ({minRating} stars)
                  </span>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    id="inStock"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={showInStock}
                    onChange={(e) => setShowInStock(e.target.checked)}
                  />
                  <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">
                    In Stock Only
                  </label>
                </div>
              </div>

              {/* Clear Filters Button */}
              <button
                className="w-full py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setPriceRange([0, 500]);
                  setMinRating(0);
                  setShowInStock(false);
                }}
              >
                Clear Filters
              </button>
            </div>

            {/* Product Grid */}
            <div className="col-span-1 lg:col-span-3">
              {/* Sort Dropdown and Results Count */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-600 mb-3 sm:mb-0">
                  Showing {sortedProducts.length} results
                </p>
                <div className="flex items-center">
                  <label htmlFor="sort" className="mr-2 text-gray-600">
                    Sort by:
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      title={product.title}
                      price={product.price}
                      image={product.image}
                      rating={product.rating}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                  <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                  <button
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                      setPriceRange([0, 500]);
                      setMinRating(0);
                      setShowInStock(false);
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex shadow-sm">
                  <button className="px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 border-t border-b border-gray-300 bg-indigo-50 text-sm font-medium text-indigo-600">
                    1
                  </button>
                  <button className="px-3 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-3 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    3
                  </button>
                  <button className="px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Helper component for category checkboxes
const CategoryCheckbox = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center mb-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
      />
      <label className="ml-2 text-sm text-gray-700">{label}</label>
    </div>
  );
};

export default Shop; 