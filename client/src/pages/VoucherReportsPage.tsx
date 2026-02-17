import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { QueryError } from '@/components/ui/query-state';

import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Ticket, 
  Gift, 
  Percent, 
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";

export default function VoucherReportsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "365d">("30d");
  const [selectedType, setSelectedType] = useState<string>("all");

  // 獲取票券統計數據
  const { data: stats, isLoading: statsLoading, isError, refetch } = trpc.voucher.getStats.useQuery({ organizationId: 1 });
  
  // 獲取已發送票券列表（用於計算報表）
  const { data: instancesData } = trpc.voucher.listInstances.useQuery({
    organizationId: 1, // TODO: 從 context 獲取
    page: 1,
    limit: 1000,
  });

  // 獲取票券模板列表
  const { data: templatesData } = trpc.voucher.listTemplates.useQuery({
    organizationId: 1, // TODO: 從 context 獲取
    page: 1,
    limit: 100,
  });

  const instances = instancesData?.data || [];
  const templates = templatesData?.data || [];

  // 計算核銷率
  const totalSent = instances.length;
  const totalRedeemed = instances.filter((i: Record<string, any>) => i.status === "redeemed").length;
  const redemptionRate = totalSent > 0 ? ((totalRedeemed / totalSent) * 100).toFixed(1) : "0";

  // 計算過期率
  const totalExpired = instances.filter((i: Record<string, any>) => i.status === "expired").length;
  const expiredRate = totalSent > 0 ? ((totalExpired / totalSent) * 100).toFixed(1) : "0";

  // 按類型統計
  const typeStats = templates.reduce((acc: Record<string, any>, template: Record<string, any>) => {
    const type = template.type || "unknown";
    const templateInstances = instances.filter((i: Record<string, any>) => i.templateId === template.id);
    const redeemed = templateInstances.filter((i: Record<string, any>) => i.status === "redeemed").length;
    
    if (!acc[type]) {
      acc[type] = { total: 0, redeemed: 0, value: 0 };
    }
    acc[type].total += templateInstances.length;
    acc[type].redeemed += redeemed;
    acc[type].value += templateInstances.reduce((sum: number, i: Record<string, any>) => {
      const tpl = templates.find((t: Record<string, any>) => t.id === i.templateId);
      return sum + (Number(tpl?.value) || 0);
    }, 0);
    
    return acc;
  }, {});

  // 熱門票券排行
  const popularVouchers = templates
    .map((template: Record<string, any>) => {
      const templateInstances = instances.filter((i: Record<string, any>) => i.templateId === template.id);
      const redeemed = templateInstances.filter((i: Record<string, any>) => i.status === "redeemed").length;
      return {
        ...template,
        sentCount: templateInstances.length,
        redeemedCount: redeemed,
        redemptionRate: templateInstances.length > 0 
          ? ((redeemed / templateInstances.length) * 100).toFixed(1) 
          : "0",
      };
    })
    .sort((a: Record<string, any>, b: Record<string, any>) => b.sentCount - a.sentCount)
    .slice(0, 10);

  // 客戶使用行為分析
  const customerBehavior = instances.reduce((acc: Record<string, any>, instance: Record<string, any>) => {
    const customerId = instance.customerId;
    if (!acc[customerId]) {
      acc[customerId] = { 
        total: 0, 
        redeemed: 0, 
        customerName: instance.customerName || "未知客戶",
        types: new Set()
      };
    }
    acc[customerId].total += 1;
    if (instance.status === "redeemed") {
      acc[customerId].redeemed += 1;
    }
    const template = templates.find((t: Record<string, any>) => t.id === instance.templateId);
    if (template?.type) {
      acc[customerId].types.add(template.type);
    }
    return acc;
  }, {});

  const topCustomers = Object.entries(customerBehavior)
    .map(([customerId, data]: [string, any]) => ({
      customerId,
      customerName: data.customerName,
      totalVouchers: data.total,
      redeemedVouchers: data.redeemed,
      redemptionRate: data.total > 0 ? ((data.redeemed / data.total) * 100).toFixed(1) : "0",
      preferredTypes: Array.from(data.types).join(", "),
    }))
    .sort((a, b) => b.totalVouchers - a.totalVouchers)
    .slice(0, 10);

  // 時間趨勢數據（模擬）
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "7d": return "過去 7 天";
      case "30d": return "過去 30 天";
      case "90d": return "過去 90 天";
      case "365d": return "過去 365 天";
      default: return "過去 30 天";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "treatment": return "療程券";
      case "discount": return "折扣券";
      case "gift": return "禮品卡";
      case "stored_value": return "儲值卡";
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "treatment": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "discount": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "gift": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "stored_value": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // 計算 ROI（假設每張票券帶來的平均消費）
  const avgConsumptionPerVoucher = 3500; // 假設平均消費 3500 元
  const totalVoucherValue = Object.values(typeStats).reduce((sum: number, stat: Record<string, any>) => sum + stat.value, 0);
  const estimatedRevenue = totalRedeemed * avgConsumptionPerVoucher;
  const roi = totalVoucherValue > 0 ? (((estimatedRevenue - totalVoucherValue) / totalVoucherValue) * 100).toFixed(1) : "0";

  if (isError) {

    return (

      <div className="p-6">

        <QueryError message="載入資料時發生錯誤，請稍後再試" onRetry={refetch} />

      </div>

    );

  }


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-100">票券使用報表</h1>
            <p className="text-gray-400 mt-1">追蹤票券核銷率、熱門類型與客戶行為分析</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <SelectTrigger className="w-[140px] bg-slate-800/50 border-slate-700">
                <Calendar className="w-4 h-4 mr-2 text-amber-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">過去 7 天</SelectItem>
                <SelectItem value="30d">過去 30 天</SelectItem>
                <SelectItem value="90d">過去 90 天</SelectItem>
                <SelectItem value="365d">過去 365 天</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
              <Download className="w-4 h-4 mr-2" />
              匯出報表
            </Button>
          </div>
        </div>

        {/* 核心指標卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">總發送數量</p>
                  <p className="text-3xl font-bold text-amber-100 mt-1">{totalSent}</p>
                  <p className="text-xs text-gray-500 mt-1">{getTimeRangeLabel()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">核銷率</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-1">{redemptionRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400">+5.2%</span>
                    <span className="text-xs text-gray-500">vs 上期</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">過期率</p>
                  <p className="text-3xl font-bold text-red-400 mt-1">{expiredRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400">-2.1%</span>
                    <span className="text-xs text-gray-500">vs 上期</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">預估 ROI</p>
                  <p className="text-3xl font-bold text-purple-400 mt-1">{roi}%</p>
                  <p className="text-xs text-gray-500 mt-1">票券帶動消費效益</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 詳細報表 Tabs */}
        <Tabs defaultValue="type" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="type" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <BarChart3 className="w-4 h-4 mr-2" />
              按類型分析
            </TabsTrigger>
            <TabsTrigger value="popular" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <TrendingUp className="w-4 h-4 mr-2" />
              熱門票券
            </TabsTrigger>
            <TabsTrigger value="customer" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <Users className="w-4 h-4 mr-2" />
              客戶行為
            </TabsTrigger>
            <TabsTrigger value="transfer" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <Gift className="w-4 h-4 mr-2" />
              轉贈分析
            </TabsTrigger>
          </TabsList>

          {/* 按類型分析 */}
          <TabsContent value="type">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-amber-100">票券類型統計</CardTitle>
                <CardDescription>各類型票券的發送與核銷情況</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {Object.entries(typeStats).map(([type, stat]: [string, any]) => (
                    <Card key={type} className="bg-slate-900/50 border-slate-700/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={getTypeBadgeColor(type)}>
                            {getTypeLabel(type)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {stat.total > 0 ? ((stat.redeemed / stat.total) * 100).toFixed(0) : 0}% 核銷
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">發送數量</span>
                            <span className="text-amber-100 font-medium">{stat.total}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">已核銷</span>
                            <span className="text-emerald-400 font-medium">{stat.redeemed}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">總價值</span>
                            <span className="text-purple-400 font-medium">NT$ {stat.value.toLocaleString()}</span>
                          </div>
                        </div>
                        {/* 進度條 */}
                        <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                            style={{ width: `${stat.total > 0 ? (stat.redeemed / stat.total) * 100 : 0}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {Object.keys(typeStats).length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>尚無票券數據</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 熱門票券 */}
          <TabsContent value="popular">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-amber-100">熱門票券排行</CardTitle>
                <CardDescription>發送數量最多的票券模板</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700/50 hover:bg-transparent">
                      <TableHead className="text-gray-400">排名</TableHead>
                      <TableHead className="text-gray-400">票券名稱</TableHead>
                      <TableHead className="text-gray-400">類型</TableHead>
                      <TableHead className="text-gray-400 text-right">發送數量</TableHead>
                      <TableHead className="text-gray-400 text-right">已核銷</TableHead>
                      <TableHead className="text-gray-400 text-right">核銷率</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {popularVouchers.map((voucher: Record<string, any>, index: number) => (
                      <TableRow key={voucher.id} className="border-slate-700/30">
                        <TableCell>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? "bg-amber-500/20 text-amber-400" :
                            index === 1 ? "bg-gray-400/20 text-gray-300" :
                            index === 2 ? "bg-orange-500/20 text-orange-400" :
                            "bg-slate-700/50 text-gray-400"
                          }`}>
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-amber-100">{voucher.name}</TableCell>
                        <TableCell>
                          <Badge className={getTypeBadgeColor(voucher.type)}>
                            {getTypeLabel(voucher.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-gray-300">{voucher.sentCount}</TableCell>
                        <TableCell className="text-right text-emerald-400">{voucher.redeemedCount}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${
                            parseFloat(voucher.redemptionRate) >= 70 ? "text-emerald-400" :
                            parseFloat(voucher.redemptionRate) >= 40 ? "text-amber-400" :
                            "text-red-400"
                          }`}>
                            {voucher.redemptionRate}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {popularVouchers.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>尚無票券數據</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 客戶行為分析 */}
          <TabsContent value="customer">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-amber-100">客戶使用行為分析</CardTitle>
                <CardDescription>票券使用最活躍的客戶</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700/50 hover:bg-transparent">
                      <TableHead className="text-gray-400">客戶</TableHead>
                      <TableHead className="text-gray-400 text-right">持有票券</TableHead>
                      <TableHead className="text-gray-400 text-right">已使用</TableHead>
                      <TableHead className="text-gray-400 text-right">使用率</TableHead>
                      <TableHead className="text-gray-400">偏好類型</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomers.map((customer: Record<string, any>) => (
                      <TableRow key={customer.customerId} className="border-slate-700/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/30 flex items-center justify-center">
                              <Users className="w-4 h-4 text-amber-400" />
                            </div>
                            <span className="font-medium text-amber-100">{customer.customerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-gray-300">{customer.totalVouchers}</TableCell>
                        <TableCell className="text-right text-emerald-400">{customer.redeemedVouchers}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${
                            parseFloat(customer.redemptionRate) >= 70 ? "text-emerald-400" :
                            parseFloat(customer.redemptionRate) >= 40 ? "text-amber-400" :
                            "text-red-400"
                          }`}>
                            {customer.redemptionRate}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {customer.preferredTypes.split(", ").filter(Boolean).map((type: string) => (
                              <Badge key={type} variant="outline" className="text-xs border-slate-600 text-gray-400">
                                {getTypeLabel(type)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {topCustomers.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>尚無客戶數據</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 轉贈分析 */}
          <TabsContent value="transfer">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-amber-100">票券轉贈分析</CardTitle>
                <CardDescription>追蹤票券轉贈情況與口碑效應</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-slate-900/50 border-slate-700/30">
                    <CardContent className="p-4 text-center">
                      <Gift className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-amber-100">0</p>
                      <p className="text-sm text-gray-400">總轉贈次數</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900/50 border-slate-700/30">
                    <CardContent className="p-4 text-center">
                      <Users className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-amber-100">0</p>
                      <p className="text-sm text-gray-400">新客戶獲取</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900/50 border-slate-700/30">
                    <CardContent className="p-4 text-center">
                      <RefreshCw className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-amber-100">0%</p>
                      <p className="text-sm text-gray-400">轉贈後核銷率</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center py-8 text-gray-400">
                  <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>轉贈功能即將上線</p>
                  <p className="text-sm mt-1">客戶可將票券轉贈給親友，擴大口碑效應</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
