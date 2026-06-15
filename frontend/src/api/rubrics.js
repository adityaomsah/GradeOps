// api/rubrics.js
// Matches backend/api/routes/rubrics.py
//
// POST /rubric            -> instructor only, multipart/form-data with "file"
//   returns: { rubric_id, question, max_marks, criteria: [{condition, marks}] }
//
// GET  /rubric/{rubric_id} -> instructor, ta
//   returns: { rubric_id, question, max_marks, criteria }

import { apiClient } from "./client";

export async function uploadRubric(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/rubric", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getRubric(rubricId) {
  const response = await apiClient.get(`/rubric/${rubricId}`);
  return response.data;
}
