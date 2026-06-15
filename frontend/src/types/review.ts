export type ReviewStatus = 'draft' | 'in_review' | 'approved' | 'finalized'

export interface QuestionScore {
  question_id: string
  prompt: string
  max_marks: number
  score: number
  ai_score?: number
  feedback?: string
  ai_feedback?: string
  criteria_scores: Array<{
    criterion_id: string
    name: string
    max_marks: number
    score: number
    ai_score?: number
  }>
}

export interface Review {
  id: string
  submission_id: string
  status: ReviewStatus
  total_score: number
  max_score: number
  ai_confidence: number
  rubric_alignment: number
  reviewer_notes?: string
  question_scores: QuestionScore[]
  updated_at: string
}

export interface ReviewHistoryEntry {
  id: string
  action: string
  actor_name: string
  created_at: string
  details?: string
}

export interface ReviewQueueItem {
  submission_id: string
  student_name: string
  exam_title: string
  status: ReviewStatus
  score?: number | null
  updated_at: string
}
