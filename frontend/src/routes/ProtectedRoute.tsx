import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLE_HOME, ROUTES } from '@/constants/routes'
import type { Permission } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  if (location.pathname === '/') {
    return <Navigate to={ROLE_HOME[user!.role] ?? ROUTES.dashboard} replace />
  }

  return <Outlet />
}

export function RoleGuard({ permission }: { permission: Permission }) {
  const { can } = usePermissions()
  const { user } = useAuth()

  if (!can(permission)) {
    return <Navigate to={ROLE_HOME[user?.role ?? 'student'] ?? ROUTES.dashboard} replace />
  }

  return <Outlet />
}
