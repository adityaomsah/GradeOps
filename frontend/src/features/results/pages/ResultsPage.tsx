import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { queryKeys } from '@/constants/queryKeys'
import { ROUTES } from '@/constants/routes'
import { resultsService } from '@/services/resultsService'
import { formatDate, formatScore } from '@/lib/utils'

export function ResultsPage() {
  const resultsQuery = useQuery({
    queryKey: queryKeys.results.all,
    queryFn: resultsService.list,
  })

  if (resultsQuery.isError) {
    return (
      <ErrorState
        message={resultsQuery.error.message}
        onRetry={() => resultsQuery.refetch()}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Your Results"
        description="Track grades, feedback, and performance over time."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resultsQuery.data?.map((result) => (
          <Card key={result.exam_id}>
            <CardContent className="flex flex-col gap-4 pt-6">
              
              {/* Header */}
              <div>
                <p className="font-medium">{result.exam_title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(result.submitted_at)}
                </p>
              </div>

              {/* Score + Action */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-3xl font-semibold">{result.grade}</p>

                  <p className="text-sm text-muted-foreground">
                    {formatScore(result.score, result.max_score)}
                  </p>
                </div>

                <Button asChild size="sm">
                  <Link to={ROUTES.examResult(result.exam_id)}>
                    View details
                  </Link>
                </Button>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}