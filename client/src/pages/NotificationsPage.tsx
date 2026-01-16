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

// Mock data for notification templates
const mockTemplates = [
  {
    id: 1,
    name: "預約提醒 - 前一天",
    type: "appointment_reminder",
    channel: "line",
    content: "親愛的 {{customer_name}}，提醒您明天 {{appointment_time}} 有預約 {{service_name}}，請準時到達。",
    isActive: true,
    triggerTime: "1 day before",
  },
  {
    id: 2,
    name: "預約提醒 - 當天",
    type: "appointment_reminder",
    channel: "line",
    content: "親愛的 {{customer_name}}，提醒您今天 {{appointment_time}} 有預約 {{service_name}}，我們期待您的到來！",
    isActive: true,
    triggerTime: "2 hours before",
  },
  {
    id: 3,
    name: "術後關懷 - 第一天",
    type: "aftercare",
    channel: "line",
    content: "親愛的 {{customer_name}}，感謝您今天的療程。請記得 {{aftercare_notes}}，如有任何不適請隨時聯繫我們。",
    isActive: true,
    triggerTime: "1 day after",
  },
  {
    id: 4,
    name: "術後關懷 - 第三天",
    type: "aftercare",
    channel: "line",
    content: "親愛的 {{customer_name}}，距離您的療程已過三天，請問恢復情況如何？如有任何問題歡迎回覆。",
    isActive: true,
    triggerTime: "3 days after",
  },
  {
    id: 5,
    name: "生日祝福",
    type: "birthday",
    channel: "line",
    content: "親愛的 {{customer_name}}，祝您生日快樂！🎂 為慶祝您的生日，我們特別為您準備了專屬優惠，歡迎蒞臨體驗。",
    isActive: true,
    triggerTime: "on birthday",
  },
  {
    id: 6,
    name: "回訪提醒",
    type: "followup",
    channel: "line",
    content: "親愛的 {{customer_name}}，距離您上次療程已過 {{days_since_last_visit}} 天，建議您安排回診以維持最佳效果。",
    isActive: false,
    triggerTime: "30 days after last visit",
  },
];

// Mock data for notification logs
const mockLogs = [
  {
    id: 1,
    templateName: "預約提醒 - 前一天",
    customerName: "王小明",
    channel: "line",
    status: "sent",
    sentAt: "2024-01-15 10:00:00",
    content: "親愛的 王小明，提醒您明天 14:00 有預約 雷射除斑，請準時到達。",
  },
  {
    id: 2,
    templateName: "術後關懷 - 第一天",
    customerName: "李小華",
    channel: "line",
    status: "sent",
    sentAt: "2024-01-15 09:30:00",
    content: "親愛的 李小華，感謝您今天的療程。請記得保持傷口乾燥，如有任何不適請隨時聯繫我們。",
  },
  {
    id: 3,
    templateName: "生日祝福",
    customerName: "張美麗",
    channel: "line",
    status: "failed",
    sentAt: "2024-01-15 08:00:00",
    content: "親愛的 張美麗，祝您生日快樂！🎂",
    error: "LINE 用戶未綁定",
  },
  {
    id: 4,
    templateName: "預約提醒 - 當天",
    customerName: "陳大明",
    channel: "line",
    status: "pending",
    scheduledAt: "2024-01-16 08:00:00",
    content: "親愛的 陳大明，提醒您今天 10:00 有預約 玻尿酸注射，我們期待您的到來！",
  },
];

// Mock data for scheduled tasks
const mockScheduledTasks = [
  {
    id: 1,
    type: "appointment_reminder",
    name: "預約提醒排程",
    description: "每天早上 8:00 發送當天預約提醒",
    schedule: "0 8 * * *",
    isActive: true,
    lastRun: "2024-01-15 08:00:00",
    nextRun: "2024-01-16 08:00:00",
  },
  {
    id: 2,
    type: "aftercare",
    name: "術後關懷排程",
    description: "每天早上 9:00 檢查並發送術後關懷訊息",
    schedule: "0 9 * * *",
    isActive: true,
    lastRun: "2024-01-15 09:00:00",
    nextRun: "2024-01-16 09:00:00",
  },
  {
    id: 3,
    type: "birthday",
    name: "生日祝福排程",
    description: "每天早上 8:00 發送當天生日祝福",
    schedule: "0 8 * * *",
    isActive: true,
    lastRun: "2024-01-15 08:00:00",
    nextRun: "2024-01-16 08:00:00",
  },
  {
    id: 4,
    type: "followup",
    name: "回訪提醒排程",
    description: "每週一早上 10:00 發送回訪提醒",
    schedule: "0 10 * * 1",
    isActive: false,
    lastRun: "2024-01-08 10:00:00",
    nextRun: "2024-01-22 10:00:00",
  },
];

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
  const [selectedTemplate, setSelectedTemplate] = useState<typeof mockTemplates[0] | null>(null);
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

  const handleEditTemplate = (template: typeof mockTemplates[0]) => {
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
                {mockTemplates.filter(t => t.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                共 {mockTemplates.length} 個模板
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
                {mockLogs.filter(l => l.status === "sent").length}
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
                {mockLogs.filter(l => l.status === "pending").length}
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
                {mockLogs.filter(l => l.status === "failed").length}
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
              {mockTemplates.map((template) => (
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

            <div className="grid gap-4">
              {mockScheduledTasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {typeIcons[task.type]}
                        <div>
                          <CardTitle className="text-base">{task.name}</CardTitle>
                          <CardDescription>{task.description}</CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={task.isActive}
                        onCheckedChange={(checked) => handleToggleTask(task.id, checked)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">排程規則</p>
                        <p className="font-mono">{task.schedule}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">上次執行</p>
                        <p>{task.lastRun}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">下次執行</p>
                        <p>{task.nextRun}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 發送記錄 */}
          <TabsContent value="logs" className="space-y-4">
            <h2 className="text-lg font-semibold">發送記錄</h2>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>模板名稱</TableHead>
                    <TableHead>客戶</TableHead>
                    <TableHead>通道</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>時間</TableHead>
                    <TableHead>內容</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLogs.map((log) => (
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
                        {log.sentAt || log.scheduledAt}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {log.content}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* 設定 */}
          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-lg font-semibold">通知設定</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">預約提醒設定</CardTitle>
                  <CardDescription>設定預約提醒的發送時機</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>前一天提醒</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>當天提醒</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>當天提醒時間（預約前幾小時）</Label>
                    <Select defaultValue="2">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 小時前</SelectItem>
                        <SelectItem value="2">2 小時前</SelectItem>
                        <SelectItem value="3">3 小時前</SelectItem>
                        <SelectItem value="4">4 小時前</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">術後關懷設定</CardTitle>
                  <CardDescription>設定術後關懷的發送時機</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>第一天關懷</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>第三天關懷</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>第七天關懷</Label>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">生日祝福設定</CardTitle>
                  <CardDescription>設定生日祝福的發送方式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>啟用生日祝福</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>發送時間</Label>
                    <Select defaultValue="8">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">早上 8:00</SelectItem>
                        <SelectItem value="9">早上 9:00</SelectItem>
                        <SelectItem value="10">早上 10:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>附加優惠券</Label>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">回訪提醒設定</CardTitle>
                  <CardDescription>設定回訪提醒的發送條件</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>啟用回訪提醒</Label>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label>距離上次療程天數</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="14">14 天</SelectItem>
                        <SelectItem value="30">30 天</SelectItem>
                        <SelectItem value="60">60 天</SelectItem>
                        <SelectItem value="90">90 天</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* 模板編輯對話框 */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isNewTemplate ? "新增通知模板" : "編輯通知模板"}</DialogTitle>
              <DialogDescription>
                設定通知模板的內容與觸發條件
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>模板名稱</Label>
                  <Input
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="例如：預約提醒 - 前一天"
                  />
                </div>
                <div className="space-y-2">
                  <Label>通知類型</Label>
                  <Select
                    value={templateForm.type}
                    onValueChange={(value) => setTemplateForm({ ...templateForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment_reminder">預約提醒</SelectItem>
                      <SelectItem value="aftercare">術後關懷</SelectItem>
                      <SelectItem value="birthday">生日祝福</SelectItem>
                      <SelectItem value="followup">回訪提醒</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>發送通道</Label>
                  <Select
                    value={templateForm.channel}
                    onValueChange={(value) => setTemplateForm({ ...templateForm, channel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">LINE</SelectItem>
                      <SelectItem value="sms">簡訊</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>觸發時機</Label>
                  <Input
                    value={templateForm.triggerTime}
                    onChange={(e) => setTemplateForm({ ...templateForm, triggerTime: e.target.value })}
                    placeholder="例如：1 day before"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>訊息內容</Label>
                <Textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  placeholder="輸入通知內容，可使用變數如 {{customer_name}}, {{appointment_time}} 等"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  可用變數：{"{{customer_name}}"}, {"{{appointment_time}}"}, {"{{service_name}}"}, {"{{aftercare_notes}}"}, {"{{days_since_last_visit}}"}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={templateForm.isActive}
                  onCheckedChange={(checked) => setTemplateForm({ ...templateForm, isActive: checked })}
                />
                <Label>啟用此模板</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveTemplate}>
                {isNewTemplate ? "建立" : "儲存"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
