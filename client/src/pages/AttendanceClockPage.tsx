import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

/**
 * GPS 定位打卡頁面
 * 整合 LINE LIFF SDK 取得 GPS 定位
 */

export default function AttendanceClockPage() {
  const [organizationId] = useState(60001); // 測試診所 ID
  const [staffId] = useState(1); // 測試員工 ID
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    address: string;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isCorrectionDialogOpen, setIsCorrectionDialogOpen] = useState(false);

  // 查詢今日打卡狀態
  const { data: todayStatus, refetch: refetchStatus } = trpc.attendance.getTodayStatus.useQuery({
    organizationId,
    staffId,
  });

  // 上班打卡
  const clockIn = trpc.attendance.clockIn.useMutation({
    onSuccess: () => {
      toast.success('上班打卡成功！');
      refetchStatus();
    },
    onError: (error) => {
      toast.error(`打卡失敗：${error.message}`);
    },
  });

  // 下班打卡
  const clockOut = trpc.attendance.clockOut.useMutation({
    onSuccess: () => {
      toast.success('下班打卡成功！');
      refetchStatus();
    },
    onError: (error) => {
      toast.error(`打卡失敗：${error.message}`);
    },
  });

  // 補登申請
  const requestCorrection = trpc.attendance.requestCorrection.useMutation({
    onSuccess: () => {
      toast.success('補登申請已提交，等待主管審核');
      setIsCorrectionDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`補登申請失敗：${error.message}`);
    },
  });

  // 取得 GPS 定位
  const getLocation = () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('您的瀏覽器不支援 GPS 定位');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // 使用 Geocoding API 取得地址（這裡簡化處理）
        const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        setLocation({
          latitude,
          longitude,
          accuracy,
          address,
        });
        
        setIsLoadingLocation(false);
        toast.success('GPS 定位成功');
      },
      (error) => {
        console.error('GPS 定位失敗:', error);
        toast.error('GPS 定位失敗，請確認已開啟定位權限');
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // 頁面載入時自動取得定位
  useEffect(() => {
    getLocation();
  }, []);

  // 處理上班打卡
  const handleClockIn = () => {
    if (!location) {
      toast.error('請先取得 GPS 定位');
      return;
    }

    clockIn.mutate({
      organizationId,
      staffId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      address: location.address,
    });
  };

  // 處理下班打卡
  const handleClockOut = () => {
    if (!location) {
      toast.error('請先取得 GPS 定位');
      return;
    }

    clockOut.mutate({
      organizationId,
      staffId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      address: location.address,
    });
  };

  // 處理補登申請
  const handleCorrectionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    requestCorrection.mutate({
      organizationId,
      staffId,
      recordDate: formData.get('recordDate') as string,
      clockIn: formData.get('clockIn') as string,
      clockOut: formData.get('clockOut') as string,
      reason: formData.get('reason') as string,
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">智慧打卡</h1>
        <p className="text-muted-foreground mt-2">GPS 定位打卡，精準記錄出勤時間</p>
      </div>

      {/* 今日打卡狀態 */}
      <Card className="mb-6 bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Clock className="h-5 w-5 text-primary" />
            今日打卡狀態
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50">
              {todayStatus?.hasClockedIn ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">上班打卡</p>
                    <p className="font-semibold text-foreground">
                      {todayStatus.record?.clockIn
                        ? new Date(todayStatus.record.clockIn).toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '--:--'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">上班打卡</p>
                    <p className="font-semibold text-muted-foreground">未打卡</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50">
              {todayStatus?.hasClockedOut ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">下班打卡</p>
                    <p className="font-semibold text-foreground">
                      {todayStatus.record?.clockOut
                        ? new Date(todayStatus.record.clockOut).toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '--:--'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">下班打卡</p>
                    <p className="font-semibold text-muted-foreground">未打卡</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GPS 定位資訊 */}
      <Card className="mb-6 bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            GPS 定位資訊
          </CardTitle>
        </CardHeader>
        <CardContent>
          {location ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <span className="text-sm text-muted-foreground">經度</span>
                <span className="font-mono text-sm text-foreground">{location.longitude.toFixed(6)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <span className="text-sm text-muted-foreground">緯度</span>
                <span className="font-mono text-sm text-foreground">{location.latitude.toFixed(6)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <span className="text-sm text-muted-foreground">精確度</span>
                <span className="text-sm text-foreground">{location.accuracy.toFixed(0)} 公尺</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <span className="text-sm text-muted-foreground">地址</span>
                <span className="text-sm text-foreground">{location.address}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={getLocation}
                disabled={isLoadingLocation}
                className="w-full"
              >
                {isLoadingLocation ? '定位中...' : '重新定位'}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">正在取得 GPS 定位...</p>
              <Button onClick={getLocation} disabled={isLoadingLocation}>
                {isLoadingLocation ? '定位中...' : '重新定位'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 打卡按鈕 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          size="lg"
          onClick={handleClockIn}
          disabled={!location || todayStatus?.hasClockedIn || clockIn.isPending}
          className="h-24 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Clock className="mr-2 h-6 w-6" />
          {todayStatus?.hasClockedIn ? '已打上班卡' : '上班打卡'}
        </Button>

        <Button
          size="lg"
          onClick={handleClockOut}
          disabled={
            !location ||
            !todayStatus?.hasClockedIn ||
            todayStatus?.hasClockedOut ||
            clockOut.isPending
          }
          className="h-24 text-lg font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          <Clock className="mr-2 h-6 w-6" />
          {todayStatus?.hasClockedOut ? '已打下班卡' : '下班打卡'}
        </Button>
      </div>

      {/* 補登申請 */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <AlertCircle className="h-5 w-5 text-primary" />
            補登申請
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            忘記打卡？申請補登，等待主管審核
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isCorrectionDialogOpen} onOpenChange={setIsCorrectionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                申請補登打卡
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-popover text-popover-foreground">
              <DialogHeader>
                <DialogTitle className="text-popover-foreground">申請補登打卡</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  填寫補登資訊，提交後等待主管審核
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCorrectionSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="recordDate" className="text-popover-foreground">日期</Label>
                  <Input
                    id="recordDate"
                    name="recordDate"
                    type="date"
                    required
                    className="bg-background text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="clockIn" className="text-popover-foreground">上班時間</Label>
                  <Input
                    id="clockIn"
                    name="clockIn"
                    type="time"
                    required
                    className="bg-background text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="clockOut" className="text-popover-foreground">下班時間</Label>
                  <Input
                    id="clockOut"
                    name="clockOut"
                    type="time"
                    className="bg-background text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="reason" className="text-popover-foreground">補登原因</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    required
                    placeholder="請說明補登原因..."
                    className="bg-background text-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={requestCorrection.isPending}
                >
                  {requestCorrection.isPending ? '提交中...' : '提交申請'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
