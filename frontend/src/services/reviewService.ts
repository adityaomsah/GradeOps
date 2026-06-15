import { api } from './api'
import type { Review, ReviewHistoryEntry } from '@/types/review'

export interface UpdateReviewPayload {
  question_scores?: Review['question_scores']
  reviewer_notes?: string
  status?: Review['status']
}

export const reviewService = {
  async getBySubmissionId(submissionId: string) {
    const { data } = await api.get<Review>(`/reviews/${submissionId}`)
    return data
  },

  async saveDraft(submissionId: string, payload: UpdateReviewPayload) {
    const { data } = await api.patch<Review>(`/reviews/${submissionId}`, payload)
    return data
  },

  async finalize(submissionId: string) {
    const { data } = await api.post<Review>(`/reviews/${submissionId}/finalize`)
    return data
  },

  async getHistory(submissionId: string) {
    const { data } = await api.get<ReviewHistoryEntry[]>(`/reviews/${submissionId}/history`)
    return data
  },
}
