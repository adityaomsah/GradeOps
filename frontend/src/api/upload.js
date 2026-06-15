// api/upload.js
// Matches backend/api/routes/upload.py
//
// POST /upload-pdf/  -> ta only, multipart/form-data with "file"
//   returns: { message, images: [paths...] }
//
// Note: this endpoint converts the PDF to page images on the server.
// It does not itself trigger grading - that's a separate call to /grade.

import { apiClient } from "./client";

export async function uploadPdf(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/upload-pdf/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
