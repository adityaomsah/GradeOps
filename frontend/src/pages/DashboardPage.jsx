import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Card from "../components/Card";

export default function DashboardPage() {
  const { role, email } = useAuth();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
        Welcome to GradeOps
      </h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8">
        You are logged in as <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">{role}</span> {email ? `(${email})` : ''}.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {role === "admin" && (
          <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">User Management</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
              Create new accounts for Instructors, TAs, and Students.
            </p>
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Go to Register &rarr;
            </Link>
          </Card>
        )}

        {(role === "instructor" || role === "ta") && (
          <>
            <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Exams</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
                Manage exams, view total marks, and configuration.
              </p>
              <Link to="/exams" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                View Exams &rarr;
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Rubrics</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
                Upload and view AI-parsed grading rubrics.
              </p>
              <Link to="/rubrics" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                Manage Rubrics &rarr;
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Results & Feedback</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
                Review AI grading, override scores, and check plagiarism flags.
              </p>
              <Link to="/results" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                View Results &rarr;
              </Link>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Analytics</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
                View performance metrics, grade distributions, and AI grading stats.
              </p>
              <Link to="/analytics" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                View Analytics &rarr;
              </Link>
            </Card>
          </>
        )}

        {role === "ta" && (
          <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700 border-indigo-100 dark:border-indigo-900/50">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Upload Submissions</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
              Upload student answer scripts (single or bulk PDFs) for AI grading.
            </p>
            <Link to="/upload" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Start Grading &rarr;
            </Link>
          </Card>
        )}

        {role === "student" && (
          <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">My Results</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
              View your graded answer scripts, scores, and TA feedback.
            </p>
            <Link to="/my-result" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Check Results &rarr;
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
