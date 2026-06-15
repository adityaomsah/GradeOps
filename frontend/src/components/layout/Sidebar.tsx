import { motion } from 'framer-motion'
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Upload,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/button'

const navItems = [
  { label: 'Dashboard', href: ROUTES.dashboard, icon: LayoutDashboard, permission: null, roles: ['instructor', 'ta'] },
  { label: 'Exams', href: ROUTES.exams, icon: BookOpen, permission: 'exams:view' as const, roles: ['instructor', 'ta'] },
  { label: 'Uploads', href: ROUTES.upload, icon: Upload, permission: 'submissions:upload' as const, roles: ['instructor', 'ta'] },
  { label: 'Results', href: ROUTES.results, icon: BarChart3, permission: 'results:view' as const, roles: ['student'] },
  { label: 'Settings', href: ROUTES.settings, icon: Settings, permission: 'settings:edit' as const, roles: ['instructor', 'ta', 'student'] },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { can, hasRole } = usePermissions()

  const visibleItems = navItems.filter((item) => {
    if (!hasRole(...(item.roles as Array<'instructor' | 'ta' | 'student'>))) return false
    if (item.permission && !can(item.permission)) return false
    return true
  })

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 flex h-screen flex-col border-r border-sidebar-border bg-sidebar"
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              G
            </div>
            <span className="font-semibold tracking-tight">GradeOps</span>
          </div>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            G
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center px-2',
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>{item.label}</span> : null}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Button variant="ghost" size={collapsed ? 'icon' : 'default'} className="w-full justify-start" onClick={onToggle}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed ? <span className="ml-2">Collapse</span> : null}
        </Button>
      </div>
    </motion.aside>
  )
}
