
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { CalculatorProvider } from "@/hooks/useCalculator";
import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBrands from "./pages/AdminBrands";
import AdminBrandAdd from "./pages/AdminBrandAdd";
import AdminProducts from "./pages/AdminProducts";
import AdminFixtures from "./pages/AdminFixtures";
import AdminSettings from "./pages/AdminSettings";
import { useState } from "react";

const App = () => {
  // Move QueryClient creation inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AdminAuthProvider>
          <CalculatorProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/calculator" element={<Calculator />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<Admin />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="brands" element={<AdminBrands />} />
                    <Route path="brands/add" element={<AdminBrandAdd />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="fixtures" element={<AdminFixtures />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route index element={<AdminDashboard />} />
                  </Route>
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CalculatorProvider>
        </AdminAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
