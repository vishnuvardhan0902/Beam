import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getProductDetails, getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext';
import PriceForecastChart from '../components/PriceForecastChart';

// Product interface
interface Product {
  id: string;
  _id: string;
  name: string;
  price: number;
  rating: number;
  reviewCount?: number;
  numReviews?: number;
  description: string;
  images: string[];
  inStock: boolean;
  category: string;
  brand: string;
  countInStock: number;
  image: string;
  user: string;
  features: string[];
  colors: { name: string; value: string }[];
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  
  // Get cart context
  const { addToCart } = useCart();

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await getProductDetails(id);
          console.log('Product data from API:', data);
          
          // Transform API data to match our interface
          const formattedProduct: Product = {
            id: data._id,
            _id: data._id,
            name: data.name,
            price: data.price,
            rating: data.rating || 0,
            reviewCount: data.numReviews || 0,
            numReviews: data.numReviews || 0,
            description: data.description || '',
            images: data.images?.length ? data.images : ['https://via.placeholder.com/300'],
            inStock: (data.countInStock || 0) > 0,
            category: data.category || '',
            brand: data.brand || '',
            countInStock: data.countInStock || 0,
            image: data.images && data.images.length > 0 ? data.images[0] : 'https://via.placeholder.com/300',
            user: data.user || '', 
            features: data.features || [],
            colors: data.colors?.map((c: any) => ({ name: c.name, value: c.value })) || 
                    [{ name: 'Default', value: 'gray' }],
          };
          
          setProduct(formattedProduct);
          if (formattedProduct.colors && formattedProduct.colors.length > 0) {
            setSelectedColor(formattedProduct.colors[0].value);
          }
          
          // Fetch related products (products in the same category)
          const fetchRelatedProducts = async () => {
            try {
              const response = await getProducts({ 
                limit: 4, 
                category: formattedProduct.category 
              });
              const filtered = response.products
                .filter((p: any) => p._id !== formattedProduct._id)
                .slice(0, 4)
                .map((p: any) => ({
                  id: p._id,
                  _id: p._id,
                  name: p.name,
                  price: p.price,
                  image: p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/300',
                  images: p.images || ['https://via.placeholder.com/300'],
                  category: p.category,
                  rating: p.rating || 0,
                  reviewCount: p.numReviews || 0,
                  numReviews: p.numReviews || 0,
                  description: p.description || '',
                  inStock: (p.countInStock || 0) > 0
                }) as Product);
              setRelatedProducts(filtered);
            } catch (error) {
              console.error('Error fetching related products:', error);
            }
          };
          
          fetchRelatedProducts();
        }
        setLoading(false);
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Failed to load product details');
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      const cartItem = {
        id: product._id || product.id,
        title: product.name,
        price: product.price,
        image: product.images[selectedImage],
        quantity: quantity,
        color: selectedColor,
        seller: product.user // Include the seller ID
      };
      
      // Add to cart using context
      addToCart(cartItem);
      console.log('Added to cart:', cartItem);
      setIsAddedToCart(true);
      
      // Reset the "Added to cart" message after 3 seconds
      setTimeout(() => {
        setIsAddedToCart(false);
      }, 3000);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value));
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-lg text-red-500">{error || 'Product not found'}</p>
            <Link to="/products">
              <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Back to Products
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
            {/* Product Images */}
            <div className="lg:max-w-lg lg:self-end">
              <nav aria-label="Breadcrumb" className="mb-5">
                <ol className="flex items-center space-x-2 text-sm text-gray-500">
                  <li>
                    <Link to="/" className="hover:text-gray-700">Home</Link>
                  </li>
                  <li>
                    <svg className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                    </svg>
                  </li>
                  <li>
                    <Link to="/products" className="hover:text-gray-700">Products</Link>
                  </li>
                  <li>
                    <svg className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                    </svg>
                  </li>
                  <li className="font-medium text-gray-900">
                    {product.name}
                  </li>
                </ol>
              </nav>
              
              <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-center object-cover"
                />
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-w-1 aspect-h-1 rounded-md overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-indigo-500' : 'ring-1 ring-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-center object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Product Info */}
            <div className="mt-10 lg:mt-0 lg:col-start-2 lg:row-span-2 lg:self-center">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
                
                <div className="mt-3">
                  <h2 className="sr-only">Product information</h2>
                  <p className="text-3xl text-gray-900">${product.price.toFixed(2)}</p>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <svg
                          key={rating}
                          className={`h-5 w-5 flex-shrink-0 ${
                            product.rating > rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="ml-3 text-sm text-gray-500">
                      {product.rating} ({product.reviewCount} reviews)
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="sr-only">Description</h3>
                  <p className="text-base text-gray-700">{product.description}</p>
                </div>
              </div>
              
              {product.colors?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-900">Color</h3>
                  
                  <div className="mt-2">
                    <div className="flex items-center space-x-3">
                      {product.colors?.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setSelectedColor(color.value)}
                          className={`relative -m-0.5 flex items-center justify-center rounded-full p-0.5 ${
                            selectedColor === color.value ? 'ring-2 ring-indigo-500' : ''
                          }`}
                        >
                          <span
                            className={`h-8 w-8 rounded-full border border-black border-opacity-10 bg-${color.value === 'silver' ? 'gray-200' : color.value}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-10">
                <div className="flex sm:flex-col1">
                  <div className="max-w-xs mr-4">
                    <label htmlFor="quantity" className="sr-only">
                      Quantity
                    </label>
                    <select
                      id="quantity"
                      name="quantity"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="rounded-md border border-gray-300 py-1.5 text-base sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`flex-1 max-w-xs rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white ${
                      product.inStock ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {product.inStock ? 'Add to cart' : 'Out of stock'}
                  </button>
                </div>
                
                {isAddedToCart && (
                  <div className="mt-3 text-sm text-green-600">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added to cart!
                    </div>
                  </div>
                )}
              </div>
              
              {product.features?.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-medium text-gray-900">Features</h3>
                  
                  <div className="mt-4 prose prose-sm text-gray-500">
                    <ul className="list-disc pl-5 space-y-2">
                      {product.features?.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="mt-8 border-t border-gray-200 pt-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Shipping Information</h3>
                </div>
                
                <div className="mt-4 prose prose-sm text-gray-500">
                  <p>Free shipping on orders over $100. Standard shipping takes 3-5 business days.</p>
                  <p className="mt-2">Express shipping available at checkout.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Price Forecast Chart */}
          {product._id && (
            <div className="mt-16 border-t border-gray-200 pt-10">
              <PriceForecastChart product={{
                _id: product._id,
                name: product.name,
                price: product.price,
                category: product.category,
                brand: product.brand,
                description: product.description,
                features: product.features,
                countInStock: product.countInStock
              }} />
            </div>
          )}
          
          {/* Similar Products */}
          {product._id && (
            <div className="mt-16 border-t border-gray-200 pt-10">
              <h2 className="text-2xl font-bold text-gray-900">You might also like</h2>
              <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct.id} className="group relative">
                    <div className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                      <img
                        src={relatedProduct.image || 'https://via.placeholder.com/300'}
                        alt={relatedProduct.name}
                        className="w-full h-full object-center object-cover"
                      />
                    </div>
                    <div className="mt-4 flex justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          <Link to={`/product/${relatedProduct.id}`}>
                            <span aria-hidden="true" className="absolute inset-0" />
                            {relatedProduct.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{relatedProduct.category}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">${relatedProduct.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Reviews Section */}
          <div className="mt-16 border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            
            <div className="mt-6 grid gap-y-10 gap-x-6 sm:grid-cols-1 lg:grid-cols-2">
              {/* Sample reviews - in a real app, these would come from the API */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <svg
                        key={rating}
                        className={`h-5 w-5 flex-shrink-0 ${
                          5 > rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <h3 className="ml-2 text-sm font-medium text-gray-900">Amazing sound quality!</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">These headphones exceeded my expectations. The noise cancellation is incredible and they're super comfortable to wear all day.</p>
                <p className="text-xs text-gray-500">John D. - 2 months ago</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <svg
                        key={rating}
                        className={`h-5 w-5 flex-shrink-0 ${
                          4 > rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <h3 className="ml-2 text-sm font-medium text-gray-900">Great battery life</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">I'm really impressed with the battery life. I only have to charge these about once a week with daily use.</p>
                <p className="text-xs text-gray-500">Sarah M. - 3 weeks ago</p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Load More Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetail; 