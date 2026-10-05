import mongoose from "mongoose";
import type { IUser } from "../types/models.js";

// mongoose.Schema<IUser> — see models/Product.ts for what the <IUser>
// generic buys us here (compile-time checking that this schema's fields
// match the IUser interface).
const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      // `trim: true` strips leading/trailing whitespace before saving
      // (so " Bob " becomes "Bob") — guards against accidental padding
      // from form input.
      trim: true,
      // `default: ""` is the value Mongoose uses if this field is left out
      // entirely when creating a document.
      default: "",
    },
    email: {
      type: String,
      required: true,
      // `unique: true` tells MongoDB to build a unique index on this
      // field, so two documents can never share the same email — a
      // duplicate signUp attempt fails at the database level as a second
      // line of defense (in addition to the `existingUser` check in
      // authController.ts).
      unique: true,
      // `lowercase: true` lowercases the value before saving, so
      // "Bob@Example.com" and "bob@example.com" are treated as the same
      // address instead of accidentally being allowed as two accounts.
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      // This is the already-hashed password (bcrypt output), not the
      // plaintext the user typed — see authController.ts's signUp, which
      // hashes it before ever calling User.create(). There's deliberately
      // no `minlength` here: bcrypt hashes are always much longer than any
      // reasonable minimum, so a length check on the hash could never
      // reject anything. The real minimum-password-length rule is enforced
      // on the plaintext in signUp, before it's hashed.
    },
    // A new account is ALWAYS a plain user. The only way to become an admin
    // is to be promoted directly in the database (see scripts/makeAdmin.js) —
    // if signUp accepted a role from the request body, anyone could sign
    // themselves up as an admin.
    role: {
      type: String,
      // Same purpose as category's enum on the Product schema: only
      // "user" or "admin" are ever valid values for this field.
      enum: ["user", "admin"],
      default: "user",
    },
  },
  // `{ timestamps: true }` (the schema's second argument, for
  // schema-wide options rather than per-field ones) tells Mongoose to
  // automatically add and maintain `createdAt` and `updatedAt` Date
  // fields on every document — set on creation and updated on every save,
  // without the app having to manage them itself. That's why IUser
  // (types/models.ts) declares createdAt/updatedAt even though they're
  // never set explicitly anywhere in this file.
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
