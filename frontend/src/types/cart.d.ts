export interface CartItem {
  product: string;
  name: string;
  image: string;
  price: number;
  countInStock: number;
  qty: number;
  color: string;
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
  itemCount: number;
  addToCart: (id: string, qty: number, color: string) => Promise<void>;
  removeFromCart: (id: string, color: string) => void;
  updateCartItemQty: (id: string, qty: number, color: string) => void;
  saveShippingAddress: (data: ShippingAddress) => void;
  savePaymentMethod: (method: string) => void;
  clearCart: () => void;
}

declare module '../context/CartContext' {
  export const CartProvider: React.FC<{ children: React.ReactNode }>;
  export const useCart: () => CartContextType;
  export default CartContextType;
} 