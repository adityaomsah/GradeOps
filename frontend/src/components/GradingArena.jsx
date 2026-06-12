import React, { useState, useEffect } from 'react';

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-xl p-5"
      style={{
        background: '#111118',
        border: `1px solid ${accent ? '#2a2a45' : '#1a1a27'}`,
        borderTop: accent ? '2px solid #6366f1' : '2px solid #1a1a27'
      }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#52525b' }}>
        {label}
      </p>
      <p className="text-3xl font-bold tabular-nums" style={{ color: '#f4f4f5', fontFamily: "'DM Sans', sans-serif" }}>
        {value}
      </p>
    </div>
  );
}

function GradingArena({ studentName }) {
  const [marks, setMarks] = useState({ q1: 8, q2: 9 });
  const [feedback, setFeedback] = useState("Good logical flow, but could optimize the time complexity in Q1.");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (studentName === "Alice Vance") {
      setMarks({ q1: 7, q2: 8 });
      setFeedback("Solid attempt. Minor syntax errors in the second function.");
    } else if (studentName === "Bob Churn") {
      setMarks({ q1: 9, q2: 10 });
      setFeedback("Excellent work! Perfect code structure and documentation.");
    } else {
      setMarks({ q1: 5, q2: 6 });
      setFeedback("Needs improvement on algorithmic logic.");
    }
    setIsSaved(false);
    setIsProcessing(false);
  }, [studentName]);

  const handleSaveOverride = () => {
    setIsProcessing(true);
    setIsSaved(false);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSaved(true);
    }, 1500);
  };

  // Analytics Dashboard (empty state)
  if (studentName === "None") {
    return (
      <main className="flex-1 overflow-y-auto p-10" style={{ background: '#0a0a0f', fontFamily: 'system-ui, sans-serif' }}>
        <div className="max-w-4xl">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              System Analytics
            </h1>
            <p style={{ color: '#52525b' }}>
              Select a student from the queue, or review current batch telemetry.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-10">
            <StatCard label="Class Average" value="84.2%" />
            <StatCard label="Scripts Evaluated" value="142" />
            <StatCard label="Plagiarism Anomalies" value="2" accent />
          </div>

          {/* Decorative empty state prompt */}
          <div className="rounded-xl border border-dashed p-12 flex flex-col items-center justify-center text-center"
            style={{ borderColor: '#1e1e2e' }}>
            <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
              style={{ background: '#17172a' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: '#71717a' }}>
              Select a student to begin grading
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Active Grading State
  return (
    <main className="flex-1 overflow-y-auto" style={{ background: '#0a0a0f', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header className="px-10 py-8" style={{ borderBottom: '1px solid #1a1a27' }}>
        <div className="flex items-start justify-between max-w-4xl">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: '#17172a', color: '#6366f1' }}>
                {studentName.charAt(0)}
              </div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {studentName}
              </h1>
            </div>
            <p className="text-sm pl-12" style={{ color: '#52525b' }}>
              Reviewing AI evaluation and plagiarism metrics.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#6366f1' }} />
            Active Review
          </div>
        </div>
      </header>

      <div className="px-10 py-8 max-w-4xl">
        {/* Telemetry */}
        <section className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#3f3f56' }}>
            Telemetry
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-5" style={{ background: '#111118', border: '1px solid #1a1a27' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#52525b' }}>
                Confidence Score
              </p>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-white tabular-nums" style={{ fontFamily: "'DM Sans', sans-serif" }}>92%</p>
                <div className="flex-1 mb-1.5">
                  <div className="h-1.5 rounded-full" style={{ background: '#1e1e2e' }}>
                    <div className="h-1.5 rounded-full" style={{ width: '92%', background: 'linear-gradient(90deg, #6366f1, #818cf8)' }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-5" style={{ background: '#111118', border: '1px solid #1a1a27' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#52525b' }}>
                Plagiarism Detected
              </p>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-white tabular-nums" style={{ fontFamily: "'DM Sans', sans-serif" }}>4%</p>
                <div className="flex-1 mb-1.5">
                  <div className="h-1.5 rounded-full" style={{ background: '#1e1e2e' }}>
                    <div className="h-1.5 rounded-full" style={{ width: '4%', background: '#22c55e' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grade Override Panel */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#3f3f56' }}>
            Grade Override
          </p>

          <div className="rounded-xl p-6 space-y-6" style={{ background: '#111118', border: '1px solid #1a1a27' }}>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#52525b' }}>
                  Question 1 <span style={{ color: '#3f3f56' }}>/ 10</span>
                </label>
                <input
                  type="number"
                  value={marks.q1}
                  onChange={(e) => setMarks({ ...marks, q1: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none transition-all"
                  style={{
                    background: '#1c1c27',
                    border: '1px solid #2a2a3d',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#2a2a3d'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#52525b' }}>
                  Question 2 <span style={{ color: '#3f3f56' }}>/ 10</span>
                </label>
                <input
                  type="number"
                  value={marks.q2}
                  onChange={(e) => setMarks({ ...marks, q2: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none transition-all"
                  style={{
                    background: '#1c1c27',
                    border: '1px solid #2a2a3d',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#2a2a3d'}
                />
              </div>
            </div>

            {/* Total display */}
            <div className="flex items-center gap-2 text-sm" style={{ color: '#52525b' }}>
              <span>Total:</span>
              <span className="font-bold tabular-nums" style={{ color: '#818cf8' }}>
                {(parseInt(marks.q1) || 0) + (parseInt(marks.q2) || 0)} / 20
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#52525b' }}>
                Instructor Commentary
              </label>
              <textarea
                rows="4"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full rounded-lg px-4 py-3 text-white text-sm focus:outline-none transition-all resize-y leading-relaxed"
                style={{
                  background: '#1c1c27',
                  border: '1px solid #2a2a3d',
                  fontFamily: 'system-ui, sans-serif',
                  color: '#d4d4d8'
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#2a2a3d'}
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleSaveOverride}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-150 flex items-center gap-2"
                style={{
                  background: isProcessing ? '#1e1e33' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: isProcessing ? '#52525b' : '#fff',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '0.03em',
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing && (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                )}
                {isProcessing ? "Compiling..." : "Approve Evaluation"}
              </button>

              {isSaved && (
                <div className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: '#4ade80' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Database sync verified
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default GradingArena;
