import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ConfidenceIndicator } from './ConfidenceIndicator'
import type { Review } from '@/types/review'

interface AIEvaluationPanelProps {
  review: Review
  notes: string
  onNotesChange: (value: string) => void
}

export function AIEvaluationPanel({ review, notes, onNotesChange }: AIEvaluationPanelProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConfidenceIndicator value={review.ai_confidence} />
          <div>
            <p className="text-sm text-muted-foreground">Rubric Alignment</p>
            <p className="text-2xl font-semibold">{review.rubric_alignment}%</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Suggested Feedback</p>
            <div className="rounded-lg bg-muted/40 p-3 text-sm leading-relaxed">
              {review.question_scores[0]?.ai_feedback ?? 'AI feedback will appear here once evaluation completes.'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reviewer Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={notes} onChange={(event) => onNotesChange(event.target.value)} placeholder="Internal review notes..." />
        </CardContent>
      </Card>
    </div>
  )
}
