import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
} from "../Controller/productController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public — anyone can browse the product catalog without logging in.
router.get("/", getAllProducts);

// Two gates, in order: are you logged in, THEN are you an admin.
// Hiding the admin page in the UI is not protection — this is.
// requireAuth and requireAdmin are middleware (see middleware/auth.ts):
// Express runs them in the order listed, and each one must call next()
// for the request to reach the following one, so createProduct only ever
// runs once both checks have passed.
router.post("/", requireAuth, requireAdmin, createProduct);

// Must stay LAST. "/:id" is a route parameter — it matches almost any
// single path segment ("/:id" matches "/abc123", "/new", "/anything"),
// so Express tries routes in the order they were registered and would
// match this one before ever reaching a more specific literal route
// registered after it. Any future literal route (e.g. "/featured") needs
// to be added above this line, not below it.
router.get("/:id", getProductById);

export default router;
