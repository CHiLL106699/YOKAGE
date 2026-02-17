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
import { toast } from "sonner";
import { 
  Menu, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy,
  Eye,
  Users,
  Star,
  Clock,
  Smartphone,
  Grid3X3,
  Link,
  MessageSquare,
  Calendar,
  ShoppingBag,
  Gift,
  User,
  Settings
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";

// 模擬 Rich Menu 資料

const targetGroupLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new_customer: { label: "新客戶", color: "bg-blue-100 text-blue-800", icon: <Users className="w-3 h-3" /> },
  vip: { label: "VIP 會員", color: "bg-purple-100 text-purple-800", icon: <Star className="w-3 h-3" /> },
  followup: { label: "待回訪", color: "bg-orange-100 text-orange-800", icon: <Clock className="w-3 h-3" /> },
  all: { label: "所有用戶", color: "bg-gray-100 text-gray-800", icon: <Users className="w-3 h-3" /> }
};

const iconComponents: Record<string, React.ReactNode> = {
  Calendar: <Calendar className="w-6 h-6" />,
  Star: <Star className="w-6 h-6" />,
  Gift: <Gift className="w-6 h-6" />,
  MessageSquare: <MessageSquare className="w-6 h-6" />,
  User: <User className="w-6 h-6" />,
  ShoppingBag: <ShoppingBag className="w-6 h-6" />,
  Clock: <Clock className="w-6 h-6" />,
  Settings: <Settings className="w-6 h-6" />,
  Link: <Link className="w-6 h-6" />
};

export default function RichMenuPage() {
  const organizationId = 1; // TODO: from context
  
  const { data: richMenusData, isLoading, error, refetch } = trpc.richMenu.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const createMutation = trpc.richMenu.create.useMutation({
    onSuccess: () => { toast.success("Rich Menu 已建立"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const updateMutation = trpc.richMenu.update.useMutation({
    onSuccess: () => { toast.success("Rich Menu 已更新"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const deleteMutation = trpc.richMenu.delete.useMutation({
    onSuccess: () => { toast.success("Rich Menu 已刪除"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const richMenus = (richMenusData as any)?.data ?? richMenusData ?? [];

  // menus from tRPC query
  const [selectedMenu, setSelectedMenu] = useState<typeof richMenus[0] | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [editingArea, setEditingArea] = useState<number | null>(null);

  // 編輯表單狀態
  const [editForm, setEditForm] = useState({
    name: "",
    targetGroup: "new_customer",
    areas: [] as typeof richMenus[0]["areas"]
  });

  const handleCreateMenu = () => {
    setEditForm({
      name: "",
      targetGroup: "new_customer",
      areas: [
        { id: 1, label: "按鈕 1", action: "uri", data: "", icon: "Link" },
        { id: 2, label: "按鈕 2", action: "uri", data: "", icon: "Link" },
        { id: 3, label: "按鈕 3", action: "uri", data: "", icon: "Link" },
        { id: 4, label: "按鈕 4", action: "uri", data: "", icon: "Link" },
        { id: 5, label: "按鈕 5", action: "uri", data: "", icon: "Link" },
        { id: 6, label: "按鈕 6", action: "uri", data: "", icon: "Link" }
      ]
    });
    setSelectedMenu(null);
    setShowEditDialog(true);
  };

  const handleEditMenu = (menu: typeof richMenus[0]) => {
    setEditForm({
      name: menu.name,
      targetGroup: menu.targetGroup,
      areas: [...menu.areas]
    });
    setSelectedMenu(menu);
    setShowEditDialog(true);
  };

  const handleSaveMenu = () => {
    if (!editForm.name) {
      toast.error("請輸入選單名稱");
      return;
    }

    const formattedAreas = editForm.areas.map((area: any) => ({
      bounds: { x: 0, y: 0, width: 800, height: 400 }, // Default bounds
      action: { 
        type: area.action === 'uri' ? 'uri' : 'message',
        label: area.label,
        uri: area.action === 'uri' ? area.data : undefined,
        text: area.action === 'message' ? area.data : undefined
      }
    }));

    if (selectedMenu) {
      // 更新現有選單
      updateMutation.mutate({
        id: selectedMenu.id,
        name: editForm.name,
        chatBarText: editForm.name.substring(0, 14),
        areas: formattedAreas as any,
      });
    } else {
      // 新增選單
      createMutation.mutate({
        organizationId,
        name: editForm.name,
        chatBarText: editForm.name.substring(0, 14),
        areas: formattedAreas as any,
        imageBase64: "data:image/png;base64,..." // Placeholder
      } as any);
    }

    setShowEditDialog(false);
  };

  const handleToggleActive = (menuId: string | number) => {
    const menu = richMenus.find((m: any) => m.id === menuId);
    if (menu) {
      updateMutation.mutate({
        id: menu.id,
        organizationId,
        isActive: !menu.isActive,
      } as any);
    }
  };

  const handleDeleteMenu = (menuId: string | number) => {
    deleteMutation.mutate({ id: Number(menuId) });
  };

  const handleDuplicateMenu = (menu: any) => {
    createMutation.mutate({
      organizationId,
      name: `${menu.name} (複製)`,
      chatBarText: menu.chatBarText || menu.name.substring(0, 14),
      areas: menu.areas,
      imageBase64: menu.imageBase64 || "data:image/png;base64,..."
    } as any);
  };

  const updateAreaField = (areaId: number | string, field: string, value: string) => {
    setEditForm({
      ...editForm,
      areas: editForm.areas.map((area: any) => 
        area.id === areaId ? { ...area, [field]: value } : area
      )
    });
  };

  if (isLoading) return <QueryLoading variant="skeleton-cards" />;

  if (error) return <QueryError message={error.message} onRetry={refetch} />;


  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Rich Menu 管理</h1>
          <p className="text-muted-foreground mt-2">管理 LINE 圖文選單，依客戶狀態顯示不同選單</p>
        </div>
        <Button onClick={handleCreateMenu}>
          <Plus className="w-4 h-4 mr-2" />
          新增選單
        </Button>
      </div>

      {/* 選單列表 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {richMenus.map((menu: any) => (
          <Card key={menu.id} className={menu.isActive ? "border-primary" : ""}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{menu.name}</CardTitle>
                  <CardDescription className="mt-1">
                    建立於 {menu.createdAt}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={targetGroupLabels[menu.targetGroup]?.color}>
                    {targetGroupLabels[menu.targetGroup]?.icon}
                    <span className="ml-1">{targetGroupLabels[menu.targetGroup]?.label}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 選單預覽 */}
              <div className="bg-muted rounded-lg p-3 mb-4">
                <div className="grid grid-cols-3 gap-2">
                  {((menu as any).areas ?? []).map((area: any) => (
                    <div 
                      key={area.id}
                      className="bg-background rounded p-2 text-center text-xs"
                    >
                      <div className="flex justify-center mb-1 text-muted-foreground">
                        {iconComponents[area.icon]}
                      </div>
                      <span className="line-clamp-1">{area.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 統計資訊 */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>使用次數：{menu.usageCount.toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  <span>啟用狀態</span>
                  <Switch 
                    checked={menu.isActive}
                    onCheckedChange={() => handleToggleActive(menu.id)}
                  />
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedMenu(menu);
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
                  onClick={() => handleEditMenu(menu)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  編輯
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDuplicateMenu(menu)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteMenu(menu.id)}
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
            <DialogTitle>{selectedMenu ? "編輯選單" : "新增選單"}</DialogTitle>
            <DialogDescription>
              設定 Rich Menu 的顯示內容與觸發動作
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            {/* 左側：基本設定 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>選單名稱</Label>
                <Input 
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="例如：新客戶選單"
                />
              </div>

              <div className="space-y-2">
                <Label>目標客群</Label>
                <Select 
                  value={editForm.targetGroup}
                  onValueChange={(value) => setEditForm({ ...editForm, targetGroup: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_customer">新客戶</SelectItem>
                    <SelectItem value="vip">VIP 會員</SelectItem>
                    <SelectItem value="followup">待回訪客戶</SelectItem>
                    <SelectItem value="all">所有用戶</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 按鈕設定 */}
              <div className="space-y-3">
                <Label>按鈕設定</Label>
                {editForm.areas.map((area: any, index: number) => (
                  <Card key={area.id} className={editingArea === area.id ? "border-primary" : ""}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">按鈕 {index + 1}</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingArea(editingArea === area.id ? null : area.id)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {editingArea === area.id ? (
                        <div className="space-y-2">
                          <Input 
                            placeholder="按鈕文字"
                            value={area.label}
                            onChange={(e) => updateAreaField(area.id, "label", e.target.value)}
                          />
                          <Select 
                            value={area.action}
                            onValueChange={(value) => updateAreaField(area.id, "action", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="動作類型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="uri">開啟連結</SelectItem>
                              <SelectItem value="message">發送訊息</SelectItem>
                              <SelectItem value="postback">Postback</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input 
                            placeholder={area.action === "uri" ? "連結網址" : "訊息內容"}
                            value={area.data}
                            onChange={(e) => updateAreaField(area.id, "data", e.target.value)}
                          />
                          <Select 
                            value={area.icon}
                            onValueChange={(value) => updateAreaField(area.id, "icon", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="圖示" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Calendar">日曆</SelectItem>
                              <SelectItem value="Star">星星</SelectItem>
                              <SelectItem value="Gift">禮物</SelectItem>
                              <SelectItem value="MessageSquare">訊息</SelectItem>
                              <SelectItem value="User">用戶</SelectItem>
                              <SelectItem value="ShoppingBag">購物袋</SelectItem>
                              <SelectItem value="Clock">時鐘</SelectItem>
                              <SelectItem value="Settings">設定</SelectItem>
                              <SelectItem value="Link">連結</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          {iconComponents[area.icon]}
                          <span>{area.label}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-muted-foreground truncate">{area.data || "(未設定)"}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 右側：預覽 */}
            <div>
              <Label className="mb-3 block">手機預覽</Label>
              <div className="bg-gray-900 rounded-[2rem] p-3 max-w-[280px] mx-auto">
                <div className="bg-white rounded-[1.5rem] overflow-hidden">
                  {/* 模擬 LINE 聊天視窗 */}
                  <div className="bg-[#00B900] text-white p-3 text-center text-sm font-medium">
                    YOChiLL 醫美診所
                  </div>
                  <div className="h-[200px] bg-gray-50 flex items-center justify-center text-muted-foreground text-sm">
                    聊天訊息區域
                  </div>
                  {/* Rich Menu 預覽 */}
                  <div className="bg-white border-t p-2">
                    <div className="grid grid-cols-3 gap-2">
                      {((editForm.areas as any[]) ?? []).map((area: any, index: number) => (
                        <div 
                          key={area.id}
                          className="bg-gray-100 rounded p-2 text-center"
                        >
                          <div className="flex justify-center mb-1 text-gray-600">
                            {iconComponents[area.icon]}
                          </div>
                          <span className="text-xs line-clamp-1">{area.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveMenu}>
              {selectedMenu ? "儲存變更" : "建立選單"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 預覽 Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>選單預覽</DialogTitle>
            <DialogDescription>{selectedMenu?.name}</DialogDescription>
          </DialogHeader>
          
          {selectedMenu && (
            <div className="bg-gray-900 rounded-[2rem] p-3">
              <div className="bg-white rounded-[1.5rem] overflow-hidden">
                <div className="bg-[#00B900] text-white p-3 text-center text-sm font-medium">
                  YOChiLL 醫美診所
                </div>
                <div className="h-[180px] bg-gray-50 flex items-center justify-center text-muted-foreground text-sm">
                  <Smartphone className="w-8 h-8 opacity-30" />
                </div>
                <div className="bg-white border-t p-2">
                  <div className="grid grid-cols-3 gap-1">
                    {(selectedMenu.areas ?? []).map((area: any) => (
                      <div 
                        key={area.id}
                        className="bg-gray-100 hover:bg-gray-200 rounded p-3 text-center cursor-pointer transition-colors"
                      >
                        <div className="flex justify-center mb-1 text-gray-600">
                          {iconComponents[area.icon]}
                        </div>
                        <span className="text-xs">{area.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
