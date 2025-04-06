export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  seller?: string; // ID of the seller who owns this product
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CartContextType {
  cartItems: CartItem[];
  shippingAddress: ShippingAddress | null;
  paymentMethod: string;
  loading: boolean;
  itemCount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  saveShippingAddress: (data: ShippingAddress) => void;
  savePaymentMethod: (data: string) => void;
  clearCart: () => void;
}

// This enables importing from CartContext.tsx
declare module '../context/CartContext' {
  export const CartProvider: React.FC<{ children: React.ReactNode }>;
  export const useCart: () => CartContextType;
  export default CartContext;
}

// This enables importing from CartContext.tsx with the .tsx extension
declare module '../context/CartContext.tsx' {
  export const CartProvider: React.FC<{ children: React.ReactNode }>;
  export const useCart: () => CartContextType;
  export default CartContext;
} 