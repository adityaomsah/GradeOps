// components/Navbar.jsx
// Top navigation bar. Shows different links depending on the logged-in role.
//
// Role -> link visibility:
//   instructor : Exams, Rubrics, Results, Analytics
//   ta         : Exams (view), Upload & Grade, Results, Analytics
//   student    : My Result

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeProvider";
import Badge from "./Badge";

export default function Navbar() {
  const { role, email, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
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
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="font-bold text-indigo-600 dark:text-indigo-400 text-lg hover:opacity-80 transition-opacity">GradeOps</Link>
          <div className="flex items-center gap-1 hidden md:flex">
            {links.map((link) => {
              const active = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-2">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-md text-xs transition-colors ${theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              title="Light Mode"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-md text-xs transition-colors ${theme === 'dark' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              title="Dark Mode"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-md text-xs transition-colors ${theme === 'system' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              title="System Theme"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </button>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">{email}</p>
            <Badge color="purple">{role}</Badge>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
