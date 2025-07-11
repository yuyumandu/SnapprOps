import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import PayrollTable from "@/components/payroll/payroll-table";
import StatsCards from "@/components/payroll/stats-cards";
import PayslipModal from "@/components/payroll/payslip-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Download, FileText, AlertCircle } from "lucide-react";
import type { PayrollWithEmployee } from "@shared/schema";

export default function PayrollPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollWithEmployee | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/payroll/summary", selectedMonth],
    queryFn: async () => {
      const response = await fetch(`/api/payroll/summary?payPeriod=${selectedMonth}`, {
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
    queryKey: ["/api/payroll", selectedMonth],
    queryFn: async () => {
      const response = await fetch(`/api/payroll?payPeriod=${selectedMonth}`, {
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

  const generatePayrollMutation = useMutation({
    mutationFn: async (payPeriod: string) => {
      await apiRequest("POST", "/api/payroll/generate", { payPeriod });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/summary"] });
      toast({
        title: "Success",
        description: "Payroll generated successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to generate payroll",
        variant: "destructive",
      });
    },
  });

  const handleGeneratePayroll = () => {
    if (window.confirm(`Generate payroll for ${new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}?`)) {
      generatePayrollMutation.mutate(selectedMonth);
    }
  };

  const handleExportCSV = () => {
    window.open(`/api/payroll/export?payPeriod=${selectedMonth}`, '_blank');
  };

  const handleViewPayslip = (payroll: PayrollWithEmployee) => {
    setSelectedPayroll(payroll);
    setPayslipModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header 
        title="Payroll Management" 
        subtitle={`Payroll processing for ${new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
        actions={
          <div className="flex items-center space-x-4">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            />
            <Button 
              onClick={handleGeneratePayroll}
              disabled={generatePayrollMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Generate Payroll
            </Button>
            <Button 
              onClick={handleExportCSV}
              variant="outline"
              className="bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        }
      />
      
      <div className="p-6">
        <StatsCards stats={stats} isLoading={statsLoading} />
        
        {payrollData?.length === 0 && !payrollLoading && (
          <Card className="bg-white shadow-sm border border-gray-200 mb-6">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Payroll Data for {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <p className="text-gray-600 mb-4">
                  Generate payroll for this month to see employee payment details.
                </p>
                <Button 
                  onClick={handleGeneratePayroll}
                  disabled={generatePayrollMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Generate Payroll Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <PayrollTable 
          data={payrollData || []} 
          isLoading={payrollLoading}
          payPeriod={selectedMonth}
          onViewPayslip={handleViewPayslip}
        />
      </div>
      
      <PayslipModal 
        isOpen={payslipModalOpen}
        onClose={() => setPayslipModalOpen(false)}
        payroll={selectedPayroll}
      />
    </div>
  );
}
