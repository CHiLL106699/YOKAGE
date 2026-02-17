import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Star, ThumbsUp, ThumbsDown, TrendingUp, MessageSquare, BarChart3, Send } from "lucide-react";
import { toast } from "sonner";

export default function SatisfactionSurveyPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [surveyTypeFilter, setSurveyTypeFilter] = useState<string | undefined>();
  
  const organizationId = 1;
  
  const { data: surveys, isLoading, refetch } = trpc.satisfaction.list.useQuery({
    organizationId,
    status: statusFilter,
    surveyType: surveyTypeFilter,
  });

  const { data: npsStats } = trpc.satisfaction.getNPSStats.useQuery({ organizationId });
  const { data: trend } = trpc.satisfaction.getTrend.useQuery({ organizationId, months: 6 });

  const { data: customers } = trpc.customer.list.useQuery({
    organizationId,
    limit: 100,
  });

  const { data: staffList } = trpc.staff.list.useQuery({ organizationId });

  const createMutation = trpc.satisfaction.create.useMutation({
    onSuccess: () => {
      toast.success("滿意度調查已發送");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "待填寫", variant: "outline" },
      completed: { label: "已完成", variant: "default" },
      expired: { label: "已過期", variant: "secondary" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSurveyTypeBadge = (type: string) => {
    const typeMap: Record<string, string> = {
      post_treatment: "療程後",
      post_purchase: "購買後",
      general: "一般",
      nps: "NPS",
    };
    return <Badge variant="outline">{typeMap[type] || type}</Badge>;
  };

  const renderStars = (score: number | null) => {
    if (!score) return <span className="text-muted-foreground">-</span>;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= score ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm">({score})</span>
      </div>
    );
  };

  const surveyList = surveys || [];
  
  // 計算統計數據
  const completedSurveys = surveyList.filter((s: Record<string, any>) => s.status === "completed");
  const stats = {
    total: surveyList.length,
    completed: completedSurveys.length,
    pending: surveyList.filter((s: Record<string, any>) => s.status === "pending").length,
    responseRate: surveyList.length > 0 
      ? ((completedSurveys.length / surveyList.length) * 100).toFixed(1)
      : 0,
    avgOverallScore: completedSurveys.length > 0
      ? (completedSurveys.reduce((sum: number, s: Record<string, any>) => sum + (s.overallScore || 0), 0) / completedSurveys.length).toFixed(1)
      : 0,
    avgServiceScore: completedSurveys.length > 0
      ? (completedSurveys.reduce((sum: number, s: Record<string, any>) => sum + (s.serviceScore || 0), 0) / completedSurveys.length).toFixed(1)
      : 0,
    avgStaffScore: completedSurveys.length > 0
      ? (completedSurveys.reduce((sum: number, s: Record<string, any>) => sum + (s.staffScore || 0), 0) / completedSurveys.length).toFixed(1)
      : 0,
  };

  // NPS 計算
  const npsData = (npsStats || {}) as any;
  const nps = {
    promoters: npsData.promoters || 0,
    passives: npsData.passives || 0,
    detractors: npsData.detractors || 0,
    score: npsData.score || npsData.nps || 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">滿意度調查</h1>
          <p className="text-muted-foreground">管理客戶滿意度調查與 NPS 分析</p>
        </div>
        <Button onClick={() => toast.info("請從客戶詳情頁面發送滿意度調查")}>
          <Send className="w-4 h-4 mr-2" />
          發送調查
        </Button>
      </div>

      {/* NPS 儀表板 */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            NPS 淨推薦值
          </CardTitle>
          <CardDescription>
            NPS = 推薦者比例 - 批評者比例（範圍：-100 到 100）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{nps.score}</div>
              <div className="text-sm text-muted-foreground mt-1">NPS 分數</div>
              <div className="text-xs mt-2">
                {nps.score >= 50 ? "🎉 優秀" : nps.score >= 0 ? "👍 良好" : "⚠️ 需改善"}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ThumbsUp className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold text-green-600">{nps.promoters}</span>
              </div>
              <div className="text-sm text-muted-foreground">推薦者 (9-10分)</div>
              <Progress value={nps.promoters} max={100} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="w-5 h-5 text-yellow-500">😐</span>
                <span className="text-2xl font-bold text-yellow-600">{nps.passives}</span>
              </div>
              <div className="text-sm text-muted-foreground">被動者 (7-8分)</div>
              <Progress value={nps.passives} max={100} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ThumbsDown className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold text-red-600">{nps.detractors}</span>
              </div>
              <div className="text-sm text-muted-foreground">批評者 (0-6分)</div>
              <Progress value={nps.detractors} max={100} className="mt-2 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">總調查數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">回覆率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.responseRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              整體評分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgOverallScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">服務評分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgServiceScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">人員評分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgStaffScore}</div>
          </CardContent>
        </Card>
      </div>

      {/* 篩選 */}
      <div className="flex gap-4 items-center">
        <Select onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="狀態篩選" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部狀態</SelectItem>
            <SelectItem value="pending">待填寫</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="expired">已過期</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => setSurveyTypeFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="調查類型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部類型</SelectItem>
            <SelectItem value="post_treatment">療程後</SelectItem>
            <SelectItem value="post_purchase">購買後</SelectItem>
            <SelectItem value="general">一般</SelectItem>
            <SelectItem value="nps">NPS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 調查列表 */}
      <Card>
        <CardHeader>
          <CardTitle>調查記錄</CardTitle>
          <CardDescription>共 {surveyList.length} 筆記錄</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">載入中...</div>
          ) : surveyList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">尚無調查記錄</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>客戶</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>整體評分</TableHead>
                  <TableHead>服務評分</TableHead>
                  <TableHead>人員評分</TableHead>
                  <TableHead>NPS</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>意見回饋</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveyList.map((survey: Record<string, any>) => {
                  const customer = customers?.data?.find(c => c.id === survey.customerId);
                  return (
                    <TableRow key={survey.id}>
                      <TableCell>
                        {new Date(survey.createdAt).toLocaleDateString('zh-TW')}
                      </TableCell>
                      <TableCell className="font-medium">{customer?.name || "未知"}</TableCell>
                      <TableCell>{getSurveyTypeBadge(survey.surveyType)}</TableCell>
                      <TableCell>{renderStars(survey.overallScore)}</TableCell>
                      <TableCell>{renderStars(survey.serviceScore)}</TableCell>
                      <TableCell>{renderStars(survey.staffScore)}</TableCell>
                      <TableCell>
                        {survey.npsScore !== null ? (
                          <Badge 
                            variant={survey.npsScore >= 9 ? "default" : survey.npsScore >= 7 ? "secondary" : "destructive"}
                          >
                            {survey.npsScore}
                          </Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(survey.status)}</TableCell>
                      <TableCell className="max-w-[200px]">
                        {survey.feedback ? (
                          <div className="flex items-start gap-1">
                            <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="truncate text-sm">{survey.feedback}</span>
                          </div>
                        ) : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 趨勢分析 */}
      {trend && trend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              滿意度趨勢
            </CardTitle>
            <CardDescription>近 6 個月的滿意度變化</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4">
              {trend.map((item: Record<string, any>, index: number) => (
                <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">{item.month}</div>
                  <div className="text-2xl font-bold mt-2">{item.avgScore?.toFixed(1) || "-"}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.count} 筆</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
