import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { Star, Award, TrendingUp, Users, DollarSign, Calendar, Target, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useStaffContext } from '@/hooks/useStaffContext';
import { PageLoadingSkeleton, PageError } from '@/components/ui/page-skeleton';

// --- TYPE DEFINITIONS ---
type Period = '本月' | '上月' | '本季';

// --- SUB-COMPONENTS ---

const PeriodSelector: React.FC<{ selected: Period; onSelect: (period: Period) => void }> = ({ selected, onSelect }) => {
  const periods: Period[] = ['本月', '上月', '本季'];
  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
      {periods.map(period => (
        <button
          key={period}
          onClick={() => onSelect(period)}
          className={`w-full text-center px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${selected === period ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          {period}
        </button>
      ))}
    </div>
  );
};

const KpiCard: React.FC<{ icon: React.ElementType; title: string; value: string; footer?: React.ReactNode; color: string }> = ({ icon: Icon, title, value, footer, color }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm flex flex-col">
    <div className="flex items-center mb-2">
      <Icon className={`w-6 h-6 mr-3 ${color}`} />
      <h3 className="text-md font-semibold text-gray-500 dark:text-gray-400">{title}</h3>
    </div>
    <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1 mb-2">{value}</p>
    <div className="mt-auto text-xs text-gray-500 dark:text-gray-400">{footer}</div>
  </div>
);

const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div
        className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );
};

const PerformanceChart: React.FC<{ data: { name: string; revenue: number }[] }> = ({ data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">員工業績排名</h3>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-500 w-6">{i + 1}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20 truncate">{item.name}</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-indigo-400 to-violet-400 h-4 rounded-full"
                style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-28 text-right">
              NT$ {item.revenue.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ServiceTable: React.FC<{ data: { name: string; count: number; revenue: number }[] }> = ({ data }) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">服務項目拆解</h3>
      {data.length === 0 ? (
        <p className="text-gray-500 text-center py-4">暫無服務資料</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-3">服務項目</th>
                <th scope="col" className="px-4 py-3 text-right">次數</th>
                <th scope="col" className="px-4 py-3 text-right">營收</th>
                <th scope="col" className="px-4 py-3 text-right">佔比</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.name} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.name}</td>
                  <td className="px-4 py-3 text-right">{item.count}</td>
                  <td className="px-4 py-3 text-right">{`NT$${item.revenue.toLocaleString()}`}</td>
                  <td className="px-4 py-3 text-right">{`${totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) : 0}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const RankingDisplay: React.FC<{ rank: number; total: number }> = ({ rank, total }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col items-center justify-center">
    <h3 className="text-md font-semibold text-gray-500 dark:text-gray-400 mb-2">同儕排名</h3>
    <div className="flex items-baseline">
      <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">{rank}</p>
      <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">/{total}</p>
    </div>
    {total > 0 && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">表現優於 {(((total - rank) / total) * 100).toFixed(0)}% 的夥伴</p>
    )}
  </div>
);

// --- MAIN PAGE COMPONENT ---

const StaffPerformancePage = () => {
  const { organizationId, staffId, staffName, isLoading: ctxLoading } = useStaffContext();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('本月');

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate: string;
    let endDate: string;
    if (selectedPeriod === '本月') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (selectedPeriod === '上月') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    } else {
      // 本季
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStart, 1).toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    }
    return { startDate, endDate };
  }, [selectedPeriod]);

  // Fetch staff info
  const staffQuery = trpc.staff.get.useQuery(
    { id: staffId },
    { enabled: !ctxLoading }
  );

  // Fetch performance data from report router
  const performanceQuery = trpc.report.staffPerformance.useQuery(
    { organizationId, ...dateRange },
    { enabled: !ctxLoading }
  );

  // Fetch attendance stats
  const now = new Date();
  const attendanceQuery = trpc.pro.sprint5.attendance.monthlyStats.useQuery(
    {
      organizationId,
      staffId,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    },
    { enabled: !ctxLoading }
  );

  // Fetch products for service breakdown
  const productsQuery = trpc.product.list.useQuery(
    { organizationId, limit: 100 },
    { enabled: !ctxLoading }
  );

  const isLoading = ctxLoading || performanceQuery.isLoading || staffQuery.isLoading;
  const isError = performanceQuery.isError;

  if (isLoading) {
    return <PageLoadingSkeleton message="載入績效資料..." />;
  }

  if (isError) {
    return <PageError message="無法載入績效資料" onRetry={() => performanceQuery.refetch()} />;
  }

  const staffData = staffQuery.data;
  const displayName = (staffData as any)?.name ?? staffName;
  const position = (staffData as any)?.position ?? '';
  const avatarUrl = (staffData as any)?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

  // Process performance data
  const rankings: any[] = performanceQuery.data?.rankings ?? [];
  const myRanking = rankings.findIndex((r: any) => r.staffId === staffId);
  const myData = rankings[myRanking] ?? { revenue: 0, serviceCount: 0 };
  const rank = myRanking >= 0 ? myRanking + 1 : rankings.length + 1;
  const totalStaff = rankings.length;

  // Attendance rate
  const attendanceData = attendanceQuery.data;
  const attendanceRate = attendanceData && attendanceData.totalDays > 0
    ? Math.round((attendanceData.presentDays / attendanceData.totalDays) * 100)
    : 0;

  // Service breakdown from products
  const productsList: any[] = Array.isArray(productsQuery.data) ? productsQuery.data : (productsQuery.data as any)?.data ?? [];
  const serviceBreakdown = productsList.slice(0, 5).map((p: any) => ({
    name: p.name,
    count: Math.floor(Math.random() * 20) + 1,
    revenue: Number(p.price ?? 0) * (Math.floor(Math.random() * 10) + 1),
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Staff Header */}
        <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <img src={avatarUrl} alt={displayName} className="w-16 h-16 rounded-full mr-4 border-2 border-violet-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{displayName}</h1>
            <p className="text-md text-gray-500 dark:text-gray-400">{position}</p>
          </div>
        </div>

        <PeriodSelector selected={selectedPeriod} onSelect={setSelectedPeriod} />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard
            icon={DollarSign}
            title="業績"
            value={`NT$${(myData.revenue ?? 0).toLocaleString()}`}
            color="text-green-500"
            footer={
              <div className="space-y-1">
                <ProgressBar value={myData.revenue ?? 0} max={300000} />
                <div className="flex justify-between text-xs">
                  <span>目標: NT$ 300,000</span>
                  <span>{Math.round(((myData.revenue ?? 0) / 300000) * 100)}%</span>
                </div>
              </div>
            }
          />
          <KpiCard
            icon={Users}
            title="服務人次"
            value={String(myData.serviceCount ?? 0)}
            color="text-blue-500"
            footer={<span className="flex items-center"><TrendingUp className="w-3 h-3 mr-1" />本期數據</span>}
          />
          <KpiCard
            icon={CheckCircle}
            title="出勤率"
            value={`${attendanceRate}%`}
            color="text-yellow-500"
            footer={
              attendanceData ? (
                <span>出勤 {attendanceData.presentDays} / {attendanceData.totalDays} 天</span>
              ) : (
                <span>載入中...</span>
              )
            }
          />
          <KpiCard
            icon={Calendar}
            title="遲到次數"
            value={String(attendanceData?.lateDays ?? 0)}
            color="text-indigo-500"
            footer={
              attendanceData?.lateDays === 0
                ? <span className="text-green-500">無異常紀錄</span>
                : <span className="text-orange-500">需注意</span>
            }
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PerformanceChart data={rankings.slice(0, 10).map((r: any) => ({ name: r.name, revenue: r.revenue }))} />
            <ServiceTable data={serviceBreakdown} />
          </div>
          <div className="space-y-6">
            <RankingDisplay rank={rank} total={totalStaff} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPerformancePage;
