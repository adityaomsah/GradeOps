import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { QuestionScore } from '@/types/review'

interface RubricPanelProps {
  questions: QuestionScore[]
  onChange: (questions: QuestionScore[]) => void
}

export function RubricPanel({ questions, onChange }: RubricPanelProps) {
  const updateQuestion = (index: number, patch: Partial<QuestionScore>) => {
    onChange(questions.map((question, questionIndex) => (questionIndex === index ? { ...question, ...patch } : question)))
  }

  return (
    <div className="space-y-6">
      {questions.map((question, questionIndex) => (
        <div key={question.question_id} className="rounded-xl border border-border p-4">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{question.prompt}</p>
              <p className="text-sm text-muted-foreground">Max {question.max_marks} marks</p>
            </div>
            <div className="w-24">
              <Label className="text-xs">Score</Label>
              <Input
                type="number"
                value={question.score}
                max={question.max_marks}
                min={0}
                onChange={(event) => updateQuestion(questionIndex, { score: Number(event.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-3">
            {question.criteria_scores.map((criterion, criterionIndex) => (
              <div key={criterion.criterion_id} className="grid gap-2 rounded-lg bg-muted/30 p-3 md:grid-cols-[1fr_100px]">
                <div>
                  <p className="text-sm font-medium">{criterion.name}</p>
                  <p className="text-xs text-muted-foreground">Max {criterion.max_marks}</p>
                </div>
                <Input
                  type="number"
                  value={criterion.score}
                  max={criterion.max_marks}
                  min={0}
                  onChange={(event) => {
                    const nextCriteria = question.criteria_scores.map((item, idx) =>
                      idx === criterionIndex ? { ...item, score: Number(event.target.value) } : item,
                    )
                    updateQuestion(questionIndex, { criteria_scores: nextCriteria })
                  }}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <Label>Reviewer Feedback</Label>
            <Textarea
              value={question.feedback ?? ''}
              onChange={(event) => updateQuestion(questionIndex, { feedback: event.target.value })}
              placeholder="Add feedback for the student..."
            />
          </div>
        </div>
      ))}
    </div>
  )
}
