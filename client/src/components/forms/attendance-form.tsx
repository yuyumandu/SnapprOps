import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAttendanceSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { Attendance, Employee } from "@shared/schema";
import { z } from "zod";

const attendanceFormSchema = insertAttendanceSchema.extend({
  date: z.string().min(1, "Date is required"),
  employeeId: z.number().min(1, "Employee is required"),
});

type AttendanceFormData = z.infer<typeof attendanceFormSchema>;

interface AttendanceFormProps {
  attendance?: Attendance | null;
  employees: Employee[];
  onSubmit: (data: AttendanceFormData) => void;
  isLoading?: boolean;
}

export default function AttendanceForm({ attendance, employees, onSubmit, isLoading }: AttendanceFormProps) {
  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      employeeId: attendance?.employeeId || 0,
      date: attendance?.date || new Date().toISOString().split('T')[0],
      hoursWorked: attendance?.hoursWorked || "",
      overtime: attendance?.overtime || "0",
    },
  });

  const handleSubmit = (data: AttendanceFormData) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee *</Label>
              <Select
                value={form.watch("employeeId")?.toString() || ""}
                onValueChange={(value) => form.setValue("employeeId", parseInt(value))}
              >
                <SelectTrigger className={form.formState.errors.employeeId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.employeeId && (
                <p className="text-sm text-red-500">{form.formState.errors.employeeId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date")}
                className={form.formState.errors.date ? "border-red-500" : ""}
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursWorked">Hours Worked *</Label>
              <Input
                id="hoursWorked"
                type="number"
                step="0.1"
                min="0"
                max="24"
                {...form.register("hoursWorked")}
                placeholder="e.g., 8.0"
                className={form.formState.errors.hoursWorked ? "border-red-500" : ""}
              />
              {form.formState.errors.hoursWorked && (
                <p className="text-sm text-red-500">{form.formState.errors.hoursWorked.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtime">Overtime Hours</Label>
              <Input
                id="overtime"
                type="number"
                step="0.1"
                min="0"
                max="12"
                {...form.register("overtime")}
                placeholder="e.g., 2.0"
                className={form.formState.errors.overtime ? "border-red-500" : ""}
              />
              {form.formState.errors.overtime && (
                <p className="text-sm text-red-500">{form.formState.errors.overtime.message}</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Regular Hours:</span>
                <span className="font-medium">{Number(form.watch("hoursWorked") || 0).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Overtime Hours:</span>
                <span className="font-medium">{Number(form.watch("overtime") || 0).toFixed(1)}</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="text-gray-900 font-medium">Total Hours:</span>
                <span className="font-bold">
                  {(Number(form.watch("hoursWorked") || 0) + Number(form.watch("overtime") || 0)).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? "Saving..." : attendance ? "Update Attendance" : "Create Attendance"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
