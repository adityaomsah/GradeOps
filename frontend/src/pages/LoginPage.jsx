// pages/LoginPage.jsx
// POST /login (OAuth2PasswordRequestForm) - see api/auth.js
// On success, redirects based on role:
//   instructor/ta -> /exams
//   student       -> /my-result
//   admin         -> /register

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";
import { roleHomePath } from "../utils/roleHome";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { role } = await login(email, password);
      navigate(roleHomePath(role));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-600">GradeOps</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gradeops.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Alert type="error">{error}</Alert>

          <Button type="submit" loading={loading} className="w-full mt-1">
            Sign In
          </Button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          Accounts are created by an administrator. Contact your admin if you
          don't have a login yet.
        </p>
      </Card>
    </div>
  );
}
