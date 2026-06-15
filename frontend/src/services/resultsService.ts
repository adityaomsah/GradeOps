import { api, buildParams } from './api'

export interface StudentResultSummary {
  exam_id: string
  exam_title: string
  score: number
  max_score: number
  grade: string
  submitted_at: string
}

export interface QuestionResult {
  question_id: string
  prompt: string
  score: number
  max_marks: number
  feedback?: string
}

export interface ExamResultDetail {
  exam_id: string
  exam_title: string
  score: number
  max_score: number
  grade: string
  class_average: number
  percentile: number
  feedback?: string
  question_results: QuestionResult[]
  trend: Array<{ date: string; value: number }>
}

export const resultsService = {
  async list() {
    const { data } = await api.get<StudentResultSummary[]>('/results', { params: buildParams({}) })
    return data
  },

  async getByExamId(examId: string) {
    const { data } = await api.get<ExamResultDetail>(`/results/${examId}`)
    return data
  },
}
