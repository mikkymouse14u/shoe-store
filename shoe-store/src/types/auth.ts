import type { Dispatch, SetStateAction } from "react";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  // The backend never actually sends this field — Navbar.jsx reads it
  // defensively, so it's always undefined in practice. Typed optional to
  // match reality, not to promise backend support that doesn't exist.
  avatar?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  // This is the exact type React's own `useState` setter has. Writing it
  // out here means AuthContext can hand out its real `setUser` function
  // (from `useState`) as part of the context value, fully typed — callers
  // can pass either a new AuthUser/null, or an updater function, just like
  // calling `setUser` directly would allow.
  setUser: Dispatch<SetStateAction<AuthUser | null>>;
  login: (payload: { token: string; user: AuthUser }) => void;
  logout: () => void;
}
