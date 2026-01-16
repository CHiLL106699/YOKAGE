import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Brain,
  Sparkles,
  Target,
  Users,
  TrendingUp,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Zap,
  Gift,
  ShoppingBag,
  Calendar,
  ArrowRight
} from "lucide-react";

// 推薦規則
const recommendationRules = [
  {
    id: 1,
    name: "療程升級推薦",
    description: "根據顧客過往療程紀錄，推薦進階療程",
    trigger: "完成基礎療程 3 次以上",
    action: "推薦進階療程",
    status: "active",
    conversions: 45,
    revenue: 680000
  },
  {
    id: 2,
    name: "回購提醒",
    description: "療程效果即將消退時自動提醒",
    trigger: "距離上次療程 2-3 個月",
    action: "發送回購提醒",
    status: "active",
    conversions: 89,
    revenue: 1250000
  },
  {
    id: 3,
    name: "交叉銷售",
    description: "根據購買紀錄推薦相關產品",
    trigger: "購買特定療程",
    action: "推薦搭配產品",
    status: "active",
    conversions: 67,
    revenue: 420000
  },
  {
    id: 4,
    name: "生日優惠",
    description: "生日月份自動發送專屬優惠",
    trigger: "生日前 7 天",
    action: "發送生日優惠券",
    status: "paused",
    conversions: 23,
    revenue: 180000
  }
];

// 個人化推薦
const personalizedRecommendations = [
  {
    id: 1,
    customer: "王小美",
    currentTreatment: "玻尿酸 - 蘋果肌",
    recommendation: "音波拉提",
    reason: "根據膚質分析，建議搭配音波拉提提升整體效果",
    confidence: 92,
    expectedRevenue: 35000
  },
  {
    id: 2,
    customer: "李小華",
    currentTreatment: "皮秒雷射",
    recommendation: "保濕導入療程",
    reason: "雷射後皮膚較乾燥，建議搭配保濕療程",
    confidence: 88,
    expectedRevenue: 8000
  },
  {
    id: 3,
    customer: "張大偉",
    currentTreatment: "肉毒桿菌",
    recommendation: "玻尿酸 - 法令紋",
    reason: "抬頭紋改善後，法令紋較為明顯",
    confidence: 85,
    expectedRevenue: 25000
  }
];

export default function RecommendationEnginePage() {
  const [activeTab, setActiveTab] = useState("overview");

  const totalConversions = recommendationRules.reduce((sum, r) => sum + r.conversions, 0);
  const totalRevenue = recommendationRules.reduce((sum, r) => sum + r.revenue, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">智能推薦引擎</h1>
            <p className="text-gray-500 mt-1">AI 驅動的個人化療程與產品推薦</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              重新訓練模型
            </Button>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              推薦設定
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">推薦規則</p>
                  <p className="text-2xl font-bold">{recommendationRules.length}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">轉換數</p>
                  <p className="text-2xl font-bold">{totalConversions}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">推薦營收</p>
                  <p className="text-2xl font-bold">NT${(totalRevenue / 10000).toFixed(0)}萬</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">轉換率</p>
                  <p className="text-2xl font-bold">23%</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">模型準確度</p>
                  <p className="text-2xl font-bold">89%</p>
                </div>
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              總覽
            </TabsTrigger>
            <TabsTrigger value="rules">
              <Settings className="w-4 h-4 mr-2" />
              推薦規則
            </TabsTrigger>
            <TabsTrigger value="personalized">
              <Users className="w-4 h-4 mr-2" />
              個人化推薦
            </TabsTrigger>
            <TabsTrigger value="products">
              <ShoppingBag className="w-4 h-4 mr-2" />
              產品推薦
            </TabsTrigger>
            <TabsTrigger value="timing">
              <Calendar className="w-4 h-4 mr-2" />
              時機推薦
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>推薦效果分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendationRules.map((rule) => (
                      <div key={rule.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{rule.name}</span>
                          <Badge className={rule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {rule.status === 'active' ? '啟用中' : '已暫停'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">轉換數</p>
                            <p className="font-semibold">{rule.conversions}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">營收貢獻</p>
                            <p className="font-semibold text-green-600">NT${(rule.revenue / 1000).toFixed(0)}K</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>推薦類型分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: "療程升級", percent: 35, color: "bg-purple-500" },
                      { type: "回購提醒", percent: 30, color: "bg-blue-500" },
                      { type: "交叉銷售", percent: 20, color: "bg-green-500" },
                      { type: "新客推薦", percent: 15, color: "bg-yellow-500" }
                    ].map((item) => (
                      <div key={item.type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.type}</span>
                          <span className="font-medium">{item.percent}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>推薦規則管理</CardTitle>
                  <Button>
                    <Zap className="w-4 h-4 mr-2" />
                    新增規則
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendationRules.map((rule) => (
                    <div key={rule.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{rule.name}</h4>
                            <Badge className={rule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {rule.status === 'active' ? '啟用中' : '已暫停'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{rule.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span>觸發：{rule.trigger}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                              <Zap className="w-4 h-4 text-green-600" />
                              <span>動作：{rule.action}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">轉換</p>
                            <p className="font-semibold">{rule.conversions}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">營收</p>
                            <p className="font-semibold text-green-600">NT${(rule.revenue / 1000).toFixed(0)}K</p>
                          </div>
                          <Switch checked={rule.status === 'active'} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personalized Tab */}
          <TabsContent value="personalized" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>個人化推薦列表</CardTitle>
                <CardDescription>AI 根據顧客資料生成的個人化推薦</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {personalizedRecommendations.map((rec) => (
                    <div key={rec.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback>{rec.customer.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{rec.customer}</h4>
                            <p className="text-sm text-gray-500">目前療程：{rec.currentTreatment}</p>
                            <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <span className="font-medium text-purple-800">推薦：{rec.recommendation}</span>
                              </div>
                              <p className="text-sm text-purple-600">{rec.reason}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">信心度</p>
                            <p className="font-semibold text-purple-600">{rec.confidence}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">預估營收</p>
                            <p className="font-semibold text-green-600">NT${rec.expectedRevenue.toLocaleString()}</p>
                          </div>
                          <Button size="sm">
                            發送推薦
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>產品推薦組合</CardTitle>
                <CardDescription>根據療程自動推薦搭配產品</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { treatment: "玻尿酸注射", products: ["修復精華", "保濕面膜", "防曬乳"], conversions: 45 },
                    { treatment: "皮秒雷射", products: ["修復霜", "舒緩噴霧", "美白精華"], conversions: 38 },
                    { treatment: "音波拉提", products: ["緊緻精華", "膠原蛋白飲", "眼霜"], conversions: 28 }
                  ].map((combo, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{combo.treatment}</h4>
                        <Badge variant="secondary">{combo.conversions} 次轉換</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {combo.products.map((product, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Gift className="w-4 h-4 text-pink-600" />
                            <span className="text-sm">{product}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timing Tab */}
          <TabsContent value="timing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>最佳推薦時機</CardTitle>
                <CardDescription>AI 分析的最佳推薦時間點</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { timing: "療程後 7 天", action: "發送術後關懷與產品推薦", openRate: 68, conversion: 23 },
                    { timing: "療程後 2 個月", action: "發送回購提醒", openRate: 55, conversion: 18 },
                    { timing: "生日前 7 天", action: "發送生日優惠", openRate: 72, conversion: 31 },
                    { timing: "節慶前 14 天", action: "發送節慶優惠", openRate: 48, conversion: 15 }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{item.timing}</span>
                          </div>
                          <p className="text-sm text-gray-500">{item.action}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">開信率</p>
                            <p className="font-semibold">{item.openRate}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">轉換率</p>
                            <p className="font-semibold text-green-600">{item.conversion}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
