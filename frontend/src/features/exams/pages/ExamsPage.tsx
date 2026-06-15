import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { queryKeys } from '@/constants/queryKeys'
import { ROUTES } from '@/constants/routes'
import { examService } from '@/services/examService'
import { formatDate, formatPercent } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import { usePermissions } from '@/hooks/usePermissions'

export function ExamsPage() {
  const { can } = usePermissions()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [selected, setSelected] = useState<string[]>([])
  const [deleteOpen, setDeleteOpen] = useState(false)
  const debouncedSearch = useDebounce(search)

  const examsQuery = useQuery({
    queryKey: queryKeys.exams.all({ search: debouncedSearch, status: status === 'all' ? undefined : status }),
    queryFn: () => examService.list({ search: debouncedSearch, status: status === 'all' ? undefined : status }),
  })

  const deleteMutation = useMutation({
    mutationFn: examService.bulkDelete,
    onSuccess: () => {
      toast.success('Exams deleted')
      setSelected([])
      queryClient.invalidateQueries({ queryKey: ['exams'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  if (examsQuery.isError) {
    return <ErrorState message={examsQuery.error.message} onRetry={() => examsQuery.refetch()} />
  }

  const items = examsQuery.data?.items ?? []

  return (
    <div>
      <PageHeader
        title="Exams"
        description="Manage exams, rubrics, and grading workflows."
        actions={
          can('exams:create') ? (
            <Button asChild>
              <Link to={ROUTES.examCreate}>
                <Plus className="h-4 w-4" />
                Create Exam
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search exams..." className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {examsQuery.isLoading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : items.length ? (
        <div className="rounded-xl border border-border bg-card">
          {selected.length && can('exams:delete') ? (
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Delete selected ({selected.length})
              </Button>
            </div>
          ) : null}
          <Table>
            <TableHeader>
              <TableRow>
                {can('exams:delete') ? <TableHead className="w-10" /> : null}
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Average</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((exam) => (
                <TableRow key={exam.id}>
                  {can('exams:delete') ? (
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(exam.id)}
                        onCheckedChange={(checked) =>
                          setSelected((current) =>
                            checked ? [...current, exam.id] : current.filter((id) => id !== exam.id),
                          )
                        }
                      />
                    </TableCell>
                  ) : null}
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>{exam.course}</TableCell>
                  <TableCell>{exam.submission_count}</TableCell>
                  <TableCell>{exam.average_score != null ? formatPercent(exam.average_score) : '—'}</TableCell>
                  <TableCell>
                    <StatusBadge status={exam.status} />
                  </TableCell>
                  <TableCell>{formatDate(exam.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={ROUTES.examDetail(exam.id)}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={Plus}
          title="No exams yet"
          description="Create your first exam with a structured rubric to start grading."
          actionLabel="Create Exam"
          onAction={() => (window.location.href = ROUTES.examCreate)}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete selected exams?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(selected)
          setDeleteOpen(false)
        }}
      />
    </div>
  )
}
