
import React, { useState, useMemo, FC, useCallback } from 'react';
import { useLocation, Link } from 'wouter';
import { Calendar, Plus, List, Filter, X, ChevronLeft, ChevronRight, Search, MoreVertical, Clock, User, Briefcase, Tag, CheckCircle, AlertCircle, Clock4, XCircle } from 'lucide-react';

// --- TYPES --- //
type Status = '已確認' | '待確認' | '已完成' | '已取消';

type Appointment = {
  id: string;
  customerName: string;
  service: string;
  staff: string;
  start: Date;
  duration: number; // in minutes
  notes: string;
  status: Status;
};

// --- MOCK DATA --- //
const mockAppointments: Appointment[] = [
  ...Array.from({ length: 20 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + (i - 10));
    date.setHours(9 + (i % 8), (i % 4) * 15, 0, 0);
    const statuses: Status[] = ['已確認', '待確認', '已完成', '已取消'];
    return {
      id: `APT${1001 + i}`,
      customerName: `客戶 ${String.fromCharCode(65 + i)}`,
      service: ['深層筋膜放鬆', '運動按摩', '產後恢復', '姿勢矯正'][i % 4],
      staff: ['治療師A', '治療師B', '治療師C'][i % 3],
      start: date,
      duration: [60, 90, 120][i % 3],
      notes: `這是預約 #${i + 1} 的備註。`,
      status: statuses[i % 4],
    };
  }),
];

// --- HELPER COMPONENTS --- //

const Badge: FC<{ status: Status }> = ({ status }) => {
  const statusStyles: { [key in Status]: string } = {
    '已確認': 'bg-green-100 text-green-800',
    '待確認': 'bg-yellow-100 text-yellow-800',
    '已完成': 'bg-blue-100 text-blue-800',
    '已取消': 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

const DashboardLayout: FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between p-4 h-16 border-b dark:border-gray-700">
          <h1 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            YOChiLL
          </h1>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>
        <nav className="mt-4">
          {['儀表板', '預約', '客戶', '服務', '設定'].map((item, index) => (
            <Link key={item} href={`/dashboard/${item.toLowerCase()}`}>
              <a className={`flex items-center px-4 py-3 my-1 transition-colors duration-200 transform hover:bg-gray-200 dark:hover:bg-gray-700 ${index === 1 ? 'bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/50 dark:to-violet-900/50 border-r-4 border-indigo-500' : ''}`}>
                <Briefcase className="w-5 h-5" />
                <span className={`mx-4 font-medium transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>{item}</span>
              </a>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
              <Search className="w-5 h-5" />
            </button>
            <div className="relative">
              <img className="w-10 h-10 rounded-full" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// --- CALENDAR VIEW --- //
const CalendarView: FC<{ appointments: Appointment[], currentDate: Date, setCurrentDate: (date: Date) => void }> = ({ appointments, currentDate, setCurrentDate }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, number>();
    appointments.forEach(apt => {
      const dateStr = apt.start.toISOString().split('T')[0];
      map.set(dateStr, (map.get(dateStr) || 0) + 1);
    });
    return map;
  }, [appointments]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="border-r border-b dark:border-gray-700"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const appointmentCount = appointmentsByDate.get(dateStr);
      days.push(
        <div key={day} className="p-2 border-r border-b dark:border-gray-700 min-h-[120px] flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" onClick={() => setSelectedDate(date)}>
          <span className={`font-medium ${new Date().toDateString() === date.toDateString() ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'}`}>{day}</span>
          {appointmentCount && (
            <div className="mt-2 flex flex-wrap gap-1">
                {Array.from({length: Math.min(appointmentCount, 3)}).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-indigo-500"></div>
                ))}
                {appointmentCount > 3 && <span className='text-xs text-gray-500'>+{appointmentCount - 3}</span>}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeft /></button>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight /></button>
      </div>
      <div className="grid grid-cols-7">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-sm text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">{day}</div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
};

// --- LIST VIEW --- //
const ListView: FC<{ appointments: Appointment[] }> = ({ appointments }) => {
  const [filters, setFilters] = useState({ dateRange: '', staff: '', status: '' });

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const [startDate, endDate] = filters.dateRange.split(' to ');
      const dateMatch = !filters.dateRange || (apt.start >= new Date(startDate) && apt.start <= new Date(endDate + 'T23:59:59'));
      const staffMatch = !filters.staff || apt.staff === filters.staff;
      const statusMatch = !filters.status || apt.status === filters.status;
      return dateMatch && staffMatch && statusMatch;
    });
  }, [appointments, filters]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700 flex flex-wrap items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mr-auto">預約列表</h3>
        <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <input type="date" className="input-field" onChange={e => setFilters({...filters, dateRange: e.target.value})}/>
            <select className="input-field" onChange={e => setFilters({...filters, staff: e.target.value})}>
                <option value="">所有負責人</option>
                <option>治療師A</option>
                <option>治療師B</option>
                <option>治療師C</option>
            </select>
            <select className="input-field" onChange={e => setFilters({...filters, status: e.target.value})}>
                <option value="">所有狀態</option>
                <option>已確認</option>
                <option>待確認</option>
                <option>已完成</option>
                <option>已取消</option>
            </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">時間</th>
              <th scope="col" className="px-6 py-3">客戶</th>
              <th scope="col" className="px-6 py-3">服務項目</th>
              <th scope="col" className="px-6 py-3">負責人</th>
              <th scope="col" className="px-6 py-3">狀態</th>
              <th scope="col" className="px-6 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map(apt => (
              <tr key={apt.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  {apt.start.toLocaleDateString()} {apt.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-6 py-4">{apt.customerName}</td>
                <td className="px-6 py-4">{apt.service}</td>
                <td className="px-6 py-4">{apt.staff}</td>
                <td className="px-6 py-4"><Badge status={apt.status} /></td>
                <td className="px-6 py-4">
                  <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><MoreVertical size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- NEW APPOINTMENT MODAL --- //
const NewAppointmentModal: FC<{ isOpen: boolean, onClose: () => void, onAdd: (apt: Omit<Appointment, 'id'>) => void }> = ({ isOpen, onClose, onAdd }) => {
  const [newAppointment, setNewAppointment] = useState<Omit<Appointment, 'id' | 'status'>>({
    customerName: '', service: '', staff: '', start: new Date(), duration: 60, notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...newAppointment, status: '待確認' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">新增預約</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="customerName">客戶名稱</label>
              <input id="customerName" type="text" className="input-field" required onChange={e => setNewAppointment({...newAppointment, customerName: e.target.value})} />
            </div>
            <div className="form-group">
              <label htmlFor="service">服務項目</label>
              <select id="service" className="input-field" required onChange={e => setNewAppointment({...newAppointment, service: e.target.value})}>
                <option value="">選擇服務</option>
                <option>深層筋膜放鬆</option>
                <option>運動按摩</option>
                <option>產後恢復</option>
                <option>姿勢矯正</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="staff">負責人</label>
              <select id="staff" className="input-field" required onChange={e => setNewAppointment({...newAppointment, staff: e.target.value})}>
                <option value="">選擇負責人</option>
                <option>治療師A</option>
                <option>治療師B</option>
                <option>治療師C</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="date">日期</label>
              <input id="date" type="date" className="input-field" required onChange={e => {
                  const newDate = new Date(e.target.value);
                  const oldTime = newAppointment.start;
                  newDate.setHours(oldTime.getHours(), oldTime.getMinutes());
                  setNewAppointment({...newAppointment, start: newDate});
              }} />
            </div>
            <div className="form-group">
              <label htmlFor="time">時間</label>
              <input id="time" type="time" className="input-field" required onChange={e => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newDate = new Date(newAppointment.start);
                  newDate.setHours(parseInt(hours), parseInt(minutes));
                  setNewAppointment({...newAppointment, start: newDate});
              }} />
            </div>
            <div className="form-group">
              <label htmlFor="duration">時長 (分鐘)</label>
              <input id="duration" type="number" step="15" min="15" className="input-field" value={newAppointment.duration} required onChange={e => setNewAppointment({...newAppointment, duration: parseInt(e.target.value)})} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="notes">備註</label>
            <textarea id="notes" rows={3} className="input-field" onChange={e => setNewAppointment({...newAppointment, notes: e.target.value})}></textarea>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">取消</button>
            <button type="submit" className="btn btn-primary">建立預約</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT --- //
const DashboardAppointments: FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Simulate data fetching
  useState(() => {
    setTimeout(() => {
      try {
        setAppointments(mockAppointments);
        setIsLoading(false);
      } catch (e) {
        setError('無法載入預約資料。');
        setIsLoading(false);
      }
    }, 1000);
  });

  const handleAddAppointment = (newApt: Omit<Appointment, 'id'>) => {
    const appointmentWithId = { ...newApt, id: `APT${Date.now()}` };
    setAppointments(prev => [...prev, appointmentWithId]);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">錯誤!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      );
    }

    return viewMode === 'calendar' ? 
      <CalendarView appointments={appointments} currentDate={currentDate} setCurrentDate={setCurrentDate} /> : 
      <ListView appointments={appointments} />;
  };

  return (
    <DashboardLayout title="預約管理">
      <style>{`
        .input-field { @apply w-full px-3 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600; }
        .form-group { @apply flex flex-col space-y-1; }
        .form-group label { @apply text-sm font-medium text-gray-600 dark:text-gray-400; }
        .btn { @apply px-4 py-2 font-semibold rounded-md shadow-sm transition-transform transform hover:scale-105; }
        .btn-primary { @apply bg-gradient-to-r from-indigo-500 to-violet-500 text-white; }
        .btn-secondary { @apply bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600; }
      `}</style>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
          <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${viewMode === 'calendar' ? 'bg-indigo-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>
            <Calendar size={18} /> 日曆視圖
          </button>
          <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>
            <List size={18} /> 列表視圖
          </button>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> 新增預約
        </button>
      </div>

      {renderContent()}

      <NewAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onAdd={handleAddAppointment} 
      />
    </DashboardLayout>
  );
};

export default DashboardAppointments;
