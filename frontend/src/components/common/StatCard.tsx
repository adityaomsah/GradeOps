import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ title, value, change, icon: Icon, trend = 'neutral' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          {change ? (
            <p
              className={cn(
                'mt-1 text-xs',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-destructive',
                trend === 'neutral' && 'text-muted-foreground',
              )}
            >
              {change}
            </p>
          ) : null}
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
