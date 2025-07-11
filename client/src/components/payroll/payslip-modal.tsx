import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Download, Printer } from "lucide-react";
import type { PayrollWithEmployee } from "@shared/schema";

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: PayrollWithEmployee | null;
}

export default function PayslipModal({ isOpen, onClose, payroll }: PayslipModalProps) {
  if (!payroll) return null;

  const formatCurrency = (amount: string | number) => {
    return `₱${Number(amount).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const payPeriodFormatted = new Date(payroll.payPeriod).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Payslip Details</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Printer
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="text-center border-b pb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">SnapprOps Payroll</h2>
            <p className="text-lg font-semibold text-gray-800">Payslip for {payPeriodFormatted}</p>
            <p className="text-sm text-gray-600">Generated on {formatDate(payroll.generatedAt || '')}</p>
          </div>

          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employee Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-base font-semibold text-gray-900">{payroll.employee.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Employee ID</p>
                  <p className="text-base text-gray-900">{payroll.employee.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Position</p>
                  <p className="text-base text-gray-900">{payroll.employee.position}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p className="text-base text-gray-900">{payroll.employee.department || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base text-gray-900">{payroll.employee.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Salary Type</p>
                  <Badge variant="secondary">{payroll.employee.salaryType}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Earnings Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-600">Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Pay</span>
                  <span className="font-medium">{formatCurrency(payroll.basePay)}</span>
                </div>
                {Number(payroll.overtimePay) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overtime Pay ({Number(payroll.overtimeHours).toFixed(1)} hrs)</span>
                    <span className="font-medium">{formatCurrency(payroll.overtimePay)}</span>
                  </div>
                )}
                {Number(payroll.allowances) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Allowances</span>
                    <span className="font-medium">{formatCurrency(payroll.allowances)}</span>
                  </div>
                )}
                {Number(payroll.bonuses) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bonuses</span>
                    <span className="font-medium">{formatCurrency(payroll.bonuses)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Gross Pay</span>
                  <span className="text-green-600">{formatCurrency(payroll.grossPay)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deductions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-600">Deductions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">SSS Contribution</span>
                  <span className="font-medium">{formatCurrency(payroll.sssDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PhilHealth Contribution</span>
                  <span className="font-medium">{formatCurrency(payroll.philHealthDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pag-IBIG Contribution</span>
                  <span className="font-medium">{formatCurrency(payroll.pagIbigDeduction)}</span>
                </div>
                {Number(payroll.taxDeduction) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Deduction</span>
                    <span className="font-medium">{formatCurrency(payroll.taxDeduction)}</span>
                  </div>
                )}
                {Number(payroll.otherDeductions) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Other Deductions</span>
                    <span className="font-medium">{formatCurrency(payroll.otherDeductions)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Deductions</span>
                  <span className="text-red-600">{formatCurrency(payroll.totalDeductions)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Net Pay Section */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Net Pay</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(payroll.netPay)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Hours Worked</p>
                  <p className="text-xl font-semibold text-gray-800">{Number(payroll.hoursWorked).toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center pt-6 border-t">
            <p className="text-sm text-gray-500">
              This payslip is computer-generated and does not require a signature.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              For questions about this payslip, please contact the HR department.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
