import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
      <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
      <h3 className="text-h3">{title}</h3>
      <p className="mt-2 max-w-md text-body text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}
