import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "react-toastify";
import type { CartContextValue, CartItem } from "../types/cart";
import type { Product } from "../types/product";

// Same Context pattern as AuthContext: a shared "box" holding the cart plus
// the functions to change it, readable anywhere via useCart().
// Context, Provider and the useCart() hook are meant to live together here.
// eslint-disable-next-line react-refresh/only-export-components
export const cartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // The cart lives only in memory (no localStorage), so it resets on a
  // full page refresh. Starts as an empty array — nothing in the cart yet.
  const [cart, setCart] = useState<CartItem[]>([]);

  const addTocart = (product: Product, quantity: number) => {
    // Passing a function to setCart (rather than a new array built from
    // the `cart` variable directly) guarantees we're always updating from
    // the latest cart state, even if multiple updates happen close together.
    setCart((prevCart) => {
      // Match by `_id` (Mongo's document id), not by object identity or a
      // generic `id` field — `_id` is the one stable identifier the backend
      // guarantees on every product, so it's the correct key to detect
      // "is this shoe already in the cart".
      const existingItem = prevCart.find((item) => item._id === product._id);

      if (existingItem) {
        // Already in the cart: bump its quantity instead of adding a
        // duplicate row.
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      } else {
        // New to the cart: spread the product's fields plus a quantity
        // into a new CartItem (see types/cart.ts).
        return [...prevCart, { ...product, quantity }];
      }
    });

    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (id: string) => {
    // Again, `_id` is the key removals are matched on.
    setCart((prevCart) => prevCart.filter((item) => item._id !== id));
  };

  return (
    <cartContext.Provider value={{ cart, addTocart, removeFromCart }}>
      {children}
    </cartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- see note above.
export function useCart() {
  const ctx = useContext(cartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
