import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Scan, Plus, TrendingUp, Camera, History, Sparkles, Droplets, Sun, Zap } from "lucide-react";

// 膚質指標圖示對應
const metricIcons: Record<string, any> = {
  wrinkles: Zap,
  spots: Sun,
  pores: Droplets,
  texture: Sparkles,
  hydration: Droplets,
  oiliness: Droplets,
  redness: Sun,
  elasticity: Sparkles,
};

// 膚質指標中文名稱
const metricLabels: Record<string, string> = {
  wrinkles: "皺紋",
  spots: "斑點",
  pores: "毛孔",
  texture: "膚質",
  hydration: "保濕度",
  oiliness: "油脂分泌",
  redness: "泛紅",
  elasticity: "彈性",
};

// 分數顏色
const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

const getProgressColor = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

export default function SkinAnalysisPage() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [newAnalysisOpen, setNewAnalysisOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [analysisType, setAnalysisType] = useState("full_face");

  // 模擬客戶資料
  const mockCustomers = [
    { id: 1, name: "王小明" },
    { id: 2, name: "李小華" },
    { id: 3, name: "張美玲" },
  ];

  const { data: analysisRecords, refetch: refetchRecords } = trpc.skinAnalysis.listRecords.useQuery(
    { customerId: selectedCustomerId || 0 },
    { enabled: !!selectedCustomerId }
  );

  const { data: recordDetail } = trpc.skinAnalysis.getRecord.useQuery(
    { id: selectedRecordId || 0 },
    { enabled: !!selectedRecordId }
  );

  const { data: comparison } = trpc.skinAnalysis.compare.useQuery(
    { customerId: selectedCustomerId || 0 },
    { enabled: !!selectedCustomerId }
  );

  const createAnalysisMutation = trpc.skinAnalysis.create.useMutation({
    onSuccess: (data) => {
      toast.success("AI 膚質分析已完成");
      setNewAnalysisOpen(false);
      setPhotoUrl("");
      setSelectedRecordId(data.id);
      refetchRecords();
    },
    onError: (error) => {
      toast.error(`分析失敗: ${error.message}`);
    },
  });

  const handleCreateAnalysis = () => {
    if (!selectedCustomerId || !photoUrl) {
      toast.error("請選擇客戶並上傳照片");
      return;
    }
    createAnalysisMutation.mutate({
      organizationId: 1,
      customerId: selectedCustomerId,
      photoUrl,
      analysisType: analysisType as any,
    });
  };

  // 計算平均分數
  const calculateAverageScore = (metrics: Array<Record<string, any>>) => {
    if (!metrics?.length) return 0;
    return Math.round(metrics.reduce((sum, m) => sum + (m.score || 0), 0) / metrics.length);
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scan className="h-6 w-6 text-purple-500" />
            AI 膚質分析
          </h1>
          <p className="text-muted-foreground">智能分析客戶膚質狀況，追蹤療程效果</p>
        </div>
        <Dialog open={newAnalysisOpen} onOpenChange={setNewAnalysisOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增分析
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增 AI 膚質分析</DialogTitle>
              <DialogDescription>上傳客戶照片進行智能膚質分析</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>選擇客戶 *</Label>
                <Select onValueChange={(v) => setSelectedCustomerId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇客戶" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomers.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>分析區域</Label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_face">全臉</SelectItem>
                    <SelectItem value="forehead">額頭</SelectItem>
                    <SelectItem value="cheeks">臉頰</SelectItem>
                    <SelectItem value="chin">下巴</SelectItem>
                    <SelectItem value="nose">鼻子</SelectItem>
                    <SelectItem value="eyes">眼周</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>照片 URL *</Label>
                <Input 
                  placeholder="輸入照片 URL 或上傳照片"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  建議使用正面、光線均勻的素顏照片
                </p>
              </div>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  拖曳照片到此處或點擊上傳
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  選擇照片
                </Button>
              </div>
              <Button 
                onClick={handleCreateAnalysis} 
                disabled={createAnalysisMutation.isPending}
                className="w-full"
              >
                {createAnalysisMutation.isPending ? "分析中..." : "開始 AI 分析"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">總分析次數</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analysisRecords?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">平均膚質分數</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${getScoreColor(recordDetail?.metrics ? calculateAverageScore(recordDetail.metrics) : 0)}`}>
              {recordDetail?.metrics ? calculateAverageScore(recordDetail.metrics) : "-"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本月分析</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">
              {analysisRecords?.data?.filter(r => {
                const date = new Date(r.createdAt);
                return date.getMonth() === new Date().getMonth();
              }).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">改善趨勢</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <p className="text-2xl font-bold text-green-600">+5%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="analysis">
            <Scan className="h-4 w-4 mr-2" />
            分析結果
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            歷史記錄
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <TrendingUp className="h-4 w-4 mr-2" />
            趨勢比較
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 客戶選擇 */}
            <Card>
              <CardHeader>
                <CardTitle>選擇客戶</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select onValueChange={(v) => {
                  setSelectedCustomerId(parseInt(v));
                  setSelectedRecordId(null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇客戶查看分析" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomers.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedCustomerId && analysisRecords?.data && (
                  <div className="space-y-2">
                    <Label>選擇分析記錄</Label>
                    <Select onValueChange={(v) => setSelectedRecordId(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇記錄" />
                      </SelectTrigger>
                      <SelectContent>
                        {analysisRecords.data.map((r) => (
                          <SelectItem key={r.id} value={r.id.toString()}>
                            {new Date(r.createdAt).toLocaleDateString("zh-TW")} - {r.analysisType === 'full_face' ? '全臉' : r.analysisType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 分析結果 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>膚質分析結果</CardTitle>
                <CardDescription>
                  {recordDetail 
                    ? `分析日期：${new Date(recordDetail.createdAt).toLocaleDateString("zh-TW")}`
                    : "請選擇客戶和分析記錄"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recordDetail?.metrics ? (
                  <div className="grid grid-cols-2 gap-4">
                    {recordDetail.metrics.map((metric) => {
                      const Icon = metricIcons[metric.metricType] || Sparkles;
                      return (
                        <div key={metric.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {metricLabels[metric.metricType] || metric.metricType}
                              </span>
                            </div>
                            <span className={`text-lg font-bold ${getScoreColor(metric.score || 0)}`}>
                              {metric.score}
                            </span>
                          </div>
                          <Progress 
                            value={metric.score || 0} 
                            className="h-2"
                          />
                          {metric.severity && (
                            <Badge variant="outline" className="mt-2">
                              {metric.severity === 'mild' ? '輕微' : 
                               metric.severity === 'moderate' ? '中度' : 
                               metric.severity === 'severe' ? '嚴重' : metric.severity}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Scan className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>請選擇客戶和分析記錄查看結果</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI 建議 */}
          {recordDetail && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI 療程建議
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">保濕護理</h4>
                    <p className="text-sm text-purple-700">
                      建議進行玻尿酸保濕療程，改善肌膚水分含量
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">抗老緊緻</h4>
                    <p className="text-sm text-blue-700">
                      建議進行電波拉皮或音波拉提，提升肌膚彈性
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">美白淡斑</h4>
                    <p className="text-sm text-green-700">
                      建議進行皮秒雷射，改善色素沉澱問題
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>分析歷史記錄</CardTitle>
              <CardDescription>查看客戶的所有膚質分析記錄</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-64">
                <Label>選擇客戶</Label>
                <Select onValueChange={(v) => setSelectedCustomerId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇客戶" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomers.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomerId && analysisRecords?.data && (
                <div className="space-y-4">
                  {analysisRecords.data.map((record) => (
                    <div 
                      key={record.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedRecordId(record.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <Camera className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {record.analysisType === 'full_face' ? '全臉分析' : record.analysisType}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.createdAt).toLocaleString("zh-TW")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="default">
                          已完成
                        </Badge>
                        <Button variant="outline" size="sm">
                          查看詳情
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!analysisRecords.data.length && (
                    <p className="text-center text-muted-foreground py-8">
                      尚無分析記錄
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>膚質趨勢比較</CardTitle>
              <CardDescription>追蹤客戶膚質改善趨勢</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-64">
                <Label>選擇客戶</Label>
                <Select onValueChange={(v) => setSelectedCustomerId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇客戶" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomers.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {comparison?.length ? (
                <div className="space-y-6">
                  {Object.keys(metricLabels).map((metricType) => {
                    // comparison 返回的是分析記錄陣列，需要從 metrics 中提取
                    const records = comparison.filter(c => c.metrics?.some((m: Record<string, any>) => m.metricType === metricType));
                    if (!records.length) return null;
                    
                    const latestMetric = records[0]?.metrics?.find((m: Record<string, any>) => m.metricType === metricType);
                    const previousMetric = records[1]?.metrics?.find((m: Record<string, any>) => m.metricType === metricType);
                    const latest = latestMetric?.score || 0;
                    const previous = previousMetric?.score || latest;
                    const change = latest - previous;
                    
                    return (
                      <div key={metricType} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{metricLabels[metricType]}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${getScoreColor(latest)}`}>
                              {latest}
                            </span>
                            {change !== 0 && (
                              <Badge variant={change > 0 ? "default" : "destructive"}>
                                {change > 0 ? `+${change}` : change}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Progress value={latest} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {selectedCustomerId ? "需要至少兩次分析記錄才能比較趨勢" : "請選擇客戶查看趨勢"}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
