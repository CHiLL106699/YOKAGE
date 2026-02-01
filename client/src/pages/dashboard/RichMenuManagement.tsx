import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Users, BarChart3, Upload } from "lucide-react";
import RichMenuEditor from "@/components/RichMenuEditor";

export default function RichMenuManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editorAreas, setEditorAreas] = useState<any[]>([]);
  const [editorImageUrl, setEditorImageUrl] = useState<string>("");

  // 查詢 Rich Menu 模板列表
  const { data: templates = [], refetch: refetchTemplates } = trpc.richMenu.list.useQuery({
    organizationId: 1, // TODO: 從 context 取得當前診所 ID
  });

  // 統計資料（從模板列表計算）
  const stats = {
    totalTemplates: templates?.length || 0,
    activeTemplates: templates?.filter(t => t.isActive).length || 0,
    abTestTemplates: 0, // TODO: 實作 A/B 測試功能
  };

  // 建立 Rich Menu 模板
  const createMutation = trpc.richMenu.create.useMutation({
    onSuccess: () => {
      toast({ title: "Rich Menu 模板建立成功" });
      refetchTemplates();
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "建立失敗", description: error.message, variant: "destructive" });
    },
  });

  // 刪除 Rich Menu 模板
  const deleteMutation = trpc.richMenu.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Rich Menu 模板已刪除" });
      refetchTemplates();
    },
    onError: (error) => {
      toast({ title: "刪除失敗", description: error.message, variant: "destructive" });
    },
  });

  // 處理建立表單提交
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      organizationId: 1,
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      imageBase64: formData.get("imageUrl") as string, // TODO: 實作圖片上傳至 S3 再轉成 Base64
      chatBarText: formData.get("chatBarText") as string,
      areas: editorAreas
    });
  };

  // 處理刪除
  const handleDelete = (id: number) => {
    if (confirm("確定要刪除此 Rich Menu 模板嗎？")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rich Menu 管理</h1>
          <p className="text-muted-foreground">管理 LINE Rich Menu 模板與分配設定</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新增模板
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>新增 Rich Menu 模板</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">模板名稱</Label>
                <Input id="name" name="name" placeholder="例如：新客歡迎模板" required />
              </div>
              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea id="description" name="description" placeholder="模板用途說明" />
              </div>
              <div>
                <Label htmlFor="chatBarText">聊天列文字</Label>
                <Input id="chatBarText" name="chatBarText" placeholder="點擊查看選單" required />
              </div>
              <div>
                <Label>Rich Menu 視覺化編輯器</Label>
                <RichMenuEditor
                  onAreasChange={setEditorAreas}
                  onImageChange={setEditorImageUrl}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "建立中..." : "建立"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總模板數</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTemplates || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">啟用中模板</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeTemplates || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總點擊次數</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* 模板列表 */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">全部模板</TabsTrigger>
          <TabsTrigger value="active">啟用中</TabsTrigger>
          <TabsTrigger value="inactive">未啟用</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 mt-4">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">尚無 Rich Menu 模板</p>
                <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  新增第一個模板
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template: any) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "啟用中" : "未啟用"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 預覽圖片 */}
                    {template.imageUrl && (
                      <img
                        src={template.imageUrl}
                        alt={template.name}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                    
                    {/* 統計資訊 */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">使用人數</p>
                        <p className="font-semibold">{template._count?.assignments || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">點擊次數</p>
                        <p className="font-semibold">{template.clickCount || 0}</p>
                      </div>
                    </div>

                    {/* 操作按鈕 */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        預覽
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
