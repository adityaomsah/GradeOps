import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { queryKeys } from '@/constants/queryKeys'
import { ROUTES } from '@/constants/routes'
import { examService } from '@/services/examService'
import { formatDate, formatPercent } from '@/lib/utils'
import { usePermissions } from '@/hooks/usePermissions'

export function ExamDetailPage() {
  const { id = '' } = useParams()
  const { can } = usePermissions()

  const examQuery = useQuery({
    queryKey: queryKeys.exams.detail(id),
    queryFn: () => examService.getById(id),
    enabled: Boolean(id),
  })

  if (examQuery.isError) {
    return <ErrorState message={examQuery.error.message} onRetry={() => examQuery.refetch()} />
  }

  if (examQuery.isLoading || !examQuery.data) {
    return <Skeleton className="h-96 w-full rounded-xl" />
  }

  const exam = examQuery.data

  return (
    <div>
      <PageHeader
        title={exam.title}
        description={`${exam.course} · ${exam.submission_count} submissions`}
        breadcrumbs={[{ label: 'Exams', href: ROUTES.exams }, { label: exam.title }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={ROUTES.upload}>Upload Submissions</Link>
            </Button>
            {can('exams:edit') ? (
              <Button asChild>
                <Link to={ROUTES.examEdit(exam.id)}>Edit Exam</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-caption">Status</p><div className="mt-2"><StatusBadge status={exam.status} /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-caption">Total Marks</p><p className="mt-2 text-2xl font-semibold">{exam.total_marks}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-caption">Average Score</p><p className="mt-2 text-2xl font-semibold">{exam.average_score != null ? formatPercent(exam.average_score) : '—'}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-caption">Created</p><p className="mt-2 font-medium">{formatDate(exam.created_at)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Questions & Rubric</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {exam.questions?.map((question, index) => (
            <div key={question.id} className="rounded-lg border border-border p-4">
              <p className="font-medium">Q{index + 1}: {question.prompt}</p>
              <p className="mt-1 text-sm text-muted-foreground">Max marks: {question.max_marks}</p>
              <div className="mt-3 space-y-2">
                {question.criteria.map((criterion) => (
                  <div key={criterion.id} className="flex justify-between text-sm">
                    <span>{criterion.name}</span>
                    <span>{criterion.max_marks} pts · {criterion.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          )) ?? <p className="text-sm text-muted-foreground">No questions configured.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
