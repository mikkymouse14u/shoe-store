import { useState, type ChangeEvent, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import api from "../api/api";
import type { AuthUser } from "../types/auth";

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

// Same helper as Admin.tsx: narrows a caught `unknown` error down to a
// readable string via type guards (`axios.isAxiosError`, `instanceof Error`).
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function Signup() {
  const navigate = useNavigate();
  const [submitting, _setSubmitting] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await api.post("/auth/signup", formData);
      //auto-login after sucessful singup
      const loginRes = await api.post<{ token: string; user: AuthUser }>(
        "/auth/login",
        {
          email: formData.email,
          password: formData.password,
        },
      );

      const { token, user } = loginRes.data;
      if (token) {
        localStorage.setItem("token", token);
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }

        toast.success("Account created successfully");
        navigate("/");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Sign up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name (optional)
          </label>
          <input
            name="name"
            type="text"
            onChange={handleChange}
            autoComplete="name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
          />
        </div>
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
          disabled={submitting}
          className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
        >
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Already have an account?{" "}
        <NavLink
          to="/login"
          className="text-red-500 font-medium hover:underline"
        >
          Log in
        </NavLink>
      </p>
    </div>
  );
}

export default Signup;
