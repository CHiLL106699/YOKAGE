
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Calendar, BarChart2, Users, CheckSquare, Briefcase, User, DollarSign, Menu, X, Building, LayoutDashboard, Settings, LogOut, ChevronRight, MoreVertical } from 'lucide-react';

// --- TYPESCRIPT MODELS ---
type StatCardProps = {
  icon: React.ElementType;
  title: string;
  value: string;
};

type Appointment = {
  id: string;
  time: string;
  customerName: string;
  service: string;
  staff: string;
  avatar: string;
};

type RevenueData = {
  day: string;
  amount: number;
};

type Customer = {
  id: string;
  name: string;
  avatar: string;
  lastVisit: string;
};

type NavLinkProps = {
  href: string;
  label: string;
  icon: React.ElementType;
};

// --- MOCK DATA ---
const tenantName = "YOChiLL 總部";

const stats: StatCardProps[] = [
  { icon: Calendar, title: "今日預約", value: "12" },
  { icon: DollarSign, title: "本月營收", value: "NT$580,000" },
  { icon: Users, title: "客戶總數", value: "2,456" },
  { icon: CheckSquare, title: "待辦事項", value: "5" },
];

const appointments: Appointment[] = [
    { id: '1', time: '09:00', customerName: '陳小姐', service: '初診諮詢', staff: '林醫師', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', time: '10:00', customerName: '王先生', service: '定期回診', staff: '黃醫師', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', time: '11:30', customerName: '李太太', service: '手術', staff: '張醫師', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: '4', time: '13:00', customerName: '吳小弟', service: '牙齒矯正', staff: '陳醫師', avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: '5', time: '14:00', customerName: '高小姐', service: '洗牙', staff: '林醫師', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: '6', time: '15:30', customerName: '周先生', service: '植牙諮詢', staff: '黃醫師', avatar: 'https://i.pravatar.cc/150?img=6' },
    { id: '7', time: '16:00', customerName: '蔡先生', service: '定期回診', staff: '張醫師', avatar: 'https://i.pravatar.cc/150?img=7' },
    { id: '8', time: '17:00', customerName: '林小姐', service: '美白', staff: '陳醫師', avatar: 'https://i.pravatar.cc/150?img=8' },
];

const revenueData: RevenueData[] = [
  { day: '一', amount: 65000 },
  { day: '二', amount: 78000 },
  { day: '三', amount: 92000 },
  { day: '四', amount: 81000 },
  { day: '五', amount: 110000 },
  { day: '六', amount: 120000 },
  { day: '日', amount: 34000 },
];

const recentCustomers: Customer[] = [
    { id: '1', name: '黃敏敏', avatar: 'https://i.pravatar.cc/150?img=9', lastVisit: '2026-02-16' },
    { id: '2', name: '張偉倫', avatar: 'https://i.pravatar.cc/150?img=10', lastVisit: '2026-02-15' },
    { id: '3', name: '許淑芬', avatar: 'https://i.pravatar.cc/150?img=11', lastVisit: '2026-02-15' },
    { id: '4', name: '劉建宏', avatar: 'https://i.pravatar.cc/150?img=12', lastVisit: '2026-02-14' },
    { id: '5', name: '鄭伊婷', avatar: 'https://i.pravatar.cc/150?img=13', lastVisit: '2026-02-13' },
];

const navLinks: NavLinkProps[] = [
  { href: '/dashboard', label: '主控台', icon: LayoutDashboard },
  { href: '/dashboard/appointments', label: '預約管理', icon: Calendar },
  { href: '/dashboard/patients', label: '病患管理', icon: Users },
  { href: '/dashboard/staff', label: '員工管理', icon: Briefcase },
  { href: '/dashboard/reports', label: '營運報表', icon: BarChart2 },
  { href: '/dashboard/settings', label: '診所設定', icon: Settings },
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

const WelcomeBanner = () => (
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

const AppointmentTimeline = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-bold text-lg mb-4">今日預約時間線</h3>
        <div className="relative pl-4">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            {appointments.map((appt, index) => (
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

const RevenueChart = () => {
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

const RecentCustomersList = () => (
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

const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
        <p className="font-bold">發生錯誤</p>
        <p>{message}</p>
    </div>
);

// --- MAIN COMPONENT ---

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate data fetching
      // To test error state, uncomment the following line:
      // setError("無法從伺服器獲取儀表板資料，請稍後再試。");
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 p-4 border-b md:hidden">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">YOChiLL</h1>
                <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
                    <Menu className="h-6 w-6" />
                </button>
            </div>
        </header>

        <div className="p-4 md:p-6">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorDisplay message={error} />
          ) : (
            <>
              <WelcomeBanner />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
              </div>
              <div className="mb-6">
                <QuickActions />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <AppointmentTimeline />
                </div>
                <div className="space-y-6">
                    <RevenueChart />
                    <RecentCustomersList />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
