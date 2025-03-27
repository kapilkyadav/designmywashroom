
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase, User } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session) {
          // Fetch user details and verify they are an admin
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .eq('role', 'admin')
            .single();

          if (userError || !userData) {
            setIsAuthenticated(false);
            setUser(null);
          } else {
            setIsAuthenticated(true);
            setUser(userData as User);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state change listener
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            // Use setTimeout to prevent potential deadlocks with Supabase client
            setTimeout(async () => {
              // Fetch user details after sign in
              const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .eq('role', 'admin')
                .single();

              if (error || !data) {
                setIsAuthenticated(false);
                setUser(null);
              } else {
                setIsAuthenticated(true);
                setUser(data as User);
              }
            }, 0);
          } else if (event === 'SIGNED_OUT') {
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      );
      
      return subscription;
    };

    // Check session first, then set up listener
    checkSession();
    const subscription = setupAuthListener();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Memoize login function to prevent unnecessary re-renders
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Verify user is an admin
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .eq('role', 'admin')
          .single();

        if (userError || !userData) {
          throw new Error('Not authorized as admin');
        }

        setIsAuthenticated(true);
        setUser(userData as User);
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoize logout function to prevent unnecessary re-renders
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      setIsAuthenticated(false);
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isAuthenticated, 
    isLoading, 
    user, 
    login, 
    logout
  }), [isAuthenticated, isLoading, user, login, logout]);

  return (
    <AdminAuthContext.Provider value={contextValue}>
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
