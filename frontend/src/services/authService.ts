import { api } from './api'
import type {  User, UserRole } from '@/types/auth'
import { tokenStorage } from '@/utils/storage'
import { jwtDecode } from 'jwt-decode'

export const authService = {
  async login(email: string, password: string) {
  const formData = new URLSearchParams()

  formData.append('username', email)
  formData.append('password', password)

  const { data } = await api.post('/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  return data
},

  async logout() {
    try {
      await api.post('/logout')
    } finally {
      tokenStorage.clear()
    }
  },

  async me(): Promise<User> {
  const token = tokenStorage.getAccessToken()

  if (!token) {
    throw new Error('No token found')
  }

  interface JwtPayload {
    sub: string
    role: UserRole
  }

  const payload = jwtDecode<JwtPayload>(token)

  return {
    id: payload.sub,
    email: payload.sub,
    name: payload.sub.split('@')[0],
    role: payload.role,
    avatar_url: null,
  }
},

  async updateProfile(payload: Pick<User, 'name' | 'email'>) {
    const { data } = await api.patch<User>('/me', payload)
    return data
  },

  async changePassword(payload: { current_password: string; new_password: string }) {
    await api.post('/change-password', payload)
  },
}
