
import { Link } from 'wouter';
import { BarChart, ChevronRight, DollarSign, Users, Star } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

// Mock Data
const performanceData = {
  monthlyRevenue: 7250,
  appointmentCount: 85,
  customerSatisfaction: 4.8,
};

const commissionBreakdown = [
  { id: 'SRV-001', service: '深層組織按摩', date: '2026-02-15', amount: 120, commission: 30 },
  { id: 'SRV-002', service: '臉部保濕護理', date: '2026-02-14', amount: 80, commission: 20 },
  { id: 'SRV-003', service: '熱石療法', date: '2026-02-14', amount: 150, commission: 37.5 },
  { id: 'SRV-004', service: '身體磨砂', date: '2026-02-12', amount: 95, commission: 23.75 },
  { id: 'SRV-005', service: '瑞典式按摩', date: '2026-02-11', amount: 110, commission: 27.5 },
];

const StaffPerformance = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
              <li><Link to="/staff" className="hover:text-foreground">員工儀表板</Link></li>
              <li><ChevronRight className="h-4 w-4" /></li>
              <li><span className="text-foreground">個人業績</span></li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight mt-2">個人業績</h1>
          <p className="text-muted-foreground">Hi {user?.name}, 這是您本月的業績總覽。</p>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium tracking-tight">本月總營收</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">${performanceData.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">較上月增長 +12.5%</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium tracking-tight">預約服務數</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">+{performanceData.appointmentCount}</div>
            <p className="text-xs text-muted-foreground">共完成 {performanceData.appointmentCount - 5} 次服務</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium tracking-tight">顧客滿意度</h3>
            <Star className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{performanceData.customerSatisfaction}/5.0</div>
            <p className="text-xs text-muted-foreground">基於 25 則評論</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Monthly Trend Chart */}
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold">業績趨勢</h3>
            <p className="text-sm text-muted-foreground mb-4">過去六個月的營收變化</p>
            <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
              <div className="text-center">
                <BarChart className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">圖表數據加載中...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Breakdown Table */}
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold">近期抽成明細</h3>
            <p className="text-sm text-muted-foreground mb-4">最近 5 筆服務的抽成記錄。</p>
            <div className="-mx-6">
              <table className="w-full text-sm">
                <thead className="border-b border-border/50">
                  <tr className="text-muted-foreground">
                    <th className="px-6 py-3 text-left font-medium">服務項目</th>
                    <th className="px-6 py-3 text-left font-medium">日期</th>
                    <th className="px-6 py-3 text-right font-medium">抽成</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionBreakdown.map((item) => (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="px-6 py-4 font-medium">{item.service}</td>
                      <td className="px-6 py-4 text-muted-foreground">{item.date}</td>
                      <td className="px-6 py-4 text-right font-mono text-green-500">+${item.commission.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPerformance;
