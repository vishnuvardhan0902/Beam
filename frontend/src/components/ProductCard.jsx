import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProductCard = (props) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  // Handle both new props format and legacy product object format
  const { product, showRating = true, className = '' } = props;
  
  // If using the new format, use direct props; otherwise extract from product object
  const id = props.id || (product && product.id);
  const title = props.title || (product && product.name);
  const price = props.price || (product && product.price) || 0;
  const category = props.category || (product && product.category);
  const rating = props.rating || (product && product.rating) || 0;
  const reviewCount = props.reviewCount || (product && (product.reviewCount || product.numReviews)) || 0;
  
  // Handle various image formats
  let imageUrl = 'https://via.placeholder.com/300';
  if (props.image) {
    imageUrl = props.image;
  } else if (product) {
    if (product.image) {
      imageUrl = product.image;
    } else if (product.images && product.images.length > 0) {
      imageUrl = product.images[0];
    }
  }
  
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    if (!user) {
      // Save intended action in sessionStorage
      sessionStorage.setItem('redirectAfterLogin', '/cart');
      sessionStorage.setItem('pendingCartItem', JSON.stringify({
        id,
        title: title || '',
        price,
        image: imageUrl,
        quantity: 1
      }));
      
      // Redirect to login with a toast notification
      toast.info('Please log in to add items to your cart', {
        position: "bottom-right",
        autoClose: 3000,
      });
      
      navigate('/login?redirect=/cart');
      return;
    }
    
    setIsAddingToCart(true);
    
    // Ensure proper structure for cart item
    const cartItem = {
      id,
      title: title || '',
      price: typeof price === 'number' ? price : parseFloat(price) || 0,
      image: imageUrl,
      quantity: 1
    };
    
    try {
      console.log('Adding item to cart:', cartItem);
      
      // Call the addToCart function with proper parameters
      if (typeof addToCart === 'function') {
        // For object-based API
        await addToCart(cartItem);
      } else {
        console.error('addToCart is not a function', addToCart);
      }
      
      // Show success toast
      toast.success(`${truncateText(title, 30)} added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error(`Failed to add ${truncateText(title, 30)} to cart`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  // Helper function to truncate text
  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  return (
    <div 
      className={`card group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
          <img
            src={imageUrl}
            alt={title || 'Product'}
            className="h-full w-full object-contain transition-opacity duration-300"
            style={{ 
              objectPosition: 'center',
              padding: '0.5rem'
            }}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/300';
            }}
          />
        </div>
        
        {/* Quick add to cart button - Only show when user is signed in */}
        {user && (
          <div 
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="w-full bg-white text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-100 transition-all duration-200 flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Category badge */}
        {category && (
          <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-medium px-2 py-1 rounded-full">
            {category}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              <Link to={`/product/${id}`} className="hover:text-indigo-600 transition-colors duration-200">
                {title}
              </Link>
            </h3>
          </div>
          <p className="text-sm font-bold text-gray-900">${price.toFixed(2)}</p>
        </div>
        
        {showRating && (
          <div className="mt-2 flex items-center">
            <div className="flex items-center">
              {[0, 1, 2, 3, 4].map((star) => (
                <svg
                  key={star}
                  className={`h-4 w-4 flex-shrink-0 ${
                    rating > star ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="ml-2 text-xs text-gray-500">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        )}
        
        {/* Add to cart button for mobile or non-hover devices - Only show when user is signed in */}
        {user && (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="sm:hidden w-full mt-3 flex items-center justify-center bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200"
          >
            {isAddingToCart ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 