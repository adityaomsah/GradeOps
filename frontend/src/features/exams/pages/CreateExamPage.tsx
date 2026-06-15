import { useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { examFormSchema, type ExamFormValues } from '@/lib/validators/schemas'
import { examService } from '@/services/examService'
import { ROUTES } from '@/constants/routes'

function createId() {
  return crypto.randomUUID()
}

const defaultQuestion = () => ({
  id: createId(),
  prompt: '',
  max_marks: 10,
  order: 0,
  criteria: [{ id: createId(), name: 'Clarity', weight: 50, max_marks: 5, description: '' }],
})

export function CreateExamPage() {
  const navigate = useNavigate()
  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: '',
      course: '',
      description: '',
      questions: [defaultQuestion()],
    },
  })

  const questionsArray = useFieldArray({ control: form.control, name: 'questions' })
  const watchedQuestions = useWatch({ control: form.control, name: 'questions' })

  const totalMarks = useMemo(
    () => (watchedQuestions ?? []).reduce((sum, question) => sum + Number(question.max_marks || 0), 0),
    [watchedQuestions],
  )

  const createMutation = useMutation({
    mutationFn: examService.create,
    onSuccess: (exam) => {
      toast.success('Exam created successfully')
      navigate(ROUTES.examDetail(exam.id))
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <div>
      <PageHeader
        title="Create Exam"
        description="Build a rubric-driven exam with weighted criteria and live preview."
        breadcrumbs={[{ label: 'Exams', href: ROUTES.exams }, { label: 'Create' }]}
      />

      <form
        className="grid gap-6 xl:grid-cols-[1.4fr_1fr]"
        onSubmit={form.handleSubmit((values) =>
          createMutation.mutate({
            ...values,
            questions: values.questions.map((question, index) => ({
              ...question,
              order: index,
            })),
          }),
        )}
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Exam Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Title</Label>
                <Input {...form.register('title')} placeholder="Midterm Examination" />
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Input {...form.register('course')} placeholder="CS101" />
              </div>
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Input type="datetime-local" {...form.register('scheduled_at')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea {...form.register('description')} placeholder="Optional exam instructions..." />
              </div>
            </CardContent>
          </Card>

          {questionsArray.fields.map((field, questionIndex) => (
            <Card key={field.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Question {questionIndex + 1}</CardTitle>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" disabled={questionIndex === 0} onClick={() => questionsArray.move(questionIndex, questionIndex - 1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={questionIndex === questionsArray.fields.length - 1}
                    onClick={() => questionsArray.move(questionIndex, questionIndex + 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => questionsArray.remove(questionIndex)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Prompt</Label>
                  <Textarea {...form.register(`questions.${questionIndex}.prompt`)} />
                </div>
                <div className="space-y-2">
                  <Label>Max Marks</Label>
                  <Input type="number" {...form.register(`questions.${questionIndex}.max_marks`, { valueAsNumber: true })} />
                </div>
                <CriteriaFields questionIndex={questionIndex} form={form} />
              </CardContent>
            </Card>
          ))}

          <Button type="button" variant="outline" onClick={() => questionsArray.append(defaultQuestion())}>
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>

        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(watchedQuestions ?? []).map((question, index) => (
                <div key={question.id} className="rounded-lg border border-border p-4">
                  <p className="font-medium">Q{index + 1}: {question.prompt || 'Untitled question'}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Max marks: {question.max_marks}</p>
                  <div className="mt-3 space-y-1">
                    {question.criteria?.map((criterion) => (
                      <div key={criterion.id} className="flex justify-between text-sm">
                        <span>{criterion.name}</span>
                        <span>{criterion.max_marks} pts · {criterion.weight}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="rounded-lg bg-muted/50 p-4 text-sm">
                Total marks: <strong>{totalMarks}</strong>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Publishing...' : 'Publish Exam'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

function CriteriaFields({
  questionIndex,
  form,
}: {
  questionIndex: number
  form: ReturnType<typeof useForm<ExamFormValues>>
}) {
  const criteriaArray = useFieldArray({ control: form.control, name: `questions.${questionIndex}.criteria` })

  return (
    <div className="space-y-3">
      <Label>Rubric Criteria</Label>
      {criteriaArray.fields.map((field, criterionIndex) => (
        <div key={field.id} className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-4">
          <Input placeholder="Name" {...form.register(`questions.${questionIndex}.criteria.${criterionIndex}.name`)} />
          <Input type="number" placeholder="Weight %" {...form.register(`questions.${questionIndex}.criteria.${criterionIndex}.weight`, { valueAsNumber: true })} />
          <Input type="number" placeholder="Max marks" {...form.register(`questions.${questionIndex}.criteria.${criterionIndex}.max_marks`, { valueAsNumber: true })} />
          <Button type="button" variant="ghost" size="icon" onClick={() => criteriaArray.remove(criterionIndex)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          criteriaArray.append({ id: createId(), name: '', weight: 0, max_marks: 1, description: '' })
        }
      >
        <Plus className="h-4 w-4" />
        Add Criterion
      </Button>
    </div>
  )
}
