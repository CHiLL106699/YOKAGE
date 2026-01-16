import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  AlertTriangle,
  Target,
  Brain,
  Sparkles,
  Download,
  RefreshCw,
  ChevronRight,
  Star,
  Clock,
  DollarSign,
  Calendar,
  UserMinus,
  UserPlus,
  Zap
} from "lucide-react";

// 模擬 RFM 分析資料
const rfmSegments = [
  { 
    segment: "冠軍客戶", 
    description: "高頻率、高消費、近期活躍",
    count: 45, 
    percentage: 15,
    avgSpend: 125000,
    color: "bg-yellow-500",
    recommendation: "維持關係，提供 VIP 專屬服務"
  },
  { 
    segment: "忠誠客戶", 
    description: "穩定消費、中高頻率",
    count: 89, 
    percentage: 30,
    avgSpend: 68000,
    color: "bg-green-500",
    recommendation: "推薦升級療程，增加客單價"
  },
  { 
    segment: "潛力客戶", 
    description: "近期活躍、消費潛力大",
    count: 67, 
    percentage: 22,
    avgSpend: 35000,
    color: "bg-blue-500",
    recommendation: "推送優惠券，刺激回購"
  },
  { 
    segment: "需關注客戶", 
    description: "消費頻率下降中",
    count: 52, 
    percentage: 17,
    avgSpend: 28000,
    color: "bg-orange-500",
    recommendation: "主動關懷，了解流失原因"
  },
  { 
    segment: "流失風險", 
    description: "長時間未消費",
    count: 47, 
    percentage: 16,
    avgSpend: 15000,
    color: "bg-red-500",
    recommendation: "發送召回優惠，嘗試挽回"
  }
];

// 模擬流失預警客戶
const churnRiskCustomers = [
  {
    id: "cust-001",
    name: "王小美",
    lastVisit: "2023-11-15",
    daysSinceVisit: 62,
    totalSpend: 85000,
    visitCount: 8,
    riskScore: 85,
    riskLevel: "high",
    predictedReason: "療程週期結束後未回訪"
  },
  {
    id: "cust-002",
    name: "李大明",
    lastVisit: "2023-12-01",
    daysSinceVisit: 46,
    totalSpend: 125000,
    visitCount: 12,
    riskScore: 72,
    riskLevel: "high",
    predictedReason: "消費頻率明顯下降"
  },
  {
    id: "cust-003",
    name: "張小華",
    lastVisit: "2023-12-10",
    daysSinceVisit: 37,
    totalSpend: 45000,
    visitCount: 5,
    riskScore: 58,
    riskLevel: "medium",
    predictedReason: "預約取消率上升"
  },
  {
    id: "cust-004",
    name: "陳美玲",
    lastVisit: "2023-12-15",
    daysSinceVisit: 32,
    totalSpend: 68000,
    visitCount: 7,
    riskScore: 45,
    riskLevel: "medium",
    predictedReason: "回訪間隔延長"
  }
];

// 模擬療程推薦
const treatmentRecommendations = [
  {
    customerId: "cust-005",
    customerName: "林小芳",
    currentTreatments: ["玻尿酸填充", "美白導入"],
    recommendedTreatment: "肉毒桿菌除皺",
    confidence: 92,
    reason: "根據年齡層與消費偏好，87% 的相似客戶會選擇此療程",
    expectedRevenue: 8000
  },
  {
    customerId: "cust-006",
    customerName: "周大偉",
    currentTreatments: ["皮秒雷射"],
    recommendedTreatment: "音波拉提",
    confidence: 85,
    reason: "皮秒療程後 3 個月，適合進行緊緻療程",
    expectedRevenue: 35000
  },
  {
    customerId: "cust-007",
    customerName: "吳小琪",
    currentTreatments: ["美白導入", "保濕療程"],
    recommendedTreatment: "皮秒雷射淨膚",
    confidence: 78,
    reason: "基礎保養客戶升級進階療程的最佳時機",
    expectedRevenue: 6000
  }
];

// 模擬營收預測
const revenueForecast = {
  currentMonth: 1250000,
  nextMonth: 1380000,
  growth: 10.4,
  factors: [
    { name: "季節性因素", impact: "+5%", description: "春節前美容需求上升" },
    { name: "新客轉換", impact: "+3%", description: "預計 15 位新客完成首次消費" },
    { name: "回購率", impact: "+2%", description: "VIP 客戶回購率維持穩定" }
  ]
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("rfm");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">進階數據分析</h1>
            <p className="text-gray-500 mt-1">AI 驅動的客戶洞察與營收預測</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              更新分析
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              匯出報告
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">客戶總數</p>
                  <p className="text-2xl font-bold">300</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+12% 本月</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">流失風險</p>
                  <p className="text-2xl font-bold text-red-600">47</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <UserMinus className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span>需立即關注</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">預測營收</p>
                  <p className="text-2xl font-bold">NT$1.38M</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+10.4% 下月預測</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">AI 推薦</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-purple-600">
                <Sparkles className="w-4 h-4" />
                <span>待執行推薦</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="rfm">
              <Target className="w-4 h-4 mr-2" />
              RFM 分群
            </TabsTrigger>
            <TabsTrigger value="churn">
              <UserMinus className="w-4 h-4 mr-2" />
              流失預警
            </TabsTrigger>
            <TabsTrigger value="recommend">
              <Sparkles className="w-4 h-4 mr-2" />
              療程推薦
            </TabsTrigger>
            <TabsTrigger value="forecast">
              <TrendingUp className="w-4 h-4 mr-2" />
              營收預測
            </TabsTrigger>
          </TabsList>

          {/* RFM Analysis */}
          <TabsContent value="rfm" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  RFM 客戶分群分析
                </CardTitle>
                <CardDescription>
                  根據 Recency（最近消費）、Frequency（消費頻率）、Monetary（消費金額）進行客戶分群
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rfmSegments.map((segment, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${segment.color}`} />
                          <div>
                            <h4 className="font-medium">{segment.segment}</h4>
                            <p className="text-sm text-gray-500">{segment.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{segment.count}</p>
                          <p className="text-sm text-gray-500">{segment.percentage}%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          平均消費：NT${segment.avgSpend.toLocaleString()}
                        </span>
                        <Badge variant="outline">{segment.recommendation}</Badge>
                      </div>
                      <div className="mt-2 bg-gray-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${segment.color}`}
                          style={{ width: `${segment.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Churn Prediction */}
          <TabsContent value="churn" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  客戶流失預警
                </CardTitle>
                <CardDescription>
                  AI 模型預測可能流失的客戶，建議立即採取挽回行動
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {churnRiskCustomers.map((customer) => (
                    <div key={customer.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{customer.name}</h4>
                            <Badge 
                              variant={customer.riskLevel === "high" ? "destructive" : "outline"}
                              className={customer.riskLevel === "medium" ? "bg-orange-100 text-orange-800" : ""}
                            >
                              {customer.riskLevel === "high" ? "高風險" : "中風險"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {customer.predictedReason}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span className="text-2xl font-bold text-red-600">{customer.riskScore}</span>
                            <span className="text-sm text-gray-500">分</span>
                          </div>
                          <p className="text-xs text-gray-400">流失風險</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-500">最後到訪</p>
                          <p className="font-medium">{customer.daysSinceVisit} 天前</p>
                        </div>
                        <div>
                          <p className="text-gray-500">累計消費</p>
                          <p className="font-medium">NT${customer.totalSpend.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">到訪次數</p>
                          <p className="font-medium">{customer.visitCount} 次</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          發送關懷訊息
                        </Button>
                        <Button size="sm" className="flex-1">
                          發送優惠券
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treatment Recommendations */}
          <TabsContent value="recommend" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI 療程推薦
                </CardTitle>
                <CardDescription>
                  根據客戶歷史消費與相似客戶行為，智能推薦最適合的療程
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {treatmentRecommendations.map((rec, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{rec.customerName}</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rec.currentTreatments.map((t, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Brain className="w-4 h-4 text-purple-500" />
                            <span className="font-bold text-purple-600">{rec.confidence}%</span>
                          </div>
                          <p className="text-xs text-gray-400">推薦信心度</p>
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-purple-800">推薦：{rec.recommendedTreatment}</span>
                        </div>
                        <p className="text-sm text-purple-700">{rec.reason}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          預期營收：NT${rec.expectedRevenue.toLocaleString()}
                        </span>
                        <Button size="sm">
                          發送推薦
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Forecast */}
          <TabsContent value="forecast" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    營收預測
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-gray-500">本月營收</p>
                      <p className="text-3xl font-bold">
                        NT${revenueForecast.currentMonth.toLocaleString()}
                      </p>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-500">下月預測</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-green-600">
                          NT${revenueForecast.nextMonth.toLocaleString()}
                        </p>
                        <Badge className="bg-green-100 text-green-800">
                          +{revenueForecast.growth}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>影響因素分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueForecast.factors.map((factor, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`px-2 py-1 rounded text-sm font-medium ${
                          factor.impact.startsWith("+") 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {factor.impact}
                        </div>
                        <div>
                          <p className="font-medium">{factor.name}</p>
                          <p className="text-sm text-gray-500">{factor.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trend Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>月度營收趨勢</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <p>營收趨勢圖表</p>
                    <p className="text-sm">（整合 Chart.js 後顯示）</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
