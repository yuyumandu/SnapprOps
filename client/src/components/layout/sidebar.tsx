import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Gift, 
  Calculator, 
  FileText,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Attendance", href: "/attendance", icon: Clock },
  { name: "Benefits", href: "/benefits", icon: Gift },
  { name: "Payroll", href: "/payroll", icon: Calculator },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary">SnapprOps</h1>
        <p className="text-sm text-gray-600 mt-1">Payroll Management</p>
      </div>
      
      <nav className="mt-6">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors",
                  isActive && "bg-primary/10 border-r-4 border-primary text-primary"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-gray-500")} />
                <span className="ml-3 font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Admin User</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
        <button
          onClick={() => window.location.href = '/api/logout'}
          className="mt-4 w-full text-left text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
