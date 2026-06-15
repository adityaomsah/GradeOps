import { api, buildParams } from './api'
import type { CreateExamPayload, Exam, ExamListResponse } from '@/types/exam'
import type { PaginatedParams } from '@/types/api'

export interface ExamFilters extends PaginatedParams {
  status?: string
  course?: string
}

export const examService = {
  async list(params?: ExamFilters) {
    const { data } = await api.get<ExamListResponse>('/exam', { params: buildParams(params) })
    return data
  },

  async getById(id: string) {
    const { data } = await api.get<Exam>(`/exam/${id}`)
    return data
  },

  async create(payload: CreateExamPayload) {
    const { data } = await api.post<Exam>('/exam', payload)
    return data
  },

  async update(id: string, payload: Partial<CreateExamPayload>) {
    const { data } = await api.put<Exam>(`/exam/${id}`, payload)
    return data
  },

  async remove(id: string) {
    await api.delete(`/exam/${id}`)
  },

  async bulkDelete(ids: string[]) {
    await api.post('/exam/bulk-delete', { ids })
  },
}
