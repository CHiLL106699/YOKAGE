import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Search, X, Tag, ChevronDown, ChevronUp, PlusCircle, Star, User, Zap, Coffee, Loader2, AlertTriangle } from 'lucide-react';
import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";
import { toast } from "sonner";

// --- TYPES ---
export type TagType = 'VIP' | '新客' | '回流客' | '高消費';
export type CustomerStatus = 'active' | 'inactive';

export interface ConsumptionRecord {
  id: string;
  date: string;
  service: string;
  amount: number;
  staff: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: TagType[];
  lastConsumption: string;
  totalConsumption: number;
  visitCount: number;
  status: CustomerStatus;
  notes: string;
  consumptionHistory: ConsumptionRecord[];
}



// --- HELPER COMPONENTS ---

const TagBadge = ({ tag }: { tag: TagType }) => {
  const tagColors: Record<TagType, string> = {
    'VIP': 'bg-yellow-200 text-yellow-800',
    '新客': 'bg-blue-200 text-blue-800',
    '回流客': 'bg-green-200 text-green-800',
    '高消費': 'bg-purple-200 text-purple-800',
  };
  

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${tagColors[tag]}`}>
      {tag}
    </span>
  );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  const menuItems = [
    { name: '總覽', icon: Zap, path: '/dashboard' },
    { name: '客戶管理', icon: User, path: '/dashboard/customers' },
    { name: '預約管理', icon: Coffee, path: '/dashboard/appointments' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-64 flex-shrink-0 bg-gray-800 text-white p-4 hidden md:block">
        <div className="text-2xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-500">YOChiLL</div>
        <nav>
          <ul>
            {menuItems.map(item => (
              <li key={item.name} className="mb-4">
                <Link href={item.path}>
                  <a className={`flex items-center p-2 rounded-lg transition-colors ${location === item.path ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">客戶管理</h1>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="font-semibold">Tech Lead</p>
                    <p className="text-sm text-gray-500">Principal Architect</p>
                </div>
                <img src="https://i.pravatar.cc/40" alt="User Avatar" className="w-10 h-10 rounded-full" />
            </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

const CustomerDetailPanel = ({ customer }: { customer: Customer }) => {
    const [activeTab, setActiveTab] = useState('info');

    return (
        <tr className="bg-gray-50">
            <td colSpan={8} className="p-0">
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    {/* Left Column: Basic Info & Notes */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="font-semibold text-lg mb-4 text-gray-800">基本資訊</h3>
                            <div className="space-y-2 text-sm">
                                <p><strong className="text-gray-500 w-20 inline-block">姓名:</strong> {customer.name}</p>
                                <p><strong className="text-gray-500 w-20 inline-block">電話:</strong> {customer.phone}</p>
                                <p><strong className="text-gray-500 w-20 inline-block">Email:</strong> {customer.email}</p>
                                <p><strong className="text-gray-500 w-20 inline-block">狀態:</strong> 
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {customer.status === 'active' ? '啟用' : '停用'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="font-semibold text-lg mb-4 text-gray-800">備註</h3>
                            <textarea 
                                className="w-full h-24 p-2 border rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                defaultValue={customer.notes || '沒有備註'}
                            />
                        </div>
                    </div>

                    {/* Right Column: Tabs for Consumption, Tags */}
                    <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-6">
                                <button onClick={() => setActiveTab('info')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'info' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>消費記錄</button>
                                <button onClick={() => setActiveTab('tags')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'tags' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>標籤管理</button>
                            </nav>
                        </div>

                        <div className="mt-6">
                            {activeTab === 'info' && (
                                <div className="text-sm text-gray-700 max-h-60 overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-xs text-gray-500 bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="p-2 font-medium">日期</th>
                                                <th className="p-2 font-medium">服務項目</th>
                                                <th className="p-2 font-medium">金額</th>
                                                <th className="p-2 font-medium">服務人員</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customer.consumptionHistory.map(record => (
                                                <tr key={record.id} className="border-b">
                                                    <td className="p-2">{record.date}</td>
                                                    <td className="p-2">{record.service}</td>
                                                    <td className="p-2">${record.amount.toLocaleString()}</td>
                                                    <td className="p-2">{record.staff}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {activeTab === 'tags' && (
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-700">管理客戶標籤</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {tags.map(tag => (
                                            <label key={tag} className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                                                <input 
                                                    type="checkbox" 
                                                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                    checked={customer.tags.includes(tag)}
                                                    onChange={() => { /* Handle tag change */ }}
                                                />
                                                <span>{tag}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
};

const NewCustomerModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-full overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">新增客戶</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                        <input type="text" id="name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                        <input type="tel" id="phone" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                            取消
                        </button>
                        <button type="submit" className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:opacity-90 transition">
                            儲存客戶
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const DashboardCustomersPage = () => {
  const organizationId = 1; // TODO: from context
  
  const { data: customersData, isLoading, error, refetch } = trpc.customer.list.useQuery(
    { organizationId, limit: 50 },
    { enabled: !!organizationId }
  );
  
  const createMutation = trpc.customer.create.useMutation({
    onSuccess: () => { toast.success("客戶已建立"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const updateMutation = trpc.customer.update.useMutation({
    onSuccess: () => { toast.success("客戶已更新"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const deleteMutation = trpc.customer.delete.useMutation({
    onSuccess: () => { toast.success("客戶已刪除"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const { data: tagsData } = trpc.customer.tags.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const customers = (customersData?.data ?? []).map((c: any) => ({
    id: c.id, name: c.name, phone: c.phone || "-", email: c.email || "-",
    gender: c.gender || "other", birthday: c.birthday || "-",
    memberLevel: c.memberLevel || "bronze", totalVisits: c.totalVisits ?? 0,
    totalSpent: Number(c.totalSpent || 0), lastVisit: c.lastVisitDate || c.createdAt || "-",
    tags: c.tags || [], notes: c.notes || "", source: c.source || "-",
  }));
  const tags = tagsData ?? [];


    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState<TagType | ''>('');
    const [statusFilter, setStatusFilter] = useState<'all' | CustomerStatus>('all');
    const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Simulate API call
        setLoading(true);
        setError(null);
        const timer = setTimeout(() => {
            try {
                setCustomers(customers);
                setLoading(false);
            } catch (e) {
                setError('無法載入客戶資料，請稍後再試。');
                setLoading(false);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                customer.name.toLowerCase().includes(searchLower) ||
                customer.phone.includes(searchTerm) ||
                customer.email.toLowerCase().includes(searchLower);

            const matchesTag = selectedTag === '' || customer.tags.includes(selectedTag);
            const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;

            return matchesSearch && matchesTag && matchesStatus;
        });
    }, [customers, searchTerm, selectedTag, statusFilter]);

    const toggleRow = (id: string) => {
        setExpandedCustomerId(prevId => (prevId === id ? null : id));
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col justify-center items-center h-64 bg-red-50 text-red-700 rounded-lg p-6">
                    <AlertTriangle className="w-12 h-12 mb-4" />
                    <p className="text-lg font-semibold">{error}</p>
                </div>
            );
        }

        return (
            <>
                {/* Filters and Actions */}
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜尋客戶..."
                                className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <select 
                                className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                value={selectedTag}
                                onChange={e => setSelectedTag(e.target.value as TagType | '')}
                            >
                                <option value="">所有標籤</option>
                                {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select 
                                className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value as 'all' | CustomerStatus)}
                            >
                                <option value="all">所有狀態</option>
                                <option value="active">啟用</option>
                                <option value="inactive">停用</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                            <PlusCircle className="w-5 h-5 mr-2" />
                            新增客戶
                        </button>
                    </div>
                </div>

                {/* Customer Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-sm text-gray-500 bg-gray-50">
                            <tr>
                                <th className="p-4 font-medium">客戶姓名</th>
                                <th className="p-4 font-medium hidden md:table-cell">電話</th>
                                <th className="p-4 font-medium hidden lg:table-cell">Email</th>
                                <th className="p-4 font-medium">標籤</th>
                                <th className="p-4 font-medium hidden lg:table-cell">最後消費</th>
                                <th className="p-4 font-medium hidden md:table-cell">總消費金額</th>
                                <th className="p-4 font-medium hidden md:table-cell">來訪次數</th>
                                <th className="p-4 font-medium">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(customer => (
                                <React.Fragment key={customer.id}>
                                    <tr onClick={() => toggleRow(customer.id)} className="border-b hover:bg-gray-50 cursor-pointer">
                                        <td className="p-4 font-semibold text-gray-800">{customer.name}</td>
                                        <td className="p-4 text-gray-600 hidden md:table-cell">{customer.phone}</td>
                                        <td className="p-4 text-gray-600 hidden lg:table-cell">{customer.email}</td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {customer.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 hidden lg:table-cell">{customer.lastConsumption}</td>
                                        <td className="p-4 text-gray-600 hidden md:table-cell">${customer.totalConsumption.toLocaleString()}</td>
                                        <td className="p-4 text-gray-600 hidden md:table-cell">{customer.visitCount}</td>
                                        <td className="p-4">
                                            <button onClick={(e) => { e.stopPropagation(); toggleRow(customer.id); }} className="text-indigo-600 hover:text-indigo-800">
                                                <ChevronDown className={`w-5 h-5 transition-transform ${expandedCustomerId === customer.id ? 'rotate-180' : ''}`} />
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedCustomerId === customer.id && <CustomerDetailPanel customer={customer} />}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    return (
        <DashboardLayout>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                {renderContent()}
            </div>
            <NewCustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </DashboardLayout>
    );
}

export default DashboardCustomersPage;

// Add some basic animation styles
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
`;
document.head.appendChild(style);
