import axios from "axios";

// Central axios instance — every API call in the app goes through this
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Automatically attach the JWT token (if present) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("qmap_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
