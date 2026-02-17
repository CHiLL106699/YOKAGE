import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Calendar, BookOpen, Clock, BarChart, User, Bell, MoreVertical, ChevronRight, CheckCircle, Users, DollarSign } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useStaffContext } from '@/hooks/useStaffContext';
import { PageLoadingSkeleton, PageError, StatsCardSkeleton, ListItemSkeleton } from '@/components/ui/page-skeleton';

// --- HELPER COMPONENTS --- //

const StatCard = ({ icon: Icon, title, value, color }: { icon: React.ElementType; title: string; value: string | number; color: string }) => (
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

const QuickActionButton = ({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) => (
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
  const { organizationId, staffId, staffName, isLoading: ctxLoading } = useStaffContext();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- tRPC Queries --- //
  const today = new Date().toISOString().split('T')[0];

  const staffQuery = trpc.staff.get.useQuery(
    { id: staffId },
    { enabled: !ctxLoading }
  );

  const appointmentsQuery = trpc.appointment.list.useQuery(
    { organizationId, staffId, status: 'pending' },
    { enabled: !ctxLoading }
  );

  const notificationsQuery = trpc.notification.getNotificationLog.useQuery(
    { page: 1, limit: 5 },
    { enabled: !ctxLoading }
  );

  const todayStatusQuery = trpc.core.clock.todayStatus.useQuery(
    { organizationId, staffId },
    { enabled: !ctxLoading }
  );

  const scheduleQuery = trpc.schedule.list.useQuery(
    { organizationId, staffId, startDate: today, endDate: today },
    { enabled: !ctxLoading }
  );

  // Derive stats from appointments
  const allAppointments = appointmentsQuery.data;
  const appointmentList = Array.isArray(allAppointments) ? allAppointments : (allAppointments as any)?.data ?? [];
  const served = appointmentList.filter((a: any) => a.status === 'completed').length;
  const waiting = appointmentList.filter((a: any) => a.status === 'pending' || a.status === 'confirmed').length;

  const isLoading = ctxLoading || staffQuery.isLoading || appointmentsQuery.isLoading;
  const isError = staffQuery.isError || appointmentsQuery.isError;

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

  if (isLoading) {
    return <PageLoadingSkeleton message="載入員工首頁..." />;
  }

  if (isError) {
    return (
      <PageError
        message="無法載入資料，請稍後再試。"
        onRetry={() => {
          staffQuery.refetch();
          appointmentsQuery.refetch();
        }}
      />
    );
  }

  const displayName = staffQuery.data?.name ?? staffName;
  const avatarUrl = (staffQuery.data as any)?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

  // Format appointments for display
  const upcomingAppointments = appointmentList.slice(0, 5).map((apt: any) => ({
    id: String(apt.id),
    time: apt.startTime?.substring(0, 5) ?? '--:--',
    customerName: apt.customerName ?? `客戶 #${apt.customerId}`,
    service: apt.productName ?? '服務',
    room: apt.notes ?? '',
  }));

  // Format notifications
  const notifLogs = notificationsQuery.data?.logs ?? [];
  const notifications = notifLogs.length > 0
    ? notifLogs.map((n: any, i: number) => ({
        id: String(i),
        text: n.message ?? '通知',
        time: n.createdAt ? new Date(n.createdAt).toLocaleString('zh-TW') : '',
      }))
    : [
        { id: 'empty', text: '目前沒有新通知', time: '' },
      ];

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
            <span className="hidden sm:inline text-sm font-medium text-gray-700 mr-3">{displayName}</span>
            <img className="h-8 w-8 rounded-full" src={avatarUrl} alt="Staff Avatar" />
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-24 sm:pb-8">
        {/* Welcome Message */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">歡迎回來, {displayName}!</h2>
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
                <span className="font-semibold">
                  {todayStatusQuery.data?.clockIn
                    ? todayStatusQuery.data?.clockOut
                      ? '已下班'
                      : '上班中'
                    : '未打卡'}
                </span>
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
              {appointmentsQuery.isLoading ? (
                <ListItemSkeleton count={3} />
              ) : upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">今日無待接待預約</p>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((apt: any) => (
                    <div key={apt.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                      <div className="text-center w-16 border-r border-gray-200 pr-3">
                        <p className="font-bold text-indigo-600">{apt.time}</p>
                      </div>
                      <div className="flex-grow ml-4">
                        <p className="font-semibold text-gray-800">{apt.customerName}</p>
                        <p className="text-sm text-gray-500">{apt.service} {apt.room ? `/ ${apt.room}` : ''}</p>
                      </div>
                      <MoreVertical className="text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg text-gray-800 mb-4">快速操作</h3>
              <div className="grid grid-cols-3 gap-4">
                <QuickActionButton icon={Clock} label="打卡" href="/staff/clock" />
                <QuickActionButton icon={Calendar} label="查看排班" href="/staff/schedule" />
                <QuickActionButton icon={Users} label="客戶列表" href="/staff/customers" />
              </div>
            </div>

            {/* Today's Stats */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg text-gray-800 mb-4">今日統計</h3>
              <div className="space-y-4">
                <StatCard icon={CheckCircle} title="已接待" value={served} color="bg-green-500" />
                <StatCard icon={Users} title="待接待" value={waiting} color="bg-yellow-500" />
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg text-gray-800 mb-4">最近通知</h3>
              <div className="space-y-3">
                {notifications.map((notif: any) => (
                  <div key={notif.id} className="flex items-start">
                    <div className="p-2 bg-indigo-100 rounded-full mr-3 mt-1">
                      <Bell size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">{notif.text}</p>
                      {notif.time && <p className="text-xs text-gray-400">{notif.time}</p>}
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
        <BottomNavItem icon={Clock} label="打卡" href="/staff/clock" />
        <BottomNavItem icon={BarChart} label="績效" href="/staff/performance" />
      </nav>
    </div>
  );
};

const BottomNavItem = ({ icon: Icon, label, href, active = false }: { icon: React.ElementType; label: string; href: string; active?: boolean }) => {
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
