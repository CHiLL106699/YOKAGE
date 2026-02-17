
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Star, Award, TrendingUp, Users, DollarSign, Calendar, Target, CheckCircle } from 'lucide-react';

// --- TYPE DEFINITIONS ---
type Period = '本月' | '上月' | '本季';

type KpiData = {
  revenue: number;
  revenueTarget: number;
  serviceCount: number;
  satisfaction: number;
  attendanceRate: number;
};

type MonthlyPerformance = {
  month: string;
  revenue: number;
};

type ServiceBreakdown = {
  id: string;
  name: string;
  count: number;
  revenue: number;
};

type Achievement = {
  id: string;
  name: string;
  icon: React.ElementType;
  date: string;
};

type StaffPerformanceData = {
  kpis: KpiData;
  monthlyTrend: MonthlyPerformance[];
  serviceBreakdown: ServiceBreakdown[];
  peerRanking: {
    rank: number;
    total: number;
  };
  achievements: Achievement[];
};

// --- MOCK DATA ---
const mockData: Record<Period, StaffPerformanceData> = {
  '本月': {
    kpis: {
      revenue: 280000,
      revenueTarget: 300000,
      serviceCount: 45,
      satisfaction: 4.8,
      attendanceRate: 98,
    },
    monthlyTrend: [
      { month: '3月', revenue: 220000 },
      { month: '4月', revenue: 250000 },
      { month: '5月', revenue: 230000 },
      { month: '6月', revenue: 270000 },
      { month: '7月', revenue: 260000 },
      { month: '8月', revenue: 280000 },
    ],
    serviceBreakdown: [
      { id: 's1', name: '造型剪髮', count: 20, revenue: 40000 },
      { id: 's2', name: '染髮', count: 10, revenue: 150000 },
      { id: 's3', name: '護髮', count: 15, revenue: 90000 },
    ],
    peerRanking: { rank: 3, total: 12 },
    achievements: [
      { id: 'a1', name: '業績冠軍', icon: Award, date: '2026-06' },
      { id: 'a2', name: '滿分好評', icon: Star, date: '2026-05' },
    ],
  },
  '上月': {
    kpis: {
      revenue: 260000,
      revenueTarget: 300000,
      serviceCount: 42,
      satisfaction: 4.7,
      attendanceRate: 99,
    },
    monthlyTrend: [
        { month: '2月', revenue: 210000 },
        { month: '3月', revenue: 220000 },
        { month: '4月', revenue: 250000 },
        { month: '5月', revenue: 230000 },
        { month: '6月', revenue: 270000 },
        { month: '7月', revenue: 260000 },
    ],
    serviceBreakdown: [
      { id: 's1', name: '造型剪髮', count: 18, revenue: 36000 },
      { id: 's2', name: '染髮', count: 9, revenue: 135000 },
      { id: 's3', name: '護髮', count: 15, revenue: 89000 },
    ],
    peerRanking: { rank: 4, total: 12 },
    achievements: [
      { id: 'a1', name: '業績冠軍', icon: Award, date: '2026-06' },
    ],
  },
  '本季': {
    kpis: {
      revenue: 790000,
      revenueTarget: 900000,
      serviceCount: 130,
      satisfaction: 4.75,
      attendanceRate: 98.5,
    },
    monthlyTrend: [
        { month: '3月', revenue: 220000 },
        { month: '4月', revenue: 250000 },
        { month: '5月', revenue: 230000 },
        { month: '6月', revenue: 270000 },
        { month: '7月', revenue: 260000 },
        { month: '8月', revenue: 280000 },
    ],
    serviceBreakdown: [
      { id: 's1', name: '造型剪髮', count: 55, revenue: 110000 },
      { id: 's2', name: '染髮', count: 30, revenue: 450000 },
      { id: 's3', name: '護髮', count: 45, revenue: 230000 },
    ],
    peerRanking: { rank: 2, total: 12 },
    achievements: [
        { id: 'a1', name: '業績冠軍', icon: Award, date: '2026-06' },
        { id: 'a2', name: '滿分好評', icon: Star, date: '2026-05' },
        { id: 'a3', name: '季度之星', icon: Award, date: '2026-Q2' },
    ],
  },
};

const staffInfo = {
    name: '林小花',
    title: '資深設計師',
    avatarUrl: 'https://i.pravatar.cc/150?u=staff01'
}

// --- SUB-COMPONENTS ---

const StaffHeader = () => (
    <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
        <img src={staffInfo.avatarUrl} alt={staffInfo.name} className="w-16 h-16 rounded-full mr-4 border-2 border-violet-300" />
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{staffInfo.name}</h1>
            <p className="text-md text-gray-500 dark:text-gray-400">{staffInfo.title}</p>
        </div>
    </div>
);

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
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

const StarRating: React.FC<{ rating: number; max?: number }> = ({ rating, max = 5 }) => (
    <div className="flex items-center">
        {[...Array(max)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" />
        ))}
    </div>
);

const PerformanceChart: React.FC<{ data: MonthlyPerformance[] }> = ({ data }) => {
    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">月度業績趨勢</h3>
            <div className="flex justify-between items-end h-48 space-x-2 md:space-x-4">
                {data.map(item => (
                    <div key={item.month} className="flex-1 flex flex-col items-center">
                        <div className="w-full h-full flex items-end">
                            <div
                                className="w-full bg-gradient-to-t from-indigo-400 to-violet-400 rounded-t-md hover:opacity-80 transition-opacity"
                                style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{item.month}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ServiceTable: React.FC<{ data: ServiceBreakdown[] }> = ({ data }) => {
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">服務項目拆解</h3>
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
                            <tr key={item.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.name}</td>
                                <td className="px-4 py-3 text-right">{item.count}</td>
                                <td className="px-4 py-3 text-right">{`NT$${item.revenue.toLocaleString()}`}</td>
                                <td className="px-4 py-3 text-right">{`${totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) : 0}%`}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">表現優於 {(((total - rank) / total) * 100).toFixed(0)}% 的夥伴</p>
    </div>
);

const AchievementsList: React.FC<{ achievements: Achievement[] }> = ({ achievements }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">成就徽章</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {achievements.map(({ id, name, icon: Icon, date }) => (
                <div key={id} className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900 dark:to-violet-900 rounded-full mb-2">
                        <Icon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{date}</p>
                </div>
            ))}
        </div>
    </div>
);

// --- MAIN PAGE COMPONENT ---

const StaffPerformancePage = () => {
    const [location, setLocation] = useLocation();
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('本月');
    const [data, setData] = useState<StaffPerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        // Simulate API call
        const timer = setTimeout(() => {
            try {
                const fetchedData = mockData[selectedPeriod];
                if (!fetchedData) {
                    throw new Error('No data available for the selected period.');
                }
                setData(fetchedData);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An unknown error occurred.');
            }
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [selectedPeriod]);

    const kpis = data?.kpis;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Loading Performance Data...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
                    <p className="text-gray-600 dark:text-gray-300">{error || 'Failed to load data.'}</p>
                    <button onClick={() => setSelectedPeriod('本月')} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <StaffHeader />
                <PeriodSelector selected={selectedPeriod} onSelect={setSelectedPeriod} />

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {kpis && (
                        <>
                            <KpiCard
                                icon={DollarSign}
                                title="本月業績"
                                value={`NT$${kpis.revenue.toLocaleString()}`}
                                color="text-green-500"
                                footer={
                                    <div className='space-y-1'>
                                        <ProgressBar value={kpis.revenue} max={kpis.revenueTarget} />
                                        <div className='flex justify-between text-xs'>
                                            <span>目標: NT$ {kpis.revenueTarget.toLocaleString()}</span>
                                            <span>{((kpis.revenue / kpis.revenueTarget) * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                }
                            />
                            <KpiCard
                                icon={Users}
                                title="服務人次"
                                value={kpis.serviceCount.toString()}
                                color="text-blue-500"
                                footer={<span className='flex items-center'><TrendingUp className='w-3 h-3 mr-1'/>較上月 +3</span>}
                            />
                            <KpiCard
                                icon={CheckCircle}
                                title="客戶滿意度"
                                value={`${kpis.satisfaction}/5`}
                                color="text-yellow-500"
                                footer={<StarRating rating={kpis.satisfaction} />}
                            />
                            <KpiCard
                                icon={Calendar}
                                title="出勤率"
                                value={`${kpis.attendanceRate}%`}
                                color="text-indigo-500"
                                footer={<span className='text-green-500'>無異常紀錄</span>}
                            />
                        </>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <PerformanceChart data={data.monthlyTrend} />
                        <ServiceTable data={data.serviceBreakdown} />
                    </div>
                    <div className="space-y-6">
                        <RankingDisplay rank={data.peerRanking.rank} total={data.peerRanking.total} />
                        <AchievementsList achievements={data.achievements} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffPerformancePage;
