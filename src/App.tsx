
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/hooks/useTheme';
import { Toaster } from '@/components/ui/toaster';
import { AdminAuthProvider } from '@/hooks/useAdminAuth';

import Index from './pages/Index';
import Calculator from './pages/Calculator';
import NotFound from './pages/NotFound';

import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import AdminBrands from './pages/AdminBrands';
import AdminBrandAdd from './pages/AdminBrandAdd';
import AdminProducts from './pages/AdminProducts';
import AdminFixtures from './pages/AdminFixtures';
import AdminProjects from './pages/AdminProjects';
import AdminProjectEdit from './pages/AdminProjectEdit';
import AdminProjectDetail from './pages/AdminProjectDetail';
import AdminSettings from './pages/AdminSettings';
import AdminLogin from './pages/AdminLogin';
import AdminLeads from './pages/AdminLeads';

// New Real Projects routes
import AdminRealProjects from './pages/AdminRealProjects';
import AdminRealProjectDetail from './pages/AdminRealProjectDetail';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/calculator" element={<Calculator />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin" element={
              <AdminAuthProvider>
                <Admin />
              </AdminAuthProvider>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route path="brands/add" element={<AdminBrandAdd />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="fixtures" element={<AdminFixtures />} />
              
              <Route path="projects" element={<AdminProjects />} />
              <Route path="projects/:id/edit" element={<AdminProjectEdit />} />
              <Route path="projects/:id" element={<AdminProjectDetail />} />
              
              {/* Real Projects routes */}
              <Route path="real-projects" element={<AdminRealProjects />} />
              <Route path="real-projects/:id" element={<AdminRealProjectDetail />} />
              
              <Route path="settings" element={<AdminSettings />} />
              <Route path="leads" element={<AdminLeads />} />
            </Route>

            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Toaster />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
