import { useState, type ChangeEvent, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import api from "../api/api";
import { toast } from "react-toastify";
import type { AuthUser } from "../types/auth";

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  // Prefixed with `_` because it's currently unused (nothing reads
  // `_submitting` to e.g. disable the button while the request is in
  // flight) — the underscore is a convention that tells the linter this is
  // deliberately unused rather than a mistake.
  const [_submitting, _setSubmitting] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const { login } = useAuth();

  // One handler for both inputs: `e.target.name` ("email" or "password")
  // is used as a computed object key, so this works for either field
  // without needing two near-identical handlers.
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Forms reload the page by default when submitted — this stops that so
    // the request can be sent with fetch/axios instead.
    e.preventDefault();

    //clear previous toasts
    toast.dismiss();
    try {
      const res = await api.post<{ token: string; user: AuthUser }>(
        "/auth/login",
        formData,
      );

      const { token, user } = res.data;

      if (token) {
        // Saves the token/user via AuthContext, which also persists them
        // to localStorage so the session survives a page refresh.
        //update auth context
        login({ token, user });
        toast.success("Login successful");
        navigate("/");
      }
    } catch {
      toast.error("Unable to login");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Log In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            name="email"
            type="email"
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password (min 6 characters)
          </label>
          <input
            name="password"
            type="password"
            onChange={handleChange}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
        >
          Log In
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Don't have an account?{" "}
        <NavLink
          to="/signup"
          className="text-red-500 font-medium hover:underline"
        >
          Sing Up
        </NavLink>
      </p>
    </div>
  );
};

export default Login;
