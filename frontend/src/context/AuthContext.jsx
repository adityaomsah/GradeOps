// context/AuthContext.jsx
// Provides authentication state (token, role, email) to the whole app.
// Persists the token in localStorage so refreshing the page keeps you logged in.

import { createContext, useContext, useState, useCallback } from "react";
import { login as loginApi, decodeToken } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("gradeops_token"));
  const [role, setRole] = useState(() => localStorage.getItem("gradeops_role"));
  const [email, setEmail] = useState(() => localStorage.getItem("gradeops_email"));

  const login = useCallback(async (emailInput, password) => {
    const data = await loginApi(emailInput, password);
    const accessToken = data.access_token;
    const decoded = decodeToken(accessToken);

    const userRole = decoded?.role || null;
    const userEmail = decoded?.sub || emailInput;

    localStorage.setItem("gradeops_token", accessToken);
    if (userRole) localStorage.setItem("gradeops_role", userRole);
    localStorage.setItem("gradeops_email", userEmail);

    setToken(accessToken);
    setRole(userRole);
    setEmail(userEmail);

    return { role: userRole, email: userEmail };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("gradeops_token");
    localStorage.removeItem("gradeops_role");
    localStorage.removeItem("gradeops_email");
    setToken(null);
    setRole(null);
    setEmail(null);
  }, []);

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{ token, role, email, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
