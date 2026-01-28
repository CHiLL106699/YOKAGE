import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, Star, Plus, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

/**
 * LINE 圖文選單管理頁面
 * 功能：列表、建立、編輯、刪除、設定預設、統計儀表板
 */

export default function LineRichMenuManagementPage() {
  const [organizationId] = useState(60001); // 測試診所 ID
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 查詢圖文選單列表
  const { data: menus, refetch: refetchMenus } = trpc.lineRichMenu.listRichMenus.useQuery({
    organizationId,
  });

  // 查詢統計資料
  const { data: stats } = trpc.lineRichMenu.getRichMenuStats.useQuery({
    organizationId,
  });

  // 刪除圖文選單
  const deleteMenu = trpc.lineRichMenu.deleteRichMenu.useMutation({
    onSuccess: () => {
      toast.success('圖文選單已刪除');
      refetchMenus();
    },
    onError: (error) => {
      toast.error(`刪除失敗：${error.message}`);
    },
  });

  // 設定預設圖文選單
  const setDefault = trpc.lineRichMenu.setDefaultRichMenu.useMutation({
    onSuccess: () => {
      toast.success('已設定為預設圖文選單');
      refetchMenus();
    },
    onError: (error) => {
      toast.error(`設定失敗：${error.message}`);
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">LINE 圖文選單管理</h1>
          <p className="text-muted-foreground mt-2">管理診所的 LINE 圖文選單，提升客戶互動體驗</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              建立圖文選單
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>建立 LINE 圖文選單</DialogTitle>
              <DialogDescription>
                上傳圖片並配置按鈕區域，打造專屬的 LINE 圖文選單
              </DialogDescription>
            </DialogHeader>
            <CreateRichMenuForm
              organizationId={organizationId}
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                refetchMenus();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 統計儀表板 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">總圖文選單數</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMenus}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">啟用中</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeMenus}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">預設選單</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold truncate">{stats.defaultMenuName}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">總點擊次數</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalClicks}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 圖文選單列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus?.map((menu) => (
          <Card key={menu.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {menu.name}
                    {menu.isDefault && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}
                  </CardTitle>
                  <CardDescription>{menu.chatBarText}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {!menu.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDefault.mutate({ id: menu.id, organizationId })}
                      disabled={setDefault.isPending}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMenu.mutate({ id: menu.id })}
                    disabled={deleteMenu.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md overflow-hidden mb-4">
                <img
                  src={menu.imageUrl}
                  alt={menu.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>{menu.clickCount} 次點擊</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  menu.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {menu.isActive ? '啟用中' : '已停用'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {menus?.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">尚未建立任何圖文選單</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              建立第一個圖文選單
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * 建立圖文選單表單
 */
function CreateRichMenuForm({
  organizationId,
  onSuccess,
}: {
  organizationId: number;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    chatBarText: '',
    imageUrl: '',
  });

  const createMenu = trpc.lineRichMenu.createRichMenu.useMutation({
    onSuccess: () => {
      toast.success('圖文選單已建立');
      onSuccess();
    },
    onError: (error) => {
      toast.error(`建立失敗：${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 使用夢幻夜空風格的預設配置
    createMenu.mutate({
      organizationId,
      name: formData.name,
      chatBarText: formData.chatBarText,
      imageUrl: formData.imageUrl || '/upload/image(8).png', // 預設使用夢幻夜空素材
      size: { width: 2500, height: 1686 },
      areas: [
        {
          bounds: { x: 0, y: 0, width: 833, height: 843 },
          action: { type: 'uri', uri: 'https://liff.line.me/appointment' },
        },
        {
          bounds: { x: 833, y: 0, width: 834, height: 843 },
          action: { type: 'uri', uri: 'https://liff.line.me/appointment/query' },
        },
        {
          bounds: { x: 1667, y: 0, width: 833, height: 843 },
          action: { type: 'uri', uri: 'https://liff.line.me/member' },
        },
        {
          bounds: { x: 0, y: 843, width: 833, height: 843 },
          action: { type: 'uri', uri: 'https://liff.line.me/promotions' },
        },
        {
          bounds: { x: 833, y: 843, width: 834, height: 843 },
          action: { type: 'uri', uri: 'https://liff.line.me/games' },
        },
        {
          bounds: { x: 1667, y: 843, width: 833, height: 843 },
          action: { type: 'message', text: '我需要客服協助' },
        },
      ],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">圖文選單名稱</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="例如：夢幻夜空風格圖文選單"
          required
        />
      </div>
      <div>
        <Label htmlFor="chatBarText">選單列文字（最多 14 字元）</Label>
        <Input
          id="chatBarText"
          value={formData.chatBarText}
          onChange={(e) => setFormData({ ...formData, chatBarText: e.target.value })}
          placeholder="例如：查看選單"
          maxLength={14}
          required
        />
      </div>
      <div>
        <Label htmlFor="imageUrl">圖片 URL（選填，預設使用夢幻夜空素材）</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://example.com/richmenu.png"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={createMenu.isPending}>
          {createMenu.isPending ? '建立中...' : '建立圖文選單'}
        </Button>
      </div>
    </form>
  );
}
