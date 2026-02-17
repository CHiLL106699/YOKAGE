import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Bell, Send, MessageSquare, Mail, Users, Building2, 
  Plus, Edit, Trash2, Eye, Clock, CheckCircle, AlertCircle,
  Megaphone, FileText, RefreshCw, Filter
} from "lucide-react";

// 通知類型配置
const NOTIFICATION_TYPES = {
  announcement: { label: "系統公告", color: "bg-blue-500", icon: Megaphone },
  maintenance: { label: "維護通知", color: "bg-yellow-500", icon: AlertCircle },
  feature: { label: "新功能", color: "bg-green-500", icon: Bell },
  alert: { label: "緊急警報", color: "bg-red-500", icon: AlertCircle },
} as const;

// 通知範圍配置
const TARGET_SCOPES = {
  all: { label: "所有用戶", icon: Users },
  admins: { label: "診所管理員", icon: Building2 },
  specific: { label: "指定診所", icon: Building2 },
} as const;

export default function SuperAdminNotificationsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Record<string, any> | null>(null);
  
  // 新通知表單
  const [newNotification, setNewNotification] = useState({
    title: "",
    content: "",
    type: "announcement",
    targetScope: "all",
    targetOrganizations: [] as number[],
    sendLine: true,
    sendEmail: false,
    scheduledAt: "",
  });

  // API 查詢
  const { data: stats } = trpc.superAdmin.notificationStats.useQuery();
  const { data: notifications, refetch } = trpc.superAdmin.listNotifications.useQuery({
    limit: 20,
  });
  const { data: templates } = trpc.superAdmin.listNotificationTemplates.useQuery();
  const { data: organizations } = trpc.superAdmin.listOrganizations.useQuery({});

  // Mutations
  const sendNotificationMutation = trpc.superAdmin.sendNotification.useMutation({
    onSuccess: () => {
      toast.success("通知已發送");
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "發送失敗");
    },
  });

  const saveTemplateMutation = trpc.superAdmin.saveNotificationTemplate.useMutation({
    onSuccess: () => {
      toast.success("模板已儲存");
      setIsTemplateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "儲存失敗");
    },
  });

  const resetForm = () => {
    setNewNotification({
      title: "",
      content: "",
      type: "announcement",
      targetScope: "all",
      targetOrganizations: [],
      sendLine: true,
      sendEmail: false,
      scheduledAt: "",
    });
  };

  const handleSend = () => {
    if (!newNotification.title || !newNotification.content) {
      toast.error("請填寫標題和內容");
      return;
    }
    sendNotificationMutation.mutate(newNotification);
  };

  const handleUseTemplate = (template: Record<string, any>) => {
    setNewNotification({
      ...newNotification,
      title: template.title,
      content: template.content,
      type: template.type,
    });
    toast.success("已套用模板");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="通知中心"
          description="管理系統公告、通知推送與模板設定"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(true)}>
                <FileText className="h-4 w-4 mr-2" />
                管理模板
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    發送通知
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>發送新通知</DialogTitle>
                    <DialogDescription>
                      建立並發送系統通知給指定用戶
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>通知類型</Label>
                        <Select
                          value={newNotification.type}
                          onValueChange={(value) => setNewNotification({ ...newNotification, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>發送對象</Label>
                        <Select
                          value={newNotification.targetScope}
                          onValueChange={(value) => setNewNotification({ ...newNotification, targetScope: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TARGET_SCOPES).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {newNotification.targetScope === "specific" && (
                      <div>
                        <Label>選擇診所</Label>
                        <Select
                          onValueChange={(value) => {
                            const orgId = parseInt(value);
                            if (!newNotification.targetOrganizations.includes(orgId)) {
                              setNewNotification({
                                ...newNotification,
                                targetOrganizations: [...newNotification.targetOrganizations, orgId],
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選擇診所..." />
                          </SelectTrigger>
                          <SelectContent>
                            {((organizations as any)?.organizations || []).map((org: Record<string, any>) => (
                              <SelectItem key={org.id} value={org.id.toString()}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newNotification.targetOrganizations.map((orgId) => {
                            const org = ((organizations as any)?.organizations || []).find((o: Record<string, any>) => o.id === orgId);
                            return (
                              <Badge key={orgId} variant="secondary" className="gap-1">
                                {org?.name || orgId}
                                <button
                                  onClick={() => setNewNotification({
                                    ...newNotification,
                                    targetOrganizations: newNotification.targetOrganizations.filter(id => id !== orgId),
                                  })}
                                  className="ml-1 hover:text-destructive"
                                >
                                  ×
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>標題</Label>
                      <Input
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                        placeholder="輸入通知標題..."
                      />
                    </div>

                    <div>
                      <Label>內容</Label>
                      <Textarea
                        value={newNotification.content}
                        onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value })}
                        placeholder="輸入通知內容..."
                        rows={5}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>LINE 推送</span>
                        </div>
                        <Switch
                          checked={newNotification.sendLine}
                          onCheckedChange={(checked) => setNewNotification({ ...newNotification, sendLine: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>Email 通知</span>
                        </div>
                        <Switch
                          checked={newNotification.sendEmail}
                          onCheckedChange={(checked) => setNewNotification({ ...newNotification, sendEmail: checked })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>排程發送（選填）</Label>
                      <Input
                        type="datetime-local"
                        value={newNotification.scheduledAt}
                        onChange={(e) => setNewNotification({ ...newNotification, scheduledAt: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        留空則立即發送
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleSend} disabled={sendNotificationMutation.isPending}>
                      <Send className="h-4 w-4 mr-2" />
                      {sendNotificationMutation.isPending ? "發送中..." : "發送通知"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          }
        />

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="本月發送"
            value={stats?.sentThisMonth || 0}
            description="通知總數"
            icon={Send}
          />
          <StatCard
            title="送達率"
            value={`${stats?.deliveryRate || 98}%`}
            description="成功送達"
            icon={CheckCircle}
          />
          <StatCard
            title="LINE 推送"
            value={stats?.lineSent || 0}
            description="本月 LINE 通知"
            icon={MessageSquare}
          />
          <StatCard
            title="待發送"
            value={stats?.scheduled || 0}
            description="排程中的通知"
            icon={Clock}
          />
        </div>

        {/* 通知歷史 */}
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList>
            <TabsTrigger value="history">發送歷史</TabsTrigger>
            <TabsTrigger value="templates">通知模板</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>通知發送歷史</CardTitle>
                <CardDescription>
                  查看所有已發送的系統通知
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>時間</TableHead>
                      <TableHead>類型</TableHead>
                      <TableHead>標題</TableHead>
                      <TableHead>對象</TableHead>
                      <TableHead>管道</TableHead>
                      <TableHead>狀態</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(notifications?.notifications || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          暫無通知記錄
                        </TableCell>
                      </TableRow>
                    ) : (
                      (notifications?.notifications || []).map((notification: Record<string, any>) => {
                        const typeConfig = NOTIFICATION_TYPES[notification.type as keyof typeof NOTIFICATION_TYPES] || NOTIFICATION_TYPES.announcement;
                        return (
                          <TableRow key={notification.id}>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(notification.createdAt).toLocaleString("zh-TW")}
                            </TableCell>
                            <TableCell>
                              <Badge className={typeConfig.color}>
                                {typeConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium max-w-xs truncate">
                              {notification.title}
                            </TableCell>
                            <TableCell>
                              {notification.targetScope === "all" ? "所有用戶" :
                               notification.targetScope === "admins" ? "診所管理員" :
                               `${notification.targetCount || 0} 間診所`}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {notification.sendLine && (
                                  <Badge variant="outline" className="text-xs">LINE</Badge>
                                )}
                                {notification.sendEmail && (
                                  <Badge variant="outline" className="text-xs">Email</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {notification.status === "sent" ? (
                                <Badge className="bg-green-500">已發送</Badge>
                              ) : notification.status === "scheduled" ? (
                                <Badge className="bg-yellow-500">排程中</Badge>
                              ) : (
                                <Badge className="bg-red-500">失敗</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>通知模板</CardTitle>
                <CardDescription>
                  預設的通知模板，可快速套用
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(templates?.templates || [
                    { id: 1, title: "系統維護通知", content: "親愛的用戶，系統將於 {date} 進行維護...", type: "maintenance" },
                    { id: 2, title: "新功能上線", content: "我們很高興地宣布，{feature} 功能已正式上線！", type: "feature" },
                    { id: 3, title: "重要公告", content: "親愛的用戶，{content}", type: "announcement" },
                  ]).map((template: Record<string, any>) => {
                    const typeConfig = NOTIFICATION_TYPES[template.type as keyof typeof NOTIFICATION_TYPES] || NOTIFICATION_TYPES.announcement;
                    return (
                      <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge className={typeConfig.color} variant="secondary">
                              {typeConfig.label}
                            </Badge>
                          </div>
                          <CardTitle className="text-base">{template.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.content}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full"
                            onClick={() => handleUseTemplate(template)}
                          >
                            套用模板
                          </Button>
                        </CardContent>
                      </Card>
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
