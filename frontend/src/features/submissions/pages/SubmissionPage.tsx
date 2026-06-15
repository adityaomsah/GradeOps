import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { queryKeys } from '@/constants/queryKeys'
import { ROUTES } from '@/constants/routes'
import { submissionService } from '@/services/submissionService'

export function SubmissionsPage() {
  const submissionsQuery = useQuery({
    queryKey: queryKeys.submissions.all(),
    queryFn: () => submissionService.list(),
  })

  const submissions = submissionsQuery.data?.items ?? []

  return (
    <div>
      <PageHeader
        title="Submissions"
        description="Track uploaded answer sheets and grading status."
      />

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submission ID</TableHead>
              <TableHead>Exam ID</TableHead>
              <TableHead>Student Roll No</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>{submission.id}</TableCell>

                <TableCell>{submission.exam_id}</TableCell>

                <TableCell>
                  {submission.student_roll_no ?? '—'}
                </TableCell>

                <TableCell>
                  <StatusBadge status={submission.status} />
                </TableCell>

                <TableCell>
                  {submission.score ?? submission.score ?? '—'}
                </TableCell>

                <TableCell>
                  <Button size="sm" asChild>
                    <Link to={ROUTES.review(submission.id.toString())}>
                      Review
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {!submissions.length && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  No submissions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}