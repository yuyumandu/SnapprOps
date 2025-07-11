import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Users, Clock, Gift, TrendingUp, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            <span className="text-primary">SnapprOps</span> Payroll
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Comprehensive payroll management system designed for Philippine businesses. 
            Automate calculations, manage benefits, and ensure compliance with local regulations.
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-gray-900">Employee Management</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Manage employee profiles, salary rates, and departmental organization with ease.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-gray-900">Attendance Tracking</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Track working hours, overtime, and manage attendance data efficiently.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-gray-900">Benefits Management</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Handle SSS, PhilHealth, Pag-IBIG, allowances, and bonuses automatically.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-gray-900">Payroll Computation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Automated payroll calculation with proper Philippine tax and benefit deductions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-gray-900">Reports & Analytics</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Generate detailed payroll reports and export data in CSV format.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-gray-900">Philippine Compliance</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Fully compliant with Philippine labor laws and tax regulations.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to streamline your payroll process?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join businesses across the Philippines who trust SnapprOps Payroll for their payroll management needs.
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Managing Payroll
          </Button>
        </div>
      </div>
    </div>
  );
}
