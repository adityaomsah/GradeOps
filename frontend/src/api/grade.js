// api/grade.js
// Matches backend/api/routes/grade.py
//
// POST /grade -> ta only, multipart/form-data
//   fields:
//     file: PDF file
//     exam_id: int
//     rubric_id: int
//     all_answers: JSON-encoded string, e.g. '["answer text 1", "answer text 2"]'
//                   (used by the plagiarism check - pass other students'
//                    extracted answers here if you have them, otherwise [])
//   returns: { score, justification, plagiarism_score, plagiarism_flag }

import { apiClient } from "./client";

/**
 * Trigger AI grading for a single answer script PDF.
 *
 * @param {Object} params
 * @param {File} params.file - the PDF file
 * @param {number} params.examId
 * @param {number} params.rubricId
 * @param {string[]} [params.allAnswers] - other students' answer texts for
 *        plagiarism comparison. Defaults to an empty array.
 */
export async function gradeSubmission({ file, examId, rubricId, allAnswers = [] }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("exam_id", String(examId));
  formData.append("rubric_id", String(rubricId));
  formData.append("all_answers", JSON.stringify(allAnswers));

  const response = await apiClient.post("/grade", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data; // { score, justification, plagiarism_score, plagiarism_flag }
}
