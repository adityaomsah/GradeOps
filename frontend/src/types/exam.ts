export type ExamStatus = 'draft' | 'active' | 'archived' | 'closed'

export interface RubricCriterion {
  id: string
  name: string
  description?: string
  weight: number
  max_marks: number
}

export interface ExamQuestion {
  id: string
  prompt: string
  max_marks: number
  order: number
  criteria: RubricCriterion[]
}

export interface Exam {
  id: string
  title: string
  course: string
  description?: string
  status: ExamStatus
  total_marks: number
  submission_count: number
  average_score?: number | null
  scheduled_at?: string | null
  created_at: string
  updated_at: string
  questions?: ExamQuestion[]
}

export interface ExamListResponse {
  items: Exam[]
  total: number
  page: number
  page_size: number
}

export interface CreateExamPayload {
  title: string
  course: string
  description?: string
  scheduled_at?: string
  questions: Omit<ExamQuestion, 'id'>[]
}
