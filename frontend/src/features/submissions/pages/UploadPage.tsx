import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { PageHeader } from '@/components/layout/PageHeader'
import { FileUploader } from '@/components/forms/FileUploader'
import { ErrorState } from '@/components/common/ErrorState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { StatusBadge } from '@/components/common/StatusBadge'
import { queryKeys } from '@/constants/queryKeys'
import { examService } from '@/services/examService'
import { submissionService } from '@/services/submissionService'

import type { UploadProgress } from '@/types/submission'

export function UploadPage() {
  const queryClient = useQueryClient()

  const [examId, setExamId] = useState<number | ''>('')
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState<UploadProgress[]>([])

  const examsQuery = useQuery({
    queryKey: queryKeys.exams.all({ status: 'active' }),
    queryFn: () => examService.list({ status: 'active' }),
  })

  const historyQuery = useQuery({
    queryKey: queryKeys.submissions.all({ page_size: 10 }),
    queryFn: () => submissionService.list({ page_size: 10 }),
  })

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!examId) throw new Error('Please select an exam')

      setProgress(
        files.map((file) => ({
          fileName: file.name,
          progress: 0,
          status: 'uploading',
        }))
      )

      return submissionService.upload(examId, files)
    },

    onSuccess: () => {
      toast.success('Upload completed')
      setFiles([])
      setProgress([])

      queryClient.invalidateQueries({
        queryKey: queryKeys.submissions.all(),
      })
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  if (examsQuery.isError) {
    return (
      <ErrorState
        message={examsQuery.error.message}
        onRetry={() => examsQuery.refetch()}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Upload Submissions"
        description="Upload PDFs for automated grading pipeline"
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        {/* LEFT */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Files</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Select
              value={examId ? String(examId) : ''}
              onValueChange={(v) => setExamId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select exam" />
              </SelectTrigger>

              <SelectContent>
                {(examsQuery.data?.items ?? []).map((exam) => (
                  <SelectItem key={exam.id} value={String(exam.id)}>
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FileUploader files={files} onFilesChange={setFiles} />

            {progress.map((item) => (
              <div key={item.fileName} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.fileName}</span>
                  <span>{item.progress}%</span>
                </div>
                <Progress value={item.progress} />
              </div>
            ))}

            <Button
              disabled={!examId || files.length === 0 || uploadMutation.isPending}
              onClick={() => uploadMutation.mutate()}
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Start Upload'}
            </Button>
          </CardContent>
        </Card>

        {/* RIGHT */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Uploads</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {historyQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3}>Loading...</TableCell>
                  </TableRow>
                ) : historyQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={3}>Failed to load submissions</TableCell>
                  </TableRow>
                ) : (
                  (historyQuery.data?.items ?? []).map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.student_name}</TableCell>
                      <TableCell>{sub.exam_title}</TableCell>
                      <TableCell>
                        <StatusBadge status={sub.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}