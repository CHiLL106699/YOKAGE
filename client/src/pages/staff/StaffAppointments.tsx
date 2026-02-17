import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { ChevronDown, Clock, User, Scissors, Calendar, Phone, FileText, MoreVertical, Search, Filter } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useStaffContext } from '@/hooks/useStaffContext';
import { PageLoadingSkeleton, PageError, ListItemSkeleton } from '@/components/ui/page-skeleton';

type AppointmentStatus = '待接待' | '進行中' | '已完成' | '已取消';

const statusMap: Record<string, AppointmentStatus> = {
  pending: '待接待',
  confirmed: '待接待',
  arrived: '待接待',
  in_progress: '進行中',
  completed: '已完成',
  cancelled: '已取消',
  no_show: '已取消',
};

const reverseStatusMap: Record<AppointmentStatus, string> = {
  '待接待': 'confirmed',
  '進行中': 'in_progress',
  '已完成': 'completed',
  '已取消': 'cancelled',
};

const statusColors: Record<AppointmentStatus, string> = {
  '待接待': 'bg-blue-100 text-blue-800',
  '進行中': 'bg-yellow-100 text-yellow-800',
  '已完成': 'bg-green-100 text-green-800',
  '已取消': 'bg-gray-100 text-gray-800',
};

const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex-1 text-center">
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const StaffAppointmentsPage = () => {
  const { organizationId, staffId, staffName, isLoading: ctxLoading } = useStaffContext();
  const [activeFilter, setActiveFilter] = useState<string>('today');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const dateRange = activeFilter === 'today'
    ? { startDate: today, endDate: today }
    : activeFilter === 'tomorrow'
      ? { startDate: tomorrow, endDate: tomorrow }
      : { startDate: today, endDate: weekEnd };

  // We use the flat appointment router which has list with staffId filter
  const appointmentsQuery = trpc.appointment.list.useQuery(
    { organizationId, staffId, ...dateRange },
    { enabled: !ctxLoading }
  );

  const updateMutation = trpc.appointment.update.useMutation({
    onSuccess: () => {
      appointmentsQuery.refetch();
    },
  });

  const rawData = appointmentsQuery.data;
  const rawList: any[] = Array.isArray(rawData) ? rawData : (rawData as any)?.data ?? [];

  // Map to display format
  const appointments = rawList.map((apt: any) => ({
    id: String(apt.id),
    time: apt.startTime?.substring(0, 5) ?? '--:--',
    customerName: apt.customerName ?? `客戶 #${apt.customerId}`,
    customerPhone: apt.customerPhone ?? '',
    service: apt.productName ?? '服務',
    duration: apt.duration ?? 60,
    status: statusMap[apt.status ?? 'pending'] ?? '待接待',
    rawStatus: apt.status,
    notes: apt.notes ?? '',
    historyCount: 0,
  }));

  // Filter by search
  const filtered = searchTerm
    ? appointments.filter(a =>
        a.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.customerPhone.includes(searchTerm)
      )
    : appointments;

  const handleStatusUpdate = (id: string, newStatus: AppointmentStatus) => {
    const apiStatus = reverseStatusMap[newStatus];
    if (!apiStatus) return;
    updateMutation.mutate({
      id: Number(id),
      status: apiStatus as any,
    });
  };

  const completedCount = filtered.filter(a => a.status === '已完成').length;
  const inProgressCount = filtered.filter(a => a.status === '進行中').length;
  const pendingCount = filtered.filter(a => a.status === '待接待').length;

  if (ctxLoading || appointmentsQuery.isLoading) {
    return <PageLoadingSkeleton message="載入預約資料..." />;
  }

  if (appointmentsQuery.isError) {
    return <PageError message="無法載入預約資料" onRetry={() => appointmentsQuery.refetch()} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Staff Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img className="h-10 w-10 rounded-full" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(staffName)}&background=6366f1&color=fff`} alt="Staff" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{staffName}</h1>
                <p className="text-sm text-gray-500">
                  {activeFilter === 'today' ? '今日' : activeFilter === 'tomorrow' ? '明日' : '本週'}預約總覽
                </p>
              </div>
            </div>
            <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
              YOChiLL
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="總預約" value={filtered.length} color="text-gray-800" />
          <StatCard title="已完成" value={completedCount} color="text-green-600" />
          <StatCard title="進行中" value={inProgressCount} color="text-yellow-600" />
          <StatCard title="待接待" value={pendingCount} color="text-blue-600" />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center bg-white rounded-lg shadow-sm p-1">
            {['today', 'tomorrow', 'this week'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeFilter === filter ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {filter === 'today' && '今天'}
                {filter === 'tomorrow' && '明天'}
                {filter === 'this week' && '本週'}
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

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>目前沒有預約</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filtered.map((app) => (
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[app.status]}`}>
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
                          {app.notes && (
                            <div className="flex items-start text-gray-600 sm:col-span-2">
                              <FileText className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                              <span>備註: {app.notes}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-end space-x-3">
                          {app.status === '待接待' && (
                            <button
                              onClick={() => handleStatusUpdate(app.id, '進行中')}
                              disabled={updateMutation.isPending}
                              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                              開始服務
                            </button>
                          )}
                          {app.status === '進行中' && (
                            <button
                              onClick={() => handleStatusUpdate(app.id, '已完成')}
                              disabled={updateMutation.isPending}
                              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
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
