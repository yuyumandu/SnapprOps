import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Eye, Download } from "lucide-react";
import type { PayrollWithEmployee } from "@shared/schema";

interface PayrollTableProps {
  data: PayrollWithEmployee[];
  isLoading?: boolean;
  payPeriod: string;
  onViewPayslip?: (payroll: PayrollWithEmployee) => void;
}

export default function PayrollTable({ data, isLoading, payPeriod, onViewPayslip }: PayrollTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const filteredData = data.filter((payroll) => {
    const matchesSearch = payroll.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payroll.employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payroll.employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || payroll.employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(data.map(p => p.employee.department).filter(Boolean))];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-primary text-white',
      'bg-green-500 text-white',
      'bg-orange-500 text-white',
      'bg-purple-500 text-white',
      'bg-blue-500 text-white',
      'bg-red-500 text-white',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payroll data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            {new Date(payPeriod).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Payroll Summary
          </CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No payroll data found</p>
            <p className="text-sm text-gray-400">
              {data.length === 0 ? "Generate payroll to see employee data" : "Try adjusting your search filters"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>SSS</TableHead>
                  <TableHead>PhilHealth</TableHead>
                  <TableHead>Pag-IBIG</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((payroll) => (
                  <TableRow key={payroll.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={getAvatarColor(payroll.employee.name)}>
                            {getInitials(payroll.employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{payroll.employee.name}</div>
                          <div className="text-sm text-gray-500">{payroll.employee.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">{payroll.employee.position}</TableCell>
                    <TableCell className="text-sm text-gray-900">{Number(payroll.hoursWorked).toFixed(1)}</TableCell>
                    <TableCell className="text-sm font-medium text-gray-900">
                      ₱{Number(payroll.grossPay).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      ₱{Number(payroll.sssDeduction).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      ₱{Number(payroll.philHealthDeduction).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      ₱{Number(payroll.pagIbigDeduction).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-green-600">
                      ₱{Number(payroll.netPay).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewPayslip?.(payroll)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredData.length}</span> of{' '}
              <span className="font-medium">{data.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-white">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
