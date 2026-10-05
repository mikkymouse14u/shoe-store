import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../Contexts/CartContext";
import { useAuth } from "../Contexts/AuthContext";

import { AiOutlineClose } from "react-icons/ai";
import { FiTrash2 } from "react-icons/fi";

function Navbar() {
  // Reading shared state from context (see Contexts/CartContext.tsx and
  // AuthContext.tsx) instead of receiving it via props.
  const { cart, removeFromCart } = useCart();

  // Purely local UI state — whether the cart dropdown / mobile sidebar are
  // open right now. Doesn't need to be shared, so plain useState is enough.
  const [showCart, setShowCart] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  // useNavigate gives a function to send the user to another route in code
  // (as opposed to <NavLink>, which does it via a click).
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartTransitionClasses = "transition-all duration-200 ease-out";
  const cartVisibilityClasses = showCart
    ? "opacity-100 translate-y-0 pointer-events-auto"
    : "opacity-0 translate-y-4 pointer-events-none";

  const handleLogout = () => {
    logout();
    setShowCart(false);
    navigate("/login");
  };

  return (
    <div className="relative flex items-center justify-between py-8 px-6 lg:px-20 md:border-b md:border-gray-200 max-w-7xl mx-auto">
      <div className="block md:hidden">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="cursor-pointer"
          aria-label="Toggle menu"
        >
          <img src="/images/icon-menu.svg" alt="menu bar" />
        </button>
      </div>

      <NavLink className="ml-4" to="/">
        <img src="/images/logo.svg" alt="" />
      </NavLink>

      <div className="hidden md:flex gap-16 ml-30  text-gray-500">
        <NavLink
          className={({ isActive }) =>
            isActive ? "text-black font-bold" : "hover:text-black"
          }
          to="/category/men"
        >
          Men
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive ? "text-black font-bold" : "hover:text-black"
          }
          to="/category/women"
        >
          Women
        </NavLink>

        {/* Only admins see this. Hiding it is convenience, not security —
            the real check lives on the server. */}
        {user?.role === "admin" && (
          <NavLink
            className={({ isActive }) =>
              isActive ? "text-red-500 font-bold" : "text-red-500 hover:text-red-600"
            }
            to="/admin"
          >
            Admin
          </NavLink>
        )}
      </div>

      <div className="flex ml-auto gap-8 items-center">
        {/* `condition ? <A/> : <B/>` picks which JSX to render — logged-in
            users see the cart/logout UI, everyone else sees a Login link. */}
        {user ? (
          <>
            {/* Cart toggle (desktop) */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative cursor-pointer hidden md:inline"
            >
              <img src="/images/icon-cart.svg" alt="" />

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-xs text-white font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Floating cart button (mobile) */}
            <button
              onClick={() => setShowCart(!showCart)}
              aria-label="Open cart"
              className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg cursor-pointer transition-transform duration-150 ease-out active:scale-95 active:-translate-y-1 md:hidden"
            >
              <img src="/images/icon-cart.svg" alt="" />

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-xs text-white font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3">
              <span className=" text-sm font-medium">
                {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 cursor-pointer"
              >
                Logout
              </button>
              <img
                className="w-10 rounded-full hidden md:inline"
                src={user.avatar || "/images/image-avatar.png"}
                alt=""
              />
            </div>
          </>
        ) : (
          <NavLink to="/login" className="text-red-500 font-medium ">
            Login
          </NavLink>
        )}

        {user && (
          <>
            {/* Mobile cart drawer */}
            <div
              className={`fixed bottom-18 right-4 w-80 max-w-[calc(100%-2rem)] bg-white shadow-xl rounded-xl p-4 z-40 md:hidden ${cartTransitionClasses} ${cartVisibilityClasses}`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                <h3 className="font-bold">Cart</h3>
                <button
                  onClick={() => setShowCart(false)}
                  aria-label="Close cart"
                  className="text-black cursor-pointer"
                >
                  <AiOutlineClose size={18} />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-center ">Your cart is empty</p>
              ) : (
                <>
                  <div className="py-4 space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between"
                      >
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />

                        <div className="text-sm">
                          <p>{item.name}</p>
                          <p className="text-gray-500">
                            x {item.quantity}
                            <span className="font-bold text-black ml-4">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="cursor-pointer text-gray-600 hover:text-red-600"
                          aria-label={`Remove ${item.name}`}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/*TOTAL*/}
                  <div className="flex justify-between font-bold border-t border-gray-100 pt-4 mt-2">
                    <span>Total</span>
                    <span>
                      $
                      {cart
                        .reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0,
                        )
                        .toFixed(2)}
                    </span>
                  </div>

                  <button className="w-full bg-red-500 hover:bg-red-600 transition text-white py-3 rounded-xl font-bold mt-4 shadow-md cursor-pointer">
                    Checkout
                  </button>
                </>
              )}
            </div>

            {/* Desktop cart dropdown */}
            <div
              className={`hidden md:block absolute right-0 top-14 w-80 bg-white shadow-xl rounded-xl p-4 z-50 ${cartTransitionClasses} ${cartVisibilityClasses}`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                <h3 className="font-bold">Cart</h3>
                <button
                  onClick={() => setShowCart(false)}
                  aria-label="Close cart"
                  className="text-black cursor-pointer"
                >
                  <AiOutlineClose size={18} />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-center ">Your cart is empty</p>
              ) : (
                <>
                  <div className="py-4 space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between"
                      >
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />

                        <div className="text-sm">
                          <p>{item.name}</p>
                          <p className="text-gray-500">
                            x {item.quantity}
                            <span className="font-bold text-black ml-4">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="cursor-pointer text-gray-600 hover:text-red-600"
                          aria-label={`Remove ${item.name}`}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/*TOTAL*/}
                  <div className="flex justify-between font-bold border-t border-gray-100 pt-4 mt-2">
                    <span>Total</span>
                    <span>
                      $
                      {cart
                        .reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0,
                        )
                        .toFixed(2)}
                    </span>
                  </div>

                  <button className="w-full bg-red-500 hover:bg-red-600 transition text-white py-3 rounded-xl font-bold mt-4 shadow-md cursor-pointer">
                    Checkout
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* New side bar section */}

      {/* Mobile Sidebar */}

      {showSidebar && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 bg-black bg-opacity-60 z-40 md:hidden"
          ></div>

          {/* Sidebar  */}
          <div
            className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 md:hididen transition-all duration-200 ease-out ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <img src="/images/logo.svg" alt="logo" className="w-24" />
              <button
                onClick={() => setShowSidebar(false)}
                className="cursor-pointer"
              >
                <AiOutlineClose size={20} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="p-4 space-y-4">
              <NavLink
                to="/category/men"
                onClick={() => setShowSidebar(false)}
                className={({ isActive }) =>
                  `block py-2 ${isActive ? "text-black font-bold border-l-4 border-red-500 pl-2" : "text-gray-600 pl-2 hover:text-black"}`
                }
              >
                Men
              </NavLink>

              <NavLink
                to="/category/women"
                onClick={() => setShowSidebar(false)}
                className={({ isActive }) =>
                  `block py-2 ${isActive ? "text-black font-bold border-l-4 border-red-500 pl-2" : "text-gray-600 pl-2 hover:text-black"}`
                }
              >
                Women
              </NavLink>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

export default Navbar;
