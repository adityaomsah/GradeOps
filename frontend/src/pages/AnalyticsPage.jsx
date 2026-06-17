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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

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
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Analytics</h1>
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
              <div className="h-64 mt-4 w-full text-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution}>
                    <XAxis dataKey="grade" stroke="#94a3b8" />
                    <YAxis allowDecimals={false} stroke="#94a3b8" />
                    <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.1)" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-4">
                        Score Distribution
                      </p>
                      <div className="h-48 text-sm">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={Object.entries(examAnalytics.score_distribution || {}).map(([range, count]) => ({ range, count }))}>
                            <XAxis dataKey="range" stroke="#94a3b8" />
                            <YAxis allowDecimals={false} stroke="#94a3b8" />
                            <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.1)" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-4 text-center">
                        Plagiarism Status
                      </p>
                      <div className="h-48 text-sm">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Flagged", value: examAnalytics.plagiarism_flagged_count },
                                { name: "Clear", value: examAnalytics.total_students - examAnalytics.plagiarism_flagged_count }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              <Cell fill="#ef4444" />
                              <Cell fill="#10b981" />
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                            <Legend verticalAlign="bottom" height={24} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
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
