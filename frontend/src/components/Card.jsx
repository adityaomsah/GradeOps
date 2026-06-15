// components/Card.jsx
// Simple bordered container used throughout the app for sections/panels.

export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-5 ${className}`}>
      {title && (
        <h2 className="text-base font-semibold text-slate-800 mb-3">{title}</h2>
      )}
      {children}
    </div>
  );
}
