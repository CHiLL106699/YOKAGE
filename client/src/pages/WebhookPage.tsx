import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Webhook, 
  Plus, 
  Edit2, 
  Trash2, 
  Play,
  Pause,
  RefreshCw,
  MessageSquare,
  Image,
  Video,
  MapPin,
  Sticker,
  FileText,
  UserPlus,
  UserMinus,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Code,
  Zap,
  Settings,
  Activity
} from "lucide-react";

// 模擬 Webhook 事件處理規則
const mockWebhookRules = [
  {
    id: "rule-001",
    name: "預約關鍵字回覆",
    eventType: "message",
    messageType: "text",
    trigger: {
      type: "keyword",
      keywords: ["預約", "我要預約", "想預約"]
    },
    action: {
      type: "flex_message",
      templateId: "tpl-001",
      fallbackText: "請點擊下方連結進行預約"
    },
    isActive: true,
    triggerCount: 1256,
    lastTriggered: "2024-01-15 14:32:15"
  },
  {
    id: "rule-002",
    name: "營業時間查詢",
    eventType: "message",
    messageType: "text",
    trigger: {
      type: "keyword",
      keywords: ["營業時間", "幾點開", "幾點關"]
    },
    action: {
      type: "text",
      content: "我們的營業時間為：\n週一至週五 10:00-21:00\n週六 10:00-18:00\n週日公休\n\n如需預約請點擊選單中的「立即預約」"
    },
    isActive: true,
    triggerCount: 523,
    lastTriggered: "2024-01-15 11:20:45"
  },
  {
    id: "rule-003",
    name: "新好友歡迎訊息",
    eventType: "follow",
    messageType: null,
    trigger: {
      type: "event"
    },
    action: {
      type: "flex_message",
      templateId: "welcome-001",
      fallbackText: "歡迎加入 YOChiLL 醫美診所！"
    },
    isActive: true,
    triggerCount: 89,
    lastTriggered: "2024-01-15 09:15:30"
  },
  {
    id: "rule-004",
    name: "位置分享回覆",
    eventType: "message",
    messageType: "location",
    trigger: {
      type: "event"
    },
    action: {
      type: "text",
      content: "感謝您分享位置！\n\n我們的診所地址：\n台北市大安區忠孝東路四段123號5樓\n\n距離您約 {{distance}} 公里\n預計車程 {{duration}} 分鐘"
    },
    isActive: true,
    triggerCount: 45,
    lastTriggered: "2024-01-14 16:45:00"
  },
  {
    id: "rule-005",
    name: "圖片訊息自動回覆",
    eventType: "message",
    messageType: "image",
    trigger: {
      type: "event"
    },
    action: {
      type: "text",
      content: "感謝您傳送圖片！我們的客服人員會盡快為您回覆。\n\n如需緊急諮詢，請撥打客服專線：02-1234-5678"
    },
    isActive: false,
    triggerCount: 128,
    lastTriggered: "2024-01-13 15:30:00"
  }
];

// 模擬 Webhook 事件日誌
const mockEventLogs = [
  {
    id: "log-001",
    timestamp: "2024-01-15 14:32:15",
    eventType: "message",
    userId: "U1234567890abcdef",
    userName: "王小明",
    content: "我想預約",
    ruleMatched: "rule-001",
    status: "success",
    responseTime: 125
  },
  {
    id: "log-002",
    timestamp: "2024-01-15 14:30:45",
    eventType: "message",
    userId: "U9876543210fedcba",
    userName: "李小華",
    content: "請問營業時間？",
    ruleMatched: "rule-002",
    status: "success",
    responseTime: 89
  },
  {
    id: "log-003",
    timestamp: "2024-01-15 14:28:30",
    eventType: "follow",
    userId: "Uabcdef1234567890",
    userName: "新用戶",
    content: null,
    ruleMatched: "rule-003",
    status: "success",
    responseTime: 156
  },
  {
    id: "log-004",
    timestamp: "2024-01-15 14:25:00",
    eventType: "message",
    userId: "U5555555555555555",
    userName: "陳大文",
    content: "[圖片]",
    ruleMatched: null,
    status: "no_match",
    responseTime: 0
  },
  {
    id: "log-005",
    timestamp: "2024-01-15 14:20:15",
    eventType: "message",
    userId: "U1234567890abcdef",
    userName: "王小明",
    content: "你好",
    ruleMatched: null,
    status: "no_match",
    responseTime: 0
  }
];

const eventTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  message: { label: "訊息", icon: <MessageSquare className="w-4 h-4" />, color: "bg-blue-100 text-blue-800" },
  follow: { label: "加好友", icon: <UserPlus className="w-4 h-4" />, color: "bg-green-100 text-green-800" },
  unfollow: { label: "封鎖", icon: <UserMinus className="w-4 h-4" />, color: "bg-red-100 text-red-800" },
  postback: { label: "Postback", icon: <Zap className="w-4 h-4" />, color: "bg-purple-100 text-purple-800" }
};

const messageTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  text: { label: "文字", icon: <MessageSquare className="w-4 h-4" /> },
  image: { label: "圖片", icon: <Image className="w-4 h-4" /> },
  video: { label: "影片", icon: <Video className="w-4 h-4" /> },
  location: { label: "位置", icon: <MapPin className="w-4 h-4" /> },
  sticker: { label: "貼圖", icon: <Sticker className="w-4 h-4" /> },
  file: { label: "檔案", icon: <FileText className="w-4 h-4" /> }
};

const statusLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  success: { label: "成功", icon: <CheckCircle className="w-4 h-4" />, color: "text-green-600" },
  no_match: { label: "無匹配", icon: <AlertCircle className="w-4 h-4" />, color: "text-yellow-600" },
  error: { label: "錯誤", icon: <XCircle className="w-4 h-4" />, color: "text-red-600" }
};

export default function WebhookPage() {
  const [rules, setRules] = useState(mockWebhookRules);
  const [logs, setLogs] = useState(mockEventLogs);
  const [selectedRule, setSelectedRule] = useState<typeof mockWebhookRules[0] | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("rules");

  // 編輯表單狀態
  const [editForm, setEditForm] = useState({
    name: "",
    eventType: "message",
    messageType: "text",
    triggerType: "keyword",
    keywords: "",
    actionType: "text",
    actionContent: "",
    templateId: ""
  });

  // Webhook URL
  const webhookUrl = "https://yochill-saas.manus.space/api/webhook/line";

  const handleCreateRule = () => {
    setEditForm({
      name: "",
      eventType: "message",
      messageType: "text",
      triggerType: "keyword",
      keywords: "",
      actionType: "text",
      actionContent: "",
      templateId: ""
    });
    setSelectedRule(null);
    setShowEditDialog(true);
  };

  const handleEditRule = (rule: typeof mockWebhookRules[0]) => {
    setEditForm({
      name: rule.name,
      eventType: rule.eventType,
      messageType: rule.messageType || "text",
      triggerType: rule.trigger.type,
      keywords: rule.trigger.type === "keyword" ? (rule.trigger as any).keywords?.join(", ") || "" : "",
      actionType: rule.action.type,
      actionContent: rule.action.type === "text" ? (rule.action as any).content || "" : "",
      templateId: rule.action.type === "flex_message" ? (rule.action as any).templateId || "" : ""
    });
    setSelectedRule(rule);
    setShowEditDialog(true);
  };

  const handleSaveRule = () => {
    if (!editForm.name) {
      toast.error("請輸入規則名稱");
      return;
    }

    toast.success(selectedRule ? "規則已更新" : "規則已建立");
    setShowEditDialog(false);
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(rules.map(r => 
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r
    ));
    toast.success("規則狀態已更新");
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(r => r.id !== ruleId));
    toast.success("規則已刪除");
  };

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL 已複製");
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Webhook 事件處理</h1>
          <p className="text-muted-foreground mt-2">管理 LINE Webhook 事件的自動回覆規則</p>
        </div>
        <Button onClick={handleCreateRule}>
          <Plus className="w-4 h-4 mr-2" />
          新增規則
        </Button>
      </div>

      {/* Webhook URL 設定 */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            Webhook 設定
          </CardTitle>
          <CardDescription>
            將此 URL 設定到 LINE Developers Console 的 Webhook URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              value={webhookUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button variant="outline" onClick={handleCopyWebhookUrl}>
              複製
            </Button>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              驗證連線
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>連線狀態：正常</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>最後接收：2024-01-15 14:32:15</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="w-4 h-4" />
              <span>今日事件：1,256 次</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分頁 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="rules">處理規則</TabsTrigger>
          <TabsTrigger value="logs">事件日誌</TabsTrigger>
        </TabsList>

        {/* 規則列表 */}
        <TabsContent value="rules">
          <div className="grid gap-4">
            {rules.map(rule => (
              <Card key={rule.id} className={rule.isActive ? "" : "opacity-60"}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Switch 
                        checked={rule.isActive}
                        onCheckedChange={() => handleToggleRule(rule.id)}
                      />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {rule.name}
                          <Badge className={eventTypeLabels[rule.eventType]?.color}>
                            {eventTypeLabels[rule.eventType]?.icon}
                            <span className="ml-1">{eventTypeLabels[rule.eventType]?.label}</span>
                          </Badge>
                          {rule.messageType && (
                            <Badge variant="outline">
                              {messageTypeLabels[rule.messageType]?.icon}
                              <span className="ml-1">{messageTypeLabels[rule.messageType]?.label}</span>
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {rule.trigger.type === "keyword" && (
                            <span>關鍵字：{(rule.trigger as any).keywords?.join(", ")}</span>
                          )}
                          {rule.trigger.type === "event" && (
                            <span>事件觸發</span>
                          )}
                          <span className="mx-2">→</span>
                          {rule.action.type === "text" && <span>回覆文字訊息</span>}
                          {rule.action.type === "flex_message" && <span>回覆 Flex Message</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="text-muted-foreground">觸發 {rule.triggerCount.toLocaleString()} 次</div>
                        <div className="text-xs text-muted-foreground">
                          最後觸發：{rule.lastTriggered}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditRule(rule)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 事件日誌 */}
        <TabsContent value="logs">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">即時事件日誌</CardTitle>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新整理
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {logs.map(log => (
                    <div 
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={statusLabels[log.status]?.color}>
                          {statusLabels[log.status]?.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={eventTypeLabels[log.eventType]?.color} variant="outline">
                              {eventTypeLabels[log.eventType]?.label}
                            </Badge>
                            <span className="font-medium">{log.userName}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {log.content || "(無內容)"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-muted-foreground">{log.timestamp}</div>
                        {log.ruleMatched && (
                          <div className="text-xs text-green-600">
                            匹配規則：{rules.find(r => r.id === log.ruleMatched)?.name}
                          </div>
                        )}
                        {log.responseTime > 0 && (
                          <div className="text-xs text-muted-foreground">
                            回應時間：{log.responseTime}ms
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 編輯 Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRule ? "編輯規則" : "新增規則"}</DialogTitle>
            <DialogDescription>
              設定 Webhook 事件的自動處理規則
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>規則名稱</Label>
              <Input 
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="例如：預約關鍵字回覆"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>事件類型</Label>
                <Select 
                  value={editForm.eventType}
                  onValueChange={(value) => setEditForm({ ...editForm, eventType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">訊息事件</SelectItem>
                    <SelectItem value="follow">加好友事件</SelectItem>
                    <SelectItem value="unfollow">封鎖事件</SelectItem>
                    <SelectItem value="postback">Postback 事件</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editForm.eventType === "message" && (
                <div className="space-y-2">
                  <Label>訊息類型</Label>
                  <Select 
                    value={editForm.messageType}
                    onValueChange={(value) => setEditForm({ ...editForm, messageType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">文字訊息</SelectItem>
                      <SelectItem value="image">圖片訊息</SelectItem>
                      <SelectItem value="video">影片訊息</SelectItem>
                      <SelectItem value="location">位置訊息</SelectItem>
                      <SelectItem value="sticker">貼圖訊息</SelectItem>
                      <SelectItem value="file">檔案訊息</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* 觸發條件 */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">觸發條件</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {editForm.eventType === "message" && editForm.messageType === "text" && (
                  <>
                    <div className="space-y-2">
                      <Label>觸發方式</Label>
                      <Select 
                        value={editForm.triggerType}
                        onValueChange={(value) => setEditForm({ ...editForm, triggerType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="keyword">關鍵字匹配</SelectItem>
                          <SelectItem value="regex">正則表達式</SelectItem>
                          <SelectItem value="all">所有訊息</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {editForm.triggerType === "keyword" && (
                      <div className="space-y-2">
                        <Label>關鍵字（以逗號分隔）</Label>
                        <Input 
                          value={editForm.keywords}
                          onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value })}
                          placeholder="預約, 我要預約, 想預約"
                        />
                      </div>
                    )}
                  </>
                )}
                {(editForm.eventType !== "message" || editForm.messageType !== "text") && (
                  <div className="text-sm text-muted-foreground">
                    此事件類型將在發生時自動觸發
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 回應動作 */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">回應動作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>回應類型</Label>
                  <Select 
                    value={editForm.actionType}
                    onValueChange={(value) => setEditForm({ ...editForm, actionType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">文字訊息</SelectItem>
                      <SelectItem value="flex_message">Flex Message</SelectItem>
                      <SelectItem value="image">圖片訊息</SelectItem>
                      <SelectItem value="template">按鈕模板</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editForm.actionType === "text" && (
                  <div className="space-y-2">
                    <Label>回覆內容</Label>
                    <Textarea 
                      value={editForm.actionContent}
                      onChange={(e) => setEditForm({ ...editForm, actionContent: e.target.value })}
                      placeholder="輸入回覆的文字內容..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      可使用變數：{"{{user_name}}"}, {"{{timestamp}}"} 等
                    </p>
                  </div>
                )}

                {editForm.actionType === "flex_message" && (
                  <div className="space-y-2">
                    <Label>選擇 Flex Message 模板</Label>
                    <Select 
                      value={editForm.templateId}
                      onValueChange={(value) => setEditForm({ ...editForm, templateId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇模板" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tpl-001">預約確認通知</SelectItem>
                        <SelectItem value="tpl-002">療程提醒</SelectItem>
                        <SelectItem value="tpl-003">優惠推播</SelectItem>
                        <SelectItem value="welcome-001">歡迎訊息</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveRule}>
              {selectedRule ? "儲存變更" : "建立規則"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
