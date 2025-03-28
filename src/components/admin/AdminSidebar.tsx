
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import {
  LayoutDashboard,
  Package,
  ShowerHead,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  BarChart,
  ClipboardList,
  UserRound,
  Phone,
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAdminAuth();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Leads',
      href: '/admin/leads',
      icon: <UserRound className="h-5 w-5" />,
    },
    {
      name: 'Project Estimates',
      href: '/admin/projects',
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      name: 'Brands',
      href: '/admin/brands',
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: 'Fixtures',
      href: '/admin/fixtures',
      icon: <ShowerHead className="h-5 w-5" />,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const sidebarContent = (
    <>
      <div className="px-3 py-4">
        <Link to="/" className="flex items-center px-3 py-2 mb-6">
          <span className="text-2xl font-semibold">Dream Space</span>
        </Link>

        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              onClick={closeMobileMenu}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="px-3 py-4 mt-auto">
        <Separator className="my-4" />
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="w-full justify-start px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 mr-3" />
            ) : (
              <Sun className="h-5 w-5 mr-3" />
            )}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Button>
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="h-10 w-10"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile sidebar */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden",
          isMobileMenuOpen ? "block" : "hidden"
        )}
        onClick={closeMobileMenu}
      >
        <div 
          className={cn(
            "fixed inset-y-0 left-0 w-64 bg-background border-r p-0 flex flex-col transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {sidebarContent}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col h-full w-64 border-r bg-background">
        {sidebarContent}
      </div>
    </>
  );
};

export default AdminSidebar;
