// pages/RegisterPage.jsx
// POST /register - admin only
// Allows admin to create instructor / ta / student accounts.
// roll_no is required (and shown) only when role = student.

import { useState } from "react";
import { registerUser } from "../api/auth";
import { getErrorMessage } from "../api/client";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import Alert from "../components/Alert";

const ROLE_OPTIONS = [
  { value: "instructor", label: "Instructor" },
  { value: "ta", label: "Teaching Assistant" },
  { value: "student", label: "Student" },
  { value: "admin", label: "Admin" },
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (role === "student" && !rollNo) {
      setError("Roll number is required for student accounts.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ email, password, role, rollNo });
      setSuccess(`Account created for ${email} (${role}).`);
      setEmail("");
      setPassword("");
      setRole("");
      setRollNo("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Register a User</h1>
      <p className="text-sm text-slate-500 mb-6">
        Create instructor, TA, student, or admin accounts.
      </p>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@gradeops.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Set a temporary password"
            required
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={ROLE_OPTIONS}
            required
          />
          {role === "student" && (
            <Input
              label="Roll Number"
              type="number"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="e.g. 220103045"
              required
            />
          )}

          <Alert type="error">{error}</Alert>
          <Alert type="success">{success}</Alert>

          <Button type="submit" loading={loading}>
            Create Account
          </Button>
        </form>
      </Card>
    </div>
  );
}
