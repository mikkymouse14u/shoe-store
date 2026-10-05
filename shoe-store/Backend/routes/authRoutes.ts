import { Router } from "express";

import { login, signUp } from "../Controller/authController.js";

// Router() creates a mini standalone Express app: a group of routes that
// gets mounted onto the main app (in index.ts, as
// `app.use("/api/auth", authRoute)`) under a shared path prefix.
const router = Router();

// Both are POST, not GET, because they change server state (create a
// user / issue a new session token) rather than just fetching data — GET
// requests are expected to be safe to repeat/cache and not have side
// effects.
router.post("/signup", signUp);

router.post("/login", login);

export default router;
