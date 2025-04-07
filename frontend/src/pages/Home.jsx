import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

// Mock data for featured products
const featuredProducts = [
  {
    id: '1',
    title: 'Wireless Headphones',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop',
    rating: 4.5,
  },
  {
    id: '2',
    title: 'Smart Watch Series 7',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=2672&auto=format&fit=crop',
    rating: 4.8,
  },
  {
    id: '3',
    title: 'Premium Laptop Stand',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2670&auto=format&fit=crop',
    rating: 4.3,
  },
  {
    id: '4',
    title: 'Ergonomic Mouse',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=2624&auto=format&fit=crop',
    rating: 4.1,
  },
];

// Mock data for trending products
const trendingProducts = [
  {
    id: '5',
    title: 'Smart Home Speaker',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1589256469067-ea99e9542b98?q=80&w=2574&auto=format&fit=crop',
    rating: 4.6,
  },
  {
    id: '6',
    title: 'Fitness Tracker',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?q=80&w=2574&auto=format&fit=crop',
    rating: 4.2,
  },
  {
    id: '7',
    title: 'Wireless Earbuds',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1590658268037-1070eaaf0b2f?q=80&w=2579&auto=format&fit=crop',
    rating: 4.7,
  },
  {
    id: '8',
    title: 'Phone Charging Station',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1600490722773-35753aea6332?q=80&w=2574&auto=format&fit=crop',
    rating: 4.4,
  },
];

const Home = () => {
  // Mock function for adding to cart
  const handleAddToCart = (id) => {
    console.log(`Added product ${id} to cart`);
  };

  return (
    <div>
      <Navbar />
      
      <Hero
        title="Welcome to Beam Shop"
        subtitle="Discover amazing products at unbeatable prices"
        ctaText="Shop Now"
        ctaLink="/shop"
      />
      
      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <CategoryCard
              title="Electronics"
              image="https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2670&auto=format&fit=crop"
              link="/shop?category=electronics"
            />
            <CategoryCard
              title="Clothing"
              image="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2670&auto=format&fit=crop"
              link="/shop?category=clothing"
            />
            <CategoryCard
              title="Home & Garden"
              image="https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2574&auto=format&fit=crop"
              link="/shop?category=home"
            />
            <CategoryCard
              title="Beauty"
              image="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2600&auto=format&fit=crop"
              link="/shop?category=beauty"
            />
          </div>
        </div>
      </section>
      
      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link to="/shop" className="text-indigo-600 hover:text-indigo-800 font-medium">
              View All <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
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
        </div>
      </section>
      
      {/* Promotional Banner */}
      <section className="bg-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold mb-4">Summer Sale!</h2>
            <p className="text-xl mb-6">Up to 50% off on selected items.</p>
            <Link
              to="/shop?sale=true"
              className="inline-block px-6 py-3 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Shop the Sale
            </Link>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=2215&auto=format&fit=crop"
              alt="Summer Sale"
              className="rounded-lg shadow-lg max-h-72 w-full object-cover"
            />
          </div>
        </div>
      </section>
      
      {/* Trending Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Trending Now</h2>
            <Link to="/shop" className="text-indigo-600 hover:text-indigo-800 font-medium">
              View All <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
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
        </div>
      </section>
      
      {/* Brand Logos Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Top Brands</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="flex items-center justify-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 font-medium">Brand {index}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Newsletter Subscription */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Sign up to receive updates on new arrivals, special offers, and more.
          </p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-l-lg border-t border-b border-l border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-r-lg hover:bg-indigo-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

// Helper component for category cards
const CategoryCard = ({ title, image, link }) => {
  return (
    <Link to={link} className="block group">
      <div className="relative rounded-lg overflow-hidden h-48">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h3 className="text-white text-xl font-bold">{title}</h3>
        </div>
      </div>
    </Link>
  );
};

export default Home; 