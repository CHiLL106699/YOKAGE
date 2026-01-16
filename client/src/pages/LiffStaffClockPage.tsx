import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Calendar,
  User,
  LogIn,
  LogOut,
  AlertTriangle,
  Navigation,
  Loader2,
  History
} from "lucide-react";
import { Link } from "wouter";

// 模擬員工資料
const mockStaff = {
  id: "staff-001",
  name: "陳美美",
  role: "美容師",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
};

// 模擬今日打卡記錄
const mockTodayRecords = [
  { type: "clock_in", time: "09:02", status: "normal", location: "YOChiLL 診所" },
  { type: "clock_out", time: "12:30", status: "normal", location: "YOChiLL 診所" },
  { type: "clock_in", time: "13:28", status: "late", location: "YOChiLL 診所" }
];

// 模擬本週打卡記錄
const mockWeekRecords = [
  { date: "01/15 (一)", clockIn: "09:02", clockOut: "18:05", status: "normal", hours: "9h 3m" },
  { date: "01/14 (日)", clockIn: "-", clockOut: "-", status: "休假", hours: "-" },
  { date: "01/13 (六)", clockIn: "-", clockOut: "-", status: "休假", hours: "-" },
  { date: "01/12 (五)", clockIn: "08:58", clockOut: "18:30", status: "normal", hours: "9h 32m" },
  { date: "01/11 (四)", clockIn: "09:15", clockOut: "18:00", status: "late", hours: "8h 45m" },
  { date: "01/10 (三)", clockIn: "09:00", clockOut: "18:10", status: "normal", hours: "9h 10m" },
  { date: "01/09 (二)", clockIn: "08:55", clockOut: "17:30", status: "early_leave", hours: "8h 35m" }
];

// 診所位置（模擬）
const clinicLocation = {
  lat: 25.0418,
  lng: 121.5445,
  radius: 100 // 100公尺範圍內可打卡
};

export default function LiffStaffClockPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [isClockingOut, setIsClockingOut] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isInRange, setIsInRange] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // 更新時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 取得位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // 計算距離（簡化版）
          const distance = Math.sqrt(
            Math.pow((latitude - clinicLocation.lat) * 111000, 2) +
            Math.pow((longitude - clinicLocation.lng) * 111000 * Math.cos(latitude * Math.PI / 180), 2)
          );
          setIsInRange(distance <= clinicLocation.radius);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Location error:", error);
          setIsLoadingLocation(false);
          // 開發模式：假設在範圍內
          setIsInRange(true);
        }
      );
    }
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const handleClockIn = async () => {
    if (!isInRange) {
      setShowLocationError(true);
      return;
    }
    
    setIsClockingIn(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsClockingIn(false);
    toast.success("上班打卡成功！");
  };

  const handleClockOut = async () => {
    if (!isInRange) {
      setShowLocationError(true);
      return;
    }
    
    setIsClockingOut(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsClockingOut(false);
    toast.success("下班打卡成功！");
  };

  // 判斷目前應該顯示上班還是下班打卡
  const lastRecord = mockTodayRecords[mockTodayRecords.length - 1];
  const shouldClockIn = !lastRecord || lastRecord.type === "clock_out";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <img 
              src={mockStaff.avatar}
              alt={mockStaff.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
            />
            <div>
              <h1 className="font-bold text-lg">{mockStaff.name}</h1>
              <p className="text-sm text-gray-500">{mockStaff.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Clock Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 text-center">
            <p className="text-sm opacity-80">{formatDate(currentTime)}</p>
            <p className="text-5xl font-bold my-4 font-mono">{formatTime(currentTime)}</p>
            
            {/* Location Status */}
            <div className="flex items-center justify-center gap-2 text-sm">
              {isLoadingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>定位中...</span>
                </>
              ) : isInRange ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  <span>已在診所範圍內</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-yellow-300" />
                  <span>不在診所範圍內</span>
                </>
              )}
            </div>
          </div>

          <CardContent className="p-6">
            {/* Clock Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                size="lg"
                className={`h-20 flex-col gap-2 ${shouldClockIn ? "bg-green-500 hover:bg-green-600" : "bg-gray-200 text-gray-500"}`}
                disabled={!shouldClockIn || isClockingIn || isLoadingLocation}
                onClick={handleClockIn}
              >
                {isClockingIn ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <LogIn className="w-6 h-6" />
                )}
                <span>上班打卡</span>
              </Button>
              <Button 
                size="lg"
                className={`h-20 flex-col gap-2 ${!shouldClockIn ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-200 text-gray-500"}`}
                disabled={shouldClockIn || isClockingOut || isLoadingLocation}
                onClick={handleClockOut}
              >
                {isClockingOut ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <LogOut className="w-6 h-6" />
                )}
                <span>下班打卡</span>
              </Button>
            </div>

            {/* Schedule Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">今日班表</span>
                <span className="font-medium">09:00 - 18:00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today Records */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              今日打卡記錄
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mockTodayRecords.length === 0 ? (
              <p className="text-center text-gray-400 py-4">尚無打卡記錄</p>
            ) : (
              <div className="space-y-3">
                {mockTodayRecords.map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        record.type === "clock_in" ? "bg-green-100" : "bg-orange-100"
                      }`}>
                        {record.type === "clock_in" ? (
                          <LogIn className="w-5 h-5 text-green-600" />
                        ) : (
                          <LogOut className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {record.type === "clock_in" ? "上班" : "下班"}
                        </p>
                        <p className="text-xs text-gray-500">{record.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-medium">{record.time}</p>
                      <Badge variant={record.status === "normal" ? "outline" : "destructive"} className="text-xs">
                        {record.status === "normal" ? "正常" : "遲到"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Week Records */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4" />
              本週記錄
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-500">日期</th>
                    <th className="text-center py-2 font-medium text-gray-500">上班</th>
                    <th className="text-center py-2 font-medium text-gray-500">下班</th>
                    <th className="text-center py-2 font-medium text-gray-500">時數</th>
                    <th className="text-right py-2 font-medium text-gray-500">狀態</th>
                  </tr>
                </thead>
                <tbody>
                  {mockWeekRecords.map((record, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2">{record.date}</td>
                      <td className="py-2 text-center font-mono">{record.clockIn}</td>
                      <td className="py-2 text-center font-mono">{record.clockOut}</td>
                      <td className="py-2 text-center">{record.hours}</td>
                      <td className="py-2 text-right">
                        <Badge 
                          variant="outline"
                          className={
                            record.status === "normal" ? "text-green-600 border-green-200" :
                            record.status === "late" ? "text-red-600 border-red-200" :
                            record.status === "early_leave" ? "text-orange-600 border-orange-200" :
                            "text-gray-600 border-gray-200"
                          }
                        >
                          {record.status === "normal" ? "正常" :
                           record.status === "late" ? "遲到" :
                           record.status === "early_leave" ? "早退" :
                           record.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/liff/staff/schedule">
            <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-sm">班表查詢</p>
            </Card>
          </Link>
          <Link href="/liff/staff/tasks">
            <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-sm">任務清單</p>
            </Card>
          </Link>
          <Link href="/liff/staff/leave">
            <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <User className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <p className="text-sm">請假申請</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Location Error Dialog */}
      <Dialog open={showLocationError} onOpenChange={setShowLocationError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              無法打卡
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              您目前不在診所範圍內，請移動至診所後再進行打卡。
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">YOChiLL 醫美診所</p>
                  <p className="text-sm text-gray-500">台北市大安區忠孝東路四段123號5樓</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowLocationError(false)}>
              關閉
            </Button>
            <Button className="flex-1">
              <Navigation className="w-4 h-4 mr-2" />
              導航至診所
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
