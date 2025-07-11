import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employees table
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  position: varchar("position", { length: 255 }).notNull(),
  salaryRate: decimal("salary_rate", { precision: 10, scale: 2 }).notNull(),
  salaryType: varchar("salary_type", { length: 20 }).notNull().default("monthly"), // "hourly" or "monthly"
  department: varchar("department", { length: 255 }),
  hireDate: date("hire_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attendance table
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  date: date("date").notNull(),
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }).notNull(),
  overtime: decimal("overtime", { precision: 5, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Benefits table
export const benefits = pgTable("benefits", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "SSS", "PhilHealth", "Pag-IBIG", "Bonus", "Allowance", "13th_month"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  isTaxable: boolean("is_taxable").default(false).notNull(),
  appliesTo: varchar("applies_to", { length: 7 }).notNull(), // "YYYY-MM" format
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payroll table
export const payroll = pgTable("payroll", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  payPeriod: varchar("pay_period", { length: 7 }).notNull(), // "YYYY-MM" format
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }).notNull(),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0").notNull(),
  basePay: decimal("base_pay", { precision: 10, scale: 2 }).notNull(),
  overtimePay: decimal("overtime_pay", { precision: 10, scale: 2 }).default("0").notNull(),
  allowances: decimal("allowances", { precision: 10, scale: 2 }).default("0").notNull(),
  bonuses: decimal("bonuses", { precision: 10, scale: 2 }).default("0").notNull(),
  grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).notNull(),
  sssDeduction: decimal("sss_deduction", { precision: 10, scale: 2 }).default("0").notNull(),
  philHealthDeduction: decimal("philhealth_deduction", { precision: 10, scale: 2 }).default("0").notNull(),
  pagIbigDeduction: decimal("pag_ibig_deduction", { precision: 10, scale: 2 }).default("0").notNull(),
  taxDeduction: decimal("tax_deduction", { precision: 10, scale: 2 }).default("0").notNull(),
  otherDeductions: decimal("other_deductions", { precision: 10, scale: 2 }).default("0").notNull(),
  totalDeductions: decimal("total_deductions", { precision: 10, scale: 2 }).notNull(),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HRIS tables
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  leaveType: varchar("leave_type", { length: 20 }).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, approved, denied
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewComments: text("review_comments"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const overtimeRequests = pgTable("overtime_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  date: date("date").notNull(),
  hours: decimal("hours", { precision: 5, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewComments: text("review_comments"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const attendanceCorrections = pgTable("attendance_corrections", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  date: date("date").notNull(),
  timeIn: varchar("time_in", { length: 8 }),
  timeOut: varchar("time_out", { length: 8 }),
  correctionType: varchar("correction_type", { length: 20 }).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewComments: text("review_comments"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pings = pgTable("pings", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  requirement: varchar("requirement", { length: 255 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 20 }).default("unread").notNull(), // unread, read, acknowledged
  pingedBy: varchar("pinged_by").references(() => users.id).notNull(),
  readAt: timestamp("read_at"),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const employeesRelations = relations(employees, ({ many }) => ({
  attendance: many(attendance),
  benefits: many(benefits),
  payroll: many(payroll),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  employee: one(employees, {
    fields: [attendance.employeeId],
    references: [employees.id],
  }),
}));

export const benefitsRelations = relations(benefits, ({ one }) => ({
  employee: one(employees, {
    fields: [benefits.employeeId],
    references: [employees.id],
  }),
}));

export const payrollRelations = relations(payroll, ({ one }) => ({
  employee: one(employees, {
    fields: [payroll.employeeId],
    references: [employees.id],
  }),
}));

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveRequests.employeeId],
    references: [employees.id],
  }),
  reviewer: one(users, {
    fields: [leaveRequests.reviewedBy],
    references: [users.id],
  }),
}));

export const overtimeRequestsRelations = relations(overtimeRequests, ({ one }) => ({
  employee: one(employees, {
    fields: [overtimeRequests.employeeId],
    references: [employees.id],
  }),
  reviewer: one(users, {
    fields: [overtimeRequests.reviewedBy],
    references: [users.id],
  }),
}));

export const attendanceCorrectionsRelations = relations(attendanceCorrections, ({ one }) => ({
  employee: one(employees, {
    fields: [attendanceCorrections.employeeId],
    references: [employees.id],
  }),
  reviewer: one(users, {
    fields: [attendanceCorrections.reviewedBy],
    references: [users.id],
  }),
}));

export const pingsRelations = relations(pings, ({ one }) => ({
  employee: one(employees, {
    fields: [pings.employeeId],
    references: [employees.id],
  }),
  sender: one(users, {
    fields: [pings.pingedBy],
    references: [users.id],
  }),
}));

// Schemas
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  salaryRate: z.string().min(1, "Salary rate is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid salary rate format"),
});

// HRIS Request Schemas
export const leaveRequestSchema = z.object({
  employeeId: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  leaveType: z.enum(["sick", "vacation", "personal", "maternity", "paternity", "emergency"]),
  reason: z.string().min(1, "Reason is required"),
});

export const overtimeRequestSchema = z.object({
  employeeId: z.number(),
  date: z.string(),
  hours: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid hours format"),
  reason: z.string().min(1, "Reason is required"),
});

export const attendanceCorrectionSchema = z.object({
  employeeId: z.number(),
  date: z.string(),
  timeIn: z.string().optional(),
  timeOut: z.string().optional(),
  correctionType: z.enum(["time_in", "time_out", "hours"]),
  reason: z.string().min(1, "Reason is required"),
});

export const pingSchema = z.object({
  employeeId: z.number(),
  requirement: z.string().min(1, "Requirement is required"),
  message: z.string().optional(),
  pingedBy: z.string(),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBenefitSchema = createInsertSchema(benefits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  generatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Benefit = typeof benefits.$inferSelect;
export type InsertBenefit = z.infer<typeof insertBenefitSchema>;
export type Payroll = typeof payroll.$inferSelect;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;

// Extended types for API responses
export type EmployeeWithStats = Employee & {
  totalHours?: number;
  grossPay?: number;
  netPay?: number;
  lastPayroll?: string;
};

export type PayrollSummary = {
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  payPeriod: string;
};

export type PayrollWithEmployee = Payroll & {
  employee: Employee;
};

// HRIS types
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof leaveRequestSchema>;
export type OvertimeRequest = typeof overtimeRequests.$inferSelect;
export type InsertOvertimeRequest = z.infer<typeof overtimeRequestSchema>;
export type AttendanceCorrection = typeof attendanceCorrections.$inferSelect;
export type InsertAttendanceCorrection = z.infer<typeof attendanceCorrectionSchema>;
export type Ping = typeof pings.$inferSelect;
export type InsertPing = z.infer<typeof pingSchema>;

export type LeaveRequestWithEmployee = LeaveRequest & {
  employee: Employee;
  reviewer?: User;
};

export type OvertimeRequestWithEmployee = OvertimeRequest & {
  employee: Employee;
  reviewer?: User;
};

export type AttendanceCorrectionWithEmployee = AttendanceCorrection & {
  employee: Employee;
  reviewer?: User;
};

export type PingWithEmployee = Ping & {
  employee: Employee;
  sender: User;
};
