export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
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
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface GoogleUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
} 