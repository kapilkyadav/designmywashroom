
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Calculator, 
  Settings, 
  Database,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  to?: string;
  isActive?: boolean;
  children?: React.ReactNode;
}

const SidebarItem = ({ icon, title, to, isActive, children }: SidebarItemProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = Boolean(children);

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger className={cn(
          "flex items-center gap-3 w-full p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer",
          isActive && "bg-accent text-accent-foreground"
        )}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {icon}
              <span>{title}</span>
            </div>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-9 pt-1">
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link
      to={to || "#"}
      className={cn(
        "flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground"
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
};

const AdminSidebar = () => {
  const location = useLocation();
  const path = location.pathname;
  
  return (
    <div className="w-64 border-r bg-card h-full flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold">Admin Portal</h2>
      </div>
      
      <div className="px-3 py-2 flex-1 overflow-auto">
        <nav className="space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            title="Dashboard" 
            to="/admin/dashboard"
            isActive={path === "/admin/dashboard"}
          />
          
          <SidebarItem 
            icon={<Package className="h-5 w-5" />} 
            title="Brands"
            isActive={path.startsWith("/admin/brands")}
          >
            <SidebarItem 
              icon={<div className="w-1 h-1 rounded-full bg-current" />} 
              title="All Brands" 
              to="/admin/brands"
              isActive={path === "/admin/brands"}
            />
            <SidebarItem 
              icon={<div className="w-1 h-1 rounded-full bg-current" />} 
              title="Add Brand" 
              to="/admin/brands/add"
              isActive={path === "/admin/brands/add"}
            />
          </SidebarItem>
          
          <SidebarItem 
            icon={<Database className="h-5 w-5" />} 
            title="Products"
            isActive={path.startsWith("/admin/products")}
          >
            <SidebarItem 
              icon={<div className="w-1 h-1 rounded-full bg-current" />} 
              title="All Products" 
              to="/admin/products"
              isActive={path === "/admin/products"}
            />
            <SidebarItem 
              icon={<div className="w-1 h-1 rounded-full bg-current" />} 
              title="Add Product" 
              to="/admin/products/add"
              isActive={path === "/admin/products/add"}
            />
            <SidebarItem 
              icon={<div className="w-1 h-1 rounded-full bg-current" />} 
              title="Import Products" 
              to="/admin/products/import"
              isActive={path === "/admin/products/import"}
            />
          </SidebarItem>
          
          <SidebarItem 
            icon={<Calculator className="h-5 w-5" />} 
            title="Projects" 
            to="/admin/projects"
            isActive={path.startsWith("/admin/projects")}
          />
          
          <SidebarItem 
            icon={<Users className="h-5 w-5" />} 
            title="Users" 
            to="/admin/users"
            isActive={path.startsWith("/admin/users")}
          />
          
          <SidebarItem 
            icon={<Settings className="h-5 w-5" />} 
            title="Settings" 
            to="/admin/settings"
            isActive={path.startsWith("/admin/settings")}
          />
        </nav>
      </div>
      
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          Admin Portal v1.0.0
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
