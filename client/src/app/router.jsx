import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from '@shared/ui'
import { ROUTES, ROLES } from '@shared/config'
import { Spin } from 'antd'

const LoginPage = lazy(() => import('@pages/login').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@pages/register').then(m => ({ default: m.RegisterPage })))

const StudentMenuPage = lazy(() => import('@pages/student/menu').then(m => ({ default: m.StudentMenuPage })))
const StudentOrdersPage = lazy(() => import('@pages/student/orders').then(m => ({ default: m.StudentOrdersPage })))
const StudentPaymentsPage = lazy(() => import('@pages/student/payments').then(m => ({ default: m.StudentPaymentsPage })))
const StudentProfilePage = lazy(() => import('@pages/student/profile').then(m => ({ default: m.StudentProfilePage })))
const StudentReviewsPage = lazy(() => import('@pages/student/reviews').then(m => ({ default: m.StudentReviewsPage })))

const CookMealsPage = lazy(() => import('@pages/cook/meals').then(m => ({ default: m.CookMealsPage })))
const CookInventoryPage = lazy(() => import('@pages/cook/inventory').then(m => ({ default: m.CookInventoryPage })))
const CookRequestsPage = lazy(() => import('@pages/cook/requests').then(m => ({ default: m.CookRequestsPage })))
const CookRecipesPage = lazy(() => import('@pages/cook/recipes').then(m => ({ default: m.CookRecipesPage })))

const AdminDashboardPage = lazy(() => import('@pages/admin/dashboard').then(m => ({ default: m.AdminDashboardPage })))
const AdminRequestsPage = lazy(() => import('@pages/admin/requests').then(m => ({ default: m.AdminRequestsPage })))
const AdminReportsPage = lazy(() => import('@pages/admin/reports').then(m => ({ default: m.AdminReportsPage })))
const AdminMenuPage = lazy(() => import('@pages/admin/menu').then(m => ({ default: m.AdminMenuPage })))
const AdminTemplatesPage = lazy(() => import('@pages/admin/templates').then(m => ({ default: m.AdminTemplatesPage })))
const AdminTemplateGroupsPage = lazy(() => import('@pages/admin/template-groups').then(m => ({ default: m.AdminTemplateGroupsPage })))
const AdminWeekTemplatesPage = lazy(() => import('@pages/admin/week-templates').then(m => ({ default: m.AdminWeekTemplatesPage })))
const AdminUsersPage = lazy(() => import('@pages/admin/users').then(m => ({ default: m.AdminUsersPage })))

const NotFoundPage = lazy(() => import('@pages/not-found').then(m => ({ default: m.NotFoundPage })))

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#f5f5f5',
    }}>
      <Spin size="large" tip="Загрузка..." />
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path={ROUTES.STUDENT.MENU}
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <StudentMenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.STUDENT.ORDERS}
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <StudentOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.STUDENT.PAYMENTS}
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <StudentPaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.STUDENT.PROFILE}
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.STUDENT.REVIEWS}
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <StudentReviewsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.COOK.MEALS}
          element={
            <ProtectedRoute allowedRoles={[ROLES.COOK]}>
              <CookMealsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COOK.INVENTORY}
          element={
            <ProtectedRoute allowedRoles={[ROLES.COOK]}>
              <CookInventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COOK.REQUESTS}
          element={
            <ProtectedRoute allowedRoles={[ROLES.COOK]}>
              <CookRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COOK.RECIPES}
          element={
            <ProtectedRoute allowedRoles={[ROLES.COOK]}>
              <CookRecipesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN.DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN.REQUESTS}
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN.REPORTS}
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN.MENU}
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminMenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN.TEMPLATES}
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminTemplatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN.TEMPLATE_GROUPS}
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminTemplateGroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN.WEEK_TEMPLATES}
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminWeekTemplatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN.USERS}
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
