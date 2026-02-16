import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Trophy,
  BarChart3,
  Eye,
  MousePointerClick,
  Target,
  ChevronDown,
  ChevronUp,
  Crown,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface ABTestDashboardProps {
  campaignId: number;
  campaignName: string;
  onClose?: () => void;
}

export default function ABTestDashboard({
  campaignId,
  campaignName,
  onClose,
}: ABTestDashboardProps) {
  const { toast } = useToast();
  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);

  // 查詢版本統計
  const {
    data: statsData,
    isLoading,
    refetch: refetchStats,
  } = trpc.broadcastVariants.getVariantStats.useQuery({ campaignId });

  // 查詢版本列表
  const { data: variants = [] } = trpc.broadcastVariants.listVariants.useQuery({
    campaignId,
  });

  // 選擇最佳版本
  const selectWinnerMutation =
    trpc.broadcastVariants.selectWinner.useMutation({
      onSuccess: (data) => {
        toast({
          title: "已選出最佳版本",
          description: `版本「${data.winnerName}」已被選為最佳版本，訊息內容已回寫至主活動。`,
        });
        refetchStats();
      },
      onError: (error) => {
        toast({
          title: "操作失敗",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const handleSelectWinner = (winnerId?: number) => {
    selectWinnerMutation.mutate({
      campaignId,
      winnerId,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入 A/B 測試數據中...</span>
      </div>
    );
  }

  if (!statsData || statsData.variants.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">此活動尚未建立 A/B 測試版本</p>
        </CardContent>
      </Card>
    );
  }

  // 準備圖表資料
  const chartData = statsData.variants.map((v) => ({
    name: v.variantName,
    開啟率: v.openRate,
    點擊率: v.clickRate,
    轉換率: v.convertRate,
  }));

  const radarData = [
    {
      metric: "開啟率",
      ...Object.fromEntries(
        statsData.variants.map((v) => [v.variantName, v.openRate])
      ),
    },
    {
      metric: "點擊率",
      ...Object.fromEntries(
        statsData.variants.map((v) => [v.variantName, v.clickRate])
      ),
    },
    {
      metric: "轉換率",
      ...Object.fromEntries(
        statsData.variants.map((v) => [v.variantName, v.convertRate])
      ),
    },
    {
      metric: "綜合評分",
      ...Object.fromEntries(
        statsData.variants.map((v) => [v.variantName, v.score])
      ),
    },
  ];

  const COLORS = [
    "#6366f1",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <div className="space-y-6">
      {/* 標題列 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            A/B 測試分析 — {campaignName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            共 {statsData.variants.length} 個版本
            {statsData.bestVariantName && (
              <span className="ml-2">
                · 最佳版本：
                <span className="font-semibold text-green-600">
                  {statsData.bestVariantName}
                </span>
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSelectWinner()}
            disabled={selectWinnerMutation.isPending}
          >
            {selectWinnerMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trophy className="mr-2 h-4 w-4" />
            )}
            自動選出最佳版本
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              關閉
            </Button>
          )}
        </div>
      </div>

      {/* 版本概覽卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsData.variants.map((variant, index) => {
          const isBest = variant.id === statsData.bestVariantId;
          const isExpanded = expandedVariant === variant.id;
          const matchingVariant = variants.find((v) => v.id === variant.id);

          return (
            <Card
              key={variant.id}
              className={`relative transition-all ${
                isBest
                  ? "ring-2 ring-green-500 shadow-lg shadow-green-100"
                  : ""
              }`}
            >
              {isBest && (
                <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-1.5">
                  <Crown className="h-4 w-4" />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    版本 {variant.variantName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {variant.trafficPercentage}% 流量
                    </Badge>
                    {isBest && (
                      <Badge className="bg-green-500 text-white">最佳</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* 核心指標 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">開啟率</p>
                      <p className="text-sm font-semibold">
                        {variant.openRate}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">點擊率</p>
                      <p className="text-sm font-semibold">
                        {variant.clickRate}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">轉換率</p>
                      <p className="text-sm font-semibold">
                        {variant.convertRate}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">綜合評分</p>
                      <p className="text-sm font-semibold">{variant.score}%</p>
                    </div>
                  </div>
                </div>

                {/* 發送統計 */}
                <div className="text-xs text-muted-foreground border-t pt-2">
                  發送: {variant.sentCount} · 開啟: {variant.openedCount} ·
                  點擊: {variant.clickedCount} · 轉換: {variant.convertedCount}
                </div>

                {/* 展開/收合 */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      setExpandedVariant(isExpanded ? null : variant.id)
                    }
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="mr-1 h-3 w-3" />
                        收合詳情
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-1 h-3 w-3" />
                        展開詳情
                      </>
                    )}
                  </Button>
                  {!isBest && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSelectWinner(variant.id)}
                      disabled={selectWinnerMutation.isPending}
                    >
                      <Trophy className="mr-1 h-3 w-3" />
                      選為最佳
                    </Button>
                  )}
                </div>

                {/* 展開的詳情 */}
                {isExpanded && matchingVariant && (
                  <div className="border-t pt-3 space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        訊息類型
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {matchingVariant.messageType === "text"
                          ? "文字訊息"
                          : matchingVariant.messageType === "image"
                          ? "圖片訊息"
                          : "Flex Message"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        訊息內容
                      </p>
                      <div className="mt-1 p-2 bg-muted rounded-md text-xs max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {matchingVariant.messageContent}
                      </div>
                    </div>
                    {matchingVariant.flexMessageJson != null && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Flex Message JSON
                        </p>
                        <div className="mt-1 p-2 bg-muted rounded-md text-xs max-h-32 overflow-y-auto font-mono">
                          {JSON.stringify(
                            matchingVariant.flexMessageJson as Record<string, unknown>,
                            null,
                            2
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 長條圖：各版本成效對比 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">版本成效對比</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, ""]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend />
                <Bar dataKey="開啟率" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="點擊率" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="轉換率" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 雷達圖：綜合能力比較 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">綜合能力比較</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis />
                {statsData.variants.map((v, i) => (
                  <Radar
                    key={v.id}
                    name={`版本 ${v.variantName}`}
                    dataKey={v.variantName}
                    stroke={COLORS[i % COLORS.length]}
                    fill={COLORS[i % COLORS.length]}
                    fillOpacity={0.15}
                  />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 詳細數據表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">詳細數據</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">版本</th>
                  <th className="text-right py-2 px-3 font-medium">流量</th>
                  <th className="text-right py-2 px-3 font-medium">發送數</th>
                  <th className="text-right py-2 px-3 font-medium">開啟數</th>
                  <th className="text-right py-2 px-3 font-medium">開啟率</th>
                  <th className="text-right py-2 px-3 font-medium">點擊數</th>
                  <th className="text-right py-2 px-3 font-medium">點擊率</th>
                  <th className="text-right py-2 px-3 font-medium">轉換數</th>
                  <th className="text-right py-2 px-3 font-medium">轉換率</th>
                  <th className="text-right py-2 px-3 font-medium">綜合評分</th>
                </tr>
              </thead>
              <tbody>
                {statsData.variants.map((v, index) => {
                  const isBest = v.id === statsData.bestVariantId;
                  return (
                    <tr
                      key={v.id}
                      className={`border-b ${
                        isBest ? "bg-green-50 dark:bg-green-950/20" : ""
                      }`}
                    >
                      <td className="py-2 px-3 font-medium flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        {v.variantName}
                        {isBest && (
                          <Crown className="h-3.5 w-3.5 text-green-500" />
                        )}
                      </td>
                      <td className="text-right py-2 px-3">
                        {v.trafficPercentage}%
                      </td>
                      <td className="text-right py-2 px-3">{v.sentCount}</td>
                      <td className="text-right py-2 px-3">{v.openedCount}</td>
                      <td className="text-right py-2 px-3 font-semibold">
                        {v.openRate}%
                      </td>
                      <td className="text-right py-2 px-3">
                        {v.clickedCount}
                      </td>
                      <td className="text-right py-2 px-3 font-semibold">
                        {v.clickRate}%
                      </td>
                      <td className="text-right py-2 px-3">
                        {v.convertedCount}
                      </td>
                      <td className="text-right py-2 px-3 font-semibold">
                        {v.convertRate}%
                      </td>
                      <td className="text-right py-2 px-3 font-bold">
                        {v.score}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
