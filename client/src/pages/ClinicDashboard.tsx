import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  Users, Calendar, Package, DollarSign, 
  TrendingUp, Clock, UserPlus, CalendarPlus,
  Heart, ShoppingCart, Crown, Sparkles
} from "lucide-react";
import { Link } from "wouter";

import { QueryError } from '@/components/ui/query-state';

export default function ClinicDashboard() {
  const { user } = useAuth();
  // 這裡需要從 context 或 URL 取得當前診所 ID
  const organizationId = 1; // TODO: 從 context 取得
  
  const { data: stats, isLoading, isError, refetch } = trpc.clinic.stats.useQuery({ organizationId });

  const statCards = [
    {
      title: "今日預約",
      value: stats?.todayAppointments || 0,
      description: "待處理預約",
      icon: Calendar,
      gradient: "from-[oklch(0.80_0.14_70)] to-[oklch(0.70_0.14_60)]",
      href: "/clinic/appointments",
    },
    {
      title: "客戶總數",
      value: stats?.customers || 0,
      description: "已註冊客戶",
      icon: Users,
      gradient: "from-[oklch(0.75_0.15_65)] to-[oklch(0.65_0.14_55)]",
      href: "/clinic/customers",
    },
    {
      title: "本月營收",
      value: stats?.monthlyRevenue || 0,
      description: "NT$",
      icon: DollarSign,
      gradient: "from-[oklch(0.85_0.12_75)] to-[oklch(0.75_0.15_65)]",
      href: "/clinic/reports",
    },
    {
      title: "待關懷",
      value: stats?.pendingAftercare || 0,
      description: "術後追蹤",
      icon: Heart,
      gradient: "from-[oklch(0.70_0.14_60)] to-[oklch(0.60_0.12_55)]",
      href: "/clinic/aftercare",
    },
  ];

  const quickActions = [
    { label: "新增客戶", icon: UserPlus, href: "/clinic/customers/new" },
    { label: "新增預約", icon: CalendarPlus, href: "/clinic/appointments/new" },
    { label: "商品管理", icon: Package, href: "/clinic/products" },
    { label: "訂單管理", icon: ShoppingCart, href: "/clinic/orders" },
  ];

  if (isError) {

    return (

      <div className="p-6">

        <QueryError message="載入資料時發生錯誤，請稍後再試" onRetry={refetch} />

      </div>

    );

  }


  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* 尊爵頁首 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gold-gradient">診所儀表板</h1>
              <Crown className="h-6 w-6 text-[oklch(0.80_0.14_70)]" />
            </div>
            <p className="text-muted-foreground mt-1">歡迎回來，{user?.name || "管理員"}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/clinic/appointments/new">
              <Button className="gap-2 btn-gold">
                <CalendarPlus className="h-4 w-4" />
                新增預約
              </Button>
            </Link>
          </div>
        </div>

        {/* 尊爵統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-[oklch(0.30_0.06_60/25%)] bg-card group">
                {/* 燙金光暈效果 */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-20 group-hover:opacity-30 transition-opacity">
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${stat.gradient} blur-2xl`} />
                </div>
                
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-[oklch(0.12_0.03_250)]" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-gold-gradient">
                    {isLoading ? "..." : (
                      stat.title === "本月營收" 
                        ? `NT$ ${stat.value.toLocaleString()}`
                        : stat.value.toLocaleString()
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* 快速操作 & 今日預約 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 快速操作卡片 */}
          <Card className="border-[oklch(0.30_0.06_60/25%)] bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[oklch(0.80_0.14_70)] to-[oklch(0.70_0.14_60)]">
                  <TrendingUp className="h-5 w-5 text-[oklch(0.12_0.03_250)]" />
                </div>
                <span className="text-gold-gradient">快速操作</span>
              </CardTitle>
              <CardDescription>常用功能入口</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <Button 
                    variant="outline" 
                    className="w-full h-20 flex-col gap-2 border-[oklch(0.30_0.06_60/30%)] hover:border-[oklch(0.80_0.14_70)] hover:bg-[oklch(0.18_0.04_250)] transition-all duration-200 group"
                  >
                    <action.icon className="h-6 w-6 text-[oklch(0.80_0.14_70)] group-hover:scale-110 transition-transform" />
                    <span className="text-foreground">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* 今日預約卡片 */}
          <Card className="border-[oklch(0.30_0.06_60/25%)] bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[oklch(0.75_0.15_65)] to-[oklch(0.65_0.14_55)]">
                  <Clock className="h-5 w-5 text-[oklch(0.12_0.03_250)]" />
                </div>
                <span className="text-gold-gradient">今日預約</span>
              </CardTitle>
              <CardDescription>即將到來的預約</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[oklch(0.80_0.14_70)] border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[oklch(0.18_0.04_250)] flex items-center justify-center border border-[oklch(0.30_0.06_60/30%)]">
                      <Calendar className="h-8 w-8 text-[oklch(0.80_0.14_70)]" />
                    </div>
                    <p className="text-muted-foreground">暫無今日預約</p>
                    <Link href="/clinic/appointments/new">
                      <Button variant="link" className="mt-2 text-[oklch(0.80_0.14_70)] hover:text-[oklch(0.85_0.12_75)]">
                        <Sparkles className="h-4 w-4 mr-1" />
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
