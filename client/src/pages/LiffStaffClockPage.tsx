import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useStaffContext } from "@/hooks/useStaffContext";
import { PageLoadingSkeleton, PageError } from "@/components/ui/page-skeleton";

// Clinic location for geofencing
const clinicLocation = { lat: 25.0418, lng: 121.5445, radius: 100 };

export default function LiffStaffClockPage() {
  const { organizationId, staffId, isLoading: ctxLoading } = useStaffContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isInRange, setIsInRange] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const utils = trpc.useUtils();

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          const distance = Math.sqrt(
            Math.pow((latitude - clinicLocation.lat) * 111000, 2) +
            Math.pow((longitude - clinicLocation.lng) * 111000 * Math.cos(latitude * Math.PI / 180), 2)
          );
          setIsInRange(distance <= clinicLocation.radius);
          setIsLoadingLocation(false);
        },
        () => {
          setIsLoadingLocation(false);
          setIsInRange(true); // Dev fallback
        }
      );
    } else {
      setIsLoadingLocation(false);
      setIsInRange(true);
    }
  }, []);

  // Fetch today's attendance status
  const todayStatus = trpc.sprint5.attendance.todayStatus.useQuery(
    { organizationId, staffId },
    { enabled: !ctxLoading }
  );

  // Fetch monthly stats
  const now = new Date();
  const monthlyStats = trpc.sprint5.attendance.monthlyStats.useQuery(
    { organizationId, staffId, year: now.getFullYear(), month: now.getMonth() + 1 },
    { enabled: !ctxLoading }
  );

  // Clock in/out mutations
  const clockIn = trpc.sprint5.attendance.clockIn.useMutation({
    onSuccess: () => {
      utils.sprint5.attendance.todayStatus.invalidate();
      utils.sprint5.attendance.monthlyStats.invalidate();
    },
  });

  const clockOut = trpc.sprint5.attendance.clockOut.useMutation({
    onSuccess: () => {
      utils.sprint5.attendance.todayStatus.invalidate();
      utils.sprint5.attendance.monthlyStats.invalidate();
    },
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  };

  const formatDate = (date: Date) => {
    const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} (${weekDays[date.getDay()]})`;
  };

  if (ctxLoading || todayStatus.isLoading) {
    return <PageLoadingSkeleton message="載入打卡頁面..." />;
  }

  if (todayStatus.isError) {
    return <PageError message="無法載入打卡狀態" onRetry={() => todayStatus.refetch()} />;
  }

  const status: any = todayStatus.data ?? {};
  const hasClockedIn = !!status.clockInTime;
  const hasClockedOut = !!status.clockOutTime;
  const stats: any = monthlyStats.data ?? {};

  const handleClockIn = () => {
    clockIn.mutate({
      organizationId,
      staffId,
      latitude: userLocation?.lat,
      longitude: userLocation?.lng,
    });
  };

  const handleClockOut = () => {
    clockOut.mutate({
      organizationId,
      staffId,
      latitude: userLocation?.lat,
      longitude: userLocation?.lng,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/liff/member">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">打卡</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Date & Time */}
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
          <CardContent className="p-6 text-center">
            <p className="text-sm opacity-80">{formatDate(currentTime)}</p>
            <p className="text-5xl font-bold mt-2 font-mono">{formatTime(currentTime)}</p>

            {/* Location Status */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {isLoadingLocation ? (
                <div className="flex items-center gap-2 text-sm opacity-80">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  定位中...
                </div>
              ) : isInRange ? (
                <div className="flex items-center gap-2 text-sm text-green-300">
                  <MapPin className="w-4 h-4" />
                  已在診所範圍內
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-yellow-300">
                  <AlertCircle className="w-4 h-4" />
                  不在診所範圍內
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clock In/Out Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Card className={hasClockedIn ? "opacity-60" : ""}>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-2">上班打卡</p>
              {hasClockedIn ? (
                <div>
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{status.clockInTime ?? "--:--"}</p>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleClockIn}
                  disabled={clockIn.isPending || !isInRange}
                >
                  {clockIn.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Clock className="w-4 h-4 mr-1" />
                  )}
                  打卡上班
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className={!hasClockedIn || hasClockedOut ? "opacity-60" : ""}>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-2">下班打卡</p>
              {hasClockedOut ? (
                <div>
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{status.clockOutTime ?? "--:--"}</p>
                </div>
              ) : (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleClockOut}
                  disabled={clockOut.isPending || !hasClockedIn || hasClockedOut}
                >
                  {clockOut.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Clock className="w-4 h-4 mr-1" />
                  )}
                  打卡下班
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">今日狀態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">上班時間</p>
                <p className="font-bold">{status.clockInTime ?? "--:--"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">下班時間</p>
                <p className="font-bold">{status.clockOutTime ?? "--:--"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">工作時數</p>
                <p className="font-bold">{status.workHours ?? "--"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">本月統計</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyStats.isLoading ? (
              <div className="text-center py-4 text-gray-400">載入中...</div>
            ) : (
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalDays ?? 0}</p>
                  <p className="text-xs text-gray-500">出勤天數</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.onTimeDays ?? 0}</p>
                  <p className="text-xs text-gray-500">準時</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.lateDays ?? 0}</p>
                  <p className="text-xs text-gray-500">遲到</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.earlyLeaveDays ?? 0}</p>
                  <p className="text-xs text-gray-500">早退</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
