
import React, { useState } from 'react';
import { useLocation, Link } from "wouter";
import { ChevronDown, Clock, User, Scissors, Calendar, Phone, FileText, MoreVertical, Search, Filter } from 'lucide-react';

type AppointmentStatus = '待接待' | '進行中' | '已完成' | '已取消';

interface Appointment {
  id: string;
  time: string;
  customerName: string;
  customerPhone: string;
  service: string;
  duration: number; // in minutes
  status: AppointmentStatus;
  notes: string;
  historyCount: number;
}

const mockAppointments: Appointment[] = [
  { id: '1', time: '09:00', customerName: '陳小姐', customerPhone: '0912-345-678', service: '精緻剪髮', duration: 60, status: '已完成', notes: '希望髮尾稍微修剪即可', historyCount: 3 },
  { id: '2', time: '10:00', customerName: '林先生', customerPhone: '0923-456-789', service: '頭皮護理', duration: 45, status: '已完成', notes: '', historyCount: 1 },
  { id: '3', time: '11:00', customerName: '黃太太', customerPhone: '0934-567-890', service: '染髮', duration: 120, status: '已完成', notes: '自備染劑，顏色 B3', historyCount: 5 },
  { id: '4', time: '13:00', customerName: '張小姐', customerPhone: '0945-678-901', service: '燙髮', duration: 180, status: '已完成', notes: '大波浪捲', historyCount: 2 },
  { id: '5', time: '16:00', customerName: '吳先生', customerPhone: '0956-789-012', service: '精緻剪髮', duration: 60, status: '已完成', notes: '', historyCount: 8 },
  { id: '6', time: '17:00', customerName: '李小姐', customerPhone: '0967-890-123', service: '精緻剪髮', duration: 60, status: '進行中', notes: '要剪跟上次一樣的髮型', historyCount: 4 },
  { id: '7', time: '18:00', customerName: '王先生', customerPhone: '0978-901-234', service: '頭皮護理', duration: 45, status: '待接待', notes: '', historyCount: 0 },
  { id: '8', time: '18:30', customerName: '蔡小姐', customerPhone: '0989-012-345', service: '洗髮', duration: 30, status: '待接待', notes: '需要加強按摩', historyCount: 1 },
];

const statusColors: { [key in AppointmentStatus]: string } = {
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
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('today');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleStatusUpdate = (id: string, newStatus: AppointmentStatus) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
  };

  const completedCount = appointments.filter(a => a.status === '已完成').length;
  const inProgressCount = appointments.filter(a => a.status === '進行中').length;
  const pendingCount = appointments.filter(a => a.status === '待接待').length;

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Staff Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/150?u=staff" alt="Staff" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">陳設計師</h1>
                <p className="text-sm text-gray-500">今日預約總覽</p>
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
          <StatCard title="今日總預約" value={appointments.length} color="text-gray-800" />
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
              <input type="text" placeholder="搜尋顧客..." className="pl-10 pr-4 py-2 border rounded-lg shadow-sm w-full md:w-auto" />
            </div>
            <button className="p-2 border rounded-lg shadow-sm bg-white hover:bg-gray-100">
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {appointments.map((app, index) => (
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
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{app.customerPhone}</span>
                        </div>
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
                        {app.status === '待接待' && (
                          <button onClick={() => handleStatusUpdate(app.id, '進行中')} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            開始服務
                          </button>
                        )}
                        {app.status === '進行中' && (
                          <button onClick={() => handleStatusUpdate(app.id, '已完成')} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
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
        </div>
      </main>
    </div>
  );
};

export default StaffAppointmentsPage;

