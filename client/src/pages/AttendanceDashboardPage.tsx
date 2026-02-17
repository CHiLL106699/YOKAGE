import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { QueryLoading, QueryError } from '@/components/ui/query-state';

/**
 * 出勤儀表板頁面
 * 團隊成員出勤狀態視覺化
 */

export default function AttendanceDashboardPage() {
  const [organizationId] = useState(60001); // 測試診所 ID
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 查詢今日所有員工出勤記錄
  const { data: todayRecords, isLoading, isError, refetch } = trpc.attendance.listRecords.useQuery({
    organizationId,
    startDate: today,
    endDate: today,
  });

  // 查詢過去 7 天出勤記錄
  const { data: weekRecords } = trpc.attendance.listRecords.useQuery({
    organizationId,
    startDate: sevenDaysAgo,
    endDate: today,
  });

  // 查詢所有員工
  const { data: staffResponse } = trpc.staff.list.useQuery({
    organizationId,
  });
  
  const allStaff = staffResponse?.data || [];

  // 計算今日統計
  const todayStats = useMemo(() => {
    if (!todayRecords) return { total: 0, present: 0, late: 0, absent: 0 };

    const present = todayRecords.filter((r) => r.clockIn).length;
    const late = todayRecords.filter((r) => r.status === 'late').length;
    const total = allStaff.length || 0;
    const absent = total - present;

    return { total, present, late, absent };
  }, [todayRecords, allStaff]);

  // 計算過去 7 天出勤率趨勢
  const trendData = useMemo(() => {
    if (!weekRecords || !allStaff) return [];

    const dateMap = new Map<string, number>();
    
    // 初始化過去 7 天的日期
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, 0);
    }

    // 計算每天的出勤人數
    weekRecords.forEach((record) => {
      const dateStr = new Date(record.recordDate).toISOString().split('T')[0];
      if (dateMap.has(dateStr) && record.clockIn) {
        dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
      }
    });

    // 轉換為圖表資料
    return Array.from(dateMap.entries()).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
      attendance: allStaff.length > 0 ? ((count / allStaff.length) * 100).toFixed(1) : '0',
    }));
  }, [weekRecords, allStaff]);

  // 團隊成員出勤狀態
  const teamStatus = useMemo(() => {
    if (!allStaff) return [];

    return allStaff.map((staff) => {
      const record = todayRecords?.find((r) => r.staffId === staff.id);
      return {
        id: staff.id,
        name: staff.name,
        hasClockedIn: !!record?.clockIn,
        hasClockedOut: !!record?.clockOut,
        status: record?.status || 'absent',
        isManualEntry: record?.isManualEntry || false,
      };
    });
  }, [allStaff, todayRecords]);

  // 異常打卡記錄
  const abnormalRecords = useMemo(() => {
    if (!todayRecords) return [];

    return todayRecords.filter(
      (r) =>
        r.status === 'late' ||
        r.status === 'early_leave' ||
        r.isManualEntry ||
        !r.isWithinGeofence
    );
  }, [todayRecords]);

  if (isLoading) {

    return (

      <div className="p-6">

        <QueryLoading variant="skeleton-cards" />

      </div>

    );

  }


  if (isError) {

    return (

      <div className="p-6">

        <QueryError message="載入資料時發生錯誤，請稍後再試" onRetry={refetch} />

      </div>

    );

  }


  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">出勤儀表板</h1>
        <p className="text-muted-foreground mt-2">團隊成員出勤狀態即時監控</p>
      </div>

      {/* 今日統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">總員工數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">全體員工</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">已打卡</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayStats.present}</div>
            <p className="text-xs text-muted-foreground mt-1">
              出勤率 {todayStats.total > 0 ? ((todayStats.present / todayStats.total) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">遲到</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayStats.late}</div>
            <p className="text-xs text-muted-foreground mt-1">需要關注</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">缺勤</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayStats.absent}</div>
            <p className="text-xs text-muted-foreground mt-1">未打卡人數</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 出勤趨勢圖表 */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              過去 7 天出勤率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.06 60 / 20%)" />
                <XAxis dataKey="date" stroke="oklch(0.65 0.05 250)" />
                <YAxis stroke="oklch(0.65 0.05 250)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.16 0.04 250)',
                    border: '1px solid oklch(0.30 0.06 60 / 40%)',
                    borderRadius: '0.5rem',
                    color: 'oklch(0.92 0.02 70)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="oklch(0.80 0.14 70)"
                  strokeWidth={2}
                  dot={{ fill: 'oklch(0.80 0.14 70)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 異常打卡提醒 */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <AlertCircle className="h-5 w-5 text-primary" />
              異常打卡提醒
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              共 {abnormalRecords.length} 筆異常記錄
            </CardDescription>
          </CardHeader>
          <CardContent>
            {abnormalRecords.length > 0 ? (
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {abnormalRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {allStaff.find((s: Record<string, any>) => s.id === record.staffId)?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {allStaff.find((s: Record<string, any>) => s.id === record.staffId)?.name || '未知員工'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.isManualEntry && '補登記錄'}
                          {record.status === 'late' && '遲到'}
                          {record.status === 'early_leave' && '早退'}
                          {!record.isWithinGeofence && '距離過遠'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive">異常</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">今日無異常記錄</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 團隊成員出勤狀態 */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-card-foreground">團隊成員出勤狀態</CardTitle>
          <CardDescription className="text-muted-foreground">即時顯示誰已打卡、誰未打卡</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamStatus.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.hasClockedIn && member.hasClockedOut && '已打卡完成'}
                      {member.hasClockedIn && !member.hasClockedOut && '已上班打卡'}
                      {!member.hasClockedIn && '未打卡'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {member.hasClockedIn ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  {member.isManualEntry && (
                    <Badge variant="outline" className="text-xs">
                      補登
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
