import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { trpc } from "@/lib/trpc";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar as CalendarIcon,
  DollarSign,
  Package,
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { zhTW } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];



export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<"day" | "week" | "month">("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // 計算日期範圍
  const getDateRange = () => {
    const now = selectedDate;
    switch (dateRange) {
      case "day":
        return { start: now, end: now };
      case "week":
        return { start: startOfWeek(now, { locale: zhTW }), end: endOfWeek(now, { locale: zhTW }) };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const range = getDateRange();

  // 查詢報表數據
  const { data: revenueData, isLoading: revenueLoading } = trpc.report.revenue.useQuery({
    organizationId: 1, // TODO: 從 context 取得
    startDate: range.start.toISOString(),
    endDate: range.end.toISOString(),
  });

  const { data: appointmentStats, isLoading: appointmentLoading } = trpc.report.appointmentStats.useQuery({
    organizationId: 1,
    startDate: range.start.toISOString(),
    endDate: range.end.toISOString(),
  });

  const { data: customerStats, isLoading: customerLoading } = trpc.report.customerStats.useQuery({
    organizationId: 1,
    startDate: range.start.toISOString(),
    endDate: range.end.toISOString(),
  });

  const { data: productStats, isLoading: productLoading } = trpc.report.productStats.useQuery({
    organizationId: 1,
    startDate: range.start.toISOString(),
    endDate: range.end.toISOString(),
  });

  const { data: staffPerformance, isLoading: staffLoading } = trpc.report.staffPerformance.useQuery({
    organizationId: 1,
    startDate: range.start.toISOString(),
    endDate: range.end.toISOString(),
  });

  const isLoading = revenueLoading || appointmentLoading || customerLoading || productLoading || staffLoading;

  // 日期導航
  const navigateDate = (direction: "prev" | "next") => {
    const days = dateRange === "day" ? 1 : dateRange === "week" ? 7 : 30;
    setSelectedDate(prev => 
      direction === "prev" ? subDays(prev, days) : new Date(prev.getTime() + days * 24 * 60 * 60 * 1000)
    );
  };

  // 匯出報表
  const handleExport = async (type: "excel" | "pdf") => {
    // TODO: 實作匯出功能
    console.log(`Exporting ${type}...`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 控制列 */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateDate("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[200px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "yyyy年MM月dd日", { locale: zhTW })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={zhTW}
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" size="icon" onClick={() => navigateDate("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Select value={dateRange} onValueChange={(v: "day" | "week" | "month") => setDateRange(v)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">日報</SelectItem>
                <SelectItem value="week">週報</SelectItem>
                <SelectItem value="month">月報</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("excel")}>
              <Download className="mr-2 h-4 w-4" />
              匯出 Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              <Download className="mr-2 h-4 w-4" />
              匯出 PDF
            </Button>
          </div>
        </div>

        {/* 總覽卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總營收</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    NT$ {(revenueData?.totalRevenue ?? 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    較上期 {revenueData?.growthRate ?? 0 > 0 ? "+" : ""}{revenueData?.growthRate ?? 0}%
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">預約數</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {appointmentLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{appointmentStats?.totalAppointments ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    完成率 {appointmentStats?.completionRate ?? 0}%
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">新客戶</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {customerLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{customerStats?.newCustomers ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    回客率 {customerStats?.returnRate ?? 0}%
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">熱門療程</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {productLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold truncate">
                    {productStats?.topProduct?.name ?? "-"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {productStats?.topProduct?.count ?? 0} 次預約
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 詳細報表 Tabs */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">營收分析</TabsTrigger>
            <TabsTrigger value="appointments">預約統計</TabsTrigger>
            <TabsTrigger value="customers">客戶分析</TabsTrigger>
            <TabsTrigger value="staff">員工業績</TabsTrigger>
          </TabsList>

          {/* 營收分析 */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>營收趨勢</CardTitle>
                  <CardDescription>每日營收變化</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {revenueLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData?.dailyRevenue ?? []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`NT$ ${Number(value).toLocaleString()}`, "營收"]} />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>營收來源分布</CardTitle>
                  <CardDescription>依類別統計</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {revenueLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueData?.byCategory ?? []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                          nameKey="category"
                        >
                          {(revenueData?.byCategory ?? []).map((_: unknown, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`NT$ ${Number(value).toLocaleString()}`, "金額"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 預約統計 */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>預約時段分布</CardTitle>
                  <CardDescription>熱門預約時段</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {appointmentLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={appointmentStats?.byTimeSlot ?? []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timeSlot" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#82ca9d" name="預約數" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>預約狀態分布</CardTitle>
                  <CardDescription>各狀態佔比</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {appointmentLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={appointmentStats?.byStatus ?? []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="status"
                        >
                          {(appointmentStats?.byStatus ?? []).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>熱門療程排行</CardTitle>
                <CardDescription>預約次數最多的療程</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {productLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productStats?.topProducts ?? []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" name="預約數" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 客戶分析 */}
          <TabsContent value="customers" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>新客 vs 回客</CardTitle>
                  <CardDescription>客戶類型分布</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {customerLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "新客", value: customerStats?.newCustomers ?? 0 },
                            { name: "回客", value: customerStats?.returningCustomers ?? 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#0088FE" />
                          <Cell fill="#00C49F" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>會員等級分布</CardTitle>
                  <CardDescription>各等級客戶數量</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {customerLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customerStats?.byMemberLevel ?? []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="level" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#FFBB28" name="客戶數" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>客戶消費頻率</CardTitle>
                <CardDescription>依消費次數分組</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {customerLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customerStats?.byFrequency ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="frequency" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#FF8042" name="客戶數" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 員工業績 */}
          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>員工業績排行</CardTitle>
                <CardDescription>依服務金額排序</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {staffLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={staffPerformance?.rankings ?? []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => [`NT$ ${Number(value).toLocaleString()}`, "業績"]} />
                      <Bar dataKey="revenue" fill="#8884d8" name="業績金額" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              {(staffPerformance?.rankings ?? []).slice(0, 3).map((staff: { staffId: number; name: string; revenue: number; serviceCount: number }, index: number) => (
                <Card key={staff.staffId}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                        index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-600"
                      }`}>
                        {index + 1}
                      </span>
                      {staff.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">業績金額</span>
                        <span className="font-bold">NT$ {staff.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">服務次數</span>
                        <span>{staff.serviceCount} 次</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">平均單價</span>
                        <span>NT$ {staff.serviceCount > 0 ? Math.round(staff.revenue / staff.serviceCount).toLocaleString() : 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
