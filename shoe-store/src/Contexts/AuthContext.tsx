import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthContextValue, AuthUser } from "../types/auth";

// --- React Context, explained ---
// Passing "who is logged in" down through props from App -> every page ->
// every button would be tedious. Context lets any component, no matter how
// deeply nested, read this value directly by calling useAuth() below,
// without every component in between having to pass it along.
//
// createContext<AuthContextValue | undefined>(undefined) creates a "box"
// that can hold an AuthContextValue, but starts out `undefined` because at
// this point there's no <AuthProvider> wrapping anything yet. Typing it as
// `AuthContextValue | undefined` (a "union type" — the value is one type OR
// the other) is what lets the useAuth() guard below catch the mistake of
// using this context outside its provider.
// Context, Provider and the useAuth() hook are meant to live together here.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Reads whatever user was saved in localStorage from a previous session, so
// a page refresh doesn't log the user out. Wrapped in try/catch because the
// stored JSON could in theory be corrupted or missing.
function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

// The Provider is the component that actually owns the shared state and
// makes it available to everything rendered inside it (see main.tsx, where
// <AuthProvider> wraps the whole app).
export function AuthProvider({ children }: { children: ReactNode }) {
  // useState gives this component a piece of data (`user`) that React
  // remembers between renders, plus a setter (`setUser`) that, when called,
  // tells React "this changed, please re-render anything that reads it".
  // Passing a function (`() => readStoredUser()`) instead of a plain value
  // means that work only runs once on the very first render, not on every
  // re-render.
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  // useEffect runs side effects — code that reaches outside of React, like
  // subscribing to a browser event. The empty dependency array (`[]`) at
  // the end means "run this once when the component first mounts, not on
  // every re-render". The function returned from it is cleanup, run when
  // the component unmounts, so the listener doesn't leak.
  //
  // Why listen for "storage" at all: it only fires when *another browser
  // tab* changes localStorage (e.g. logging out in one tab). This keeps
  // multiple open tabs in sync with each other.
  useEffect(() => {
    const onStorage = () => {
      setUser(readStoredUser());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = ({ token, user }: { token: string; user: AuthUser }) => {
    if (token) localStorage.setItem("token", token);
    if (user) localStorage.setItem("user", JSON.stringify(user));
    setUser(user || null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    // Every value passed here becomes readable by useAuth() anywhere below
    // this point in the component tree.
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// The custom hook components actually use to read auth state, e.g.
// `const { user, logout } = useAuth();`. Throwing here instead of silently
// returning undefined turns "forgot to wrap this in <AuthProvider>" into an
// immediate, obvious error instead of a confusing crash somewhere else.
// eslint-disable-next-line react-refresh/only-export-components -- see note above.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
