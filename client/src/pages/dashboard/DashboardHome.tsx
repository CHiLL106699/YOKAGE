import React, { useState } from 'react';
import { safeDate, safeDateTime, safeStr, safeTime, safeMoney } from '@/lib/safeFormat';
import { Link, useLocation } from 'wouter';
import { Calendar, BarChart2, Users, CheckSquare, Briefcase, DollarSign, Menu, X, LayoutDashboard, Settings, LogOut, MoreVertical } from 'lucide-react';
import { trpc } from '@/lib/trpc';

// --- TYPESCRIPT MODELS ---
type StatCardProps = {
  icon: React.ElementType;
  title: string;
  value: string;
};
type NavLinkProps = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const navLinks: NavLinkProps[] = [
  { href: '/clinic', label: '主控台', icon: LayoutDashboard },
  { href: '/clinic/appointments', label: '預約管理', icon: Calendar },
  { href: '/clinic/customers', label: '病患管理', icon: Users },
  { href: '/clinic/staff', label: '員工管理', icon: Briefcase },
  { href: '/clinic/reports', label: '營運報表', icon: BarChart2 },
  { href: '/clinic/settings', label: '診所設定', icon: Settings },
];

// --- SUB-COMPONENTS ---
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
    <div className="p-3 bg-indigo-100 rounded-full mr-4">
      <Icon className="h-6 w-6 text-indigo-600" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const Sidebar: React.FC<{ isOpen: boolean; setIsOpen: (isOpen: boolean) => void }> = ({ isOpen, setIsOpen }) => {
  const [location] = useLocation();
  return (
    <>
      <aside className={`fixed top-0 left-0 h-full bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-64 flex-shrink-0`}>
        <div className="p-4 flex items-center justify-between md:justify-center">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">YOChiLL</h1>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-600">
                <X className="h-6 w-6" />
            </button>
        </div>
        <nav className="mt-8">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href} className="px-4 mb-2">
                <Link href={link.href}>
                  <a className={`flex items-center p-3 rounded-lg transition-colors ${location === link.href ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <link.icon className="h-5 w-5 mr-3" />
                    {link.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full p-4">
            <Link href="/logout">
                <a className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100">
                    <LogOut className="h-5 w-5 mr-3" />
                    登出
                </a>
            </Link>
        </div>
      </aside>
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"></div>}
    </>
  );
};

const WelcomeBanner = ({ tenantName }: { tenantName: string }) => (
    <div className="p-6 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white mb-6">
        <h2 className="text-2xl font-bold">歡迎回來, {tenantName}!</h2>
        <p className="mt-1">這是您今天的診所營運總覽。</p>
    </div>
);

const QuickActions = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">新增預約</button>
        <button className="w-full bg-white text-gray-700 font-bold py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center">新增客戶</button>
        <button className="w-full bg-white text-gray-700 font-bold py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center">查看報表</button>
    </div>
);

const AppointmentTimeline = ({ appointments }: { appointments: any[] }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-bold text-lg mb-4">今日預約時間線</h3>
        <div className="relative pl-4">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            {appointments.map((appt) => (
                <div key={appt.id} className="relative mb-6 flex items-start">
                    <div className="absolute left-0 top-1.5 w-3 h-3 bg-indigo-500 rounded-full z-10 border-2 border-white"></div>
                    <p className="w-16 text-sm text-gray-500 mr-4">{appt.time}</p>
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-gray-800">{appt.customerName}</p>
                                <p className="text-sm text-gray-600">服務項目: {appt.service}</p>
                                <p className="text-sm text-gray-500">負責人員: {appt.staff}</p>
                            </div>
                            <img src={appt.avatar} alt={appt.customerName} className="w-10 h-10 rounded-full"  loading="lazy" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const RevenueChart = ({ revenueData }: { revenueData: any[] }) => {
    const maxAmount = Math.max(...revenueData.map(d => d.amount));
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg mb-4">近 7 日營收</h3>
            <div className="flex justify-between items-end h-48 space-x-2">
                {revenueData.map(data => (
                    <div key={data.day} className="flex-1 flex flex-col items-center">
                        <div 
                            className="w-full bg-gradient-to-t from-indigo-400 to-violet-400 rounded-t-md transition-all duration-500" 
                            style={{ height: `${(data.amount / maxAmount) * 100}%` }}
                        ></div>
                        <p className="text-xs text-gray-500 mt-2">{data.day}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecentCustomersList = ({ recentCustomers }: { recentCustomers: any[] }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-bold text-lg mb-4">近期客戶</h3>
        <ul>
            {recentCustomers.map(customer => (
                <li key={customer.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center">
                        <img src={customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full mr-4"  loading="lazy" />
                        <div>
                            <p className="font-semibold text-gray-800">{customer.name}</p>
                            <p className="text-sm text-gray-500">最近訪問: {customer.lastVisit}</p>
                        </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </li>
            ))}
        </ul>
    </div>
);

// --- LOADING & ERROR STATES ---
const LoadingSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-24 bg-gray-200 rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
    </div>
);

const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
        <p className="font-bold">發生錯誤</p>
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 text-sm underline">重試</button>
        )}
    </div>
);

// --- MAIN COMPONENT ---
const DashboardPage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const organizationId = 1; // TODO: from context

  // Fetch clinic stats
  const { data: clinicStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = trpc.clinic.stats.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  // Fetch today's appointments
  const today = new Date().toISOString().split('T')[0];
  const { data: appointmentsData, isLoading: apptLoading } = trpc.appointment.list.useQuery(
    { organizationId, date: today, limit: 8 },
    { enabled: !!organizationId }
  );

  // Fetch recent customers
  const { data: customersData, isLoading: custLoading } = trpc.customer.list.useQuery(
    { organizationId, limit: 5 },
    { enabled: !!organizationId }
  );

  // Fetch revenue data
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const { data: revenueReport, isLoading: revLoading } = trpc.report.revenue.useQuery(
    { organizationId, startDate: startDate.toISOString().split('T')[0], endDate: today },
    { enabled: !!organizationId }
  );

  // Fetch org info for tenant name
  const { data: orgData } = trpc.organization.current.useQuery();

  const isLoading = statsLoading || apptLoading || custLoading || revLoading;
  const error = statsError;

  const tenantName = (orgData as any)?.name || 'YOChiLL 總部';

  const statsCards: StatCardProps[] = [
    { icon: Calendar, title: "今日預約", value: String((clinicStats as any)?.todayAppointments ?? appointmentsData?.data?.length ?? 0) },
    { icon: DollarSign, title: "本月營收", value: `NT$${((clinicStats as any)?.monthlyRevenue ?? revenueReport?.totalRevenue ?? 0).toLocaleString()}` },
    { icon: Users, title: "客戶總數", value: String((clinicStats as any)?.customers ?? customersData?.total ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') },
    { icon: CheckSquare, title: "待辦事項", value: String((clinicStats as any)?.pendingAftercare ?? 0) },
  ];

  const appointments = (appointmentsData?.data ?? []).map((appt: any) => ({
    id: String(appt.id),
    time: appt.startTime || safeTime(appt.appointmentDate),
    customerName: appt.customerName || `客戶 #${appt.customerId}`,
    service: appt.productName || '一般診療',
    staff: appt.staffName || `醫師 #${appt.staffId || ''}`,
    avatar: `https://i.pravatar.cc/150?u=${appt.customerId}`,
  }));

  const dailyRevenue = revenueReport?.dailyRevenue ?? [];
  const dayLabels = ['日', '一', '二', '三', '四', '五', '六'];
  const chartData = dailyRevenue.length > 0
    ? dailyRevenue.map((d: any) => ({ day: safeDate(d.date).replace('週', ''), amount: d.amount ?? d.revenue ?? 0 }))
    : Array(7).fill(0).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return { day: dayLabels[d.getDay()], amount: 0 };
      }).reverse();

  const recentCustomers = (customersData?.data ?? []).map((cust: any) => ({
    id: String(cust.id),
    name: cust.name,
    avatar: `https://i.pravatar.cc/150?u=${cust.id}`,
    lastVisit: cust.lastVisit ? safeDate(cust.lastVisit) : '新客戶',
  }));

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center md:justify-end">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600">
                <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="font-semibold">Tech Lead</p>
                    <p className="text-sm text-gray-500">Principal Architect</p>
                </div>
                <img src="https://i.pravatar.cc/40" alt="User Avatar" className="w-10 h-10 rounded-full" />
            </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorDisplay message={error.message} onRetry={refetchStats} />
          ) : (
            <>
              <WelcomeBanner tenantName={tenantName} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {statsCards.map((card) => <StatCard key={card.title} {...card} />)}
              </div>
              <div className="mb-6">
                <QuickActions />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AppointmentTimeline appointments={appointments} />
                </div>
                <div className="space-y-6">
                  <RevenueChart revenueData={chartData} />
                  <RecentCustomersList recentCustomers={recentCustomers} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;

