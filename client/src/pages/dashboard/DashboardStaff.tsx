
import React, { useState, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { Users, List, X, Plus, MoreVertical, Star, BarChart, Phone, Calendar, Briefcase, ChevronDown, Search } from 'lucide-react';

// --- TYPESCRIPT MODELS ---
type StaffRole = '醫師' | '護理師' | '美容師' | '櫃檯';
type StaffStatus = 'Active' | 'Inactive';

interface ScheduleEntry {
  date: string;
  shift: '早班' | '晚班' | '全天' | '休假';
}

interface Staff {
  id: string;
  name: string;
  avatarUrl: string;
  role: StaffRole;
  phone: string;
  monthlySales: number;
  attendanceRate: number;
  status: StaffStatus;
  schedule: ScheduleEntry[];
}

// --- MOCK DATA ---
const mockStaffData: Staff[] = [
  { id: 's01', name: '林醫師', avatarUrl: 'https://i.pravatar.cc/150?u=s01', role: '醫師', phone: '0912-345-678', monthlySales: 250000, attendanceRate: 98, status: 'Active', schedule: [{ date: '2026-03-01', shift: '早班' }] },
  { id: 's02', name: '陳護理師', avatarUrl: 'https://i.pravatar.cc/150?u=s02', role: '護理師', phone: '0922-345-678', monthlySales: 80000, attendanceRate: 100, status: 'Active', schedule: [{ date: '2026-03-01', shift: '晚班' }] },
  { id: 's03', name: '黃美容師', avatarUrl: 'https://i.pravatar.cc/150?u=s03', role: '美容師', phone: '0932-345-678', monthlySales: 180000, attendanceRate: 95, status: 'Active', schedule: [{ date: '2026-03-01', shift: '全天' }] },
  { id: 's04', name: '張櫃檯', avatarUrl: 'https://i.pravatar.cc/150?u=s04', role: '櫃檯', phone: '0942-345-678', monthlySales: 50000, attendanceRate: 99, status: 'Active', schedule: [{ date: '2026-03-01', shift: '早班' }] },
  { id: 's05', name: '王醫師', avatarUrl: 'https://i.pravatar.cc/150?u=s05', role: '醫師', phone: '0952-345-678', monthlySales: 320000, attendanceRate: 97, status: 'Active', schedule: [{ date: '2026-03-02', shift: '休假' }] },
  { id: 's06', name: '李護理師', avatarUrl: 'https://i.pravatar.cc/150?u=s06', role: '護理師', phone: '0962-345-678', monthlySales: 95000, attendanceRate: 94, status: 'Inactive', schedule: [] },
  { id: 's07', name: '周美容師', avatarUrl: 'https://i.pravatar.cc/150?u=s07', role: '美容師', phone: '0972-345-678', monthlySales: 210000, attendanceRate: 96, status: 'Active', schedule: [] },
  { id: 's08', name: '吳櫃檯', avatarUrl: 'https://i.pravatar.cc/150?u=s08', role: '櫃檯', phone: '0982-345-678', monthlySales: 65000, attendanceRate: 100, status: 'Active', schedule: [] },
  { id: 's09', name: '蔡醫師', avatarUrl: 'https://i.pravatar.cc/150?u=s09', role: '醫師', phone: '0911-111-111', monthlySales: 280000, attendanceRate: 99, status: 'Active', schedule: [] },
  { id: 's10', name: '許護理師', avatarUrl: 'https://i.pravatar.cc/150?u=s10', role: '護理師', phone: '0922-222-222', monthlySales: 85000, attendanceRate: 93, status: 'Active', schedule: [] },
  { id: 's11', name: '鄭美容師', avatarUrl: 'https://i.pravatar.cc/150?u=s11', role: '美容師', phone: '0933-333-333', monthlySales: 195000, attendanceRate: 98, status: 'Inactive', schedule: [] },
  { id: 's12', name: '廖櫃檯', avatarUrl: 'https://i.pravatar.cc/150?u=s12', role: '櫃檯', phone: '0944-444-444', monthlySales: 58000, attendanceRate: 97, status: 'Active', schedule: [] },
];

// --- HELPER COMPONENTS ---

const RoleBadge: React.FC<{ role: StaffRole }> = ({ role }) => {
  const roleColors: Record<StaffRole, string> = {
    '醫師': 'bg-blue-100 text-blue-800',
    '護理師': 'bg-green-100 text-green-800',
    '美容師': 'bg-pink-100 text-pink-800',
    '櫃檯': 'bg-yellow-100 text-yellow-800',
  };
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[role]}`}>{role}</span>;
};

const StatusBadge: React.FC<{ status: StaffStatus }> = ({ status }) => {
    const statusColors: Record<StaffStatus, string> = {
        'Active': 'bg-green-100 text-green-800',
        'Inactive': 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>{status}</span>;
};

// --- MAIN COMPONENTS ---

const StaffCard: React.FC<{ staff: Staff; onSelect: (staff: Staff) => void }> = ({ staff, onSelect }) => (
  <div onClick={() => onSelect(staff)} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center hover:shadow-xl transition-shadow cursor-pointer">
    <img src={staff.avatarUrl} alt={staff.name} className="w-24 h-24 rounded-full mb-4"  loading="lazy" />
    <h3 className="text-lg font-semibold text-gray-800">{staff.name}</h3>
    <div className="my-2"><RoleBadge role={staff.role} /></div>
    <p className="text-sm text-gray-500 flex items-center"><Phone className="w-4 h-4 mr-2" />{staff.phone}</p>
    <div className="w-full mt-4 pt-4 border-t border-gray-200 flex justify-around text-sm">
      <div className="text-center">
        <p className="text-gray-500">本月業績</p>
        <p className="font-semibold text-indigo-600">${staff.monthlySales.toLocaleString()}</p>
      </div>
      <div className="text-center">
        <p className="text-gray-500">本月出勤率</p>
        <p className="font-semibold text-indigo-600">{staff.attendanceRate}%</p>
      </div>
    </div>
  </div>
);

const StaffGrid: React.FC<{ staffList: Staff[]; onSelect: (staff: Staff) => void }> = ({ staffList, onSelect }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {staffList.map(staff => <StaffCard key={staff.id} staff={staff} onSelect={onSelect} />)}
  </div>
);

const StaffList: React.FC<{ staffList: Staff[]; onSelect: (staff: Staff) => void }> = ({ staffList, onSelect }) => (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">姓名</th>
                    <th scope="col" className="px-6 py-3">角色</th>
                    <th scope="col" className="px-6 py-3">電話</th>
                    <th scope="col" className="px-6 py-3">業績</th>
                    <th scope="col" className="px-6 py-3">出勤率</th>
                    <th scope="col" className="px-6 py-3">狀態</th>
                    <th scope="col" className="px-6 py-3">操作</th>
                </tr>
            </thead>
            <tbody>
                {staffList.map((staff) => (
                    <tr key={staff.id} className="bg-white border-b hover:bg-gray-50">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center">
                            <img className="w-10 h-10 rounded-full mr-3" src={staff.avatarUrl} alt={staff.name}  loading="lazy" />
                            {staff.name}
                        </th>
                        <td className="px-6 py-4"><RoleBadge role={staff.role} /></td>
                        <td className="px-6 py-4">{staff.phone}</td>
                        <td className="px-6 py-4">${staff.monthlySales.toLocaleString()}</td>
                        <td className="px-6 py-4">{staff.attendanceRate}%</td>
                        <td className="px-6 py-4"><StatusBadge status={staff.status} /></td>
                        <td className="px-6 py-4">
                            <button onClick={() => onSelect(staff)} className="font-medium text-indigo-600 hover:underline">查看</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PerformanceOverview: React.FC<{ staffList: Staff[] }> = ({ staffList }) => {
  const topPerformer = useMemo(() => 
    staffList.length > 0 ? staffList.reduce((prev, current) => (prev.monthlySales > current.monthlySales) ? prev : current) : null
  , [staffList]);

  const averageMetrics = useMemo(() => {
    if (staffList.length === 0) return { sales: 0, attendance: 0 };
    const totalSales = staffList.reduce((sum, staff) => sum + staff.monthlySales, 0);
    const totalAttendance = staffList.reduce((sum, staff) => sum + staff.attendanceRate, 0);
    return {
      sales: totalSales / staffList.length,
      attendance: totalAttendance / staffList.length,
    };
  }, [staffList]);

  if (!topPerformer) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center">
        <Star className="w-10 h-10 text-yellow-400 mb-2" />
        <h3 className="text-lg font-semibold text-gray-800">本月最佳表現</h3>
        <img src={topPerformer.avatarUrl} alt={topPerformer.name} className="w-16 h-16 rounded-full my-3"  loading="lazy" />
        <p className="font-bold text-xl text-indigo-600">{topPerformer.name}</p>
        <p className="text-gray-500">業績: ${topPerformer.monthlySales.toLocaleString()}</p>
      </div>
      <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><BarChart className="w-5 h-5 mr-2 text-indigo-500"/>團隊平均指標</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">平均業績</p>
                <p className="text-2xl font-bold text-gray-800">${Math.round(averageMetrics.sales).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">平均出勤率</p>
                <p className="text-2xl font-bold text-gray-800">{averageMetrics.attendance.toFixed(1)}%</p>
            </div>
        </div>
      </div>
    </div>
  );
};

const NewStaffModal: React.FC<{ isOpen: boolean; onClose: () => void; onAddStaff: (newStaff: Omit<Staff, 'id' | 'avatarUrl' | 'status' | 'schedule'>) => void }> = ({ isOpen, onClose, onAddStaff }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState<StaffRole>('美容師');
    const [phone, setPhone] = useState('');
    const [monthlySales, setMonthlySales] = useState(0);
    const [attendanceRate, setAttendanceRate] = useState(100);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddStaff({ name, role, phone, monthlySales, attendanceRate });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">新增員工</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">姓名</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">角色</label>
                            <select id="role" value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                <option>醫師</option>
                                <option>護理師</option>
                                <option>美容師</option>
                                <option>櫃檯</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話</label>
                            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                         <div>
                            <label htmlFor="monthlySales" className="block text-sm font-medium text-gray-700">月業績目標</label>
                            <input type="number" id="monthlySales" value={monthlySales} onChange={(e) => setMonthlySales(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                         <div>
                            <label htmlFor="attendanceRate" className="block text-sm font-medium text-gray-700">出勤率目標 (%)</label>
                            <input type="number" id="attendanceRate" value={attendanceRate} onChange={(e) => setAttendanceRate(Number(e.target.value))} max="100" min="0" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">取消</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">新增</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StaffDetailModal: React.FC<{ staff: Staff | null; onClose: () => void }> = ({ staff, onClose }) => {
    if (!staff) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center">
                        <img src={staff.avatarUrl} alt={staff.name} className="w-20 h-20 rounded-full mr-6"  loading="lazy" />
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">{staff.name}</h2>
                            <RoleBadge role={staff.role} />
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">詳細資訊</h3>
                        <p className="flex items-center text-gray-600"><Phone className="w-5 h-5 mr-3 text-gray-400"/> {staff.phone}</p>
                        <p className="flex items-center text-gray-600"><Briefcase className="w-5 h-5 mr-3 text-gray-400"/> <StatusBadge status={staff.status} /></p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">本月業績</p>
                            <p className="text-2xl font-bold text-indigo-600">${staff.monthlySales.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">本月出勤率</p>
                            <p className="text-2xl font-bold text-indigo-600">{staff.attendanceRate}%</p>
                        </div>
                    </div>

                    {/* Right Column: Schedule */}
                    <div>
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">本月排班</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {staff.schedule.length > 0 ? staff.schedule.map(entry => (
                                <div key={entry.date} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 mr-3 text-gray-400"/>
                                        <span className="font-medium text-gray-700">{entry.date}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">{entry.shift}</span>
                                </div>
                            )) : <p className="text-gray-500 text-center py-4">本月無排班紀錄</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- DASHBOARD LAYOUT (Simplified for standalone component) ---
const DashboardLayout: React.FC<{ children: React.ReactNode, pageTitle: string }> = ({ children, pageTitle }) => {
    const [, setLocation] = useLocation();
    const navItems = [
        { name: '總覽', path: '/dashboard', icon: BarChart },
        { name: '員工管理', path: '/dashboard/staff', icon: Users },
        { name: '行事曆', path: '/dashboard/calendar', icon: Calendar },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md hidden md:block">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">YOChiLL</h1>
                </div>
                <nav className="mt-6">
                    {navItems.map(item => (
                        <Link key={item.name} href={item.path}>
                            <a className={`flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-200 ${'/dashboard/staff' === item.path ? 'text-indigo-600 border-r-4 border-indigo-500 bg-gray-100' : ''}`}>
                                <item.icon className="w-5 h-5" />
                                <span className="mx-4 font-medium">{item.name}</span>
                            </a>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-6 bg-white border-b">
                    <h2 className="text-2xl font-semibold text-gray-800">{pageTitle}</h2>
                    {/* Mobile nav can be added here */}
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

// --- PAGE COMPONENT ---
const DashboardStaffPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [staffData, setStaffData] = useState<Staff[]>(mockStaffData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewStaffModalOpen, setIsNewStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const handleAddStaff = (newStaffData: Omit<Staff, 'id' | 'avatarUrl' | 'status' | 'schedule'>) => {
    const newStaff: Staff = {
        ...newStaffData,
        id: `s${staffData.length + 1}`,
        avatarUrl: `https://i.pravatar.cc/150?u=s${staffData.length + 1}`,
        status: 'Active',
        schedule: [],
    };
    setStaffData(prev => [newStaff, ...prev]);
  };

  if (isLoading) {
    return <DashboardLayout pageTitle="員工管理"><div className="flex justify-center items-center h-full"><p>Loading...</p></div></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout pageTitle="員工管理"><div className="flex justify-center items-center h-full"><p className="text-red-500">Error: {error}</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout pageTitle="員工管理">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <PerformanceOverview staffList={staffData} />
      </div>

      {/* View Controls and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center bg-white p-1 rounded-lg shadow-sm">
          <button onClick={() => setViewMode('grid')} className={`px-4 py-2 text-sm font-medium rounded-md ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-gray-600'}`}><Users className="w-5 h-5 inline-block mr-1"/> 網格</button>
          <button onClick={() => setViewMode('list')} className={`px-4 py-2 text-sm font-medium rounded-md ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-gray-600'}`}><List className="w-5 h-5 inline-block mr-1"/> 列表</button>
        </div>
        <button onClick={() => setIsNewStaffModalOpen(true)} className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5 mr-2" />
          新增員工
        </button>
      </div>

      {/* Main Content Area */}
      <div>
        {viewMode === 'grid' ? 
          <StaffGrid staffList={staffData} onSelect={setSelectedStaff} /> : 
          <StaffList staffList={staffData} onSelect={setSelectedStaff} />
        }
      </div>

      {/* Modals */}
      <NewStaffModal 
        isOpen={isNewStaffModalOpen} 
        onClose={() => setIsNewStaffModalOpen(false)} 
        onAddStaff={handleAddStaff} 
      />
      <StaffDetailModal 
        staff={selectedStaff} 
        onClose={() => setSelectedStaff(null)} 
      />
    </DashboardLayout>
  );
};

export default DashboardStaffPage;
