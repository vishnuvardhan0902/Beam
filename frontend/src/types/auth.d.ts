export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isSeller: boolean;
  token?: string;
  avatar?: string;
  createdAt?: string;
  cart?: Array<{
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  googleLogin: () => Promise<User>;
  logout: () => Promise<void>;
  updateUserState: (userData: User) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
}

export interface GoogleUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface Product {
  _id: string;
  user: string;
  name: string;
  image: string;
  brand: string;
  category: string;
  description: string;
  rating: number;
  numReviews: number;
  price: number;
  countInStock: number;
  colors?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  _id: string;
  product: Product;
  quantity: number;
  amount: number;
  date: string;
  customer: string;
} 