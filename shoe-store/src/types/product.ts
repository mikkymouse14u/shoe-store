// Describes the shape of a product exactly as the backend sends it.
export interface Product {
  _id: string;
  name: string;
  brand: string;
  // `"men" | "women"` is a union of two exact string values (a "string
  // literal union" — a lightweight version of an enum). TypeScript will
  // reject any other string here, e.g. `category: "kids"` would not compile.
  category: "men" | "women";
  price: number;
  description: string;
  images: string[];
}

// Admin.jsx's form state. `price` deliberately stays a string here — it is
// bound to a number input's `.value`, which is always a string — and is
// only converted to a number at the point the POST request body is built.
export interface ProductDraft {
  name: string;
  brand: string;
  category: "men" | "women";
  price: string;
  description: string;
  images: string[];
}
