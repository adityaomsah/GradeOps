import { Badge } from '@/components/ui/badge'
import type { ExamStatus } from '@/types/exam'
import type { SubmissionStatus } from '@/types/submission'
import type { ReviewStatus } from '@/types/review'

const examVariants: Record<ExamStatus, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  draft: 'secondary',
  active: 'success',
  archived: 'outline',
  closed: 'warning',
}

const submissionVariants: Record<SubmissionStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  uploaded: 'secondary',
  processing: 'warning',
  graded: 'success',
  error: 'destructive',
}

const reviewVariants: Record<ReviewStatus, 'default' | 'secondary' | 'success' | 'warning'> = {
  draft: 'secondary',
  in_review: 'warning',
  approved: 'default',
  finalized: 'success',
}

export function StatusBadge({ status }: { status: ExamStatus | SubmissionStatus | ReviewStatus | string }) {
  const variant =
    status in examVariants
      ? examVariants[status as ExamStatus]
      : status in submissionVariants
        ? submissionVariants[status as SubmissionStatus]
        : status in reviewVariants
          ? reviewVariants[status as ReviewStatus]
          : 'outline'

  return (
    <Badge variant={variant} className="capitalize">
      {status.replace('_', ' ')}
    </Badge>
  )
}