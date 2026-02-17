import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Clock, MapPin, CheckCircle, XCircle, AlertCircle, Calendar, User, Briefcase, Building } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useStaffContext } from '@/hooks/useStaffContext';
import { PageLoadingSkeleton, PageError } from '@/components/ui/page-skeleton';

// --- TYPES ---
type AttendanceStatus = '未打卡' | '已上班' | '已下班';

// --- HELPER COMPONENTS ---

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);
  return (
    <div className="text-6xl md:text-8xl font-mono font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500 py-4">
      {time.toLocaleTimeString('en-GB')}
    </div>
  );
};

const StatusIndicator: React.FC<{ status: AttendanceStatus }> = ({ status }) => {
  const statusStyles = {
    '未打卡': { text: 'text-gray-500', bg: 'bg-gray-200 dark:bg-gray-700', icon: <AlertCircle className="w-5 h-5" /> },
    '已上班': { text: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/50', icon: <CheckCircle className="w-5 h-5" /> },
    '已下班': { text: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/50', icon: <XCircle className="w-5 h-5" /> },
  };
  const { text, bg, icon } = statusStyles[status];
  return (
    <div className={`inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-full font-semibold ${text} ${bg}`}>
      {icon}
      <span>{status}</span>
    </div>
  );
};

const LocationDisplay: React.FC<{ loading: boolean; error: string | null; location: { lat: number; lon: number } | null }> = ({ loading, error, location }) => (
  <div className="bg-white dark:bg-gray-800/50 shadow-sm rounded-xl p-4 text-center">
    <h3 className="font-bold text-lg mb-2 text-gray-700 dark:text-gray-200">打卡地點</h3>
    <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
      <MapPin className="w-4 h-4 mr-2" />
      {loading && <span>正在獲取位置...</span>}
      {error && <span className="text-red-500">{error}</span>}
      {location && <span>{`緯度: ${location.lat.toFixed(4)}, 經度: ${location.lon.toFixed(4)}`}</span>}
    </div>
    <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mt-3 flex items-center justify-center">
      <p className="text-gray-400 dark:text-gray-500">地圖預留位置</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const StaffClockPage = () => {
  const { organizationId, staffId, staffName, isLoading: ctxLoading } = useStaffContext();
  const [geoLocation, setGeoLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get user's location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
        setLocationLoading(false);
      },
      () => {
        setLocationError('無法獲取位置資訊');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // --- tRPC Queries ---
  const staffQuery = trpc.staff.get.useQuery(
    { id: staffId },
    { enabled: !ctxLoading }
  );

  const todayStatusQuery = trpc.core.clock.todayStatus.useQuery(
    { organizationId, staffId },
    { enabled: !ctxLoading }
  );

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const recentRecordsQuery = trpc.core.clock.myRecords.useQuery(
    { organizationId, staffId },
    { enabled: !ctxLoading }
  );

  // --- tRPC Mutations ---
  const clockInMutation = trpc.core.clock.clockIn.useMutation({
    onSuccess: () => {
      todayStatusQuery.refetch();
      recentRecordsQuery.refetch();
    },
  });

  const clockOutMutation = trpc.core.clock.clockOut.useMutation({
    onSuccess: () => {
      todayStatusQuery.refetch();
      recentRecordsQuery.refetch();
    },
  });

  // Derive status from todayStatus
  const todayRecord = todayStatusQuery.data;
  const status: AttendanceStatus = todayRecord?.clockIn
    ? todayRecord?.clockOut
      ? '已下班'
      : '已上班'
    : '未打卡';

  const staffData = staffQuery.data;
  const displayName = (staffData as any)?.name ?? staffName;
  const department = (staffData as any)?.department ?? '';
  const position = (staffData as any)?.position ?? '';
  const employeeId = (staffData as any)?.employeeId ?? '';
  const avatarUrl = (staffData as any)?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

  const handleClockIn = () => {
    clockInMutation.mutate({
      organizationId,
      staffId,
      latitude: geoLocation?.lat,
      longitude: geoLocation?.lon,
    });
  };

  const handleClockOut = () => {
    if (!todayRecord?.id) return;
    clockOutMutation.mutate({
      recordId: todayRecord.id,
      latitude: geoLocation?.lat,
      longitude: geoLocation?.lon,
    });
  };

  const isMutating = clockInMutation.isPending || clockOutMutation.isPending;
  const mutationError = clockInMutation.error?.message || clockOutMutation.error?.message;

  // Format recent records
  const rawRecords: any[] = Array.isArray(recentRecordsQuery.data) ? recentRecordsQuery.data : [];
  const recentRecords = rawRecords.slice(0, 7).map((r: any) => ({
    date: r.recordDate ?? '',
    clockIn: r.clockIn ? new Date(r.clockIn).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null,
    clockOut: r.clockOut ? new Date(r.clockOut).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null,
    workHours: r.clockIn && r.clockOut
      ? `${Math.floor((new Date(r.clockOut).getTime() - new Date(r.clockIn).getTime()) / 3600000)}h ${Math.floor(((new Date(r.clockOut).getTime() - new Date(r.clockIn).getTime()) % 3600000) / 60000)}m`
      : null,
    status: (r.status === 'normal' ? '正常' : r.status === 'late' ? '遲到' : r.status === 'early_leave' ? '早退' : r.status ?? '正常') as string,
  }));

  const getStatusColor = (s: string) => {
    switch (s) {
      case '正常': return 'text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-300';
      case '遲到': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300';
      case '早退': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/50 dark:text-orange-300';
      case '缺勤': return 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (ctxLoading || todayStatusQuery.isLoading) {
    return <PageLoadingSkeleton message="載入打卡頁面..." />;
  }

  if (todayStatusQuery.isError) {
    return <PageError message="無法載入打卡狀態" onRetry={() => todayStatusQuery.refetch()} />;
  }

  const renderClockButton = () => {
    const buttonBaseClasses = "w-full md:w-64 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition-transform duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2";
    if (status === '未打卡') {
      return (
        <button onClick={handleClockIn} disabled={isMutating || !geoLocation} className={`${buttonBaseClasses} bg-gradient-to-r from-green-400 to-emerald-600`}>
          <Clock className="w-6 h-6" />
          <span>{isMutating ? '打卡中...' : '上班打卡'}</span>
        </button>
      );
    }
    if (status === '已上班') {
      return (
        <button onClick={handleClockOut} disabled={isMutating || !geoLocation} className={`${buttonBaseClasses} bg-gradient-to-r from-red-500 to-rose-700`}>
          <Clock className="w-6 h-6" />
          <span>{isMutating ? '打卡中...' : '下班打卡'}</span>
        </button>
      );
    }
    return null;
  };

  const todayItems = [
    { label: '上班時間', value: todayRecord?.clockIn ? new Date(todayRecord.clockIn).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--:--' },
    { label: '下班時間', value: todayRecord?.clockOut ? new Date(todayRecord.clockOut).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--:--' },
    { label: '今日工時', value: todayRecord?.clockIn && todayRecord?.clockOut
      ? `${Math.floor((new Date(todayRecord.clockOut).getTime() - new Date(todayRecord.clockIn).getTime()) / 3600000)}h ${Math.floor(((new Date(todayRecord.clockOut).getTime() - new Date(todayRecord.clockIn).getTime()) % 3600000) / 60000)}m`
      : '- h - m' },
    { label: '出勤狀態', value: status === '未打卡' ? '-' : todayRecord?.status === 'late' ? '遲到' : todayRecord?.status === 'early_leave' ? '早退' : '正常' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Staff Header */}
        <div className="bg-white dark:bg-gray-800/50 shadow-sm rounded-xl p-4 md:p-6 mb-6">
          <div className="flex items-center space-x-4">
            <img src={avatarUrl} alt={displayName} className="w-16 h-16 rounded-full" />
            <div className="flex-grow">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{displayName}</h1>
              {employeeId && <p className="text-sm text-gray-500 dark:text-gray-400">{employeeId}</p>}
              <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-300 mt-2">
                {department && <div className="flex items-center"><Building className="w-3 h-3 mr-1" />{department}</div>}
                {position && <div className="flex items-center"><Briefcase className="w-3 h-3 mr-1" />{position}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Clock Section */}
        <div className="bg-white dark:bg-gray-800/50 shadow-lg rounded-xl p-6 md:p-8 text-center">
          <DigitalClock />
          <div className="my-6">
            <StatusIndicator status={status} />
          </div>
          <div className="flex justify-center">
            {renderClockButton()}
          </div>
          {mutationError && <p className="text-red-500 mt-4">{mutationError}</p>}
        </div>

        {/* Today Record + Location */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white dark:bg-gray-800/50 shadow-sm rounded-xl p-4">
            <h3 className="font-bold text-lg mb-3 text-gray-700 dark:text-gray-200">今日記錄</h3>
            <div className="grid grid-cols-2 gap-4">
              {todayItems.map(item => (
                <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <LocationDisplay loading={locationLoading} error={locationError} location={geoLocation} />
        </div>

        {/* Recent Records */}
        <div className="bg-white dark:bg-gray-800/50 shadow-sm rounded-xl mt-6 p-4 md:p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">最近出勤記錄</h3>
          {recentRecordsQuery.isLoading ? (
            <div className="text-center py-8 text-gray-500">載入中...</div>
          ) : recentRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">尚無出勤記錄</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">日期</th>
                    <th scope="col" className="px-4 py-3">上班</th>
                    <th scope="col" className="px-4 py-3">下班</th>
                    <th scope="col" className="px-4 py-3">工時</th>
                    <th scope="col" className="px-4 py-3 text-center">狀態</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.map((record) => (
                    <tr key={record.date} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{record.date}</td>
                      <td className="px-4 py-4">{record.clockIn || '--:--'}</td>
                      <td className="px-4 py-4">{record.clockOut || '--:--'}</td>
                      <td className="px-4 py-4">{record.workHours || '-'}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <footer className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
          <p>&copy; {new Date().getFullYear()} YOChiLL. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default StaffClockPage;
