import mongoose from "mongoose";
import type { IProduct } from "../types/models.js";

// mongoose.Schema<IProduct> is a generic — the <IProduct> tells TypeScript
// "the fields defined below should match the IProduct interface". This
// catches mistakes at compile time, e.g. a typo'd field name or a field
// given the wrong type, instead of only finding out at runtime.
const productSchema = new mongoose.Schema<IProduct>({
  // `required: true` means Mongoose will refuse to save a document missing
  // this field (throwing a validation error instead of writing incomplete
  // data to the database).
  name: { type: String, required: true },
  brand: { type: String, required: true },
  // `enum: [...]` restricts this field to exactly these values — Mongoose
  // rejects the save if `category` is anything other than "men" or
  // "women", so bad data can't get saved even if a caller sends something
  // else (see also the `validCategory` check in productController.ts,
  // which validates the same rule before we even attempt to save).
  category: { type: String, required: true, enum: ["men", "women"] },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  // `[{ type: String, required: true }]` (an array containing one field
  // definition) means "an array of strings", where each string in the
  // array must be non-empty — this is how Mongoose expresses "list of
  // values" for a schema field.
  images: [{ type: String, required: true }],
});

// mongoose.model<IProduct>("Product", productSchema) both registers the
// schema under the "Product" collection name and gives every document
// returned by this model (e.g. from .find() or .create()) the IProduct
// shape, so callers get autocomplete/type-checking on product fields.
export default mongoose.model<IProduct>("Product", productSchema);
