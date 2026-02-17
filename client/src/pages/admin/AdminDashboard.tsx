import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Users, Briefcase, DollarSign, BarChart2, Settings, Shield, Bell, PlusCircle, Send, FileText, ChevronRight, MoreVertical, AlertCircle, CheckCircle } from 'lucide-react';

// --- Types --- //
type StatCardProps = {
  icon: React.ElementType;
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
};

type ChartProps = { isLoading: boolean; error: string | null };

// --- Mock Data --- //
const stats = [
  { icon: Briefcase, title: '總租戶數', value: '156' },
  { icon: DollarSign, title: '本月營收', value: 'NT$2,340,000' },
  { icon: Users, title: '活躍用戶', value: '3,892' },
  { icon: Shield, title: '系統健康度', value: '99.97%' },
];

const monthlyRevenue = [
  { month: '1月', revenue: 180 },
  { month: '2月', revenue: 210 },
  { month: '3月', revenue: 250 },
  { month: '4月', revenue: 220 },
  { month: '5月', revenue: 280 },
  { month: '6月', revenue: 310 },
];

const planDistribution = [
  { name: 'Core', value: 45, color: 'bg-indigo-500' },
  { name: 'Pro', value: 35, color: 'bg-violet-500' },
  { name: 'Enterprise', value: 20, color: 'bg-purple-500' },
];

const recentActivities = [
  { id: 1, user: 'Admin User', action: '新增租戶', target: 'Innovate Inc.', time: '5分鐘前' },
  { id: 2, user: 'System', action: '發送公告', target: '"Scheduled Maintenance"', time: '30分鐘前' },
  { id: 3, user: 'Alex Chen', action: '更新使用者權限', target: 'for user @betty_lee', time: '1小時前' },
  { id: 4, user: 'System', action: '生成報表', target: 'Monthly Revenue Report', time: '2小時前' },
  { id: 5, user: 'Admin User', action: '停用租戶', target: 'Legacy Corp', time: '3小時前' },
  { id: 6, user: 'Emily Wu', action: '重設密碼', target: 'for user @david_chang', time: '5小時前' },
  { id: 7, user: 'System', action: '資料庫備份完成', target: 'Primary DB', time: '6小時前' },
  { id: 8, user: 'Admin User', action: '新增租戶', target: 'FutureTech', time: '8小時前' },
  { id: 9, user: 'Grace Lin', action: '查看報表', target: 'User Activity Log', time: '1天前' },
  { id: 10, user: 'System', action: '系統更新', target: 'v2.5.1 deployed', time: '1天前' },
];

const systemAlerts = [
  { id: 1, severity: 'high', message: '主資料庫負載超過 90%', time: '15分鐘前' },
  { id: 2, severity: 'medium', message: 'API Gateway 延遲增加', time: '45分鐘前' },
  { id: 3, severity: 'low', message: '有 3 個租戶的備份失敗', time: '2小時前' },
];

// --- Reusable Components --- //
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
      <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`}>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        <MoreVertical size={20} />
      </button>
    </div>
    {children}
  </div>
);

// --- Layout Components --- //
const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const navItems = [
    { href: '/admin', icon: Home, label: '儀表板' },
    { href: '/admin/tenants', icon: Briefcase, label: '租戶管理' },
    { href: '/admin/revenue', icon: DollarSign, label: '營收分析' },
    { href: '/admin/users', icon: Users, label: '使用者管理' },
    { href: '/admin/system', icon: Settings, label: '系統設定' },
    { href: '/admin/logs', icon: FileText, label: '日誌紀錄' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 md:flex flex-col hidden">
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 text-transparent bg-clip-text">YOChiLL</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${location === item.href ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </a>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center">
            {/* Mobile menu button can be added here */}
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="h-6 w-6 text-gray-500" />
            <div className="w-8 h-8 bg-indigo-500 rounded-full"></div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// --- Chart & Data Components --- //

const MonthlyRevenueChart: React.FC<ChartProps> = ({ isLoading, error }) => {
  const maxValue = Math.max(...monthlyRevenue.map(d => d.revenue));

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="text-gray-500">讀取中...</div></div>;
  if (error) return <div className="flex items-center justify-center h-full"><div className="text-red-500">錯誤: {error}</div></div>;

  return (
    <div className="h-80 flex items-end justify-around p-4 space-x-2 rtl:space-x-reverse">
      {monthlyRevenue.map((data) => (
        <div key={data.month} className="flex-1 flex flex-col items-center space-y-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">{`$${(data.revenue/100).toFixed(1)}M`}</div>
          <div
            className="w-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-t-md transition-all duration-300 hover:opacity-80"
            style={{ height: `${(data.revenue / maxValue) * 80}%` }}
            title={`NT$${data.revenue.toLocaleString()}0,000`}
          ></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{data.month}</span>
        </div>
      ))}
    </div>
  );
};

const TenantGrowthChart: React.FC<ChartProps> = ({ isLoading, error }) => {
    const data = [102, 110, 118, 125, 140, 156];
    const maxValue = 200; // Set a fixed max value for a better visual scale
    const points = data.map((value, index) => `${(index / (data.length - 1)) * 100},${100 - (value / maxValue) * 90}`);

    if (isLoading) return <div className="flex items-center justify-center h-full"><div className="text-gray-500">讀取中...</div></div>;
    if (error) return <div className="flex items-center justify-center h-full"><div className="text-red-500">錯誤: {error}</div></div>;

    return (
        <div className="h-80 w-full p-4 relative">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="tenantGrowthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
                <polyline
                    fill="none"
                    stroke="url(#tenantGrowthGradient)"
                    strokeWidth="2"
                    points={points.join(" ")}
                />
                {data.map((value, index) => (
                    <circle 
                        key={index} 
                        cx={`${(index / (data.length - 1)) * 100}`} 
                        cy={`${100 - (value / maxValue) * 90}`} 
                        r="1.5" 
                        fill="white"
                        stroke="url(#tenantGrowthGradient)"
                        strokeWidth="0.5"
                    />
                ))}
            </svg>
            <div className="absolute bottom-0 left-4 right-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>6個月前</span>
                <span>現在</span>
            </div>
        </div>
    );
};

const PlanDistributionChart: React.FC<ChartProps> = ({ isLoading, error }) => {
    const total = planDistribution.reduce((acc, curr) => acc + curr.value, 0);
    let accumulated = 0;

    if (isLoading) return <div className="flex items-center justify-center h-full"><div className="text-gray-500">讀取中...</div></div>;
    if (error) return <div className="flex items-center justify-center h-full"><div className="text-red-500">錯誤: {error}</div></div>;

    return (
        <div className="h-80 flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {planDistribution.map((plan, index) => {
                        const percentage = (plan.value / total) * 100;
                        const strokeDasharray = `${percentage} ${100 - percentage}`;
                        const strokeDashoffset = -accumulated;
                        accumulated += percentage;
                        return (
                            <circle
                                key={index}
                                cx="18"
                                cy="18"
                                r="15.9155"
                                fill="transparent"
                                strokeWidth="3.8"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                className={plan.color.replace("bg-", "stroke-")}
                            />
                        );
                    })}
                </svg>
                 <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900 dark:text-white">{total}%</div>
            </div>
            <div className="flex flex-col space-y-2">
                {planDistribution.map((plan) => (
                    <div key={plan.name} className="flex items-center text-sm">
                        <span className={`w-3 h-3 mr-2 rounded-full ${plan.color}`}></span>
                        <span className="text-gray-600 dark:text-gray-300">{plan.name}</span>
                        <span className="ml-auto font-medium text-gray-800 dark:text-gray-100">{plan.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecentActivityFeed: React.FC = () => (
    <ul className="space-y-4 h-96 overflow-y-auto pr-2">
        {recentActivities.map((activity) => (
            <li key={activity.id} className="flex items-start space-x-3">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                    <ChevronRight size={16} className="text-gray-500" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                        <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-semibold text-indigo-500">{activity.target}</span>.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
            </li>
        ))}
    </ul>
);

const SystemAlertsPanel: React.FC = () => {
    const getSeverityClasses = (severity: string) => {
        switch (severity) {
            case 'high': return { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-200', icon: 'text-red-500' };
            case 'medium': return { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-200', icon: 'text-yellow-500' };
            case 'low': return { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-200', icon: 'text-blue-500' };
            default: return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', icon: 'text-gray-500' };
        }
    };

    return (
        <ul className="space-y-4 h-96 overflow-y-auto pr-2">
            {systemAlerts.map((alert) => {
                const classes = getSeverityClasses(alert.severity);
                return (
                    <li key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg ${classes.bg}`}>
                        <div className={`mt-1 ${classes.icon}`}>
                            <AlertCircle size={20} />
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${classes.text}`}>{alert.message}</p>
                            <p className={`text-xs ${classes.text} opacity-80`}>{alert.time}</p>
                        </div>
                    </li>
                );
            })}
             <li className="flex items-center space-x-3 p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                <CheckCircle size={20} className="text-green-500"/>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">系統狀態正常</p>
            </li>
        </ul>
    );
};

// --- Main Page Component --- //
const AdminDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Placeholder for future logic
    const [isPageLoading, setIsPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Simulate data fetching
  React.useEffect(() => {
    const timer = setTimeout(() => {
        // Simulate a successful fetch
        setIsLoading(false);
        
        // To test error state, uncomment the following lines:
        // setError("無法從伺服器獲取資料，請稍後再試。");
        // setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

    const LoadingSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
         <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
    </div>
  );

  const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
          <div className="flex">
              <div className="py-1"><AlertCircle className="h-6 w-6 text-red-500 mr-4"/></div>
              <div>
                  <p className="font-bold">發生錯誤</p>
                  <p className="text-sm">{message}</p>
              </div>
          </div>
      </div>
  );

  if (isLoading) {
    return <AdminLayout><div className="container mx-auto px-4 sm:px-6 lg:px-8"><h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">管理員儀表板</h2><LoadingSkeleton /></div></AdminLayout>;
  }

  if (error) {
    return <AdminLayout><div className="container mx-auto px-4 sm:px-6 lg:px-8"><h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">管理員儀表板</h2><ErrorDisplay message={error} /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">管理員儀表板</h2>
        
        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-4">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                新增租戶
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Send className="-ml-1 mr-2 h-5 w-5" />
                發送公告
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <FileText className="-ml-1 mr-2 h-5 w-5" />
                查看報表
            </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            {<Card title="月營收趨勢 (百萬)">
              <MonthlyRevenueChart isLoading={isLoading} error={error} />
            </Card>}
          </div>
          <div>
            {<Card title="方案分佈">
              <PlanDistributionChart isLoading={isLoading} error={error} />
            </Card>}
          </div>
        </div>

        {<Card title="租戶成長趨勢">
            <TenantGrowthChart isLoading={isLoading} error={error} />
          </Card>}
        <div className="mb-6">
        </div>

        {/* Recent Activity & System Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            {<Card title="最近活動">
              <RecentActivityFeed />
            </Card>}
          </div>
          <div className="lg:col-span-2">
            {<Card title="系統警報">
              <SystemAlertsPanel />
            </Card>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
