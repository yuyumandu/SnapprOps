import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEmployeeSchema, insertAttendanceSchema, insertBenefitSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Employee routes
  app.get('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, validatedData);
      res.json(employee);
    } catch (error) {
      console.error("Error updating employee:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEmployee(id);
      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Attendance routes
  app.get('/api/attendance', isAuthenticated, async (req, res) => {
    try {
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      const month = req.query.month as string;
      
      if (!employeeId) {
        return res.status(400).json({ message: "Employee ID is required" });
      }
      
      const attendance = await storage.getAttendance(employeeId, month);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post('/api/attendance', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.createAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Error creating attendance:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create attendance" });
    }
  });

  app.post('/api/attendance/bulk', isAuthenticated, async (req, res) => {
    try {
      const attendanceRecords = z.array(insertAttendanceSchema).parse(req.body);
      const attendance = await storage.bulkCreateAttendance(attendanceRecords);
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Error creating bulk attendance:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bulk attendance" });
    }
  });

  app.put('/api/attendance/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAttendanceSchema.partial().parse(req.body);
      const attendance = await storage.updateAttendance(id, validatedData);
      res.json(attendance);
    } catch (error) {
      console.error("Error updating attendance:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  app.delete('/api/attendance/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAttendance(id);
      res.json({ message: "Attendance deleted successfully" });
    } catch (error) {
      console.error("Error deleting attendance:", error);
      res.status(500).json({ message: "Failed to delete attendance" });
    }
  });

  // Benefits routes
  app.get('/api/benefits', isAuthenticated, async (req, res) => {
    try {
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      const payPeriod = req.query.payPeriod as string;
      
      const benefits = await storage.getBenefits(employeeId, payPeriod);
      res.json(benefits);
    } catch (error) {
      console.error("Error fetching benefits:", error);
      res.status(500).json({ message: "Failed to fetch benefits" });
    }
  });

  app.post('/api/benefits', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBenefitSchema.parse(req.body);
      const benefit = await storage.createBenefit(validatedData);
      res.status(201).json(benefit);
    } catch (error) {
      console.error("Error creating benefit:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create benefit" });
    }
  });

  app.put('/api/benefits/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBenefitSchema.partial().parse(req.body);
      const benefit = await storage.updateBenefit(id, validatedData);
      res.json(benefit);
    } catch (error) {
      console.error("Error updating benefit:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update benefit" });
    }
  });

  app.delete('/api/benefits/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBenefit(id);
      res.json({ message: "Benefit deleted successfully" });
    } catch (error) {
      console.error("Error deleting benefit:", error);
      res.status(500).json({ message: "Failed to delete benefit" });
    }
  });

  // Payroll routes
  app.get('/api/payroll', isAuthenticated, async (req, res) => {
    try {
      const payPeriod = req.query.payPeriod as string;
      if (!payPeriod) {
        return res.status(400).json({ message: "Pay period is required" });
      }
      
      const payroll = await storage.getPayroll(payPeriod);
      res.json(payroll);
    } catch (error) {
      console.error("Error fetching payroll:", error);
      res.status(500).json({ message: "Failed to fetch payroll" });
    }
  });

  app.get('/api/payroll/summary', isAuthenticated, async (req, res) => {
    try {
      const payPeriod = req.query.payPeriod as string;
      if (!payPeriod) {
        return res.status(400).json({ message: "Pay period is required" });
      }
      
      const summary = await storage.getPayrollSummary(payPeriod);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching payroll summary:", error);
      res.status(500).json({ message: "Failed to fetch payroll summary" });
    }
  });

  app.post('/api/payroll/generate', isAuthenticated, async (req, res) => {
    try {
      const { payPeriod } = req.body;
      if (!payPeriod) {
        return res.status(400).json({ message: "Pay period is required" });
      }
      
      const payroll = await storage.generatePayrollForPeriod(payPeriod);
      res.status(201).json(payroll);
    } catch (error) {
      console.error("Error generating payroll:", error);
      res.status(500).json({ message: "Failed to generate payroll" });
    }
  });

  // CSV Export route
  app.get('/api/payroll/export', isAuthenticated, async (req, res) => {
    try {
      const payPeriod = req.query.payPeriod as string;
      if (!payPeriod) {
        return res.status(400).json({ message: "Pay period is required" });
      }
      
      const payroll = await storage.getPayroll(payPeriod);
      
      // Convert to CSV format
      const csvHeaders = [
        'Employee Name',
        'Position',
        'Hours Worked',
        'Gross Pay',
        'SSS Deduction',
        'PhilHealth Deduction',
        'Pag-IBIG Deduction',
        'Total Deductions',
        'Net Pay'
      ];
      
      const csvRows = payroll.map(p => [
        p.employee.name,
        p.employee.position,
        p.hoursWorked,
        p.grossPay,
        p.sssDeduction,
        p.philHealthDeduction,
        p.pagIbigDeduction,
        p.totalDeductions,
        p.netPay
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=payroll-${payPeriod}.csv`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting payroll:", error);
      res.status(500).json({ message: "Failed to export payroll" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const payPeriod = req.query.payPeriod as string || new Date().toISOString().slice(0, 7);
      const summary = await storage.getPayrollSummary(payPeriod);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
