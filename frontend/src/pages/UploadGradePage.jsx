// pages/UploadGradePage.jsx
// TA workflow:
//   1. Pick an exam (from /exam) and enter a rubric ID (from /rubric)
//   2. Upload a PDF -> POST /upload-pdf/ (converts to images, just for confirmation)
//   3. Click "Grade" -> POST /grade (runs OCR + LangGraph pipeline, saves to DB)
//
// Step 2 is optional/informational - the actual grading in step 3 re-uploads
// the same file to /grade, which does its own PDF->image conversion + OCR.
// This mirrors how the backend currently works (no submission tracking yet).

import { useEffect, useState } from "react";
import { getAllExams } from "../api/exams";
import { uploadPdf } from "../api/upload";
import { gradeSubmission } from "../api/grade";
import { getErrorMessage } from "../api/client";
import Card from "../components/Card";
import Select from "../components/Select";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Badge from "../components/Badge";

export default function UploadGradePage() {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [rubricId, setRubricId] = useState("");
  const [file, setFile] = useState(null);

  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [gradeResult, setGradeResult] = useState(null);
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState("");

  useEffect(() => {
    getAllExams()
      .then(setExams)
      .catch((err) => setUploadError(getErrorMessage(err)));
  }, []);

  function resetResults() {
    setUploadResult(null);
    setGradeResult(null);
    setUploadError("");
    setGradeError("");
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setUploadError("Please choose a PDF file first.");
      return;
    }
    setUploadError("");
    setUploadResult(null);
    setGradeResult(null);
    setUploading(true);
    try {
      const data = await uploadPdf(file);
      setUploadResult(data);
    } catch (err) {
      setUploadError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleGrade(e) {
    e.preventDefault();
    if (!file) {
      setGradeError("Please choose a PDF file first.");
      return;
    }
    if (!examId || !rubricId) {
      setGradeError("Please select an exam and enter a rubric ID.");
      return;
    }
    setGradeError("");
    setGradeResult(null);
    setGrading(true);
    try {
      const data = await gradeSubmission({
        file,
        examId: Number(examId),
        rubricId: Number(rubricId),
        allAnswers: [],
      });
      setGradeResult(data);
    } catch (err) {
      setGradeError(getErrorMessage(err));
    } finally {
      setGrading(false);
    }
  }

  const examOptions = exams.map((exam) => ({
    value: exam.id,
    label: `${exam.course_code} - ${exam.course_name} (${exam.exam_type})`,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Upload &amp; Grade</h1>
        <p className="text-sm text-slate-500">
          Upload a student's answer script PDF and run AI grading against a rubric.
        </p>
      </div>

      <Card title="1. Select Exam & Rubric">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Exam"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            options={examOptions}
            required
          />
          <Input
            label="Rubric ID"
            type="number"
            value={rubricId}
            onChange={(e) => setRubricId(e.target.value)}
            placeholder="e.g. 1"
            required
          />
        </div>
        {exams.length === 0 && (
          <p className="text-xs text-slate-400 mt-2">
            No exams found. Ask an instructor to create an exam first.
          </p>
        )}
      </Card>

      <Card title="2. Select Answer Script PDF">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            resetResults();
          }}
          className="text-sm border border-slate-300 rounded-md px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 file:px-3 file:py-1"
        />
        {file && (
          <p className="text-xs text-slate-500 mt-2">
            Selected: <span className="font-medium">{file.name}</span>
          </p>
        )}
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Card title="3a. Upload (optional check)" className="flex-1">
          <p className="text-xs text-slate-500 mb-3">
            Converts the PDF to page images on the server. Useful as a quick
            check that the file is readable before grading.
          </p>
          <form onSubmit={handleUpload}>
            <Alert type="error" className="mb-2">{uploadError}</Alert>
            <Button type="submit" variant="secondary" loading={uploading}>
              Upload PDF
            </Button>
          </form>
          {uploadResult && (
            <div className="mt-3 text-sm">
              <Alert type="success">{uploadResult.message}</Alert>
              <p className="text-xs text-slate-500 mt-2">
                {uploadResult.images?.length || 0} page image(s) generated.
              </p>
            </div>
          )}
        </Card>

        <Card title="3b. Run AI Grading" className="flex-1">
          <p className="text-xs text-slate-500 mb-3">
            Runs OCR + the grading pipeline and saves the result to the database.
          </p>
          <form onSubmit={handleGrade}>
            <Alert type="error" className="mb-2">{gradeError}</Alert>
            <Button type="submit" loading={grading}>
              Grade Submission
            </Button>
          </form>

          {gradeResult && (
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <p>
                <span className="font-medium text-slate-700">Score: </span>
                {gradeResult.score}
              </p>
              <p>
                <span className="font-medium text-slate-700">Justification: </span>
                {gradeResult.justification}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-700">Plagiarism:</span>
                {gradeResult.plagiarism_flag ? (
                  <Badge color="red">Flagged ({gradeResult.plagiarism_score?.toFixed(2)})</Badge>
                ) : (
                  <Badge color="green">Clear ({gradeResult.plagiarism_score?.toFixed(2)})</Badge>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
