import React, { useState, useMemo, FC } from 'react';
import { Calendar, List, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { safeDate, safeTime } from '@/lib/safeFormat';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';

type Status = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no_show';

const statusConfig: Record<Status, { label: string; color: string }> = {
  confirmed: { label: '已確認', color: 'bg-green-100 text-green-800' },
  pending: { label: '待確認', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: '已完成', color: 'bg-blue-100 text-blue-800' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-800' },
  no_show: { label: '未到', color: 'bg-gray-100 text-gray-800' },
};

const Badge: FC<{ status: Status }> = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${cfg.color}`}>{cfg.label}</span>;
};

interface NewApptFormProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: number;
  customerData: any;
  staffData: any;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

const NewAppointmentModal: FC<NewApptFormProps> = ({ isOpen, onClose, organizationId, customerData, staffData, onSubmit, isPending }) => {
  const [customerId, setCustomerId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState('online');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { toast.error('請選擇客戶'); return; }
    onSubmit({
      organizationId,
      customerId: Number(customerId),
      staffId: staffId ? Number(staffId) : undefined,
      appointmentDate,
      startTime,
      endTime,
      notes,
      source,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">新增預約</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">客戶</label>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">
              <option value="">選擇客戶</option>
              {(customerData?.data ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">醫師</label>
            <select value={staffId} onChange={e => setStaffId(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">
              <option value="">選擇醫師（可選）</option>
              {(staffData?.data ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">日期</label>
              <input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">來源</label>
              <select value={source} onChange={e => setSource(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">
                <option value="online">線上預約</option>
                <option value="phone">電話預約</option>
                <option value="walk_in">現場預約</option>
                <option value="line">LINE 預約</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">開始時間</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">結束時間</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">備註</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={2} />
          </div>
          <button type="submit" disabled={isPending} className="w-full py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-lg shadow hover:scale-[1.02] transition-transform disabled:opacity-50">
            {isPending ? '建立中...' : '建立預約'}
          </button>
        </form>
      </div>
    </div>
  );
};

const DashboardAppointments: FC = () => {
  const organizationId = 1; // TODO: from context
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: appointmentsData, isLoading, error, refetch } = trpc.appointment.list.useQuery(
    { organizationId, limit: 100 },
    { enabled: !!organizationId }
  );

  const createMutation = trpc.appointment.create.useMutation({
    onSuccess: () => { toast.success('預約已建立'); refetch(); setModalOpen(false); },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = trpc.appointment.update.useMutation({
    onSuccess: () => { toast.success('預約已更新'); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });

  const { data: staffData } = trpc.staff.list.useQuery({ organizationId }, { enabled: !!organizationId });
  const { data: customerData } = trpc.customer.list.useQuery({ organizationId, limit: 200 }, { enabled: !!organizationId });

  const appointments = useMemo(() => (appointmentsData?.data ?? []).map((a: any) => ({
    id: a.id,
    customerName: a.customerName || `客戶 #${a.customerId}`,
    service: a.productName || '一般診療',
    staff: a.staffName || `醫師 #${a.staffId || ''}`,
    date: safeDate(a.appointmentDate),
    startTime: safeTime(a.startTime, '09:00'),
    endTime: safeTime(a.endTime, '10:00'),
    status: (a.status || 'pending') as Status,
    notes: a.notes || '',
  })), [appointmentsData]);

  const handleStatusUpdate = (id: number, status: Status) => {
    updateMutation.mutate({ id, status });
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, number>();
    appointments.forEach((apt: any) => {
      const dateStr = typeof apt.date === 'string' ? apt.date.split('T')[0] : '';
      map.set(dateStr, (map.get(dateStr) || 0) + 1);
    });
    return map;
  }, [appointments]);

  const renderCalendar = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronLeft size={20} /></button>
        <h3 className="text-lg font-semibold">{currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月</h3>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronRight size={20} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} className="py-2 font-medium text-gray-500">{d}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const count = appointmentsByDate.get(dateStr) || 0;
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          return (
            <div key={day} className={`py-2 rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 ${isToday ? 'bg-indigo-100 dark:bg-indigo-900 font-bold' : ''}`}>
              <div className="text-sm">{day}</div>
              {count > 0 && <div className="text-xs text-indigo-600 font-medium">{count} 筆</div>}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderList = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">客戶</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">療程</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">醫師</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">日期</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">時間</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">狀態</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {appointments.length === 0 ? (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">目前沒有預約資料</td></tr>
          ) : appointments.map((apt: any) => (
            <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-3 font-medium">{apt.customerName}</td>
              <td className="px-4 py-3">{apt.service}</td>
              <td className="px-4 py-3">{apt.staff}</td>
              <td className="px-4 py-3">{typeof apt.date === 'string' ? apt.date.split('T')[0] : ''}</td>
              <td className="px-4 py-3">{apt.startTime} - {apt.endTime}</td>
              <td className="px-4 py-3"><Badge status={apt.status} /></td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  {apt.status === 'pending' && (
                    <button onClick={() => handleStatusUpdate(apt.id, 'confirmed')} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">確認</button>
                  )}
                  {(apt.status === 'confirmed' || apt.status === 'pending') && (
                    <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100">取消</button>
                  )}
                  {apt.status === 'confirmed' && (
                    <button onClick={() => handleStatusUpdate(apt.id, 'completed')} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">完成</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <DashboardLayout title="預約管理">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
          <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${viewMode === 'calendar' ? 'bg-indigo-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>
            <Calendar size={18} /> 日曆視圖
          </button>
          <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>
            <List size={18} /> 列表視圖
          </button>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-lg shadow hover:scale-[1.02] transition-transform">
          <Plus size={20} /> 新增預約
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <strong>錯誤！</strong> {error.message}
        </div>
      ) : viewMode === 'calendar' ? renderCalendar() : renderList()}

      <NewAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        organizationId={organizationId}
        customerData={customerData}
        staffData={staffData}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />
    </DashboardLayout>
  );
};

export default DashboardAppointments;
