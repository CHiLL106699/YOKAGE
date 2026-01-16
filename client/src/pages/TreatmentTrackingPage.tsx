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
  Camera,
  Image,
  TrendingUp,
  Calendar,
  User,
  Eye,
  Plus,
  Brain,
  Sparkles,
  Clock,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Star,
  MessageSquare,
  Upload,
  Play,
  Pause
} from "lucide-react";

// 療程追蹤案例
const trackingCases = [
  {
    id: 1,
    customer: "王小美",
    treatment: "玻尿酸 - 蘋果肌",
    startDate: "2024-01-01",
    lastUpdate: "2024-01-15",
    progress: 75,
    photos: 4,
    satisfaction: 4.8,
    status: "tracking"
  },
  {
    id: 2,
    customer: "李小華",
    treatment: "皮秒雷射 - 全臉",
    startDate: "2023-12-15",
    lastUpdate: "2024-01-10",
    progress: 100,
    photos: 6,
    satisfaction: 4.9,
    status: "completed"
  },
  {
    id: 3,
    customer: "張大偉",
    treatment: "肉毒桿菌 - 抬頭紋",
    startDate: "2024-01-10",
    lastUpdate: "2024-01-16",
    progress: 30,
    photos: 2,
    satisfaction: null,
    status: "tracking"
  }
];

// AI 分析結果
const aiAnalysis = {
  skinCondition: {
    hydration: 78,
    elasticity: 82,
    brightness: 75,
    pores: 70,
    wrinkles: 85
  },
  improvements: [
    { area: "蘋果肌飽滿度", before: 45, after: 85, change: "+89%" },
    { area: "法令紋深度", before: 72, after: 35, change: "-51%" },
    { area: "臉部對稱性", before: 78, after: 92, change: "+18%" }
  ],
  recommendations: [
    "建議 3 個月後進行補打維持效果",
    "日常保養可加強保濕，延長療程效果",
    "避免過度日曬，使用 SPF50 防曬"
  ]
};

export default function TreatmentTrackingPage() {
  const [activeTab, setActiveTab] = useState("cases");
  const [selectedCase, setSelectedCase] = useState<number | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">療程效果追蹤</h1>
            <p className="text-gray-500 mt-1">AI 影像分析、前後對比與效果評估</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Camera className="w-4 h-4 mr-2" />
              拍攝照片
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新增追蹤
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">追蹤中案例</p>
                  <p className="text-2xl font-bold">45</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">已完成追蹤</p>
                  <p className="text-2xl font-bold text-green-600">128</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">照片總數</p>
                  <p className="text-2xl font-bold">1,256</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Image className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">平均滿意度</p>
                  <p className="text-2xl font-bold">4.7</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="cases">
              <User className="w-4 h-4 mr-2" />
              追蹤案例
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <Image className="w-4 h-4 mr-2" />
              前後對比
            </TabsTrigger>
            <TabsTrigger value="ai-analysis">
              <Brain className="w-4 h-4 mr-2" />
              AI 分析
            </TabsTrigger>
            <TabsTrigger value="statistics">
              <BarChart3 className="w-4 h-4 mr-2" />
              效果統計
            </TabsTrigger>
          </TabsList>

          {/* Cases Tab */}
          <TabsContent value="cases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>療程追蹤案例</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingCases.map((caseItem) => (
                    <div key={caseItem.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback>{caseItem.customer.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{caseItem.customer}</h4>
                              <Badge className={caseItem.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                {caseItem.status === 'completed' ? '已完成' : '追蹤中'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{caseItem.treatment}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">開始日期</p>
                            <p className="font-medium">{caseItem.startDate}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">照片數</p>
                            <p className="font-medium">{caseItem.photos}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">進度</p>
                            <div className="w-20">
                              <Progress value={caseItem.progress} className="h-2" />
                            </div>
                          </div>
                          {caseItem.satisfaction && (
                            <div className="text-center">
                              <p className="text-xs text-gray-500">滿意度</p>
                              <p className="font-medium flex items-center gap-1">
                                {caseItem.satisfaction}
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              </p>
                            </div>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            查看
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>前後對比照片</CardTitle>
                <CardDescription>拖曳滑桿查看療程前後變化</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Before/After Slider */}
                  <div className="space-y-4">
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <Image className="w-12 h-12 mx-auto mb-2" />
                          <p>選擇案例查看對比照片</p>
                        </div>
                      </div>
                      {/* Slider Control */}
                      <div className="absolute inset-y-0 left-1/2 w-1 bg-white shadow-lg cursor-ew-resize">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <Badge variant="outline">療程前</Badge>
                      <Badge variant="outline">療程後</Badge>
                    </div>
                  </div>

                  {/* Photo Timeline */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">照片時間軸</h4>
                    <div className="space-y-3">
                      {[
                        { date: "2024-01-01", label: "療程前", type: "before" },
                        { date: "2024-01-08", label: "第 1 週", type: "progress" },
                        { date: "2024-01-15", label: "第 2 週", type: "progress" },
                        { date: "2024-01-22", label: "第 3 週（最新）", type: "latest" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                            item.type === 'before' ? 'bg-gray-100' :
                            item.type === 'latest' ? 'bg-green-100' :
                            'bg-blue-100'
                          }`}>
                            <Camera className={`w-6 h-6 ${
                              item.type === 'before' ? 'text-gray-400' :
                              item.type === 'latest' ? 'text-green-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      上傳新照片
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai-analysis" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <CardTitle>AI 膚質分析</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(aiAnalysis.skinCondition).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        hydration: "保濕度",
                        elasticity: "彈性",
                        brightness: "明亮度",
                        pores: "毛孔細緻",
                        wrinkles: "皺紋改善"
                      };
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{labels[key]}</span>
                            <span className="font-medium">{value}%</span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <CardTitle>改善數據</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiAnalysis.improvements.map((item, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{item.area}</span>
                          <Badge className="bg-green-100 text-green-800">{item.change}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>療程前</span>
                              <span>{item.before}%</span>
                            </div>
                            <Progress value={item.before} className="h-2 bg-gray-200" />
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>療程後</span>
                              <span>{item.after}%</span>
                            </div>
                            <Progress value={item.after} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  <CardTitle>AI 建議</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiAnalysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-600 text-sm font-semibold">{idx + 1}</span>
                      </div>
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>療程效果統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { treatment: "玻尿酸", satisfaction: 4.8, cases: 156, improvement: 85 },
                      { treatment: "肉毒桿菌", satisfaction: 4.7, cases: 89, improvement: 82 },
                      { treatment: "皮秒雷射", satisfaction: 4.6, cases: 124, improvement: 78 },
                      { treatment: "音波拉提", satisfaction: 4.9, cases: 45, improvement: 88 }
                    ].map((item) => (
                      <div key={item.treatment} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{item.treatment}</span>
                          <div className="flex items-center gap-1">
                            <span>{item.satisfaction}</span>
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{item.cases} 案例</span>
                          <span>平均改善 {item.improvement}%</span>
                        </div>
                        <Progress value={item.improvement} className="h-2 mt-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>顧客回饋</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { customer: "王小美", treatment: "玻尿酸", feedback: "效果超自然，朋友都說我變年輕了！", rating: 5 },
                      { customer: "李小華", treatment: "皮秒雷射", feedback: "斑點淡了很多，皮膚也變亮了", rating: 5 },
                      { customer: "張大偉", treatment: "肉毒桿菌", feedback: "抬頭紋幾乎看不見了，很滿意", rating: 4 }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{item.customer.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{item.customer}</p>
                              <p className="text-xs text-gray-500">{item.treatment}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`w-4 h-4 ${star <= item.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{item.feedback}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
