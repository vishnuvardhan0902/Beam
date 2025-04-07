import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = (props) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  
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
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartItem = {
      id,
      title: title || '',
      price,
      image: imageUrl,
      quantity: 1
    };
    
    addToCart(cartItem);
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
            className={`h-full w-full object-contain sm:object-cover object-center transition-transform duration-300 ${
              isHovered ? 'scale-100' : 'scale-90'
            }`}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/300';
            }}
          />
        </div>
        
        {/* Quick add to cart button */}
        <div 
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={handleAddToCart}
            className="w-full bg-white text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add to Cart
          </button>
        </div>
        
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
      </div>
    </div>
  );
};

export default ProductCard; 