// api/exams.js
// Matches backend/api/routes/exam.py
//
// POST /exam            -> instructor only
//   body: { course_code, course_name, exam_type, total_marks }
//   returns: { exam_id, course_code, course_name, exam_type, total_marks }
//
// GET  /exam             -> instructor, ta
//   returns: [ { id, course_code, course_name, exam_type, total_marks }, ... ]
//
// GET  /exam/{exam_id}   -> instructor, ta

import { apiClient } from "./client";

export async function createExam({ courseCode, courseName, examType, totalMarks }) {
  const response = await apiClient.post("/exam", {
    course_code: courseCode,
    course_name: courseName,
    exam_type: examType,
    total_marks: Number(totalMarks),
  });
  return response.data;
}

export async function getAllExams() {
  const response = await apiClient.get("/exam");
  return response.data; // array of Exam rows (id, course_code, course_name, exam_type, total_marks)
}

export async function getExam(examId) {
  const response = await apiClient.get(`/exam/${examId}`);
  return response.data;
}
