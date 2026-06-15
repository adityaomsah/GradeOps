// components/ProtectedRoute.jsx
// Wraps a page component and ensures:
//   1. The user is logged in (otherwise -> /login)
//   2. The user's role is allowed for this page (otherwise -> their home page)
//
// Usage:
//   <ProtectedRoute allowedRoles={["instructor", "ta"]}>
//     <ResultsPage />
//   </ProtectedRoute>

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleHomePath } from "../utils/roleHome";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Logged in but wrong role - send them to their own home page
    return <Navigate to={roleHomePath(role)} replace />;
  }

  return children;
}
