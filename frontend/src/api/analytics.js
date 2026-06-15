// api/analytics.js
// Matches backend/api/routes/analytics.py
//
// GET /analytics/exam/{exam_id}      -> instructor, ta
//   returns: { exam_id, exam_name, total_students, average_score,
//               median_score, min_score, max_score, max_marks,
//               score_distribution: {bucket: count}, plagiarism_flagged_count,
//               ta_reviewed_count, ta_pending_count }
//   OR (if no grades yet): { exam_id, exam_name, total_students: 0, message }
//
// GET /analytics/dashboard           -> instructor, ta
//   returns: { total_exams, total_submissions, graded_submissions,
//               average_score, plagiarism_flags, pending_reviews }
//
// GET /analytics/grade-distribution  -> instructor, ta
//   returns: [ { grade: "A"|"B"|"C"|"D"|"F", count: number }, ... ]
//   NOTE: backend has a known edge case - if there are zero grades at all,
//   it may return a plain object instead of a list. We normalize that here.

import { apiClient } from "./client";

export async function getExamAnalytics(examId) {
  const response = await apiClient.get(`/analytics/exam/${examId}`);
  return response.data;
}

export async function getDashboardSummary() {
  const response = await apiClient.get("/analytics/dashboard");
  return response.data;
}

export async function getGradeDistribution() {
  const response = await apiClient.get("/analytics/grade-distribution");
  const data = response.data;

  // Defensive normalization: backend may return {} instead of []
  // when there are no grades in the system yet.
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return Object.entries(data).map(([grade, count]) => ({ grade, count }));
  }
  return [];
}
