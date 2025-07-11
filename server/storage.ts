import {
  users,
  employees,
  attendance,
  benefits,
  payroll,
  leaveRequests,
  overtimeRequests,
  attendanceCorrections,
  pings,
  type User,
  type UpsertUser,
  type Employee,
  type InsertEmployee,
  type Attendance,
  type InsertAttendance,
  type Benefit,
  type InsertBenefit,
  type Payroll,
  type InsertPayroll,
  type EmployeeWithStats,
  type PayrollSummary,
  type PayrollWithEmployee,
  type LeaveRequest,
  type InsertLeaveRequest,
  type OvertimeRequest,
  type InsertOvertimeRequest,
  type AttendanceCorrection,
  type InsertAttendanceCorrection,
  type Ping,
  type InsertPing,
  type LeaveRequestWithEmployee,
  type OvertimeRequestWithEmployee,
  type AttendanceCorrectionWithEmployee,
  type PingWithEmployee,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sum, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Employee operations
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: number): Promise<void>;
  getEmployeesWithStats(payPeriod: string): Promise<EmployeeWithStats[]>;
  
  // Attendance operations
  getAttendance(employeeId: number, month?: string): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, attendance: Partial<InsertAttendance>): Promise<Attendance>;
  deleteAttendance(id: number): Promise<void>;
  getMonthlyAttendance(employeeId: number, payPeriod: string): Promise<{ totalHours: number; overtimeHours: number }>;
  
  // Benefits operations
  getBenefits(employeeId?: number, payPeriod?: string): Promise<Benefit[]>;
  createBenefit(benefit: InsertBenefit): Promise<Benefit>;
  updateBenefit(id: number, benefit: Partial<InsertBenefit>): Promise<Benefit>;
  deleteBenefit(id: number): Promise<void>;
  
  // Payroll operations
  getPayroll(payPeriod: string): Promise<PayrollWithEmployee[]>;
  getEmployeePayroll(employeeId: number, payPeriod: string): Promise<Payroll | undefined>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: number, payroll: Partial<InsertPayroll>): Promise<Payroll>;
  deletePayroll(id: number): Promise<void>;
  getPayrollSummary(payPeriod: string): Promise<PayrollSummary>;
  
  // Bulk operations
  bulkCreateAttendance(attendanceRecords: InsertAttendance[]): Promise<Attendance[]>;
  generatePayrollForPeriod(payPeriod: string): Promise<Payroll[]>;

  // HRIS operations
  // Leave requests
  getLeaveRequests(employeeId?: number, status?: string): Promise<LeaveRequestWithEmployee[]>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequestStatus(id: number, status: string, reviewedBy: string, comments?: string): Promise<LeaveRequest>;
  
  // Overtime requests
  getOvertimeRequests(employeeId?: number, status?: string): Promise<OvertimeRequestWithEmployee[]>;
  createOvertimeRequest(request: InsertOvertimeRequest): Promise<OvertimeRequest>;
  updateOvertimeRequestStatus(id: number, status: string, reviewedBy: string, comments?: string): Promise<OvertimeRequest>;
  
  // Attendance corrections
  getAttendanceCorrections(employeeId?: number, status?: string): Promise<AttendanceCorrectionWithEmployee[]>;
  createAttendanceCorrection(correction: InsertAttendanceCorrection): Promise<AttendanceCorrection>;
  updateAttendanceCorrectionStatus(id: number, status: string, reviewedBy: string, comments?: string): Promise<AttendanceCorrection>;
  
  // Pings/Notifications
  getPings(employeeId?: number, status?: string): Promise<PingWithEmployee[]>;
  createPing(ping: InsertPing): Promise<Ping>;
  updatePingStatus(id: number, status: string): Promise<Ping>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.isActive, true)).orderBy(employees.name);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee> {
    const [updatedEmployee] = await db
      .update(employees)
      .set({ ...employee, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<void> {
    await db.update(employees).set({ isActive: false, updatedAt: new Date() }).where(eq(employees.id, id));
  }

  async getEmployeesWithStats(payPeriod: string): Promise<EmployeeWithStats[]> {
    const employeeStats = await db
      .select({
        id: employees.id,
        name: employees.name,
        email: employees.email,
        position: employees.position,
        salaryRate: employees.salaryRate,
        salaryType: employees.salaryType,
        department: employees.department,
        hireDate: employees.hireDate,
        isActive: employees.isActive,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
        totalHours: sql<number>`COALESCE(SUM(${attendance.hoursWorked}), 0)`,
        grossPay: sql<number>`COALESCE(${payroll.grossPay}, 0)`,
        netPay: sql<number>`COALESCE(${payroll.netPay}, 0)`,
        lastPayroll: sql<string>`${payroll.payPeriod}`,
      })
      .from(employees)
      .leftJoin(attendance, and(
        eq(attendance.employeeId, employees.id),
        sql`date_trunc('month', ${attendance.date}) = ${payPeriod}::date`
      ))
      .leftJoin(payroll, and(
        eq(payroll.employeeId, employees.id),
        eq(payroll.payPeriod, payPeriod)
      ))
      .where(eq(employees.isActive, true))
      .groupBy(employees.id, payroll.grossPay, payroll.netPay, payroll.payPeriod)
      .orderBy(employees.name);

    return employeeStats;
  }

  // Attendance operations
  async getAttendance(employeeId: number, month?: string): Promise<Attendance[]> {
    if (month) {
      return await db
        .select()
        .from(attendance)
        .where(and(
          eq(attendance.employeeId, employeeId),
          sql`date_trunc('month', ${attendance.date}) = ${month}::date`
        ))
        .orderBy(desc(attendance.date));
    }
    
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.employeeId, employeeId))
      .orderBy(desc(attendance.date));
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const [newAttendance] = await db.insert(attendance).values(attendanceData).returning();
    return newAttendance;
  }

  async updateAttendance(id: number, attendanceData: Partial<InsertAttendance>): Promise<Attendance> {
    const [updatedAttendance] = await db
      .update(attendance)
      .set({ ...attendanceData, updatedAt: new Date() })
      .where(eq(attendance.id, id))
      .returning();
    return updatedAttendance;
  }

  async deleteAttendance(id: number): Promise<void> {
    await db.delete(attendance).where(eq(attendance.id, id));
  }

  async getMonthlyAttendance(employeeId: number, payPeriod: string): Promise<{ totalHours: number; overtimeHours: number }> {
    const [result] = await db
      .select({
        totalHours: sum(attendance.hoursWorked),
        overtimeHours: sum(attendance.overtime),
      })
      .from(attendance)
      .where(and(
        eq(attendance.employeeId, employeeId),
        sql`date_trunc('month', ${attendance.date}) = ${payPeriod}::date`
      ));

    return {
      totalHours: Number(result.totalHours || 0),
      overtimeHours: Number(result.overtimeHours || 0),
    };
  }

  // Benefits operations
  async getBenefits(employeeId?: number, payPeriod?: string): Promise<Benefit[]> {
    if (employeeId && payPeriod) {
      return await db
        .select()
        .from(benefits)
        .where(and(
          eq(benefits.employeeId, employeeId),
          eq(benefits.appliesTo, payPeriod)
        ))
        .orderBy(desc(benefits.createdAt));
    } else if (employeeId) {
      return await db
        .select()
        .from(benefits)
        .where(eq(benefits.employeeId, employeeId))
        .orderBy(desc(benefits.createdAt));
    } else if (payPeriod) {
      return await db
        .select()
        .from(benefits)
        .where(eq(benefits.appliesTo, payPeriod))
        .orderBy(desc(benefits.createdAt));
    }
    
    return await db
      .select()
      .from(benefits)
      .orderBy(desc(benefits.createdAt));
  }

  async createBenefit(benefit: InsertBenefit): Promise<Benefit> {
    const [newBenefit] = await db.insert(benefits).values(benefit).returning();
    return newBenefit;
  }

  async updateBenefit(id: number, benefit: Partial<InsertBenefit>): Promise<Benefit> {
    const [updatedBenefit] = await db
      .update(benefits)
      .set({ ...benefit, updatedAt: new Date() })
      .where(eq(benefits.id, id))
      .returning();
    return updatedBenefit;
  }

  async deleteBenefit(id: number): Promise<void> {
    await db.delete(benefits).where(eq(benefits.id, id));
  }

  // Payroll operations
  async getPayroll(payPeriod: string): Promise<PayrollWithEmployee[]> {
    const payrollData = await db
      .select({
        id: payroll.id,
        employeeId: payroll.employeeId,
        payPeriod: payroll.payPeriod,
        hoursWorked: payroll.hoursWorked,
        overtimeHours: payroll.overtimeHours,
        basePay: payroll.basePay,
        overtimePay: payroll.overtimePay,
        allowances: payroll.allowances,
        bonuses: payroll.bonuses,
        grossPay: payroll.grossPay,
        sssDeduction: payroll.sssDeduction,
        philHealthDeduction: payroll.philHealthDeduction,
        pagIbigDeduction: payroll.pagIbigDeduction,
        taxDeduction: payroll.taxDeduction,
        otherDeductions: payroll.otherDeductions,
        totalDeductions: payroll.totalDeductions,
        netPay: payroll.netPay,
        generatedAt: payroll.generatedAt,
        createdAt: payroll.createdAt,
        updatedAt: payroll.updatedAt,
        employee: employees,
      })
      .from(payroll)
      .innerJoin(employees, eq(payroll.employeeId, employees.id))
      .where(eq(payroll.payPeriod, payPeriod))
      .orderBy(employees.name);

    return payrollData;
  }

  async getEmployeePayroll(employeeId: number, payPeriod: string): Promise<Payroll | undefined> {
    const [payrollData] = await db
      .select()
      .from(payroll)
      .where(and(
        eq(payroll.employeeId, employeeId),
        eq(payroll.payPeriod, payPeriod)
      ));
    return payrollData;
  }

  async createPayroll(payrollData: InsertPayroll): Promise<Payroll> {
    const [newPayroll] = await db.insert(payroll).values(payrollData).returning();
    return newPayroll;
  }

  async updatePayroll(id: number, payrollData: Partial<InsertPayroll>): Promise<Payroll> {
    const [updatedPayroll] = await db
      .update(payroll)
      .set({ ...payrollData, updatedAt: new Date() })
      .where(eq(payroll.id, id))
      .returning();
    return updatedPayroll;
  }

  async deletePayroll(id: number): Promise<void> {
    await db.delete(payroll).where(eq(payroll.id, id));
  }

  async getPayrollSummary(payPeriod: string): Promise<PayrollSummary> {
    const [summary] = await db
      .select({
        totalEmployees: count(),
        totalGrossPay: sum(payroll.grossPay),
        totalDeductions: sum(payroll.totalDeductions),
        totalNetPay: sum(payroll.netPay),
      })
      .from(payroll)
      .where(eq(payroll.payPeriod, payPeriod));

    return {
      totalEmployees: Number(summary.totalEmployees || 0),
      totalGrossPay: Number(summary.totalGrossPay || 0),
      totalDeductions: Number(summary.totalDeductions || 0),
      totalNetPay: Number(summary.totalNetPay || 0),
      payPeriod,
    };
  }

  // Bulk operations
  async bulkCreateAttendance(attendanceRecords: InsertAttendance[]): Promise<Attendance[]> {
    return await db.insert(attendance).values(attendanceRecords).returning();
  }

  async generatePayrollForPeriod(payPeriod: string): Promise<Payroll[]> {
    const activeEmployees = await this.getEmployees();
    const payrollRecords: InsertPayroll[] = [];

    for (const employee of activeEmployees) {
      const monthlyAttendance = await this.getMonthlyAttendance(employee.id, payPeriod);
      const employeeBenefits = await this.getBenefits(employee.id, payPeriod);
      
      // Calculate base pay
      const salaryRate = Number(employee.salaryRate);
      const basePay = employee.salaryType === 'hourly' 
        ? salaryRate * monthlyAttendance.totalHours
        : salaryRate;
      
      // Calculate overtime pay (1.5x rate for overtime hours)
      const overtimePay = employee.salaryType === 'hourly'
        ? salaryRate * 1.5 * monthlyAttendance.overtimeHours
        : 0;
      
      // Calculate allowances and bonuses
      const allowances = employeeBenefits
        .filter(b => b.type === 'Allowance')
        .reduce((sum, b) => sum + Number(b.amount), 0);
      
      const bonuses = employeeBenefits
        .filter(b => ['Bonus', '13th_month'].includes(b.type))
        .reduce((sum, b) => sum + Number(b.amount), 0);
      
      const grossPay = basePay + overtimePay + allowances + bonuses;
      
      // Calculate deductions (Philippine standards)
      const sssDeduction = grossPay * 0.045; // 4.5% SSS
      const philHealthDeduction = grossPay * 0.045; // 4.5% PhilHealth
      const pagIbigDeduction = Math.min(grossPay * 0.02, 100); // 2% max ₱100 Pag-IBIG
      
      const otherDeductions = employeeBenefits
        .filter(b => b.type === 'Deduction')
        .reduce((sum, b) => sum + Number(b.amount), 0);
      
      const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction + otherDeductions;
      const netPay = grossPay - totalDeductions;
      
      payrollRecords.push({
        employeeId: employee.id,
        payPeriod,
        hoursWorked: monthlyAttendance.totalHours.toString(),
        overtimeHours: monthlyAttendance.overtimeHours.toString(),
        basePay: basePay.toString(),
        overtimePay: overtimePay.toString(),
        allowances: allowances.toString(),
        bonuses: bonuses.toString(),
        grossPay: grossPay.toString(),
        sssDeduction: sssDeduction.toString(),
        philHealthDeduction: philHealthDeduction.toString(),
        pagIbigDeduction: pagIbigDeduction.toString(),
        taxDeduction: "0",
        otherDeductions: otherDeductions.toString(),
        totalDeductions: totalDeductions.toString(),
        netPay: netPay.toString(),
      });
    }

    return await db.insert(payroll).values(payrollRecords).returning();
  }

  // HRIS Operations Implementation
  async getLeaveRequests(employeeId?: number, status?: string): Promise<LeaveRequestWithEmployee[]> {
    const conditions = [];
    if (employeeId) {
      conditions.push(eq(leaveRequests.employeeId, employeeId));
    }
    if (status) {
      conditions.push(eq(leaveRequests.status, status));
    }

    const query = db
      .select({
        id: leaveRequests.id,
        employeeId: leaveRequests.employeeId,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        leaveType: leaveRequests.leaveType,
        reason: leaveRequests.reason,
        status: leaveRequests.status,
        reviewedBy: leaveRequests.reviewedBy,
        reviewedAt: leaveRequests.reviewedAt,
        reviewComments: leaveRequests.reviewComments,
        createdAt: leaveRequests.createdAt,
        updatedAt: leaveRequests.updatedAt,
        employee: {
          id: employees.id,
          name: employees.name,
          email: employees.email,
          position: employees.position,
          salaryRate: employees.salaryRate,
          salaryType: employees.salaryType,
          department: employees.department,
          hireDate: employees.hireDate,
          isActive: employees.isActive,
          createdAt: employees.createdAt,
          updatedAt: employees.updatedAt,
        },
      })
      .from(leaveRequests)
      .innerJoin(employees, eq(leaveRequests.employeeId, employees.id));

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(leaveRequests.createdAt));
    }
    return await query.orderBy(desc(leaveRequests.createdAt));
  }

  async createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest> {
    const [newRequest] = await db.insert(leaveRequests).values(request).returning();
    return newRequest;
  }

  async updateLeaveRequestStatus(id: number, status: string, reviewedBy: string, comments?: string): Promise<LeaveRequest> {
    const [updatedRequest] = await db
      .update(leaveRequests)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
        reviewComments: comments,
        updatedAt: new Date(),
      })
      .where(eq(leaveRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async getOvertimeRequests(employeeId?: number, status?: string): Promise<OvertimeRequestWithEmployee[]> {
    const conditions = [];
    if (employeeId) conditions.push(eq(overtimeRequests.employeeId, employeeId));
    if (status) conditions.push(eq(overtimeRequests.status, status));

    const query = db
      .select()
      .from(overtimeRequests)
      .innerJoin(employees, eq(overtimeRequests.employeeId, employees.id));

    const results = conditions.length > 0 
      ? await query.where(and(...conditions)).orderBy(desc(overtimeRequests.createdAt))
      : await query.orderBy(desc(overtimeRequests.createdAt));

    return results.map(row => ({
      ...row.overtime_requests,
      employee: row.employees,
    }));
  }

  async createOvertimeRequest(request: InsertOvertimeRequest): Promise<OvertimeRequest> {
    const [newRequest] = await db.insert(overtimeRequests).values(request).returning();
    return newRequest;
  }

  async updateOvertimeRequestStatus(id: number, status: string, reviewedBy: string, comments?: string): Promise<OvertimeRequest> {
    const [updatedRequest] = await db
      .update(overtimeRequests)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
        reviewComments: comments,
        updatedAt: new Date(),
      })
      .where(eq(overtimeRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async getAttendanceCorrections(employeeId?: number, status?: string): Promise<AttendanceCorrectionWithEmployee[]> {
    const conditions = [];
    if (employeeId) conditions.push(eq(attendanceCorrections.employeeId, employeeId));
    if (status) conditions.push(eq(attendanceCorrections.status, status));

    const query = db
      .select()
      .from(attendanceCorrections)
      .innerJoin(employees, eq(attendanceCorrections.employeeId, employees.id));

    const results = conditions.length > 0 
      ? await query.where(and(...conditions)).orderBy(desc(attendanceCorrections.createdAt))
      : await query.orderBy(desc(attendanceCorrections.createdAt));

    return results.map(row => ({
      ...row.attendance_corrections,
      employee: row.employees,
    }));
  }

  async createAttendanceCorrection(correction: InsertAttendanceCorrection): Promise<AttendanceCorrection> {
    const [newCorrection] = await db.insert(attendanceCorrections).values(correction).returning();
    return newCorrection;
  }

  async updateAttendanceCorrectionStatus(id: number, status: string, reviewedBy: string, comments?: string): Promise<AttendanceCorrection> {
    const [updatedCorrection] = await db
      .update(attendanceCorrections)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
        reviewComments: comments,
        updatedAt: new Date(),
      })
      .where(eq(attendanceCorrections.id, id))
      .returning();
    return updatedCorrection;
  }

  async getPings(employeeId?: number, status?: string): Promise<PingWithEmployee[]> {
    const conditions = [];
    if (employeeId) conditions.push(eq(pings.employeeId, employeeId));
    if (status) conditions.push(eq(pings.status, status));

    const query = db
      .select()
      .from(pings)
      .innerJoin(employees, eq(pings.employeeId, employees.id))
      .innerJoin(users, eq(pings.pingedBy, users.id));

    const results = conditions.length > 0 
      ? await query.where(and(...conditions)).orderBy(desc(pings.createdAt))
      : await query.orderBy(desc(pings.createdAt));

    return results.map(row => ({
      ...row.pings,
      employee: row.employees,
      sender: row.users,
    }));
  }

  async createPing(ping: InsertPing): Promise<Ping> {
    const [newPing] = await db.insert(pings).values(ping).returning();
    return newPing;
  }

  async updatePingStatus(id: number, status: string): Promise<Ping> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "read") {
      updateData.readAt = new Date();
    } else if (status === "acknowledged") {
      updateData.acknowledgedAt = new Date();
    }

    const [updatedPing] = await db
      .update(pings)
      .set(updateData)
      .where(eq(pings.id, id))
      .returning();
    return updatedPing;
  }
}

export const storage = new DatabaseStorage();
