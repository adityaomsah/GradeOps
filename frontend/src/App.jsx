// App.jsx
// Top-level routing. Wraps everything in AuthProvider and shows the Navbar
// on all pages except /login.
//
// Route -> allowed roles:
//   /login        : public
//   /register     : admin
//   /exams        : instructor, ta
//   /rubrics      : instructor, ta
//   /upload       : ta
//   /results      : instructor, ta
//   /analytics    : instructor, ta
//   /my-result    : student

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { roleHomePath } from "./utils/roleHome";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ExamsPage from "./pages/ExamsPage";
import RubricsPage from "./pages/RubricsPage";
import UploadGradePage from "./pages/UploadGradePage";
import ResultsPage from "./pages/ResultsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MyResultPage from "./pages/MyResultPage";

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to={roleHomePath(role)} replace /> : <LoginPage />
          }
        />

        <Route
          path="/register"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RegisterPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/exams"
          element={
            <ProtectedRoute allowedRoles={["instructor", "ta"]}>
              <ExamsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rubrics"
          element={
            <ProtectedRoute allowedRoles={["instructor", "ta"]}>
              <RubricsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute allowedRoles={["ta"]}>
              <UploadGradePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute allowedRoles={["instructor", "ta"]}>
              <ResultsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["instructor", "ta"]}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-result"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MyResultPage />
            </ProtectedRoute>
          }
        />

        {/* Default route -> redirect based on auth state */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={roleHomePath(role)} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to={roleHomePath(role)} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
