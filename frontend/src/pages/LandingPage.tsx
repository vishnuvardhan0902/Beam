import React, { useState, useEffect, useRef } from 'react';
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

interface Testimonial {
  content: string;
  author: string;
  role: string;
  avatar?: string;
}

// Define API response interface
interface ProductsApiResponse {
  products: any[];
  pages: number;
  page: number;
}

const LandingPage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Testimonials data
  const testimonials: Testimonial[] = [
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
    },
    {
      content: "The headphones I purchased have incredible sound quality and battery life. Best purchase I've made this year!",
      author: "David Williams",
      role: "Music Producer"
    },
    {
      content: "Their customer support team went above and beyond to help me find the perfect accessories for my setup.",
      author: "Jennifer Lee",
      role: "Remote Worker"
    },
    {
      content: "These chargers are incredibly fast and reliable. Perfect for my home office setup.",
      author: "Robert Garcia",
      role: "Software Engineer"
    },
    {
      content: "The phone case I bought is both stylish and protective. It's survived multiple drops without a scratch.",
      author: "Sophia Martinez",
      role: "Photographer"
    }
  ];

  // Category data with static images
  const categories = [
    {
      name: 'Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
      slug: 'headphones'
    },
    {
      name: 'Cases',
      image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?q=80&w=1000&auto=format&fit=crop',
      slug: 'cases'
    },
    {
      name: 'Chargers',
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1000&auto=format&fit=crop',
      slug: 'chargers'
    },
    {
      name: 'Accessories',
      image: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=1000&auto=format&fit=crop',
      slug: 'accessories'
    }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch top rated products for hero section
        const topProducts = await getTopProducts();
        
        // Fetch all products without pagination
        // We'll get all pages of products by requesting a large page size
        const allProductsData = await getProducts('', '1') as ProductsApiResponse;
        let allProducts = [...allProductsData.products];
        
        // If there are multiple pages, fetch them all
        if (allProductsData.pages > 1) {
          const fetchPromises = [];
          for (let i = 2; i <= allProductsData.pages; i++) {
            fetchPromises.push(getProducts('', i.toString()));
          }
          
          const results = await Promise.all(fetchPromises);
          results.forEach((result: ProductsApiResponse) => {
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
            <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/products?category=${category.slug}`}
                  className="group"
                >
                  <div className="relative w-full h-80 bg-white rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-contain sm:object-cover object-center scale-95 group-hover:scale-100 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col items-center justify-end">
                      <div className="p-6 text-center">
                        <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                        <p className="mt-2 text-sm text-white bg-indigo-600 px-4 py-2 rounded-full inline-block">
                          Shop {category.name}
                        </p>
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

        {/* Testimonials - Infinite Moving Cards with CSS only */}
        <div className="bg-white py-16 overflow-hidden">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">What Our Customers Say</h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Don't just take our word for it - hear from our satisfied customers.
              </p>
            </div>
            
            <div 
              className="relative" 
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Testimonial slider */}
              <div className="testimonial-container overflow-hidden w-full relative">
                <div 
                  className={`testimonial-track flex gap-4 py-4 ${isHovering ? 'paused' : ''}`}
                  style={{
                    animation: 'scroll 40s linear infinite',
                    width: `calc(${testimonials.length * 2} * (320px + 1rem))`,
                    animationPlayState: isHovering ? 'paused' : 'running'
                  }}
                >
                  {/* First set of testimonials */}
                  {testimonials.map((testimonial, idx) => (
                    <div 
                      key={`testimonial-1-${idx}`} 
                      className="testimonial-card flex-shrink-0 w-80 md:w-96 bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-transform duration-200 hover:shadow-xl hover:scale-[1.02]"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex-grow">
                          <p className="italic text-gray-600 mb-4 text-lg">"{testimonial.content}"</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                              {testimonial.author.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                              <p className="text-sm text-gray-500">{testimonial.role}</p>
                            </div>
                            <div className="ml-auto">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Second set of testimonials (duplicate for infinite loop) */}
                  {testimonials.map((testimonial, idx) => (
                    <div 
                      key={`testimonial-2-${idx}`} 
                      className="testimonial-card flex-shrink-0 w-80 md:w-96 bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-transform duration-200 hover:shadow-xl hover:scale-[1.02]"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex-grow">
                          <p className="italic text-gray-600 mb-4 text-lg">"{testimonial.content}"</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                              {testimonial.author.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                              <p className="text-sm text-gray-500">{testimonial.role}</p>
                            </div>
                            <div className="ml-auto">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Gradient edges */}
              <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-white to-transparent z-10" />
              <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-white to-transparent z-10" />
            </div>
            
            {/* Add keyframes animation to the document */}
            <style>
              {`
                @keyframes scroll {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(calc(-1 * ${testimonials.length} * (320px + 1rem)));
                  }
                }
                
                @media (min-width: 768px) {
                  .testimonial-track {
                    width: calc(${testimonials.length * 2} * (384px + 1rem)) !important;
                  }
                  
                  @keyframes scroll {
                    0% {
                      transform: translateX(0);
                    }
                    100% {
                      transform: translateX(calc(-1 * ${testimonials.length} * (384px + 1rem)));
                    }
                  }
                }
              `}
            </style>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage; 