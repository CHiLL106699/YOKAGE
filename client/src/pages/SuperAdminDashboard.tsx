import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Building2, Users, Calendar, UserCheck, Plus, TrendingUp, Activity } from "lucide-react";
import { Link } from "wouter";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = trpc.superAdmin.stats.useQuery();

  const statCards = [
    {
      title: "診所總數",
      value: stats?.organizations || 0,
      description: "已註冊診所",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "使用者總數",
      value: stats?.users || 0,
      description: "系統使用者",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "客戶總數",
      value: stats?.customers || 0,
      description: "所有診所客戶",
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "預約總數",
      value: stats?.appointments || 0,
      description: "所有預約記錄",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">系統總覽</h1>
            <p className="text-gray-500 mt-1">歡迎回來，{user?.name || "管理員"}</p>
          </div>
          <Link href="/super-admin/organizations/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              新增診所
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
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
                  {isLoading ? "..." : stat.value.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                快速操作
              </CardTitle>
              <CardDescription>常用管理功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/super-admin/organizations">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Building2 className="h-4 w-4" />
                  管理所有診所
                </Button>
              </Link>
              <Link href="/super-admin/organizations/new">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="h-4 w-4" />
                  建立新診所
                </Button>
              </Link>
              <Link href="/super-admin/users">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="h-4 w-4" />
                  使用者管理
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                系統狀態
              </CardTitle>
              <CardDescription>平台運行狀況</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">資料庫連線</span>
                <span className="flex items-center gap-2 text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  正常
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API 服務</span>
                <span className="flex items-center gap-2 text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  正常
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">LINE 整合</span>
                <span className="flex items-center gap-2 text-yellow-600">
                  <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                  待設定
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
