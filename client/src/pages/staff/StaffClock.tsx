
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Clock, MapPin, CheckCircle, XCircle, AlertCircle, Calendar, User, Briefcase, Building } from 'lucide-react';

// --- TYPES ---
type AttendanceStatus = '未打卡' | '已上班' | '已下班';
type DailyRecord = {
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  workHours: string | null;
  status: '正常' | '遲到' | '早退' | '缺勤';
};

// --- MOCK DATA ---
const mockStaff = {
  name: '林小明',
  id: 'S-12345',
  department: '技術部',
  position: '資深軟體工程師',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
};

const mockRecentRecords: DailyRecord[] = [
  { date: '2026-02-16', clockIn: '09:01', clockOut: '18:05', workHours: '9h 4m', status: '正常' },
  { date: '2026-02-15', clockIn: '09:16', clockOut: '18:02', workHours: '8h 46m', status: '遲到' },
  { date: '2026-02-14', clockIn: '08:55', clockOut: '17:30', workHours: '8h 35m', status: '早退' },
  { date: '2026-02-13', clockIn: null, clockOut: null, workHours: null, status: '缺勤' },
  { date: '2026-02-12', clockIn: '08:58', clockOut: '18:03', workHours: '9h 5m', status: '正常' },
  { date: '2026-02-11', clockIn: '09:05', clockOut: '18:10', workHours: '9h 5m', status: '正常' },
  { date: '2026-02-10', clockIn: '09:00', clockOut: '18:00', workHours: '9h 0m', status: '正常' },
];

// --- HELPER COMPONENTS ---

const StaffHeader = () => (
  <div className="bg-white dark:bg-gray-800/50 shadow-sm rounded-xl p-4 md:p-6 mb-6">
    <div className="flex items-center space-x-4">
      <img src={mockStaff.avatarUrl} alt={mockStaff.name} className="w-16 h-16 rounded-full"  loading="lazy" />
      <div className="flex-grow">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{mockStaff.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{mockStaff.id}</p>
        <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-300 mt-2">
            <div className="flex items-center"><Building className="w-3 h-3 mr-1" />{mockStaff.department}</div>
            <div className="flex items-center"><Briefcase className="w-3 h-3 mr-1" />{mockStaff.position}</div>
        </div>
      </div>
    </div>
  </div>
);

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

const LocationDisplay: React.FC<{ loading: boolean; error: string | null; location: { lat: number; lon: number } | null }> = ({ loading, error, location }) => {
  return (
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
};

const TodayRecordCard: React.FC<{ record: DailyRecord | undefined, status: AttendanceStatus }> = ({ record, status }) => {
    const items = [
        { label: '上班時間', value: record?.clockIn || '--:--' },
        { label: '下班時間', value: record?.clockOut || '--:--' },
        { label: '今日工時', value: record?.workHours || '- h - m' },
        { label: '出勤狀態', value: status === '未打卡' ? '-' : record?.status || '-' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800/50 shadow-sm rounded-xl p-4">
            <h3 className="font-bold text-lg mb-3 text-gray-700 dark:text-gray-200">今日記錄</h3>
            <div className="grid grid-cols-2 gap-4">
                {items.map(item => (
                    <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecentRecordsTable: React.FC<{ records: DailyRecord[] }> = ({ records }) => {
  const getStatusColor = (status: DailyRecord['status']) => {
    switch (status) {
      case '正常': return 'text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-300';
      case '遲到': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300';
      case '早退': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/50 dark:text-orange-300';
      case '缺勤': return 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 shadow-sm rounded-xl mt-6 p-4 md:p-6">
      <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">最近 7 日出勤記錄</h3>
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
            {records.map((record) => (
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
    </div>
  );
};

// --- MAIN COMPONENT ---

const StaffClockPage = () => {
  const [status, setStatus] = useState<AttendanceStatus>('未打卡');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [todayRecord, setTodayRecord] = useState<DailyRecord | undefined>(undefined);

  // Simulate fetching initial status and today's record
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
        // Logic to determine initial status based on today's record
        const today = new Date().toISOString().split('T')[0];
        const record = mockRecentRecords.find(r => r.date === today);
        setTodayRecord(record);
        if (record?.clockIn && !record?.clockOut) {
            setStatus('已上班');
        } else if (record?.clockIn && record?.clockOut) {
            setStatus('已下班');
        } else {
            setStatus('未打卡');
        }
        setLoading(false);
    }, 1000);
  }, []);

  // Get user's location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
        setLocationLoading(false);
      },
      (error) => {
        setLocationError('無法獲取位置資訊');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleClockIn = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate
        setStatus('已上班');
        const now = new Date();
        const newRecord = {
            date: now.toISOString().split('T')[0],
            clockIn: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            clockOut: null,
            workHours: null,
            status: now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 5) ? '遲到' : '正常' as DailyRecord['status'],
        };
        setTodayRecord(newRecord);
      } else {
        setError('打卡失敗，請稍後再試。');
      }
      setLoading(false);
    }, 1500);
  };

  const handleClockOut = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate
        setStatus('已下班');
        const now = new Date();
        setTodayRecord(prev => prev ? {
            ...prev,
            clockOut: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            // A simple work hours calculation for mock purpose
            workHours: '8h 45m',
            status: now.getHours() < 18 ? '早退' : prev.status,
        } : undefined);
      } else {
        setError('打卡失敗，請稍後再試。');
      }
      setLoading(false);
    }, 1500);
  };

  const renderClockButton = () => {
    const buttonBaseClasses = "w-full md:w-64 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition-transform duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2";

    if (status === '未打卡') {
      return (
        <button onClick={handleClockIn} disabled={loading || !location} className={`${buttonBaseClasses} bg-gradient-to-r from-green-400 to-emerald-600`}>
          <Clock className="w-6 h-6" />
          <span>上班打卡</span>
        </button>
      );
    }
    if (status === '已上班') {
      return (
        <button onClick={handleClockOut} disabled={loading || !location} className={`${buttonBaseClasses} bg-gradient-to-r from-red-500 to-rose-700`}>
          <Clock className="w-6 h-6" />
          <span>下班打卡</span>
        </button>
      );
    }
    return null; // '已下班' shows no button
  };

  if (loading && !todayRecord) {
      return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-500"><p>Loading page...</p></div>
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <StaffHeader />
        
        <div className="bg-white dark:bg-gray-800/50 shadow-lg rounded-xl p-6 md:p-8 text-center">
          <DigitalClock />
          <div className="my-6">
            <StatusIndicator status={status} />
          </div>
          <div className="flex justify-center">
            {renderClockButton()}
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
            <TodayRecordCard record={todayRecord} status={status} />
            <LocationDisplay loading={locationLoading} error={locationError} location={location} />
        </div>

        <RecentRecordsTable records={mockRecentRecords} />

        <footer className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
          <p>&copy; {new Date().getFullYear()} YOChiLL. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default StaffClockPage;
