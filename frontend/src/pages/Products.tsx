import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
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

  // Fetch products from API with a larger pageSize to show more products
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
            
            <div className="mt-4 md:mt-0 flex items-center">
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
            
            {/* Desktop filter sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-6">
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-sm font-medium text-gray-900">Categories</h3>
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
                
                <div className="border-b border-gray-200 py-6">
                  <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">${priceRange[0]}</span>
                      <span className="text-sm text-gray-600">${priceRange[1]}</span>
                    </div>
                    <div className="mt-2">
                      <label htmlFor="min-price" className="block text-sm font-medium text-gray-700">Min Price</label>
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
                    <div className="mt-2">
                      <label htmlFor="max-price" className="block text-sm font-medium text-gray-700">Max Price</label>
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
            
            {/* Product grid - show more products per row */}
            <div className="mt-6 lg:col-span-3 lg:mt-0">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                {loading ? (
                  <div className="col-span-full flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : error ? (
                  <div className="col-span-full text-center py-16">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : sortedProducts.length === 0 ? (
                  <div className="col-span-full text-center py-16">
                    <p className="text-gray-500">No products found matching your criteria.</p>
                  </div>
                ) : (
                  sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      title={product.name}
                      price={product.price}
                      image={product.image}
                      category={product.category}
                      rating={product.rating}
                      reviewCount={product.reviewCount || product.numReviews || 0}
                    />
                  ))
                )}
              </div>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                        page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === i + 1 ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                        page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
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