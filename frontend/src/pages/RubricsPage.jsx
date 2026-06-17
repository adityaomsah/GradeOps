// pages/RubricsPage.jsx
// POST /rubric            -> instructor only : upload rubric PDF, get parsed JSON back
// GET  /rubric/{rubric_id} -> instructor, ta : look up a rubric by its ID
//
// Note: the backend does not have a "list all rubrics" endpoint, so this page
// keeps a running list of rubrics created in this browser session (via
// localStorage) plus a manual lookup-by-ID tool. The rubric_id returned after
// upload is what TAs will need when calling /grade.

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { uploadRubric, getRubric } from "../api/rubrics";
import { getErrorMessage } from "../api/client";
import Card from "../components/Card";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Input from "../components/Input";

const RECENT_RUBRICS_KEY = "gradeops_recent_rubrics";

function loadRecentRubrics() {
  try {
    const raw = localStorage.getItem(RECENT_RUBRICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentRubric(rubric) {
  const recent = loadRecentRubrics();
  const updated = [rubric, ...recent.filter((r) => r.rubric_id !== rubric.rubric_id)].slice(0, 10);
  localStorage.setItem(RECENT_RUBRICS_KEY, JSON.stringify(updated));
  return updated;
}

export default function RubricsPage() {
  const { role } = useAuth();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedRubric, setUploadedRubric] = useState(null);

  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

  const [recentRubrics, setRecentRubrics] = useState([]);

  useEffect(() => {
    setRecentRubrics(loadRecentRubrics());
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setUploadError("Please choose a PDF file first.");
      return;
    }
    setUploadError("");
    setUploadedRubric(null);
    setUploading(true);
    try {
      const data = await uploadRubric(file);
      setUploadedRubric(data);
      const updated = saveRecentRubric(data);
      setRecentRubrics(updated);
      setFile(null);
    } catch (err) {
      setUploadError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleLookup(e) {
    e.preventDefault();
    if (!lookupId) return;
    setLookupError("");
    setLookupResult(null);
    setLookingUp(true);
    try {
      const data = await getRubric(lookupId);
      setLookupResult(data);
    } catch (err) {
      setLookupError(getErrorMessage(err));
    } finally {
      setLookingUp(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Rubrics</h1>
        <p className="text-sm text-slate-500">
          {role === "instructor"
            ? "Upload a rubric PDF. The AI will parse it into structured grading criteria."
            : "Look up rubric details by ID before grading submissions."}
        </p>
      </div>

      {role === "instructor" && (
        <Card title="Upload Rubric PDF">
          <form onSubmit={handleUpload} className="flex flex-col gap-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm border border-slate-300 rounded-md px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 file:px-3 file:py-1"
            />
            <Alert type="error">{uploadError}</Alert>
            <Button type="submit" loading={uploading} className="w-fit">
              Upload & Parse Rubric
            </Button>
          </form>

          {uploadedRubric && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-sm font-medium text-emerald-700 mb-2">
                Rubric created — ID: <span className="font-mono">{uploadedRubric.rubric_id}</span>
              </p>
              <p className="text-xs text-slate-500 mb-2">
                Save this ID — TAs will need it when grading submissions for this question.
              </p>
              <RubricDetails rubric={uploadedRubric} />
            </div>
          )}
        </Card>
      )}

      <Card title="Look up Rubric by ID">
        <form onSubmit={handleLookup} className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="Rubric ID"
              type="number"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="e.g. 1"
            />
          </div>
          <Button type="submit" variant="secondary" loading={lookingUp}>
            Look up
          </Button>
        </form>
        <Alert type="error" className="mt-3">{lookupError}</Alert>
        {lookupResult && (
          <div className="mt-4">
            <RubricDetails rubric={lookupResult} />
          </div>
        )}
      </Card>

      {recentRubrics.length > 0 && (
        <Card title="Recently Created (this browser)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Rubric ID</th>
                  <th className="py-2 pr-4">Question</th>
                  <th className="py-2 pr-4">Max Marks</th>
                </tr>
              </thead>
              <tbody>
                {recentRubrics.map((r) => (
                  <tr key={r.rubric_id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4 font-mono text-slate-600">{r.rubric_id}</td>
                    <td className="py-2 pr-4">{r.question}</td>
                    <td className="py-2 pr-4">{r.max_marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function RubricDetails({ rubric }) {
  return (
    <div className="text-sm">
      <p className="mb-1">
        <span className="font-medium text-slate-700">Question: </span>
        {rubric.question}
      </p>
      <p className="mb-2">
        <span className="font-medium text-slate-700">Max Marks: </span>
        {rubric.max_marks}
      </p>
      <p className="font-medium text-slate-700 mb-1">Criteria:</p>
      <ul className="list-disc list-inside space-y-1 text-slate-600">
        {(rubric.criteria || []).map((c, i) => (
          <li key={i}>
            {c.condition} — <span className="font-medium">{c.marks} marks</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
