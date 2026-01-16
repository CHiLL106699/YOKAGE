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
  Share2,
  Calendar,
  Image,
  Video,
  Heart,
  MessageCircle,
  Eye,
  TrendingUp,
  Users,
  Star,
  Plus,
  Edit,
  Trash2,
  Clock,
  Send,
  Instagram,
  Facebook,
  BarChart3,
  Target,
  Award,
  Sparkles,
  ThumbsUp,
  Repeat,
  ExternalLink,
  Filter,
  Download
} from "lucide-react";

// 排程貼文
const scheduledPosts = [
  {
    id: 1,
    content: "✨ 新年新氣象！玻尿酸療程限時 85 折優惠，讓您煥然一新迎接新年...",
    platforms: ["instagram", "facebook", "line"],
    scheduledTime: "2024-01-20 10:00",
    status: "scheduled",
    image: "/api/placeholder/400/300"
  },
  {
    id: 2,
    content: "💫 感謝王小姐分享她的療程心得！自然的蘋果肌讓整個人看起來更年輕...",
    platforms: ["instagram"],
    scheduledTime: "2024-01-18 14:00",
    status: "scheduled",
    image: "/api/placeholder/400/300"
  },
  {
    id: 3,
    content: "🎉 週年慶活動倒數 3 天！音波拉提買一送一，錯過再等一年...",
    platforms: ["facebook", "line"],
    scheduledTime: "2024-01-17 09:00",
    status: "published",
    image: null
  }
];

// UGC 內容
const ugcContent = [
  {
    id: 1,
    author: "王小美",
    avatar: "",
    platform: "instagram",
    content: "超滿意這次的玻尿酸療程！醫師超專業，效果自然又持久 💕",
    image: "/api/placeholder/300/300",
    likes: 234,
    comments: 45,
    date: "2024-01-15",
    approved: true,
    featured: true
  },
  {
    id: 2,
    author: "李小華",
    avatar: "",
    platform: "facebook",
    content: "第一次來 YOChiLL 做皮秒雷射，環境很舒適，服務態度超好！",
    image: "/api/placeholder/300/300",
    likes: 156,
    comments: 23,
    date: "2024-01-14",
    approved: true,
    featured: false
  },
  {
    id: 3,
    author: "張大偉",
    avatar: "",
    platform: "google",
    content: "推薦給想做醫美的朋友，價格透明，效果很好！",
    image: null,
    likes: 89,
    comments: 12,
    date: "2024-01-13",
    approved: false,
    featured: false
  }
];

// KOL 合作
const kolPartners = [
  {
    id: 1,
    name: "美妝達人 Mia",
    platform: "instagram",
    followers: 125000,
    engagement: 4.5,
    collaborations: 3,
    totalReach: 450000,
    status: "active",
    avatar: ""
  },
  {
    id: 2,
    name: "生活家 Amy",
    platform: "youtube",
    followers: 89000,
    engagement: 6.2,
    collaborations: 2,
    totalReach: 280000,
    status: "active",
    avatar: ""
  },
  {
    id: 3,
    name: "時尚部落客 Coco",
    platform: "facebook",
    followers: 56000,
    engagement: 3.8,
    collaborations: 1,
    totalReach: 120000,
    status: "pending",
    avatar: ""
  }
];

export default function SocialMarketingPage() {
  const [activeTab, setActiveTab] = useState("scheduler");
  const [newPostContent, setNewPostContent] = useState("");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">社群行銷</h1>
            <p className="text-gray-500 mt-1">貼文排程、UGC 內容管理與 KOL 合作</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            建立貼文
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">總觸及</p>
                  <p className="text-2xl font-bold">125K</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +23% 較上月
                  </p>
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
                  <p className="text-sm text-gray-500">互動數</p>
                  <p className="text-2xl font-bold">8,456</p>
                </div>
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">UGC 內容</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">KOL 合作</p>
                  <p className="text-2xl font-bold">6</p>
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
                  <p className="text-sm text-gray-500">互動率</p>
                  <p className="text-2xl font-bold">6.8%</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="scheduler">
              <Calendar className="w-4 h-4 mr-2" />
              貼文排程
            </TabsTrigger>
            <TabsTrigger value="ugc">
              <Users className="w-4 h-4 mr-2" />
              UGC 內容
            </TabsTrigger>
            <TabsTrigger value="kol">
              <Star className="w-4 h-4 mr-2" />
              KOL 合作
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              數據分析
            </TabsTrigger>
            <TabsTrigger value="auto-reply">
              <MessageCircle className="w-4 h-4 mr-2" />
              自動回覆
            </TabsTrigger>
          </TabsList>

          {/* Scheduler Tab */}
          <TabsContent value="scheduler" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create Post */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>建立新貼文</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea 
                    placeholder="輸入貼文內容..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Image className="w-4 h-4 mr-2" />
                      圖片
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="w-4 h-4 mr-2" />
                      影片
                    </Button>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">發布平台</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="bg-pink-50">
                        <Instagram className="w-4 h-4 mr-1" />
                        IG
                      </Button>
                      <Button variant="outline" size="sm" className="bg-blue-50">
                        <Facebook className="w-4 h-4 mr-1" />
                        FB
                      </Button>
                      <Button variant="outline" size="sm" className="bg-green-50">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        LINE
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">排程時間</p>
                    <Input type="datetime-local" />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Clock className="w-4 h-4 mr-2" />
                      排程發布
                    </Button>
                    <Button variant="outline">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduled Posts */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>排程貼文</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scheduledPosts.map((post) => (
                      <div key={post.id} className="p-4 border rounded-lg">
                        <div className="flex gap-4">
                          {post.image && (
                            <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                              <Image className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm line-clamp-2">{post.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {post.platforms.map((platform) => (
                                <Badge key={platform} variant="secondary" className="text-xs">
                                  {platform === 'instagram' && <Instagram className="w-3 h-3 mr-1" />}
                                  {platform === 'facebook' && <Facebook className="w-3 h-3 mr-1" />}
                                  {platform === 'line' && <MessageCircle className="w-3 h-3 mr-1" />}
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>{post.scheduledTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                  {post.status === 'published' ? '已發布' : '排程中'}
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* UGC Tab */}
          <TabsContent value="ugc" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>UGC 內容牆</CardTitle>
                    <CardDescription>顧客分享的真實體驗</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      篩選
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      匯出
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ugcContent.map((content) => (
                    <div key={content.id} className="border rounded-lg overflow-hidden">
                      {content.image && (
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <Image className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={content.avatar} />
                            <AvatarFallback>{content.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{content.author}</p>
                            <p className="text-xs text-gray-500">{content.date}</p>
                          </div>
                          {content.featured && (
                            <Badge className="ml-auto bg-yellow-100 text-yellow-800">精選</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3">{content.content}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {content.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {content.comments}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Star className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KOL Tab */}
          <TabsContent value="kol" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>KOL 合作管理</CardTitle>
                    <CardDescription>網紅與意見領袖合作追蹤</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新增合作
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kolPartners.map((kol) => (
                    <div key={kol.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={kol.avatar} />
                          <AvatarFallback className="text-xl">{kol.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{kol.name}</h4>
                            <Badge variant="secondary">{kol.platform}</Badge>
                            <Badge className={kol.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {kol.status === 'active' ? '合作中' : '洽談中'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-gray-500">粉絲數</p>
                              <p className="font-semibold">{(kol.followers / 1000).toFixed(0)}K</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">互動率</p>
                              <p className="font-semibold">{kol.engagement}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">合作次數</p>
                              <p className="font-semibold">{kol.collaborations}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">總觸及</p>
                              <p className="font-semibold">{(kol.totalReach / 1000).toFixed(0)}K</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            查看詳情
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            聯繫
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>平台表現</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { platform: "Instagram", icon: Instagram, reach: 65000, engagement: 7.2, color: "bg-pink-500" },
                      { platform: "Facebook", icon: Facebook, reach: 45000, engagement: 4.8, color: "bg-blue-600" },
                      { platform: "LINE", icon: MessageCircle, reach: 15000, engagement: 12.5, color: "bg-green-500" }
                    ].map((item) => (
                      <div key={item.platform} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{item.platform}</h4>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">觸及人數</p>
                            <p className="text-xl font-bold">{(item.reach / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">互動率</p>
                            <p className="text-xl font-bold">{item.engagement}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>內容表現排行</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { title: "玻尿酸療程分享", type: "影片", reach: 12500, engagement: 890 },
                      { title: "新年優惠活動", type: "圖文", reach: 8900, engagement: 567 },
                      { title: "顧客見證分享", type: "圖文", reach: 7600, engagement: 445 },
                      { title: "醫師專業解說", type: "影片", reach: 6800, engagement: 389 },
                      { title: "術後保養教學", type: "圖文", reach: 5400, engagement: 312 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{(item.reach / 1000).toFixed(1)}K</p>
                          <p className="text-xs text-gray-500">{item.engagement} 互動</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Auto Reply Tab */}
          <TabsContent value="auto-reply" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>自動化社群回覆</CardTitle>
                <CardDescription>設定關鍵字觸發的自動回覆規則</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { keyword: "價格", reply: "感謝您的詢問！我們的療程價格依個人需求而定，歡迎私訊或來電諮詢...", platform: "all", active: true },
                    { keyword: "預約", reply: "歡迎預約！請點擊以下連結進行線上預約，或撥打客服專線...", platform: "all", active: true },
                    { keyword: "營業時間", reply: "我們的營業時間為週一至週六 10:00-20:00，週日公休...", platform: "all", active: true }
                  ].map((rule, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">關鍵字：{rule.keyword}</Badge>
                          <Badge className={rule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {rule.active ? '啟用' : '停用'}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{rule.reply}</p>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    新增自動回覆規則
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
