import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './Contexts/CartContext'
import { AuthProvider } from './Contexts/AuthContext'

// This is the entry point of the whole app — the one file that actually
// attaches React to the real webpage. Everything else (App, pages,
// components) is just plain data/JSX until this file mounts it into the DOM.

// `document.getElementById("root")` returns `HTMLElement | null` because
// TypeScript can't know the <div id="root"> in index.html actually exists.
// The trailing `!` is the "non-null assertion" operator: it tells TypeScript
// "trust me, this will never be null" and silences the type error. It's only
// safe here because index.html is guaranteed to have that div.
createRoot(document.getElementById("root")!).render(
  // StrictMode is a dev-only helper that intentionally double-runs some
  // code (like effects) to help surface bugs early. It renders nothing
  // itself and is stripped out of production builds.
  <StrictMode>
    {/* Context providers wrap the app so every component underneath can
        read shared state (cart, logged-in user) via useCart()/useAuth()
        without passing props down manually through every level. */}
    <CartProvider>
      <AuthProvider>
        {/* BrowserRouter enables client-side routing: clicking links updates
            the URL and swaps which page is shown without a full page reload. */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </CartProvider>
  </StrictMode>,
);
