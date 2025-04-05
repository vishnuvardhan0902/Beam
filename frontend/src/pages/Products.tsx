import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import SearchBarWrapper from '../components/SearchBarWrapper';
import { getProducts } from '../services/api.js';

// Interface for product data
interface Product {
  id: string;
  _id?: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  images?: string[];
  rating: number;
  reviewCount?: number;
  numReviews?: number;
}

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts(searchKeyword, page.toString());
        // Transform backend data to match our interface
        const formattedProducts = data.products.map((product: any) => ({
          id: product._id,
          _id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.images && product.images.length > 0 ? product.images[0] : undefined,
          images: product.images,
          rating: product.rating,
          reviewCount: product.numReviews,
          numReviews: product.numReviews
        }));
        setProducts(formattedProducts);
        setTotalPages(data.pages);
        setLoading(false);
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchKeyword, page]);

  // Reset to page 1 when search keyword changes
  useEffect(() => {
    setPage(1);
  }, [searchKeyword]);

  // Derive categories from products
  const categories = Array.from(new Set(products.map(product => product.category)));

  // Filter products by category and price range
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesPriceRange = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesCategory && matchesPriceRange;
  });

  // Sort products based on selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default: // 'featured'
        return 0; // Keep original order
    }
  });

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setPage(1); // Reset to first page when changing category
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const handlePriceRangeChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = parseInt(event.target.value);
    const newRange = [...priceRange] as [number, number];
    newRange[index] = newValue;
    setPriceRange(newRange);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div>
      <Navbar />
      
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {searchKeyword ? `Search Results: "${searchKeyword}"` : 'All Products'}
            </h1>
            
            <div className="mt-4 md:mt-0 flex flex-col md:flex-row md:items-center">
              <SearchBarWrapper className="w-full md:w-64 mr-4 mb-4 md:mb-0" />
              
              <div className="relative inline-block text-left">
                <select
                  id="sort-menu"
                  value={sortOption}
                  onChange={handleSortChange}
                  className="block w-full md:w-48 py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
              
              <button
                type="button"
                className="ml-4 p-2 text-gray-400 hover:text-gray-500 lg:hidden"
                onClick={toggleFilter}
              >
                <span className="sr-only">Filters</span>
                <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mt-8 lg:grid lg:grid-cols-4 lg:gap-x-8">
            {/* Mobile filter dialog */}
            <div className={`fixed inset-0 flex z-40 lg:hidden ${isFilterOpen ? '' : 'hidden'}`}>
              <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true" onClick={toggleFilter}></div>
              
              <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                    onClick={toggleFilter}
                  >
                    <span className="sr-only">Close menu</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Mobile filter options */}
                <div className="mt-4 border-t border-gray-200">
                  <div className="px-4 py-6">
                    <h3 className="text-sm font-medium text-gray-900">Categories</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
                        <input
                          id="category-all-mobile"
                          name="category"
                          type="radio"
                          checked={selectedCategory === null}
                          onChange={() => handleCategoryChange(null)}
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="category-all-mobile" className="ml-3 text-sm text-gray-600">
                          All Categories
                        </label>
                      </div>
                      {categories.map((category) => (
                        <div key={category} className="flex items-center">
                          <input
                            id={`category-${category}-mobile`}
                            name="category"
                            type="radio"
                            checked={selectedCategory === category}
                            onChange={() => handleCategoryChange(category)}
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor={`category-${category}-mobile`} className="ml-3 text-sm text-gray-600">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="px-4 py-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">${priceRange[0]}</span>
                        <span className="text-sm text-gray-600">${priceRange[1]}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="min-price-mobile" className="block text-sm font-medium text-gray-700">Min</label>
                          <input
                            type="range"
                            id="min-price-mobile"
                            min="0"
                            max="300"
                            value={priceRange[0]}
                            onChange={(e) => handlePriceRangeChange(e, 0)}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label htmlFor="max-price-mobile" className="block text-sm font-medium text-gray-700">Max</label>
                          <input
                            type="range"
                            id="max-price-mobile"
                            min="0"
                            max="300"
                            value={priceRange[1]}
                            onChange={(e) => handlePriceRangeChange(e, 1)}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop filters */}
            <div className="hidden lg:block">
              <div className="divide-y divide-gray-200 space-y-10">
                {/* Categories filter */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Categories</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="category-all"
                        name="category"
                        type="radio"
                        checked={selectedCategory === null}
                        onChange={() => handleCategoryChange(null)}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="category-all" className="ml-3 text-sm text-gray-600">
                        All Categories
                      </label>
                    </div>
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          id={`category-${category}`}
                          name="category"
                          type="radio"
                          checked={selectedCategory === category}
                          onChange={() => handleCategoryChange(category)}
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor={`category-${category}`} className="ml-3 text-sm text-gray-600">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price range filter */}
                <div className="pt-10">
                  <h3 className="text-lg font-medium text-gray-900">Price Range</h3>
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">${priceRange[0]}</span>
                      <span className="text-sm text-gray-600">${priceRange[1]}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="min-price" className="block text-sm font-medium text-gray-700">Min</label>
                        <input
                          type="range"
                          id="min-price"
                          min="0"
                          max="300"
                          value={priceRange[0]}
                          onChange={(e) => handlePriceRangeChange(e, 0)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="max-price" className="block text-sm font-medium text-gray-700">Max</label>
                        <input
                          type="range"
                          id="max-price"
                          min="0"
                          max="300"
                          value={priceRange[1]}
                          onChange={(e) => handlePriceRangeChange(e, 1)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product grid */}
            <div className="mt-6 lg:col-span-3 lg:mt-0">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-lg text-red-500">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Try Again
                  </button>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-500">No products match your current filters.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setPriceRange([0, 300]);
                    }}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex justify-center">
                      <nav className="flex items-center justify-between">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Previous
                        </button>
                        <div className="hidden md:flex">
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setPage(i + 1)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === i + 1
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Products; 