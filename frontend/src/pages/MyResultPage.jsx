// pages/MyResultPage.jsx
// GET /results/{student_roll_no} -> student (own result only)
//
// The backend identifies "own result" by matching the logged-in user's
// roll_no (stored on their User record) against the roll_no on the Grade.
// We get the student's roll_no from... the URL param they enter, since the
// JWT only contains email+role. The backend itself checks db_user.roll_no
// matches, so a student can only ever successfully fetch their own record.

import { useState } from "react";
import { getStudentResult } from "../api/results";
import { getErrorMessage } from "../api/client";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Badge from "../components/Badge";

export default function MyResultPage() {
  const [rollNo, setRollNo] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!rollNo) return;
    setError("");
    setResult(null);
    setSearched(true);
    setLoading(true);
    try {
      const data = await getStudentResult(rollNo);
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function finalScore(grade) {
    return grade.ta_override_score !== null && grade.ta_override_score !== undefined
      ? grade.ta_override_score
      : grade.score;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">My Result</h1>
        <p className="text-sm text-slate-500">
          Enter your roll number to view your graded result.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="Roll Number"
              type="number"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="e.g. 220103045"
              required
            />
          </div>
          <Button type="submit" loading={loading}>
            View Result
          </Button>
        </form>
      </Card>

      <Alert type="error">{error}</Alert>

      {result && (
        <Card title={`Result for Roll No. ${result.student_roll_no}`}>
          <div className="flex flex-col gap-3 text-sm">
            <p>
              <span className="font-medium text-slate-700">Name: </span>
              {result.student_name || "—"}
            </p>
            <p>
              <span className="font-medium text-slate-700">Score: </span>
              <span className="text-lg font-semibold">
                {result.score === -1 ? "Pending review" : finalScore(result)}
              </span>
            </p>
            <div>
              <p className="font-medium text-slate-700 mb-1">Feedback:</p>
              <p className="bg-slate-50 border border-slate-200 rounded-md p-3">
                {result.justification || "No feedback available yet."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Status:</span>
              {result.ta_reviewed ? (
                <Badge color="blue">Reviewed by TA</Badge>
              ) : (
                <Badge color="slate">AI Graded — Pending Review</Badge>
              )}
            </div>
          </div>
        </Card>
      )}

      {searched && !loading && !result && !error && (
        <Alert type="info">No result found for this roll number.</Alert>
      )}
    </div>
  );
}
