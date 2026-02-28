import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, ShoppingBag, Gift, Heart, Settings,
  ChevronRight, Crown, Star, Clock, CreditCard, Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLiffContext } from "@/components/auth/LiffAuthProvider";
import { useLocation } from "wouter";

/**
 * LIFF 會員中心頁面 — 顧客端
 *
 * 從 LiffAuthProvider 取得已認證的顧客資訊，
 * 串接真實的 customer、appointment、coupon API。
 */
export default function LiffMemberPage() {
  const { user, logout } = useLiffContext();
  const [, navigate] = useLocation();
  const organizationId = user?.organizationId ?? 1;

  // 取得即將到來的預約
  const appointmentsQuery = trpc.appointment.list.useQuery(
    { organizationId, limit: 10 },
    { enabled: !!organizationId }
  );

  // 取得優惠券數量
  const couponsQuery = trpc.coupon.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  // 從 LIFF context 取得會員資料
  const member = {
    name: user?.name ?? "會員",
    level: user?.memberLevel ?? "bronze",
    picture: user?.picture ?? null,
    lineUserId: user?.lineUserId ?? "",
    totalSpent: 0,
    upcomingAppointments: 0,
    coupons: 0,
  };

  // 計算預約數
  const rawAppointments = appointmentsQuery.data;
  const appointmentList: any[] = Array.isArray(rawAppointments)
    ? rawAppointments
    : (rawAppointments as any)?.data ?? [];
  const upcomingAppointments = appointmentList.filter(
    (a: any) => a.status === "confirmed" || a.status === "pending"
  );
  member.upcomingAppointments = upcomingAppointments.length;

  // 計算優惠券數
  const rawCoupons = couponsQuery.data;
  const couponList: any[] = Array.isArray(rawCoupons)
    ? rawCoupons
    : (rawCoupons as any)?.data ?? [];
  member.coupons = couponList.length;

  const recentAppointments = upcomingAppointments.slice(0, 3).map((apt: any) => ({
    id: apt.id,
    service: apt.productName ?? apt.product?.name ?? "療程",
    date: apt.appointmentDate ?? "",
    time: apt.startTime ?? "",
    status: apt.status ?? "pending",
  }));

  const levelLabels: Record<string, string> = {
    bronze: "一般",
    silver: "銀卡",
    gold: "金卡",
    vip: "VIP",
    vvip: "VVIP",
  };

  const levelColors: Record<string, string> = {
    bronze: "bg-gray-100 text-gray-700",
    silver: "bg-gray-200 text-gray-800",
    gold: "bg-yellow-100 text-yellow-700",
    vip: "bg-purple-100 text-purple-700",
    vvip: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  };

  const menuItems = [
    { icon: Calendar, label: "線上預約", href: "/liff/booking" },
    { icon: ShoppingBag, label: "消費紀錄", href: "/liff/orders" },
    { icon: Gift, label: "我的優惠券", badge: member.coupons, href: "/liff/my-vouchers" },
    { icon: Heart, label: "線上商城", href: "/liff/shop" },
    { icon: CreditCard, label: "我的票券", href: "/liff/my-vouchers" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header with Profile */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-500 text-white">
        <div className="container py-8">
          <div className="flex items-center gap-4">
            {member.picture ? (
              <img
                src={member.picture}
                alt={member.name}
                className="h-16 w-16 rounded-full border-2 border-white/30"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
                {member.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{member.name}</h1>
                <Badge className={levelColors[member.level] ?? levelColors["bronze"]}>
                  <Crown className="h-3 w-3 mr-1" />
                  {levelLabels[member.level] ?? member.level}
                </Badge>
              </div>
              <p className="text-white/80 text-sm mt-1">LINE 會員</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
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
              <button
                onClick={() => navigate("/liff/booking")}
                className="flex flex-col items-center gap-2 p-2"
              >
                <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-pink-600" />
                </div>
                <span className="text-xs">預約療程</span>
              </button>
              <button
                onClick={() => navigate("/liff/shop")}
                className="flex flex-col items-center gap-2 p-2"
              >
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xs">線上商城</span>
              </button>
              <button
                onClick={() => navigate("/liff/my-vouchers")}
                className="flex flex-col items-center gap-2 p-2"
              >
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Gift className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs">我的票券</span>
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
              <Button
                variant="ghost"
                size="sm"
                className="text-pink-600"
                onClick={() => navigate("/liff/booking")}
              >
                新增預約
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointmentsQuery.isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
                <span className="text-gray-400">載入中...</span>
              </div>
            ) : recentAppointments.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">暫無預約</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate("/liff/booking")}
                >
                  立即預約
                </Button>
              </div>
            ) : (
              recentAppointments.map((apt) => (
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
              ))
            )}
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  index !== menuItems.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-gray-600" />
                </div>
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {item.badge ? (
                  <Badge className="bg-pink-100 text-pink-700">{item.badge}</Badge>
                ) : null}
                <ChevronRight className="h-5 w-5 text-gray-300" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Logout */}
        <div className="pb-8">
          <Button
            variant="outline"
            className="w-full text-gray-500"
            onClick={logout}
          >
            登出
          </Button>
        </div>
      </div>
    </div>
  );
}
