import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { trpc } from "@/lib/trpc";
import { 
  Key, Plus, Copy, Eye, EyeOff, RefreshCw, Trash2, MoreHorizontal,
  Code, FileJson, Lock, ExternalLink, Activity, AlertTriangle,
  CheckCircle, XCircle, Clock, Download
} from "lucide-react";
import { toast } from "sonner";

// API 端點文檔（靜態定義）
const API_ENDPOINTS = [
  {
    category: "客戶管理",
    endpoints: [
      { method: "GET", path: "/api/v1/customers", description: "取得客戶列表", auth: true },
      { method: "GET", path: "/api/v1/customers/:id", description: "取得單一客戶詳情", auth: true },
      { method: "POST", path: "/api/v1/customers", description: "建立新客戶", auth: true },
      { method: "PUT", path: "/api/v1/customers/:id", description: "更新客戶資料", auth: true },
      { method: "DELETE", path: "/api/v1/customers/:id", description: "刪除客戶", auth: true },
    ],
  },
  {
    category: "預約管理",
    endpoints: [
      { method: "GET", path: "/api/v1/appointments", description: "取得預約列表", auth: true },
      { method: "GET", path: "/api/v1/appointments/:id", description: "取得單一預約詳情", auth: true },
      { method: "POST", path: "/api/v1/appointments", description: "建立新預約", auth: true },
      { method: "PUT", path: "/api/v1/appointments/:id", description: "更新預約", auth: true },
      { method: "DELETE", path: "/api/v1/appointments/:id", description: "取消預約", auth: true },
    ],
  },
  {
    category: "票券管理",
    endpoints: [
      { method: "GET", path: "/api/v1/vouchers", description: "取得票券列表", auth: true },
      { method: "POST", path: "/api/v1/vouchers/issue", description: "發送票券", auth: true },
      { method: "POST", path: "/api/v1/vouchers/:id/redeem", description: "核銷票券", auth: true },
      { method: "GET", path: "/api/v1/vouchers/:id/qrcode", description: "取得票券 QR Code", auth: true },
    ],
  },
  {
    category: "報表分析",
    endpoints: [
      { method: "GET", path: "/api/v1/reports/revenue", description: "營收報表", auth: true },
      { method: "GET", path: "/api/v1/reports/appointments", description: "預約統計", auth: true },
      { method: "GET", path: "/api/v1/reports/customers", description: "客戶分析", auth: true },
    ],
  },
];

// 方法顏色配置
const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-500",
  POST: "bg-blue-500",
  PUT: "bg-yellow-500",
  DELETE: "bg-red-500",
};

export default function SuperAdminApiDocsPage() {
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [isCreateKeyDialogOpen, setIsCreateKeyDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyOrgId, setNewKeyOrgId] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [createdKeyDisplay, setCreatedKeyDisplay] = useState<string | null>(null);

  // ============================================
  // tRPC API 查詢
  // ============================================
  const { data: apiKeys, isLoading: keysLoading, refetch: refetchKeys } = trpc.superAdmin.listApiKeys.useQuery();

  const { data: apiStats, isLoading: statsLoading } = trpc.superAdmin.apiUsageStats.useQuery(
    undefined,
    { refetchInterval: 30000 }
  );

  const { data: requestLogs, isLoading: logsLoading, refetch: refetchLogs } = trpc.superAdmin.recentApiLogs.useQuery(
    { limit: 20 }
  );

  const createKeyMutation = trpc.superAdmin.createApiKey.useMutation({
    onSuccess: (data) => {
      setCreatedKeyDisplay(data.apiKey);
      refetchKeys();
      toast.success("API 金鑰已建立，請立即複製保存");
    },
    onError: (err) => toast.error(`建立失敗: ${err.message}`),
  });

  const revokeKeyMutation = trpc.superAdmin.revokeApiKey.useMutation({
    onSuccess: () => {
      refetchKeys();
      toast.success("API 金鑰已撤銷");
    },
    onError: (err) => toast.error(`撤銷失敗: ${err.message}`),
  });

  // 統計數據（來自 API，fallback 為 0）
  const usageStats = apiStats || {
    totalRequests: 0,
    todayRequests: 0,
    avgLatency: 0,
    errorRate: 0,
    activeKeys: 0,
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API 金鑰已複製到剪貼簿");
  };

  const handleCreateKey = () => {
    if (!newKeyName) {
      toast.error("請輸入金鑰名稱");
      return;
    }
    createKeyMutation.mutate({
      organizationId: parseInt(newKeyOrgId) || 1,
      name: newKeyName,
    });
    setIsCreateKeyDialogOpen(false);
    setNewKeyName("");
    setNewKeyOrgId("");
  };

  const handleRevokeKey = (keyId: number, keyName: string) => {
    revokeKeyMutation.mutate({ apiKeyId: keyId });
  };

  const handleRegenerateKey = (keyId: number, keyName: string) => {
    toast.info(`重新生成金鑰需先撤銷舊金鑰再建立新的`);
  };

  const toggleShowKey = (keyId: number) => {
    setShowApiKey((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              API 文檔
            </h1>
            <p className="text-slate-400 mt-1">
              管理 API 金鑰、查看文檔與使用統計
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open("/api-docs", "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              完整文檔
            </Button>
            <Dialog open={isCreateKeyDialogOpen} onOpenChange={(open) => { setIsCreateKeyDialogOpen(open); if (!open) setCreatedKeyDisplay(null); }}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold">
                  <Plus className="h-4 w-4" />
                  建立金鑰
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>建立 API 金鑰</DialogTitle>
                  <DialogDescription>建立新的 API 金鑰以存取 API</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>金鑰名稱</Label>
                    <Input
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="例：Production API Key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>組織 ID</Label>
                    <Input
                      value={newKeyOrgId}
                      onChange={(e) => setNewKeyOrgId(e.target.value)}
                      placeholder="例：1"
                      type="number"
                    />
                  </div>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-500 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">安全提醒</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      API 金鑰建立後只會顯示一次，請妥善保存。金鑰外洩可能導致資料安全風險。
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateKeyDialogOpen(false)}>取消</Button>
                  <Button onClick={handleCreateKey} disabled={createKeyMutation.isPending}>
                    {createKeyMutation.isPending ? "建立中..." : "建立金鑰"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 新建金鑰顯示 */}
        {createdKeyDisplay && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-500 mb-1">新建立的 API 金鑰（僅顯示一次）</p>
                  <code className="text-sm bg-muted px-3 py-1.5 rounded font-mono block break-all">{createdKeyDisplay}</code>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleCopyKey(createdKeyDisplay)}>
                  <Copy className="h-4 w-4 mr-1" />
                  複製
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCreatedKeyDisplay(null)}>
                  關閉
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="總請求數"
            value={usageStats.totalRequests.toLocaleString()}
            description="累計 API 請求"
            icon={Activity}
            loading={statsLoading}
          />
          <StatCard
            title="今日請求"
            value={usageStats.todayRequests.toLocaleString()}
            description="今日 API 請求"
            icon={Code}
            loading={statsLoading}
          />
          <StatCard
            title="平均延遲"
            value={`${usageStats.avgLatency}ms`}
            description="API 回應時間"
            icon={Clock}
            loading={statsLoading}
          />
          <StatCard
            title="錯誤率"
            value={`${usageStats.errorRate}%`}
            description="請求失敗比例"
            icon={AlertTriangle}
            loading={statsLoading}
          />
          <StatCard
            title="活躍金鑰"
            value={usageStats.activeKeys}
            description="已啟用的金鑰"
            icon={Key}
            loading={statsLoading}
          />
        </div>

        {/* 分頁內容 */}
        <Tabs defaultValue="keys" className="space-y-4">
          <TabsList>
            <TabsTrigger value="keys">API 金鑰</TabsTrigger>
            <TabsTrigger value="docs">API 端點</TabsTrigger>
            <TabsTrigger value="logs">請求日誌</TabsTrigger>
            <TabsTrigger value="usage">使用統計</TabsTrigger>
          </TabsList>

          {/* API 金鑰 */}
          <TabsContent value="keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API 金鑰管理</CardTitle>
                <CardDescription>管理您的 API 存取金鑰</CardDescription>
              </CardHeader>
              <CardContent>
                {keysLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (apiKeys || []).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>尚無 API 金鑰</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>名稱</TableHead>
                        <TableHead>金鑰前綴</TableHead>
                        <TableHead>組織</TableHead>
                        <TableHead>建立日期</TableHead>
                        <TableHead>最後使用</TableHead>
                        <TableHead>請求數</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(apiKeys || []).map((apiKey) => (
                        <TableRow key={apiKey.id}>
                          <TableCell className="font-medium">{apiKey.name}</TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                              {apiKey.keyPrefix}...
                            </code>
                          </TableCell>
                          <TableCell>{apiKey.organizationName}</TableCell>
                          <TableCell>{apiKey.createdAt ? new Date(apiKey.createdAt).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>{apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt).toLocaleDateString() : '從未使用'}</TableCell>
                          <TableCell>{apiKey.requestCount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={apiKey.status === 'active' ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                              {apiKey.status === 'active' ? '啟用中' : '已撤銷'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleRegenerateKey(apiKey.id, apiKey.name)}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  重新生成
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {apiKey.status === 'active' && (
                                  <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={() => handleRevokeKey(apiKey.id, apiKey.name)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    撤銷金鑰
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API 端點文檔 */}
          <TabsContent value="docs" className="space-y-4">
            {API_ENDPOINTS.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileJson className="h-5 w-5" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.endpoints.map((endpoint, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedEndpoint(endpoint)}
                      >
                        <Badge className={`${METHOD_COLORS[endpoint.method]} text-white w-16 justify-center`}>
                          {endpoint.method}
                        </Badge>
                        <code className="flex-1 text-sm font-mono">{endpoint.path}</code>
                        <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                        {endpoint.auth && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 請求日誌 */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>請求日誌</CardTitle>
                    <CardDescription>最近的 API 請求記錄</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => refetchLogs()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新整理
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (requestLogs || []).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>尚無請求紀錄</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>時間</TableHead>
                        <TableHead>方法</TableHead>
                        <TableHead>路徑</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>延遲</TableHead>
                        <TableHead>金鑰</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(requestLogs || []).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {log.time ? new Date(log.time).toLocaleTimeString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${METHOD_COLORS[log.method] || 'bg-gray-500'} text-white`}>
                              {log.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{log.path}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {log.status < 400 ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className={log.status < 400 ? "text-green-500" : "text-red-500"}>
                                {log.status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{log.latency}ms</TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {log.keyPrefix || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 使用統計 */}
          <TabsContent value="usage" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>API 使用概覽</CardTitle>
                  <CardDescription>API 使用情況摘要</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">累計請求數</span>
                      <span className="font-bold">{usageStats.totalRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">今日請求數</span>
                      <span className="font-bold">{usageStats.todayRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">平均延遲</span>
                      <span className="font-bold">{usageStats.avgLatency}ms</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">錯誤率</span>
                      <span className="font-bold">{usageStats.errorRate}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">活躍金鑰數</span>
                      <span className="font-bold">{usageStats.activeKeys}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>金鑰使用排行</CardTitle>
                  <CardDescription>各金鑰的請求數量</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(apiKeys || []).filter(k => k.status === 'active').map((key) => (
                      <div key={key.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{key.name}</span>
                          <span className="text-sm text-muted-foreground">{key.requestCount.toLocaleString()} 次</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
                            style={{ width: `${Math.min((key.requestCount / Math.max(key.rateLimit, 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {(apiKeys || []).filter(k => k.status === 'active').length === 0 && (
                      <p className="text-muted-foreground text-center py-4">尚無活躍金鑰</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
