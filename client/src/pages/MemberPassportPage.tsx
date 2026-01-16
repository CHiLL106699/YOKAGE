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
  Camera,
  Calendar,
  Clock,
  Star,
  Heart,
  Trophy,
  Gift,
  TrendingUp,
  Image,
  FileText,
  MessageSquare,
  Share2,
  Download,
  Plus,
  Edit,
  Eye,
  ChevronRight,
  Sparkles,
  Award,
  Target,
  Zap,
  BookOpen
} from "lucide-react";

// 模擬會員資料
const memberData = {
  id: "M001234",
  name: "王小美",
  avatar: "",
  level: "VIP",
  points: 2450,
  totalSpent: 156000,
  visits: 24,
  memberSince: "2023-03-15",
  birthday: "1990-05-20",
  phone: "0912-345-678",
  tags: ["玻尿酸愛好者", "高消費", "VIP"],
  nextLevelPoints: 3000
};

// 療程記錄
const treatmentHistory = [
  {
    id: 1,
    date: "2024-01-10",
    treatment: "玻尿酸注射 - 蘋果肌",
    doctor: "王醫師",
    beforeImage: "/api/placeholder/200/200",
    afterImage: "/api/placeholder/200/200",
    notes: "效果良好，建議 6 個月後回診",
    satisfaction: 5
  },
  {
    id: 2,
    date: "2023-11-15",
    treatment: "肉毒桿菌 - 抬頭紋",
    doctor: "李醫師",
    beforeImage: "/api/placeholder/200/200",
    afterImage: "/api/placeholder/200/200",
    notes: "紋路明顯改善",
    satisfaction: 5
  },
  {
    id: 3,
    date: "2023-09-20",
    treatment: "皮秒雷射",
    doctor: "王醫師",
    beforeImage: "/api/placeholder/200/200",
    afterImage: "/api/placeholder/200/200",
    notes: "膚色均勻度提升",
    satisfaction: 4
  }
];

// 成就系統
const achievements = [
  { id: 1, name: "初次體驗", description: "完成第一次療程", icon: Star, unlocked: true, date: "2023-03-20" },
  { id: 2, name: "美麗達人", description: "累計消費滿 NT$50,000", icon: Trophy, unlocked: true, date: "2023-08-15" },
  { id: 3, name: "忠實會員", description: "累計到訪 20 次", icon: Heart, unlocked: true, date: "2024-01-05" },
  { id: 4, name: "玻尿酸專家", description: "完成 5 次玻尿酸療程", icon: Sparkles, unlocked: true, date: "2024-01-10" },
  { id: 5, name: "分享達人", description: "分享療程心得 10 次", icon: Share2, unlocked: false, progress: 60 },
  { id: 6, name: "VIP 尊榮", description: "升級為 VIP 會員", icon: Award, unlocked: true, date: "2023-12-01" }
];

// 美麗日記
const beautyDiary = [
  { id: 1, date: "2024-01-12", title: "玻尿酸術後第 2 天", content: "腫脹消退中，效果開始顯現...", images: 2, likes: 15 },
  { id: 2, date: "2024-01-10", title: "今天做了蘋果肌填充", content: "期待效果！醫師說大約 3-5 天會更自然...", images: 3, likes: 23 },
  { id: 3, date: "2023-11-20", title: "肉毒效果超滿意", content: "抬頭紋幾乎看不見了！", images: 2, likes: 31 }
];

export default function MemberPassportPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMember, setSelectedMember] = useState(memberData);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">會員護照</h1>
            <p className="text-gray-500 mt-1">會員個人化首頁、療程記錄與成就系統</p>
          </div>
          <div className="flex gap-2">
            <Input placeholder="搜尋會員..." className="w-64" />
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              預覽會員視角
            </Button>
          </div>
        </div>

        {/* Member Profile Card */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24 border-4 border-white/30">
                <AvatarImage src={selectedMember.avatar} />
                <AvatarFallback className="bg-white/20 text-white text-2xl">
                  {selectedMember.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{selectedMember.name}</h2>
                  <Badge className="bg-yellow-400 text-yellow-900">{selectedMember.level}</Badge>
                </div>
                <p className="text-white/80 mb-4">會員編號：{selectedMember.id}</p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <p className="text-2xl font-bold">{selectedMember.points}</p>
                    <p className="text-xs text-white/70">累積點數</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <p className="text-2xl font-bold">NT${(selectedMember.totalSpent / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-white/70">累積消費</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <p className="text-2xl font-bold">{selectedMember.visits}</p>
                    <p className="text-xs text-white/70">到訪次數</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <p className="text-2xl font-bold">{achievements.filter(a => a.unlocked).length}</p>
                    <p className="text-xs text-white/70">解鎖成就</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>距離下一等級</span>
                    <span>{selectedMember.nextLevelPoints - selectedMember.points} 點</span>
                  </div>
                  <Progress value={(selectedMember.points / selectedMember.nextLevelPoints) * 100} className="h-2 bg-white/20" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  編輯資料
                </Button>
                <Button variant="secondary" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  發送訊息
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">
              <User className="w-4 h-4 mr-2" />
              總覽
            </TabsTrigger>
            <TabsTrigger value="treatments">
              <FileText className="w-4 h-4 mr-2" />
              療程記錄
            </TabsTrigger>
            <TabsTrigger value="photos">
              <Camera className="w-4 h-4 mr-2" />
              前後對比
            </TabsTrigger>
            <TabsTrigger value="diary">
              <BookOpen className="w-4 h-4 mr-2" />
              美麗日記
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Trophy className="w-4 h-4 mr-2" />
              成就系統
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Recent Treatments */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>最近療程</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {treatmentHistory.slice(0, 3).map((treatment) => (
                      <div key={treatment.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{treatment.treatment}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{treatment.date}</span>
                            <span>•</span>
                            <span>{treatment.doctor}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-4 h-4 ${star <= treatment.satisfaction ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tags & Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>會員標籤</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedMember.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    新增標籤
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Personalized Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  個人化療程推薦
                </CardTitle>
                <CardDescription>根據會員歷史與偏好智能推薦</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "玻尿酸補打", reason: "距上次注射已 3 個月", match: 95 },
                    { name: "音波拉提", reason: "適合搭配玻尿酸效果", match: 88 },
                    { name: "保濕導入", reason: "術後保養推薦", match: 82 }
                  ].map((rec, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{rec.name}</h4>
                        <Badge className="bg-purple-100 text-purple-800">{rec.match}% 匹配</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{rec.reason}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        查看詳情
                      </Button>
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
                <div className="flex items-center justify-between">
                  <CardTitle>療程時間軸</CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新增記錄
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  
                  <div className="space-y-6">
                    {treatmentHistory.map((treatment, idx) => (
                      <div key={treatment.id} className="relative pl-10">
                        <div className="absolute left-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{treatment.treatment}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Calendar className="w-3 h-3" />
                                <span>{treatment.date}</span>
                                <span>•</span>
                                <span>{treatment.doctor}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-4 h-4 ${star <= treatment.satisfaction ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{treatment.notes}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Camera className="w-4 h-4 mr-2" />
                              查看照片
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              編輯
                            </Button>
                          </div>
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
                  <CardTitle>療程前後對比</CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    上傳照片
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {treatmentHistory.map((treatment) => (
                    <div key={treatment.id} className="border rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-50 border-b">
                        <h4 className="font-semibold">{treatment.treatment}</h4>
                        <p className="text-sm text-gray-500">{treatment.date}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 p-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 text-center">療程前</p>
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <Camera className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1 text-center">療程後</p>
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <Camera className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border-t flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="w-4 h-4 mr-2" />
                          下載
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Share2 className="w-4 h-4 mr-2" />
                          分享
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diary Tab */}
          <TabsContent value="diary" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>美麗日記</CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新增日記
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {beautyDiary.map((entry) => (
                    <div key={entry.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{entry.title}</h4>
                          <p className="text-sm text-gray-500">{entry.date}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Image className="w-4 h-4" />
                          <span>{entry.images} 張照片</span>
                          <Heart className="w-4 h-4 text-pink-500" />
                          <span>{entry.likes}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{entry.content}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          查看完整
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          編輯
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>成就系統</CardTitle>
                <CardDescription>解鎖成就獲得專屬獎勵</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`p-4 border rounded-lg ${achievement.unlocked ? 'bg-gradient-to-br from-purple-50 to-pink-50' : 'bg-gray-50 opacity-60'}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          achievement.unlocked ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gray-300'
                        }`}>
                          <achievement.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-gray-500">{achievement.description}</p>
                        </div>
                      </div>
                      {achievement.unlocked ? (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Trophy className="w-4 h-4" />
                          <span>已於 {achievement.date} 解鎖</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">進度</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-2" />
                        </div>
                      )}
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
