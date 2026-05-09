import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { Toaster } from '@/components/ui/toaster';

// Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { CompaniesPage, CompanyFormPage, CompanyDetailPage } from '@/pages/companies';
import { PlansPage, PlanFormPage } from '@/pages/subscriptions';
import { UsersPage } from '@/pages/users';
import { PaymentsPage, PaymentFormPage } from '@/pages/payments';
import { SystemLogsPage } from '@/pages/logs';
import { SettingsPage } from '@/pages/settings';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route element={<AdminLayout />}>
              {/* Dashboard */}
              <Route path="/" element={<DashboardPage />} />

              {/* Companies */}
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/companies/new" element={<CompanyFormPage />} />
              <Route path="/companies/:id" element={<CompanyDetailPage />} />
              <Route path="/companies/:id/edit" element={<CompanyFormPage />} />

              {/* Subscription Plans */}
              <Route path="/subscriptions" element={<PlansPage />} />
              <Route path="/subscriptions/new" element={<PlanFormPage />} />
              <Route path="/subscriptions/:id/edit" element={<PlanFormPage />} />

              {/* Users */}
              <Route path="/users" element={<UsersPage />} />

              {/* Payments */}
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/payments/new" element={<PaymentFormPage />} />

              {/* System Logs */}
              <Route path="/logs" element={<SystemLogsPage />} />

              {/* Settings */}
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
