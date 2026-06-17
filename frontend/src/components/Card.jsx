// components/Card.jsx
// Simple bordered container used throughout the app for sections/panels.

export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-5 transition-colors ${className}`}>
      {title && (
        <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-3">{title}</h2>
      )}
      {children}
    </div>
  );
}
