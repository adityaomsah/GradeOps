import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {breadcrumbs?.length ? (
          <nav className="mb-3 flex items-center gap-1 text-caption" aria-label="Breadcrumb">
            {breadcrumbs.map((item, index) => (
              <span key={item.label} className="flex items-center gap-1">
                {index > 0 ? <ChevronRight className="h-3 w-3" /> : null}
                {item.href ? (
                  <Link to={item.href} className="hover:text-foreground">
                    {item.label}
                  </Link>
                ) : (
                  <span className={cn(index === breadcrumbs.length - 1 && 'text-foreground')}>{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="text-h1">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-body text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
