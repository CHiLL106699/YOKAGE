import { useState } from 'react';
import { TrendingUp, Award, DollarSign, Users, Target, BarChart3 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';

const organizationId = 1; // TODO: from context
const staffId = 1; // TODO: from auth context

export default function StaffPerformancePage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const { data: summary, isLoading: summaryLoading } =
    (trpc as any).commission.getStaffSummary.useQuery(
      { organizationId, staffId },
      { enabled: !!staffId }
    );

  const { data: leaderboard, isLoading: lbLoading } =
    (trpc as any).commission.getLeaderboard.useQuery(
      { organizationId },
      { enabled: !!organizationId }
    );

  const { data: statsData } =
    (trpc as any).commission.getSummaryStats.useQuery(
      { organizationId },
      { enabled: !!organizationId }
    );

  const kpis = [
    { label: '本月業績', value: summary?.totalRevenue ? `NT$${Number(summary.totalRevenue).toLocaleString()}` : 'NT$0', icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: '服務客戶數', value: summary?.customerCount ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: '完成預約', value: summary?.appointmentCount ?? 0, icon: Target, color: 'text-purple-600 bg-purple-50' },
    { label: '佣金收入', value: summary?.totalCommission ? `NT$${Number(summary.totalCommission).toLocaleString()}` : 'NT$0', icon: Award, color: 'text-amber-600 bg-amber-50' },
  ];

  const leaders = Array.isArray(leaderboard?.data) ? leaderboard.data : Array.isArray(leaderboard) ? leaderboard : [];

  return (
    <DashboardLayout title="績效中心">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          {(['week', 'month', 'quarter'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p ? 'bg-indigo-500 text-white shadow' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              {p === 'week' ? '本週' : p === 'month' ? '本月' : '本季'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${kpi.color}`}>
                  <kpi.icon size={20} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {summaryLoading ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-24 rounded"></div>
                ) : kpi.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-500" /> 團隊排行榜
          </h3>
          {lbLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
            </div>
          ) : leaders.length === 0 ? (
            <p className="text-center text-gray-400 py-8">尚無排行資料</p>
          ) : (
            <div className="space-y-3">
              {leaders.map((member: any, idx: number) => {
                const isMe = member.staffId === staffId || member.staff_id === staffId;
                const rank = idx + 1;
                const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-700'];
                return (
                  <div
                    key={member.staffId || member.staff_id || idx}
                    className={`flex items-center justify-between py-3 px-4 rounded-lg ${
                      isMe ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                        rank <= 3 ? `${medalColors[rank - 1]} bg-gray-100 dark:bg-gray-700` : 'text-gray-500 bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {rank <= 3 ? ['\u{1F947}', '\u{1F948}', '\u{1F949}'][rank - 1] : rank}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {member.staffName || member.staff_name || `員工 #${member.staffId || member.staff_id}`}
                          {isMe && <span className="ml-2 text-xs text-indigo-600 font-semibold">（我）</span>}
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.appointmentCount || member.appointment_count || 0} 筆預約
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">
                        NT${Number(member.totalRevenue || member.total_revenue || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        佣金 NT${Number(member.totalCommission || member.total_commission || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {statsData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" /> 整體統計
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  NT${Number(statsData.totalRevenue || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">總營收</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  NT${Number(statsData.totalCommission || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">總佣金</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {statsData.staffCount || 0}
                </div>
                <div className="text-sm text-gray-500">活躍員工</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
