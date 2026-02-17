import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Users, AlertTriangle, Crown, Heart, TrendingDown, Star, DollarSign, Calendar, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RFMAnalysisPage() {
  const [segmentFilter, setSegmentFilter] = useState<string | undefined>();
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  
  const organizationId = 1;
  
  const { data: rfmData, isLoading, refetch } = trpc.rfm.list.useQuery({
    organizationId,
    segment: segmentFilter,
  });

  const { data: churnRiskList } = trpc.rfm.getChurnRiskList.useQuery({
    organizationId,
    minRisk: 50,
  });

  const { data: customers } = trpc.customer.list.useQuery({
    organizationId,
    limit: 200,
  });

  // 查詢最新任務狀態
  const { data: latestJob, refetch: refetchLatestJob } = trpc.rfm.getLatestJob.useQuery({
    organizationId,
  });

  // 查詢當前任務進度
  const { data: jobStatus, refetch: refetchJobStatus } = trpc.rfm.getJobStatus.useQuery(
    { jobId: currentJobId! },
    { enabled: !!currentJobId }
  );

  // 自動輪詢任務進度
  useEffect(() => {
    if (currentJobId && jobStatus?.status === 'running') {
      const interval = setInterval(() => {
        refetchJobStatus();
      }, 1000);
      return () => clearInterval(interval);
    }
    
    // 任務完成時
    if (jobStatus?.status === 'completed') {
      toast.success(`RFM 計算完成！已處理 ${jobStatus.processedItems} 位客戶`);
      refetch();
      setCurrentJobId(null);
    }
    
    // 任務失敗時
    if (jobStatus?.status === 'failed') {
      toast.error(`RFM 計算失敗：${jobStatus.errorMessage}`);
      setCurrentJobId(null);
    }
  }, [currentJobId, jobStatus?.status, jobStatus?.processedItems, jobStatus?.errorMessage, refetch, refetchJobStatus]);

  // 頁面載入時檢查是否有進行中的任務
  useEffect(() => {
    if (latestJob && (latestJob.status === 'pending' || latestJob.status === 'running')) {
      setCurrentJobId(latestJob.id);
    }
  }, [latestJob]);

  const calculateAllMutation = trpc.rfm.calculateAll.useMutation({
    onSuccess: (result) => {
      toast.info("RFM 計算任務已啟動，正在背景處理...");
      setCurrentJobId(result.jobId);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isCalculating = currentJobId !== null && (jobStatus?.status === 'pending' || jobStatus?.status === 'running');

  const getSegmentBadge = (segment: string) => {
    const segmentConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      champions: { label: "冠軍客戶", color: "bg-yellow-500", icon: <Crown className="w-3 h-3" /> },
      loyal_customers: { label: "忠誠客戶", color: "bg-green-500", icon: <Heart className="w-3 h-3" /> },
      potential_loyalists: { label: "潛力客戶", color: "bg-blue-500", icon: <Star className="w-3 h-3" /> },
      new_customers: { label: "新客戶", color: "bg-purple-500", icon: <Users className="w-3 h-3" /> },
      promising: { label: "有望客戶", color: "bg-cyan-500", icon: <TrendingDown className="w-3 h-3" /> },
      need_attention: { label: "需關注", color: "bg-orange-500", icon: <AlertTriangle className="w-3 h-3" /> },
      about_to_sleep: { label: "即將流失", color: "bg-red-400", icon: <AlertTriangle className="w-3 h-3" /> },
      at_risk: { label: "高風險", color: "bg-red-500", icon: <AlertTriangle className="w-3 h-3" /> },
      cant_lose_them: { label: "不能失去", color: "bg-red-600", icon: <AlertTriangle className="w-3 h-3" /> },
      hibernating: { label: "休眠中", color: "bg-gray-500", icon: <Users className="w-3 h-3" /> },
      lost: { label: "已流失", color: "bg-gray-700", icon: <Users className="w-3 h-3" /> },
    };
    const config = segmentConfig[segment] || { label: segment, color: "bg-gray-500", icon: null };
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return "text-red-600";
    if (risk >= 60) return "text-orange-500";
    if (risk >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  const getJobStatusBadge = () => {
    if (!latestJob) return null;
    
    const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: "等待中", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Clock className="w-3 h-3" /> },
      running: { label: "計算中", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
      completed: { label: "已完成", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <CheckCircle className="w-3 h-3" /> },
      failed: { label: "失敗", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <XCircle className="w-3 h-3" /> },
    };
    
    const config = statusConfig[latestJob.status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  // 計算統計數據
  const rfmList = rfmData || [];
  const stats = {
    total: rfmList.length,
    champions: rfmList.filter((r: Record<string, any>) => r.segment === "champions").length,
    atRisk: rfmList.filter((r: Record<string, any>) => ["at_risk", "cant_lose_them", "about_to_sleep"].includes(r.segment)).length,
    highChurnRisk: churnRiskList?.length || 0,
    avgRecency: rfmList.length > 0 
      ? Math.round(rfmList.reduce((sum: number, r: Record<string, any>) => sum + (r.recencyDays || 0), 0) / rfmList.length)
      : 0,
    avgFrequency: rfmList.length > 0
      ? (rfmList.reduce((sum: number, r: Record<string, any>) => sum + (r.frequency || 0), 0) / rfmList.length).toFixed(1)
      : 0,
    avgMonetary: rfmList.length > 0
      ? Math.round(rfmList.reduce((sum: number, r: Record<string, any>) => sum + Number(r.monetaryValue || 0), 0) / rfmList.length)
      : 0,
  };

  // 分群統計
  const segmentStats = rfmList.reduce((acc: Record<string, number>, r: Record<string, any>) => {
    acc[r.segment] = (acc[r.segment] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">RFM 客戶分析</h1>
          <p className="text-muted-foreground">基於消費行為的客戶價值分群分析</p>
        </div>
        <div className="flex items-center gap-3">
          {latestJob && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>上次計算：</span>
              {getJobStatusBadge()}
            </div>
          )}
          <Button 
            onClick={() => calculateAllMutation.mutate({ organizationId })}
            disabled={calculateAllMutation.isPending || isCalculating}
            className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-900"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? "計算中..." : "重新計算 RFM"}
          </Button>
        </div>
      </div>

      {/* 計算進度條 */}
      {isCalculating && jobStatus && (
        <Card className="border-gold-500/30 bg-gradient-to-r from-navy-800/50 to-navy-700/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />
                  <span className="font-medium text-gold-400">正在計算客戶 RFM 分數...</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {jobStatus.processedItems || 0} / {jobStatus.totalItems || 0} 位客戶
                </span>
              </div>
              <Progress value={jobStatus.progress || 0} className="h-3" />
              <p className="text-sm text-muted-foreground">
                進度：{jobStatus.progress || 0}%（背景處理中，您可以繼續使用其他功能）
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RFM 說明卡片 */}
      <Card className="bg-gradient-to-r from-navy-800/50 to-navy-700/50 border-gold-500/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-500/30">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gold-400">Recency (最近消費)</h3>
              <p className="text-sm text-muted-foreground">距離上次消費的天數，越近越好</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-green-500/30">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gold-400">Frequency (消費頻率)</h3>
              <p className="text-sm text-muted-foreground">消費次數，越多越好</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-purple-500/30">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gold-400">Monetary (消費金額)</h3>
              <p className="text-sm text-muted-foreground">總消費金額，越高越好</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gold-500/20 bg-navy-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">總客戶數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-400">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-gold-500/20 bg-navy-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              冠軍客戶
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.champions}</div>
          </CardContent>
        </Card>
        <Card className="border-gold-500/20 bg-navy-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              高風險客戶
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.atRisk}</div>
          </CardContent>
        </Card>
        <Card className="border-gold-500/20 bg-navy-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">平均消費金額</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-400">NT$ {stats.avgMonetary.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* 分群分佈 */}
      <Card className="border-gold-500/20">
        <CardHeader>
          <CardTitle className="text-gold-400">客戶分群分佈</CardTitle>
          <CardDescription>各分群的客戶數量統計</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(segmentStats).map(([segment, count]) => (
              <div key={segment} className="text-center p-4 bg-navy-800/50 rounded-lg border border-gold-500/10">
                {getSegmentBadge(segment)}
                <div className="text-2xl font-bold mt-2 text-gold-400">{count as number}</div>
                <div className="text-sm text-muted-foreground">
                  {((count as number) / stats.total * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 高流失風險客戶 */}
      {churnRiskList && churnRiskList.length > 0 && (
        <Card className="border-red-500/30 bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              高流失風險客戶警示
            </CardTitle>
            <CardDescription>流失風險超過 50% 的客戶，建議立即採取行動</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>客戶</TableHead>
                  <TableHead>分群</TableHead>
                  <TableHead>流失風險</TableHead>
                  <TableHead>最近消費</TableHead>
                  <TableHead>消費次數</TableHead>
                  <TableHead>總消費</TableHead>
                  <TableHead>建議行動</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {churnRiskList.slice(0, 10).map((rfm: Record<string, any>) => {
                  const customer = customers?.data?.find(c => c.id === rfm.customerId);
                  return (
                    <TableRow key={rfm.id}>
                      <TableCell className="font-medium">{customer?.name || "未知"}</TableCell>
                      <TableCell>{getSegmentBadge(rfm.segment)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={rfm.churnRisk} className="w-20 h-2" />
                          <span className={`font-bold ${getRiskColor(rfm.churnRisk)}`}>
                            {rfm.churnRisk}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{rfm.recencyDays} 天前</TableCell>
                      <TableCell>{rfm.frequency} 次</TableCell>
                      <TableCell>NT$ {Number(rfm.monetaryValue).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs border-gold-500/30 text-gold-400">
                          {rfm.churnRisk >= 80 ? "緊急關懷" : 
                           rfm.churnRisk >= 60 ? "優惠推播" : "定期追蹤"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 篩選 */}
      <div className="flex gap-4 items-center">
        <Select onValueChange={(v) => setSegmentFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-[200px] border-gold-500/30">
            <SelectValue placeholder="篩選分群" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分群</SelectItem>
            <SelectItem value="champions">冠軍客戶</SelectItem>
            <SelectItem value="loyal_customers">忠誠客戶</SelectItem>
            <SelectItem value="potential_loyalists">潛力客戶</SelectItem>
            <SelectItem value="new_customers">新客戶</SelectItem>
            <SelectItem value="need_attention">需關注</SelectItem>
            <SelectItem value="at_risk">高風險</SelectItem>
            <SelectItem value="cant_lose_them">不能失去</SelectItem>
            <SelectItem value="hibernating">休眠中</SelectItem>
            <SelectItem value="lost">已流失</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* RFM 詳細列表 */}
      <Card className="border-gold-500/20">
        <CardHeader>
          <CardTitle className="text-gold-400">客戶 RFM 分析詳情</CardTitle>
          <CardDescription>共 {rfmList.length} 位客戶</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">載入中...</div>
          ) : rfmList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              尚無 RFM 分析資料，請點擊「重新計算 RFM」按鈕
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>客戶</TableHead>
                  <TableHead>分群</TableHead>
                  <TableHead>R 分數</TableHead>
                  <TableHead>F 分數</TableHead>
                  <TableHead>M 分數</TableHead>
                  <TableHead>最近消費</TableHead>
                  <TableHead>消費次數</TableHead>
                  <TableHead>總消費</TableHead>
                  <TableHead>流失風險</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfmList.slice(0, 50).map((rfm: Record<string, any>) => {
                  const customer = customers?.data?.find(c => c.id === rfm.customerId);
                  return (
                    <TableRow key={rfm.id}>
                      <TableCell className="font-medium">{customer?.name || "未知"}</TableCell>
                      <TableCell>{getSegmentBadge(rfm.segment)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400">{rfm.recencyScore}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-green-500/30 text-green-400">{rfm.frequencyScore}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">{rfm.monetaryScore}</Badge>
                      </TableCell>
                      <TableCell>{rfm.recencyDays} 天前</TableCell>
                      <TableCell>{rfm.frequency} 次</TableCell>
                      <TableCell>NT$ {Number(rfm.monetaryValue).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={rfm.churnRisk || 0} className="w-16 h-2" />
                          <span className={`text-sm ${getRiskColor(rfm.churnRisk || 0)}`}>
                            {rfm.churnRisk || 0}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
