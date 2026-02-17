import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertTriangle, Timer, FileEdit } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; color: string }> = {
  normal: { label: '正常', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  late: { label: '遲到', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  early_leave: { label: '早退', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  absent: { label: '缺勤', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

export default function AttendanceCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState<Record<string, unknown> | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const ORG_ID = 1;
  const STAFF_ID = 1;

  const { data: stats, isLoading } = trpc.pro.sprint5.attendance.monthlyStats.useQuery({
    organizationId: ORG_ID,
    staffId: STAFF_ID,
    year,
    month,
  });

  const records = (stats?.records ?? []) as Array<{
    id: number;
    recordDate: string;
    clockIn: string | Date | null;
    clockOut: string | Date | null;
    status: string | null;
    isManualEntry: boolean | null;
    manualReason: string | null;
    approvalStatus: string | null;
    checkInAddress: string | null;
    checkOutAddress: string | null;
  }>;

  // Calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0=Sunday

  function getRecordForDay(day: Date) {
    const dateStr = format(day, 'yyyy-MM-dd');
    return records.find(r => r.recordDate === dateStr);
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 2, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month, 1));
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">出勤記錄</h1>
        <p className="text-muted-foreground mt-1">月曆視圖查看出勤狀態與統計</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <div className="text-2xl font-bold">{stats?.presentDays ?? 0}</div>
            <div className="text-xs text-muted-foreground">出勤天數</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
            <div className="text-2xl font-bold">{stats?.lateDays ?? 0}</div>
            <div className="text-xs text-muted-foreground">遲到天數</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-orange-600" />
            <div className="text-2xl font-bold">{stats?.earlyLeaveDays ?? 0}</div>
            <div className="text-xs text-muted-foreground">早退天數</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Timer className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <div className="text-2xl font-bold">{stats?.overtimeHours ?? 0}</div>
            <div className="text-xs text-muted-foreground">加班時數</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <FileEdit className="w-5 h-5 mx-auto mb-1 text-purple-600" />
            <div className="text-2xl font-bold">{stats?.makeUpDays ?? 0}</div>
            <div className="text-xs text-muted-foreground">補打卡</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <CardTitle>
              {format(currentDate, 'yyyy 年 M 月', { locale: zhTW })}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">載入中...</div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Week day headers */}
              {weekDays.map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {d}
                </div>
              ))}

              {/* Empty cells before month start */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px]" />
              ))}

              {/* Day cells */}
              {days.map(day => {
                const record = getRecordForDay(day);
                const isToday = isSameDay(day, new Date());
                const dayNum = day.getDate();

                return (
                  <div
                    key={dayNum}
                    className={`min-h-[80px] border rounded-lg p-1.5 cursor-pointer transition-colors hover:bg-muted/50 ${
                      isToday ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => record && setSelectedRecord(record as unknown as Record<string, unknown>)}
                  >
                    <div className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                      {dayNum}
                    </div>
                    {record && (
                      <div className="mt-1 space-y-0.5">
                        {record.clockIn && (
                          <div className="text-[10px] text-green-600 dark:text-green-400 truncate">
                            ↗ {format(new Date(record.clockIn), 'HH:mm')}
                          </div>
                        )}
                        {record.clockOut && (
                          <div className="text-[10px] text-red-600 dark:text-red-400 truncate">
                            ↙ {format(new Date(record.clockOut), 'HH:mm')}
                          </div>
                        )}
                        {record.status && record.status !== 'normal' && (
                          <Badge className={`text-[9px] px-1 py-0 ${statusConfig[record.status]?.color || ''}`}>
                            {statusConfig[record.status]?.label || record.status}
                          </Badge>
                        )}
                        {record.isManualEntry && (
                          <Badge className="text-[9px] px-1 py-0 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            補登
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={selectedRecord !== null} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>出勤詳情 - {selectedRecord?.recordDate as string}</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">上班時間：</span>
                  <span className="font-medium ml-1">
                    {selectedRecord.clockIn ? format(new Date(selectedRecord.clockIn as string), 'HH:mm:ss') : '--:--:--'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">下班時間：</span>
                  <span className="font-medium ml-1">
                    {selectedRecord.clockOut ? format(new Date(selectedRecord.clockOut as string), 'HH:mm:ss') : '--:--:--'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">狀態：</span>
                  <Badge className={`ml-1 ${statusConfig[(selectedRecord.status as string) || 'normal']?.color || ''}`}>
                    {statusConfig[(selectedRecord.status as string) || 'normal']?.label || '正常'}
                  </Badge>
                </div>
                {Boolean(selectedRecord.isManualEntry) && (
                  <>
                    <div>
                      <span className="text-muted-foreground">補登原因：</span>
                      <span className="font-medium ml-1">{String(selectedRecord.manualReason ?? '-')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">審核狀態：</span>
                      <Badge className="ml-1" variant={String(selectedRecord.approvalStatus) === 'approved' ? 'default' : 'secondary'}>
                        {String(selectedRecord.approvalStatus) === 'approved' ? '已核准' :
                         String(selectedRecord.approvalStatus) === 'rejected' ? '已拒絕' : '待審核'}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
              {selectedRecord.checkInAddress ? (
                <div>
                  <span className="text-muted-foreground">上班地點：</span>
                  <span className="ml-1">{String(selectedRecord.checkInAddress)}</span>
                </div>
              ) : null}
              {selectedRecord.checkOutAddress ? (
                <div>
                  <span className="text-muted-foreground">下班地點：</span>
                  <span className="ml-1">{String(selectedRecord.checkOutAddress)}</span>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
