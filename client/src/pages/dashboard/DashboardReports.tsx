import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BarChart3, Users, TrendingUp, Clock, FileText } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';

const organizationId = 1; // TODO: from context

const SimpleBarChart: React.FC<{ data: { label: string; value: number; color?: string }[]; title: string }> = ({ data, title }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <Card className="report-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.length === 0 ? (
          <p className="text-center text-gray-400 py-4 text-sm">暫無數據</p>
        ) : (
          data.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 w-16 truncate">{item.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(item.value / maxVal) * 100}%`,
                    backgroundColor: item.color || '#6366f1',
                  }}
                />
              </div>
              <span className="text-xs font-medium w-10 text-right">{item.value}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

const DashboardReports: React.FC = () => {
  const { data: reportData, isLoading, error } = trpc.report.stats.useQuery({ organizationId });

  if (isLoading) {
    return (
      <DashboardLayout title="報表分析">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="報表分析">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error.message}</div>
      </DashboardLayout>
    );
  }

  const genderData = (reportData?.genderDistribution || []).map((d: any) => ({ label: d.name || d.label, value: d.value || d.count, color: '#8b5cf6' }));
  const ageData = (reportData?.ageDistribution || []).map((d: any) => ({ label: d.name || d.label, value: d.value || d.count, color: '#06b6d4' }));
  const educationData = (reportData?.educationDistribution || []).map((d: any) => ({ label: d.name || d.label, value: d.value || d.count, color: '#f59e0b' }));
  const departmentData = (reportData?.departmentDistribution || []).map((d: any) => ({ label: d.name || d.label, value: d.value || d.count, color: '#10b981' }));
  const hiringData = (reportData?.hiringAttritionTrend || []).map((d: any) => ({ label: d.month || d.label, value: d.hired || d.value, color: '#3b82f6' }));
  const performanceData = (reportData?.performanceAnalysis || []).map((d: any) => ({ label: d.name || d.label, value: d.score || d.value, color: '#ec4899' }));
  const attendanceData = (reportData?.attendanceStatistics || []).map((d: any) => ({ label: d.name || d.label, value: d.rate || d.value, color: '#14b8a6' }));

  // Summary stats
  const totalStaff = genderData.reduce((s: number, d: any) => s + d.value, 0) || 0;

  return (
    <DashboardLayout title="報表分析">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400">人事統計分析報表</p>
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" /> 匯出報表
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="mx-auto mb-2 text-indigo-500" size={24} />
              <div className="text-2xl font-bold">{totalStaff}</div>
              <div className="text-xs text-gray-500">總員工數</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="mx-auto mb-2 text-green-500" size={24} />
              <div className="text-2xl font-bold">{hiringData.length}</div>
              <div className="text-xs text-gray-500">招聘月份</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="mx-auto mb-2 text-blue-500" size={24} />
              <div className="text-2xl font-bold">{departmentData.length}</div>
              <div className="text-xs text-gray-500">部門數</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="mx-auto mb-2 text-amber-500" size={24} />
              <div className="text-2xl font-bold">{attendanceData.length}</div>
              <div className="text-xs text-gray-500">出勤統計項</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div id="hr-reports-content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SimpleBarChart title="性別分佈" data={genderData} />
            <SimpleBarChart title="年齡分佈" data={ageData} />
            <SimpleBarChart title="學歷分佈" data={educationData} />
            <SimpleBarChart title="部門分佈" data={departmentData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SimpleBarChart title="招聘與離職趨勢" data={hiringData} />
            <SimpleBarChart title="績效分析" data={performanceData} />
          </div>

          <SimpleBarChart title="出勤統計" data={attendanceData} />
        </div>

        {/* No data fallback */}
        {!reportData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <FileText className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-400">尚未產生報表數據</p>
            <p className="text-sm text-gray-400 mt-1">當系統有足夠的營運資料後，報表將自動生成</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardReports;
