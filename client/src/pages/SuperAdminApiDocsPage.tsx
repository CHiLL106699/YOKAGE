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
import { Textarea } from "@/components/ui/textarea";
import { StatCard } from "@/components/ui/stat-card";
import { 
  Key, Plus, Copy, Eye, EyeOff, RefreshCw, Trash2, MoreHorizontal,
  Code, FileJson, Lock, ExternalLink, Activity, AlertTriangle,
  CheckCircle, XCircle, Clock, Download
} from "lucide-react";
import { toast } from "sonner";

// API 端點文檔
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
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);

  // 模擬 API 金鑰資料
  const apiKeys = [
    { id: 1, name: "Production API Key", key: "yc_live_xxxxxxxxxxxxxxxxxxxxxxxx", created: "2025-06-01", lastUsed: "2026-01-17", status: "active", requests: 12580 },
    { id: 2, name: "Development API Key", key: "yc_test_xxxxxxxxxxxxxxxxxxxxxxxx", created: "2025-09-15", lastUsed: "2026-01-16", status: "active", requests: 3420 },
    { id: 3, name: "Staging API Key", key: "yc_stag_xxxxxxxxxxxxxxxxxxxxxxxx", created: "2025-12-01", lastUsed: "2026-01-10", status: "active", requests: 890 },
  ];

  // 模擬 API 使用統計
  const apiStats = {
    totalRequests: 156890,
    todayRequests: 2340,
    avgLatency: 45,
    errorRate: 0.2,
    activeKeys: 3,
  };

  // 模擬請求日誌
  const requestLogs = [
    { time: "15:12:45", method: "GET", path: "/api/v1/customers", status: 200, latency: 32, ip: "203.145.xxx.xxx" },
    { time: "15:12:42", method: "POST", path: "/api/v1/appointments", status: 201, latency: 156, ip: "203.145.xxx.xxx" },
    { time: "15:12:38", method: "GET", path: "/api/v1/vouchers", status: 200, latency: 28, ip: "118.163.xxx.xxx" },
    { time: "15:12:35", method: "PUT", path: "/api/v1/customers/123", status: 200, latency: 89, ip: "203.145.xxx.xxx" },
    { time: "15:12:30", method: "GET", path: "/api/v1/reports/revenue", status: 401, latency: 12, ip: "61.220.xxx.xxx" },
  ];

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API 金鑰已複製到剪貼簿");
  };

  const handleCreateKey = () => {
    if (!newKeyName) {
      toast.error("請輸入金鑰名稱");
      return;
    }
    toast.success(`API 金鑰「${newKeyName}」已建立`);
    setIsCreateKeyDialogOpen(false);
    setNewKeyName("");
  };

  const handleRevokeKey = (keyId: number, keyName: string) => {
    toast.success(`API 金鑰「${keyName}」已撤銷`);
  };

  const handleRegenerateKey = (keyId: number, keyName: string) => {
    toast.success(`API 金鑰「${keyName}」已重新生成`);
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
            <Dialog open={isCreateKeyDialogOpen} onOpenChange={setIsCreateKeyDialogOpen}>
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
                  <Button onClick={handleCreateKey}>建立金鑰</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="總請求數"
            value={apiStats.totalRequests.toLocaleString()}
            description="累計 API 請求"
            icon={Activity}
          />
          <StatCard
            title="今日請求"
            value={apiStats.todayRequests.toLocaleString()}
            description="今日 API 請求"
            icon={Code}
          />
          <StatCard
            title="平均延遲"
            value={`${apiStats.avgLatency}ms`}
            description="API 回應時間"
            icon={Clock}
          />
          <StatCard
            title="錯誤率"
            value={`${apiStats.errorRate}%`}
            description="請求失敗比例"
            icon={AlertTriangle}
          />
          <StatCard
            title="活躍金鑰"
            value={apiStats.activeKeys}
            description="已啟用的金鑰"
            icon={Key}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名稱</TableHead>
                      <TableHead>金鑰</TableHead>
                      <TableHead>建立日期</TableHead>
                      <TableHead>最後使用</TableHead>
                      <TableHead>請求數</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell className="font-medium">{apiKey.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                              {showApiKey[apiKey.id] ? apiKey.key : apiKey.key.replace(/./g, "•").slice(0, 20) + "..."}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleShowKey(apiKey.id)}
                            >
                              {showApiKey[apiKey.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyKey(apiKey.key)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{apiKey.created}</TableCell>
                        <TableCell>{apiKey.lastUsed}</TableCell>
                        <TableCell>{apiKey.requests.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500 text-white">啟用中</Badge>
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
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => handleRevokeKey(apiKey.id, apiKey.name)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                撤銷金鑰
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    匯出日誌
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>時間</TableHead>
                      <TableHead>方法</TableHead>
                      <TableHead>路徑</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>延遲</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestLogs.map((log, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-sm">{log.time}</TableCell>
                        <TableCell>
                          <Badge className={`${METHOD_COLORS[log.method]} text-white`}>
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
                        <TableCell className="text-muted-foreground">{log.ip}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 使用統計 */}
          <TabsContent value="usage" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>每日請求量</CardTitle>
                  <CardDescription>過去 7 天的 API 請求統計</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: "01/17", requests: 2340, errors: 5 },
                      { date: "01/16", requests: 2180, errors: 3 },
                      { date: "01/15", requests: 1950, errors: 8 },
                      { date: "01/14", requests: 2420, errors: 2 },
                      { date: "01/13", requests: 2100, errors: 4 },
                      { date: "01/12", requests: 1890, errors: 6 },
                      { date: "01/11", requests: 2050, errors: 3 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="w-12 text-sm text-muted-foreground">{item.date}</span>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
                            style={{ width: `${(item.requests / 2500) * 100}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-sm">{item.requests.toLocaleString()}</span>
                        <span className="w-12 text-right text-sm text-red-500">{item.errors} err</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>熱門端點</CardTitle>
                  <CardDescription>最常被呼叫的 API 端點</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { path: "/api/v1/customers", count: 45680, percentage: 35 },
                      { path: "/api/v1/appointments", count: 32450, percentage: 25 },
                      { path: "/api/v1/vouchers", count: 25890, percentage: 20 },
                      { path: "/api/v1/reports/revenue", count: 15230, percentage: 12 },
                      { path: "/api/v1/products", count: 10640, percentage: 8 },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono">{item.path}</code>
                          <span className="text-sm text-muted-foreground">{item.count.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>頻率限制狀態</CardTitle>
                <CardDescription>各診所的 API 使用量與限制</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>診所</TableHead>
                      <TableHead>方案</TableHead>
                      <TableHead>本月請求</TableHead>
                      <TableHead>限制</TableHead>
                      <TableHead>使用率</TableHead>
                      <TableHead>狀態</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { clinic: "曜美診所", plan: "專業版", used: 8500, limit: 10000, status: "normal" },
                      { clinic: "美麗人生診所", plan: "企業版", used: 25000, limit: -1, status: "normal" },
                      { clinic: "新光診所", plan: "基礎版", used: 4800, limit: 5000, status: "warning" },
                      { clinic: "康美診所", plan: "專業版", used: 6200, limit: 10000, status: "normal" },
                    ].map((item, idx) => {
                      const percentage = item.limit === -1 ? 0 : (item.used / item.limit) * 100;
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item.clinic}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.plan}</Badge>
                          </TableCell>
                          <TableCell>{item.used.toLocaleString()}</TableCell>
                          <TableCell>{item.limit === -1 ? "無限制" : item.limit.toLocaleString()}</TableCell>
                          <TableCell>
                            {item.limit === -1 ? (
                              <span className="text-muted-foreground">-</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm">{percentage.toFixed(0)}%</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              item.status === "normal" ? "bg-green-500" :
                              item.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                            }>
                              {item.status === "normal" ? "正常" : item.status === "warning" ? "接近上限" : "已超限"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
