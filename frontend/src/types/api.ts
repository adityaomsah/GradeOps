import type { User, UserRole } from './auth'

export interface UserListResponse {
  items: User[]
  total: number
  page: number
  page_size: number
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  role?: UserRole
  password?: string
}

export interface SearchResult {
  id: string
  type: 'exam' | 'student' | 'user' | 'submission'
  title: string
  subtitle?: string
  href: string
}

export interface PaginatedParams {
  page?: number
  page_size?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface ApiErrorBody {
  detail?: string | Array<{ msg: string; loc?: string[] }>
  message?: string
}
