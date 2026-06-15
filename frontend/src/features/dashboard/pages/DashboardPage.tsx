import { PageHeader } from '@/components/layout/PageHeader'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to the examination management system."
      />

      <div className="rounded-xl border bg-card p-8">
        <h2 className="text-2xl font-semibold">
          Welcome 👋
        </h2>

        <p className="mt-3 text-muted-foreground">
          Manage exams, review submissions, and monitor academic activities
          from a single place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-6">
          <h3 className="font-medium">Exams</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create, edit, and manage examinations.
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h3 className="font-medium">Submissions</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            View and evaluate student submissions.
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h3 className="font-medium">Reviews</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Access grading and review workflows.
          </p>
        </div>
      </div>
    </div>
  )
}