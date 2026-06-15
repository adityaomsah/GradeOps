import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { submissionService } from '@/services/submissionService'

export function PDFViewer({ submissionId }: { submissionId: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | undefined
    submissionService
      .getFileBlob(submissionId)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch((err: Error) => setError(err.message))

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [submissionId])

  if (error) {
    return (
      <div className="flex h-full min-h-[480px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        PDF preview unavailable. {error}
      </div>
    )
  }

  if (!url) return <Skeleton className="h-[480px] w-full rounded-lg" />

  return <iframe title="Submission PDF" src={url} className="h-[calc(100vh-220px)] min-h-[480px] w-full rounded-lg border border-border bg-white" />
}
