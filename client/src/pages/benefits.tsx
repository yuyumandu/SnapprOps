import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import BenefitForm from "@/components/forms/benefit-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Gift, DollarSign } from "lucide-react";
import type { Benefit, Employee } from "@shared/schema";

export default function BenefitsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: employees } = useQuery({
    queryKey: ["/api/employees"],
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
      }
    },
  });

  const { data: benefits, isLoading } = useQuery({
    queryKey: ["/api/benefits", selectedEmployee, selectedMonth],
    queryFn: async () => {
      let url = "/api/benefits?";
      if (selectedEmployee !== "all") {
        url += `employeeId=${selectedEmployee}&`;
      }
      if (selectedMonth) {
        url += `payPeriod=${selectedMonth}`;
      }
      
      const response = await fetch(url, { credentials: "include" });
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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/benefits", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/benefits"] });
      toast({
        title: "Success",
        description: "Benefit created successfully",
      });
      setDialogOpen(false);
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
        description: "Failed to create benefit",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/benefits/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/benefits"] });
      toast({
        title: "Success",
        description: "Benefit updated successfully",
      });
      setDialogOpen(false);
      setEditingBenefit(null);
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
        description: "Failed to update benefit",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/benefits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/benefits"] });
      toast({
        title: "Success",
        description: "Benefit deleted successfully",
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
        description: "Failed to delete benefit",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (benefit: Benefit) => {
    setEditingBenefit(benefit);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this benefit?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: any) => {
    if (editingBenefit) {
      updateMutation.mutate({ id: editingBenefit.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees?.find((e: Employee) => e.id === employeeId);
    return employee ? employee.name : "Unknown Employee";
  };

  const getBenefitTypeColor = (type: string) => {
    switch (type) {
      case "SSS":
        return "bg-red-100 text-red-800";
      case "PhilHealth":
        return "bg-green-100 text-green-800";
      case "Pag-IBIG":
        return "bg-blue-100 text-blue-800";
      case "Bonus":
        return "bg-yellow-100 text-yellow-800";
      case "Allowance":
        return "bg-purple-100 text-purple-800";
      case "13th_month":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalBenefits = benefits?.reduce((sum: number, benefit: Benefit) => 
    sum + Number(benefit.amount), 0) || 0;

  return (
    <div className="flex-1 overflow-auto">
      <Header 
        title="Benefits Management" 
        subtitle="Manage employee benefits, allowances, and deductions"
      />
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Benefits</p>
                  <p className="text-2xl font-bold text-gray-800">₱{totalBenefits.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Records</p>
                  <p className="text-2xl font-bold text-gray-800">{benefits?.length || 0}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. per Employee</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ₱{employees?.length ? (totalBenefits / employees.length).toFixed(0) : '0'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-800">Benefits & Deductions</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => setEditingBenefit(null)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Benefit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingBenefit ? "Edit Benefit" : "Add Benefit"}
                    </DialogTitle>
                  </DialogHeader>
                  <BenefitForm 
                    benefit={editingBenefit} 
                    employees={employees || []}
                    onSubmit={handleSubmit}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex items-center space-x-4 mt-4">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees?.map((emp: Employee) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
              />
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading benefits...</p>
              </div>
            ) : benefits?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No benefits found</p>
                <p className="text-sm text-gray-400">Add benefits to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Taxable</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {benefits?.map((benefit: Benefit) => (
                    <TableRow key={benefit.id}>
                      <TableCell className="font-medium">
                        {getEmployeeName(benefit.employeeId)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getBenefitTypeColor(benefit.type)}>
                          {benefit.type}
                        </Badge>
                      </TableCell>
                      <TableCell>₱{Number(benefit.amount).toLocaleString()}</TableCell>
                      <TableCell>{benefit.appliesTo}</TableCell>
                      <TableCell>
                        <Badge variant={benefit.isTaxable ? "destructive" : "secondary"}>
                          {benefit.isTaxable ? "Taxable" : "Non-taxable"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-48 truncate">
                        {benefit.description || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(benefit)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(benefit.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
