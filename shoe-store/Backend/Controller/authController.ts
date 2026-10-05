import type { Request, Response } from "express";
import type { HydratedDocument } from "mongoose";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { IUser, PublicUser } from "../types/models.js";
import { getErrorMessage } from "../utils/errors.js";
import { env } from "../config/env.js";

// These describe the shape of req.body for each route. Express itself
// doesn't validate or type req.body — it's just parsed JSON — so these
// interfaces are what let TypeScript check `req.body.email` etc. below.
// They're a compile-time hint only: a caller could still send the wrong
// shape at runtime, which is why signUp/login still handle missing/bad
// values (e.g. the `!user` check) rather than trusting the type blindly.
interface SignUpBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

// The only user fields that are ever safe to send back to the browser.
// Returning the whole Mongoose document would include the hashed password.
// HydratedDocument<IUser> is the type of a real document loaded from (or
// just saved to) MongoDB via this model, as opposed to a plain IUser
// object — it also carries Mongoose extras like `._id`.
const publicUser = (user: HydratedDocument<IUser>): PublicUser => ({
  // user._id is a Mongoose ObjectId, not a string — convert it explicitly
  // so PublicUser (and the JSON sent to the client) always gets a plain
  // string id.
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});

// Request<{}, {}, SignUpBody> is Express's generic Request type: the
// three type parameters are (URL route params, response body, request
// body) in that order. The first {} means "this route has no /:params",
// the second {} leaves the response body type as the default (unchecked),
// and SignUpBody says req.body should have that shape.
export const signUp = async (
  req: Request<{}, {}, SignUpBody>,
  res: Response,
) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    // check if the uer exists
    if (existingUser) {
      // 400 Bad Request: the request itself is fine, but this particular
      // email can't be used to sign up right now — that's the caller's
      // (user's) situation to fix, not a server problem.
      return res.status(400).json({
        message: "User already exist",
      });
    }

    // Enforce the minimum password length on the PLAINTEXT the user typed,
    // before it gets hashed below — checking it on the hash (which used to
    // happen via the schema's `minlength` on `password`) can never work,
    // since every bcrypt hash is already far longer than 6 characters.
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Passwords are never stored as plain text. bcrypt.genSalt generates
    // a random "salt" (extra random data mixed into the hash) so that two
    // users with the same password don't end up with identical hashes in
    // the database, and bcrypt.hash is a deliberately slow, one-way hash —
    // slow so that even if the database leaked, brute-forcing every
    // password back from its hash is impractical, and one-way so the
    // original password can never be recovered from what's stored, only
    // checked against (see bcrypt.compare in login below).
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 201 Created: a new resource (the user account) now exists as a
    // result of this request — distinct from a plain 200, which just
    // means "request succeeded" without implying anything new was made.
    res.status(201).json(publicUser(user));
  } catch (error) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { email, password } = req.body;
  try {
    // check if user exist

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({
        message: "User not Found",
      });

    // bcrypt.compare hashes the submitted password the same way and
    // checks it against the stored hash — this is the only way to verify
    // a bcrypt-hashed password, since the original can't be recovered
    // from the hash (see the comment on bcrypt.hash in signUp above).
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "invalid credentails",
      });
    }

    // jwt.sign bakes { id, role } (plus an expiry) into a signed token the
    // client will send back on every future request as proof of who they
    // are (see the Authorization header check in middleware/auth.ts).
    // The token's signature (using JWT_SECRET) is what stops a client
    // from forging or editing it — but note the role stored here is only
    // used to look the account up; requireAuth deliberately re-reads the
    // CURRENT role from the database on every request rather than trusting
    // this snapshot, since it can go stale for up to a day (expiresIn).
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },

      env.JWT_SECRET,

      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      message: "login successful",
      user: publicUser(user),
      token,
    });
  } catch (error) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
};
