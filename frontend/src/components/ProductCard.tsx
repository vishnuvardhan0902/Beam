import React from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    images?: string[];
    category?: string;
    rating?: number;
    reviewCount?: number;
    numReviews?: number;
  };
  showRating?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showRating = true }) => {
  const productImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300');
  const reviews = product.reviewCount || product.numReviews || 0;
  
  return (
    <div className="group relative">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75">
        <img
          src={productImage}
          alt={product.name}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <Link to={`/product/${product.id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </Link>
          </h3>
          {product.category && (
            <p className="mt-1 text-sm text-gray-500">{product.category}</p>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</p>
      </div>
      {showRating && product.rating !== undefined && (reviews > 0) && (
        <div className="mt-2 flex items-center">
          <div className="flex items-center">
            {[0, 1, 2, 3, 4].map((star) => (
              <svg
                key={star}
                className={`h-4 w-4 flex-shrink-0 ${
                  product.rating > star ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="ml-2 text-xs text-gray-500">
            {reviews} reviews
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductCard; 