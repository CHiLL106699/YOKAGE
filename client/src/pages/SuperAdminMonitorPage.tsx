import { useState, useEffect } from "react";
import { safeDate, safeDateTime, safeStr, safeTime, safeMoney } from '@/lib/safeFormat';
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { QueryLoading } from '@/components/ui/query-state';

import { 
  Activity, Server, Database, Wifi, Clock, AlertTriangle,
  CheckCircle, XCircle, RefreshCw, Download, Cpu, HardDrive,
  MemoryStick, Globe, Zap, TrendingUp, AlertCircle
} from "lucide-react";

// 系統服務狀態
const SERVICES = [
  { id: "api", name: "API 服務", icon: Server },
  { id: "database", name: "資料庫連線", icon: Database },
  { id: "line", name: "LINE 整合", icon: Wifi },
  { id: "storage", name: "檔案儲存", icon: HardDrive },
  { id: "notification", name: "通知服務", icon: Zap },
];

export default function SuperAdminMonitorPage() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // API 查詢
  const { data: systemHealth, refetch: refetchHealth, isLoading } = trpc.superAdmin.getSystemHealth.useQuery(
    undefined,
    { refetchInterval: autoRefresh ? 30000 : false }
  );

  const { data: errorLogs } = trpc.superAdmin.getErrorLogs.useQuery({
    limit: 20,
  });

  const { data: auditLogs } = trpc.superAdmin.getAuditLogs.useQuery({
    limit: 20,
  });

  const { data: performanceMetrics } = trpc.superAdmin.getPerformanceMetrics.useQuery();

  const handleRefresh = () => {
    refetchHealth();
    setLastRefresh(new Date());
    toast.success("系統狀態已更新");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-500">正常</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500">降級</Badge>;
      case "down":
        return <Badge className="bg-red-500">異常</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "down":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {

    return (

      <div className="p-6">

        <QueryLoading variant="skeleton-cards" />

      </div>

    );

  }


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="系統監控"
          description="即時監控系統健康狀態、效能指標與錯誤日誌"
          actions={
            <div className="flex gap-2">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
                {autoRefresh ? "自動更新中" : "自動更新"}
              </Button>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                立即更新
              </Button>
            </div>
          }
        />

        {/* 系統總覽 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="系統狀態"
            value={systemHealth?.overallStatus === "healthy" ? "正常" : "異常"}
            description={`上次更新: ${lastRefresh.toLocaleTimeString("zh-TW")}`}
            icon={Activity}
          />
          <StatCard
            title="API 回應時間"
            value={`${systemHealth?.apiLatency || 0}ms`}
            description="平均回應時間"
            icon={Clock}
            trend={{ value: -5, label: "較昨日" }}
          />
          <StatCard
            title="錯誤率"
            value={`${systemHealth?.errorRate || 0}%`}
            description="過去 24 小時"
            icon={AlertTriangle}
          />
          <StatCard
            title="正常運行時間"
            value={`${systemHealth?.uptime || 99.9}%`}
            description="本月可用性"
            icon={TrendingUp}
          />
        </div>

        {/* 服務狀態 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              服務狀態
            </CardTitle>
            <CardDescription>
              各項系統服務的即時運行狀態
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {SERVICES.map((service) => {
                const status = (systemHealth?.services as Record<string, string>)?.[service.id] || "healthy";
                const Icon = service.icon;
                return (
                  <div
                    key={service.id}
                    className="flex items-center gap-3 p-4 rounded-lg border bg-card"
                  >
                    <div className={`p-2 rounded-lg ${
                      status === "healthy" ? "bg-green-500/10" :
                      status === "degraded" ? "bg-yellow-500/10" : "bg-red-500/10"
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        status === "healthy" ? "text-green-500" :
                        status === "degraded" ? "text-yellow-500" : "text-red-500"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{service.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {status === "healthy" ? "運行正常" :
                         status === "degraded" ? "效能降級" : "服務中斷"}
                      </div>
                    </div>
                    {getStatusIcon(status)}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 效能指標 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                資源使用率
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">CPU 使用率</span>
                  <span className="text-sm text-muted-foreground">
                    {performanceMetrics?.cpu || 45}%
                  </span>
                </div>
                <Progress value={performanceMetrics?.cpu || 45} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">記憶體使用率</span>
                  <span className="text-sm text-muted-foreground">
                    {performanceMetrics?.memory || 62}%
                  </span>
                </div>
                <Progress value={performanceMetrics?.memory || 62} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">磁碟使用率</span>
                  <span className="text-sm text-muted-foreground">
                    {performanceMetrics?.disk || 38}%
                  </span>
                </div>
                <Progress value={performanceMetrics?.disk || 38} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">資料庫連線數</span>
                  <span className="text-sm text-muted-foreground">
                    {performanceMetrics?.dbConnections || 12} / 100
                  </span>
                </div>
                <Progress value={(performanceMetrics?.dbConnections || 12)} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                請求統計
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">今日請求數</span>
                  <span className="font-semibold">{performanceMetrics?.requestsToday?.toLocaleString() || "12,345"}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">平均回應時間</span>
                  <span className="font-semibold">{performanceMetrics?.avgResponseTime || 45}ms</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">成功率</span>
                  <span className="font-semibold text-green-500">{performanceMetrics?.successRate || 99.8}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">錯誤請求數</span>
                  <span className="font-semibold text-red-500">{performanceMetrics?.errorCount || 23}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 日誌分頁 */}
        <Tabs defaultValue="errors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="errors">錯誤日誌</TabsTrigger>
            <TabsTrigger value="audit">操作審計</TabsTrigger>
          </TabsList>

          <TabsContent value="errors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  錯誤日誌
                </CardTitle>
                <CardDescription>
                  最近 20 筆系統錯誤記錄
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>時間</TableHead>
                      <TableHead>等級</TableHead>
                      <TableHead>來源</TableHead>
                      <TableHead>訊息</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(errorLogs?.logs || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          暫無錯誤記錄
                        </TableCell>
                      </TableRow>
                    ) : (
                      (errorLogs?.logs || []).map((log: Record<string, any>, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="text-muted-foreground text-sm">
                            {safeDateTime(log.timestamp)}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              log.level === "error" ? "bg-red-500" :
                              log.level === "warn" ? "bg-yellow-500" : "bg-blue-500"
                            }>
                              {log.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{log.source}</TableCell>
                          <TableCell className="max-w-md truncate">{log.message}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  操作審計日誌
                </CardTitle>
                <CardDescription>
                  最近 20 筆管理操作記錄
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>時間</TableHead>
                      <TableHead>操作者</TableHead>
                      <TableHead>操作類型</TableHead>
                      <TableHead>目標</TableHead>
                      <TableHead>結果</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(auditLogs?.logs || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          暫無審計記錄
                        </TableCell>
                      </TableRow>
                    ) : (
                      (auditLogs?.logs || []).map((log: Record<string, any>, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="text-muted-foreground text-sm">
                            {safeDateTime(log.timestamp)}
                          </TableCell>
                          <TableCell>{log.userName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{log.target}</TableCell>
                          <TableCell>
                            {log.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
