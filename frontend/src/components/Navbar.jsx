// components/Navbar.jsx
// Top navigation bar. Shows different links depending on the logged-in role.
//
// Role -> link visibility:
//   instructor : Exams, Rubrics, Results, Analytics
//   ta         : Exams (view), Upload & Grade, Results, Analytics
//   student    : My Result

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Badge from "./Badge";

export default function Navbar() {
  const { role, email, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const links = [];

  if (role === "instructor") {
    links.push({ to: "/exams", label: "Exams" });
    links.push({ to: "/rubrics", label: "Rubrics" });
    links.push({ to: "/results", label: "Results" });
    links.push({ to: "/analytics", label: "Analytics" });
  } else if (role === "ta") {
    links.push({ to: "/exams", label: "Exams" });
    links.push({ to: "/upload", label: "Upload & Grade" });
    links.push({ to: "/results", label: "Results" });
    links.push({ to: "/analytics", label: "Analytics" });
  } else if (role === "student") {
    links.push({ to: "/my-result", label: "My Result" });
  } else if (role === "admin") {
    links.push({ to: "/register", label: "Register Users" });
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <span className="font-bold text-indigo-600 text-lg">GradeOps</span>
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const active = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-700 leading-tight">{email}</p>
            <Badge color="purple">{role}</Badge>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
