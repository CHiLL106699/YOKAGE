import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Heart,
  Star,
  MessageSquare,
  Gift,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Tag,
  History,
  FileText,
  Camera,
  Sparkles,
  Brain,
  ShoppingBag,
  CreditCard,
  Bell,
  Search
} from "lucide-react";

// 客戶詳細資料
const customerProfile = {
  id: 1,
  name: "王小美",
  phone: "0912-345-678",
  email: "wang.mei@email.com",
  lineId: "@wang_mei",
  birthday: "1990-05-15",
  address: "台北市大安區忠孝東路四段 100 號",
  joinDate: "2023-01-15",
  memberLevel: "VIP",
  totalSpent: 285000,
  visitCount: 24,
  lastVisit: "2024-01-15",
  nextAppointment: "2024-01-25",
  satisfaction: 4.8,
  tags: ["高消費", "皮膚敏感", "偏好玻尿酸"],
  rfmScore: { recency: 95, frequency: 88, monetary: 92 },
  churnRisk: 15
};

// 療程歷史
const treatmentHistory = [
  { date: "2024-01-15", treatment: "玻尿酸 - 蘋果肌", doctor: "王醫師", amount: 35000, satisfaction: 5 },
  { date: "2023-12-20", treatment: "皮秒雷射 - 全臉", doctor: "李醫師", amount: 28000, satisfaction: 5 },
  { date: "2023-11-10", treatment: "肉毒桿菌 - 抬頭紋", doctor: "王醫師", amount: 15000, satisfaction: 4 },
  { date: "2023-10-05", treatment: "保濕導入", doctor: "張護理師", amount: 3500, satisfaction: 5 }
];

// 互動紀錄
const interactionHistory = [
  { date: "2024-01-16", type: "LINE", content: "詢問術後保養注意事項", direction: "inbound" },
  { date: "2024-01-15", type: "到店", content: "完成玻尿酸療程", direction: "visit" },
  { date: "2024-01-10", type: "LINE", content: "發送預約確認提醒", direction: "outbound" },
  { date: "2024-01-08", type: "電話", content: "預約玻尿酸療程", direction: "inbound" }
];

// AI 洞察
const aiInsights = [
  { type: "recommendation", title: "推薦音波拉提", description: "根據療程紀錄，建議搭配音波拉提提升整體效果", confidence: 92 },
  { type: "timing", title: "最佳回訪時機", description: "預計 2 月中旬為最佳回訪時機（玻尿酸效果維持期）", confidence: 88 },
  { type: "preference", title: "偏好分析", description: "偏好週六下午時段，喜歡王醫師的服務", confidence: 95 }
];

export default function Customer360Page() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Search */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">客戶 360° 視圖</h1>
            <p className="text-gray-500 mt-1">完整客戶資料、互動歷史與 AI 洞察</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="搜尋客戶..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Customer Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {customerProfile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{customerProfile.name}</h2>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {customerProfile.memberLevel}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    流失風險 {customerProfile.churnRisk}%
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {customerProfile.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {customerProfile.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    LINE: {customerProfile.lineId}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    生日: {customerProfile.birthday}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {customerProfile.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-xs text-gray-500">累計消費</p>
                  <p className="text-xl font-bold text-green-600">NT${(customerProfile.totalSpent / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">到訪次數</p>
                  <p className="text-xl font-bold">{customerProfile.visitCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">滿意度</p>
                  <p className="text-xl font-bold flex items-center justify-center gap-1">
                    {customerProfile.satisfaction}
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">下次預約</p>
                  <p className="text-xl font-bold text-purple-600">{customerProfile.nextAppointment}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RFM Score */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">最近消費 (R)</span>
                <span className="font-bold">{customerProfile.rfmScore.recency}</span>
              </div>
              <Progress value={customerProfile.rfmScore.recency} className="h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">消費頻率 (F)</span>
                <span className="font-bold">{customerProfile.rfmScore.frequency}</span>
              </div>
              <Progress value={customerProfile.rfmScore.frequency} className="h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">消費金額 (M)</span>
                <span className="font-bold">{customerProfile.rfmScore.monetary}</span>
              </div>
              <Progress value={customerProfile.rfmScore.monetary} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">
              <User className="w-4 h-4 mr-2" />
              總覽
            </TabsTrigger>
            <TabsTrigger value="treatments">
              <Heart className="w-4 h-4 mr-2" />
              療程紀錄
            </TabsTrigger>
            <TabsTrigger value="interactions">
              <MessageSquare className="w-4 h-4 mr-2" />
              互動紀錄
            </TabsTrigger>
            <TabsTrigger value="photos">
              <Camera className="w-4 h-4 mr-2" />
              療程照片
            </TabsTrigger>
            <TabsTrigger value="ai-insights">
              <Brain className="w-4 h-4 mr-2" />
              AI 洞察
            </TabsTrigger>
            <TabsTrigger value="purchases">
              <ShoppingBag className="w-4 h-4 mr-2" />
              購買紀錄
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>近期療程</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {treatmentHistory.slice(0, 3).map((treatment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{treatment.treatment}</p>
                          <p className="text-sm text-gray-500">{treatment.date} • {treatment.doctor}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">NT${treatment.amount.toLocaleString()}</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`w-3 h-3 ${star <= treatment.satisfaction ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI 洞察</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiInsights.map((insight, idx) => (
                      <div key={idx} className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-purple-800">{insight.title}</span>
                          </div>
                          <Badge variant="outline">{insight.confidence}%</Badge>
                        </div>
                        <p className="text-sm text-purple-600">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>近期互動</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interactionHistory.map((interaction, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        interaction.direction === 'inbound' ? 'bg-blue-100' :
                        interaction.direction === 'outbound' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        {interaction.type === 'LINE' && <MessageSquare className={`w-5 h-5 ${
                          interaction.direction === 'inbound' ? 'text-blue-600' : 'text-green-600'
                        }`} />}
                        {interaction.type === '到店' && <User className="w-5 h-5 text-purple-600" />}
                        {interaction.type === '電話' && <Phone className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{interaction.content}</p>
                        <p className="text-sm text-gray-500">{interaction.date} • {interaction.type}</p>
                      </div>
                      <Badge variant="outline">
                        {interaction.direction === 'inbound' ? '收到' :
                         interaction.direction === 'outbound' ? '發送' : '到訪'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treatments Tab */}
          <TabsContent value="treatments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>完整療程紀錄</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {treatmentHistory.map((treatment, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Heart className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{treatment.treatment}</h4>
                            <p className="text-sm text-gray-500">
                              {treatment.date} • {treatment.doctor}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">金額</p>
                            <p className="font-semibold">NT${treatment.amount.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">滿意度</p>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`w-4 h-4 ${star <= treatment.satisfaction ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            查看詳情
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interactions Tab */}
          <TabsContent value="interactions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>互動紀錄時間軸</CardTitle>
                  <Button>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    發送訊息
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-6">
                    {interactionHistory.map((interaction, idx) => (
                      <div key={idx} className="flex gap-4 relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                          interaction.direction === 'inbound' ? 'bg-blue-100' :
                          interaction.direction === 'outbound' ? 'bg-green-100' :
                          'bg-purple-100'
                        }`}>
                          {interaction.type === 'LINE' && <MessageSquare className={`w-5 h-5 ${
                            interaction.direction === 'inbound' ? 'text-blue-600' : 'text-green-600'
                          }`} />}
                          {interaction.type === '到店' && <User className="w-5 h-5 text-purple-600" />}
                          {interaction.type === '電話' && <Phone className="w-5 h-5 text-blue-600" />}
                        </div>
                        <div className="flex-1 p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{interaction.type}</span>
                            <span className="text-sm text-gray-500">{interaction.date}</span>
                          </div>
                          <p className="text-gray-600">{interaction.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>療程照片</CardTitle>
                  <Button>
                    <Camera className="w-4 h-4 mr-2" />
                    上傳照片
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                    <div key={idx} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <CardTitle>AI 個人化洞察</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiInsights.map((insight, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold">{insight.title}</span>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800">
                            信心度 {insight.confidence}%
                          </Badge>
                        </div>
                        <p className="text-gray-600">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>行為分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "偏好時段", value: "週六下午 14:00-18:00" },
                      { label: "偏好醫師", value: "王醫師" },
                      { label: "平均消費週期", value: "45 天" },
                      { label: "最常做的療程", value: "玻尿酸注射" },
                      { label: "對促銷敏感度", value: "中等" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>購買紀錄</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { date: "2024-01-15", items: ["玻尿酸療程", "修復精華"], total: 38500, payment: "LINE Pay" },
                    { date: "2023-12-20", items: ["皮秒雷射療程", "保濕面膜組"], total: 31000, payment: "信用卡" },
                    { date: "2023-11-10", items: ["肉毒桿菌療程"], total: 15000, payment: "現金" }
                  ].map((purchase, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{purchase.date}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {purchase.items.map((item, iIdx) => (
                              <Badge key={iIdx} variant="secondary">{item}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">NT${purchase.total.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                            <CreditCard className="w-3 h-3" />
                            {purchase.payment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="font-medium">快速操作</span>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  預約療程
                </Button>
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  發送訊息
                </Button>
                <Button variant="outline">
                  <Gift className="w-4 h-4 mr-2" />
                  發送優惠
                </Button>
                <Button variant="outline">
                  <Bell className="w-4 h-4 mr-2" />
                  設定提醒
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
