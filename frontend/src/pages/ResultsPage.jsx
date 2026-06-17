// pages/ResultsPage.jsx
// GET  /results             -> instructor, ta : list of all Grade rows
// POST /feedback             -> instructor, ta : approve/override a grade
// GET  /results/{id}/history -> instructor, ta : audit trail for a grade
// GET  /results/export/csv   -> instructor, ta : download CSV
//
// This is the main review dashboard: shows every graded submission with
// AI score, plagiarism flag, and review status. TAs/instructors can expand
// a row to approve or override the score, and view its audit history.

import { useEffect, useState } from "react";
import { getAllResults, getGradeHistory, downloadResultsCsv } from "../api/results";
import { approveGrade, overrideGrade } from "../api/feedback";
import { getErrorMessage } from "../api/client";
import Card from "../components/Card";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Badge from "../components/Badge";
import Input from "../components/Input";
import toast from "react-hot-toast";

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  async function loadResults() {
    setLoading(true);
    setError("");
    try {
      const data = await getAllResults();
      setResults(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResults();
  }, []);

  function finalScore(grade) {
    return grade.ta_override_score !== null && grade.ta_override_score !== undefined
      ? grade.ta_override_score
      : grade.score;
  }

  async function handleDownloadCsv() {
    try {
      await downloadResultsCsv(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Results</h1>
          <p className="text-sm text-slate-500">
            Review AI-graded submissions, approve or override scores.
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadCsv}>
          Export CSV
        </Button>
      </div>

      <Card>
        <Alert type="error">{error}</Alert>
        {loading ? (
          <p className="text-sm text-slate-500">Loading results...</p>
        ) : results.length === 0 ? (
          <p className="text-sm text-slate-500">No graded results yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Roll No</th>
                  <th className="py-2 pr-4">Student</th>
                  <th className="py-2 pr-4">AI Score</th>
                  <th className="py-2 pr-4">Final Score</th>
                  <th className="py-2 pr-4">Plagiarism</th>
                  <th className="py-2 pr-4">Review</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {results.map((grade) => (
                  <ResultRow
                    key={grade.id}
                    grade={grade}
                    finalScore={finalScore(grade)}
                    expanded={expandedId === grade.id}
                    onToggle={() =>
                      setExpandedId(expandedId === grade.id ? null : grade.id)
                    }
                    onUpdated={loadResults}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function ResultRow({ grade, finalScore, expanded, onToggle, onUpdated }) {
  const aiScoreIsPlaceholder = grade.score === -1;

  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50">
        <td className="py-2 pr-4 font-mono text-slate-600">{grade.student_roll_no}</td>
        <td className="py-2 pr-4">{grade.student_name || "—"}</td>
        <td className="py-2 pr-4">
          {aiScoreIsPlaceholder ? (
            <Badge color="yellow">Needs Review</Badge>
          ) : (
            grade.score
          )}
        </td>
        <td className="py-2 pr-4 font-medium">
          {finalScore === -1 ? "—" : finalScore}
        </td>
        <td className="py-2 pr-4">
          {grade.plagiarism_flag ? (
            <Badge color="red">Flagged</Badge>
          ) : (
            <Badge color="green">Clear</Badge>
          )}
        </td>
        <td className="py-2 pr-4">
          {grade.ta_reviewed ? (
            <Badge color="blue">Reviewed</Badge>
          ) : (
            <Badge color="slate">Pending</Badge>
          )}
        </td>
        <td className="py-2 pr-4">
          <Button variant="outline" onClick={onToggle} className="text-xs px-2 py-1">
            {expanded ? "Hide" : "Review"}
          </Button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50 border-b border-slate-100">
          <td colSpan={7} className="px-4 py-4">
            <ResultDetail grade={grade} onUpdated={onUpdated} />
          </td>
        </tr>
      )}
    </>
  );
}

function ResultDetail({ grade, onUpdated }) {
  const [overrideScore, setOverrideScore] = useState("");
  const [justification, setJustification] = useState(grade.justification || "");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    setHistoryLoading(true);
    getGradeHistory(grade.id)
      .then(setHistory)
      .catch((err) => setHistoryError(getErrorMessage(err)))
      .finally(() => setHistoryLoading(false));
  }, [grade.id]);

  async function handleApprove() {
    setActionError("");
    setActionSuccess("");
    setSubmitting(true);
    try {
      await approveGrade(grade.id);
      toast.success("Grade approved.");
      onUpdated();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOverride(e) {
    e.preventDefault();
    if (overrideScore === "") {
      setActionError("Enter an override score.");
      return;
    }
    setActionError("");
    setActionSuccess("");
    setSubmitting(true);
    try {
      await overrideGrade(grade.id, overrideScore, justification);
      toast.success("Grade overridden.");
      setOverrideScore("");
      onUpdated();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const pdfUrl = grade.uploaded_pdf_filename ? `http://localhost:8000/uploads/${grade.uploaded_pdf_filename}` : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: AI grading details + actions + audit trail */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase mb-1">
              AI Justification
            </p>
            <p className="text-sm text-slate-700 bg-white rounded-md border border-slate-200 p-3">
              {grade.justification || "No justification available."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">AI Score</p>
              <p>{grade.score === -1 ? "Needs human review" : grade.score}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Plagiarism Score</p>
              <p>{grade.plagiarism_score?.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Uploaded File</p>
              <p className="truncate">{grade.uploaded_pdf_filename || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">TA Override</p>
              <p>{grade.ta_override_score ?? "—"}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <Button variant="success" onClick={handleApprove} loading={submitting}>
              Approve AI Score
            </Button>

            <form onSubmit={handleOverride} className="flex items-end gap-2">
              <Input
                label="Override Score"
                type="number"
                value={overrideScore}
                onChange={(e) => setOverrideScore(e.target.value)}
                placeholder="e.g. 7"
                step="0.5"
              />
              <Button type="submit" variant="danger" loading={submitting}>
                Override
              </Button>
            </form>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">
              Justification (for override)
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={2}
              className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Reason for overriding the AI score..."
            />
          </div>
        </div>

        {/* Audit trail moved to bottom of left column */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase mb-2">
            Audit History
          </p>
          <Alert type="error">{historyError}</Alert>
          {historyLoading ? (
            <p className="text-sm text-slate-500">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-slate-500">No history recorded.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {history.map((h) => (
                <li key={h.id} className="bg-white border border-slate-200 rounded-md p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <Badge color={h.action === "ai_graded" ? "blue" : h.action === "overridden" ? "red" : "green"}>
                      {h.action}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {h.timestamp ? new Date(h.timestamp).toLocaleString() : ""}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Score: {h.old_score ?? "—"} → {h.new_score ?? "—"}
                  </p>
                  <p className="text-xs text-slate-500">By: {h.changed_by}</p>
                  {h.reason && <p className="text-xs text-slate-500 mt-1">Reason: {h.reason}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right: PDF Viewer */}
      <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-200 dark:bg-slate-700 p-2 flex justify-between items-center text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Answer Script Viewer</span>
          {numPages && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
                className="px-2 py-1 bg-white dark:bg-slate-600 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-slate-600 dark:text-slate-300">Page {pageNumber} of {numPages}</span>
              <button 
                onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                disabled={pageNumber >= numPages}
                className="px-2 py-1 bg-white dark:bg-slate-600 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto p-4 flex justify-center items-start min-h-[500px]">
          {pdfUrl ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<p className="text-sm text-slate-500 mt-4">Loading PDF...</p>}
              error={<p className="text-sm text-red-500 mt-4">Failed to load PDF. Make sure the file exists on the server.</p>}
            >
              <Page 
                pageNumber={pageNumber} 
                width={500}
                renderTextLayer={false} 
                renderAnnotationLayer={false} 
                className="shadow-md"
              />
            </Document>
          ) : (
            <p className="text-sm text-slate-500 mt-4">No PDF file available for this submission.</p>
          )}
        </div>
      </div>
    </div>
  );
}
