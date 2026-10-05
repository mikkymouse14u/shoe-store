// Shared model interfaces mirroring the Mongoose schemas in
// models/Product.ts and models/user.ts.
//
// Mongoose schemas describe validation/behavior at RUNTIME (e.g. "this
// field is required", "default to this value"), but they don't by
// themselves give TypeScript compile-time knowledge of a document's shape.
// These interfaces are that compile-time shape: they're handed to
// `mongoose.Schema<IProduct>` / `mongoose.model<IProduct>(...)` (generics —
// think of them as a variable, but for a type instead of a value) so that
// everywhere a Product or User document is used, TypeScript knows exactly
// which fields exist and what type each one is.

export interface IProduct {
  name: string;
  brand: string;
  category: "men" | "women";
  price: number;
  description: string;
  images: string[];
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  // user.js has {timestamps: true}, so Mongoose adds these automatically.
  createdAt: Date;
  updatedAt: Date;
}

// The only user fields that are ever safe to send back to the browser.
// Matches authController.js's publicUser() helper. Deliberately excludes
// `password` — even hashed, it has no business leaving the server.
export interface PublicUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}
