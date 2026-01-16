import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  MessageSquare, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy,
  Eye,
  Send,
  Calendar,
  Clock,
  Gift,
  Bell,
  CheckCircle,
  Star,
  Smartphone,
  Image,
  Type,
  Square,
  Palette
} from "lucide-react";

// 模擬 Flex Message 模板
const mockTemplates = [
  {
    id: "tpl-001",
    name: "預約確認通知",
    type: "appointment_confirm",
    category: "預約",
    isActive: true,
    usageCount: 856,
    lastUsed: "2024-01-15 14:30",
    preview: {
      header: {
        backgroundColor: "#00B900",
        title: "預約確認",
        subtitle: "您的預約已成功"
      },
      body: {
        customerName: "{{customer_name}}",
        serviceName: "{{service_name}}",
        appointmentDate: "{{date}}",
        appointmentTime: "{{time}}",
        doctorName: "{{doctor_name}}",
        notes: "請提前 10 分鐘到達"
      },
      footer: {
        primaryButton: { label: "查看詳情", action: "uri", data: "/liff/appointment/{{id}}" },
        secondaryButton: { label: "取消預約", action: "postback", data: "cancel_{{id}}" }
      }
    }
  },
  {
    id: "tpl-002",
    name: "療程提醒",
    type: "treatment_reminder",
    category: "提醒",
    isActive: true,
    usageCount: 423,
    lastUsed: "2024-01-15 09:00",
    preview: {
      header: {
        backgroundColor: "#FF6B6B",
        title: "療程提醒",
        subtitle: "明天有預約療程"
      },
      body: {
        customerName: "{{customer_name}}",
        serviceName: "{{service_name}}",
        appointmentDate: "{{date}}",
        appointmentTime: "{{time}}",
        location: "{{clinic_address}}",
        notes: "請記得攜帶身分證件"
      },
      footer: {
        primaryButton: { label: "確認出席", action: "postback", data: "confirm_{{id}}" },
        secondaryButton: { label: "改期", action: "uri", data: "/liff/reschedule/{{id}}" }
      }
    }
  },
  {
    id: "tpl-003",
    name: "優惠推播",
    type: "promotion",
    category: "行銷",
    isActive: true,
    usageCount: 1250,
    lastUsed: "2024-01-14 18:00",
    preview: {
      header: {
        backgroundColor: "#FFD93D",
        title: "限時優惠",
        subtitle: "專屬會員折扣"
      },
      body: {
        promotionTitle: "{{promo_title}}",
        discount: "{{discount}}",
        validUntil: "{{valid_until}}",
        description: "{{description}}",
        terms: "{{terms}}"
      },
      footer: {
        primaryButton: { label: "立即預約", action: "uri", data: "/liff/booking?promo={{code}}" },
        secondaryButton: { label: "了解更多", action: "uri", data: "/promotions/{{id}}" }
      }
    }
  },
  {
    id: "tpl-004",
    name: "術後關懷",
    type: "aftercare",
    category: "關懷",
    isActive: true,
    usageCount: 312,
    lastUsed: "2024-01-15 10:00",
    preview: {
      header: {
        backgroundColor: "#4ECDC4",
        title: "術後關懷",
        subtitle: "感謝您的信任"
      },
      body: {
        customerName: "{{customer_name}}",
        treatmentName: "{{treatment_name}}",
        treatmentDate: "{{date}}",
        careInstructions: "{{instructions}}",
        emergencyContact: "{{emergency_phone}}"
      },
      footer: {
        primaryButton: { label: "回報狀況", action: "uri", data: "/liff/aftercare/{{id}}" },
        secondaryButton: { label: "聯絡客服", action: "message", data: "我需要術後諮詢" }
      }
    }
  },
  {
    id: "tpl-005",
    name: "生日祝福",
    type: "birthday",
    category: "關懷",
    isActive: true,
    usageCount: 89,
    lastUsed: "2024-01-15 00:00",
    preview: {
      header: {
        backgroundColor: "#FF69B4",
        title: "生日快樂 🎂",
        subtitle: "專屬生日禮遇"
      },
      body: {
        customerName: "{{customer_name}}",
        giftDescription: "{{gift_description}}",
        giftCode: "{{gift_code}}",
        validUntil: "{{valid_until}}"
      },
      footer: {
        primaryButton: { label: "領取禮物", action: "uri", data: "/liff/birthday-gift/{{code}}" },
        secondaryButton: null
      }
    }
  }
];

const categoryColors: Record<string, string> = {
  "預約": "bg-blue-100 text-blue-800",
  "提醒": "bg-orange-100 text-orange-800",
  "行銷": "bg-yellow-100 text-yellow-800",
  "關懷": "bg-green-100 text-green-800"
};

export default function FlexMessagePage() {
  const [templates, setTemplates] = useState(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof mockTemplates[0] | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  // 編輯表單狀態
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    category: "預約",
    headerColor: "#00B900",
    headerTitle: "",
    headerSubtitle: "",
    bodyFields: [] as { key: string; label: string }[],
    primaryButtonLabel: "",
    primaryButtonAction: "uri",
    primaryButtonData: "",
    secondaryButtonLabel: "",
    secondaryButtonAction: "uri",
    secondaryButtonData: ""
  });

  // 測試發送表單
  const [testForm, setTestForm] = useState({
    phoneNumber: "",
    variables: {} as Record<string, string>
  });

  const handleCreateTemplate = () => {
    setEditForm({
      name: "",
      type: "",
      category: "預約",
      headerColor: "#00B900",
      headerTitle: "",
      headerSubtitle: "",
      bodyFields: [
        { key: "field1", label: "欄位 1" },
        { key: "field2", label: "欄位 2" }
      ],
      primaryButtonLabel: "主要按鈕",
      primaryButtonAction: "uri",
      primaryButtonData: "",
      secondaryButtonLabel: "次要按鈕",
      secondaryButtonAction: "uri",
      secondaryButtonData: ""
    });
    setSelectedTemplate(null);
    setShowEditDialog(true);
  };

  const handleEditTemplate = (template: typeof mockTemplates[0]) => {
    setEditForm({
      name: template.name,
      type: template.type,
      category: template.category,
      headerColor: template.preview.header.backgroundColor,
      headerTitle: template.preview.header.title,
      headerSubtitle: template.preview.header.subtitle,
      bodyFields: Object.entries(template.preview.body).map(([key, value]) => ({
        key,
        label: key
      })),
      primaryButtonLabel: template.preview.footer.primaryButton?.label || "",
      primaryButtonAction: template.preview.footer.primaryButton?.action || "uri",
      primaryButtonData: template.preview.footer.primaryButton?.data || "",
      secondaryButtonLabel: template.preview.footer.secondaryButton?.label || "",
      secondaryButtonAction: template.preview.footer.secondaryButton?.action || "uri",
      secondaryButtonData: template.preview.footer.secondaryButton?.data || ""
    });
    setSelectedTemplate(template);
    setShowEditDialog(true);
  };

  const handleSaveTemplate = () => {
    if (!editForm.name || !editForm.headerTitle) {
      toast.error("請填寫必要欄位");
      return;
    }

    toast.success(selectedTemplate ? "模板已更新" : "模板已建立");
    setShowEditDialog(false);
  };

  const handleTestSend = () => {
    if (!testForm.phoneNumber) {
      toast.error("請輸入測試手機號碼");
      return;
    }

    toast.success("測試訊息已發送", {
      description: `已發送至 ${testForm.phoneNumber}`
    });
    setShowTestDialog(false);
  };

  const filteredTemplates = activeCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Flex Message 模板</h1>
          <p className="text-muted-foreground mt-2">管理 LINE 精美卡片訊息模板</p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="w-4 h-4 mr-2" />
          新增模板
        </Button>
      </div>

      {/* 分類篩選 */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="預約">預約</TabsTrigger>
          <TabsTrigger value="提醒">提醒</TabsTrigger>
          <TabsTrigger value="行銷">行銷</TabsTrigger>
          <TabsTrigger value="關懷">關懷</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 模板列表 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map(template => (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="mt-1">
                    使用 {template.usageCount} 次
                  </CardDescription>
                </div>
                <Badge className={categoryColors[template.category]}>
                  {template.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Flex Message 預覽 */}
              <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
                <div 
                  className="p-3 text-white text-center"
                  style={{ backgroundColor: template.preview.header.backgroundColor }}
                >
                  <div className="font-bold">{template.preview.header.title}</div>
                  <div className="text-sm opacity-90">{template.preview.header.subtitle}</div>
                </div>
                <div className="p-3 bg-white text-sm space-y-1">
                  {Object.entries(template.preview.body).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-mono text-xs">{String(value)}</span>
                    </div>
                  ))}
                  {Object.keys(template.preview.body).length > 3 && (
                    <div className="text-muted-foreground text-xs">
                      ...還有 {Object.keys(template.preview.body).length - 3} 個欄位
                    </div>
                  )}
                </div>
                <div className="p-2 bg-gray-50 flex gap-2">
                  {template.preview.footer.primaryButton && (
                    <Button size="sm" className="flex-1 h-8 text-xs">
                      {template.preview.footer.primaryButton.label}
                    </Button>
                  )}
                  {template.preview.footer.secondaryButton && (
                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                      {template.preview.footer.secondaryButton.label}
                    </Button>
                  )}
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowPreviewDialog(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  預覽
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setTestForm({ phoneNumber: "", variables: {} });
                    setShowTestDialog(true);
                  }}
                >
                  <Send className="w-4 h-4 mr-1" />
                  測試
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditTemplate(template)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setTemplates(templates.filter(t => t.id !== template.id));
                    toast.success("模板已刪除");
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 編輯 Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? "編輯模板" : "新增模板"}</DialogTitle>
            <DialogDescription>
              設計 Flex Message 卡片訊息
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            {/* 左側：設定 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>模板名稱</Label>
                  <Input 
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="例如：預約確認通知"
                  />
                </div>
                <div className="space-y-2">
                  <Label>分類</Label>
                  <Select 
                    value={editForm.category}
                    onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="預約">預約</SelectItem>
                      <SelectItem value="提醒">提醒</SelectItem>
                      <SelectItem value="行銷">行銷</SelectItem>
                      <SelectItem value="關懷">關懷</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Header 設定 */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Square className="w-4 h-4" />
                    Header 區塊
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>背景顏色</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color"
                        value={editForm.headerColor}
                        onChange={(e) => setEditForm({ ...editForm, headerColor: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input 
                        value={editForm.headerColor}
                        onChange={(e) => setEditForm({ ...editForm, headerColor: e.target.value })}
                        placeholder="#00B900"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>標題</Label>
                    <Input 
                      value={editForm.headerTitle}
                      onChange={(e) => setEditForm({ ...editForm, headerTitle: e.target.value })}
                      placeholder="預約確認"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>副標題</Label>
                    <Input 
                      value={editForm.headerSubtitle}
                      onChange={(e) => setEditForm({ ...editForm, headerSubtitle: e.target.value })}
                      placeholder="您的預約已成功"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Body 設定 */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Body 區塊
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {editForm.bodyFields.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input 
                        placeholder="欄位名稱"
                        value={field.label}
                        onChange={(e) => {
                          const newFields = [...editForm.bodyFields];
                          newFields[index].label = e.target.value;
                          setEditForm({ ...editForm, bodyFields: newFields });
                        }}
                      />
                      <Input 
                        placeholder="變數 {{variable}}"
                        value={`{{${field.key}}}`}
                        className="font-mono text-sm"
                        readOnly
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          const newFields = editForm.bodyFields.filter((_, i) => i !== index);
                          setEditForm({ ...editForm, bodyFields: newFields });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditForm({
                        ...editForm,
                        bodyFields: [...editForm.bodyFields, { key: `field${editForm.bodyFields.length + 1}`, label: "" }]
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    新增欄位
                  </Button>
                </CardContent>
              </Card>

              {/* Footer 設定 */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Square className="w-4 h-4" />
                    Footer 按鈕
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>主要按鈕</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        placeholder="按鈕文字"
                        value={editForm.primaryButtonLabel}
                        onChange={(e) => setEditForm({ ...editForm, primaryButtonLabel: e.target.value })}
                      />
                      <Select 
                        value={editForm.primaryButtonAction}
                        onValueChange={(value) => setEditForm({ ...editForm, primaryButtonAction: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uri">開啟連結</SelectItem>
                          <SelectItem value="message">發送訊息</SelectItem>
                          <SelectItem value="postback">Postback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input 
                      placeholder="連結或動作資料"
                      value={editForm.primaryButtonData}
                      onChange={(e) => setEditForm({ ...editForm, primaryButtonData: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>次要按鈕</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        placeholder="按鈕文字"
                        value={editForm.secondaryButtonLabel}
                        onChange={(e) => setEditForm({ ...editForm, secondaryButtonLabel: e.target.value })}
                      />
                      <Select 
                        value={editForm.secondaryButtonAction}
                        onValueChange={(value) => setEditForm({ ...editForm, secondaryButtonAction: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uri">開啟連結</SelectItem>
                          <SelectItem value="message">發送訊息</SelectItem>
                          <SelectItem value="postback">Postback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input 
                      placeholder="連結或動作資料"
                      value={editForm.secondaryButtonData}
                      onChange={(e) => setEditForm({ ...editForm, secondaryButtonData: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右側：預覽 */}
            <div>
              <Label className="mb-3 block">即時預覽</Label>
              <div className="bg-gray-900 rounded-[2rem] p-3 max-w-[300px] mx-auto">
                <div className="bg-[#7494A5] rounded-[1.5rem] overflow-hidden">
                  {/* LINE 聊天氣泡 */}
                  <div className="p-4">
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-[250px] ml-auto">
                      {/* Header */}
                      <div 
                        className="p-3 text-white text-center"
                        style={{ backgroundColor: editForm.headerColor }}
                      >
                        <div className="font-bold">{editForm.headerTitle || "標題"}</div>
                        <div className="text-sm opacity-90">{editForm.headerSubtitle || "副標題"}</div>
                      </div>
                      {/* Body */}
                      <div className="p-3 text-sm space-y-2">
                        {editForm.bodyFields.map((field, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-muted-foreground">{field.label || `欄位 ${index + 1}`}</span>
                            <span className="font-mono text-xs text-primary">{`{{${field.key}}}`}</span>
                          </div>
                        ))}
                      </div>
                      {/* Footer */}
                      <div className="p-2 bg-gray-50 flex gap-2">
                        {editForm.primaryButtonLabel && (
                          <Button size="sm" className="flex-1 h-8 text-xs">
                            {editForm.primaryButtonLabel}
                          </Button>
                        )}
                        {editForm.secondaryButtonLabel && (
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                            {editForm.secondaryButtonLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* JSON 預覽 */}
              <div className="mt-4">
                <Label className="mb-2 block">JSON 結構</Label>
                <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto max-h-[200px]">
{JSON.stringify({
  type: "bubble",
  header: {
    type: "box",
    layout: "vertical",
    backgroundColor: editForm.headerColor,
    contents: [
      { type: "text", text: editForm.headerTitle, weight: "bold", color: "#ffffff" },
      { type: "text", text: editForm.headerSubtitle, size: "sm", color: "#ffffff" }
    ]
  },
  body: {
    type: "box",
    layout: "vertical",
    contents: editForm.bodyFields.map(f => ({
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: f.label, flex: 1 },
        { type: "text", text: `{{${f.key}}}`, flex: 1 }
      ]
    }))
  },
  footer: {
    type: "box",
    layout: "horizontal",
    contents: [
      editForm.primaryButtonLabel && {
        type: "button",
        action: { type: editForm.primaryButtonAction, label: editForm.primaryButtonLabel }
      },
      editForm.secondaryButtonLabel && {
        type: "button",
        action: { type: editForm.secondaryButtonAction, label: editForm.secondaryButtonLabel }
      }
    ].filter(Boolean)
  }
}, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveTemplate}>
              {selectedTemplate ? "儲存變更" : "建立模板"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 預覽 Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>訊息預覽</DialogTitle>
            <DialogDescription>{selectedTemplate?.name}</DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="bg-gray-900 rounded-[2rem] p-3">
              <div className="bg-[#7494A5] rounded-[1.5rem] overflow-hidden">
                <div className="p-4">
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                    <div 
                      className="p-4 text-white text-center"
                      style={{ backgroundColor: selectedTemplate.preview.header.backgroundColor }}
                    >
                      <div className="font-bold text-lg">{selectedTemplate.preview.header.title}</div>
                      <div className="text-sm opacity-90">{selectedTemplate.preview.header.subtitle}</div>
                    </div>
                    <div className="p-4 space-y-2">
                      {Object.entries(selectedTemplate.preview.body).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-mono text-xs">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50 flex gap-2">
                      {selectedTemplate.preview.footer.primaryButton && (
                        <Button size="sm" className="flex-1">
                          {selectedTemplate.preview.footer.primaryButton.label}
                        </Button>
                      )}
                      {selectedTemplate.preview.footer.secondaryButton && (
                        <Button size="sm" variant="outline" className="flex-1">
                          {selectedTemplate.preview.footer.secondaryButton.label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 測試發送 Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>測試發送</DialogTitle>
            <DialogDescription>
              發送測試訊息到指定的 LINE 帳號
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>LINE User ID 或手機號碼</Label>
                <Input 
                  placeholder="U1234567890abcdef..."
                  value={testForm.phoneNumber}
                  onChange={(e) => setTestForm({ ...testForm, phoneNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>變數值</Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {Object.keys(selectedTemplate.preview.body).map(key => (
                    <div key={key} className="flex gap-2 items-center">
                      <Label className="w-32 text-sm font-mono">{`{{${key}}}`}</Label>
                      <Input 
                        placeholder={`輸入 ${key} 的值`}
                        value={testForm.variables[key] || ""}
                        onChange={(e) => setTestForm({
                          ...testForm,
                          variables: { ...testForm.variables, [key]: e.target.value }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              取消
            </Button>
            <Button onClick={handleTestSend}>
              <Send className="w-4 h-4 mr-2" />
              發送測試
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
