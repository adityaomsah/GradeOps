// components/Alert.jsx
// Inline message banners for errors, success messages, and info notes.

export default function Alert({ type = "info", children, className = "" }) {
  const styles = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    error: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  };

  if (!children) return null;

  return (
    <div className={`border rounded-md px-3 py-2 text-sm ${styles[type] || styles.info} ${className}`}>
      {children}
    </div>
  );
}
