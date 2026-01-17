import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { 
  Building2, ArrowLeft, Users, Calendar, DollarSign, TrendingUp,
  Mail, Phone, MapPin, Clock, Edit, Settings, Activity,
  UserCheck, Package, FileText, CreditCard, BarChart3
} from "lucide-react";
import { Link, useParams } from "wouter";

// 訂閱方案配置
const SUBSCRIPTION_PLANS = {
  free: { label: "免費版", color: "bg-gray-500", price: 0 },
  basic: { label: "基礎版", color: "bg-blue-500", price: 2999 },
  pro: { label: "專業版", color: "bg-purple-500", price: 5999 },
  enterprise: { label: "企業版", color: "bg-amber-500", price: 9999 },
} as const;

type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

export default function OrganizationDetailPage() {
  const params = useParams();
  const orgId = parseInt(params.id || "0");
  
  const { data: org, isLoading } = trpc.superAdmin.getOrganization.useQuery(
    { id: orgId },
    { enabled: orgId > 0 }
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!org) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
          <Building2 className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-xl">找不到此診所</p>
          <Link href="/super-admin/organizations">
            <Button variant="outline" className="mt-4 border-amber-500/50 text-amber-400">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回診所列表
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const plan = SUBSCRIPTION_PLANS[org.subscriptionPlan as SubscriptionPlan] || SUBSCRIPTION_PLANS.free;

  // 模擬統計數據（實際應從 API 取得）
  const stats = {
    customers: 156,
    appointments: 423,
    revenue: 1250000,
    staff: 8,
    products: 45,
    treatments: 312,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link href="/super-admin/organizations">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-amber-400">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/30 flex items-center justify-center border border-amber-500/30">
                  <Building2 className="h-7 w-7 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-amber-100">{org.name}</h1>
                  <p className="text-slate-400">{org.slug}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-700 text-slate-300">
              <Settings className="h-4 w-4 mr-2" />
              設定
            </Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Edit className="h-4 w-4 mr-2" />
              編輯
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">訂閱方案</p>
                  <Badge className={`${plan.color} text-white mt-1`}>{plan.label}</Badge>
                </div>
                <div className="p-3 rounded-full bg-amber-500/20">
                  <CreditCard className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">狀態</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`h-2 w-2 rounded-full ${org.isActive ? "bg-green-500" : "bg-red-500"}`}></span>
                    <span className={`font-medium ${org.isActive ? "text-green-400" : "text-red-400"}`}>
                      {org.isActive ? "啟用中" : "已停用"}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-green-500/20">
                  <Activity className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">月費</p>
                  <p className="text-2xl font-bold text-amber-100">
                    ${plan.price.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500/20">
                  <DollarSign className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">建立日期</p>
                  <p className="text-lg font-medium text-amber-100">
                    {new Date(org.createdAt).toLocaleDateString("zh-TW")}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              總覽
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              統計數據
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              使用者
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              帳務紀錄
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Info */}
              <Card className="bg-slate-900/50 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-amber-100">聯絡資訊</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">電子郵件</p>
                      <p className="text-slate-100">{org.email || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">聯絡電話</p>
                      <p className="text-slate-100">{org.phone || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">地址</p>
                      <p className="text-slate-100">{org.address || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-slate-900/50 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-amber-100">營運概況</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-slate-400">客戶數</span>
                      </div>
                      <p className="text-2xl font-bold text-amber-100">{stats.customers}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-slate-400">預約數</span>
                      </div>
                      <p className="text-2xl font-bold text-amber-100">{stats.appointments}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-slate-400">員工數</span>
                      </div>
                      <p className="text-2xl font-bold text-amber-100">{stats.staff}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-orange-400" />
                        <span className="text-sm text-slate-400">產品數</span>
                      </div>
                      <p className="text-2xl font-bold text-amber-100">{stats.products}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-900/30 to-slate-900 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-300">本月營收</p>
                      <p className="text-3xl font-bold text-blue-100">
                        ${stats.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-400 mt-1">+12.5% vs 上月</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-blue-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-900/30 to-slate-900 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-300">本月療程</p>
                      <p className="text-3xl font-bold text-green-100">{stats.treatments}</p>
                      <p className="text-sm text-green-400 mt-1">+8.2% vs 上月</p>
                    </div>
                    <FileText className="h-10 w-10 text-green-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-300">新客戶</p>
                      <p className="text-3xl font-bold text-purple-100">24</p>
                      <p className="text-sm text-green-400 mt-1">+15.3% vs 上月</p>
                    </div>
                    <UserCheck className="h-10 w-10 text-purple-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/50 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-100 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  月度趨勢
                </CardTitle>
                <CardDescription className="text-slate-400">
                  過去 6 個月的營運數據
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-slate-500">
                  <p>圖表區域（需整合圖表庫）</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="bg-slate-900/50 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-100">診所使用者</CardTitle>
                <CardDescription className="text-slate-400">
                  管理此診所的員工帳號
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-amber-200">姓名</TableHead>
                      <TableHead className="text-amber-200">角色</TableHead>
                      <TableHead className="text-amber-200">電子郵件</TableHead>
                      <TableHead className="text-amber-200">狀態</TableHead>
                      <TableHead className="text-amber-200">最後登入</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-slate-700">
                      <TableCell className="text-slate-100">王小明</TableCell>
                      <TableCell>
                        <Badge className="bg-purple-500">管理員</Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">admin@clinic.com</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2 text-green-400">
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          啟用
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-400">2024-01-15 14:30</TableCell>
                    </TableRow>
                    <TableRow className="border-slate-700">
                      <TableCell className="text-slate-100">李美麗</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500">諮詢師</Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">consultant@clinic.com</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2 text-green-400">
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          啟用
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-400">2024-01-15 10:15</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-4">
            <Card className="bg-slate-900/50 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-100">帳務紀錄</CardTitle>
                <CardDescription className="text-slate-400">
                  訂閱付款與發票紀錄
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-amber-200">日期</TableHead>
                      <TableHead className="text-amber-200">項目</TableHead>
                      <TableHead className="text-amber-200">金額</TableHead>
                      <TableHead className="text-amber-200">狀態</TableHead>
                      <TableHead className="text-amber-200">發票</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-slate-700">
                      <TableCell className="text-slate-400">2024-01-01</TableCell>
                      <TableCell className="text-slate-100">專業版月費</TableCell>
                      <TableCell className="text-amber-100">$5,999</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">已付款</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-amber-400">
                          下載
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-slate-700">
                      <TableCell className="text-slate-400">2023-12-01</TableCell>
                      <TableCell className="text-slate-100">專業版月費</TableCell>
                      <TableCell className="text-amber-100">$5,999</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">已付款</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-amber-400">
                          下載
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
