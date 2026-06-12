import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UploadView() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleUpload = () => {
    setIsUploading(true);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => navigate('/dashboard'), 500);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0a0a0f', fontFamily: 'system-ui, sans-serif' }}>

      {/* Back link */}
      <div className="w-full max-w-xl mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm transition-colors duration-150"
          style={{ color: '#52525b' }}
          onMouseEnter={e => e.currentTarget.style.color = '#a1a1aa'}
          onMouseLeave={e => e.currentTarget.style.color = '#52525b'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to dashboard
        </button>
      </div>

      <div className="w-full max-w-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Ingest Answer Scripts
          </h1>
          <p style={{ color: '#52525b' }}>
            Upload student PDFs to begin the AI evaluation pipeline.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          className="rounded-2xl flex flex-col items-center justify-center py-16 px-8 transition-all duration-150 mb-6"
          style={{
            background: '#111118',
            border: '2px dashed #2a2a3d',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3d'}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: '#17172a' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>

          <p className="text-sm font-medium mb-1" style={{ color: '#a1a1aa' }}>
            Drag & drop PDF files here
          </p>
          <p className="text-xs mb-6" style={{ color: '#3f3f56' }}>
            Supports batch uploads up to 50 files
          </p>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-150"
            style={{
              background: isUploading ? '#1e1e33' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: isUploading ? '#52525b' : '#fff',
              fontFamily: "'DM Sans', sans-serif",
              cursor: isUploading ? 'not-allowed' : 'pointer'
            }}
          >
            {isUploading ? "Uploading..." : "Browse Local Files"}
          </button>
        </div>

        {/* Progress */}
        {isUploading && (
          <div className="rounded-xl p-5" style={{ background: '#111118', border: '1px solid #1a1a27' }}>
            <div className="flex justify-between text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: '#52525b' }}>
              <span>Transferring to Pipeline</span>
              <span className="tabular-nums" style={{ color: '#818cf8' }}>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: '#1e1e2e' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #6366f1, #818cf8)'
                }}
              />
            </div>
            <p className="text-xs mt-3" style={{ color: '#3f3f56' }}>
              {progress < 100 ? 'Processing documents through evaluation pipeline...' : 'Complete — redirecting to dashboard'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadView;
