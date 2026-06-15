// pages/AnalyticsPage.jsx
// GET /analytics/dashboard            -> overall summary cards
// GET /analytics/grade-distribution   -> A/B/C/D/F bar chart (simple CSS bars)
// GET /analytics/exam/{exam_id}       -> per-exam detail (score stats, distribution)

import { useEffect, useState } from "react";
import { getDashboardSummary, getGradeDistribution, getExamAnalytics } from "../api/analytics";
import { getAllExams } from "../api/exams";
import { getErrorMessage } from "../api/client";
import Card from "../components/Card";
import Select from "../components/Select";
import Alert from "../components/Alert";

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examAnalytics, setExamAnalytics] = useState(null);
  const [examError, setExamError] = useState("");
  const [examLoading, setExamLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [summaryData, distributionData, examsData] = await Promise.all([
          getDashboardSummary(),
          getGradeDistribution(),
          getAllExams(),
        ]);
        setSummary(summaryData);
        setDistribution(distributionData);
        setExams(examsData);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedExamId) {
      setExamAnalytics(null);
      return;
    }
    setExamLoading(true);
    setExamError("");
    getExamAnalytics(selectedExamId)
      .then(setExamAnalytics)
      .catch((err) => setExamError(getErrorMessage(err)))
      .finally(() => setExamLoading(false));
  }, [selectedExamId]);

  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  const gradeColors = {
    A: "bg-emerald-500",
    B: "bg-blue-500",
    C: "bg-amber-500",
    D: "bg-orange-500",
    F: "bg-red-500",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Analytics</h1>
        <p className="text-sm text-slate-500">
          Overview of grading progress and score distributions.
        </p>
      </div>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <p className="text-sm text-slate-500">Loading analytics...</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <SummaryCard label="Exams" value={summary?.total_exams} />
            <SummaryCard label="Submissions" value={summary?.total_submissions} />
            <SummaryCard label="Graded" value={summary?.graded_submissions} />
            <SummaryCard label="Avg Score" value={summary?.average_score} />
            <SummaryCard label="Plagiarism Flags" value={summary?.plagiarism_flags} highlight="red" />
            <SummaryCard label="Pending Reviews" value={summary?.pending_reviews} highlight="amber" />
          </div>

          {/* Grade distribution chart */}
          <Card title="Grade Distribution (All Exams)">
            {distribution.length === 0 || distribution.every((d) => d.count === 0) ? (
              <p className="text-sm text-slate-500">No graded submissions yet.</p>
            ) : (
              <div className="flex items-end gap-4 h-40 pt-4">
                {distribution.map((d) => (
                  <div key={d.grade} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-slate-500">{d.count}</span>
                    <div
                      className={`w-full rounded-t-md ${gradeColors[d.grade] || "bg-slate-400"}`}
                      style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                    />
                    <span className="text-sm font-medium text-slate-600">{d.grade}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Per-exam analytics */}
          <Card title="Per-Exam Breakdown">
            <Select
              label="Select Exam"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              options={exams.map((ex) => ({
                value: ex.id,
                label: `${ex.course_code} - ${ex.course_name}`,
              }))}
            />

            <div className="mt-4">
              <Alert type="error">{examError}</Alert>
              {examLoading && <p className="text-sm text-slate-500">Loading exam analytics...</p>}

              {examAnalytics && examAnalytics.total_students === 0 && (
                <p className="text-sm text-slate-500">{examAnalytics.message}</p>
              )}

              {examAnalytics && examAnalytics.total_students > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatBox label="Students" value={examAnalytics.total_students} />
                    <StatBox label="Average" value={examAnalytics.average_score} />
                    <StatBox label="Median" value={examAnalytics.median_score} />
                    <StatBox label="Min / Max" value={`${examAnalytics.min_score} / ${examAnalytics.max_score}`} />
                    <StatBox label="Max Marks" value={examAnalytics.max_marks} />
                    <StatBox label="Plagiarism Flagged" value={examAnalytics.plagiarism_flagged_count} highlight="red" />
                    <StatBox label="TA Reviewed" value={examAnalytics.ta_reviewed_count} highlight="blue" />
                    <StatBox label="TA Pending" value={examAnalytics.ta_pending_count} highlight="amber" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-2">
                      Score Distribution (by range)
                    </p>
                    <div className="flex flex-col gap-1">
                      {Object.entries(examAnalytics.score_distribution || {}).map(([range, count]) => (
                        <div key={range} className="flex items-center gap-2 text-sm">
                          <span className="w-24 text-slate-500">{range}</span>
                          <div className="flex-1 bg-slate-100 rounded h-3 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-3"
                              style={{
                                width: `${
                                  examAnalytics.total_students
                                    ? (count / examAnalytics.total_students) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="w-8 text-right text-slate-600">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, highlight }) {
  const colorMap = {
    red: "text-red-600",
    amber: "text-amber-600",
  };
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 text-center">
      <p className={`text-2xl font-bold ${colorMap[highlight] || "text-slate-800"}`}>
        {value ?? "—"}
      </p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function StatBox({ label, value, highlight }) {
  const colorMap = {
    red: "text-red-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
  };
  return (
    <div className="bg-slate-50 rounded-md p-3 text-center">
      <p className={`text-lg font-semibold ${colorMap[highlight] || "text-slate-800"}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
