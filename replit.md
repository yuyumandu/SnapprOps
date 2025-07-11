# SnapprOps - Comprehensive HRIS Platform - Replit Configuration

## Overview

SnapprOps is a comprehensive Human Resource Information System (HRIS) designed specifically for Philippine businesses. Originally starting as a payroll management system, it has evolved into a complete HRIS platform featuring employee management, attendance tracking, benefits administration, leave management, overtime requests, attendance corrections, employee notifications, and automated payroll calculations with full compliance to Philippine labor laws including SSS, PhilHealth, and Pag-IBIG contributions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Monorepo Structure
- **Frontend**: React + TypeScript with Vite build system
- **Backend**: Node.js + Express.js with TypeScript
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect
- **UI Framework**: Shadcn/UI components with Tailwind CSS

### Directory Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── shared/          # Shared TypeScript types and schemas
├── migrations/      # Database migration files
└── attached_assets/ # Project documentation and assets
```

## Key Components

### Authentication System
- **Replit Auth Integration**: Uses OpenID Connect for secure authentication
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple
- **User Management**: Complete user profile management with Replit claims
- **Role-Based Access**: Admin and employee access levels for different functionalities

### HRIS Features (Employee Self-Service)
- **Leave Management**: Submit and track leave requests (sick, vacation, personal, maternity, etc.)
- **Overtime Requests**: Request overtime work with justification and approval workflow
- **Attendance Corrections**: Submit corrections for time-in/out discrepancies
- **Personal Payroll Access**: View individual payroll history and breakdowns
- **Notifications**: Receive and respond to admin notifications about missing documents or requirements

### Admin Management Features
- **Request Approvals**: Review and approve/deny leave, overtime, and attendance correction requests
- **Employee Ping System**: Send notifications to employees about missing requirements or documents
- **Document Tracking**: Monitor which employees have missing paperwork or compliance requirements
- **Comprehensive Reporting**: Dashboard with HRIS metrics and employee statistics

### Database Schema
- **Users**: Authentication and profile data (Replit Auth integration)
- **Employees**: Staff information, salary rates, departments
- **Attendance**: Work hours, overtime tracking
- **Benefits**: Allowances, bonuses, government contributions
- **Payroll**: Computed salary data with breakdowns
- **Sessions**: Secure session storage
- **Leave Requests**: Employee leave applications with approval workflow
- **Overtime Requests**: Overtime work requests with approval system
- **Attendance Corrections**: Time-in/out correction requests
- **Pings**: Admin notifications to employees about missing requirements

### Frontend Architecture
- **React Router**: Client-side routing with wouter
- **State Management**: React Query for server state management
- **UI Components**: Shadcn/UI component library
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom design tokens

### Backend API Structure
- **RESTful Endpoints**: CRUD operations for all entities
- **Authentication Middleware**: Protected routes with session validation
- **Database Layer**: Type-safe queries with Drizzle ORM
- **Error Handling**: Centralized error management and logging

## Data Flow

### Authentication Flow
1. User accesses application
2. Replit Auth redirects to OpenID Connect provider
3. Successful authentication creates/updates user session
4. Protected routes verify session on each request

### Payroll Calculation Flow
1. Employee data and attendance records are collected
2. Benefits and deductions are calculated based on Philippine tax laws
3. Gross pay computed from base salary + overtime + allowances
4. Mandatory deductions applied (SSS, PhilHealth, Pag-IBIG)
5. Net pay calculated and stored in payroll table
6. Payslips generated with detailed breakdowns

### CRUD Operations
- All entities follow standard REST patterns
- Frontend uses React Query for optimistic updates
- Backend validates all inputs with Zod schemas
- Database operations use Drizzle ORM transactions

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL connection driver
- **drizzle-orm**: Type-safe database operations
- **express**: Web application framework
- **react**: Frontend user interface library
- **@tanstack/react-query**: Server state management

### Authentication
- **openid-client**: OpenID Connect implementation
- **passport**: Authentication middleware
- **express-session**: Session management

### UI/UX Libraries
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form management
- **zod**: Runtime type validation

### Philippine Payroll Compliance
- Custom calculation utilities for SSS, PhilHealth, Pag-IBIG
- Tax computation based on Philippine BIR regulations
- 13th month pay calculations
- Overtime rate computations

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend
- **TSX**: TypeScript execution for backend development
- **Database**: Neon PostgreSQL with connection pooling

### Production Build
- **Frontend**: Vite production build with asset optimization
- **Backend**: ESBuild compilation to ESM format
- **Database**: Drizzle migrations with schema validation

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Authorized domains for auth
- `ISSUER_URL`: OpenID Connect issuer endpoint

### Session Management
- PostgreSQL session store for scalability
- 7-day session expiration
- Secure cookie configuration with HttpOnly and Secure flags

### Database Management
- Drizzle Kit for schema migrations
- Connection pooling with @neondatabase/serverless
- WebSocket support for real-time connections

The application follows a modern full-stack architecture with emphasis on type safety, developer experience, and Philippine payroll compliance. All payroll calculations are designed to meet local regulatory requirements while providing a user-friendly interface for HR management.