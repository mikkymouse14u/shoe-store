import type { HydratedDocument } from "mongoose";
import type { IUser } from "../models.js";

// What middleware/auth.ts assigns to req.user:
//   User.findById(decoded.id).select("-password")
// — a hydrated user document with the password field excluded.
//
// `Omit<IUser, "password">` is a built-in TypeScript "utility type": it
// takes the IUser interface and produces a new type that's identical
// except the "password" key has been removed. That mirrors what
// `.select("-password")` actually does at runtime — the field is never
// fetched from MongoDB in the first place — so the type and the real data
// agree that req.user never has a password on it.
//
// `HydratedDocument<...>` is Mongoose's type for "a real document that
// came back from the database", as opposed to a plain object shaped like
// one — it adds Mongoose-specific extras like `._id` and `.save()`.
export type SafeUser = HydratedDocument<Omit<IUser, "password">>;

// Express's own `Request` type has no `user` property — it's added by our
// own middleware (requireAuth), not by Express itself, so TypeScript
// doesn't know about it out of the box. `declare global { namespace
// Express { ... } }` is TypeScript's "module augmentation" pattern: it
// reaches into a type that's already defined elsewhere (Express's Request
// interface) and adds a field to it, everywhere in the project, without
// having to change Express's own source code. After this file is loaded,
// every `req: Request` anywhere in the app knows `req.user` may exist.
//
// `user?:` (optional) reflects that req.user is only set for routes that
// actually ran the requireAuth middleware first — for public routes it's
// simply undefined.
declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

// This file must be a module (not a script) for `declare global` to work,
// which requires at least one top-level import or export. The real code
// above already has imports, but this empty `export {}` guarantees that
// even if those were removed, the file would still be treated as a module.
export {};
