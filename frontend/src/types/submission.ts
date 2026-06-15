export type SubmissionStatus =
  | 'uploaded'
  | 'processing'
  | 'graded'
  | 'error'

export interface Submission {
  id: number
  exam_id: number
  exam_title?: string
  student_name: string
  student_roll_no?: number
  status: SubmissionStatus

  score?: number | null   // ✅ unified
  max_score?: number | null

  file_name?: string
  file_url?: string

  uploaded_at: string     // ❗ NOT created_at
}

export interface SubmissionListResponse {
  items: Submission[]
  total: number
  page?: number
  page_size?: number
}

export interface UploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}