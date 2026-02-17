import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, LogIn, LogOut, CheckCircle2, Navigation } from 'lucide-react';
import { format } from 'date-fns';

import { QueryError } from '@/components/ui/query-state';

export default function StaffClockEnhanced() {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsError, setGpsError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const ORG_ID = 1;
  const STAFF_ID = 1;

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const utils = trpc.useUtils();

  const { data: todayStatus, isLoading, isError, refetch } = trpc.pro.sprint5.attendance.todayStatus.useQuery({
    organizationId: ORG_ID,
    staffId: STAFF_ID,
  });

  const clockInMutation = trpc.pro.sprint5.attendance.clockIn.useMutation({
    onSuccess: (data) => {
      toast({ title: '上班打卡成功', description: `打卡時間：${format(new Date(data.time), 'HH:mm:ss')}` });
      utils.pro.sprint5.attendance.todayStatus.invalidate();
    },
    onError: (err) => toast({ title: '打卡失敗', description: err.message, variant: 'destructive' }),
  });

  const clockOutMutation = trpc.pro.sprint5.attendance.clockOut.useMutation({
    onSuccess: (data) => {
      toast({ title: '下班打卡成功', description: `打卡時間：${format(new Date(data.time), 'HH:mm:ss')}` });
      utils.pro.sprint5.attendance.todayStatus.invalidate();
    },
    onError: (err) => toast({ title: '打卡失敗', description: err.message, variant: 'destructive' }),
  });

  function getGPS(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('此裝置不支援 GPS 定位'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  }

  async function refreshGPS() {
    setGpsLoading(true);
    setGpsError('');
    try {
      const pos = await getGPS();
      setGpsLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'GPS 定位失敗';
      setGpsError(msg);
    } finally {
      setGpsLoading(false);
    }
  }

  // Auto-fetch GPS on mount
  useEffect(() => { refreshGPS(); }, []);

  async function handleClockIn() {
    let loc = gpsLocation;
    if (!loc) {
      try {
        const pos = await getGPS();
        loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        setGpsLocation(loc);
      } catch {
        toast({ title: '錯誤', description: '無法取得 GPS 定位，請允許位置權限', variant: 'destructive' });
        return;
      }
    }
    clockInMutation.mutate({
      organizationId: ORG_ID,
      staffId: STAFF_ID,
      latitude: loc.lat,
      longitude: loc.lng,
      accuracy: loc.accuracy,
    });
  }

  async function handleClockOut() {
    let loc = gpsLocation;
    if (!loc) {
      try {
        const pos = await getGPS();
        loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        setGpsLocation(loc);
      } catch {
        toast({ title: '錯誤', description: '無法取得 GPS 定位，請允許位置權限', variant: 'destructive' });
        return;
      }
    }
    clockOutMutation.mutate({
      organizationId: ORG_ID,
      staffId: STAFF_ID,
      latitude: loc.lat,
      longitude: loc.lng,
      accuracy: loc.accuracy,
    });
  }

  const hasClockedIn = !!todayStatus?.clockIn;
  const hasClockedOut = !!todayStatus?.clockOut;

  if (isError) {

    return (

      <div className="p-6">

        <QueryError message="載入資料時發生錯誤，請稍後再試" onRetry={refetch} />

      </div>

    );

  }


  return (
    <div className="p-6 space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">智慧打卡</h1>
        <p className="text-muted-foreground mt-1">GPS 定位打卡系統</p>
      </div>

      {/* Clock Display */}
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-6xl font-mono font-bold text-foreground tracking-wider">
            {format(currentTime, 'HH:mm:ss')}
          </div>
          <div className="text-lg text-muted-foreground mt-2">
            {format(currentTime, 'yyyy-MM-dd EEEE')}
          </div>
        </CardContent>
      </Card>

      {/* GPS Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            GPS 定位狀態
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {gpsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Navigation className="w-4 h-4 animate-pulse" />
              定位中...
            </div>
          ) : gpsError ? (
            <div className="text-sm text-destructive">{gpsError}</div>
          ) : gpsLocation ? (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">緯度：</span>
                <span className="font-mono">{gpsLocation.lat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">經度：</span>
                <span className="font-mono">{gpsLocation.lng.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">精確度：</span>
                <Badge variant={gpsLocation.accuracy < 50 ? 'default' : 'secondary'}>
                  ±{Math.round(gpsLocation.accuracy)}m
                </Badge>
              </div>
            </div>
          ) : null}
          <Button variant="outline" size="sm" onClick={refreshGPS} disabled={gpsLoading} className="w-full mt-2">
            <Navigation className="w-3 h-3 mr-1" />
            重新定位
          </Button>
        </CardContent>
      </Card>

      {/* Today Status */}
      {todayStatus && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              今日打卡記錄
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950">
                <p className="text-muted-foreground mb-1">上班</p>
                <p className="font-bold text-lg">
                  {todayStatus.clockIn ? format(new Date(todayStatus.clockIn), 'HH:mm:ss') : '--:--:--'}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950">
                <p className="text-muted-foreground mb-1">下班</p>
                <p className="font-bold text-lg">
                  {todayStatus.clockOut ? format(new Date(todayStatus.clockOut), 'HH:mm:ss') : '--:--:--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clock Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          size="lg"
          className="h-20 text-lg bg-green-600 hover:bg-green-700 text-white"
          onClick={handleClockIn}
          disabled={hasClockedIn || clockInMutation.isPending || isLoading}
        >
          {hasClockedIn ? (
            <>
              <CheckCircle2 className="w-6 h-6 mr-2" />
              已打卡
            </>
          ) : clockInMutation.isPending ? (
            '打卡中...'
          ) : (
            <>
              <LogIn className="w-6 h-6 mr-2" />
              上班打卡
            </>
          )}
        </Button>
        <Button
          size="lg"
          className="h-20 text-lg bg-red-600 hover:bg-red-700 text-white"
          onClick={handleClockOut}
          disabled={!hasClockedIn || hasClockedOut || clockOutMutation.isPending || isLoading}
        >
          {hasClockedOut ? (
            <>
              <CheckCircle2 className="w-6 h-6 mr-2" />
              已打卡
            </>
          ) : clockOutMutation.isPending ? (
            '打卡中...'
          ) : (
            <>
              <LogOut className="w-6 h-6 mr-2" />
              下班打卡
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
