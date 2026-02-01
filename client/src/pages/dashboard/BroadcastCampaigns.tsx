import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Send, Calendar, Users, BarChart3, Eye } from "lucide-react";

export default function BroadcastCampaigns() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  // 查詢推播活動列表
  const { data: campaigns = [], refetch: refetchCampaigns } = trpc.broadcast.list.useQuery({
    organizationId: 1,
  });

  // 查詢統計資料
  const { data: stats } = trpc.broadcast.getStats.useQuery({
    organizationId: 1,
  });

  // 建立推播活動
  const createMutation = trpc.broadcast.create.useMutation({
    onSuccess: () => {
      toast({ title: "推播活動建立成功" });
      refetchCampaigns();
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "建立失敗", description: error.message, variant: "destructive" });
    },
  });

  // 立即發送推播
    const deleteMutation = trpc.broadcast.delete.useMutation({
    onSuccess: () => {
      toast({ title: "活動已刪除" });
      refetchCampaigns();
    },
    onError: (error: any) => {
      toast({ title: "刪除失敗", description: error.message, variant: "destructive" });
    },
  });

  // 處理建立表單提交
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const targetFilters = {
      tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map(t => t.trim()) : undefined,
      minSpending: formData.get("minSpending") ? Number(formData.get("minSpending")) : undefined,
      maxSpending: formData.get("maxSpending") ? Number(formData.get("maxSpending")) : undefined,
      minVisitCount: formData.get("minVisitCount") ? Number(formData.get("minVisitCount")) : undefined,
      lastVisitDays: formData.get("lastVisitDays") ? Number(formData.get("lastVisitDays")) : undefined,
    };

    createMutation.mutate({
      organizationId: 1,
      name: formData.get("name") as string,
      messageType: formData.get("messageType") as "text" | "image" | "flex",
      messageContent: formData.get("messageContent") as string,
      targetFilters,
      scheduledAt: formData.get("scheduledAt") ? (formData.get("scheduledAt") as string) : undefined,
    });
  };

  // 處理立即發送
  const handleSendNow = (id: number) => {
    if (confirm("確定要立即發送此推播嗎？")) {
      sendNowMutation.mutate({ id });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">客戶分群推播</h1>
          <p className="text-muted-foreground">根據客戶標籤、行為建立分群推播活動</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新增推播活動
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新增推播活動</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">活動名稱</Label>
                <Input id="name" name="name" placeholder="例如：VIP 客戶專屬優惠" required />
              </div>
              
              <div>
                <Label htmlFor="messageType">訊息類型</Label>
                <Select name="messageType" defaultValue="text" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">文字訊息</SelectItem>
                    <SelectItem value="image">圖片訊息</SelectItem>
                    <SelectItem value="flex">Flex Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="messageContent">訊息內容</Label>
                <Textarea
                  id="messageContent"
                  name="messageContent"
                  placeholder="輸入訊息內容或 JSON（Flex Message）"
                  rows={6}
                  required
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">目標客戶篩選</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tags">客戶標籤（逗號分隔）</Label>
                    <Input id="tags" name="tags" placeholder="VIP, 新客" />
                  </div>
                  <div>
                    <Label htmlFor="minSpending">最低消費金額</Label>
                    <Input id="minSpending" name="minSpending" type="number" placeholder="10000" />
                  </div>
                  <div>
                    <Label htmlFor="maxSpending">最高消費金額</Label>
                    <Input id="maxSpending" name="maxSpending" type="number" placeholder="100000" />
                  </div>
                  <div>
                    <Label htmlFor="minVisitCount">最低到店次數</Label>
                    <Input id="minVisitCount" name="minVisitCount" type="number" placeholder="5" />
                  </div>
                  <div>
                    <Label htmlFor="lastVisitDays">最後到店天數內</Label>
                    <Input id="lastVisitDays" name="lastVisitDays" type="number" placeholder="30" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="scheduledAt">排程發送時間（選填）</Label>
                <Input id="scheduledAt" name="scheduledAt" type="datetime-local" />
                <p className="text-sm text-muted-foreground mt-1">
                  留空則建立後需手動發送
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "建立中..." : "建立活動"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總活動數</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已發送</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns?.filter(c => c.status === 'sent').length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總觸及人數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRecipients || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均開啟率</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              N/A
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 活動列表 */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">全部活動</TabsTrigger>
          <TabsTrigger value="draft">草稿</TabsTrigger>
          <TabsTrigger value="scheduled">已排程</TabsTrigger>
          <TabsTrigger value="sent">已發送</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 mt-4">
          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">尚無推播活動</p>
                <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  新增第一個推播活動
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign: any) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          建立時間：{new Date(campaign.createdAt).toLocaleString("zh-TW")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          campaign.status === "sent"
                            ? "default"
                            : campaign.status === "scheduled"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {campaign.status === "sent"
                          ? "已發送"
                          : campaign.status === "scheduled"
                          ? "已排程"
                          : "草稿"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">訊息類型</p>
                        <p className="font-semibold">{campaign.messageType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">目標人數</p>
                        <p className="font-semibold">{campaign._count?.recipients || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">已發送</p>
                        <p className="font-semibold">{campaign.sentCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">開啟率</p>
                        <p className="font-semibold">
                          {campaign.openRate ? `${campaign.openRate.toFixed(1)}%` : "N/A"}
                        </p>
                      </div>
                    </div>

                    {campaign.scheduledAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          排程時間：{new Date(campaign.scheduledAt).toLocaleString("zh-TW")}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {campaign.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => handleSendNow(campaign.id)}
                          disabled={sendNowMutation.isPending}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          立即發送
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        查看詳情
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
