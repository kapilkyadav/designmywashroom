
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'manager';
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// Initial admin auth context
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Mock admin user for demonstration
const MOCK_ADMIN: AdminUser = {
  id: '1',
  username: 'admin',
  role: 'admin',
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('adminUser');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored admin user:', e);
          localStorage.removeItem('adminUser');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Mock login function (would be replaced with actual API call)
  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, validate credentials with the backend
    if (username === 'admin' && password === 'admin') {
      setUser(MOCK_ADMIN);
      localStorage.setItem('adminUser', JSON.stringify(MOCK_ADMIN));
    } else {
      throw new Error('Invalid credentials');
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminUser');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
