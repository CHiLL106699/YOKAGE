
import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  Home,
  Users,
  Briefcase,
  DollarSign,
  BarChart2,
  Settings,
  Shield,
  Bell,
  FileText,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Activity,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { QueryLoading, QueryError } from '@/components/ui/query-state';
import { Skeleton } from '@/components/ui/skeleton';

// --- Types --- //
type StatCardProps = {
  icon: React.ElementType;
  title: string;
  value: string;
};

type ChartProps = {
  isLoading: boolean;
  error: any;
  data: any;
};

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

// --- Layout Components (Unchanged) --- //
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
          <div className="flex items-center"></div>
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

// --- Data Components (Rewritten with tRPC) --- //

const StatCards: React.FC = () => {
  const { data: statsData, isLoading: isLoadingStats, error: errorStats } = trpc.superAdmin.stats.useQuery();
  const { data: billingData, isLoading: isLoadingBilling, error: errorBilling } = trpc.superAdmin.billingStats.useQuery();
  const { data: healthData, isLoading: isLoadingHealth, error: errorHealth } = trpc.superAdmin.getSystemHealth.useQuery();

  const isLoading = isLoadingStats || isLoadingBilling || isLoadingHealth;

  const stats = isLoading ? [
      { icon: Briefcase, title: '總租戶數', value: '...' },
      { icon: DollarSign, title: '本月營收', value: '...' },
      { icon: Users, title: '活躍用戶', value: '...' },
      { icon: Shield, title: '系統健康度', value: '...' },
  ] : [
      { icon: Briefcase, title: '總租戶數', value: statsData?.organizations.toString() ?? 'N/A' },
      { icon: DollarSign, title: '本月營收', value: `NT$${(billingData?.monthlyRevenue ?? 0).toLocaleString()}` },
      { icon: Users, title: '活躍用戶', value: statsData?.users.toString() ?? 'N/A' },
      { icon: Shield, title: '系統健康度', value: `${healthData?.uptime.toFixed(2) ?? 'N/A'}%` },
  ];

  if (errorStats || errorBilling || errorHealth) {
      return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><QueryError message={(errorStats || errorBilling || errorHealth)?.message ?? '載入統計資料失敗'} /></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
          isLoading ? <Skeleton key={index} className="h-24" /> : <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

const MonthlyRevenueChart: React.FC = () => {
  const { data, isLoading, error } = trpc.superAdmin.revenueByMonth.useQuery();

  if (isLoading) return <Skeleton className="h-80 w-full" />;
  if (error) return <QueryError message={error?.message ?? '載入營收資料失敗'} />;

  const maxValue = Math.max(...(data?.map(d => d.revenue) ?? [0]));

  return (
    <div className="h-80 flex items-end justify-around p-4 space-x-2 rtl:space-x-reverse">
      {data?.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center space-y-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">{`$${(d.revenue / 1000000).toFixed(1)}M`}</div>
          <div
            className="w-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-t-md transition-all duration-300 hover:opacity-80"
            style={{ height: `${(d.revenue / maxValue) * 80}%` }}
            title={`NT$${d.revenue.toLocaleString()}`}
          ></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

const PlanDistributionChart: React.FC = () => {
    const { data, isLoading, error } = trpc.superAdmin.planDistribution.useQuery();

    if (isLoading) return <Skeleton className="h-80 w-full" />;
    if (error) return <QueryError message={error?.message ?? '載入方案分佈失敗'} />;

    const planColors: { [key: string]: string } = {
        Core: 'bg-indigo-500',
        Pro: 'bg-violet-500',
        Enterprise: 'bg-purple-500',
    };

    const total = data?.reduce((acc, curr) => acc + curr.count, 0) ?? 0;
    let accumulated = 0;

    return (
        <div className="h-80 flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {data?.map((plan, index) => {
                        const percentage = (plan.count / total) * 100;
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
                                className={planColors[plan.plan]?.replace("bg-", "stroke-") ?? 'stroke-gray-500'}
                            />
                        );
                    })}
                </svg>
                 <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900 dark:text-white">{total}</div>
            </div>
            <div className="flex flex-col space-y-2">
                {data?.map((plan) => (
                    <div key={plan.plan} className="flex items-center text-sm">
                        <span className={`w-3 h-3 mr-2 rounded-full ${planColors[plan.plan] ?? 'bg-gray-500'}`}></span>
                        <span className="text-gray-700 dark:text-gray-300">{plan.plan}</span>
                        <span className="ml-auto text-gray-500 dark:text-gray-400">{plan.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecentActivities: React.FC = () => {
  const { data, isLoading, error } = trpc.superAdmin.getAuditLogs.useQuery({ limit: 10 });

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (error) return <QueryError message={error?.message ?? '載入活動日誌失敗'} />;

  return (
    <ul className="space-y-4">
      {data?.logs.map((activity) => (
        <li key={activity.id} className="flex items-center space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Activity className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              <span className="font-semibold">{activity.userName}</span> {activity.action} <span className="font-semibold">{activity.target}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
          </div>
          <div className={`flex items-center text-xs ${activity.success ? 'text-green-500' : 'text-red-500'}`}>
            {activity.success ? <CheckCircle size={14} className="mr-1" /> : <AlertCircle size={14} className="mr-1" />}
            {activity.success ? '成功' : '失敗'}
          </div>
        </li>
      ))}
    </ul>
  );
};

const SystemHealthWidget: React.FC = () => {
  const { data, isLoading, error } = trpc.superAdmin.getSystemHealth.useQuery();

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (error) return <QueryError message={error?.message ?? '載入系統狀態失敗'} />;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="text-green-500" />;
      case 'degraded': return <AlertCircle className="text-yellow-500" />;
      default: return <AlertCircle className="text-red-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">整體狀態</h4>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${data?.overallStatus === 'operational' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
          {getStatusIcon(data?.overallStatus ?? '')}
          <span>{data?.overallStatus === 'operational' ? '一切正常' : '偵測到問題'}</span>
        </div>
      </div>
      <ul className="space-y-3">
        {data?.services && Object.entries(data.services).map(([name, status]) => (
          <li key={name} className="flex justify-between items-center">
            <span className="text-sm capitalize text-gray-600 dark:text-gray-300">{name}</span>
            <div className="flex items-center space-x-2 text-sm">
              {getStatusIcon(status)}
              <span className="capitalize">{status}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// --- Main Dashboard Page --- //
const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <StatCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="月營收趨勢" className="lg:col-span-2">
            <MonthlyRevenueChart />
          </Card>
          <Card title="方案分佈">
            <PlanDistributionChart />
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="近期活動" className="lg:col-span-2">
            <RecentActivities />
          </Card>
          <Card title="系統健康狀態">
            <SystemHealthWidget />
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
