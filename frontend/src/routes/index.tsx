import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Skeleton } from '@/components/ui/skeleton'
import { ProtectedRoute, RoleGuard } from './ProtectedRoute'
import { ROUTES } from '@/constants/routes'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ExamsPage = lazy(() => import('@/features/exams/pages/ExamsPage').then((m) => ({ default: m.ExamsPage })))
const CreateExamPage = lazy(() => import('@/features/exams/pages/CreateExamPage').then((m) => ({ default: m.CreateExamPage })))
const ExamDetailPage = lazy(() => import('@/features/exams/pages/ExamDetailPage').then((m) => ({ default: m.ExamDetailPage })))
const EditExamPage = lazy(() => import('@/features/exams/pages/EditExamPage').then((m) => ({ default: m.EditExamPage })))
const UploadPage = lazy(() => import('@/features/submissions/pages/UploadPage').then((m) => ({ default: m.UploadPage })))
const SubmissionDetailPage = lazy(() => import('@/features/submissions/pages/SubmissionDetailPage').then((m) => ({ default: m.SubmissionDetailPage })))
const ReviewPage = lazy(() => import('@/features/review/pages/ReviewPage').then((m) => ({ default: m.ReviewPage })))
const ResultsPage = lazy(() => import('@/features/results/pages/ResultsPage').then((m) => ({ default: m.ResultsPage })))
const ExamResultPage = lazy(() => import('@/features/results/pages/ExamResultPage').then((m) => ({ default: m.ExamResultPage })))
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const NotFoundPage = lazy(() => import('@/routes/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const SubmissionsPage = lazy(() =>  import('@/features/submissions/pages/SubmissionPage').then((m) => ({ default: m.SubmissionsPage })))

function PageLoader() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
            <Route path={ROUTES.dashboard} element={<DashboardPage />} />
            <Route path={ROUTES.exams} element={<ExamsPage />} />
            <Route element={<RoleGuard permission="exams:create" />}>
              <Route path={ROUTES.examCreate} element={<CreateExamPage />} />
              <Route path="/exams/:id/edit" element={<EditExamPage />} />
            </Route>
            <Route path="/exams/:id" element={<ExamDetailPage />} />
            <Route path={ROUTES.upload} element={<UploadPage />} />
            <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
            <Route path={ROUTES.submissions} element={<SubmissionsPage />} />
            <Route path="/review/:submissionId" element={<ReviewPage />} />
            <Route element={<RoleGuard permission="results:view" />}>
              <Route path={ROUTES.results} element={<ResultsPage />} />
              <Route path="/results/:examId" element={<ExamResultPage />} />
            </Route>
            <Route path={ROUTES.settings} element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
