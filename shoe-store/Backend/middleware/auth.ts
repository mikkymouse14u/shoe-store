import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { isAuthTokenPayload } from "../types/auth.js";
import { env } from "../config/env.js";

// These two functions are Express "middleware": ordinary functions with
// the signature (req, res, next) that Express runs BEFORE a route's own
// handler. A middleware can inspect/modify the request, end the request
// itself by sending a response (as both functions below do when a check
// fails), or call `next()` to hand control on to whatever runs next
// (either another middleware or the final route handler). Route files
// wire these in by listing them before the handler, e.g.
// `router.post("/", requireAuth, requireAdmin, createProduct)`.

// AUTHENTICATION — who is making this request?
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Client sends the token as `Authorization: Bearer <token>`. Anything
  // else (missing header, wrong scheme) means we were never given a token
  // to check at all.
  const header = req.headers.authorization;

  // 401 Unauthorized means "we don't know who you are" (missing/invalid
  // credentials) — different from 403 Forbidden in requireAdmin below,
  // which means "we know who you are, but you're not allowed to do this".
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    // jwt.verify throws if the signature doesn't match (tampered/forged
    // token) or the token has expired — both cases are handled by the
    // catch block below, which treats them the same as "invalid token".
    const decoded = jwt.verify(header.split(" ")[1], env.JWT_SECRET);

    // jwt.verify's return type is `string | JwtPayload` — TypeScript has
    // no way to know our own {id, role} shape is inside. isAuthTokenPayload
    // is a type guard (see types/auth.ts) that both checks that shape at
    // runtime AND tells TypeScript it's now safe to read decoded.id /
    // decoded.role below as an AuthTokenPayload.
    if (!isAuthTokenPayload(decoded)) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // The role is read from the DATABASE, not taken from the token.
    // Tokens last a day, so one issued before someone was promoted (or
    // after they were demoted) would otherwise carry a stale role around
    // until it expired — trusting decoded.role directly would let a
    // demoted admin keep acting as one for up to 24 hours. Re-reading from
    // the DB on every request makes role changes take effect immediately.
    // `.select("-password")` tells Mongoose to fetch every field except
    // password, so the hash never even leaves the database for this query.
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      // The token is valid, but the account it points to was deleted
      // since the token was issued.
      return res.status(401).json({ message: "That account no longer exists" });
    }

    // Attach the loaded user to the request so later middleware/handlers
    // (like requireAdmin, or the controllers themselves) can read
    // req.user without hitting the database again. This only type-checks
    // because of the `declare global` augmentation in
    // types/express/index.d.ts, which adds `user` to Express's Request type.
    req.user = user;
    next();
  } catch {
    // Covers a malformed token, a bad signature, or an expired one — all
    // treated identically from the client's point of view: "log in again".
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// AUTHORIZATION — we already know who you are. Are you allowed to do this?
// Must run AFTER requireAuth, since it relies on req.user already being set.
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 403 Forbidden: the request is authenticated (we know who this is),
  // it's just not permitted for this role. A 404 would hide the route's
  // existence entirely, and a 401 would wrongly suggest logging in again
  // would help — neither applies here.
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }

  next();
};
