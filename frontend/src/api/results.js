// api/results.js
// Matches backend/api/routes/results.py
//
// GET /results                      -> instructor, ta
//   returns: [ Grade rows... ] each with:
//     id, exam_id, rubric_id, student_name, student_roll_no, score,
//     justification, plagiarism_score, plagiarism_flag, ta_reviewed,
//     ta_override_score, uploaded_pdf_filename
//
// GET /results/{student_roll_no}    -> instructor, ta, student (own only)
//   returns: a single Grade row
//
// GET /results/{grade_id}/history   -> instructor, ta
//   returns: [ GradeHistory rows... ] each with:
//     id, grade_id, old_score, new_score, changed_by, reason, action, timestamp
//
// GET /results/export/csv?exam_id=  -> instructor, ta
//   returns: CSV file (Blob)

import { apiClient } from "./client";

export async function getAllResults() {
  const response = await apiClient.get("/results");
  return response.data;
}

export async function getStudentResult(rollNo) {
  const response = await apiClient.get(`/results/${rollNo}`);
  return response.data;
}

export async function getGradeHistory(gradeId) {
  const response = await apiClient.get(`/results/${gradeId}/history`);
  return response.data;
}

/**
 * Downloads the results CSV and triggers a browser download.
 * @param {number|null} examId - optional exam filter
 */
export async function downloadResultsCsv(examId) {
  const params = {};
  if (examId !== null && examId !== undefined) {
    params.exam_id = examId;
  }

  const response = await apiClient.get("/results/export/csv", {
    params,
    responseType: "blob",
  });

  // Trigger browser download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  const filename = examId ? `exam_${examId}_results.csv` : "gradeops_all_results.csv";
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
