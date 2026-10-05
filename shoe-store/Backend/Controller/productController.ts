import type { Request, Response } from "express";
import Product from "../models/Product.js";
import { getErrorMessage } from "../utils/errors.js";

// Fields arrive as unknown-ish from JSON — typed permissively because the
// hand-rolled validation logic below already coerces/validates every field
// at runtime.
interface CreateProductBody {
  name?: unknown;
  brand?: unknown;
  category?: unknown;
  price?: unknown;
  description?: unknown;
  images?: unknown;
}

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    // Product.find() with no filter returns every document in the
    // collection.
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    // 500 Internal Server Error: unlike the 400s in authController.ts,
    // this route has no bad-input case to report — if this fails, it's
    // something unexpected on the server's side (e.g. the database is
    // unreachable), not something the caller did wrong.
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const createProduct = async (req: Request<{}, {}, CreateProductBody>, res: Response) => {
  try {
    const { name, brand, category, price, description, images } = req.body;

    // Keep only the images that are actually filled in — the admin form
    // sends a fixed number of URL boxes and most of them stay empty.
    // String(url) covers the (typed-as-unknown) case where a box's value
    // isn't even a string; .trim() removes stray whitespace; .filter(Boolean)
    // drops any entry that's now an empty string.
    const cleanImages = Array.isArray(images)
      ? images.map((url) => String(url).trim()).filter(Boolean)
      : [];

    // Collect every validation problem instead of stopping at the first
    // one, so the client can show the user all the issues with the form
    // at once rather than making them fix and resubmit repeatedly.
    const errors: string[] = [];

    // Each field arrives typed as `unknown` (see CreateProductBody above),
    // so before using it as a string we narrow it with `typeof x ===
    // "string"`, falling back to "" otherwise — that fallback then fails
    // the `.trim()` truthiness checks below, which is exactly what we want
    // for missing/malformed input.
    const nameStr = typeof name === "string" ? name : "";
    const brandStr = typeof brand === "string" ? brand : "";
    const descriptionStr = typeof description === "string" ? description : "";
    // Business rule: only "men" or "women" are valid categories — this is
    // the same fixed list enforced by the `enum` on the Product schema
    // (models/Product.ts), checked here too so we can return a clean 400
    // with a helpful message instead of letting Mongoose's own validation
    // error surface later.
    const validCategory: "men" | "women" | null =
      category === "men" || category === "women" ? category : null;

    if (!nameStr.trim()) errors.push("Name is required");
    if (!brandStr.trim()) errors.push("Brand is required");
    if (!descriptionStr.trim()) errors.push("Description is required");
    if (!validCategory) errors.push("Category must be men or women");
    if (!cleanImages.length) errors.push("At least one image URL is required");

    // Number(undefined) is NaN and Number("") is 0, so check both.
    const numericPrice = Number(price);
    if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) {
      errors.push("Price must be a number greater than 0");
    }

    if (errors.length) {
      // 400 Bad Request: the request reached the server fine, but the
      // data in it fails our validation rules — that's on the caller to
      // fix, so it's not a 500.
      return res.status(400).json({ message: errors.join(". ") });
    }

    if (!validCategory) {
      // Unreachable in practice — errors.length === 0 already guarantees
      // validCategory is set — but narrows the type for Product.create().
      // Without this, TypeScript would still see validCategory's type as
      // `"men" | "women" | null` here and refuse to pass it to a field
      // typed as `"men" | "women"`.
      return res.status(400).json({ message: "Category must be men or women" });
    }

    const product = await Product.create({
      name: nameStr.trim(),
      brand: brandStr.trim(),
      category: validCategory,
      price: numericPrice,
      description: descriptionStr.trim(),
      images: cleanImages,
    });

    // 201 means "created", not just "ok".
    res.status(201).json(product);
  } catch (error) {
    // Reaching here means something failed after our own validation
    // already passed (e.g. a database error) — a server-side problem, so
    // 500 rather than 400.
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    // Route params (from "/:id" in productRoutes.ts) always come through
    // as strings, matching req.params.id's type here.
    const productID = req.params.id;
    const product = await Product.findById(productID);

    if (!product) {
      // 404 Not Found: the request and the id format were both fine, the
      // server works fine — there's just no product with this id. This is
      // distinct from the 400s used elsewhere for bad/missing input.
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    // Uses getErrorMessage the same way getAllProducts and createProduct
    // do above, so all three controller functions report errors
    // consistently.
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
