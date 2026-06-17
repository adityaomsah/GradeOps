// pages/UploadGradePage.jsx
// TA workflow:
//   1. Pick an exam (from /exam) and enter a rubric ID (from /rubric)
//   2. Upload a PDF -> POST /upload-pdf/ (converts to images, just for confirmation)
//   3. Click "Grade" -> POST /grade (runs OCR + LangGraph pipeline, saves to DB)
//
// Step 2 is optional/informational - the actual grading in step 3 re-uploads
// the same file to /grade, which does its own PDF->image conversion + OCR.
// This mirrors how the backend currently works (no submission tracking yet).

import { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { getAllExams } from "../api/exams";
import { uploadPdf } from "../api/upload";
import { gradeSubmission, bulkGradeSubmissions } from "../api/grade";
import { getErrorMessage } from "../api/client";
import Card from "../components/Card";
import Select from "../components/Select";
import Input from "../components/Input";
import Button from "../components/Button";
import Badge from "../components/Badge";
import toast from "react-hot-toast";

export default function UploadGradePage() {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [rubricId, setRubricId] = useState("");
  const [files, setFiles] = useState([]);

  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [gradeResult, setGradeResult] = useState(null);
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    resetResults();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    }
  });

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
    if (files.length === 0) {
      setUploadError("Please choose a PDF file first.");
      return;
    }
    setUploadError("");
    setUploadResult(null);
    setGradeResult(null);
    setUploading(true);
    try {
      const data = await uploadPdf(files[0]); // Only testing first file for upload check
      setUploadResult(data);
      toast.success(data.message || "Upload successful");
    } catch (err) {
      const msg = getErrorMessage(err);
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  async function handleGrade(e) {
    e.preventDefault();
    if (files.length === 0) {
      setGradeError("Please choose at least one PDF file.");
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
      if (files.length === 1) {
        const data = await gradeSubmission({
          file: files[0],
          examId: Number(examId),
          rubricId: Number(rubricId),
          allAnswers: [],
        });
        setGradeResult(data);
      } else {
        const data = await bulkGradeSubmissions({
          files,
          examId: Number(examId),
          rubricId: Number(rubricId),
          allAnswers: [],
        });
        setGradeResult(data);
        toast.success("Grading completed successfully!");
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setGradeError(msg);
      toast.error(msg);
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
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Upload &amp; Grade</h1>
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

      <Card title="2. Select Answer Script PDF(s)">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500"
          }`}
        >
          <input {...getInputProps()} />
          <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">PDF files only</p>
        </div>
        {files.length > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Selected: <span className="font-medium">{files.length} file(s)</span>
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
            <Button type="submit" variant="secondary" loading={uploading}>
              Upload PDF
            </Button>
          </form>
          {uploadResult && (
            <div className="mt-3 text-sm">
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
            <Button type="submit" loading={grading}>
              Grade Submission
            </Button>
          </form>

          {gradeResult && gradeResult.score !== undefined && (
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <p>
                <span className="font-medium text-slate-700 dark:text-slate-300">Score: </span>
                {gradeResult.score}
              </p>
              <p>
                <span className="font-medium text-slate-700 dark:text-slate-300">Justification: </span>
                {gradeResult.justification}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">Plagiarism:</span>
                {gradeResult.plagiarism_flag ? (
                  <Badge color="red">Flagged ({gradeResult.plagiarism_score?.toFixed(2)})</Badge>
                ) : (
                  <Badge color="green">Clear ({gradeResult.plagiarism_score?.toFixed(2)})</Badge>
                )}
              </div>
            </div>
          )}

          {gradeResult && gradeResult.results !== undefined && (
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <p className="font-medium text-slate-700 dark:text-slate-300">Bulk Result Summary:</p>
              <p>Total: {gradeResult.total} | Succeeded: {gradeResult.succeeded} | Failed: {gradeResult.failed}</p>
              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded p-2">
                {gradeResult.results.map((r, i) => (
                  <div key={i} className="mb-1 pb-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="font-medium">{r.filename}:</span> {r.status}
                    {r.error && <span className="text-red-500 ml-2">{r.error}</span>}
                    {r.data && <span className="ml-2">Score: {r.data.score}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
