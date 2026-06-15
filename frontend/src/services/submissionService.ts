import { api, buildParams } from './api'
import type { PaginatedParams } from '@/types/api'
import type { Submission, SubmissionListResponse } from '@/types/submission'

export interface SubmissionFilters extends PaginatedParams {
  exam_id?: string
  status?: string
}

export const submissionService = {
  async list(params?: SubmissionFilters) {
    const { data } = await api.get<SubmissionListResponse>('/submissions', {
      params: buildParams(params),
    })
    return data
  },

  async getById(id: string) {
    const { data } = await api.get<Submission>(`/submissions/${id}`)
    return data
  },

  async upload(examId: number, files: File[]) {
  const results = []

  for (const file of files) {
    const formData = new FormData()

    formData.append('file', file)
    formData.append('exam_id', String(examId))

    // optional: backend should convert file → file_url internally
    const { data } = await api.post('/submissions', formData)

    results.push(data)
  }

  return results
},

  async getFileBlob(id: string) {
    const { data } = await api.get<Blob>(`/submissions/${id}/file`, { responseType: 'blob' })
    return data
  },
}
