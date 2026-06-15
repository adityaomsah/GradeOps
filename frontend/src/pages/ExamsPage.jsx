// pages/ExamsPage.jsx
// GET  /exam  -> instructor, ta : list all exams
// POST /exam  -> instructor only : create a new exam
//
// TAs see a read-only list (they pick an exam_id when uploading/grading).
// Instructors additionally get a form to create new exams.

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createExam, getAllExams } from "../api/exams";
import { getErrorMessage } from "../api/client";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import Alert from "../components/Alert";

const EXAM_TYPE_OPTIONS = [
  { value: "quiz", label: "Quiz" },
  { value: "midsem", label: "Mid Semester" },
  { value: "endsem", label: "End Semester" },
  { value: "assignment", label: "Assignment" },
];

export default function ExamsPage() {
  const { role } = useAuth();

  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [listError, setListError] = useState("");

  // create-exam form state (instructor only)
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [examType, setExamType] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadExams() {
    setLoadingExams(true);
    setListError("");
    try {
      const data = await getAllExams();
      setExams(data);
    } catch (err) {
      setListError(getErrorMessage(err));
    } finally {
      setLoadingExams(false);
    }
  }

  useEffect(() => {
    loadExams();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setCreating(true);
    try {
      await createExam({ courseCode, courseName, examType, totalMarks });
      setFormSuccess(`Exam "${courseName}" created successfully.`);
      setCourseCode("");
      setCourseName("");
      setExamType("");
      setTotalMarks("");
      loadExams();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Exams</h1>
        <p className="text-sm text-slate-500">
          {role === "instructor"
            ? "Create exams and view all exams created so far."
            : "View available exams. Use these when uploading and grading submissions."}
        </p>
      </div>

      {role === "instructor" && (
        <Card title="Create New Exam">
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Course Code"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. CS101"
              required
            />
            <Input
              label="Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. Introduction to Programming"
              required
            />
            <Select
              label="Exam Type"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              options={EXAM_TYPE_OPTIONS}
              required
            />
            <Input
              label="Total Marks"
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              placeholder="e.g. 100"
              min="1"
              required
            />

            <div className="sm:col-span-2 flex flex-col gap-2">
              <Alert type="error">{formError}</Alert>
              <Alert type="success">{formSuccess}</Alert>
              <Button type="submit" loading={creating} className="w-fit">
                Create Exam
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="All Exams">
        <Alert type="error">{listError}</Alert>
        {loadingExams ? (
          <p className="text-sm text-slate-500">Loading exams...</p>
        ) : exams.length === 0 ? (
          <p className="text-sm text-slate-500">No exams created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Course Code</th>
                  <th className="py-2 pr-4">Course Name</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Total Marks</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4 font-mono text-slate-600">{exam.id}</td>
                    <td className="py-2 pr-4">{exam.course_code}</td>
                    <td className="py-2 pr-4">{exam.course_name}</td>
                    <td className="py-2 pr-4 capitalize">{exam.exam_type}</td>
                    <td className="py-2 pr-4">{exam.total_marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
