import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { getProductDetails, createProduct, updateProduct } from '../services/api';
import { getOptimizedPrice } from '../services/priceOptimizer';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Cloudinary constants
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dadytm6jv/image/upload';
const UPLOAD_PRESET = 'cloud_dotThoughts';

const ProductEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  // Check if we're on the /new route or if id is 'new'
  const isNewProduct = location.pathname.includes('/product/new') || id === 'new';
  const isEditMode = !isNewProduct && !!id;
  const navigate = useNavigate();
  const { user, isAuthenticated, isSeller } = useAuthContext();
  
  // Log for debugging
  console.log('Path:', location.pathname);
  console.log('ID param:', id);
  console.log('Is new product:', isNewProduct);
  console.log('Is edit mode:', isEditMode);
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');
  const [colors, setColors] = useState<{name: string, value: string}[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorValue, setNewColorValue] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isOptimizingPrice, setIsOptimizingPrice] = useState(false);
  const [optimizedPrice, setOptimizedPrice] = useState<number | null>(null);

  // Ensure only sellers can access this page
  useEffect(() => {
    if (!isAuthenticated || !isSeller) {
      navigate('/login');
    }
  }, [isAuthenticated, isSeller, navigate]);

  // Load product data in edit mode
  useEffect(() => {
    const loadProductData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const product = await getProductDetails(id);
          
          // Populate form fields
          setName(product.name);
          setPrice(product.price.toString());
          setImages(product.images || []);
          setBrand(product.brand);
          setCategory(product.category);
          setCountInStock(product.countInStock.toString());
          setDescription(product.description);
          setColors(product.colors || []);
          setFeatures(product.features || []);
          
          setLoading(false);
        } catch (err: any) {
          setError(err.message || 'Failed to load product');
          setLoading(false);
        }
      }
    };
    
    loadProductData();
  }, [id, isEditMode]);

  // Upload single image to Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  // Upload multiple images and track progress
  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImageToCloudinary(files[i]);
        uploadedUrls.push(url);
        
        // Update progress
        const progress = Math.round(((i + 1) / files.length) * 100);
        setUploadProgress(progress);
      }
      
      return uploadedUrls;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      
      // Create preview URLs
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveImageFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddColor = () => {
    if (newColorName && newColorValue && !colors.some(c => c.name === newColorName)) {
      setColors([...colors, { name: newColorName, value: newColorValue }]);
      setNewColorName('');
      setNewColorValue('');
    }
  };

  const handleRemoveColor = (colorName: string) => {
    setColors(colors.filter(color => color.name !== colorName));
  };

  const handleAddFeature = () => {
    if (newFeature && !features.includes(newFeature)) {
      setFeatures([...features, newFeature]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // First upload all images to Cloudinary
      let allImages = [...images]; // Start with existing images
      
      if (imageFiles.length > 0) {
        try {
          const uploadedUrls = await uploadImages(imageFiles);
          allImages = [...allImages, ...uploadedUrls];
        } catch (err: any) {
          setError('Failed to upload images: ' + err.message);
          setLoading(false);
          return;
        }
      }
      
      if (allImages.length === 0) {
        setError('At least one product image is required');
        setLoading(false);
        return;
      }
      
      // Build product data
      const productData = {
        name,
        price: parseFloat(price),
        images: allImages,
        brand,
        category,
        countInStock: parseInt(countInStock),
        description,
        colors,
        features
      };
      
      let result;
      if (!isNewProduct && id) {
        console.log('Updating existing product with ID:', id);
        result = await updateProduct(id, productData);
      } else {
        console.log('Creating a new product');
        result = await createProduct(productData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/seller/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  // Handle optimizing price with Gemini API
  const handleOptimizePrice = async () => {
    if (!name || !category || !description) {
      setError('Please fill in name, category, and description before optimizing price');
      return;
    }
    
    try {
      setIsOptimizingPrice(true);
      setError(null);
      
      const productDetails = {
        name,
        price: parseFloat(price) || 0,
        category,
        brand,
        description,
        features,
        countInStock: parseInt(countInStock) || 0
      };
      
      console.log('Requesting price optimization for:', productDetails);
      const suggestedPrice = await getOptimizedPrice(productDetails);
      console.log('Received optimized price:', suggestedPrice);
      
      setOptimizedPrice(suggestedPrice);
      // Don't automatically set the price - let the user decide
      
    } catch (err: any) {
      setError('Failed to optimize price: ' + (err.message || 'Unknown error'));
      console.error('Price optimization error:', err);
    } finally {
      setIsOptimizingPrice(false);
    }
  };
  
  const applyOptimizedPrice = () => {
    if (optimizedPrice) {
      setPrice(optimizedPrice.toString());
      setOptimizedPrice(null); // Clear the suggestion after applying
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className="bg-gray-50 py-8 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {!isNewProduct ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {!isNewProduct 
                ? 'Update your product information below' 
                : 'Fill in the details to add a new product to your store'}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>Product {!isNewProduct ? 'updated' : 'created'} successfully! Redirecting...</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              {/* Price and Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    id="price"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="countInStock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    id="countInStock"
                    min="0"
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              {/* Brand and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home">Home</option>
                    <option value="Books">Books</option>
                    <option value="Toys">Toys</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              {/* Product Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Images
                </label>
                <div className="mt-1 flex flex-wrap items-center gap-4">
                  {/* Existing images from the product */}
                  {images.map((img, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <img 
                        src={img} 
                        alt={`Product ${index + 1}`} 
                        className="h-32 w-32 object-cover rounded-md border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  
                  {/* Preview of newly added image files */}
                  {imageFiles.map((file, index) => (
                    <div key={`new-${index}`} className="relative">
                      <img 
                        src={URL.createObjectURL(file)}
                        alt={`New upload ${index + 1}`} 
                        className="h-32 w-32 object-cover rounded-md border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  
                  {/* Upload button */}
                  <label className="cursor-pointer bg-white h-32 w-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="mt-2 text-sm text-gray-500">Add Image</span>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="sr-only"
                      multiple
                    />
                  </label>
                </div>
                {isUploading && (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
                  </div>
                )}
              </div>
              
              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Colors
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Color name (e.g. Red)"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="flex">
                    <input
                      type="text"
                      value={newColorValue}
                      onChange={(e) => setNewColorValue(e.target.value)}
                      placeholder="Color value (e.g. #FF0000)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <span 
                      key={color.name} 
                      className="bg-gray-100 px-2 py-1 rounded-md text-sm flex items-center"
                    >
                      <span 
                        className="w-3 h-3 rounded-full mr-1"
                        style={{ backgroundColor: color.value }}
                      ></span>
                      {color.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(color.name)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Features
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Enter a product feature"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2">
                  <ul className="list-disc pl-5 space-y-1">
                    {features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center justify-between">
                        <span>{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(feature)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>
              
              {/* Price Optimization */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Price Optimization</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get an AI-suggested optimal price based on your product details to maximize your sales potential.
                </p>
                
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleOptimizePrice}
                    disabled={isOptimizingPrice || loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                  >
                    {isOptimizingPrice ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        Optimize Price
                      </>
                    )}
                  </button>
                  
                  {optimizedPrice !== null && (
                    <div className="ml-4 flex items-center">
                      <div className="bg-green-100 px-3 py-2 rounded-md">
                        <span className="text-sm text-gray-700">Suggested price: </span>
                        <span className="font-bold text-green-700">${optimizedPrice.toFixed(2)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={applyOptimizedPrice}
                        className="ml-2 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => setOptimizedPrice(null)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/seller/dashboard')}
                  className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || isUploading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading || isUploading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isUploading ? 'Uploading...' : 'Saving...'}
                    </span>
                  ) : (
                    !isNewProduct ? 'Update Product' : 'Create Product'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductEditor; 