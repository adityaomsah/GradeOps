import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { queryKeys } from '@/constants/queryKeys'
import { ROUTES } from '@/constants/routes'
import { submissionService } from '@/services/submissionService'
import { formatDate } from '@/lib/utils'

export function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>()

  const submissionId = id ?? ''

  const submissionQuery = useQuery({
    queryKey: queryKeys.submissions.detail(submissionId),
    queryFn: () => submissionService.getById(submissionId),
    enabled: !!submissionId,
  })

  if (submissionQuery.isError) {
    return (
      <ErrorState
        message={submissionQuery.error.message}
        onRetry={() => submissionQuery.refetch()}
      />
    )
  }

  const submission = submissionQuery.data

  return (
    <div>
      <PageHeader
        title={`Submission ${submission?.id ?? ''}`}
        description={`Exam ${submission?.exam_id ?? ''}`}
        actions={
          submission ? (
            <Button asChild>
              <Link to={ROUTES.review(String(submission.id))}>
                Open Review
              </Link>
            </Button>
          ) : null
        }
      />

      {submission && (
        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">

            <div>
              <p className="text-caption">Submission ID</p>
              <p className="font-medium">{submission.id}</p>
            </div>

            <div>
              <p className="text-caption">Exam ID</p>
              <p className="font-medium">{submission.exam_id}</p>
            </div>

            <div>
              <p className="text-caption">Roll No</p>
              <p className="font-medium">
                {submission.student_roll_no ?? '—'}
              </p>
            </div>

            <div>
              <p className="text-caption">File</p>
              <p className="font-medium break-all">
                {submission.file_url}
              </p>
            </div>

            <div>
              <p className="text-caption">Status</p>
              <StatusBadge status={submission.status} />
            </div>

            <div>
              <p className="text-caption">Score</p>
              <p className="font-medium">
                {submission.score ?? submission.score ?? '—'}
              </p>
            </div>

            <div>
              <p className="text-caption">Created</p>
              <p className="font-medium">
                {submission.uploaded_at ? formatDate(submission.uploaded_at) : '—'}
              </p>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  )
}