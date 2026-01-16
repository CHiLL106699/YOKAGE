import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Workflow,
  Zap,
  Target,
  Users,
  Mail,
  MessageSquare,
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  Play,
  Pause,
  Plus,
  Edit,
  Copy,
  Trash2,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  Gift,
  Heart,
  Star,
  Bell,
  Filter,
  Tag,
  Sparkles,
  Send
} from "lucide-react";

// 顧客旅程模板
const journeyTemplates = [
  {
    id: "new_customer",
    name: "新客歡迎旅程",
    description: "新會員加入後的自動化歡迎流程",
    trigger: "會員註冊",
    steps: 5,
    color: "bg-blue-500"
  },
  {
    id: "birthday",
    name: "生日祝福旅程",
    description: "生日前後的自動祝福與優惠推送",
    trigger: "生日前 7 天",
    steps: 3,
    color: "bg-pink-500"
  },
  {
    id: "aftercare",
    name: "術後關懷旅程",
    description: "療程後的自動追蹤與關懷",
    trigger: "療程完成",
    steps: 4,
    color: "bg-purple-500"
  },
  {
    id: "reactivation",
    name: "沉睡喚醒旅程",
    description: "喚醒長期未消費的會員",
    trigger: "90 天未消費",
    steps: 4,
    color: "bg-orange-500"
  }
];

// 已建立的自動化旅程
const activeJourneys = [
  {
    id: 1,
    name: "新客歡迎禮",
    status: "active",
    trigger: "會員註冊",
    enrolled: 1234,
    completed: 987,
    conversionRate: 23,
    lastTriggered: "2 小時前"
  },
  {
    id: 2,
    name: "生日專屬優惠",
    status: "active",
    trigger: "生日前 7 天",
    enrolled: 456,
    completed: 398,
    conversionRate: 45,
    lastTriggered: "5 小時前"
  },
  {
    id: 3,
    name: "術後 3 天關懷",
    status: "active",
    trigger: "療程完成",
    enrolled: 789,
    completed: 756,
    conversionRate: 67,
    lastTriggered: "1 小時前"
  },
  {
    id: 4,
    name: "VIP 專屬活動",
    status: "paused",
    trigger: "VIP 會員",
    enrolled: 234,
    completed: 189,
    conversionRate: 34,
    lastTriggered: "3 天前"
  }
];

// 分眾標籤
const audienceSegments = [
  { id: 1, name: "新客", count: 1234, color: "bg-blue-100 text-blue-800" },
  { id: 2, name: "VIP 會員", count: 567, color: "bg-purple-100 text-purple-800" },
  { id: 3, name: "高消費", count: 345, color: "bg-green-100 text-green-800" },
  { id: 4, name: "待回訪", count: 890, color: "bg-orange-100 text-orange-800" },
  { id: 5, name: "生日月", count: 123, color: "bg-pink-100 text-pink-800" },
  { id: 6, name: "玻尿酸愛好者", count: 456, color: "bg-cyan-100 text-cyan-800" }
];

export default function MarketingAutomationPage() {
  const [activeTab, setActiveTab] = useState("journeys");
  const [showJourneyBuilder, setShowJourneyBuilder] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">行銷自動化</h1>
            <p className="text-gray-500 mt-1">設計顧客旅程、自動化推播與分眾行銷</p>
          </div>
          <Button onClick={() => setShowJourneyBuilder(true)}>
            <Plus className="w-4 h-4 mr-2" />
            建立旅程
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">活躍旅程</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Workflow className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">本月觸發</p>
                  <p className="text-2xl font-bold">8,456</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">平均轉換率</p>
                  <p className="text-2xl font-bold">34%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">自動化營收</p>
                  <p className="text-2xl font-bold">NT$234K</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="journeys">
              <Workflow className="w-4 h-4 mr-2" />
              顧客旅程
            </TabsTrigger>
            <TabsTrigger value="segments">
              <Users className="w-4 h-4 mr-2" />
              分眾管理
            </TabsTrigger>
            <TabsTrigger value="triggers">
              <Zap className="w-4 h-4 mr-2" />
              觸發條件
            </TabsTrigger>
            <TabsTrigger value="ab-test">
              <BarChart3 className="w-4 h-4 mr-2" />
              A/B 測試
            </TabsTrigger>
          </TabsList>

          {/* Journeys Tab */}
          <TabsContent value="journeys" className="space-y-6">
            {/* Journey Templates */}
            <Card>
              <CardHeader>
                <CardTitle>旅程模板</CardTitle>
                <CardDescription>選擇預建模板快速建立自動化旅程</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {journeyTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className="p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:border-primary"
                    >
                      <div className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center mb-3`}>
                        <Workflow className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                        <Zap className="w-3 h-3" />
                        <span>{template.trigger}</span>
                        <span>•</span>
                        <span>{template.steps} 步驟</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Journeys */}
            <Card>
              <CardHeader>
                <CardTitle>進行中的旅程</CardTitle>
                <CardDescription>管理您的自動化行銷旅程</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeJourneys.map((journey) => (
                    <div key={journey.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            journey.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <Workflow className={`w-5 h-5 ${
                              journey.status === 'active' ? 'text-green-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{journey.name}</h4>
                              <Badge className={journey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {journey.status === 'active' ? '運行中' : '已暫停'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Zap className="w-3 h-3" />
                              <span>{journey.trigger}</span>
                              <span>•</span>
                              <span>最後觸發：{journey.lastTriggered}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            {journey.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{journey.enrolled}</p>
                          <p className="text-xs text-gray-500">進入旅程</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{journey.completed}</p>
                          <p className="text-xs text-gray-500">完成旅程</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{journey.conversionRate}%</p>
                          <p className="text-xs text-gray-500">轉換率</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Journey Builder Preview */}
            <Card>
              <CardHeader>
                <CardTitle>旅程設計器預覽</CardTitle>
                <CardDescription>視覺化設計您的顧客旅程</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-4">
                    {/* Trigger */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-sm mt-2 font-medium">觸發</span>
                      <span className="text-xs text-gray-500">會員註冊</span>
                    </div>
                    
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                    
                    {/* Wait */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center">
                        <Clock className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-sm mt-2 font-medium">等待</span>
                      <span className="text-xs text-gray-500">1 小時</span>
                    </div>
                    
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                    
                    {/* Send Message */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-sm mt-2 font-medium">發送</span>
                      <span className="text-xs text-gray-500">歡迎訊息</span>
                    </div>
                    
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                    
                    {/* Condition */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center transform rotate-45">
                        <Filter className="w-8 h-8 text-white transform -rotate-45" />
                      </div>
                      <span className="text-sm mt-2 font-medium">條件</span>
                      <span className="text-xs text-gray-500">是否開啟</span>
                    </div>
                    
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                    
                    {/* Send Coupon */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center">
                        <Gift className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-sm mt-2 font-medium">發送</span>
                      <span className="text-xs text-gray-500">優惠券</span>
                    </div>
                    
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                    
                    {/* End */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-sm mt-2 font-medium">完成</span>
                      <span className="text-xs text-gray-500">標記標籤</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>分眾標籤管理</CardTitle>
                    <CardDescription>管理顧客分群與自動標籤</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新增分眾
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {audienceSegments.map((segment) => (
                    <div key={segment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={segment.color}>{segment.name}</Badge>
                        <span className="text-2xl font-bold">{segment.count}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Send className="w-4 h-4 mr-1" />
                          推播
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Auto Tagging Rules */}
            <Card>
              <CardHeader>
                <CardTitle>自動標籤規則</CardTitle>
                <CardDescription>根據行為自動為顧客貼標</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rule: "消費滿 NT$50,000", tag: "VIP 會員", count: 567 },
                    { rule: "90 天未消費", tag: "待回訪", count: 890 },
                    { rule: "購買玻尿酸 3 次以上", tag: "玻尿酸愛好者", count: 456 },
                    { rule: "本月生日", tag: "生日月", count: 123 },
                    { rule: "首次消費", tag: "新客", count: 1234 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <span>{item.rule}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <Badge variant="secondary">{item.tag}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{item.count} 人</span>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Triggers Tab */}
          <TabsContent value="triggers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>觸發條件設定</CardTitle>
                <CardDescription>設定自動化行銷的觸發時機</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 行為觸發 */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-blue-500" />
                      行為觸發
                    </h4>
                    <div className="space-y-2">
                      {[
                        "會員註冊",
                        "首次消費",
                        "療程完成",
                        "購物車放棄",
                        "點擊特定連結"
                      ].map((trigger, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{trigger}</span>
                          <Badge variant="outline">啟用</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 時間觸發 */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-purple-500" />
                      時間觸發
                    </h4>
                    <div className="space-y-2">
                      {[
                        "生日前 7 天",
                        "療程後 3 天",
                        "90 天未消費",
                        "會員到期前 30 天",
                        "每週一早上 10:00"
                      ].map((trigger, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{trigger}</span>
                          <Badge variant="outline">啟用</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 事件觸發 */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 mb-4">
                      <Bell className="w-5 h-5 text-yellow-500" />
                      事件觸發
                    </h4>
                    <div className="space-y-2">
                      {[
                        "預約確認",
                        "預約取消",
                        "付款成功",
                        "退款完成",
                        "評價提交"
                      ].map((trigger, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{trigger}</span>
                          <Badge variant="outline">啟用</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 標籤觸發 */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 mb-4">
                      <Tag className="w-5 h-5 text-green-500" />
                      標籤觸發
                    </h4>
                    <div className="space-y-2">
                      {[
                        "新增 VIP 標籤",
                        "移除活躍標籤",
                        "新增高價值標籤",
                        "新增流失風險標籤",
                        "新增生日標籤"
                      ].map((trigger, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{trigger}</span>
                          <Badge variant="outline">啟用</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* A/B Test Tab */}
          <TabsContent value="ab-test" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>A/B 測試</CardTitle>
                    <CardDescription>測試不同訊息版本的成效</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    建立測試
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Active Test */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">新客歡迎訊息測試</h4>
                        <p className="text-sm text-gray-500">測試不同的歡迎訊息標題</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">進行中</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">版本 A</span>
                          <Badge variant="outline">50%</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">「歡迎加入 YOChiLL！」</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>開啟率</span>
                            <span className="font-medium">45%</span>
                          </div>
                          <Progress value={45} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span>點擊率</span>
                            <span className="font-medium">12%</span>
                          </div>
                          <Progress value={12} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-lg bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">版本 B</span>
                          <Badge className="bg-green-100 text-green-800">領先</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">「專屬新客禮等你領！」</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>開啟率</span>
                            <span className="font-medium text-green-600">52%</span>
                          </div>
                          <Progress value={52} className="h-2 bg-green-100" />
                          <div className="flex justify-between text-sm">
                            <span>點擊率</span>
                            <span className="font-medium text-green-600">18%</span>
                          </div>
                          <Progress value={18} className="h-2 bg-green-100" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">查看詳情</Button>
                      <Button variant="outline" size="sm">結束測試</Button>
                    </div>
                  </div>

                  {/* Completed Test */}
                  <div className="p-4 border rounded-lg opacity-75">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">生日優惠金額測試</h4>
                        <p className="text-sm text-gray-500">測試 NT$200 vs NT$300 優惠券</p>
                      </div>
                      <Badge variant="secondary">已完成</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">獲勝版本：</span>
                      <Badge className="bg-green-100 text-green-800">NT$300 優惠券</Badge>
                      <span className="text-sm text-gray-500">轉換率提升 23%</span>
                    </div>
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
