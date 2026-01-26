import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { MapPin, Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export default function AttendanceClockInPage() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: todayRecords } = trpc.attendance.list.useQuery({
    organizationId: 1, // TODO: Get from context
    date: new Date().toISOString().split('T')[0],
  });

  const todayRecord = todayRecords?.[0];

  const clockInMutation = trpc.attendance.clockIn.useMutation({
    onSuccess: () => {
      toast.success("上班打卡成功！");
    },
    onError: (error) => {
      toast.error(`打卡失敗: ${error.message}`);
    },
  });

  const clockOutMutation = trpc.attendance.clockOut.useMutation({
    onSuccess: () => {
      toast.success("下班打卡成功！");
    },
    onError: (error) => {
      toast.error(`打卡失敗: ${error.message}`);
    },
  });

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("您的瀏覽器不支援定位功能");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        toast.warning("定位失敗，但仍可進行打卡");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleClockIn = () => {
    clockInMutation.mutate({
      organizationId: 1, // TODO: Get from context
      staffId: 1, // TODO: Get from auth context
      location: position ? { lat: position.latitude, lng: position.longitude } : undefined,
    });
  };

  const handleClockOut = () => {
    if (!todayRecord?.id) {
      toast.error("找不到今日打卡記錄");
      return;
    }

    clockOutMutation.mutate({
      id: todayRecord.id,
      location: position ? { lat: position.latitude, lng: position.longitude } : undefined,
    });
  };

  const hasClockedIn = !!todayRecord?.clockIn;
  const hasClockedOut = !!todayRecord?.clockOut;

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            員工打卡
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString("zh-TW", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 定位狀態 */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">定位狀態</span>
              </div>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {position && !loading && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  已定位
                </Badge>
              )}
              {error && !loading && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  定位失敗
                </Badge>
              )}
            </div>

            {position && (
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>緯度: {position.latitude.toFixed(6)}</div>
                <div>經度: {position.longitude.toFixed(6)}</div>
                <div className="flex items-center gap-2">
                  <span>精確度: {position.accuracy.toFixed(2)} 公尺</span>
                  {position.accuracy < 20 && (
                    <Badge variant="outline" className="text-green-600">
                      精確
                    </Badge>
                  )}
                  {position.accuracy >= 20 && position.accuracy < 50 && (
                    <Badge variant="outline" className="text-yellow-600">
                      普通
                    </Badge>
                  )}
                  {position.accuracy >= 50 && (
                    <Badge variant="outline" className="text-red-600">
                      不精確
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-muted-foreground">
                <AlertCircle className="inline h-4 w-4 mr-1" />
                {error}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={getLocation}
              disabled={loading}
              className="w-full"
            >
              {loading ? "定位中..." : "重新定位"}
            </Button>
          </div>

          {/* 打卡按鈕 */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              size="lg"
              onClick={handleClockIn}
              disabled={hasClockedIn || clockInMutation.isPending}
              className="h-24"
            >
              {clockInMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : hasClockedIn ? (
                "已上班打卡"
              ) : (
                <>
                  <Clock className="mr-2 h-5 w-5" />
                  上班打卡
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="secondary"
              onClick={handleClockOut}
              disabled={!hasClockedIn || hasClockedOut || clockOutMutation.isPending}
              className="h-24"
            >
              {clockOutMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : hasClockedOut ? (
                "已下班打卡"
              ) : (
                <>
                  <Clock className="mr-2 h-5 w-5" />
                  下班打卡
                </>
              )}
            </Button>
          </div>

          {/* 今日打卡記錄 */}
          {todayRecord && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="font-medium">今日打卡記錄</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">上班時間</div>
                  <div className="font-medium">
                    {todayRecord.clockIn
                      ? new Date(todayRecord.clockIn).toLocaleTimeString("zh-TW")
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">下班時間</div>
                  <div className="font-medium">
                    {todayRecord.clockOut
                      ? new Date(todayRecord.clockOut).toLocaleTimeString("zh-TW")
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 降級機制提示 */}
          {!position && !loading && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm">
              <AlertCircle className="inline h-4 w-4 mr-2 text-yellow-600" />
              <span className="text-yellow-800">
                定位功能暫時無法使用，但您仍可進行打卡。系統將記錄打卡時間。
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
