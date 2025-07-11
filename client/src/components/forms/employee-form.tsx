import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmployeeSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import type { Employee } from "@shared/schema";
import { z } from "zod";

const employeeFormSchema = insertEmployeeSchema.extend({
  hireDate: z.string().min(1, "Hire date is required"),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  employee?: Employee | null;
  onSubmit: (data: EmployeeFormData) => void;
  isLoading?: boolean;
}

export default function EmployeeForm({ employee, onSubmit, isLoading }: EmployeeFormProps) {
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: employee?.name || "",
      email: employee?.email || "",
      position: employee?.position || "",
      salaryRate: employee?.salaryRate || "",
      salaryType: employee?.salaryType || "monthly",
      department: employee?.department || "",
      hireDate: employee?.hireDate || "",
      isActive: employee?.isActive ?? true,
    },
  });

  const handleSubmit = (data: EmployeeFormData) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter full name"
                className={form.formState.errors.name ? "border-red-500" : ""}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="Enter email address"
                className={form.formState.errors.email ? "border-red-500" : ""}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                {...form.register("position")}
                placeholder="Enter job position"
                className={form.formState.errors.position ? "border-red-500" : ""}
              />
              {form.formState.errors.position && (
                <p className="text-sm text-red-500">{form.formState.errors.position.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                {...form.register("department")}
                placeholder="Enter department"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryType">Salary Type *</Label>
              <Select
                value={form.watch("salaryType")}
                onValueChange={(value) => form.setValue("salaryType", value as "monthly" | "hourly")}
              >
                <SelectTrigger className={form.formState.errors.salaryType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select salary type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.salaryType && (
                <p className="text-sm text-red-500">{form.formState.errors.salaryType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryRate">
                Salary Rate * ({form.watch("salaryType") === "monthly" ? "Monthly" : "Per Hour"})
              </Label>
              <Input
                id="salaryRate"
                type="number"
                step="0.01"
                {...form.register("salaryRate")}
                placeholder={form.watch("salaryType") === "monthly" ? "e.g., 25000" : "e.g., 150"}
                className={form.formState.errors.salaryRate ? "border-red-500" : ""}
              />
              {form.formState.errors.salaryRate && (
                <p className="text-sm text-red-500">{form.formState.errors.salaryRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hireDate">Hire Date *</Label>
              <Input
                id="hireDate"
                type="date"
                {...form.register("hireDate")}
                className={form.formState.errors.hireDate ? "border-red-500" : ""}
              />
              {form.formState.errors.hireDate && (
                <p className="text-sm text-red-500">{form.formState.errors.hireDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select
                value={form.watch("isActive") ? "active" : "inactive"}
                onValueChange={(value) => form.setValue("isActive", value === "active")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? "Saving..." : employee ? "Update Employee" : "Create Employee"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
