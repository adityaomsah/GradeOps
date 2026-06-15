export type UserRole = 'instructor' | 'ta' | 'student'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url?: string | null
  created_at?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type?: string
}

export interface LoginRequest {
  email: string
  password: string
  remember_me?: boolean
}

export interface LoginResponse extends AuthTokens {
  user: User
}
