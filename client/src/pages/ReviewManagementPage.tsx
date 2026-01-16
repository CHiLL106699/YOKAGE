import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Filter,
  BarChart3,
  Heart,
  Frown,
  Smile,
  Meh,
  ExternalLink,
  RefreshCw,
  Eye,
  Reply
} from "lucide-react";

// NPS 數據
const npsData = {
  score: 72,
  promoters: 65,
  passives: 25,
  detractors: 10,
  responses: 234,
  trend: "+5"
};

// 評價列表
const reviews = [
  {
    id: 1,
    customer: "王小美",
    avatar: "",
    platform: "google",
    rating: 5,
    content: "非常滿意這次的玻尿酸療程！王醫師超專業，效果自然又持久。環境很舒適，服務態度也很好，會推薦給朋友！",
    date: "2024-01-15",
    treatment: "玻尿酸 - 蘋果肌",
    replied: true,
    sentiment: "positive"
  },
  {
    id: 2,
    customer: "李小華",
    avatar: "",
    platform: "google",
    rating: 4,
    content: "整體體驗不錯，但等待時間有點長。療程效果很好，醫師很細心解說。",
    date: "2024-01-14",
    treatment: "皮秒雷射",
    replied: true,
    sentiment: "positive"
  },
  {
    id: 3,
    customer: "張大偉",
    avatar: "",
    platform: "facebook",
    rating: 2,
    content: "預約時間被臨時更改，造成很大的不便。希望能改善預約系統。",
    date: "2024-01-13",
    treatment: "肉毒桿菌",
    replied: false,
    sentiment: "negative"
  }
];

// 滿意度問卷
const surveyResults = [
  { question: "整體服務滿意度", score: 4.6, responses: 156 },
  { question: "醫師專業度", score: 4.8, responses: 145 },
  { question: "環境舒適度", score: 4.5, responses: 152 },
  { question: "等待時間", score: 3.8, responses: 148 },
  { question: "價格合理性", score: 4.0, responses: 140 },
  { question: "術後關懷", score: 4.7, responses: 138 }
];

export default function ReviewManagementPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [replyContent, setReplyContent] = useState("");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">評價管理</h1>
            <p className="text-gray-500 mt-1">顧客滿意度調查、評價監控與負評處理</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              同步評價
            </Button>
            <Button>
              <Send className="w-4 h-4 mr-2" />
              發送問卷
            </Button>
          </div>
        </div>

        {/* NPS Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">NPS 淨推薦值</p>
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={npsData.score >= 50 ? "#22c55e" : npsData.score >= 0 ? "#eab308" : "#ef4444"}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(npsData.score + 100) / 200 * 352} 352`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{npsData.score}</span>
                  </div>
                </div>
                <p className="text-sm text-green-600 flex items-center justify-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {npsData.trend} 較上月
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Smile className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{npsData.promoters}%</p>
                  <p className="text-sm text-gray-500">推薦者 (9-10分)</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Meh className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">{npsData.passives}%</p>
                  <p className="text-sm text-gray-500">被動者 (7-8分)</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Frown className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{npsData.detractors}%</p>
                  <p className="text-sm text-gray-500">批評者 (0-6分)</p>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-500">
                共 {npsData.responses} 份回覆
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">平均評分</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold">4.6</p>
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">總評價數</p>
                  <p className="text-2xl font-bold">456</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">待回覆</p>
                  <p className="text-2xl font-bold text-orange-600">8</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">負評預警</p>
                  <p className="text-2xl font-bold text-red-600">2</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
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
            <TabsTrigger value="reviews">
              <Star className="w-4 h-4 mr-2" />
              評價列表
            </TabsTrigger>
            <TabsTrigger value="surveys">
              <MessageSquare className="w-4 h-4 mr-2" />
              滿意度問卷
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <AlertTriangle className="w-4 h-4 mr-2" />
              負評預警
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Heart className="w-4 h-4 mr-2" />
              顧客心聲
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>評分分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const percent = rating === 5 ? 65 : rating === 4 ? 25 : rating === 3 ? 6 : rating === 2 ? 3 : 1;
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-16">
                            <span>{rating}</span>
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          </div>
                          <Progress value={percent} className="flex-1 h-3" />
                          <span className="w-12 text-sm text-gray-500">{percent}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>平台分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { platform: "Google", count: 234, rating: 4.7, color: "bg-blue-500" },
                      { platform: "Facebook", count: 156, rating: 4.5, color: "bg-blue-600" },
                      { platform: "LINE", count: 66, rating: 4.8, color: "bg-green-500" }
                    ].map((item) => (
                      <div key={item.platform} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-bold">{item.platform.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium">{item.platform}</p>
                            <p className="text-sm text-gray-500">{item.count} 則評價</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{item.rating}</span>
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>評價列表</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      篩選
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className={`p-4 border rounded-lg ${
                      review.sentiment === 'negative' ? 'border-red-200 bg-red-50' : ''
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={review.avatar} />
                            <AvatarFallback>{review.customer.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.customer}</span>
                              <Badge variant="secondary">{review.platform}</Badge>
                              <Badge variant="outline">{review.treatment}</Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star}
                                    className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {review.replied ? (
                            <Badge className="bg-green-100 text-green-800">已回覆</Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-800">待回覆</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{review.content}</p>
                      {!review.replied && (
                        <div className="flex gap-2">
                          <Textarea 
                            placeholder="輸入回覆內容..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={2}
                            className="flex-1"
                          />
                          <Button>
                            <Reply className="w-4 h-4 mr-2" />
                            回覆
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Surveys Tab */}
          <TabsContent value="surveys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>滿意度問卷結果</CardTitle>
                <CardDescription>療程後自動發送的滿意度調查</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {surveyResults.map((item) => (
                    <div key={item.question} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.question}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{item.score}</span>
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-gray-500">({item.responses} 回覆)</span>
                        </div>
                      </div>
                      <Progress value={item.score * 20} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>負評預警</CardTitle>
                <CardDescription>需要立即處理的負面評價</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.filter(r => r.sentiment === 'negative').map((review) => (
                    <div key={review.id} className="p-4 border-2 border-red-300 rounded-lg bg-red-50">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-red-600">需要立即處理</span>
                      </div>
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar>
                          <AvatarFallback>{review.customer.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{review.customer}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{review.content}</p>
                      <div className="flex gap-2">
                        <Button className="flex-1">
                          <Reply className="w-4 h-4 mr-2" />
                          立即回覆
                        </Button>
                        <Button variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          私訊聯繫
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>顧客心聲分析</CardTitle>
                <CardDescription>AI 自動分析評價內容，提取關鍵洞察</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5" />
                      正面關鍵字
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['專業', '自然', '舒適', '細心', '效果好', '服務態度佳', '環境乾淨', '推薦'].map((keyword) => (
                        <Badge key={keyword} className="bg-green-100 text-green-800">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                      <ThumbsDown className="w-5 h-5" />
                      待改善項目
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['等待時間', '預約系統', '停車不便'].map((keyword) => (
                        <Badge key={keyword} className="bg-red-100 text-red-800">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">AI 建議</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 建議優化預約系統，減少顧客等待時間</li>
                    <li>• 可考慮增加線上預約提醒功能</li>
                    <li>• 醫師專業度獲得高度肯定，可作為行銷重點</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
