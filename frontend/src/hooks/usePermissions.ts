import { useAuth } from '@/features/auth/hooks/useAuth'
import { can, type Permission } from '@/constants/permissions'
import type { UserRole } from '@/types/auth'

export function usePermissions() {
  const { user } = useAuth()

  return {
    role: user?.role,
    can: (permission: Permission) => can(user?.role, permission),
    hasRole: (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
  }
}
