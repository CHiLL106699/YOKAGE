import React, { useState, useMemo, FC, ReactNode } from 'react';
import { useLocation, Link } from "wouter";
import { ChevronDown, Download, Calendar, BarChart2, Users, Star, Briefcase, LayoutDashboard, Settings, FileText } from 'lucide-react';
import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";

// --- TYPES --- //
type DateRange = { startDate: Date; endDate: Date };
type Tab = 'revenue' | 'customers' | 'performance';




// --- HELPER & UI COMPONENTS --- //

const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

const StatCard: FC<{ title: string; value: string | number; icon: ReactNode; }> = ({ title, value, icon }) => (
  <Card>
    <div className="flex items-center">
      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
      </div>
    </div>
  </Card>
);

const BarChart: FC<{ data: { name: string; [key: string]: any }[]; keys: string[]; colors: string[]; isLoading?: boolean; error?: any; onRetry?: () => void; }> = ({ data, keys, colors, isLoading, error, onRetry }) => {
  if (isLoading) return <QueryLoading variant="skeleton-cards" />;
  if (error) return <QueryError message={error.message} onRetry={onRetry} />;

  const maxValue = Math.max(...data.flatMap(d => keys.map(key => d[key] as number))) || 1;

  return (
    <div className="w-full h-64 flex items-end space-x-2 sm:space-x-4 pr-4">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center h-full justify-end">
          <div className="flex w-full h-full items-end justify-center space-x-1">
            {keys.map((key, keyIndex) => (
              <div
                key={keyIndex}
                className="w-full rounded-t-md hover:opacity-80 transition-opacity"
                style={{ 
                  height: `${(item[key] / maxValue) * 100}%`, 
                  backgroundColor: colors[keyIndex % colors.length]
                }}
                title={`${item.name} - ${key}: ${item[key]}`}
              />
            ))}
          </div>
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">{item.name}</div>
        </div>
      ))}
        </div>
  );
};

const PieChart: FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const colors = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];
  let cumulativePercentage = 0;

  const conicGradient = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const startAngle = (cumulativePercentage / 100) * 360;
    cumulativePercentage += percentage;
    const endAngle = (cumulativePercentage / 100) * 360;
    return `${colors[index % colors.length]} ${startAngle}deg ${endAngle}deg`;
  }).join(', ');

  return (
    <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
      <div 
        className="w-40 h-40 rounded-full"
        style={{ background: `conic-gradient(${conicGradient})` }}
      ></div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
            <span className="text-gray-700 dark:text-gray-300">{item.name}:</span>
            <span className="font-semibold ml-1 text-gray-800 dark:text-gray-100">{item.value}%</span>
          </div>
        ))}
      </div>
        </div>
  );
};

const DateRangePicker: FC<{ dateRange: DateRange; setDateRange: (range: DateRange) => void; }> = ({ dateRange, setDateRange }) => (
  <div className="relative">
    <button className="flex items-center justify-between w-full md:w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      <Calendar className="w-5 h-5 mr-2 text-gray-400" />
      <span>
        {`${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`}
      </span>
      <ChevronDown className="w-5 h-5 ml-2 -mr-1 text-gray-400" />
    </button>
    {/* Dropdown would be implemented here */}
  </div>
);

const DashboardLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const [location] = useLocation();
  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: '總覽' },
    { href: '/dashboard/reports', icon: BarChart2, label: '報表中心' },
    { href: '/dashboard/services', icon: Briefcase, label: '服務管理' },
    { href: '/dashboard/customers', icon: Users, label: '客戶列表' },
    { href: '/dashboard/settings', icon: Settings, label: '設定' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <aside className="w-16 md:w-64 bg-white dark:bg-gray-800 flex-shrink-0 shadow-lg">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">YOChiLL</span>
        </div>
        <nav className="mt-8">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}>
              <a className={`flex items-center px-4 md:px-6 py-3 my-1 transition-colors duration-200 ${location === item.href ? 'bg-indigo-50 dark:bg-indigo-900/30 border-r-4 border-indigo-500 text-indigo-600 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <item.icon className="w-6 h-6" />
                <span className="mx-4 font-medium hidden md:inline"> {item.label}</span>
              </a>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
  );
};

// --- TAB COMPONENTS --- //

const RevenueReportTab: FC = () => {
  const { data: revenueData, isLoading, error: revError, refetch: refetchRevenue } = (trpc as any).dashboardB.revenueTrend.useQuery({ organizationId: 1 });
  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly'>('monthly');
    if (isLoading) return <QueryLoading variant="skeleton" />;
  
  if (!revenueData) return <div>No data</div>;

  const data = timeframe === 'monthly' ? revenueData.monthly : revenueData.weekly;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="總營收" value={`$${revenueData.kpis.totalRevenue.toLocaleString()}`} icon={<BarChart2 className="w-6 h-6 text-indigo-500" />} />
        <StatCard title="平均訂單金額" value={`$${revenueData.kpis.avgRevenue.toLocaleString()}`} icon={<FileText className="w-6 h-6 text-indigo-500" />} />
        <StatCard title="交易次數" value={revenueData.kpis.transactionCount.toLocaleString()} icon={<Users className="w-6 h-6 text-indigo-500" />} />
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">營收趨勢</h3>
          <div className="flex space-x-2">
            <button onClick={() => setTimeframe('monthly')} className={`px-3 py-1 text-sm rounded-md ${timeframe === 'monthly' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>月</button>
            <button onClick={() => setTimeframe('weekly')} className={`px-3 py-1 text-sm rounded-md ${timeframe === 'weekly' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>週</button>
          </div>
        </div>
        <BarChart data={data} keys={['revenue']} colors={['#6366F1']} isLoading={isLoading} error={revError} onRetry={refetchRevenue} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">熱門服務項目</h3>
          <div className="space-y-3">
            {revenueData.topServices.map((service: { name: string; revenue: number }, i: number) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">{service.name}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">${service.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">付款方式分佈</h3>
          <PieChart data={revenueData.paymentMethods} />
        </Card>
      </div>
    </div>
  );
};

const CustomerReportTab: FC = () => {
  const { data: custStats, isLoading, error, refetch } = (trpc as any).dashboardB.kpi.useQuery({ organizationId: 1 });

  if (isLoading) return <QueryLoading variant="skeleton" />;
  if (error) return <QueryError message={error.message} onRetry={refetch} />;
  if (!custStats) return <div>No data</div>;

  return (
    <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="總客戶數" value={custStats.kpis.totalCustomers} icon={<Users className="w-6 h-6 text-indigo-500" />} />
      <StatCard title="新客戶數" value={custStats.kpis.newCustomers} icon={<Users className="w-6 h-6 text-indigo-500" />} />
      <StatCard title="回頭率" value={`${custStats.kpis.returningRate}%`} icon={<Star className="w-6 h-6 text-indigo-500" />} />
    </div>

    <Card>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">新舊客戶趨勢</h3>
            <BarChart data={custStats.trend} keys={['new', 'returning']} colors={['#818CF8', '#4F46E5']} isLoading={isLoading} error={error} onRetry={refetch} />
    </Card>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">客戶來源</h3>
        <PieChart data={custStats.sources} />
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">RFM 客戶分群</h3>
        <PieChart data={custStats.rfm} />
      </Card>
    </div>
  </div>
  );
};

const EmployeeReportTab: FC = () => {
  const { data: apptStats, isLoading, error, refetch } = (trpc as any).dashboardB.topServices.useQuery({ organizationId: 1 });

  if (isLoading) return <QueryLoading variant="skeleton" />;
  if (error) return <QueryError message={error.message} onRetry={refetch} />;
  if (!apptStats) return <div>No data</div>;

  return (
    <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="總預約數" value={String(apptStats?.totalAppointments ?? 0)} icon={<Briefcase className="w-6 h-6 text-indigo-500" />} />
      <StatCard title="平均評價" value={String(apptStats?.avgRating ?? "-")} icon={<Star className="w-6 h-6 text-indigo-500" />} />
      <StatCard title="績效冠軍" value={String(apptStats?.topPerformer ?? "-")} icon={<Users className="w-6 h-6 text-indigo-500" />} />
    </div>

    <Card>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">員工營收排行</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="p-3">排行</th>
              <th className="p-3">員工</th>
              <th className="p-3 text-right">營收</th>
              <th className="p-3 text-right">預約數</th>
              <th className="p-3 text-right">平均評價</th>
            </tr>
          </thead>
          <tbody>
                                    {(apptStats?.ranking ?? []).map((employee: any, i: number) => (
              <tr key={employee.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-3 font-medium">{i + 1}</td>
                <td className="p-3 flex items-center">
                  <img src={employee.avatar} alt={employee.name} className="w-8 h-8 rounded-full mr-3"  loading="lazy" />
                  {employee.name}
                </td>
                <td className="p-3 text-right font-mono">${employee.revenue.toLocaleString()}</td>
                <td className="p-3 text-right font-mono">{((apptStats as any)?.appointments ?? []).find((a: any) => a.name === employee.name)?.count}</td>
                <td className="p-3 text-right font-mono flex justify-end items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  {((apptStats as any)?.ratings ?? []).find((r: any) => r.name === employee.name)?.rating}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
  );
};

// --- MAIN COMPONENT --- //

const DashboardReportsPage: FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('revenue');
  const [dateRange, setDateRange] = useState<DateRange>({ 
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  // Simulate data fetching
  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setLoading(false);
      } catch (e) {
        setError("無法載入報表資料，請稍後再試。");
        setLoading(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: 'revenue', label: '營收報表' },
    { id: 'customers', label: '客戶報表' },
    { id: 'performance', label: '員工績效報表' },
  ];

  const renderContent = () => {
  const organizationId = 1; // TODO: from context
  const today = new Date().toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const { data: revenueData, isLoading: revLoading, error: revError, refetch: refetchRevenue } = (trpc as any).report.revenue.useQuery(
    { organizationId, startDate: monthStart, endDate: today },
    { enabled: !!organizationId }
  );
  
  const { data: apptStats, isLoading: apptLoading } = (trpc as any).report.appointmentStats.useQuery(
    { organizationId, startDate: monthStart, endDate: today },
    { enabled: !!organizationId }
  );
  
  const { data: custStats, isLoading: custLoading } = (trpc as any).report.customerStats.useQuery(
    { organizationId, startDate: monthStart, endDate: today },
    { enabled: !!organizationId }
  );
  
  const isLoading = revLoading || apptLoading || custLoading;

    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-500">
          <h3 className="text-xl font-semibold">發生錯誤</h3>
          <p>{error}</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'revenue': return <RevenueReportTab />;
      case 'customers': return <CustomerReportTab />;
      case 'performance': return <EmployeeReportTab />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">報表中心</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">分析您的業務績效與趨勢</p>
            </div>
            <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
          </div>
        </header>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                  }`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex justify-end mb-4">
            <button className="flex items-center bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                匯出此報表
            </button>
        </div>

        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default DashboardReportsPage;
