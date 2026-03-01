import { useState } from 'react';
import { Clock, CheckCircle, XCircle, History, MapPin } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';

const organizationId = 1; // TODO: from context
const staffId = 1; // TODO: from auth context

export default function StaffClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useState(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  });

  const { data: todayStatus, isLoading: statusLoading, refetch: refetchStatus } =
    (trpc as any).attendance.getTodayStatus.useQuery(
      { organizationId, staffId },
      { enabled: !!staffId }
    );

  const { data: recentRecords, isLoading: recordsLoading, refetch: refetchRecords } =
    (trpc as any).attendance.listRecords.useQuery(
      { organizationId, staffId },
      { enabled: !!staffId }
    );

  const clockInMutation = (trpc as any).attendance.clockIn.useMutation({
    onSuccess: () => {
      toast.success('打卡成功！已記錄上班時間');
      refetchStatus();
      refetchRecords();
    },
    onError: (err: any) => toast.error(err.message || '打卡失敗'),
  });

  const clockOutMutation = (trpc as any).attendance.clockOut.useMutation({
    onSuccess: () => {
      toast.success('打卡成功！已記錄下班時間');
      refetchStatus();
      refetchRecords();
    },
    onError: (err: any) => toast.error(err.message || '打卡失敗'),
  });

  const handleClockIn = () => {
    clockInMutation.mutate({ organizationId, staffId, location: '診所' });
  };

  const handleClockOut = () => {
    if (todayStatus?.id) {
      clockOutMutation.mutate({ id: todayStatus.id, location: '診所' });
    }
  };

  const isClockedIn = todayStatus?.check_in_time && !todayStatus?.check_out_time;
  const isClockedOut = todayStatus?.check_out_time;

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '--:--';
    try {
      return new Date(timeStr).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const records = Array.isArray(recentRecords?.data) ? recentRecords.data : Array.isArray(recentRecords) ? recentRecords : [];

  return (
    <DashboardLayout title="打卡系統">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <Clock className="mx-auto mb-4 text-indigo-500" size={48} />
          <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {currentTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {currentTime.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">今日出勤狀態</h3>
          {statusLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <div className="text-sm text-green-600 dark:text-green-400 mb-1">上班打卡</div>
                <div className="text-xl font-bold text-green-700 dark:text-green-300">
                  {todayStatus?.check_in_time ? formatTime(todayStatus.check_in_time) : '--:--'}
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">下班打卡</div>
                <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
                  {todayStatus?.check_out_time ? formatTime(todayStatus.check_out_time) : '--:--'}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleClockIn}
              disabled={!!isClockedIn || !!isClockedOut || clockInMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle size={20} />
              {clockInMutation.isPending ? '打卡中...' : '上班打卡'}
            </button>
            <button
              onClick={handleClockOut}
              disabled={!isClockedIn || clockOutMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle size={20} />
              {clockOutMutation.isPending ? '打卡中...' : '下班打卡'}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <History size={20} /> 最近打卡紀錄
          </h3>
          {recordsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
            </div>
          ) : records.length === 0 ? (
            <p className="text-center text-gray-400 py-4">尚無打卡紀錄</p>
          ) : (
            <div className="space-y-3">
              {records.slice(0, 10).map((record: any, idx: number) => (
                <div key={record.id || idx} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <div className="font-medium text-sm">{record.work_date || record.date || '—'}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={12} /> {record.location || '診所'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <span className="text-green-600">{formatTime(record.check_in_time)}</span>
                      {' → '}
                      <span className="text-orange-600">{formatTime(record.check_out_time)}</span>
                    </div>
                    {record.total_hours && (
                      <div className="text-xs text-gray-500">{Number(record.total_hours).toFixed(1)} 小時</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
