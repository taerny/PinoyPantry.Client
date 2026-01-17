/**
 * Cart Types
 * These types define the structure for shopping cart functionality.
 */

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string; // For Shopify variants
  sku?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string, change: number) => void;
  removeItem: (id: string) => void;
  getCartCount: () => number;
  clearCart: () => void;
}

export interface CheckoutInfo {
  cartItems: CartItem[];
  subtotal: number;
  shipping: number;
  tax?: number;
  total: number;
}
