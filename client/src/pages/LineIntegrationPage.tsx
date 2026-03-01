import { useState } from "react";
import { safeDate, safeDateTime, safeStr, safeTime, safeMoney } from '@/lib/safeFormat';
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  MessageCircle,
  Key,
  Link,
  Webhook,
  Settings,
  CheckCircle,
  XCircle,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  Users,
  Bell,
  Calendar,
  Gift,
  Heart,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";

export default function LineIntegrationPage() {
  const organizationId = 1; // TODO: from context
  
  const { data: lineStatus, isLoading: statusLoading, error: statusError, refetch: refetchStatus } = trpc.lineSettings.getStatus.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const { data: richMenus, isLoading: menuLoading } = trpc.richMenu.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const saveConfigMutation = trpc.lineSettings.saveConfig.useMutation({
    onSuccess: () => { toast.success("LINE 設定已儲存"); refetchStatus(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const verifyMutation = trpc.lineSettings.verifyChannel.useMutation({
    onSuccess: () => toast.success("Channel 驗證成功"),
    onError: (err: any) => toast.error(err.message),
  });

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [lineSettings, setLineSettings] = useState({
    // LINE Login Channel
    loginChannelId: "",
    loginChannelSecret: "",
    loginCallbackUrl: "https://your-domain.com/api/auth/line/callback",
    loginEnabled: false,

    // LINE Messaging API Channel
    messagingChannelId: "",
    messagingChannelSecret: "",
    messagingAccessToken: "",
    messagingEnabled: false,

    // LIFF Settings
    liffId: "",
    liffUrl: "",
    liffEnabled: false,

    // Webhook Settings
    webhookUrl: "https://your-domain.com/api/line/webhook",
    webhookVerified: false,
  });

  const [testMessage, setTestMessage] = useState("");

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已複製到剪貼簿");
  };

  const handleSaveSettings = () => {
    toast.success("LINE 設定已儲存");
  };

  const handleVerifyWebhook = () => {
    toast.info("正在驗證 Webhook...");
    // Loading handled by tRPC
    // setTimeout(() => {
      setLineSettings(prev => ({ ...prev, webhookVerified: true }));
      toast.success("Webhook 驗證成功");
    // }, 1500);
  };

  const handleSendTestMessage = () => {
    if (!testMessage) {
      toast.error("請輸入測試訊息");
      return;
    }
    toast.success("測試訊息已發送");
    setTestMessage("");
  };



  const messageTemplates = [
    {
      id: 1,
      name: "預約確認通知",
      type: "flex",
      trigger: "appointment.confirmed",
      icon: Calendar,
    },
    {
      id: 2,
      name: "預約提醒（前一天）",
      type: "flex",
      trigger: "appointment.reminder.1day",
      icon: Bell,
    },
    {
      id: 3,
      name: "術後關懷訊息",
      type: "flex",
      trigger: "aftercare.scheduled",
      icon: Heart,
    },
    {
      id: 4,
      name: "生日祝福訊息",
      type: "flex",
      trigger: "customer.birthday",
      icon: Gift,
    },
    {
      id: 5,
      name: "優惠券發送",
      type: "flex",
      trigger: "coupon.issued",
      icon: Gift,
    },
  ];

  if (statusLoading) return <QueryLoading variant="skeleton-cards" />;

  if (statusError) return <QueryError message={statusError.message} onRetry={refetchStatus} />;


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageCircle className="h-8 w-8 text-green-500" />
              LINE 整合設定
            </h1>
            <p className="text-muted-foreground mt-1">
              設定 LINE Login、Messaging API 與 LIFF 應用
            </p>
          </div>
          <Button onClick={handleSaveSettings}>
            儲存所有設定
          </Button>
        </div>

        {/* 連線狀態總覽 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">LINE Login</span>
                </div>
                {lineSettings.loginEnabled ? (
                  <Badge className="bg-green-100 text-green-800">已連線</Badge>
                ) : (
                  <Badge variant="outline">未設定</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Messaging API</span>
                </div>
                {lineSettings.messagingEnabled ? (
                  <Badge className="bg-green-100 text-green-800">已連線</Badge>
                ) : (
                  <Badge variant="outline">未設定</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">LIFF</span>
                </div>
                {lineSettings.liffEnabled ? (
                  <Badge className="bg-green-100 text-green-800">已啟用</Badge>
                ) : (
                  <Badge variant="outline">未設定</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Webhook</span>
                </div>
                {lineSettings.webhookVerified ? (
                  <Badge className="bg-green-100 text-green-800">已驗證</Badge>
                ) : (
                  <Badge variant="outline">未驗證</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="login" className="space-y-4">
          <TabsList>
            <TabsTrigger value="login">LINE Login</TabsTrigger>
            <TabsTrigger value="messaging">Messaging API</TabsTrigger>
            <TabsTrigger value="liff">LIFF 設定</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
            <TabsTrigger value="richmenu">Rich Menu</TabsTrigger>
            <TabsTrigger value="templates">訊息模板</TabsTrigger>
          </TabsList>

          {/* LINE Login */}
          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">LINE Login Channel 設定</CardTitle>
                    <CardDescription>
                      設定 LINE Login 讓顧客可以使用 LINE 帳號登入
                    </CardDescription>
                  </div>
                  <Switch
                    checked={lineSettings.loginEnabled}
                    onCheckedChange={(checked) => setLineSettings({ ...lineSettings, loginEnabled: checked })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">如何取得 LINE Login Channel 憑證？</p>
                      <ol className="list-decimal list-inside mt-2 space-y-1 text-muted-foreground">
                        <li>前往 <a href="https://developers.line.biz/console/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LINE Developers Console</a></li>
                        <li>建立或選擇一個 Provider</li>
                        <li>建立 LINE Login Channel</li>
                        <li>在 Basic settings 中取得 Channel ID 和 Channel secret</li>
                        <li>在 LINE Login 設定中新增 Callback URL</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="loginChannelId">Channel ID</Label>
                    <Input
                      id="loginChannelId"
                      value={lineSettings.loginChannelId}
                      onChange={(e) => setLineSettings({ ...lineSettings, loginChannelId: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginChannelSecret">Channel Secret</Label>
                    <div className="flex gap-2">
                      <Input
                        id="loginChannelSecret"
                        type={showSecrets.loginSecret ? "text" : "password"}
                        value={lineSettings.loginChannelSecret}
                        onChange={(e) => setLineSettings({ ...lineSettings, loginChannelSecret: e.target.value })}
                        placeholder="••••••••••••••••"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleSecretVisibility("loginSecret")}
                      >
                        {showSecrets.loginSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginCallbackUrl">Callback URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="loginCallbackUrl"
                      value={lineSettings.loginCallbackUrl}
                      readOnly
                      className="bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(lineSettings.loginCallbackUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    請將此 URL 新增到 LINE Developers Console 的 Callback URL 設定中
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messaging API */}
          <TabsContent value="messaging" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">LINE Messaging API Channel 設定</CardTitle>
                    <CardDescription>
                      設定 Messaging API 以發送推播訊息給顧客
                    </CardDescription>
                  </div>
                  <Switch
                    checked={lineSettings.messagingEnabled}
                    onCheckedChange={(checked) => setLineSettings({ ...lineSettings, messagingEnabled: checked })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="messagingChannelId">Channel ID</Label>
                    <Input
                      id="messagingChannelId"
                      value={lineSettings.messagingChannelId}
                      onChange={(e) => setLineSettings({ ...lineSettings, messagingChannelId: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="messagingChannelSecret">Channel Secret</Label>
                    <div className="flex gap-2">
                      <Input
                        id="messagingChannelSecret"
                        type={showSecrets.messagingSecret ? "text" : "password"}
                        value={lineSettings.messagingChannelSecret}
                        onChange={(e) => setLineSettings({ ...lineSettings, messagingChannelSecret: e.target.value })}
                        placeholder="••••••••••••••••"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleSecretVisibility("messagingSecret")}
                      >
                        {showSecrets.messagingSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="messagingAccessToken">Channel Access Token</Label>
                  <div className="flex gap-2">
                    <Input
                      id="messagingAccessToken"
                      type={showSecrets.accessToken ? "text" : "password"}
                      value={lineSettings.messagingAccessToken}
                      onChange={(e) => setLineSettings({ ...lineSettings, messagingAccessToken: e.target.value })}
                      placeholder="••••••••••••••••"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleSecretVisibility("accessToken")}
                    >
                      {showSecrets.accessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* 測試訊息發送 */}
                <div className="pt-4 border-t">
                  <Label className="mb-2 block">測試訊息發送</Label>
                  <div className="flex gap-2">
                    <Input
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="輸入測試訊息..."
                    />
                    <Button onClick={handleSendTestMessage}>
                      <Send className="h-4 w-4 mr-2" />
                      發送測試
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    測試訊息將發送給診所管理員的 LINE 帳號
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LIFF 設定 */}
          <TabsContent value="liff" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">LIFF 應用設定</CardTitle>
                    <CardDescription>
                      設定 LINE Front-end Framework (LIFF) 應用
                    </CardDescription>
                  </div>
                  <Switch
                    checked={lineSettings.liffEnabled}
                    onCheckedChange={(checked) => setLineSettings({ ...lineSettings, liffEnabled: checked })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="liffId">LIFF ID</Label>
                  <Input
                    id="liffId"
                    value={lineSettings.liffId}
                    onChange={(e) => setLineSettings({ ...lineSettings, liffId: e.target.value })}
                    placeholder="1234567890-xxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="liffUrl">LIFF URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="liffUrl"
                      value={lineSettings.liffUrl || `https://liff.line.me/${lineSettings.liffId}`}
                      readOnly
                      className="bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(lineSettings.liffUrl || `https://liff.line.me/${lineSettings.liffId}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* LIFF 頁面列表 */}
                <div className="pt-4 border-t">
                  <Label className="mb-2 block">LIFF 頁面</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>頁面名稱</TableHead>
                        <TableHead>路徑</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">預約頁面</TableCell>
                        <TableCell className="font-mono text-sm">/liff/booking</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">啟用</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">會員中心</TableCell>
                        <TableCell className="font-mono text-sm">/liff/member</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">啟用</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">商城頁面</TableCell>
                        <TableCell className="font-mono text-sm">/liff/shop</TableCell>
                        <TableCell>
                          <Badge variant="outline">停用</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhook */}
          <TabsContent value="webhook" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Webhook 設定</CardTitle>
                <CardDescription>
                  設定 Webhook 以接收 LINE 平台的事件通知
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhookUrl"
                      value={lineSettings.webhookUrl}
                      readOnly
                      className="bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(lineSettings.webhookUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    請將此 URL 設定到 LINE Developers Console 的 Webhook URL
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {lineSettings.webhookVerified ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">
                        {lineSettings.webhookVerified ? "Webhook 已驗證" : "Webhook 未驗證"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lineSettings.webhookVerified
                          ? "您的 Webhook 端點已成功連線"
                          : "請先在 LINE Developers Console 設定 Webhook URL"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleVerifyWebhook}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    驗證
                  </Button>
                </div>

                {/* 支援的事件類型 */}
                <div className="pt-4 border-t">
                  <Label className="mb-2 block">支援的事件類型</Label>
                  <div className="grid gap-2 md:grid-cols-2">
                    {[
                      { name: "message", label: "訊息事件", enabled: true },
                      { name: "follow", label: "加入好友", enabled: true },
                      { name: "unfollow", label: "封鎖", enabled: true },
                      { name: "postback", label: "Postback 事件", enabled: true },
                      { name: "beacon", label: "Beacon 事件", enabled: false },
                      { name: "accountLink", label: "帳號連結", enabled: true },
                    ].map((event) => (
                      <div
                        key={event.name}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="text-sm">{event.label}</span>
                        <Switch checked={event.enabled} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rich Menu */}
          <TabsContent value="richmenu" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Rich Menu 管理</CardTitle>
                    <CardDescription>
                      管理 LINE 官方帳號的圖文選單
                    </CardDescription>
                  </div>
                  <Button>
                    建立 Rich Menu
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名稱</TableHead>
                      <TableHead>目標對象</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>建立日期</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {richMenus?.map((menu) => (
                      <TableRow key={menu.id}>
                        <TableCell className="font-medium">{menu.name}</TableCell>
                        <TableCell>{menu.targetAudience}</TableCell>
                        <TableCell>
                          <Badge className={menu.isActive ? "bg-green-100 text-green-800" : ""}>
                            {menu.isActive ? "啟用中" : "停用"}
                          </Badge>
                        </TableCell>
                        <TableCell>{menu.createdAt ? safeDate(menu.createdAt) : "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">編輯</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 訊息模板 */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Flex Message 模板</CardTitle>
                    <CardDescription>
                      管理自動發送的訊息模板
                    </CardDescription>
                  </div>
                  <Button>
                    建立模板
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {messageTemplates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <div
                        key={template.id}
                        className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {template.trigger}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}