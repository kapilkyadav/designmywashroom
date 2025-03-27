
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectService } from '@/services/ProjectService';
import { Project } from '@/lib/supabase';
import { Loader2, BarChart3, Users, Package, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalValue: 0,
    avgEstimate: 0,
    recentProjects: 0
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await ProjectService.getAllProjects();
        setProjects(data);
        
        // Calculate stats
        const totalProjects = data.length;
        const totalValue = data.reduce((sum, project) => sum + (project.final_estimate || 0), 0);
        const avgEstimate = totalProjects > 0 ? totalValue / totalProjects : 0;
        
        // Count projects in the last 7 days
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentProjects = data.filter(p => 
          new Date(p.created_at) >= oneWeekAgo
        ).length;
        
        setStats({
          totalProjects,
          totalValue,
          avgEstimate,
          recentProjects
        });
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Total client estimates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Estimate Value</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                <p className="text-xs text-muted-foreground">
                  Combined value of all estimates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Estimate</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.avgEstimate)}</div>
                <p className="text-xs text-muted-foreground">
                  Average value per project
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Projects</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentProjects}</div>
                <p className="text-xs text-muted-foreground">
                  New projects in the last 7 days
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Estimates</h2>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Client</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Location</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Project Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Dimensions</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estimate</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.length > 0 ? (
                      projects.slice(0, 5).map((project) => (
                        <tr key={project.id} className="border-t hover:bg-secondary/50">
                          <td className="px-4 py-3 text-sm">
                            <div>{project.client_name}</div>
                            <div className="text-xs text-muted-foreground">{project.client_email}</div>
                          </td>
                          <td className="px-4 py-3 text-sm">{project.client_location}</td>
                          <td className="px-4 py-3 text-sm capitalize">
                            {project.project_type.replace('-', ' ')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {project.length} × {project.width} ft
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {formatCurrency(project.final_estimate)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No projects found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
