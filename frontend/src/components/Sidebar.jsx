import React from 'react';
import { useNavigate } from 'react-router-dom';

function Sidebar({ setStudent }) {
  const navigate = useNavigate();

  const students = [
    { id: 1, name: "Alice Vance", rollNo: "251CS1001", flagged: true },
    { id: 2, name: "Bob Churn", rollNo: "251CS1002", flagged: false },
    { id: 3, name: "Charlie Smith", rollNo: "251CS1003", flagged: false }
  ];

  return (
    <aside className="w-72 h-screen flex flex-col"
      style={{ background: '#0d0d14', borderRight: '1px solid #1a1a27' }}>
      
      {/* Brand Header — indigo top bar is the one signature moment */}
      <div style={{ borderBottom: '1px solid #1a1a27' }}>
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #6366f1, #4f46e5, transparent)' }} />
        <div className="px-6 py-5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 4h10M3 8h7M3 12h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              GradeOps
            </h2>
            <p className="text-xs" style={{ color: '#52525b', fontFamily: 'system-ui, sans-serif' }}>
              Evaluation Queue
            </p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-6 pt-5 pb-2">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3f3f56' }}>
          Students · {students.length}
        </span>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {students.map((student) => (
          <button
            key={student.id}
            onClick={() => setStudent(student.name)}
            className="w-full text-left px-4 py-3.5 rounded-lg mb-1 transition-all duration-150 flex justify-between items-center group"
            style={{ fontFamily: 'system-ui, sans-serif' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#17172a';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar circle */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: '#1e1e33', color: '#6366f1' }}>
                {student.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: '#d4d4d8' }}>
                  {student.name}
                </div>
                <div className="text-xs" style={{ color: '#52525b' }}>
                  {student.rollNo}
                </div>
              </div>
            </div>

            {student.flagged && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0"
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                Review
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Ingest Button */}
      <div className="p-4" style={{ borderTop: '1px solid #1a1a27' }}>
        <button
          onClick={() => navigate('/upload')}
          className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-150"
          style={{
            background: '#17172a',
            color: '#6366f1',
            border: '1px solid #2a2a45',
            fontFamily: "'DM Sans', sans-serif"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#6366f1';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = '#6366f1';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#17172a';
            e.currentTarget.style.color = '#6366f1';
            e.currentTarget.style.borderColor = '#2a2a45';
          }}
        >
          + Ingest Scripts
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
