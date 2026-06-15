export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
  },
  exams: {
    all: (params?: unknown) => ['exams', params] as const,
    detail: (id: string) => ['exams', id] as const,
  },
  submissions: {
    all: (params?: unknown) => ['submissions', params] as const,
    detail: (id: string) => ['submissions', id] as const,
  },
  review: {
    detail: (submissionId: string) => ['review', submissionId] as const,
    history: (submissionId: string) => ['review', submissionId, 'history'] as const,
    queue: ['review', 'queue'] as const,
  },
  users: {
    all: (params?: unknown) => ['users', params] as const,
    detail: (id: string) => ['users', id] as const,
  },
  results: {
    all: ['results'] as const,
    detail: (examId: string) => ['results', examId] as const,
  },
  search: (query: string) => ['search', query] as const,
}
