// api/feedback.js
// Matches backend/api/routes/feedback.py
//
// POST /feedback -> instructor, ta
//   body: { grade_id, ta_override_score?, justification? }
//   - If ta_override_score is provided -> grade is "overridden"
//   - If not provided -> grade is "approved" as-is
//   returns: { message, grade_id, ta_reviewed, ta_override_score, justification }

import { apiClient } from "./client";

/**
 * Approve a grade as-is (no score change).
 */
export async function approveGrade(gradeId) {
  const response = await apiClient.post("/feedback", {
    grade_id: gradeId,
  });
  return response.data;
}

/**
 * Override a grade's score with a TA-provided value and reason.
 */
export async function overrideGrade(gradeId, overrideScore, justification) {
  const response = await apiClient.post("/feedback", {
    grade_id: gradeId,
    ta_override_score: Number(overrideScore),
    justification: justification || "",
  });
  return response.data;
}
