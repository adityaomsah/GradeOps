import { useCallback, useState, type DragEvent } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface FileUploaderProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  accept?: string
  maxFiles?: number
}

export function FileUploader({ files, onFilesChange, accept = '.pdf', maxFiles = 20 }: FileUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false)

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const next = [...files, ...Array.from(incoming)].slice(0, maxFiles)
      onFilesChange(next)
    },
    [files, maxFiles, onFilesChange],
  )

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(false)
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files)
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragActive(true)
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={onDrop}
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-12 text-center transition-colors',
          isDragActive && 'border-primary bg-primary/5',
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(event) => {
            if (event.target.files?.length) addFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <UploadCloud className="mb-3 h-10 w-10 text-primary" />
        <p className="font-medium">Drag and drop PDF submissions here</p>
        <p className="mt-1 text-sm text-muted-foreground">or click to browse files</p>
      </div>

      {files.length ? (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onFilesChange(files.filter((_, fileIndex) => fileIndex !== index))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
