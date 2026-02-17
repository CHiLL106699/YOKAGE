
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Calendar, BookOpen, Clock, BarChart, User, Bell, MoreVertical, ChevronRight, CheckCircle, Users, DollarSign } from 'lucide-react';

// --- TYPES --- //
type Staff = {
  name: string;
  avatarUrl: string;
};

type Appointment = {
  id: string;
  time: string;
  customerName: string;
  service: string;
  room: string;
};

type Notification = {
  id: string;
  text: string;
  time: string;
};

type Stats = {
  served: number;
  waiting: number;
  revenue: number;
};

// --- MOCK DATA --- //
const mockStaff: Staff = {
  name: '林美麗',
  avatarUrl: 'https://i.pravatar.cc/150?u=staff123',
};

const mockAppointments: Appointment[] = [
  { id: 'apt1', time: '10:00', customerName: '陳小姐', service: '臉部護理', room: 'R101' },
  { id: 'apt2', time: '11:30', customerName: '王先生', service: '身體按摩', room: 'R102' },
  { id: 'apt3', time: '14:00', customerName: '李太太', service: '美甲服務', room: 'R103' },
  { id: 'apt4', time: '15:30', customerName: '張小姐', service: '臉部護理', room: 'R101' },
  { id: 'apt5', time: '17:00', customerName: '黃先生', service: '足底按摩', room: 'R104' },
];

const mockStats: Stats = {
  served: 5,
  waiting: 3,
  revenue: 45000,
};

const mockNotifications: Notification[] = [
  { id: 'notif1', text: '您有一筆新的預約在 18:00。', time: '5分鐘前' },
  { id: 'notif2', text: '客戶 陳小姐 已完成付款。', time: '30分鐘前' },
  { id: 'notif3', text: '排班表已更新，請查看。', time: '2小時前' },
];

// --- HELPER COMPONENTS --- //

const StatCard = ({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string, value: string | number, color: string }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="text-white" size={20} />
    </div>
    <div className="ml-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const QuickActionButton = ({ icon: Icon, label, href }: { icon: React.ElementType, label: string, href: string }) => (
  <Link href={href}>
    <a className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
      <div className="p-3 rounded-full bg-indigo-100">
        <Icon className="text-indigo-600" size={24} />
      </div>
      <span className="mt-2 text-sm font-medium text-gray-700">{label}</span>
    </a>
  </Link>
);

// --- MAIN COMPONENT --- //

const StaffHome = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    // Simulate data fetching
    const fetchTimeout = setTimeout(() => {
      // To test error state, uncomment the following line:
      // setError('無法載入資料，請稍後再試。');
      setLoading(false);
    }, 1500);

    return () => {
      clearInterval(timer);
      clearTimeout(fetchTimeout);
    };
  }, []);

  const getShiftProgress = () => {
    const start = new Date();
    start.setHours(9, 0, 0, 0);
    const end = new Date();
    end.setHours(18, 0, 0, 0);
    const now = currentTime.getTime();

    if (now < start.getTime()) return 0;
    if (now > end.getTime()) return 100;

    const total = end.getTime() - start.getTime();
    const elapsed = now - start.getTime();
    return (elapsed / total) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-center">
        <div>
          <p className="text-red-500 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* --- Header --- */}
      <header className="bg-white shadow-sm sticky top-0 z-10 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              YOChiLL
            </h1>
          </div>
          <div className="flex items-center">
            <span className="hidden sm:inline text-sm font-medium text-gray-700 mr-3">{mockStaff.name}</span>
            <img className="h-8 w-8 rounded-full" src={mockStaff.avatarUrl} alt="Staff Avatar" />
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-24 sm:pb-8">
        {/* Welcome Message */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">歡迎回來, {mockStaff.name}!</h2>
          <p className="text-gray-500">這是您今天的工作總覽。</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg text-gray-800 mb-4">今日班表</h3>
              <div className="flex items-center justify-between text-gray-700">
                <span>09:00</span>
                <span className="font-semibold">上班中</span>
                <span>18:00</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2.5 rounded-full"
                  style={{ width: `${getShiftProgress()}%` }}
                ></div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">待接待客戶</h3>
                <Link href="/staff/appointments">
                  <a className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
                    查看全部 <ChevronRight size={16} className="ml-1" />
                  </a>
                </Link>
              </div>
              <div className="space-y-4">
                {mockAppointments.map(apt => (
                  <div key={apt.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <div className="text-center w-16 border-r border-gray-200 pr-3">
                      <p className="font-bold text-indigo-600">{apt.time}</p>
                    </div>
                    <div className="flex-grow ml-4">
                      <p className="font-semibold text-gray-800">{apt.customerName}</p>
                      <p className="text-sm text-gray-500">{apt.service} / {apt.room}</p>
                    </div>
                    <MoreVertical className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg text-gray-800 mb-4">快速操作</h3>
                <div className="grid grid-cols-3 gap-4">
                    <QuickActionButton icon={Clock} label="打卡" href="/staff/attendance" />
                    <QuickActionButton icon={Calendar} label="查看排班" href="/staff/schedule" />
                    <QuickActionButton icon={Users} label="客戶列表" href="/staff/customers" />
                </div>
            </div>

            {/* Today's Stats */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg text-gray-800 mb-4">今日統計</h3>
              <div className="space-y-4">
                <StatCard icon={CheckCircle} title="已接待" value={mockStats.served} color="bg-green-500" />
                <StatCard icon={Users} title="待接待" value={mockStats.waiting} color="bg-yellow-500" />
                <StatCard icon={DollarSign} title="今日業績" value={`NT$ ${mockStats.revenue.toLocaleString()}`} color="bg-blue-500" />
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg text-gray-800 mb-4">最近通知</h3>
              <div className="space-y-3">
                {mockNotifications.map(notif => (
                  <div key={notif.id} className="flex items-start">
                    <div className="p-2 bg-indigo-100 rounded-full mr-3 mt-1">
                        <Bell size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">{notif.text}</p>
                      <p className="text-xs text-gray-400">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- Bottom Navigation (Mobile) --- */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
        <BottomNavItem icon={Home} label="首頁" href="/staff" active />
        <BottomNavItem icon={Calendar} label="排班" href="/staff/schedule" />
        <BottomNavItem icon={BookOpen} label="預約" href="/staff/appointments" />
        <BottomNavItem icon={Clock} label="打卡" href="/staff/attendance" />
        <BottomNavItem icon={BarChart} label="績效" href="/staff/performance" />
      </nav>
    </div>
  );
};

const BottomNavItem = ({ icon: Icon, label, href, active = false }: { icon: React.ElementType, label: string, href: string, active?: boolean }) => {
  const [, navigate] = useLocation();
  const color = active ? 'text-indigo-600' : 'text-gray-500';
  return (
    <button onClick={() => navigate(href)} className={`flex flex-col items-center justify-center w-16 ${color} hover:text-indigo-600 transition-colors`}>
      <Icon size={24} />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

export default StaffHome;
