import type { JwtPayload } from "jsonwebtoken";

// What login() signs into the JWT (see Controller/authController.ts).
export interface AuthTokenPayload {
  id: string;
  role: "user" | "admin";
}

// jwt.verify() only proves the token's signature is valid and it hasn't
// been tampered with — it does NOT know what shape the payload inside is
// supposed to be. Its return type is `string | JwtPayload`, i.e. "some
// decoded JSON object, or a plain string if a bare string was ever signed."
// We need to narrow that down to "an object that actually has our `id`
// and `role` fields" before it's safe to read `decoded.id` anywhere else.
//
// This is a "type guard": a function whose return type is
// `decoded is AuthTokenPayload` instead of plain `boolean`. Returning
// `true` doesn't just tell the caller "yes" — it tells TypeScript itself
// to narrow `decoded`'s type to `AuthTokenPayload` for the rest of that
// code path (e.g. inside the `if (isAuthTokenPayload(decoded))` block in
// middleware/auth.ts), so `decoded.id` and `decoded.role` become safe to
// use without further checks or casts.
export function isAuthTokenPayload(
  decoded: string | JwtPayload
): decoded is AuthTokenPayload {
  return (
    typeof decoded === "object" &&
    decoded !== null &&
    typeof (decoded as Record<string, unknown>).id === "string" &&
    ((decoded as Record<string, unknown>).role === "user" ||
      (decoded as Record<string, unknown>).role === "admin")
  );
}
