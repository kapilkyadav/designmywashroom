
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from '@/hooks/use-toast';

// Pre-define the schema outside component to prevent recreation on each render
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

// Memoized form components to reduce re-renders
const LoginForm = React.memo(({ 
  onSubmit, 
  isSubmitting 
}: { 
  onSubmit: (values: FormValues) => Promise<void>; 
  isSubmitting: boolean;
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="admin@example.com" {...field} autoComplete="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" {...field} autoComplete="current-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging In...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </Form>
  );
});

LoginForm.displayName = 'LoginForm';

// Loading indicator as a separate component
const LoadingIndicator = React.memo(() => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
));

LoadingIndicator.displayName = 'LoadingIndicator';

const AdminLogin = () => {
  const { isAuthenticated, isLoading, login } = useAdminAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || "/admin/dashboard";

  const handleSubmit = async (values: FormValues) => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      // Login is handled by the auth provider which will update isAuthenticated
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      });
      // Redirect will happen automatically when isAuthenticated changes
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already authenticated, redirect to the from path
  if (isAuthenticated) {
    console.log("User is authenticated, redirecting to:", from);
    return <Navigate to={from} replace />;
  }

  // Show loading state while checking authentication
  if (isLoading && !isSubmitting) {
    return <LoadingIndicator />;
  }

  // Show login form
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Helmet>
        <title>Admin Login | Washroom Designer</title>
      </Helmet>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          <p className="w-full">This area is restricted to administrators only.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default React.memo(AdminLogin);
