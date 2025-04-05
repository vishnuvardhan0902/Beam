// Type definitions for frontend/src/services/api.js

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  images?: string[];
  rating: number;
  numReviews: number;
  countInStock: number;
}

interface ProductsApiResponse {
  products: Product[];
  pages: number;
  page: number;
}

interface Address {
  _id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface PaymentMethod {
  _id: string;
  cardType: string;
  cardName: string;
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

export function getProducts(keyword?: string, pageNumber?: string): Promise<ProductsApiResponse>;
export function getProductDetails(id: string): Promise<Product>;
export function getTopProducts(): Promise<Product[]>;

export function login(email: string, password: string): Promise<UserInfo>;
export function googleLogin(googleData: any): Promise<UserInfo>;
export function register(name: string, email: string, password: string): Promise<UserInfo>;
export function logout(): void;
export function getUserProfile(): Promise<UserInfo | null>;
export function updateUserProfile(user: Partial<UserInfo>): Promise<UserInfo>;

export function getUserAddresses(): Promise<Address[]>;
export function addUserAddress(address: Omit<Address, '_id' | 'isDefault'>): Promise<Address>;
export function updateUserAddress(addressId: string, address: Partial<Address>): Promise<Address>;
export function deleteUserAddress(addressId: string): Promise<{ message: string }>;
export function setDefaultAddress(addressId: string): Promise<Address[]>;

export function getUserPaymentMethods(): Promise<PaymentMethod[]>;
export function addUserPaymentMethod(paymentMethod: Omit<PaymentMethod, '_id' | 'isDefault'>): Promise<PaymentMethod>;
export function updateUserPaymentMethod(paymentMethodId: string, paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod>;
export function deleteUserPaymentMethod(paymentMethodId: string): Promise<{ message: string }>;
export function setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod[]>;

export function updateUserCart(cartItems: any[]): Promise<any[]>; 