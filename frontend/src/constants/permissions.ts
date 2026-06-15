import type { UserRole } from '@/types/auth'

export type Permission =
  | 'exams:view'
  | 'exams:create'
  | 'exams:edit'
  | 'exams:delete'
  | 'submissions:upload'
  | 'submissions:view'
  | 'review:edit'
  | 'results:view'
  | 'settings:edit'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  instructor: [
    'exams:view',
    'exams:create',
    'exams:edit',
    'exams:delete',
    'submissions:upload',
    'submissions:view',
    'review:edit',
    'settings:edit',
  ],
  ta: ['exams:view', 'submissions:upload', 'submissions:view', 'review:edit', 'settings:edit'],
  student: ['results:view', 'settings:edit'],
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}

export function can(role: UserRole | undefined, permission: Permission) {
  if (!role) return false
  return ROLE_PERMISSIONS[role].includes(permission)
}
