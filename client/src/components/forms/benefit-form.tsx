import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBenefitSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Benefit, Employee } from "@shared/schema";
import { z } from "zod";

const benefitFormSchema = insertBenefitSchema.extend({
  employeeId: z.number().min(1, "Employee is required"),
  appliesTo: z.string().min(1, "Apply to period is required"),
});

type BenefitFormData = z.infer<typeof benefitFormSchema>;

interface BenefitFormProps {
  benefit?: Benefit | null;
  employees: Employee[];
  onSubmit: (data: BenefitFormData) => void;
  isLoading?: boolean;
}

const benefitTypes = [
  { value: "SSS", label: "SSS", description: "Social Security System" },
  { value: "PhilHealth", label: "PhilHealth", description: "Philippine Health Insurance" },
  { value: "Pag-IBIG", label: "Pag-IBIG", description: "Home Development Mutual Fund" },
  { value: "Allowance", label: "Allowance", description: "Monthly allowances" },
  { value: "Bonus", label: "Bonus", description: "Performance or special bonuses" },
  { value: "13th_month", label: "13th Month Pay", description: "Annual 13th month pay" },
  { value: "Deduction", label: "Deduction", description: "Other deductions" },
];

export default function BenefitForm({ benefit, employees, onSubmit, isLoading }: BenefitFormProps) {
  const form = useForm<BenefitFormData>({
    resolver: zodResolver(benefitFormSchema),
    defaultValues: {
      employeeId: benefit?.employeeId || 0,
      type: benefit?.type || "Allowance",
      amount: benefit?.amount || "",
      isTaxable: benefit?.isTaxable ?? false,
      appliesTo: benefit?.appliesTo || new Date().toISOString().slice(0, 7),
      description: benefit?.description || "",
    },
  });

  const handleSubmit = (data: BenefitFormData) => {
    onSubmit(data);
  };

  const selectedBenefitType = benefitTypes.find(bt => bt.value === form.watch("type"));

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
              <Label htmlFor="type">Benefit Type *</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(value) => form.setValue("type", value as any)}
              >
                <SelectTrigger className={form.formState.errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select benefit type" />
                </SelectTrigger>
                <SelectContent>
                  {benefitTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-gray-500">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...form.register("amount")}
                placeholder="e.g., 5000.00"
                className={form.formState.errors.amount ? "border-red-500" : ""}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="appliesTo">Applies To (Month) *</Label>
              <Input
                id="appliesTo"
                type="month"
                {...form.register("appliesTo")}
                className={form.formState.errors.appliesTo ? "border-red-500" : ""}
              />
              {form.formState.errors.appliesTo && (
                <p className="text-sm text-red-500">{form.formState.errors.appliesTo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isTaxable">Tax Status</Label>
              <Select
                value={form.watch("isTaxable") ? "taxable" : "non-taxable"}
                onValueChange={(value) => form.setValue("isTaxable", value === "taxable")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tax status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="non-taxable">Non-taxable</SelectItem>
                  <SelectItem value="taxable">Taxable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="flex items-center space-x-2">
                <Badge className={
                  form.watch("type") === "SSS" ? "bg-red-100 text-red-800" :
                  form.watch("type") === "PhilHealth" ? "bg-green-100 text-green-800" :
                  form.watch("type") === "Pag-IBIG" ? "bg-blue-100 text-blue-800" :
                  form.watch("type") === "Bonus" ? "bg-yellow-100 text-yellow-800" :
                  form.watch("type") === "Allowance" ? "bg-purple-100 text-purple-800" :
                  "bg-gray-100 text-gray-800"
                }>
                  {selectedBenefitType?.label}
                </Badge>
                <span className="text-sm text-gray-600">
                  ₱{Number(form.watch("amount") || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Optional description or notes about this benefit"
              rows={3}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Benefit Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{selectedBenefitType?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">₱{Number(form.watch("amount") || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax Status:</span>
                <span className="font-medium">{form.watch("isTaxable") ? "Taxable" : "Non-taxable"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Period:</span>
                <span className="font-medium">
                  {form.watch("appliesTo") ? new Date(form.watch("appliesTo")).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  }) : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? "Saving..." : benefit ? "Update Benefit" : "Create Benefit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
