
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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

  const handleSubmit = async (values: FormValues) => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute the component state once using useMemo to avoid recalculation
  const renderContent = useMemo(() => {
    // If already authenticated, redirect to admin dashboard
    if (isAuthenticated) {
      return <Navigate to="/admin/dashboard" />;
    }

    // Show loading state while checking authentication
    if (isLoading && !isSubmitting) {
      return <LoadingIndicator />;
    }

    // Show login form
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
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
  }, [isAuthenticated, isLoading, isSubmitting, handleSubmit]);

  return renderContent;
};

export default React.memo(AdminLogin);
