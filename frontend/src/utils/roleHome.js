// utils/roleHome.js
// Determines where each role should land after login / on invalid route access.

export function roleHomePath(role) {
  switch (role) {
    case "instructor":
      return "/exams";
    case "ta":
      return "/exams";
    case "student":
      return "/my-result";
    case "admin":
      return "/register";
    default:
      return "/login";
  }
}
