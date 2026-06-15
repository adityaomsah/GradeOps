import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PDFViewer } from '@/features/review/components/PDFViewer'
import { RubricPanel } from '@/features/review/components/RubricPanel'
import { AIEvaluationPanel } from '@/features/review/components/AIEvaluationPanel'
import { queryKeys } from '@/constants/queryKeys'
import { reviewService } from '@/services/reviewService'
import { useDebounce } from '@/hooks/useDebounce'
import type { QuestionScore } from '@/types/review'

export function ReviewPage() {
  const { submissionId = '' } = useParams()
  const [questions, setQuestions] = useState<QuestionScore[]>([])
  const [notes, setNotes] = useState('')
  const debouncedQuestions = useDebounce(questions, 1000)
  const debouncedNotes = useDebounce(notes, 1000)

  const reviewQuery = useQuery({
    queryKey: queryKeys.review.detail(submissionId),
    queryFn: () => reviewService.getBySubmissionId(submissionId),
    enabled: Boolean(submissionId),
  })

  useEffect(() => {
    if (!reviewQuery.data) return

    queueMicrotask(() => {
      setQuestions(reviewQuery.data!.question_scores)
      setNotes(reviewQuery.data!.reviewer_notes ?? '')
    })
  }, [reviewQuery.data])

  const saveMutation = useMutation({
    mutationFn: () =>
      reviewService.saveDraft(submissionId, {
        question_scores: questions,
        reviewer_notes: notes,
        status: 'in_review',
      }),
    onSuccess: () => toast.success('Draft saved'),
    onError: (error: Error) => toast.error(error.message),
  })

  const finalizeMutation = useMutation({
    mutationFn: () => reviewService.finalize(submissionId),
    onSuccess: () => toast.success('Grading finalized'),
    onError: (error: Error) => toast.error(error.message),
  })

  useEffect(() => {
    if (!reviewQuery.data || reviewQuery.isFetching) return
    saveMutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuestions, debouncedNotes])

  if (reviewQuery.isError) {
    return <ErrorState message={reviewQuery.error.message} onRetry={() => reviewQuery.refetch()} />
  }

  const review = reviewQuery.data
  const totalScore = questions.reduce((sum, question) => sum + question.score, 0)

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Review Workspace`}
        description={review ? `${review.total_score}/${review.max_score} current score` : 'Loading review...'}
        actions={
          <div className="flex items-center gap-2">
            {review ? <Badge variant="secondary">{review.status.replace('_', ' ')}</Badge> : null}
            <Button variant="outline" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              Save Draft
            </Button>
            <Button onClick={() => finalizeMutation.mutate()} disabled={finalizeMutation.isPending}>
              Finalize
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr_0.9fr]">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium">Submission PDF</h2>
          <PDFViewer submissionId={submissionId} />
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium">Rubric Evaluation</h2>
          {review ? <RubricPanel questions={questions} onChange={setQuestions} /> : null}
        </section>

        <section className="rounded-xl border border-border bg-card p-4 xl:sticky xl:top-24 xl:self-start">
          <h2 className="mb-3 text-sm font-medium">AI Insights</h2>
          {review ? <AIEvaluationPanel review={review} notes={notes} onNotesChange={setNotes} /> : null}
        </section>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        <span>Auto-save enabled · Score {totalScore}/{review?.max_score ?? 0}</span>
        <span>Shortcuts: Ctrl+K search · G then D/E/A navigation</span>
      </div>
    </div>
  )
}
