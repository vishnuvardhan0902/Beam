import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getTopProducts, getProducts } from '../services/api.js';

interface Product {
  _id: string;
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  images?: string[];
  rating: number;
  numReviews: number;
  description?: string;
}

const LandingPage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch top rated products for hero section
        const topProducts = await getTopProducts();
        
        // Fetch all products without pagination
        // We'll get all pages of products by requesting a large page size
        const allProductsData = await getProducts('', '1');
        let allProducts = [...allProductsData.products];
        
        // If there are multiple pages, fetch them all
        if (allProductsData.pages > 1) {
          const fetchPromises = [];
          for (let i = 2; i <= allProductsData.pages; i++) {
            fetchPromises.push(getProducts('', i.toString()));
          }
          
          const results = await Promise.all(fetchPromises);
          results.forEach(result => {
            allProducts = [...allProducts, ...result.products];
          });
        }
        
        // Format products for frontend use
        const formattedProducts = allProducts.map((product: any) => ({
          id: product._id,
          _id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          description: product.description,
          image: product.images && product.images.length > 0 ? product.images[0] : undefined,
          images: product.images,
          rating: product.rating,
          numReviews: product.numReviews
        })).slice(0, 6); // Limit to 6 products
        
        setFeaturedProducts(formattedProducts);
        setLoading(false);
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section */}
        <div className="relative bg-gray-900 overflow-hidden">
          {/* Decorative image and overlay */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?q=80&w=2070&auto=format&fit=crop"
              alt="Hero background"
              className="w-full h-full object-center object-cover opacity-30"
            />
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-900/70" />

          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                <span className="block">Premium Tech Accessories</span>
                <span className="block text-indigo-400">For Your Digital Lifestyle</span>
              </h1>
              <p className="mt-6 max-w-lg mx-auto text-xl text-gray-300 sm:max-w-3xl">
                Discover our curated collection of high-quality tech accessories designed to enhance your daily digital experience.
              </p>
              <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                  <Link
                    to="/products"
                    className="btn btn-primary px-8 py-3 text-base font-medium rounded-md"
                  >
                    Shop Now
                  </Link>
                  <Link
                    to="/about"
                    className="btn btn-secondary px-8 py-3 text-base font-medium rounded-md"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="bg-white py-16">
          <div className="container-custom">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Shop by Category</h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Browse our products by category to find exactly what you need.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-16">
              {['Headphones', 'Cases', 'Chargers', 'Accessories'].map((category) => (
                <Link
                  key={category}
                  to={`/products?category=${category.toLowerCase()}`}
                  className="group relative"
                >
                  <div className="relative w-full h-80 bg-white rounded-lg overflow-hidden group-hover:opacity-75 transition-opacity duration-300">
                    <img
                      src={`https://source.unsplash.com/random/400x300/?${category.toLowerCase()}`}
                      alt={category}
                      className="w-full h-full object-center object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white">{category}</h3>
                        <p className="mt-1 text-sm text-gray-200">Shop {category}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="bg-gray-50 py-16">
          <div className="container-custom">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Featured Products</h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Discover our most popular products loved by customers.
              </p>
            </div>
            
            {loading ? (
              <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="animate-pulse">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200"></div>
                    <div className="mt-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="mt-12 text-center">
                <p className="text-red-500">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.name}
                    price={product.price}
                    image={product.image}
                    category={product.category}
                    rating={product.rating}
                    reviewCount={product.numReviews}
                  />
                ))}
              </div>
            )}
            
            <div className="mt-12 text-center">
              <Link
                to="/products"
                className="btn btn-primary px-8 py-3 text-base font-medium rounded-md"
              >
                View All Products
              </Link>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-white py-16">
          <div className="container-custom">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">What Our Customers Say</h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Don't just take our word for it - hear from our satisfied customers.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  content: "The quality of these products is exceptional. I've been using them for months and they still look and work like new.",
                  author: "Sarah Johnson",
                  role: "Tech Enthusiast"
                },
                {
                  content: "Fast shipping and excellent customer service. The product exceeded my expectations in every way.",
                  author: "Michael Chen",
                  role: "Digital Nomad"
                },
                {
                  content: "I love how these accessories enhance my daily tech experience. The attention to detail is impressive.",
                  author: "Emily Rodriguez",
                  role: "Content Creator"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-8 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {testimonial.author.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{testimonial.author}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                  <div className="mt-4 flex">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <svg
                        key={star}
                        className="h-5 w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-700">
          <div className="container-custom py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to upgrade your tech accessories?</span>
              <span className="block text-indigo-200">Join thousands of satisfied customers today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                >
                  Shop Now
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage; 