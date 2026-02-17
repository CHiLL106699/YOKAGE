import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  MessageSquare,
  BarChart3,
  BookOpen,
  Zap,
  Search,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function AiChatbotSettings() {
  const { toast } = useToast();
  const [isAddKnowledgeDialogOpen, setIsAddKnowledgeDialogOpen] =
    useState(false);
  const [isAddIntentDialogOpen, setIsAddIntentDialogOpen] = useState(false);

  // 語意搜尋狀態
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 相似問題狀態
  const [similarQuestionsMap, setSimilarQuestionsMap] = useState<
    Record<number, any[]>
  >({});
  const [loadingSimilarFor, setLoadingSimilarFor] = useState<number | null>(
    null
  );

  // 向量化中的知識庫 ID
  const [vectorizingIds, setVectorizingIds] = useState<Set<number>>(new Set());
  const [isVectorizingAll, setIsVectorizingAll] = useState(false);

  // 查詢知識庫列表
  const { data: knowledgeBase = [], refetch: refetchKnowledge } =
    trpc.aiChatbot.listKnowledgeBase.useQuery({
      organizationId: 1,
    });

  // 查詢意圖定義列表
  const { data: intents = [], refetch: refetchIntents } =
    trpc.aiChatbot.listIntents.useQuery({
      organizationId: 1,
    });

  // 查詢向量化進度
  const {
    data: vectorizationStatus,
    refetch: refetchVectorizationStatus,
  } = trpc.aiChatbot.getVectorizationStatus.useQuery({
    organizationId: 1,
  });

  // 統計資料
  const stats = {
    totalKnowledge: knowledgeBase?.length || 0,
    totalIntents: intents?.length || 0,
    totalConversations: 0,
    vectorizedProgress: vectorizationStatus?.progress || 0,
  };

  // 建立知識庫項目
  const createKnowledgeMutation = trpc.aiChatbot.createKnowledge.useMutation({
    onSuccess: () => {
      toast({ title: "知識庫項目建立成功" });
      refetchKnowledge();
      refetchVectorizationStatus();
      setIsAddKnowledgeDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "建立失敗",
        description: error.message,
        variant: "destructive",
      });
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
      toast({
        title: "建立失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 刪除知識庫項目
  const deleteKnowledgeMutation = trpc.aiChatbot.deleteKnowledge.useMutation({
    onSuccess: () => {
      toast({ title: "知識庫項目已刪除" });
      refetchKnowledge();
      refetchVectorizationStatus();
    },
    onError: (error) => {
      toast({
        title: "刪除失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Phase 112: 單一向量化
  const vectorizeKnowledgeMutation =
    trpc.aiChatbot.vectorizeKnowledge.useMutation({
      onSuccess: (data) => {
        toast({
          title: "向量化完成",
          description: `知識庫條目 #${data.knowledgeBaseId} 已成功向量化`,
        });
        setVectorizingIds((prev) => {
          const next = new Set(prev);
          next.delete(data.knowledgeBaseId);
          return next;
        });
        refetchVectorizationStatus();
      },
      onError: (error) => {
        toast({
          title: "向量化失敗",
          description: error.message,
          variant: "destructive",
        });
        setVectorizingIds(new Set());
      },
    });

  // Phase 112: 批次向量化
  const vectorizeAllMutation = trpc.aiChatbot.vectorizeAll.useMutation({
    onSuccess: (data) => {
      toast({
        title: "批次向量化完成",
        description: data.message,
      });
      setIsVectorizingAll(false);
      refetchVectorizationStatus();
    },
    onError: (error) => {
      toast({
        title: "批次向量化失敗",
        description: error.message,
        variant: "destructive",
      });
      setIsVectorizingAll(false);
    },
  });

  // Phase 113: 語意搜尋
  const semanticSearchMutation = trpc.aiChatbot.semanticSearch.useMutation({
    onSuccess: (data) => {
      setSearchResults(data.results || []);
      setIsSearching(false);
    },
    onError: (error) => {
      toast({
        title: "搜尋失敗",
        description: error.message,
        variant: "destructive",
      });
      setIsSearching(false);
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
      keywords: formData.get("keywords")
        ? (formData.get("keywords") as string).split(",").map((k) => k.trim())
        : undefined,
    });
  };

  // 處理建立意圖表單提交
  const handleCreateIntent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createIntentMutation.mutate({
      organizationId: 1,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      keywords: formData.get("patterns")
        ? (formData.get("patterns") as string)
            .split("\n")
            .filter((p) => p.trim())
        : [],
      responseTemplate: formData.get("responseTemplate") as string,
    });
  };

  // 處理刪除知識庫項目
  const handleDeleteKnowledge = (id: number) => {
    if (confirm("確定要刪除此知識庫項目嗎？")) {
      deleteKnowledgeMutation.mutate({ id });
    }
  };

  // Phase 112: 處理單一向量化
  const handleVectorize = useCallback(
    (knowledgeBaseId: number) => {
      setVectorizingIds((prev) => new Set(prev).add(knowledgeBaseId));
      vectorizeKnowledgeMutation.mutate({ knowledgeBaseId });
    },
    [vectorizeKnowledgeMutation]
  );

  // Phase 112: 處理批次向量化
  const handleVectorizeAll = useCallback(() => {
    setIsVectorizingAll(true);
    vectorizeAllMutation.mutate({ organizationId: 1 });
  }, [vectorizeAllMutation]);

  // Phase 113: 處理語意搜尋
  const handleSemanticSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    semanticSearchMutation.mutate({
      organizationId: 1,
      query: searchQuery,
      topK: 5,
      threshold: 0.3,
    });
  }, [searchQuery, semanticSearchMutation]);

  // Phase 113: 處理相似問題推薦
  const handleGetSimilarQuestions = useCallback(
    (knowledgeBaseId: number) => {
      setLoadingSimilarFor(knowledgeBaseId);
      // 使用 fetch 直接呼叫 tRPC query（因為 getSimilarQuestions 是 query 而非 mutation）
      // 這裡我們透過 refetch 的方式處理
    },
    []
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI 對話機器人設定</h1>
          <p className="text-muted-foreground">
            管理知識庫、意圖定義、向量化與語意搜尋
          </p>
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
            <div className="text-2xl font-bold">
              {stats?.totalKnowledge || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">意圖定義</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalIntents || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總對話次數</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalConversations || 0}
            </div>
          </CardContent>
        </Card>
        {/* Phase 112: 向量化進度卡片 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">向量化進度</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vectorizationStatus?.progress ?? 0}%
            </div>
            <Progress
              value={vectorizationStatus?.progress ?? 0}
              className="mt-2 h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {vectorizationStatus?.vectorizedCount ?? 0} /{" "}
              {vectorizationStatus?.totalCount ?? 0} 已向量化
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要內容 */}
      <Tabs defaultValue="knowledge">
        <TabsList>
          <TabsTrigger value="knowledge">知識庫管理</TabsTrigger>
          <TabsTrigger value="search">語意搜尋</TabsTrigger>
          <TabsTrigger value="intents">意圖定義</TabsTrigger>
          <TabsTrigger value="conversations">對話記錄</TabsTrigger>
        </TabsList>

        {/* 知識庫管理 */}
        <TabsContent value="knowledge" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            {/* Phase 112: 批次向量化按鈕 */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleVectorizeAll}
                disabled={
                  isVectorizingAll || vectorizationStatus?.isComplete === true
                }
              >
                {isVectorizingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    向量化中...
                  </>
                ) : vectorizationStatus?.isComplete ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    全部已向量化
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    全部向量化 ({vectorizationStatus?.pendingCount ?? 0} 待處理)
                  </>
                )}
              </Button>
              {vectorizationStatus && !vectorizationStatus.isComplete && (
                <span className="text-sm text-muted-foreground">
                  進度：{vectorizationStatus.vectorizedCount}/
                  {vectorizationStatus.totalCount}
                </span>
              )}
            </div>

            <Dialog
              open={isAddKnowledgeDialogOpen}
              onOpenChange={setIsAddKnowledgeDialogOpen}
            >
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
                    <Input
                      id="category"
                      name="category"
                      placeholder="例如：療程介紹"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="question">問題</Label>
                    <Input
                      id="question"
                      name="question"
                      placeholder="例如：什麼是玻尿酸？"
                      required
                    />
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
                    <Input
                      id="keywords"
                      name="keywords"
                      placeholder="玻尿酸, 填充, 注射"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddKnowledgeDialogOpen(false)}
                    >
                      取消
                    </Button>
                    <Button
                      type="submit"
                      disabled={createKnowledgeMutation.isPending}
                    >
                      {createKnowledgeMutation.isPending
                        ? "建立中..."
                        : "建立"}
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
                <Button
                  className="mt-4"
                  onClick={() => setIsAddKnowledgeDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  新增第一個知識
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {knowledgeBase.map((item: Record<string, any>) => (
                <KnowledgeCard
                  key={item.id}
                  item={item}
                  isVectorizing={vectorizingIds.has(item.id)}
                  onVectorize={() => handleVectorize(item.id)}
                  onDelete={() => handleDeleteKnowledge(item.id)}
                  similarQuestions={similarQuestionsMap[item.id]}
                  isLoadingSimilar={loadingSimilarFor === item.id}
                  onGetSimilar={() => handleGetSimilarQuestions(item.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Phase 113: 語意搜尋 Tab */}
        <TabsContent value="search" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                語意搜尋
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                輸入自然語言問題，系統將透過向量相似度搜尋最相關的知識庫條目
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="輸入您的問題，例如：玻尿酸的效果持續多久？"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSemanticSearch();
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSemanticSearch}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* 搜尋結果 */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    找到 {searchResults.length} 個相關結果
                  </h3>
                  {searchResults.map((result: Record<string, any>, index: number) => (
                    <Card
                      key={result.id}
                      className="border-l-4"
                      style={{
                        borderLeftColor:
                          result.similarity > 0.7
                            ? "#22c55e"
                            : result.similarity > 0.5
                            ? "#eab308"
                            : "#94a3b8",
                      }}
                    >
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{result.category}</Badge>
                              <Badge
                                variant={
                                  result.similarity > 0.7
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                相似度：{(result.similarity * 100).toFixed(1)}%
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                #{index + 1}
                              </span>
                            </div>
                            <h4 className="font-medium">{result.question}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {result.answer}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {searchResults.length === 0 &&
                !isSearching &&
                searchQuery.trim() &&
                semanticSearchMutation.isSuccess && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>未找到相關的知識庫條目</p>
                    <p className="text-xs mt-1">
                      請確認知識庫已完成向量化，或嘗試不同的搜尋詞
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 意圖定義 */}
        <TabsContent value="intents" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog
              open={isAddIntentDialogOpen}
              onOpenChange={setIsAddIntentDialogOpen}
            >
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
                    <Input
                      id="name"
                      name="name"
                      placeholder="例如：預約諮詢"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">描述</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="意圖說明..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="patterns">觸發語句（每行一個）</Label>
                    <Textarea
                      id="patterns"
                      name="patterns"
                      placeholder={"我想預約\n幫我預約\n可以預約嗎"}
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
                    <Input
                      id="action"
                      name="action"
                      placeholder="例如：create_appointment"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddIntentDialogOpen(false)}
                    >
                      取消
                    </Button>
                    <Button
                      type="submit"
                      disabled={createIntentMutation.isPending}
                    >
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
                <Button
                  className="mt-4"
                  onClick={() => setIsAddIntentDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  新增第一個意圖
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {intents.map((intent: Record<string, any>) => (
                <Card key={intent.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {intent.name}
                        </CardTitle>
                        {intent.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {intent.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={intent.isActive ? "default" : "secondary"}
                      >
                        {intent.isActive ? "啟用中" : "未啟用"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">觸發語句：</p>
                      <div className="flex gap-2 flex-wrap">
                        {(intent.keywords || intent.patterns || []).map(
                          (pattern: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {pattern}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">回覆模板：</p>
                      <p className="text-sm text-muted-foreground">
                        {intent.responseTemplate}
                      </p>
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
              <p className="text-muted-foreground">
                對話記錄查詢功能開發中...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * 知識庫條目卡片元件（含向量化按鈕與相似問題推薦）
 */
function KnowledgeCard({
  item,
  isVectorizing,
  onVectorize,
  onDelete,
  similarQuestions,
  isLoadingSimilar,
  onGetSimilar,
}: {
  item: Record<string, any>;
  isVectorizing: boolean;
  onVectorize: () => void;
  onDelete: () => void;
  similarQuestions?: Array<Record<string, any>>;
  isLoadingSimilar: boolean;
  onGetSimilar: () => void;
}) {
  const [showSimilar, setShowSimilar] = useState(false);
  const [localSimilar, setLocalSimilar] = useState<any[] | null>(null);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // 使用 tRPC 的 useQuery 來取得相似問題
  const {
    data: similarData,
    refetch: fetchSimilar,
    isFetching: isFetchingSimilar,
  } = trpc.aiChatbot.getSimilarQuestions.useQuery(
    {
      knowledgeBaseId: item.id,
      organizationId: 1,
      topK: 3,
      threshold: 0.3,
    },
    {
      enabled: false, // 手動觸發
    }
  );

  const handleToggleSimilar = async () => {
    if (showSimilar) {
      setShowSimilar(false);
      return;
    }
    setShowSimilar(true);
    fetchSimilar();
  };

  const displaySimilar = similarData?.results || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{item.category}</Badge>
              <CardTitle className="text-lg">{item.question}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{item.answer}</p>
          </div>
          <div className="flex items-center gap-1">
            {/* Phase 112: 向量化按鈕 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onVectorize}
              disabled={isVectorizing}
              title="向量化此條目"
            >
              {isVectorizing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
            </Button>
            {/* Phase 113: 相似問題推薦按鈕 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleSimilar}
              title="查看相似問題"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {item.keywords && item.keywords.length > 0 && (
        <CardContent className="pt-0">
          <div className="flex gap-2 flex-wrap">
            {item.keywords.map((keyword: string, index: number) => (
              <Badge key={index} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      )}

      {/* Phase 113: 相似問題推薦區塊 */}
      {showSimilar && (
        <CardContent className="border-t bg-muted/30">
          <div className="pt-3">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              相似問題推薦
            </h4>
            {isFetchingSimilar ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                搜尋相似問題中...
              </div>
            ) : displaySimilar.length > 0 ? (
              <div className="space-y-2">
                {displaySimilar.map((similar: any) => (
                  <div
                    key={similar.id}
                    className="flex items-start gap-2 p-2 rounded bg-background"
                  >
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-xs"
                    >
                      {(similar.similarity * 100).toFixed(0)}%
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{similar.question}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {similar.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                {similarData?.message || "未找到相似問題（可能尚未向量化）"}
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
