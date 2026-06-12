import React from 'react';

function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center font-sans selection:bg-indigo-500 selection:text-white"
      style={{ background: '#0a0a0f' }}>
      
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="relative w-full max-w-sm px-4">
        {/* Logo mark */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 4h10M3 8h7M3 12h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            GradeOps
          </span>
        </div>

        {/* Card */}
        <div className="rounded-xl border p-8"
          style={{ background: '#111118', borderColor: '#1e1e2e' }}>
          <h1 className="text-2xl text-white font-bold tracking-tight mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: '#52525b' }}>
            Sign in to access the evaluation queue.
          </p>

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#52525b' }}>
                Instructor Email
              </label>
              <input
                type="email"
                defaultValue="admin@gradeops.edu"
                className="w-full rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-all"
                style={{
                  background: '#1c1c27',
                  border: '1px solid #2a2a3d',
                  fontFamily: 'system-ui, sans-serif'
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#2a2a3d'}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#52525b' }}>
                Access Token
              </label>
              <input
                type="password"
                defaultValue="••••••••"
                className="w-full rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-all"
                style={{
                  background: '#1c1c27',
                  border: '1px solid #2a2a3d',
                  fontFamily: 'system-ui, sans-serif'
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#2a2a3d'}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-sm text-white transition-all duration-150 mt-2"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.03em'
              }}
              onMouseEnter={e => e.target.style.opacity = '0.9'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >
              Initialize Session
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#3f3f46' }}>
          GradeOps · Evaluation Suite v2.4
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
