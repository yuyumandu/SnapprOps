/**
 * Philippine Payroll Calculation Utilities
 * 
 * This module provides utilities for calculating payroll components
 * according to Philippine labor laws and regulations.
 */

export interface PayrollCalculationInput {
  basePay: number;
  overtimeHours: number;
  overtimeRate: number;
  allowances: number;
  bonuses: number;
  salaryType: 'hourly' | 'monthly';
  hoursWorked: number;
}

export interface PayrollCalculationResult {
  grossPay: number;
  sssDeduction: number;
  philHealthDeduction: number;
  pagIbigDeduction: number;
  taxDeduction: number;
  totalDeductions: number;
  netPay: number;
}

/**
 * SSS Contribution Table (2024 rates)
 * Employee share: 4.5% of monthly salary credit
 */
export const SSS_CONTRIBUTION_RATE = 0.045;

/**
 * PhilHealth Contribution (2024 rates)
 * Employee share: 2.25% of monthly basic salary (max contribution based on premium)
 */
export const PHILHEALTH_CONTRIBUTION_RATE = 0.0225;

/**
 * Pag-IBIG Contribution (2024 rates)
 * Employee share: 1% (min ₱100, max ₱100 for salary ≤ ₱1,500)
 * Employee share: 2% (max ₱100) for salary > ₱1,500
 */
export const PAG_IBIG_MIN_CONTRIBUTION = 100;
export const PAG_IBIG_MAX_CONTRIBUTION = 100;

/**
 * Calculate SSS contribution based on salary
 * Using simplified calculation: 4.5% of gross pay
 */
export function calculateSSSContribution(grossPay: number): number {
  return grossPay * SSS_CONTRIBUTION_RATE;
}

/**
 * Calculate PhilHealth contribution based on salary
 * Using simplified calculation: 2.25% of gross pay
 * Note: In actual implementation, this would use the premium table
 */
export function calculatePhilHealthContribution(grossPay: number): number {
  // Simplified calculation - actual implementation would use premium tables
  const contribution = grossPay * PHILHEALTH_CONTRIBUTION_RATE * 2; // Total premium, employee pays half
  return Math.min(contribution, 1800); // Cap at maximum premium
}

/**
 * Calculate Pag-IBIG contribution based on salary
 * Employee pays 1% or 2% depending on salary level, max ₱100
 */
export function calculatePagIbigContribution(grossPay: number): number {
  let rate = 0.01; // 1% for salary ≤ ₱1,500
  
  if (grossPay > 1500) {
    rate = 0.02; // 2% for salary > ₱1,500
  }
  
  const contribution = grossPay * rate;
  return Math.min(contribution, PAG_IBIG_MAX_CONTRIBUTION);
}

/**
 * Calculate income tax based on Philippine tax table
 * This is a simplified version - actual implementation would use the full BIR tax table
 */
export function calculateIncomeTax(grossPay: number, exemptions: number = 0): number {
  // Simplified tax calculation
  // Actual implementation would use the full BIR tax table with brackets
  const taxableIncome = Math.max(0, grossPay - exemptions);
  
  // Very simplified progressive tax (actual rates are more complex)
  if (taxableIncome <= 20833) return 0; // Below minimum taxable income
  if (taxableIncome <= 33333) return (taxableIncome - 20833) * 0.15;
  if (taxableIncome <= 66667) return 1875 + (taxableIncome - 33333) * 0.20;
  if (taxableIncome <= 166667) return 8541.67 + (taxableIncome - 66667) * 0.25;
  if (taxableIncome <= 666667) return 33541.67 + (taxableIncome - 166667) * 0.30;
  
  return 183541.67 + (taxableIncome - 666667) * 0.35;
}

/**
 * Calculate overtime pay
 * Philippine labor law: 1.25x for first 8 hours, 1.5x for excess
 */
export function calculateOvertimePay(regularRate: number, overtimeHours: number): number {
  // Simplified: using 1.5x rate for all overtime hours
  return regularRate * overtimeHours * 1.5;
}

/**
 * Main payroll calculation function
 */
export function calculatePayroll(input: PayrollCalculationInput): PayrollCalculationResult {
  const {
    basePay,
    overtimeHours,
    overtimeRate,
    allowances,
    bonuses,
  } = input;

  // Calculate overtime pay
  const overtimePay = overtimeHours * overtimeRate;

  // Calculate gross pay
  const grossPay = basePay + overtimePay + allowances + bonuses;

  // Calculate deductions
  const sssDeduction = calculateSSSContribution(grossPay);
  const philHealthDeduction = calculatePhilHealthContribution(grossPay);
  const pagIbigDeduction = calculatePagIbigContribution(grossPay);
  const taxDeduction = calculateIncomeTax(grossPay, sssDeduction + philHealthDeduction + pagIbigDeduction);

  // Calculate total deductions
  const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction + taxDeduction;

  // Calculate net pay
  const netPay = grossPay - totalDeductions;

  return {
    grossPay,
    sssDeduction,
    philHealthDeduction,
    pagIbigDeduction,
    taxDeduction,
    totalDeductions,
    netPay,
  };
}

/**
 * Format currency for Philippine Peso
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Validate payroll calculation inputs
 */
export function validatePayrollInputs(input: PayrollCalculationInput): string[] {
  const errors: string[] = [];

  if (input.basePay < 0) {
    errors.push('Base pay cannot be negative');
  }

  if (input.overtimeHours < 0) {
    errors.push('Overtime hours cannot be negative');
  }

  if (input.overtimeRate < 0) {
    errors.push('Overtime rate cannot be negative');
  }

  if (input.allowances < 0) {
    errors.push('Allowances cannot be negative');
  }

  if (input.bonuses < 0) {
    errors.push('Bonuses cannot be negative');
  }

  if (input.hoursWorked < 0) {
    errors.push('Hours worked cannot be negative');
  }

  if (input.hoursWorked > 168) {
    errors.push('Hours worked cannot exceed 168 hours per month');
  }

  return errors;
}

/**
 * Get payroll calculation summary for display
 */
export function getPayrollSummary(result: PayrollCalculationResult): {
  label: string;
  value: string;
  type: 'earning' | 'deduction' | 'total';
}[] {
  return [
    {
      label: 'Gross Pay',
      value: formatCurrency(result.grossPay),
      type: 'earning',
    },
    {
      label: 'SSS Contribution',
      value: formatCurrency(result.sssDeduction),
      type: 'deduction',
    },
    {
      label: 'PhilHealth Contribution',
      value: formatCurrency(result.philHealthDeduction),
      type: 'deduction',
    },
    {
      label: 'Pag-IBIG Contribution',
      value: formatCurrency(result.pagIbigDeduction),
      type: 'deduction',
    },
    {
      label: 'Income Tax',
      value: formatCurrency(result.taxDeduction),
      type: 'deduction',
    },
    {
      label: 'Total Deductions',
      value: formatCurrency(result.totalDeductions),
      type: 'deduction',
    },
    {
      label: 'Net Pay',
      value: formatCurrency(result.netPay),
      type: 'total',
    },
  ];
}
