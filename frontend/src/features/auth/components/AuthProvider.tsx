import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { queryKeys } from '@/constants/queryKeys'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/authService'
import { tokenStorage } from '@/utils/storage'
import type { User } from '@/types/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const hasToken = Boolean(tokenStorage.getAccessToken())

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authService.me,
    enabled: hasToken,
    retry: false,
  })

  useEffect(() => {
    const handleLogout = () => {
      tokenStorage.clear()
      queryClient.clear()
      navigate(ROUTES.login)
    }
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [navigate, queryClient])

  const value = {
    user: meQuery.data ?? null,
    isLoading: hasToken && meQuery.isLoading,
    isAuthenticated: Boolean(meQuery.data),
    login: (user: User) => {
      queryClient.setQueryData(queryKeys.auth.me, user)
    },
    logout: () => {
      tokenStorage.clear()
      queryClient.clear()
      navigate(ROUTES.login)
    },
    setUser: (user: User | null) => {
      queryClient.setQueryData(queryKeys.auth.me, user)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
