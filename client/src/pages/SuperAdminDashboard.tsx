import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Building2, Users, Calendar, UserCheck, Plus, TrendingUp, Activity } from "lucide-react";
import { Link } from "wouter";

import { QueryError } from '@/components/ui/query-state';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading, isError, refetch } = trpc.superAdmin.stats.useQuery();

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">系統總覽</h1>
            <p className="text-gray-500 mt-1">歡迎回來，{user?.name || "管理員"}</p>
          </div>
          <Link href="/admin/organizations/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              新增診所
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
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

        {/* Feature Modules Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">功能模組快速導航</h2>
          
          {/* Super Admin 功能 */}
          <Card>
            <CardHeader>
              <CardTitle>👑 Super Admin 功能</CardTitle>
              <CardDescription>超級管理員功能模組</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/admin"><Button variant="outline" className="w-full justify-start hover:bg-primary hover:text-primary-foreground transition-colors">儀表板</Button></Link>
              <Link href="/admin/users"><Button variant="outline" className="w-full justify-start hover:bg-primary hover:text-primary-foreground transition-colors">使用者管理</Button></Link>
              <Link href="/admin/organizations"><Button variant="outline" className="w-full justify-start hover:bg-primary hover:text-primary-foreground transition-colors">診所管理</Button></Link>
              <Link href="/admin/vouchers"><Button variant="outline" className="w-full justify-start">票券管理</Button></Link>
              <Link href="/admin/billing"><Button variant="outline" className="w-full justify-start">帳單管理</Button></Link>
              <Link href="/admin/monitor"><Button variant="outline" className="w-full justify-start">系統監控</Button></Link>
              <Link href="/admin/api-docs"><Button variant="outline" className="w-full justify-start">API 文檔</Button></Link>
              <Link href="/admin/white-label"><Button variant="outline" className="w-full justify-start">白標方案</Button></Link>
              <Link href="/admin/settings"><Button variant="outline" className="w-full justify-start">系統設定</Button></Link>
              <Link href="/admin/notifications"><Button variant="outline" className="w-full justify-start">通知管理</Button></Link>
            </CardContent>
          </Card>

          {/* 診所管理 */}
          <Card>
            <CardHeader>
              <CardTitle>🏪 診所管理</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/clinic"><Button variant="outline" className="w-full justify-start">診所儀表板</Button></Link>
              <Link href="/clinic/multi-branch"><Button variant="outline" className="w-full justify-start">多分店管理</Button></Link>
            </CardContent>
          </Card>

          {/* 客戶管理 */}
          <Card>
            <CardHeader>
              <CardTitle>👥 客戶管理</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/clinic/customers"><Button variant="outline" className="w-full justify-start">客戶列表</Button></Link>
              <Link href="/clinic/customer-360"><Button variant="outline" className="w-full justify-start">客戶 360</Button></Link>
              <Link href="/clinic/customer-packages"><Button variant="outline" className="w-full justify-start">療程包</Button></Link>
              <Link href="/clinic/customer-marketing"><Button variant="outline" className="w-full justify-start">客戶行銷</Button></Link>
              <Link href="/clinic/customer-source-roi"><Button variant="outline" className="w-full justify-start">ROI 分析</Button></Link>
              <Link href="/clinic/rfm-analysis"><Button variant="outline" className="w-full justify-start">RFM 分析</Button></Link>
            </CardContent>
          </Card>

          {/* 預約管理 */}
          <Card>
            <CardHeader>
              <CardTitle>📅 預約管理</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/clinic/appointments"><Button variant="outline" className="w-full justify-start">預約管理</Button></Link>
              <Link href="/clinic/schedule"><Button variant="outline" className="w-full justify-start">排程管理</Button></Link>
              <Link href="/clinic/smart-scheduling"><Button variant="outline" className="w-full justify-start">智能排班</Button></Link>
            </CardContent>
          </Card>

          {/* 員工管理 */}
          <Card>
            <CardHeader>
              <CardTitle>👨‍💼 員工管理</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/clinic/staff"><Button variant="outline" className="w-full justify-start">員工管理</Button></Link>
              <Link href="/clinic/hr-management"><Button variant="outline" className="w-full justify-start">人資管理</Button></Link>
              <Link href="/clinic/attendance"><Button variant="outline" className="w-full justify-start">出勤管理</Button></Link>
              <Link href="/clinic/attendance"><Button variant="outline" className="w-full justify-start">打卡頁面</Button></Link>
              <Link href="/clinic/attendance-tracking"><Button variant="outline" className="w-full justify-start">出勤追蹤</Button></Link>
              <Link href="/clinic/attendance-settings"><Button variant="outline" className="w-full justify-start">出勤設定</Button></Link>
              <Link href="/clinic/contract-management"><Button variant="outline" className="w-full justify-start">合約管理</Button></Link>
              <Link href="/clinic/commission-management"><Button variant="outline" className="w-full justify-start">業績分配</Button></Link>
            </CardContent>
          </Card>

          {/* LINE 整合 */}
          <Card>
            <CardHeader>
              <CardTitle>📱 LINE 整合</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/clinic/line-integration"><Button variant="outline" className="w-full justify-start">LINE 整合</Button></Link>
              <Link href="/clinic/line-settings"><Button variant="outline" className="w-full justify-start">LINE 設定</Button></Link>
              <Link href="/clinic/flex-message"><Button variant="outline" className="w-full justify-start">Flex Message</Button></Link>
              <Link href="/clinic/rich-menu"><Button variant="outline" className="w-full justify-start">Rich Menu</Button></Link>
              <Link href="/clinic/message-center"><Button variant="outline" className="w-full justify-start">訊息中心</Button></Link>
              <Link href="/clinic/webhook"><Button variant="outline" className="w-full justify-start">Webhook</Button></Link>
            </CardContent>
          </Card>

          {/* LINE 小遊戲 */}
          <Card>
            <CardHeader>
              <CardTitle>🎮 LINE 小遊戲</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/clinic/game-management"><Button variant="outline" className="w-full justify-start">遊戲管理</Button></Link>
              <Link href="/clinic/games/ichiban-kuji"><Button variant="outline" className="w-full justify-start">一番賞</Button></Link>
              <Link href="/clinic/games/slot-machine"><Button variant="outline" className="w-full justify-start">拉霸遊戲</Button></Link>
              <Link href="/clinic/games/pachinko"><Button variant="outline" className="w-full justify-start">轉珠遊戲</Button></Link>
              <Link href="/clinic/user-prizes"><Button variant="outline" className="w-full justify-start">獎品記錄</Button></Link>
            </CardContent>
          </Card>

          {/* 訂閱與支付 */}
          <Card>
            <CardHeader>
              <CardTitle>💳 訂閱與支付</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/clinic/subscription"><Button variant="outline" className="w-full justify-start">訂閱方案</Button></Link>
              <Link href="/clinic/my-subscription"><Button variant="outline" className="w-full justify-start">我的訂閱</Button></Link>
              <Link href="/clinic/payment"><Button variant="outline" className="w-full justify-start">付款記錄</Button></Link>
            </CardContent>
          </Card>

          {/* 其他功能 */}
          <Card>
            <CardHeader>
              <CardTitle>🛠️ 其他功能</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/clinic/vouchers"><Button variant="outline" className="w-full justify-start">票券管理</Button></Link>
              <Link href="/clinic/coupons"><Button variant="outline" className="w-full justify-start">優惠券</Button></Link>
              <Link href="/clinic/notifications"><Button variant="outline" className="w-full justify-start">通知中心</Button></Link>
              <Link href="/clinic/analytics"><Button variant="outline" className="w-full justify-start">數據分析</Button></Link>
              <Link href="/clinic/reports"><Button variant="outline" className="w-full justify-start">報表中心</Button></Link>
              <Link href="/clinic/ai-chatbot"><Button variant="outline" className="w-full justify-start">AI 聊天</Button></Link>
              <Link href="/clinic/data-import"><Button variant="outline" className="w-full justify-start">數據匯入</Button></Link>
              <Link href="/clinic/settings"><Button variant="outline" className="w-full justify-start">系統設定</Button></Link>
            </CardContent>
          </Card>
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
              <Link href="/admin/organizations">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Building2 className="h-4 w-4" />
                  管理所有診所
                </Button>
              </Link>
              <Link href="/admin/organizations/new">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="h-4 w-4" />
                  建立新診所
                </Button>
              </Link>
              <Link href="/admin/users">
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
