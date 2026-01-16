import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  Users, Calendar, Package, DollarSign, 
  TrendingUp, Clock, UserPlus, CalendarPlus,
  Heart, ShoppingCart
} from "lucide-react";
import { Link } from "wouter";

export default function ClinicDashboard() {
  const { user } = useAuth();
  // 這裡需要從 context 或 URL 取得當前診所 ID
  const organizationId = 1; // TODO: 從 context 取得
  
  const { data: stats, isLoading } = trpc.clinic.stats.useQuery({ organizationId });

  const statCards = [
    {
      title: "今日預約",
      value: stats?.todayAppointments || 0,
      description: "待處理預約",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/clinic/appointments",
    },
    {
      title: "客戶總數",
      value: stats?.customers || 0,
      description: "已註冊客戶",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/clinic/customers",
    },
    {
      title: "本月營收",
      value: stats?.monthlyRevenue || 0,
      description: "NT$",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/clinic/reports",
    },
    {
      title: "待關懷",
      value: stats?.pendingAftercare || 0,
      description: "術後追蹤",
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      href: "/clinic/aftercare",
    },
  ];

  const quickActions = [
    { label: "新增客戶", icon: UserPlus, href: "/clinic/customers/new" },
    { label: "新增預約", icon: CalendarPlus, href: "/clinic/appointments/new" },
    { label: "商品管理", icon: Package, href: "/clinic/products" },
    { label: "訂單管理", icon: ShoppingCart, href: "/clinic/orders" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">診所儀表板</h1>
            <p className="text-gray-500 mt-1">歡迎回來，{user?.name || "管理員"}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/clinic/appointments/new">
              <Button className="gap-2">
                <CalendarPlus className="h-4 w-4" />
                新增預約
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {isLoading ? "..." : (
                      stat.title === "本月營收" 
                        ? `NT$ ${stat.value.toLocaleString()}`
                        : stat.value.toLocaleString()
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                快速操作
              </CardTitle>
              <CardDescription>常用功能入口</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <action.icon className="h-6 w-6" />
                    <span>{action.label}</span>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                今日預約
              </CardTitle>
              <CardDescription>即將到來的預約</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>暫無今日預約</p>
                    <Link href="/clinic/appointments/new">
                      <Button variant="link" className="mt-2">
                        新增預約
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
