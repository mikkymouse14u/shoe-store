import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../Contexts/AuthContext";

// `ReactNode` is the type for "anything React can render" — a JSX element,
// a string, a number, null, an array of those, etc. Here it's whatever was
// placed between <RequireAdmin> and </RequireAdmin> in App.tsx.
//
// Keeps the admin page out of the menu and out of the router for everyone
// else. This is convenience, not security — the real check is on the
// server, in Backend/middleware/auth.js. Anyone can edit localStorage.
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // <Navigate> is a component (not a function call) that, when rendered,
  // redirects the browser to a different route. `replace` swaps the current
  // history entry instead of adding a new one, so the back button doesn't
  // bounce the user straight back into the page they were just blocked from.
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}
