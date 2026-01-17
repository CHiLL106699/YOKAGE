import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Users, AlertTriangle, Crown, Heart, TrendingDown, Star, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function RFMAnalysisPage() {
  const [segmentFilter, setSegmentFilter] = useState<string | undefined>();
  
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

  const calculateAllMutation = trpc.rfm.calculateAll.useMutation({
    onSuccess: (result) => {
      toast.success(`已更新 ${result.processed} 位客戶的 RFM 分數`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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

  // 計算統計數據
  const rfmList = rfmData || [];
  const stats = {
    total: rfmList.length,
    champions: rfmList.filter((r: any) => r.segment === "champions").length,
    atRisk: rfmList.filter((r: any) => ["at_risk", "cant_lose_them", "about_to_sleep"].includes(r.segment)).length,
    highChurnRisk: churnRiskList?.length || 0,
    avgRecency: rfmList.length > 0 
      ? Math.round(rfmList.reduce((sum: number, r: any) => sum + (r.recencyDays || 0), 0) / rfmList.length)
      : 0,
    avgFrequency: rfmList.length > 0
      ? (rfmList.reduce((sum: number, r: any) => sum + (r.frequency || 0), 0) / rfmList.length).toFixed(1)
      : 0,
    avgMonetary: rfmList.length > 0
      ? Math.round(rfmList.reduce((sum: number, r: any) => sum + Number(r.monetaryValue || 0), 0) / rfmList.length)
      : 0,
  };

  // 分群統計
  const segmentStats = rfmList.reduce((acc: Record<string, number>, r: any) => {
    acc[r.segment] = (acc[r.segment] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">RFM 客戶分析</h1>
          <p className="text-muted-foreground">基於消費行為的客戶價值分群分析</p>
        </div>
        <Button 
          onClick={() => calculateAllMutation.mutate({ organizationId })}
          disabled={calculateAllMutation.isPending}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${calculateAllMutation.isPending ? 'animate-spin' : ''}`} />
          {calculateAllMutation.isPending ? "計算中..." : "重新計算 RFM"}
        </Button>
      </div>

      {/* RFM 說明卡片 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold">Recency (最近消費)</h3>
              <p className="text-sm text-muted-foreground">距離上次消費的天數，越近越好</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold">Frequency (消費頻率)</h3>
              <p className="text-sm text-muted-foreground">消費次數，越多越好</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold">Monetary (消費金額)</h3>
              <p className="text-sm text-muted-foreground">總消費金額，越高越好</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">總客戶數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              冠軍客戶
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.champions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              高風險客戶
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.atRisk}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">平均消費金額</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NT$ {stats.avgMonetary.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* 分群分佈 */}
      <Card>
        <CardHeader>
          <CardTitle>客戶分群分佈</CardTitle>
          <CardDescription>各分群的客戶數量統計</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(segmentStats).map(([segment, count]) => (
              <div key={segment} className="text-center p-4 bg-muted/50 rounded-lg">
                {getSegmentBadge(segment)}
                <div className="text-2xl font-bold mt-2">{count as number}</div>
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
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
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
                {churnRiskList.slice(0, 10).map((rfm: any) => {
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
                        <Badge variant="outline" className="text-xs">
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
          <SelectTrigger className="w-[200px]">
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
      <Card>
        <CardHeader>
          <CardTitle>客戶 RFM 分析詳情</CardTitle>
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
                  <TableHead>總消費金額</TableHead>
                  <TableHead>流失風險</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfmList.map((rfm: any) => {
                  const customer = customers?.data?.find(c => c.id === rfm.customerId);
                  return (
                    <TableRow key={rfm.id}>
                      <TableCell className="font-medium">{customer?.name || "未知"}</TableCell>
                      <TableCell>{getSegmentBadge(rfm.segment)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rfm.recencyScore}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rfm.frequencyScore}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rfm.monetaryScore}</Badge>
                      </TableCell>
                      <TableCell>{rfm.recencyDays} 天前</TableCell>
                      <TableCell>{rfm.frequency} 次</TableCell>
                      <TableCell>NT$ {Number(rfm.monetaryValue).toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${getRiskColor(rfm.churnRisk || 0)}`}>
                          {rfm.churnRisk || 0}%
                        </span>
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
