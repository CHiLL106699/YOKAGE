
import React from 'react';
import { useLocation, Link } from 'wouter';
import {
  ChevronDown, Calendar, Download, DollarSign, TrendingUp, Users, UserX, BarChart, MoreVertical, LayoutDashboard, Settings, HelpCircle, LogOut
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { QueryLoading, QueryError } from '@/components/ui/query-state';
import { Skeleton } from '@/components/ui/skeleton';

// --- TYPESCRIPT INTERFACES ---
type KpiData = {
  title: string;
  value: string;
  change?: string;
  icon: React.ElementType;
};

type MonthlyRevenue = {
  month: string;
  revenue: number;
};

type PlanDistribution = {
  plan: string;
  count: number;
};

// The API does not provide a direct mapping for this.
// Keeping mock data as a placeholder.
type ModuleRevenue = {
  name: string;
  revenue: number;
};

const mockModuleRevenue: ModuleRevenue[] = [
    { name: '核心 CRM', revenue: 1200000 },
    { name: '線上預約', revenue: 650000 },
    { name: '電子病歷', revenue: 350000 },
    { name: '庫存管理', revenue: 140000 },
];

// The API does not provide a direct mapping for this.
// Keeping mock data as a placeholder.
const mockNewVsChurn = {
    newRevenue: 180000,
    churnedRevenue: -45000,
};

// --- SUB-COMPONENTS ---

const AdminSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location] = useLocation();
  const NavLink: React.FC<{ href: string; icon: React.ElementType; label: string }> = ({ href, icon: Icon, label }) => (
    <Link href={href}>
      <a className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${location === href ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
        <Icon className="w-5 h-5 mr-3" />
        {label}
      </a>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <aside className="w-64 bg-gray-800 p-4 flex-shrink-0 hidden md:flex flex-col">
        <div className="flex items-center mb-8">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                YOChiLL
            </div>
            <span className="ml-2 px-2 py-1 text-xs font-semibold text-violet-300 bg-violet-500/20 rounded">ADMIN</span>
        </div>
        <nav className="flex-grow space-y-2">
          <NavLink href="/admin/dashboard" icon={LayoutDashboard} label="總覽" />
          <NavLink href="/admin/revenue" icon={BarChart} label="收入報告" />
          <NavLink href="/admin/users" icon={Users} label="用戶管理" />
          <NavLink href="/admin/settings" icon={Settings} label="系統設定" />
        </nav>
        <div className="mt-auto">
            <NavLink href="/help" icon={HelpCircle} label="幫助中心" />
            <NavLink href="/logout" icon={LogOut} label="登出" />
        </div>
      </aside>
      <main className="flex-grow bg-gray-900 overflow-auto">{children}</main>
    </div>
  );
};

const KpiCard: React.FC<{ data: KpiData }> = ({ data }) => {
  const isPositive = data.change && data.change.startsWith('+');
  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{data.title}</h3>
        <data.icon className="w-5 h-5 text-gray-500" />
      </div>
      <div className="flex items-baseline space-x-2">
        <p className="text-2xl md:text-3xl font-bold text-white">{data.value}</p>
        {data.change && (
          <span className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {data.change}
          </span>
        )}
      </div>
    </div>
  );
};

const MonthlyRevenueChart: React.FC<{ data: MonthlyRevenue[] }> = ({ data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">月收入趨勢</h3>
      <div className="h-64 flex items-end space-x-2 md:space-x-4">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center group relative">
            <div 
              className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t-md transition-all duration-300 hover:from-indigo-500 hover:to-violet-400"
              style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
            >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-900/80 text-white text-xs rounded py-1 px-2 absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    NT${d.revenue.toLocaleString()}
                </div>
            </div>
            <span className="text-xs text-gray-400 mt-2">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlanDistributionChart: React.FC<{ data: PlanDistribution[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    const planColors: { [key: string]: string } = {
        Core: 'bg-indigo-500',
        Pro: 'bg-violet-500',
        Enterprise: 'bg-purple-500',
        default: 'bg-gray-500',
    };

    return (
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700/50 h-full">
        <h3 className="text-lg font-semibold text-white mb-4">收入來源 (按方案)</h3>
        <div className="space-y-4">
          <div className="w-full flex rounded-full h-3.5 bg-gray-700 overflow-hidden">
            {data.map(plan => (
              <div key={plan.plan} className={`${planColors[plan.plan] || planColors.default} transition-all`} style={{ width: `${(plan.count / total) * 100}%` }}></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {data.map(plan => (
              <div key={plan.plan}>
                <div className="flex items-center justify-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${planColors[plan.plan] || planColors.default}`}></div>
                    <span className="text-sm text-gray-400">{plan.plan}</span>
                </div>
                <p className="text-xl font-bold text-white mt-1">{((plan.count / total) * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
};

const ModuleBreakdown: React.FC<{ data: ModuleRevenue[] }> = ({ data }) => {
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700/50 h-full">
            <h3 className="text-lg font-semibold text-white mb-4">收入來源 (按模組)</h3>
            <div className="space-y-3">
                {data.map(item => {
                    const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
                    return (
                        <div key={item.name}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-300">{item.name}</span>
                                <span className="text-sm font-medium text-white">NT${item.revenue.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const NewVsChurn: React.FC<{ data: { newRevenue: number; churnedRevenue: number } }> = ({ data }) => (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">新增 vs 流失收入</h3>
        <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
                <p className="text-sm text-gray-400">本月新增 MRR</p>
                <p className="text-2xl font-bold text-green-400 mt-1">+NT${data.newRevenue.toLocaleString()}</p>
            </div>
            <div className="text-center">
                <p className="text-sm text-gray-400">本月流失 MRR</p>
                <p className="text-2xl font-bold text-red-400 mt-1">NT${data.churnedRevenue.toLocaleString()}</p>
            </div>
        </div>
    </div>
);

const TopTenantsTable: React.FC<{ data: any[], isLoading: boolean }> = ({ data, isLoading }) => {
  const planColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-500/20 text-purple-300';
      case 'Pro': return 'bg-violet-500/20 text-violet-300';
      case 'Core': return 'bg-indigo-500/20 text-indigo-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white">Top 10 貢獻租戶</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">租戶名稱</th>
              <th scope="col" className="px-6 py-3">MRR</th>
              <th scope="col" className="px-6 py-3">方案</th>
              <th scope="col" className="px-6 py-3">加入日期</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">操作</span></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="bg-gray-800 border-b border-gray-700">
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-6 py-4"></td>
                    </tr>
                ))
            ) : (
                data.map((tenant) => (
                  <tr key={tenant.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                      {tenant.clinicName}
                    </th>
                    <td className="px-6 py-4">NT${tenant.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${planColor(tenant.plan)}`}>
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(tenant.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const KpiSkeleton = () => (
    <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-16" />
    </div>
);

// --- MAIN PAGE COMPONENT ---
const AdminRevenuePage = () => {
  const billingStatsQuery = trpc.superAdmin.billingStats.useQuery();
  const revenueByMonthQuery = trpc.superAdmin.revenueByMonth.useQuery();
  const planDistributionQuery = trpc.superAdmin.planDistribution.useQuery();
  const topTenantsQuery = trpc.superAdmin.listInvoices.useQuery({ status: 'paid', limit: 1000 }); // Fetch more to calculate top tenants

  const queries = [billingStatsQuery, revenueByMonthQuery, planDistributionQuery, topTenantsQuery];
  const isLoading = queries.some(q => q.isLoading);
  const error = queries.find(q => q.error)?.error;

  const getKpiData = (): KpiData[] => {
    if (!billingStatsQuery.data) {
      return [
        { title: 'MRR', value: '...', icon: DollarSign },
        { title: 'ARR', value: '...', icon: TrendingUp },
        { title: '平均客單價', value: '...', icon: Users },
        { title: '流失率', value: '...', icon: UserX },
      ];
    }
    const { monthlyRevenue, totalRevenue, activeSubscriptions, growthRate } = billingStatsQuery.data;
    const arr = monthlyRevenue * 12;
    const arpu = activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0;

    return [
      { title: 'MRR', value: `NT$${monthlyRevenue.toLocaleString()}`, change: `${growthRate > 0 ? '+' : ''}${(growthRate * 100).toFixed(1)}%`, icon: DollarSign },
      { title: 'ARR', value: `NT$${arr.toLocaleString()}`, change: `${growthRate > 0 ? '+' : ''}${(growthRate * 100).toFixed(1)}%`, icon: TrendingUp },
      { title: '平均客單價', value: `NT$${arpu.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Users },
      { title: '流失率', value: 'N/A', icon: UserX }, // Churn rate not directly available
    ];
  };

  const getTopTenants = () => {
      if (!topTenantsQuery.data) return [];
      
      const tenantRevenue: { [key: string]: { total: number, latest: any } } = {};
      topTenantsQuery.data.data.forEach(invoice => {
          if (!tenantRevenue[invoice.clinicName]) {
              tenantRevenue[invoice.clinicName] = { total: 0, latest: invoice };
          }
          tenantRevenue[invoice.clinicName].total += invoice.amount;
          if (new Date(invoice.createdAt) > new Date(tenantRevenue[invoice.clinicName].latest.createdAt)) {
              tenantRevenue[invoice.clinicName].latest = invoice;
          }
      });

      return Object.entries(tenantRevenue)
          .sort(([, a], [, b]) => b.total - a.total)
          .slice(0, 10)
          .map(([clinicName, data]) => ({
              id: data.latest.dbId,
              clinicName,
              amount: data.total,
              plan: data.latest.plan,
              createdAt: data.latest.createdAt,
          }));
  };

  const PageContent = () => {
      if (isLoading && !error) {
          return (
            <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-pulse">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <Skeleton className="h-9 w-48" />
                    <div className="flex items-center gap-2 md:gap-4">
                        <Skeleton className="h-10 w-36" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
                </div>
                <div className="lg:col-span-3">
                    <Skeleton className="h-80 w-full rounded-xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="lg:col-span-1"><Skeleton className="h-48 w-full rounded-xl" /></div>
                    <div className="lg:col-span-2"><Skeleton className="h-48 w-full rounded-xl" /></div>
                </div>
                <div>
                    <TopTenantsTable data={[]} isLoading={true} />
                </div>
            </div>
          );
      }

      if (error) {
          return <div className="p-4 md:p-8"><QueryError message={error?.message ?? '載入營收資料失敗'} /></div>;
      }

      return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-white">收入報告</h1>
                <div className="flex items-center gap-2 md:gap-4">
                    <button className="flex items-center gap-2 bg-gray-700/80 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        <Calendar className="w-4 h-4" />
                        <span>過去 30 天</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold py-2 px-4 rounded-lg transition-all">
                        <Download className="w-4 h-4" />
                        <span>匯出</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {getKpiData().map((kpi, i) => <KpiCard key={i} data={kpi} />)}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-3">
                    <MonthlyRevenueChart data={revenueByMonthQuery.data || []} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-1">
                    <PlanDistributionChart data={planDistributionQuery.data || []} />
                </div>
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 h-full">
                        <ModuleBreakdown data={mockModuleRevenue} />
                        <NewVsChurn data={mockNewVsChurn} />
                    </div>
                </div>
            </div>

            {/* Top Tenants Table */}
            <div>
                <TopTenantsTable data={getTopTenants()} isLoading={topTenantsQuery.isLoading} />
            </div>
        </div>
      );
  }

  return (
    <AdminSidebar>
        <PageContent />
    </AdminSidebar>
  );
};

export default AdminRevenuePage;
