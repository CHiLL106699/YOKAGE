import React, { useState, useMemo } from 'react';
import { ChevronDown, Clock, Scissors, Calendar, Phone, FileText, Search, Filter } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const organizationId = 1; // TODO: from context
const staffId = 1; // TODO: from auth context

type AppointmentStatus = '待接待' | '進行中' | '已完成' | '已取消';

const statusColors: Record<string, string> = {
  '待接待': 'bg-blue-100 text-blue-800',
  '進行中': 'bg-yellow-100 text-yellow-800',
  '已完成': 'bg-green-100 text-green-800',
  '已取消': 'bg-gray-100 text-gray-800',
  'pending': 'bg-blue-100 text-blue-800',
  'confirmed': 'bg-blue-100 text-blue-800',
  'in_progress': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  pending: '待接待',
  confirmed: '已確認',
  in_progress: '進行中',
  completed: '已完成',
  cancelled: '已取消',
  no_show: '未到',
};

const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex-1 text-center">
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const StaffAppointmentsPage = () => {
  const [activeFilter, setActiveFilter] = useState<string>('today');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const { data: appointmentsData, isLoading, error, refetch } = trpc.appointment.list.useQuery(
    { organizationId, staffId, limit: 50, date: today },
    { enabled: !!organizationId }
  );

  const updateMutation = trpc.appointment.update.useMutation({
    onSuccess: () => { toast.success('狀態已更新'); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });

  const appointments = useMemo(() => {
    const raw = appointmentsData?.data ?? [];
    return raw.map((a: any) => ({
      id: a.id,
      time: a.startTime || '09:00',
      customerName: a.customerName || `客戶 #${a.customerId}`,
      customerPhone: a.customerPhone || '',
      service: a.productName || '一般診療',
      duration: a.duration || 60,
      status: statusLabels[a.status] || a.status || '待接待',
      rawStatus: a.status || 'pending',
      notes: a.notes || '',
      historyCount: a.historyCount || 0,
    }));
  }, [appointmentsData]);

  const filtered = useMemo(() => {
    if (!searchTerm) return appointments;
    return appointments.filter((a: any) =>
      a.customerName.includes(searchTerm) || a.service.includes(searchTerm)
    );
  }, [appointments, searchTerm]);

  const completedCount = filtered.filter((a: any) => a.rawStatus === 'completed').length;
  const inProgressCount = filtered.filter((a: any) => a.rawStatus === 'in_progress' || a.rawStatus === 'confirmed').length;
  const pendingCount = filtered.filter((a: any) => a.rawStatus === 'pending').length;

  const handleStatusUpdate = (id: number, newStatus: string) => {
    updateMutation.mutate({ id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 text-red-500">錯誤: {error.message}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Scissors className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">我的預約</h1>
                <p className="text-sm text-gray-500">今日預約總覽</p>
              </div>
            </div>
            <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
              YOKAGE
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="今日總預約" value={filtered.length} color="text-gray-800" />
          <StatCard title="已完成" value={completedCount} color="text-green-600" />
          <StatCard title="進行中" value={inProgressCount} color="text-yellow-600" />
          <StatCard title="待接待" value={pendingCount} color="text-blue-600" />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center bg-white rounded-lg shadow-sm p-1">
            {['today', 'tomorrow', 'this week'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeFilter === filter ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {filter === 'today' ? '今天' : filter === 'tomorrow' ? '明天' : '本週'}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋顧客..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg shadow-sm w-full md:w-auto"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-400">
              <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
              <p>目前沒有預約資料</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filtered.map((app: any) => (
                <li key={app.id} className="relative">
                  <div className="absolute top-0 left-4 h-full border-l-2 border-gray-200"></div>
                  <div
                    className="px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative z-10">
                        <div className="h-4 w-4 bg-indigo-500 rounded-full"></div>
                      </div>
                      <div className="flex-shrink-0 w-16 text-gray-700 font-medium">{app.time}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-md font-semibold text-gray-900 truncate">{app.customerName}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
                          <div className="flex items-center"><Scissors className="h-4 w-4 mr-1" /><span>{app.service}</span></div>
                          <div className="flex items-center"><Clock className="h-4 w-4 mr-1" /><span>{app.duration} 分鐘</span></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[app.status] || statusColors[app.rawStatus] || 'bg-gray-100 text-gray-800'}`}>
                          {app.status}
                        </span>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedId === app.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {expandedId === app.id && (
                    <div className="px-4 pb-4 sm:px-6 sm:pl-16 bg-gray-50">
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          {app.customerPhone && (
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{app.customerPhone}</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span>歷史消費: {app.historyCount} 次</span>
                          </div>
                          {app.notes && (
                            <div className="flex items-start text-gray-600 sm:col-span-2">
                              <FileText className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                              <span>備註: {app.notes}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-end space-x-3">
                          {(app.rawStatus === 'pending' || app.rawStatus === 'confirmed') && (
                            <button onClick={() => handleStatusUpdate(app.id, 'in_progress')} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                              開始服務
                            </button>
                          )}
                          {app.rawStatus === 'in_progress' && (
                            <button onClick={() => handleStatusUpdate(app.id, 'completed')} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                              完成服務
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default StaffAppointmentsPage;
