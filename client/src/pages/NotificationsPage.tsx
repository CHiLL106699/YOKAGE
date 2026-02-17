
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Bell,
  Calendar,
  Clock,
  Heart,
  Gift,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
} from "lucide-react";
import { QueryLoading, QueryError } from "@/components/ui/query-state";

const typeIcons: Record<string, React.ReactNode> = {
  appointment_reminder: <Calendar className="h-4 w-4" />,
  aftercare: <Heart className="h-4 w-4" />,
  birthday: <Gift className="h-4 w-4" />,
  followup: <Clock className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  appointment_reminder: "預約提醒",
  aftercare: "術後關懷",
  birthday: "生日祝福",
  followup: "回訪提醒",
};

const statusColors: Record<string, string> = {
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

const statusLabels: Record<string, string> = {
  sent: "已發送",
  failed: "發送失敗",
  pending: "待發送",
};

export default function NotificationsPage() {
  const organizationId = 1; // TODO: from context
  
  const { data: notifSettings, isLoading: settingsLoading, refetch: refetchSettings } = trpc.notification.getNotificationSettings.useQuery();
  
  const { data: notifLog, isLoading: logLoading, error: logError, refetch: refetchLog } = trpc.notification.getNotificationLog.useQuery(
    { page: 1, limit: 50 }
  );
  
  const updateSettingsMutation = trpc.notification.updateNotificationSettings.useMutation({
    onSuccess: () => { toast.success("通知設定已更新"); refetchSettings(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const sendNotifMutation = trpc.notification.sendNotification.useMutation({
    onSuccess: () => { toast.success("通知已發送"); refetchLog(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const isLoading = settingsLoading || logLoading;
  const templates = (notifSettings as any)?.templates ?? [];
  const notifications = (notifLog as any)?.data ?? notifLog?.logs ?? [];

  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isNewTemplate, setIsNewTemplate] = useState(false);

  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: "",
    type: "appointment_reminder",
    channel: "line",
    content: "",
    triggerTime: "",
    isActive: true,
  });

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      type: template.type,
      channel: template.channel,
      content: template.content,
      triggerTime: template.triggerTime,
      isActive: template.isActive,
    });
    setIsNewTemplate(false);
    setIsTemplateDialogOpen(true);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setTemplateForm({
      name: "",
      type: "appointment_reminder",
      channel: "line",
      content: "",
      triggerTime: "",
      isActive: true,
    });
    setIsNewTemplate(true);
    setIsTemplateDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    toast.success(isNewTemplate ? "通知模板已建立" : "通知模板已更新");
    setIsTemplateDialogOpen(false);
  };

  const handleToggleTemplate = (templateId: number, isActive: boolean) => {
    toast.success(isActive ? "通知模板已啟用" : "通知模板已停用");
  };

  const handleToggleTask = (taskId: number, isActive: boolean) => {
    toast.success(isActive ? "排程任務已啟用" : "排程任務已停用");
  };

  const handleTestSend = (templateId: number) => {
    toast.success("測試訊息已發送");
  };

  if (isLoading) return <QueryLoading variant="skeleton-cards" />;

  if (logError) return <QueryError message={logError.message} onRetry={refetchLog} />;


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">通知系統</h1>
            <p className="text-muted-foreground mt-1">管理自動通知模板與排程任務</p>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">啟用模板</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {templates.filter((t: any) => t.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                共 {templates.length} 個模板
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日發送</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications.filter((l: any) => l.status === "sent").length}
              </div>
              <p className="text-xs text-muted-foreground">
                成功發送通知
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">待發送</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications.filter((l: any) => l.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">
                排程中的通知
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">發送失敗</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {notifications.filter((l: any) => l.status === "failed").length}
              </div>
              <p className="text-xs text-muted-foreground">
                需要處理
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 主要內容 */}
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">通知模板</TabsTrigger>
            <TabsTrigger value="schedules">排程任務</TabsTrigger>
            <TabsTrigger value="logs">發送記錄</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
          </TabsList>

          {/* 通知模板 */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">通知模板管理</h2>
              <Button onClick={handleNewTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                新增模板
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template: any) => (
                <Card key={template.id} className={!template.isActive ? "opacity-60" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {typeIcons[template.type]}
                        <Badge variant="outline">{typeLabels[template.type]}</Badge>
                      </div>
                      <Switch
                        checked={template.isActive}
                        onCheckedChange={(checked) => handleToggleTemplate(template.id, checked)}
                      />
                    </div>
                    <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                    <CardDescription>{template.triggerTime}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {template.content}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        編輯
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestSend(template.id)}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        測試
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 排程任務 */}
          <TabsContent value="schedules" className="space-y-4">
            <h2 className="text-lg font-semibold">排程任務管理</h2>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>任務名稱</TableHead>
                    <TableHead>關聯模板</TableHead>
                    <TableHead>執行頻率</TableHead>
                    <TableHead>下次執行時間</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {((notifSettings as any)?.tasks ?? []).map((task: any) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>{task.templateName}</TableCell>
                      <TableCell>{task.cron}</TableCell>
                      <TableCell>{new Date(task.nextRun).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={task.isActive ? "default" : "secondary"}>
                          {task.isActive ? "啟用中" : "已停用"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={task.isActive}
                          onCheckedChange={(checked) => handleToggleTask(task.id, checked)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* 發送記錄 */}
          <TabsContent value="logs">
            <h2 className="text-lg font-semibold mb-4">最近 50 筆發送記錄</h2>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>模板</TableHead>
                    <TableHead>顧客</TableHead>
                    <TableHead>管道</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>時間</TableHead>
                    <TableHead>內容</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.templateName}</TableCell>
                      <TableCell>{log.customerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.channel.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[log.status]}>
                          {statusLabels[log.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(log.sentAt || log.scheduledAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                        {log.content}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* 設定 */}
          <TabsContent value="settings" className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-semibold">通知總開關</h2>
            <Card>
              <CardHeader>
                <CardTitle>全域通知設定</CardTitle>
                <CardDescription>停用此開關將暫停所有類型的自動通知發送。</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="global-notifications"
                    checked={(notifSettings as any)?.globalEnable ?? true}
                    onCheckedChange={(checked) => updateSettingsMutation.mutate({ receiveLine: checked, receiveEmail: checked })}
                  />
                  <Label htmlFor="global-notifications">啟用全域通知</Label>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-lg font-semibold">LINE 通知設定</h2>
            <Card>
              <CardHeader>
                <CardTitle>LINE Messaging API</CardTitle>
                <CardDescription>設定用於發送 LINE 通知的憑證。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="line-channel-secret">Channel Secret</Label>
                  <Input id="line-channel-secret" type="password" defaultValue={(notifSettings as any)?.lineChannelSecret} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="line-channel-token">Channel Access Token</Label>
                  <Textarea id="line-channel-token" defaultValue={(notifSettings as any)?.lineChannelToken} className="min-h-[120px]" />
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <Button 
                  onClick={() => {
                    const secret = (document.getElementById('line-channel-secret') as HTMLInputElement).value;
                    const token = (document.getElementById('line-channel-token') as HTMLTextAreaElement).value;
                    updateSettingsMutation.mutate({ receiveLine: true, receiveEmail: true } as any);
                  }}
                  disabled={updateSettingsMutation.isPending}
                >
                  儲存設定
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 新增/編輯模板 Dialog */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isNewTemplate ? "新增" : "編輯"}通知模板</DialogTitle>
              <DialogDescription>
                設定自動化通知的內容與觸發條件。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="template-name" className="text-right">
                  模板名稱
                </Label>
                <Input id="template-name" value={templateForm.name} onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="template-type" className="text-right">
                  模板類型
                </Label>
                <Select value={templateForm.type} onValueChange={(value) => setTemplateForm({...templateForm, type: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="選擇模板類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment_reminder">預約提醒</SelectItem>
                    <SelectItem value="aftercare">術後關懷</SelectItem>
                    <SelectItem value="birthday">生日祝福</SelectItem>
                    <SelectItem value="followup">回訪提醒</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="template-trigger" className="text-right">
                  觸發時機
                </Label>
                <Input id="template-trigger" value={templateForm.triggerTime} onChange={(e) => setTemplateForm({...templateForm, triggerTime: e.target.value})} className="col-span-3" placeholder="例如：預約前 1 天 09:00" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="template-content" className="text-right">
                  訊息內容
                </Label>
                <Textarea id="template-content" value={templateForm.content} onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})} className="col-span-3 min-h-[150px]" placeholder="支援變數：{{顧客姓名}}, {{預約時間}}, {{診所名稱}}" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="template-active" className="text-right">
                  啟用狀態
                </Label>
                <Switch id="template-active" checked={templateForm.isActive} onCheckedChange={(checked) => setTemplateForm({...templateForm, isActive: checked})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsTemplateDialogOpen(false)}>取消</Button>
              <Button type="submit" onClick={handleSaveTemplate}>儲存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
