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
import { Plus, Edit, Trash2, MessageSquare, BarChart3, BookOpen } from "lucide-react";

export default function AiChatbotSettings() {
  const { toast } = useToast();
  const [isAddKnowledgeDialogOpen, setIsAddKnowledgeDialogOpen] = useState(false);
  const [isAddIntentDialogOpen, setIsAddIntentDialogOpen] = useState(false);

  // 查詢知識庫列表
  const { data: knowledgeBase = [], refetch: refetchKnowledge } = trpc.aiChatbot.listKnowledgeBase.useQuery({
    organizationId: 1,
  });

  // 查詢意圖定義列表
  const { data: intents = [], refetch: refetchIntents } = trpc.aiChatbot.listIntents.useQuery({
    organizationId: 1,
  });

  // 統計資料（從列表計算）
  const stats = {
    totalKnowledge: knowledgeBase?.length || 0,
    totalIntents: intents?.length || 0,
    totalConversations: 0, // TODO: 從對話記錄 API 取得
    avgConfidence: undefined,
  };

  // 建立知識庫項目
  const createKnowledgeMutation = trpc.aiChatbot.createKnowledge.useMutation({
    onSuccess: () => {
      toast({ title: "知識庫項目建立成功" });
      refetchKnowledge();
      setIsAddKnowledgeDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "建立失敗", description: error.message, variant: "destructive" });
    },
  });

  // 建立意圖定義
  const createIntentMutation = trpc.aiChatbot.createIntent.useMutation({
    onSuccess: () => {
      toast({ title: "意圖定義建立成功" });
      refetchIntents();
      setIsAddIntentDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "建立失敗", description: error.message, variant: "destructive" });
    },
  });

  // 刪除知識庫項目
  const deleteKnowledgeMutation = trpc.aiChatbot.deleteKnowledge.useMutation({
    onSuccess: () => {
      toast({ title: "知識庫項目已刪除" });
      refetchKnowledge();
    },
    onError: (error) => {
      toast({ title: "刪除失敗", description: error.message, variant: "destructive" });
    },
  });

  // 處理建立知識庫表單提交
  const handleCreateKnowledge = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createKnowledgeMutation.mutate({
      organizationId: 1,
      category: formData.get("category") as string,
      question: formData.get("question") as string,
      answer: formData.get("answer") as string,
      keywords: formData.get("keywords") ? (formData.get("keywords") as string).split(",").map(k => k.trim()) : undefined,
    });
  };

  // 處理建立意圖表單提交
  const handleCreateIntent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createIntentMutation.mutate({
      organizationId: 1,
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      keywords: formData.get("patterns") ? (formData.get("patterns") as string).split("\n").filter(p => p.trim()) : [],
      responseTemplate: formData.get("responseTemplate") as string,
    });
  };

  // 處理刪除知識庫項目
  const handleDeleteKnowledge = (id: number) => {
    if (confirm("確定要刪除此知識庫項目嗎？")) {
      deleteKnowledgeMutation.mutate({ id });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI 對話機器人設定</h1>
          <p className="text-muted-foreground">管理知識庫、意圖定義與對話記錄</p>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">知識庫項目</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalKnowledge || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">意圖定義</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalIntents || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總對話次數</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalConversations || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均信心分數</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avgConfidence ? `${(stats.avgConfidence * 100).toFixed(1)}%` : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要內容 */}
      <Tabs defaultValue="knowledge">
        <TabsList>
          <TabsTrigger value="knowledge">知識庫管理</TabsTrigger>
          <TabsTrigger value="intents">意圖定義</TabsTrigger>
          <TabsTrigger value="conversations">對話記錄</TabsTrigger>
        </TabsList>

        {/* 知識庫管理 */}
        <TabsContent value="knowledge" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={isAddKnowledgeDialogOpen} onOpenChange={setIsAddKnowledgeDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  新增知識
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>新增知識庫項目</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateKnowledge} className="space-y-4">
                  <div>
                    <Label htmlFor="category">分類</Label>
                    <Input id="category" name="category" placeholder="例如：療程介紹" required />
                  </div>
                  <div>
                    <Label htmlFor="question">問題</Label>
                    <Input id="question" name="question" placeholder="例如：什麼是玻尿酸？" required />
                  </div>
                  <div>
                    <Label htmlFor="answer">回答</Label>
                    <Textarea
                      id="answer"
                      name="answer"
                      placeholder="詳細回答內容..."
                      rows={6}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="keywords">關鍵字（逗號分隔）</Label>
                    <Input id="keywords" name="keywords" placeholder="玻尿酸, 填充, 注射" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddKnowledgeDialogOpen(false)}
                    >
                      取消
                    </Button>
                    <Button type="submit" disabled={createKnowledgeMutation.isPending}>
                      {createKnowledgeMutation.isPending ? "建立中..." : "建立"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {knowledgeBase.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">尚無知識庫項目</p>
                <Button className="mt-4" onClick={() => setIsAddKnowledgeDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  新增第一個知識
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {knowledgeBase.map((item: any) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.category}</Badge>
                          <CardTitle className="text-lg">{item.question}</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{item.answer}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKnowledge(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  {item.keywords && item.keywords.length > 0 && (
                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        {item.keywords.map((keyword: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 意圖定義 */}
        <TabsContent value="intents" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={isAddIntentDialogOpen} onOpenChange={setIsAddIntentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  新增意圖
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>新增意圖定義</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateIntent} className="space-y-4">
                  <div>
                    <Label htmlFor="name">意圖名稱</Label>
                    <Input id="name" name="name" placeholder="例如：預約諮詢" required />
                  </div>
                  <div>
                    <Label htmlFor="description">描述</Label>
                    <Textarea id="description" name="description" placeholder="意圖說明..." />
                  </div>
                  <div>
                    <Label htmlFor="patterns">觸發語句（每行一個）</Label>
                    <Textarea
                      id="patterns"
                      name="patterns"
                      placeholder="我想預約&#10;幫我預約&#10;可以預約嗎"
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="responseTemplate">回覆模板</Label>
                    <Textarea
                      id="responseTemplate"
                      name="responseTemplate"
                      placeholder="好的！請問您想預約哪個療程呢？"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="action">執行動作（選填）</Label>
                    <Input id="action" name="action" placeholder="例如：create_appointment" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddIntentDialogOpen(false)}
                    >
                      取消
                    </Button>
                    <Button type="submit" disabled={createIntentMutation.isPending}>
                      {createIntentMutation.isPending ? "建立中..." : "建立"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {intents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">尚無意圖定義</p>
                <Button className="mt-4" onClick={() => setIsAddIntentDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  新增第一個意圖
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {intents.map((intent: any) => (
                <Card key={intent.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{intent.name}</CardTitle>
                        {intent.description && (
                          <p className="text-sm text-muted-foreground mt-1">{intent.description}</p>
                        )}
                      </div>
                      <Badge variant={intent.isActive ? "default" : "secondary"}>
                        {intent.isActive ? "啟用中" : "未啟用"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">觸發語句：</p>
                      <div className="flex gap-2 flex-wrap">
                        {intent.patterns.map((pattern: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {pattern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">回覆模板：</p>
                      <p className="text-sm text-muted-foreground">{intent.responseTemplate}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 對話記錄 */}
        <TabsContent value="conversations" className="space-y-4 mt-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">對話記錄查詢功能開發中...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
