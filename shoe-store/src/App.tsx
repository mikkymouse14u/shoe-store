import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./Pages/Home";
import Contact from "./Pages/Contact";
import About from "./Pages/About";
import Collection from "./Pages/Collection";
import Navbar from "./Components/Navbar";
import Product from "./Components/Product";
import { ToastContainer } from "react-toastify";
import CategoryPage from "./Pages/CategoryPage";
import Signup from "./Pages/SignUp";
import Login from "./Pages/Login";
import RequireAuth from "./Components/RequireAuth";
import RequireAdmin from "./Components/RequireAdmin";
import Admin from "./Pages/Admin";

// The root component. It renders things that should appear on every page
// (Navbar, the toast popup container) plus a <Routes> table that decides
// which page component to show for the current URL.
function App() {
  return (
    // A component can only return one element, but we don't want an extra
    // wrapper <div> in the page. A "fragment" (<>...</>) groups multiple
    // elements without adding a real DOM node.
    <>
      <Navbar />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="collection" element={<Collection />} />

        {/* ":id" is a route parameter — a placeholder segment. Visiting
            /product/123 renders <Product/>, which can read "123" back out
            via the useParams() hook. */}
        <Route
          path="/product/:id"
          element={
            // RequireAuth is a "guard" component: it checks whether someone
            // is logged in before rendering its children, and redirects to
            // /login otherwise.
            <RequireAuth>
              <Product/>
            </RequireAuth>
          }
        />

        <Route
          path="/category/:gender"
          element={
            <RequireAuth>
              <CategoryPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            // Same guard idea, but also requires the admin role.
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
