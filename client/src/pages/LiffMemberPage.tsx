import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, Calendar, ShoppingBag, Gift, Heart, Settings, 
  ChevronRight, Crown, Star, Clock, CreditCard 
} from "lucide-react";

// LIFF 會員中心頁面 - 顧客端
export default function LiffMemberPage() {
  // Mock member data
  const member = {
    name: "王小明",
    phone: "0912-345-678",
    level: "VIP",
    points: 12500,
    totalSpent: 158000,
    upcomingAppointments: 2,
    coupons: 3,
  };

  const levelColors: Record<string, string> = {
    一般: "bg-gray-100 text-gray-700",
    銀卡: "bg-gray-200 text-gray-800",
    金卡: "bg-yellow-100 text-yellow-700",
    VIP: "bg-purple-100 text-purple-700",
    VVIP: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  };

  const menuItems = [
    { icon: Calendar, label: "我的預約", badge: member.upcomingAppointments, href: "/liff/appointments" },
    { icon: ShoppingBag, label: "消費紀錄", href: "/liff/orders" },
    { icon: Gift, label: "我的優惠券", badge: member.coupons, href: "/liff/coupons" },
    { icon: Heart, label: "收藏療程", href: "/liff/favorites" },
    { icon: CreditCard, label: "儲值紀錄", href: "/liff/topup" },
    { icon: Settings, label: "帳戶設定", href: "/liff/settings" },
  ];

  const recentAppointments = [
    { id: 1, service: "玻尿酸注射", date: "2026/01/20", time: "14:00", status: "confirmed" },
    { id: 2, service: "皮秒雷射", date: "2026/01/25", time: "10:30", status: "pending" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header with Profile */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-500 text-white">
        <div className="container py-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
              {member.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{member.name}</h1>
                <Badge className={levelColors[member.level]}>
                  <Crown className="h-3 w-3 mr-1" />
                  {member.level}
                </Badge>
              </div>
              <p className="text-white/80 text-sm mt-1">{member.phone}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{member.points.toLocaleString()}</p>
              <p className="text-xs text-white/80">可用點數</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{member.upcomingAppointments}</p>
              <p className="text-xs text-white/80">待赴約</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{member.coupons}</p>
              <p className="text-xs text-white/80">優惠券</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6 -mt-4">
        {/* Quick Actions */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <button className="flex flex-col items-center gap-2 p-2">
                <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-pink-600" />
                </div>
                <span className="text-xs">預約療程</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-2">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xs">線上商城</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-2">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Gift className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs">領取優惠</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-2">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xs">點數兌換</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">即將到來的預約</CardTitle>
              <Button variant="ghost" size="sm" className="text-pink-600">
                查看全部
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50"
              >
                <div className="h-12 w-12 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{apt.service}</p>
                  <p className="text-sm text-gray-500">
                    {apt.date} {apt.time}
                  </p>
                </div>
                <Badge
                  className={
                    apt.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }
                >
                  {apt.status === "confirmed" ? "已確認" : "待確認"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  index !== menuItems.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-gray-600" />
                </div>
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {item.badge && (
                  <Badge className="bg-pink-100 text-pink-700">{item.badge}</Badge>
                )}
                <ChevronRight className="h-5 w-5 text-gray-300" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Membership Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">會員等級進度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">累計消費</span>
                <span className="font-medium">NT$ {member.totalSpent.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${Math.min((member.totalSpent / 200000) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                再消費 NT$ {(200000 - member.totalSpent).toLocaleString()} 即可升級至 VVIP
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
