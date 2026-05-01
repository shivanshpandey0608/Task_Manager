import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import useThemeStore from '@/store/themeStore';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Dashboard from '@/pages/Dashboard';
import ProjectList from '@/pages/projects/ProjectList';
import ProjectDetail from '@/pages/projects/ProjectDetail';
import MyTasks from '@/pages/MyTasks';
import Notifications from '@/pages/Notifications';
import Settings from '@/pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppInit() {
  const { token, fetchMe } = useAuthStore();
  const { theme, init } = useThemeStore();

  useEffect(() => {
    init(theme);
    if (token) fetchMe();
  }, []);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInit />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route
            path="/"
            element={<ProtectedRoute><Layout /></ProtectedRoute>}
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="my-tasks" element={<MyTasks />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            className: '!bg-card !text-foreground !border !border-border !shadow-lg !text-sm',
            duration: 3000,
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
