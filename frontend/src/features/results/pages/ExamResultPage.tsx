import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { queryKeys } from '@/constants/queryKeys'
import { resultsService } from '@/services/resultsService'
import { formatPercent, formatScore } from '@/lib/utils'

export function ExamResultPage() {
  const { examId = '' } = useParams()
  const resultQuery = useQuery({
    queryKey: queryKeys.results.detail(examId),
    queryFn: () => resultsService.getByExamId(examId),
    enabled: Boolean(examId),
  })

  if (resultQuery.isError) {
    return <ErrorState message={resultQuery.error.message} onRetry={() => resultQuery.refetch()} />
  }

  const result = resultQuery.data

  return (
    <div>
      <PageHeader
        title={result?.exam_title ?? 'Exam Result'}
        description={result ? `${formatScore(result.score, result.max_score)} · Grade ${result.grade}` : undefined}
      />

      {result ? (
        <>
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card><CardContent className="pt-6"><p className="text-caption">Your Score</p><p className="mt-2 text-3xl font-semibold">{formatPercent((result.score / result.max_score) * 100)}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-caption">Class Average</p><p className="mt-2 text-3xl font-semibold">{formatPercent(result.class_average)}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-caption">Percentile</p><p className="mt-2 text-3xl font-semibold">{result.percentile}th</p></CardContent></Card>
          </div>

          <Card className="mt-6">
            <CardHeader><CardTitle className="text-base">Question Feedback</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {result.question_results.map((question) => (
                <div key={question.question_id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-medium">{question.prompt}</p>
                    <p className="text-sm text-muted-foreground">{formatScore(question.score, question.max_marks)}</p>
                  </div>
                  {question.feedback ? <p className="mt-2 text-sm text-muted-foreground">{question.feedback}</p> : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
