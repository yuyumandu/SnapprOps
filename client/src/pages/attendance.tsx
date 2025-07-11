import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import AttendanceForm from "@/components/forms/attendance-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Edit, Trash2, Calendar } from "lucide-react";
import type { Attendance, Employee } from "@shared/schema";

export default function AttendancePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
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

  const { data: attendance, isLoading } = useQuery({
    queryKey: ["/api/attendance", selectedEmployee, selectedMonth],
    queryFn: async () => {
      if (selectedEmployee === "all") return [];
      
      const response = await fetch(
        `/api/attendance?employeeId=${selectedEmployee}&month=${selectedMonth}`,
        { credentials: "include" }
      );
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
    enabled: selectedEmployee !== "all",
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/attendance", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Success",
        description: "Attendance record created successfully",
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
        description: "Failed to create attendance record",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/attendance/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Success",
        description: "Attendance record updated successfully",
      });
      setDialogOpen(false);
      setEditingAttendance(null);
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
        description: "Failed to update attendance record",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/attendance/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Success",
        description: "Attendance record deleted successfully",
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
        description: "Failed to delete attendance record",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: any) => {
    if (editingAttendance) {
      updateMutation.mutate({ id: editingAttendance.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const totalHours = attendance?.reduce((sum: number, record: Attendance) => 
    sum + Number(record.hoursWorked), 0) || 0;

  return (
    <div className="flex-1 overflow-auto">
      <Header 
        title="Attendance Management" 
        subtitle="Track employee working hours and overtime"
      />
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-800">{totalHours.toFixed(1)}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Records</p>
                  <p className="text-2xl font-bold text-gray-800">{attendance?.length || 0}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Hours/Day</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {attendance?.length ? (totalHours / attendance.length).toFixed(1) : '0.0'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-800">Attendance Records</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-white"
                      onClick={() => setEditingAttendance(null)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingAttendance ? "Edit Attendance Record" : "Add Attendance Record"}
                      </DialogTitle>
                    </DialogHeader>
                    <AttendanceForm 
                      attendance={editingAttendance} 
                      employees={employees || []}
                      onSubmit={handleSubmit}
                      isLoading={createMutation.isPending || updateMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
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
            {selectedEmployee === "all" ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Select an employee to view attendance records</p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading attendance records...</p>
              </div>
            ) : attendance?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No attendance records found</p>
                <p className="text-sm text-gray-400">Add attendance records to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours Worked</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance?.map((record: Attendance) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{Number(record.hoursWorked).toFixed(1)}</TableCell>
                      <TableCell>{Number(record.overtime).toFixed(1)}</TableCell>
                      <TableCell className="font-medium">
                        {(Number(record.hoursWorked) + Number(record.overtime)).toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(record.id)}
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
