// api/auth.js
// Matches backend/api/routes/auth.py
//
// POST /login   -> OAuth2PasswordRequestForm (application/x-www-form-urlencoded)
//                  fields: username, password
//                  returns: { access_token, token_type }
//
// POST /register -> admin only
//                  body: { user_email_id, user_password, user_role, roll_no? }

import { apiClient } from "./client";

/**
 * Logs in a user.
 * IMPORTANT: the backend uses OAuth2PasswordRequestForm, which expects
 * application/x-www-form-urlencoded data with a "username" field
 * (even though it's really an email).
 */
export async function login(email, password) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const response = await apiClient.post("/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data; // { access_token, token_type }
}

/**
 * Registers a new user. Requires the caller to be logged in as admin
 * (the JWT is attached automatically by the axios interceptor).
 */
export async function registerUser({ email, password, role, rollNo }) {
  const payload = {
    user_email_id: email,
    user_password: password,
    user_role: role,
  };
  if (role === "student" && rollNo !== undefined && rollNo !== null && rollNo !== "") {
    payload.roll_no = Number(rollNo);
  }

  const response = await apiClient.post("/register", payload);
  return response.data; // { message }
}

/**
 * Decodes the JWT payload (without verifying signature - just for reading
 * role/email client-side for routing decisions).
 */
export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded; // { sub: email, role, exp }
  } catch {
    return null;
  }
}
