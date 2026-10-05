import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

// A single shared axios client, pre-configured with the backend's base URL,
// so every file that needs to talk to the API imports this instead of
// repeating the URL and setup everywhere.
const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:4001/api",
});

// Attach the saved token to every request automatically, so individual
// calls don't each have to remember to build an Authorization header.
// Requests made while logged out simply go out without one.
// `InternalAxiosRequestConfig` is axios's own type for "the config object a
// request is about to be sent with" — typing the parameter lets TypeScript
// check that `config.headers.Authorization` is a valid thing to set.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
