import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/authService'
import type { LoginRequest } from '@/types/auth'
import { tokenStorage } from '@/utils/storage'

export { AuthProvider } from '@/features/auth/components/AuthProvider'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function useLoginMutation() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginRequest) =>
      authService.login(payload.email, payload.password),
    onSuccess: (data) => {
      tokenStorage.setAccessToken(data.access_token)

      toast.success('Login successful')

      navigate(ROUTES.dashboard)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Invalid email or password')
    },
  })
}

export function useLogoutMutation() {
  const { logout } = useAuth()

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => logout(),
  })
}
