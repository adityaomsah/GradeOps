export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  exams: '/exams',
  examCreate: '/exams/create',
  examDetail: (id: string) => `/exams/${id}`,
  examEdit: (id: string) => `/exams/${id}/edit`,
  upload: '/submissions/upload',
  submissionDetail: (id: string) => `/submissions/${id}`,
  submissions: '/submissions',
  review: (submissionId: string) => `/review/${submissionId}`,
  results: '/results',
  examResult: (examId: string) => `/results/${examId}`,
  settings: '/settings',
} as const

export const ROLE_HOME: Record<string, string> = {
  instructor: ROUTES.dashboard,
  ta: ROUTES.dashboard,
  student: ROUTES.results,
}
