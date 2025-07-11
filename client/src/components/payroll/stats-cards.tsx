import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, MinusCircle, HandCoins } from "lucide-react";
import type { PayrollSummary } from "@shared/schema";

interface StatsCardsProps {
  stats?: PayrollSummary;
  isLoading?: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <Card className="h-32 bg-gray-200 border-0"></Card>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Employees",
      value: stats?.totalEmployees || 0,
      icon: Users,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Total Gross Pay",
      value: `₱${(stats?.totalGrossPay || 0).toLocaleString()}`,
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Total Deductions",
      value: `₱${(stats?.totalDeductions || 0).toLocaleString()}`,
      icon: MinusCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      title: "Net Pay",
      value: `₱${(stats?.totalNetPay || 0).toLocaleString()}`,
      icon: HandCoins,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
