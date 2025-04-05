declare module '../services/api.js' {
  // Product interfaces
  export interface Product {
    _id: string;
    name: string;
    price: number;
    description: string;
    brand: string;
    category: string;
    countInStock: number;
    rating: number;
    numReviews: number;
    images: string[];
    reviews: Review[];
    colors?: { name: string; value: string }[];
    features?: string[];
  }

  export interface Review {
    _id: string;
    name: string;
    rating: number;
    comment: string;
    user: string;
    createdAt: string;
  }

  // API functions
  export function getProducts(keyword?: string, pageNumber?: string): Promise<{ 
    products: Product[],
    page: number,
    pages: number
  }>;
  
  export function getProductDetails(id: string): Promise<Product>;
  export function getTopProducts(): Promise<Product[]>;
  export function login(email: string, password: string): Promise<any>;
  export function register(name: string, email: string, password: string): Promise<any>;
  export function logout(): void;
  export function getUserProfile(): Promise<any>;
  export function updateUserProfile(user: any): Promise<any>;
  export function addToCart(id: string, qty: number, color: string): Promise<any>;
  export function removeFromCart(id: string, color: string): any;
  export function createOrder(order: any): Promise<any>;
  export function getOrderDetails(id: string): Promise<any>;
  export function payOrder(orderId: string, paymentResult: any): Promise<any>;
  export function listMyOrders(): Promise<any>;
  
  const api: any;
  export default api;
} 