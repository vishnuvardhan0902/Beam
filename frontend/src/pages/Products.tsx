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
  images: string[];
  rating: number;
  reviewCount?: number;
  numReviews?: number;
  brand?: string;
  colors?: { name: string; value: string }[];
  features?: string[];
  sales?: number;
}

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all products for filtering
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [productsPerPage, setProductsPerPage] = useState(18);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(300);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch products from API with a larger pageSize to show more products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          keyword: searchKeyword,
          pageNumber: page.toString(),
          limit: productsPerPage.toString(),
          category: selectedCategory || ''
        };
        const data = await getProducts(params);
        // Transform backend data to match our interface
        const formattedProducts = data.products.map((product: any) => ({
          id: product._id,
          _id: product._id,
          name: product.name,
          price: product.price,
          category: product.category || 'Uncategorized',
          image: product.images && product.images.length > 0 ? product.images[0] : undefined,
          images: product.images || [],
          rating: product.rating || 0,
          reviewCount: product.numReviews || 0,
          numReviews: product.numReviews || 0,
          brand: product.brand || '',
          colors: product.colors || [],
          features: product.features || [],
          sales: product.sales || 0
        }));
        setProducts(formattedProducts);
        setTotalPages(data.pages);
        setLoading(false);
      } catch (err: any) {
        setError(typeof err === 'string' ? err : 'Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchKeyword, page, productsPerPage, selectedCategory]);

  // Fetch all products for filtering (without pagination)
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        // Use a large number to get all products
        const params = {
          keyword: searchKeyword,
          pageNumber: '1',
          limit: '1000',
          category: selectedCategory || ''
        };
        const data = await getProducts(params);
        const formattedProducts = data.products.map((product: any) => ({
          id: product._id,
          _id: product._id,
          name: product.name,
          price: product.price,
          category: product.category || 'Uncategorized',
          image: product.images && product.images.length > 0 ? product.images[0] : undefined,
          images: product.images || [],
          rating: product.rating || 0,
          reviewCount: product.numReviews || 0,
          numReviews: product.numReviews || 0,
          brand: product.brand || '',
          colors: product.colors || [],
          features: product.features || [],
          sales: product.sales || 0
        }));
        setAllProducts(formattedProducts);
        
        // Set min and max price from all products
        if (formattedProducts.length > 0) {
          const prices = formattedProducts.map((p: Product) => p.price);
          setMinPrice(Math.floor(Math.min(...prices)));
          setMaxPrice(Math.ceil(Math.max(...prices)));
          setPriceRange([Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]);
        }
      } catch (err) {
        console.error('Failed to fetch all products for filtering:', err);
      }
    };

    fetchAllProducts();
  }, [searchKeyword, selectedCategory]);

  // Reset to page 1 when search keyword changes
  useEffect(() => {
    setPage(1);
  }, [searchKeyword]);

  // Derive categories from all products, not just current page
  const categories = Array.from(new Set(allProducts.map(product => product.category)));

  // Filter products by price range only (category filtering is now done on the backend)
  const filteredProducts = products.filter(product => {
    const matchesPriceRange = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesPriceRange;
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
    setLoading(true); // Set loading state to true to show loading indicator
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

  // Close mobile filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFilterOpen && isMobile) {
        const filterDialog = document.getElementById('mobile-filter-dialog');
        const filterButton = document.getElementById('filter-button');
        
        if (filterDialog && !filterDialog.contains(event.target as Node) && 
            filterButton && !filterButton.contains(event.target as Node)) {
          setIsFilterOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen, isMobile]);

  // Generate pagination items like Amazon
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = isMobile ? 3 : 7;
    
    // Always show first page
    items.push(1);
    
    // Calculate start and end of visible pages
    let startPage = Math.max(2, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 4);
    
    // Adjust start if we're near the end
    if (endPage === totalPages - 1) {
      startPage = Math.max(2, endPage - (maxVisiblePages - 4));
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      items.push('ellipsis-start');
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      items.push('ellipsis-end');
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(totalPages);
    }
    
    return items;
  };

  // Create placeholder items to maintain grid layout
  const getPlaceholderItems = () => {
    const items = [];
    const totalItems = sortedProducts.length;
    const itemsNeeded = Math.ceil(totalItems / 6) * 6; // Ensure multiple of 6 for 3x2 grid
    const placeholdersNeeded = Math.max(0, itemsNeeded - totalItems);
    
    for (let i = 0; i < placeholdersNeeded; i++) {
      items.push(<div key={`placeholder-${i}`} className="h-0 opacity-0"></div>);
    }
    
    return items;
  };

  // Count products in each category
  const getCategoryCount = (category: string | null) => {
    if (category === null) {
      return allProducts.length;
    }
    return allProducts.filter(product => product.category === category).length;
  };

  // Count products in price range
  const getPriceRangeCount = (min: number, max: number) => {
    return allProducts.filter(product => product.price >= min && product.price <= max).length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-white shadow-sm">
          <div className="container-custom py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {searchKeyword ? `Search Results: "${searchKeyword}"` : 'All Products'}
              </h1>
              
              <div className="mt-4 md:mt-0 flex items-center">
                <div className="relative inline-block text-left">
                  <label htmlFor="sort-menu" className="sr-only">Sort by</label>
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
                  id="filter-button"
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
          </div>
        </div>
        
        <div className="container-custom py-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-x-8">
            {/* Mobile filter dialog */}
            <div 
              id="mobile-filter-dialog"
              className={`fixed inset-0 flex z-40 lg:hidden ${isFilterOpen ? '' : 'hidden'}`}
            >
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
                      <div className="flex items-center justify-between">
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
                        <span className="text-xs text-gray-500">({getCategoryCount(null)})</span>
                      </div>
                      {categories.map((category) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center">
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
                          <span className="text-xs text-gray-500">({getCategoryCount(category)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="px-4 py-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">${priceRange[0]}</span>
                        <span className="text-sm text-gray-600">${priceRange[1]}</span>
                      </div>
                      <div className="mt-2">
                        <input
                          type="range"
                          id="price-range-mobile"
                          min={minPrice}
                          max={maxPrice}
                          value={priceRange[1]}
                          onChange={(e) => handlePriceRangeChange(e, 1)}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="min-price-mobile" className="block text-sm font-medium text-gray-700">Min</label>
                          <input
                            type="number"
                            id="min-price-mobile"
                            min={minPrice}
                            max={priceRange[1]}
                            value={priceRange[0]}
                            onChange={(e) => handlePriceRangeChange(e, 0)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="max-price-mobile" className="block text-sm font-medium text-gray-700">Max</label>
                          <input
                            type="number"
                            id="max-price-mobile"
                            min={priceRange[0]}
                            max={maxPrice}
                            value={priceRange[1]}
                            onChange={(e) => handlePriceRangeChange(e, 1)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {getPriceRangeCount(priceRange[0], priceRange[1])} products in this range
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop filter sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
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
                      <span className="text-xs text-gray-500">({getCategoryCount(null)})</span>
                    </div>
                    {categories.map((category) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center">
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
                        <span className="text-xs text-gray-500">({getCategoryCount(category)})</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Price Range</h3>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">${priceRange[0]}</span>
                      <span className="text-sm font-medium text-gray-700">${priceRange[1]}</span>
                    </div>
                    <div className="mt-2">
                      <input
                        type="range"
                        id="price-range"
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => handlePriceRangeChange(e, 1)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="min-price" className="block text-sm font-medium text-gray-700">Min</label>
                        <input
                          type="number"
                          id="min-price"
                          min={minPrice}
                          max={priceRange[1]}
                          value={priceRange[0]}
                          onChange={(e) => handlePriceRangeChange(e, 0)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="max-price" className="block text-sm font-medium text-gray-700">Max</label>
                        <input
                          type="number"
                          id="max-price"
                          min={priceRange[0]}
                          max={maxPrice}
                          value={priceRange[1]}
                          onChange={(e) => handlePriceRangeChange(e, 1)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {getPriceRangeCount(priceRange[0], priceRange[1])} products in this range
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-red-500 text-lg">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 btn btn-primary"
                  >
                    Try Again
                  </button>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                  <button 
                    onClick={() => {
                      setSelectedCategory(null);
                      setPriceRange([minPrice, maxPrice]);
                    }} 
                    className="mt-4 btn btn-secondary"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Product grid with consistent layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {sortedProducts.map((product) => (
                      <div key={product.id} className="h-full">
                        <ProductCard
                          id={product.id}
                          title={product.name}
                          price={product.price}
                          image={product.image}
                          images={product.images}
                          category={product.category}
                          rating={product.rating}
                          reviewCount={product.reviewCount || product.numReviews || 0}
                        />
                      </div>
                    ))}
                    {/* Add placeholder items to maintain grid layout */}
                    {getPlaceholderItems()}
                  </div>
                  
                  {/* Amazon-style pagination controls */}
                  {totalPages > 1 && (
                    <div className="mt-12">
                      <div className="flex flex-col sm:flex-row items-center justify-between">
                        <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                          Showing <span className="font-medium">{(page - 1) * productsPerPage + 1}</span> to <span className="font-medium">{Math.min(page * productsPerPage, sortedProducts.length)}</span> of <span className="font-medium">{sortedProducts.length}</span> products
                        </div>
                        
                        <nav className="flex items-center" aria-label="Pagination">
                          <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                              page === 1 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {getPaginationItems().map((item, index) => (
                            item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                              <span 
                                key={`ellipsis-${index}`} 
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            ) : (
                              <button
                                key={index}
                                onClick={() => setPage(item as number)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  page === item 
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {item}
                              </button>
                            )
                          ))}
                          
                          <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                              page === totalPages 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Products; 