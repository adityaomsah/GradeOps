import { cn } from '@/lib/utils'

export function ConfidenceIndicator({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">AI Confidence</span>
        <span className="font-medium">{clamped}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-250',
            clamped >= 80 ? 'bg-success' : clamped >= 60 ? 'bg-warning' : 'bg-destructive',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
