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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Send,
  Calendar,
  Users,
  BarChart3,
  Eye,
  Trash2,
  FlaskConical,
  Loader2,
} from "lucide-react";
import ABTestDashboard from "@/components/dashboard/ABTestDashboard";

// ============================================
// Types
// ============================================

interface VariantFormData {
  variantName: string;
  messageContent: string;
  messageType: "text" | "image" | "flex";
  flexMessageJson: string;
  trafficPercentage: number;
}

const DEFAULT_VARIANT: VariantFormData = {
  variantName: "",
  messageContent: "",
  messageType: "text",
  flexMessageJson: "",
  trafficPercentage: 50,
};

// ============================================
// Component
// ============================================

export default function BroadcastCampaigns() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Record<string, any> | null>(null);
  const [abTestCampaignId, setAbTestCampaignId] = useState<number | null>(null);
  const [abTestCampaignName, setAbTestCampaignName] = useState<string>("");

  // A/B 測試版本表單狀態
  const [enableABTest, setEnableABTest] = useState(false);
  const [variants, setVariants] = useState<VariantFormData[]>([
    { ...DEFAULT_VARIANT, variantName: "A", trafficPercentage: 50 },
    { ...DEFAULT_VARIANT, variantName: "B", trafficPercentage: 50 },
  ]);

  // 查詢推播活動列表
  const { data: campaigns = [], refetch: refetchCampaigns } =
    trpc.broadcast.list.useQuery({
      organizationId: 1,
    });

  // 建立推播活動
  const createMutation = trpc.broadcast.create.useMutation({
    onSuccess: async (data) => {
      // 如果啟用了 A/B 測試，建立版本
      if (enableABTest && variants.length > 0) {
        try {
          await createVariantsBatchMutation.mutateAsync({
            campaignId: data.id,
            variants: variants.map((v) => ({
              variantName: v.variantName,
              messageContent: v.messageContent,
              messageType: v.messageType,
              flexMessageJson:
                v.messageType === "flex" && v.flexMessageJson
                  ? JSON.parse(v.flexMessageJson)
                  : undefined,
              trafficPercentage: v.trafficPercentage,
            })),
          });
          toast({ title: "推播活動建立成功（含 A/B 測試版本）" });
        } catch (err: any) {
          toast({
            title: "活動已建立，但版本建立失敗",
            description: err.message,
            variant: "destructive",
          });
        }
      } else {
        toast({ title: "推播活動建立成功" });
      }
      refetchCampaigns();
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "建立失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 批量建立版本
  const createVariantsBatchMutation =
    trpc.broadcastVariants.createBatch.useMutation();

  // 立即發送推播
  const sendNowMutation = trpc.broadcast.send.useMutation({
    onSuccess: () => {
      toast({ title: "推播已發送" });
      refetchCampaigns();
    },
    onError: (error: any) => {
      toast({
        title: "發送失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = trpc.broadcast.delete.useMutation({
    onSuccess: () => {
      toast({ title: "活動已刪除" });
      refetchCampaigns();
      if (abTestCampaignId) setAbTestCampaignId(null);
    },
    onError: (error: any) => {
      toast({
        title: "刪除失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ============================================
  // Form Handlers
  // ============================================

  const resetForm = useCallback(() => {
    setEnableABTest(false);
    setVariants([
      { ...DEFAULT_VARIANT, variantName: "A", trafficPercentage: 50 },
      { ...DEFAULT_VARIANT, variantName: "B", trafficPercentage: 50 },
    ]);
  }, []);

  const addVariant = useCallback(() => {
    const nextLetter = String.fromCharCode(65 + variants.length); // A=65
    const newPercentage = Math.floor(100 / (variants.length + 1));
    const updatedVariants = variants.map((v) => ({
      ...v,
      trafficPercentage: newPercentage,
    }));
    updatedVariants.push({
      ...DEFAULT_VARIANT,
      variantName: nextLetter,
      trafficPercentage: 100 - newPercentage * variants.length,
    });
    setVariants(updatedVariants);
  }, [variants]);

  const removeVariant = useCallback(
    (index: number) => {
      if (variants.length <= 2) {
        toast({
          title: "至少需要 2 個版本",
          variant: "destructive",
        });
        return;
      }
      const updated = variants.filter((_, i) => i !== index);
      // 重新分配流量
      const perVariant = Math.floor(100 / updated.length);
      const redistributed = updated.map((v, i) => ({
        ...v,
        trafficPercentage:
          i === updated.length - 1
            ? 100 - perVariant * (updated.length - 1)
            : perVariant,
      }));
      setVariants(redistributed);
    },
    [variants, toast]
  );

  const updateVariant = useCallback(
    (index: number, field: keyof VariantFormData, value: string | number | boolean) => {
      const updated = [...variants];
      (updated[index] as any)[field] = value;
      setVariants(updated);
    },
    [variants]
  );

  // 計算流量百分比總和
  const totalTraffic = variants.reduce(
    (sum, v) => sum + v.trafficPercentage,
    0
  );

  // 處理建立表單提交
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // 驗證 A/B 測試流量
    if (enableABTest) {
      if (totalTraffic !== 100) {
        toast({
          title: "流量百分比總和必須為 100%",
          description: `目前為 ${totalTraffic}%`,
          variant: "destructive",
        });
        return;
      }
      // 驗證每個版本都有內容
      for (const v of variants) {
        if (!v.messageContent.trim()) {
          toast({
            title: `版本 ${v.variantName} 的訊息內容不可為空`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    const targetAudience = {
      tags: formData.get("tags")
        ? (formData.get("tags") as string).split(",").map(Number)
        : undefined,
      minSpent: formData.get("minSpending")
        ? Number(formData.get("minSpending"))
        : undefined,
      maxSpent: formData.get("maxSpending")
        ? Number(formData.get("maxSpending"))
        : undefined,
      minVisitCount: formData.get("minVisitCount")
        ? Number(formData.get("minVisitCount"))
        : undefined,
      lastVisitDaysAgo: formData.get("lastVisitDays")
        ? Number(formData.get("lastVisitDays"))
        : undefined,
    };

    // 使用第一個版本的訊息作為主活動訊息（或使用表單中的訊息）
    const messageContent = enableABTest
      ? variants[0].messageContent
      : (formData.get("messageContent") as string);
    const messageType = enableABTest
      ? variants[0].messageType
      : (formData.get("messageType") as "text" | "image" | "flex");

    createMutation.mutate({
      organizationId: 1,
      name: formData.get("name") as string,
      messageType,
      messageContent,
      targetAudience,
      scheduledAt: formData.get("scheduledAt")
        ? (formData.get("scheduledAt") as string)
        : undefined,
    });
  };

  // 處理立即發送
  const handleSendNow = (id: number) => {
    if (confirm("確定要立即發送此推播嗎？")) {
      sendNowMutation.mutate({ id });
    }
  };

  // 統計資料
  const stats = {
    totalCampaigns: campaigns?.length || 0,
    sentCampaigns:
      campaigns?.filter((c: Record<string, any>) => c.status === "sent" || c.status === "completed").length || 0,
    totalRecipients:
      campaigns?.reduce(
        (sum: number, c: Record<string, any>) => sum + (c.totalRecipients || 0),
        0
      ) || 0,
  };

  // ============================================
  // Render
  // ============================================

  // 如果正在查看 A/B 測試儀表板
  if (abTestCampaignId) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <ABTestDashboard
          campaignId={abTestCampaignId}
          campaignName={abTestCampaignName}
          onClose={() => {
            setAbTestCampaignId(null);
            setAbTestCampaignName("");
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">客戶分群推播</h1>
          <p className="text-muted-foreground">
            根據客戶標籤、行為建立分群推播活動，支援 A/B 測試
          </p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}
        >
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
                <Input
                  id="name"
                  name="name"
                  placeholder="例如：VIP 客戶專屬優惠"
                  required
                />
              </div>

              {/* A/B 測試開關 */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">A/B 測試</p>
                      <p className="text-xs text-muted-foreground">
                        建立多個訊息版本，比較成效
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={enableABTest ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEnableABTest(!enableABTest)}
                  >
                    {enableABTest ? "已啟用" : "啟用"}
                  </Button>
                </div>

                {enableABTest ? (
                  <div className="space-y-4">
                    {/* 流量分配提示 */}
                    <div
                      className={`text-sm px-3 py-2 rounded-md ${
                        totalTraffic === 100
                          ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                      }`}
                    >
                      流量分配總計：{totalTraffic}%
                      {totalTraffic !== 100 && "（必須為 100%）"}
                    </div>

                    {/* 版本列表 */}
                    {variants.map((variant, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3 relative"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            版本 {variant.variantName}
                          </h4>
                          {variants.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeVariant(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>訊息類型</Label>
                            <Select
                              value={variant.messageType}
                              onValueChange={(val) =>
                                updateVariant(
                                  index,
                                  "messageType",
                                  val as "text" | "image" | "flex"
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">文字訊息</SelectItem>
                                <SelectItem value="image">圖片訊息</SelectItem>
                                <SelectItem value="flex">
                                  Flex Message
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>流量百分比</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={variant.trafficPercentage}
                                onChange={(e) =>
                                  updateVariant(
                                    index,
                                    "trafficPercentage",
                                    Number(e.target.value)
                                  )
                                }
                              />
                              <span className="text-sm text-muted-foreground">
                                %
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>訊息內容</Label>
                          <Textarea
                            value={variant.messageContent}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "messageContent",
                                e.target.value
                              )
                            }
                            placeholder={`版本 ${variant.variantName} 的訊息內容`}
                            rows={3}
                          />
                        </div>

                        {variant.messageType === "flex" && (
                          <div>
                            <Label>Flex Message JSON</Label>
                            <Textarea
                              value={variant.flexMessageJson}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "flexMessageJson",
                                  e.target.value
                                )
                              }
                              placeholder='{"type": "bubble", ...}'
                              rows={3}
                              className="font-mono text-xs"
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* 新增版本按鈕 */}
                    {variants.length < 6 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={addVariant}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        新增版本（目前 {variants.length} 個）
                      </Button>
                    )}
                  </div>
                ) : (
                  /* 未啟用 A/B 測試時的單一訊息表單 */
                  <>
                    <div>
                      <Label htmlFor="messageType">訊息類型</Label>
                      <Select
                        name="messageType"
                        defaultValue="text"
                        required
                      >
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
                  </>
                )}
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
                    <Input
                      id="minSpending"
                      name="minSpending"
                      type="number"
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxSpending">最高消費金額</Label>
                    <Input
                      id="maxSpending"
                      name="maxSpending"
                      type="number"
                      placeholder="100000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minVisitCount">最低到店次數</Label>
                    <Input
                      id="minVisitCount"
                      name="minVisitCount"
                      type="number"
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastVisitDays">最後到店天數內</Label>
                    <Input
                      id="lastVisitDays"
                      name="lastVisitDays"
                      type="number"
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="scheduledAt">排程發送時間（選填）</Label>
                <Input
                  id="scheduledAt"
                  name="scheduledAt"
                  type="datetime-local"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  留空則建立後需手動發送
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      建立中...
                    </>
                  ) : (
                    "建立活動"
                  )}
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
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已發送</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sentCampaigns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總觸及人數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecipients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A/B 測試</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {campaigns?.length || 0} 活動
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

        {["all", "draft", "scheduled", "sent"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-4 mt-4">
            {(tabValue === "all"
              ? campaigns
              : campaigns.filter((c: Record<string, any>) =>
                  tabValue === "sent"
                    ? c.status === "sent" || c.status === "completed"
                    : c.status === tabValue
                )
            ).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">
                    {tabValue === "all" ? "尚無推播活動" : `尚無${tabValue === "draft" ? "草稿" : tabValue === "scheduled" ? "已排程" : "已發送"}的活動`}
                  </p>
                  {tabValue === "all" && (
                    <Button
                      className="mt-4"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      新增第一個推播活動
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {(tabValue === "all"
                  ? campaigns
                  : campaigns.filter((c: Record<string, any>) =>
                      tabValue === "sent"
                        ? c.status === "sent" || c.status === "completed"
                        : c.status === tabValue
                    )
                ).map((campaign: Record<string, any>) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onSendNow={handleSendNow}
                    onDelete={(id) => {
                      if (confirm("確定要刪除此活動嗎？")) {
                        deleteMutation.mutate({ id });
                      }
                    }}
                    onViewABTest={(id, name) => {
                      setAbTestCampaignId(id);
                      setAbTestCampaignName(name);
                    }}
                    isSending={sendNowMutation.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// ============================================
// CampaignCard Sub-component
// ============================================

function CampaignCard({
  campaign,
  onSendNow,
  onDelete,
  onViewABTest,
  isSending,
}: {
  campaign: Record<string, any>;
  onSendNow: (id: number) => void;
  onDelete: (id: number) => void;
  onViewABTest: (id: number, name: string) => void;
  isSending: boolean;
}) {
  // 查詢此活動是否有 A/B 測試版本
  const { data: variantsList = [] } =
    trpc.broadcastVariants.listVariants.useQuery({
      campaignId: campaign.id,
    });

  const hasVariants = variantsList.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {campaign.name}
              {hasVariants && (
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                >
                  <FlaskConical className="mr-1 h-3 w-3" />
                  A/B 測試 ({variantsList.length} 版本)
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              建立時間：{new Date(campaign.createdAt).toLocaleString("zh-TW")}
            </p>
          </div>
          <Badge
            variant={
              campaign.status === "sent" || campaign.status === "completed"
                ? "default"
                : campaign.status === "scheduled"
                ? "secondary"
                : "outline"
            }
          >
            {campaign.status === "sent" || campaign.status === "completed"
              ? "已發送"
              : campaign.status === "scheduled"
              ? "已排程"
              : campaign.status === "sending"
              ? "發送中"
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
            <p className="font-semibold">{campaign.totalRecipients || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">已發送</p>
            <p className="font-semibold">{campaign.sentCount || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">開啟率</p>
            <p className="font-semibold">
              {campaign.openRate
                ? `${campaign.openRate.toFixed(1)}%`
                : "N/A"}
            </p>
          </div>
        </div>

        {campaign.scheduledAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              排程時間：
              {new Date(campaign.scheduledAt).toLocaleString("zh-TW")}
            </span>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {campaign.status === "draft" && (
            <Button
              size="sm"
              onClick={() => onSendNow(campaign.id)}
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              立即發送
            </Button>
          )}

          {hasVariants && (
            <Button
              variant="outline"
              size="sm"
              className="text-purple-600 border-purple-300 hover:bg-purple-50"
              onClick={() => onViewABTest(campaign.id, campaign.name)}
            >
              <FlaskConical className="mr-2 h-4 w-4" />
              查看 A/B 測試
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewABTest(campaign.id, campaign.name)}
          >
            <Eye className="mr-2 h-4 w-4" />
            查看詳情
          </Button>

          {campaign.status === "draft" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={() => onDelete(campaign.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              刪除
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
