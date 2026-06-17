// utils/roleHome.js
// Determines where each role should land after login / on invalid route access.

export function roleHomePath(role) {
  if (role && ["instructor", "ta", "student", "admin"].includes(role)) {
    return "/dashboard";
  }
  return "/login";
}
