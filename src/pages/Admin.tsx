
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Helmet } from 'react-helmet';

const Admin = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  // If authentication is still loading, show a loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not authenticated, redirect to admin login with the current location as the return URL
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login with return URL:', location.pathname);
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Helmet>
        <title>Admin Dashboard | Washroom Designer</title>
      </Helmet>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Admin;
