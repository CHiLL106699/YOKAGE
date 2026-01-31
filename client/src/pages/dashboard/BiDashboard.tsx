import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, PieChart, Download } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const BiDashboard: React.FC = () => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const exportCsvMutation = trpc.biExport.exportCsv.useMutation();
  const exportPdfMutation = trpc.biExport.exportPdf.useMutation();

  const handleExportCsv = async (dataType: 'revenue' | 'appointments' | 'customers') => {
    setIsExporting(true);
    try {
      const result = await exportCsvMutation.mutateAsync({
        organizationId: 1, // TODO: 從 context 取得
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        dataType,
      });

      // 建立 Blob 並下載
      const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = result.filename;
      link.click();

      toast({
        title: '匯出成功',
        description: `已成功匯出 ${result.filename}`,
      });
      setIsExportDialogOpen(false);
    } catch (error) {
      toast({
        title: '匯出失敗',
        description: '請稍後再試',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const result = await exportPdfMutation.mutateAsync({
        organizationId: 1, // TODO: 從 context 取得
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      // TODO: 使用 jsPDF 生成 PDF
      toast({
        title: 'PDF 匯出功能開發中',
        description: '此功能即將推出',
      });
      setIsExportDialogOpen(false);
    } catch (error) {
      toast({
        title: '匯出失敗',
        description: '請稍後再試',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">智慧營運分析 (BI)</h1>
          <p className="mt-1 text-sm text-gray-500">即時掌握診所營運狀況與關鍵績效指標</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">統計區間:</span>
          <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border bg-white">
            <option>本月</option>
            <option>上月</option>
            <option>本季</option>
            <option>今年</option>
          </select>
          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>匯出報表</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>匯出報表</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">CSV 格式</h4>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => handleExportCsv('revenue')}
                      disabled={isExporting}
                    >
                      匯出營收數據
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportCsv('appointments')}
                      disabled={isExporting}
                    >
                      匯出預約數據
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportCsv('customers')}
                      disabled={isExporting}
                    >
                      匯出客戶數據
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">PDF 格式</h4>
                  <Button
                    variant="outline"
                    onClick={handleExportPdf}
                    disabled={isExporting}
                    className="w-full"
                  >
                    匯出完整報表（含圖表）
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">總營收</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">NT$ 2,845,000</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                12.5%
              </span>
              <span className="text-gray-500"> vs 上月</span>
            </div>
          </div>
        </div>

        {/* New Customers */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">新客數</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">128 人</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                5.2%
              </span>
              <span className="text-gray-500"> vs 上月</span>
            </div>
          </div>
        </div>

        {/* Appointments */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">預約數</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">450 診次</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-red-600 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                2.1%
              </span>
              <span className="text-gray-500"> vs 上月</span>
            </div>
          </div>
        </div>

        {/* Avg Transaction */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">平均客單價</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">NT$ 6,320</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                8.4%
              </span>
              <span className="text-gray-500"> vs 上月</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section (Mockups) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">營收趨勢分析</h3>
          <div className="h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center relative">
             {/* Simple CSS Bar Chart Mockup */}
             <div className="flex items-end space-x-4 h-40 w-full px-10 justify-between">
                <div className="w-8 bg-blue-200 h-[40%] rounded-t"></div>
                <div className="w-8 bg-blue-300 h-[60%] rounded-t"></div>
                <div className="w-8 bg-blue-400 h-[50%] rounded-t"></div>
                <div className="w-8 bg-blue-500 h-[80%] rounded-t"></div>
                <div className="w-8 bg-blue-600 h-[70%] rounded-t"></div>
                <div className="w-8 bg-indigo-600 h-[90%] rounded-t"></div>
             </div>
             <span className="absolute text-gray-400 text-sm">營收長條圖預覽</span>
          </div>
        </div>

        {/* Treatment Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">熱門療程佔比</h3>
          <div className="h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center relative">
             <PieChart className="h-32 w-32 text-gray-300" />
             <span className="absolute text-gray-400 text-sm mt-20">圓餅圖預覽</span>
          </div>
        </div>
      </div>

      {/* Top Performing Treatments Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">本月熱銷療程排行</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">療程名稱</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">銷售數量</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">總營收貢獻</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成長率</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { rank: 1, name: '皮秒雷射', count: 150, revenue: 'NT$ 450,000', growth: '+15%' },
                { rank: 2, name: '肉毒桿菌除皺', count: 120, revenue: 'NT$ 360,000', growth: '+8%' },
                { rank: 3, name: '玻尿酸填充', count: 85, revenue: 'NT$ 850,000', growth: '+12%' },
                { rank: 4, name: '海菲秀', count: 60, revenue: 'NT$ 120,000', growth: '-5%' },
                { rank: 5, name: '鳳凰電波', count: 15, revenue: 'NT$ 900,000', growth: '+20%' },
              ].map((item) => (
                <tr key={item.rank}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.rank}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.revenue}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${item.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {item.growth}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BiDashboard;
