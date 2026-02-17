import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { 
  Settings, Palette, Bell, Ticket, Shield, Database, 
  Upload, Save, RefreshCw, Clock, Calendar, Mail, 
  MessageSquare, Globe, Image, Zap
} from "lucide-react";

export default function SuperAdminSettingsPage() {
  // 全域設定狀態
  const [platformName, setPlatformName] = useState("YOChiLL 醫美診所 SaaS 平台");
  const [platformDescription, setPlatformDescription] = useState("專業醫美診所管理系統");
  const [primaryColor, setPrimaryColor] = useState("#D4AF37");
  const [logoUrl, setLogoUrl] = useState("/logo-new.png");
  
  // 票券設定狀態
  const [defaultReminderDays, setDefaultReminderDays] = useState("3");
  const [reminderTime, setReminderTime] = useState("10:00");
  const [maxTransferCount, setMaxTransferCount] = useState("3");
  const [allowTransfer, setAllowTransfer] = useState(true);
  const [autoExpireReminder, setAutoExpireReminder] = useState(true);
  
  // 通知設定狀態
  const [lineNotificationEnabled, setLineNotificationEnabled] = useState(true);
  const [emailNotificationEnabled, setEmailNotificationEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState("09:00");
  const [reminderFrequency, setReminderFrequency] = useState("daily");
  
  // 系統維護狀態
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // API 查詢
  const { data: voucherStats } = trpc.superAdmin.voucherStats.useQuery();
  const { data: reminderStats } = trpc.superAdmin.getReminderStats.useQuery();
  const { data: organizations } = trpc.superAdmin.listOrganizations.useQuery({});

  // 儲存設定 Mutation
  const saveSettingsMutation = trpc.superAdmin.saveSystemSettings.useMutation({
    onSuccess: () => {
      toast.success("設定已儲存");
    },
    onError: (error) => {
      toast.error(`儲存失敗：${error.message}`);
    },
  });

  // 提醒排程 Mutation
  const scheduleRemindersMutation = trpc.superAdmin.scheduleExpiryReminders.useMutation({
    onSuccess: (result) => {
      toast.success(`已建立 ${result.createdCount} 筆提醒排程`);
    },
    onError: (error) => {
      toast.error(`排程失敗：${error.message}`);
    },
  });

  const handleSaveGlobalSettings = () => {
    saveSettingsMutation.mutate([
      { key: "platform_name", value: platformName, category: "platform" },
      { key: "platform_description", value: platformDescription, category: "platform" },
      { key: "primary_color", value: primaryColor, category: "platform" },
      { key: "logo_url", value: logoUrl, category: "platform" },
    ]);
  };

  const handleSaveVoucherSettings = () => {
    saveSettingsMutation.mutate([
      { key: "default_reminder_days", value: defaultReminderDays, category: "voucher" },
      { key: "reminder_time", value: reminderTime, category: "voucher" },
      { key: "max_transfer_count", value: maxTransferCount, category: "voucher" },
      { key: "allow_transfer", value: allowTransfer.toString(), category: "voucher" },
      { key: "auto_expire_reminder", value: autoExpireReminder.toString(), category: "voucher" },
    ]);
  };

  const handleSaveNotificationSettings = () => {
    saveSettingsMutation.mutate([
      { key: "line_notification_enabled", value: lineNotificationEnabled.toString(), category: "notification" },
      { key: "email_notification_enabled", value: emailNotificationEnabled.toString(), category: "notification" },
      { key: "notification_time", value: notificationTime, category: "notification" },
      { key: "reminder_frequency", value: reminderFrequency, category: "notification" },
    ]);
  };

  const handleSaveSystemSettings = () => {
    saveSettingsMutation.mutate([
      { key: "maintenance_mode", value: maintenanceMode.toString(), category: "system" },
      { key: "debug_mode", value: debugMode.toString(), category: "system" },
    ]);
  };

  const handleScheduleReminders = () => {
    scheduleRemindersMutation.mutate({
      organizationId: null, // 所有診所
      daysBeforeExpiry: parseInt(defaultReminderDays),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="系統設定"
          description="管理平台全域設定、票券規則、通知排程與系統維護"
        />

        {/* 設定概覽統計 */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="平台診所數"
            value={organizations?.data?.length || 0}
            icon={Globe}
            description="已註冊診所"
          />
          <StatCard
            title="活躍票券模板"
            value={voucherStats?.totalTemplates || 0}
            icon={Ticket}
            description="跨診所票券"
          />
          <StatCard
            title="待發送提醒"
            value={reminderStats?.pending || 0}
            icon={Bell}
            description="排程中"
          />
          <StatCard
            title="系統狀態"
            value="正常"
            icon={Zap}
            description="所有服務運行中"
            trend={{ value: 99.9, label: "可用率" }}
          />
        </div>

        {/* 設定分頁 */}
        <Tabs defaultValue="global" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="global" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">全域設定</span>
            </TabsTrigger>
            <TabsTrigger value="voucher" className="gap-2">
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">票券設定</span>
            </TabsTrigger>
            <TabsTrigger value="notification" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">通知設定</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">系統維護</span>
            </TabsTrigger>
          </TabsList>

          {/* 全域設定 */}
          <TabsContent value="global" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-[oklch(0.80_0.14_70)]" />
                  平台品牌設定
                </CardTitle>
                <CardDescription>
                  設定平台名稱、Logo 與主題色彩
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">平台名稱</Label>
                    <Input
                      id="platformName"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      placeholder="輸入平台名稱"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">主題色彩</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#D4AF37"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platformDescription">平台描述</Label>
                  <Textarea
                    id="platformDescription"
                    value={platformDescription}
                    onChange={(e) => setPlatformDescription(e.target.value)}
                    placeholder="輸入平台描述"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>平台 Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain"  loading="lazy" />
                      ) : (
                        <Image className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Upload className="h-4 w-4" />
                        上傳新 Logo
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        建議尺寸：512x512px，PNG 或 SVG 格式
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveGlobalSettings} className="btn-gold gap-2">
                    <Save className="h-4 w-4" />
                    儲存設定
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 票券設定 */}
          <TabsContent value="voucher" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-[oklch(0.80_0.14_70)]" />
                  票券到期提醒設定
                </CardTitle>
                <CardDescription>
                  設定票券到期前的自動提醒規則
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>啟用自動到期提醒</Label>
                    <p className="text-sm text-muted-foreground">
                      在票券到期前自動發送 LINE 提醒
                    </p>
                  </div>
                  <Switch
                    checked={autoExpireReminder}
                    onCheckedChange={setAutoExpireReminder}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reminderDays">提醒天數（到期前）</Label>
                    <Select value={defaultReminderDays} onValueChange={setDefaultReminderDays}>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇天數" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 天前</SelectItem>
                        <SelectItem value="2">2 天前</SelectItem>
                        <SelectItem value="3">3 天前</SelectItem>
                        <SelectItem value="5">5 天前</SelectItem>
                        <SelectItem value="7">7 天前</SelectItem>
                        <SelectItem value="14">14 天前</SelectItem>
                        <SelectItem value="30">30 天前</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminderTime">提醒發送時間</Label>
                    <Input
                      id="reminderTime"
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      系統將在此時間發送提醒訊息
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-[oklch(0.80_0.14_70)]" />
                  票券轉贈設定
                </CardTitle>
                <CardDescription>
                  設定票券轉贈功能的限制規則
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>允許票券轉贈</Label>
                    <p className="text-sm text-muted-foreground">
                      客戶可將票券轉贈給其他人
                    </p>
                  </div>
                  <Switch
                    checked={allowTransfer}
                    onCheckedChange={setAllowTransfer}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTransfer">最大轉贈次數</Label>
                  <Select value={maxTransferCount} onValueChange={setMaxTransferCount}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="選擇次數" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 次</SelectItem>
                      <SelectItem value="2">2 次</SelectItem>
                      <SelectItem value="3">3 次</SelectItem>
                      <SelectItem value="5">5 次</SelectItem>
                      <SelectItem value="unlimited">無限制</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    每張票券最多可被轉贈的次數
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleScheduleReminders}
                    disabled={scheduleRemindersMutation.isPending}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${scheduleRemindersMutation.isPending ? 'animate-spin' : ''}`} />
                    立即建立提醒排程
                  </Button>
                  <Button 
                    onClick={handleSaveVoucherSettings} 
                    className="btn-gold gap-2"
                    disabled={saveSettingsMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                    儲存設定
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-[oklch(0.80_0.14_70)]" />
                  票券批量匯入設定
                </CardTitle>
                <CardDescription>
                  設定 CSV 批量匯入的欄位對應與驗證規則
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border p-4 bg-muted/30">
                  <h4 className="font-medium mb-2">CSV 範本欄位說明</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">name</span>
                      <span>票券名稱（必填）</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">type</span>
                      <span>類型：treatment/discount/gift_card/stored_value/free_item</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">value</span>
                      <span>面額或折扣值（必填）</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">valueType</span>
                      <span>fixed_amount/percentage/treatment_count</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">validDays</span>
                      <span>有效天數（選填，預設 90）</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">description</span>
                      <span>票券描述（選填）</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  下載 CSV 範本
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通知設定 */}
          <TabsContent value="notification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[oklch(0.80_0.14_70)]" />
                  LINE 通知設定
                </CardTitle>
                <CardDescription>
                  設定 LINE 訊息推送的時間與頻率
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>啟用 LINE 通知</Label>
                    <p className="text-sm text-muted-foreground">
                      透過 LINE 發送系統通知與提醒
                    </p>
                  </div>
                  <Switch
                    checked={lineNotificationEnabled}
                    onCheckedChange={setLineNotificationEnabled}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="notificationTime">預設發送時間</Label>
                    <Input
                      id="notificationTime"
                      type="time"
                      value={notificationTime}
                      onChange={(e) => setNotificationTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">提醒頻率</Label>
                    <Select value={reminderFrequency} onValueChange={setReminderFrequency}>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇頻率" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">僅一次</SelectItem>
                        <SelectItem value="daily">每日</SelectItem>
                        <SelectItem value="weekly">每週</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[oklch(0.80_0.14_70)]" />
                  Email 通知設定
                </CardTitle>
                <CardDescription>
                  設定 Email 通知的發送規則
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>啟用 Email 通知</Label>
                    <p className="text-sm text-muted-foreground">
                      透過 Email 發送重要系統通知
                    </p>
                  </div>
                  <Switch
                    checked={emailNotificationEnabled}
                    onCheckedChange={setEmailNotificationEnabled}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotificationSettings} className="btn-gold gap-2">
                    <Save className="h-4 w-4" />
                    儲存設定
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 系統維護 */}
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[oklch(0.80_0.14_70)]" />
                  系統維護模式
                </CardTitle>
                <CardDescription>
                  啟用維護模式時，一般使用者將無法存取系統
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>維護模式</Label>
                    <p className="text-sm text-muted-foreground">
                      啟用後僅 Super Admin 可存取
                    </p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>除錯模式</Label>
                    <p className="text-sm text-muted-foreground">
                      顯示詳細錯誤訊息與日誌
                    </p>
                  </div>
                  <Switch
                    checked={debugMode}
                    onCheckedChange={setDebugMode}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-[oklch(0.80_0.14_70)]" />
                  資料庫維護
                </CardTitle>
                <CardDescription>
                  執行資料庫維護與清理作業
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    清理過期資料
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Database className="h-4 w-4" />
                    重建索引
                  </Button>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSystemSettings} className="btn-gold gap-2">
                    <Save className="h-4 w-4" />
                    儲存設定
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
