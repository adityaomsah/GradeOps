// api/client.js
// Central axios instance for talking to the GradeOps FastAPI backend.
// - Reads base URL from VITE_API_BASE_URL (see .env)
// - Attaches the JWT token (stored in localStorage) to every request
// - On 401 responses, clears the token and redirects to /login

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("gradeops_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired / invalid tokens globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("gradeops_token");
      localStorage.removeItem("gradeops_role");
      localStorage.removeItem("gradeops_email");
      // Avoid redirect loop if already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Helper to pull a readable error message out of a FastAPI error response
export function getErrorMessage(error) {
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      // Pydantic validation errors come back as a list of {loc, msg, type}
      return data.detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
    }
    return JSON.stringify(data);
  }
  if (error.message) return error.message;
  return "Something went wrong. Please try again.";
}
