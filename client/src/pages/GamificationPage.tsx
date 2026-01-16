import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Gamepad2,
  Gift,
  Ticket,
  Star,
  Trophy,
  Target,
  QrCode,
  Smartphone,
  Store,
  TrendingUp,
  Users,
  BarChart3,
  Plus,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  Eye,
  Download,
  Upload,
  Sparkles,
  Coins,
  Receipt,
  CheckCircle,
  Clock,
  Calendar,
  Percent
} from "lucide-react";

// 遊戲模板
const gameTemplates = [
  {
    id: "wheel",
    name: "幸運輪盤",
    description: "轉動輪盤抽取獎品",
    icon: Target,
    color: "bg-pink-500",
    popular: true
  },
  {
    id: "scratch",
    name: "刮刮樂",
    description: "刮開卡片揭曉獎品",
    icon: Ticket,
    color: "bg-yellow-500",
    popular: true
  },
  {
    id: "stamp",
    name: "集點卡",
    description: "消費集點兌換獎勵",
    icon: Star,
    color: "bg-purple-500",
    popular: false
  },
  {
    id: "quiz",
    name: "問答遊戲",
    description: "答題贏取優惠",
    icon: Gamepad2,
    color: "bg-blue-500",
    popular: false
  }
];

// 進行中的活動
const activeGames = [
  {
    id: 1,
    name: "新春轉轉樂",
    type: "wheel",
    status: "active",
    participants: 2345,
    redemptions: 567,
    startDate: "2024-01-15",
    endDate: "2024-02-15"
  },
  {
    id: 2,
    name: "週年慶刮刮樂",
    type: "scratch",
    status: "active",
    participants: 1234,
    redemptions: 234,
    startDate: "2024-01-10",
    endDate: "2024-01-31"
  },
  {
    id: 3,
    name: "VIP 專屬集點",
    type: "stamp",
    status: "active",
    participants: 567,
    redemptions: 89,
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  }
];

// 優惠券類型
const couponTypes = [
  { id: 1, name: "折扣券", icon: Percent, count: 15, active: 8 },
  { id: 2, name: "現金券", icon: Coins, count: 12, active: 5 },
  { id: 3, name: "免費療程", icon: Gift, count: 5, active: 2 },
  { id: 4, name: "加購優惠", icon: Sparkles, count: 8, active: 4 }
];

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState("games");
  const [showWheelPreview, setShowWheelPreview] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">互動遊戲 & OMO</h1>
            <p className="text-gray-500 mt-1">遊戲化行銷、優惠券管理與線上線下整合</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            建立活動
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">活動參與</p>
                  <p className="text-2xl font-bold">4,146</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +34% 較上月
                  </p>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">優惠券發放</p>
                  <p className="text-2xl font-bold">890</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">核銷率</p>
                  <p className="text-2xl font-bold">67%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">帶動營收</p>
                  <p className="text-2xl font-bold">NT$156K</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="games">
              <Gamepad2 className="w-4 h-4 mr-2" />
              互動遊戲
            </TabsTrigger>
            <TabsTrigger value="coupons">
              <Ticket className="w-4 h-4 mr-2" />
              優惠券匣
            </TabsTrigger>
            <TabsTrigger value="stamps">
              <Star className="w-4 h-4 mr-2" />
              集點系統
            </TabsTrigger>
            <TabsTrigger value="omo">
              <Store className="w-4 h-4 mr-2" />
              OMO 整合
            </TabsTrigger>
            <TabsTrigger value="invoice">
              <Receipt className="w-4 h-4 mr-2" />
              發票登錄
            </TabsTrigger>
          </TabsList>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            {/* Game Templates */}
            <Card>
              <CardHeader>
                <CardTitle>遊戲模板</CardTitle>
                <CardDescription>選擇遊戲類型快速建立行銷活動</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {gameTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className="p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:border-primary relative"
                    >
                      {template.popular && (
                        <Badge className="absolute -top-2 -right-2 bg-pink-500">熱門</Badge>
                      )}
                      <div className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center mb-3`}>
                        <template.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        使用模板
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Games */}
            <Card>
              <CardHeader>
                <CardTitle>進行中的活動</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeGames.map((game) => (
                    <div key={game.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            game.type === 'wheel' ? 'bg-pink-100' : 
                            game.type === 'scratch' ? 'bg-yellow-100' : 'bg-purple-100'
                          }`}>
                            {game.type === 'wheel' && <Target className="w-5 h-5 text-pink-600" />}
                            {game.type === 'scratch' && <Ticket className="w-5 h-5 text-yellow-600" />}
                            {game.type === 'stamp' && <Star className="w-5 h-5 text-purple-600" />}
                          </div>
                          <div>
                            <h4 className="font-semibold">{game.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{game.startDate} ~ {game.endDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">進行中</Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{game.participants}</p>
                          <p className="text-xs text-gray-500">參與人數</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{game.redemptions}</p>
                          <p className="text-xs text-gray-500">獎品兌換</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wheel Preview */}
            <Card>
              <CardHeader>
                <CardTitle>輪盤預覽</CardTitle>
                <CardDescription>預覽幸運輪盤效果</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-8">
                  <div className="relative w-64 h-64">
                    {/* Wheel */}
                    <div className="w-full h-full rounded-full border-8 border-pink-500 relative overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="absolute w-full h-full"
                          style={{
                            transform: `rotate(${i * 60}deg)`,
                            clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%)'
                          }}
                        >
                          <div className={`w-full h-full ${
                            i % 2 === 0 ? 'bg-pink-400' : 'bg-purple-400'
                          }`} />
                        </div>
                      ))}
                      {/* Center */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center z-10">
                        <span className="text-pink-500 font-bold">GO!</span>
                      </div>
                    </div>
                    {/* Pointer */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                      <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-pink-600" />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Button>
                    <Play className="w-4 h-4 mr-2" />
                    試玩
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>優惠券管理</CardTitle>
                    <CardDescription>建立與管理各類優惠券</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    建立優惠券
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {couponTypes.map((type) => (
                    <div key={type.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <type.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{type.name}</h4>
                          <p className="text-sm text-gray-500">{type.count} 張</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">啟用中</span>
                        <Badge variant="secondary">{type.active}</Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon List */}
                <div className="space-y-3">
                  {[
                    { name: "新客首購 9 折", type: "折扣券", value: "9折", used: 234, total: 500, expiry: "2024-02-28" },
                    { name: "生日禮金 NT$300", type: "現金券", value: "NT$300", used: 89, total: 200, expiry: "2024-12-31" },
                    { name: "免費保濕導入", type: "免費療程", value: "免費", used: 45, total: 100, expiry: "2024-03-31" }
                  ].map((coupon, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {coupon.value}
                        </div>
                        <div>
                          <h4 className="font-medium">{coupon.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline">{coupon.type}</Badge>
                            <span>有效至 {coupon.expiry}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{coupon.used}/{coupon.total}</p>
                          <p className="text-xs text-gray-500">已使用</p>
                        </div>
                        <Progress value={(coupon.used / coupon.total) * 100} className="w-24 h-2" />
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stamps Tab */}
          <TabsContent value="stamps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>集點系統</CardTitle>
                <CardDescription>設定消費集點規則與兌換獎勵</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Stamp Card Preview */}
                  <div className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg">YOChiLL 集點卡</h4>
                      <Badge className="bg-white/20">VIP 專屬</Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <div 
                          key={i} 
                          className={`aspect-square rounded-full flex items-center justify-center ${
                            i <= 6 ? 'bg-white' : 'bg-white/30'
                          }`}
                        >
                          {i <= 6 && <Star className="w-4 h-4 text-purple-500" />}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>目前點數：6/10</span>
                      <span>再 4 點可兌換</span>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">集點規則</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">消費 NT$1,000 = 1 點</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">生日當月雙倍點數</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">首次消費額外 +2 點</span>
                          <Switch />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">兌換獎勵</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">10 點 → 免費保濕導入</span>
                          <Badge variant="secondary">啟用</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">20 點 → NT$500 折抵</span>
                          <Badge variant="secondary">啟用</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">50 點 → 免費玻尿酸 1cc</span>
                          <Badge variant="secondary">啟用</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OMO Tab */}
          <TabsContent value="omo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>OMO 線上線下整合</CardTitle>
                <CardDescription>整合線上會員與門市消費數據</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* QR Code Scanner */}
                  <div className="p-6 border rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">門市掃碼核銷</h4>
                        <p className="text-sm text-gray-500">掃描顧客 QR Code 核銷優惠券</p>
                      </div>
                    </div>
                    <div className="aspect-square max-w-xs mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center text-gray-400">
                        <QrCode className="w-16 h-16 mx-auto mb-2" />
                        <p>點擊開啟掃描器</p>
                      </div>
                    </div>
                    <Button className="w-full">
                      <QrCode className="w-4 h-4 mr-2" />
                      開始掃描
                    </Button>
                  </div>

                  {/* Member Binding */}
                  <div className="p-6 border rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">會員綁定</h4>
                        <p className="text-sm text-gray-500">綁定線上線下會員資料</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Input placeholder="輸入會員手機號碼" />
                      <Input placeholder="或輸入會員編號" />
                      <Button className="w-full">
                        查詢會員
                      </Button>
                    </div>
                  </div>
                </div>

                {/* OMO Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-600">89%</p>
                    <p className="text-sm text-gray-600">會員綁定率</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">1,234</p>
                    <p className="text-sm text-gray-600">本月核銷次數</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-600">NT$456K</p>
                    <p className="text-sm text-gray-600">OMO 帶動營收</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoice Tab */}
          <TabsContent value="invoice" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>發票登錄活動</CardTitle>
                <CardDescription>顧客上傳發票參與抽獎活動</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upload Preview */}
                  <div className="p-6 border rounded-lg">
                    <h4 className="font-semibold mb-4">發票上傳預覽</h4>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500 mb-2">拖曳或點擊上傳發票照片</p>
                      <p className="text-xs text-gray-400">支援 JPG、PNG 格式</p>
                    </div>
                  </div>

                  {/* Activity Settings */}
                  <div className="p-6 border rounded-lg">
                    <h4 className="font-semibold mb-4">活動設定</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">活動名稱</label>
                        <Input placeholder="例：週年慶發票登錄抽大獎" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">最低消費金額</label>
                        <Input placeholder="NT$1,000" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">活動期間</label>
                        <div className="flex gap-2 mt-1">
                          <Input type="date" />
                          <Input type="date" />
                        </div>
                      </div>
                      <Button className="w-full">
                        建立活動
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Recent Submissions */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">最近登錄</h4>
                  <div className="space-y-3">
                    {[
                      { member: "王小明", amount: "NT$3,500", date: "2024-01-15 14:30", status: "approved" },
                      { member: "李小華", amount: "NT$2,800", date: "2024-01-15 13:45", status: "pending" },
                      { member: "張大偉", amount: "NT$5,200", date: "2024-01-15 12:20", status: "approved" }
                    ].map((submission, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Receipt className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{submission.member}</p>
                            <p className="text-sm text-gray-500">{submission.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{submission.amount}</span>
                          <Badge className={submission.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {submission.status === 'approved' ? '已審核' : '待審核'}
                          </Badge>
                        </div>
                      </div>
                    ))}
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
