import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import StatsCards from "@/components/payroll/stats-cards";
import PayrollTable from "@/components/payroll/payroll-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Upload, Gift, Activity } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?payPeriod=${currentMonth}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const error = new Error(`${response.status}: ${response.statusText}`);
        if (isUnauthorizedError(error)) {
          toast({
            title: "Unauthorized",
            description: "You are logged out. Logging in again...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/login";
          }, 500);
        }
        throw error;
      }
      return response.json();
    },
  });

  const { data: payrollData, isLoading: payrollLoading } = useQuery({
    queryKey: ["/api/payroll", currentMonth],
    queryFn: async () => {
      const response = await fetch(`/api/payroll?payPeriod=${currentMonth}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const error = new Error(`${response.status}: ${response.statusText}`);
        if (isUnauthorizedError(error)) {
          toast({
            title: "Unauthorized",
            description: "You are logged out. Logging in again...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/login";
          }, 500);
        }
        throw error;
      }
      return response.json();
    },
  });

  if (isLoading || statsLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <Header 
        title="Payroll Dashboard" 
        subtitle={`Overview of payroll activities for ${new Date(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
      />
      
      <div className="p-6">
        <StatsCards stats={stats} />
        
        <PayrollTable 
          data={payrollData || []} 
          isLoading={payrollLoading}
          payPeriod={currentMonth}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/employees">
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-auto p-3"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <UserPlus className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Add New Employee</p>
                      <p className="text-sm text-gray-600">Register a new employee in the system</p>
                    </div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/attendance">
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-auto p-3"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Upload className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Upload Attendance</p>
                      <p className="text-sm text-gray-600">Import attendance data from CSV file</p>
                    </div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/benefits">
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-auto p-3"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <Gift className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Manage Benefits</p>
                      <p className="text-sm text-gray-600">Configure SSS, PhilHealth, and Pag-IBIG</p>
                    </div>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {payrollData?.length > 0 ? (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-800">
                        Payroll generated for {new Date(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-500">Recently</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-800">
                        {payrollData.length} employee{payrollData.length > 1 ? 's' : ''} processed
                      </p>
                      <p className="text-xs text-gray-500">This month</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400">Start by generating payroll for this month</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
