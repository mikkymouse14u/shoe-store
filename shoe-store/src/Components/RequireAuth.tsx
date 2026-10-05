import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../Contexts/AuthContext";

// Same guard pattern as RequireAdmin, but only checks that *someone* is
// logged in — no role requirement. Wraps routes like /product/:id and
// /category/:gender in App.tsx.
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
}
