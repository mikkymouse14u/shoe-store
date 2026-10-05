import type { Product } from "./product";

// `extends Product` means a CartItem has every field Product has (name,
// price, _id, etc.) plus the new `quantity` field below — it's just a
// Product that's also in someone's cart.
export interface CartItem extends Product {
  quantity: number;
}

export interface CartContextValue {
  cart: CartItem[];
  addTocart: (product: Product, quantity: number) => void;
  removeFromCart: (id: string) => void;
}
