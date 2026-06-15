import { createContext, useContext } from 'react'
import type { User } from '@/types/auth'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  setUser: (user: User | null) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
