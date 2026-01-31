import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/home/page';
import DashboardPage from './pages/dashboard/page';
import TermsPage from './pages/terms/page';
import ResetPasswordPage from './pages/reset-password/page';
import { ProtectedRoute } from './common/ProtectedRoute';
import { AuthRedirect } from './common/AuthRedirect';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthRedirect>
        <HomePage />
      </AuthRedirect>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPasswordPage />,
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;

export default router;
