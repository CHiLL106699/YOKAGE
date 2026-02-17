
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { Search, Phone, MessageSquare, ChevronDown, ChevronUp, User, Tag, Calendar, Users, DollarSign, Star, FileText, Settings } from 'lucide-react';

// --- TYPESCRIPT MODELS ---
type TreatmentRecord = {
  id: string;
  date: string;
  service: string;
  amount: number;
};

type CustomerTag = 'VIP' | '新客';

type Customer = {
  id: string;
  name: string;
  phone: string;
  tags: CustomerTag[];
  lastVisit: string;
  totalVisits: number;
  totalSpending: number;
  notes: string;
  preferences: string;
  treatmentHistory: TreatmentRecord[];
};

// --- MOCK DATA ---
const mockCustomers: Customer[] = [
  {
    id: 'cus_1',
    name: '陳雅玲',
    phone: '0912-345-678',
    tags: ['VIP'],
    lastVisit: '2026-02-15',
    totalVisits: 25,
    totalSpending: 150000,
    notes: '對杏仁酸輕微過敏，推薦使用溫和型產品。喜歡預約下午時段。',
    preferences: '喜歡聽輕音樂，對薰衣草香味敏感。',
    treatmentHistory: [
      { id: 'tr_1', date: '2026-02-15', service: '水飛梭煥膚', amount: 3000 },
      { id: 'tr_2', date: '2026-01-10', service: '雷射除斑', amount: 5000 },
      { id: 'tr_3', date: '2025-12-05', service: '玻尿酸填充', amount: 12000 },
      { id: 'tr_4', date: '2025-11-01', service: '水飛梭煥膚', amount: 3000 },
      { id: 'tr_5', date: '2025-10-15', service: '杏仁酸煥膚', amount: 2500 },
    ],
  },
  {
    id: 'cus_2',
    name: '林俊傑',
    phone: '0988-765-432',
    tags: ['新客'],
    lastVisit: '2026-02-10',
    totalVisits: 1,
    totalSpending: 2000,
    notes: '首次來店，對皮膚乾燥問題很在意。',
    preferences: '無特別偏好。',
    treatmentHistory: [
      { id: 'tr_6', date: '2026-02-10', service: '基礎保濕護理', amount: 2000 },
    ],
  },
  // ... Add 13 more mock customers
  {
    id: 'cus_3', name: '黃美玲', phone: '0923-456-789', tags: [], lastVisit: '2026-01-20', totalVisits: 12, totalSpending: 85000, notes: '定期回來做保養', preferences: '喜歡安靜的環境', treatmentHistory: [{ id: 'tr_7', date: '2026-01-20', service: '音波拉提', amount: 15000 }]
  },
  {
    id: 'cus_4', name: '張偉明', phone: '0933-123-456', tags: ['VIP'], lastVisit: '2026-02-01', totalVisits: 35, totalSpending: 250000, notes: '大客戶，需要特別關照', preferences: '只喝手沖咖啡', treatmentHistory: [{ id: 'tr_8', date: '2026-02-01', service: '皮秒雷射', amount: 8000 }]
  },
  {
    id: 'cus_5', name: '李心怡', phone: '0955-987-654', tags: ['新客'], lastVisit: '2026-02-12', totalVisits: 1, totalSpending: 3500, notes: '朋友介紹來的', preferences: '無', treatmentHistory: [{ id: 'tr_9', date: '2026-02-12', service: '杏仁酸煥膚', amount: 3500 }]
  },
  {
    id: 'cus_6', name: '王志豪', phone: '0911-111-111', tags: [], lastVisit: '2025-12-15', totalVisits: 5, totalSpending: 30000, notes: '', preferences: '', treatmentHistory: [{ id: 'tr_10', date: '2025-12-15', service: '除皺注射', amount: 6000 }]
  },
  {
    id: 'cus_7', name: '吳秀蘭', phone: '0922-222-222', tags: ['VIP'], lastVisit: '2026-02-14', totalVisits: 18, totalSpending: 120000, notes: '對服務品質要求高', preferences: '需要提供熱茶', treatmentHistory: [{ id: 'tr_11', date: '2026-02-14', service: '水飛梭煥膚', amount: 3000 }]
  },
  {
    id: 'cus_8', name: '劉文雄', phone: '0937-888-999', tags: [], lastVisit: '2026-01-05', totalVisits: 8, totalSpending: 55000, notes: '在意眼周細紋', preferences: '', treatmentHistory: [{ id: 'tr_12', date: '2026-01-05', service: '眼周電波', amount: 7000 }]
  },
  {
    id: 'cus_9', name: '蔡宜君', phone: '0966-555-444', tags: ['新客'], lastVisit: '2026-02-08', totalVisits: 1, totalSpending: 1800, notes: '學生，預算有限', preferences: '希望有折扣活動', treatmentHistory: [{ id: 'tr_13', date: '2026-02-08', service: '基礎清潔', amount: 1800 }]
  },
  {
    id: 'cus_10', name: '鄭雅芳', phone: '0978-123-789', tags: [], lastVisit: '2025-11-30', totalVisits: 3, totalSpending: 15000, notes: '', preferences: '', treatmentHistory: [{ id: 'tr_14', date: '2025-11-30', service: '雷射除毛', amount: 5000 }]
  },
  {
    id: 'cus_11', name: '彭建宏', phone: '0919-919-919', tags: ['VIP'], lastVisit: '2026-02-11', totalVisits: 22, totalSpending: 180000, notes: '喜歡嘗試新療程', preferences: '對新技術很有興趣', treatmentHistory: [{ id: 'tr_15', date: '2026-02-11', service: '增肌減脂', amount: 10000 }]
  },
  {
    id: 'cus_12', name: '蕭美珍', phone: '0952-654-321', tags: [], lastVisit: '2026-01-28', totalVisits: 6, totalSpending: 42000, notes: '', preferences: '', treatmentHistory: [{ id: 'tr_16', date: '2026-01-28', service: '玻尿酸填充', amount: 7000 }]
  },
  {
    id: 'cus_13', name: '賴冠宇', phone: '0987-654-321', tags: ['新客'], lastVisit: '2026-02-16', totalVisits: 1, totalSpending: 5000, notes: '諮詢痘疤問題', preferences: '', treatmentHistory: [{ id: 'tr_17', date: '2026-02-16', service: '飛梭雷射諮詢', amount: 500 }]
  },
  {
    id: 'cus_14', name: '許淑惠', phone: '0910-000-111', tags: ['VIP'], lastVisit: '2026-02-05', totalVisits: 40, totalSpending: 320000, notes: '院長指定客戶', preferences: '需要最高規格服務', treatmentHistory: [{ id: 'tr_18', date: '2026-02-05', service: '全臉拉提', amount: 25000 }]
  },
  {
    id: 'cus_15', name: '葉明珠', phone: '0939-393-939', tags: [], lastVisit: '2025-10-10', totalVisits: 10, totalSpending: 75000, notes: '', preferences: '', treatmentHistory: [{ id: 'tr_19', date: '2025-10-10', service: '肉毒桿菌注射', amount: 7500 }]
  }
];

// --- SUB-COMPONENTS ---

const StaffHeader = () => (
  <header className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <h1 className="text-2xl font-bold text-gray-800">客戶管理</h1>
        <div className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
          YOChiLL
        </div>
      </div>
    </div>
  </header>
);

const CustomerControls: React.FC<{ 
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterTag: string;
  setFilterTag: (tag: any) => void;
  sortBy: string;
  setSortBy: (sort: any) => void;
}> = ({ searchTerm, setSearchTerm, filterTag, setFilterTag, sortBy, setSortBy }) => {
  const tags: (CustomerTag | 'all')[] = ['all', 'VIP', '新客'];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
      {/* Search Bar */}
      <div className="relative flex-grow md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text"
          placeholder="搜尋姓名或電話..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Tag Filter */}
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-full">
          {tags.map(tag => (
            <button 
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${filterTag === tag ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>
              {tag === 'all' ? '全部' : tag}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="relative">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-full py-2 pl-4 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <option value="lastVisit">最近訪問</option>
            <option value="totalSpending">總消費金額</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

const CustomerCard: React.FC<{ 
  customer: Customer;
  isExpanded: boolean;
  onToggleExpand: () => void;
}> = ({ customer, isExpanded, onToggleExpand }) => {
  const TagChip: React.FC<{ tag: CustomerTag }> = ({ tag }) => (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tag === 'VIP' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
      {tag}
    </span>
  );

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Collapsed View */}
      <div className="p-4 cursor-pointer" onClick={onToggleExpand}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <p className="font-bold text-lg text-gray-800">{customer.name}</p>
              <p className="text-sm text-gray-500">{customer.phone}</p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
            <div className="text-center">
              <p className="text-xs text-gray-500">最近訪問</p>
              <p className="font-semibold text-gray-700">{new Date(customer.lastVisit).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">總訪問</p>
              <p className="font-semibold text-gray-700">{customer.totalVisits} 次</p>
            </div>
            <div className="flex items-center space-x-2">
              {customer.tags.map(tag => <TagChip key={tag} tag={tag} />)}
            </div>
            <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-gray-50/70 p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Treatments */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center"><Star className="w-4 h-4 mr-2 text-indigo-500"/>最近療程記錄</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {customer.treatmentHistory.length > 0 ? customer.treatmentHistory.map(record => (
                  <div key={record.id} className="flex justify-between items-center text-sm bg-white p-2 rounded-md">
                    <div className="text-gray-600">
                      <p>{new Date(record.date).toLocaleDateString('zh-TW')}</p>
                      <p>{record.service}</p>
                    </div>
                    <p className="font-semibold text-gray-800">${record.amount.toLocaleString()}</p>
                  </div>
                )) : <p className="text-sm text-gray-500">無療程記錄。</p>}
              </div>
            </div>

            {/* Notes & Preferences */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><FileText className="w-4 h-4 mr-2 text-indigo-500"/>備註</h4>
                <p className="text-sm text-gray-600 bg-white p-2 rounded-md min-h-[4rem]">{customer.notes || '無'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><Settings className="w-4 h-4 mr-2 text-indigo-500"/>偏好</h4>
                <p className="text-sm text-gray-600 bg-white p-2 rounded-md min-h-[4rem]">{customer.preferences || '無'}</p>
              </div>
            </div>
          </div>
          {/* Quick Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition">
              <MessageSquare className="w-4 h-4 mr-2" /> 發送訊息
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full hover:opacity-90 transition">
              <Phone className="w-4 h-4 mr-2" /> 撥打電話
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomerList: React.FC<{ 
  customers: Customer[];
  loading: boolean;
  error: string | null;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
}> = ({ customers, loading, error, expandedId, onToggleExpand }) => {
  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-500">載入客戶資料中...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">錯誤: {error}</div>;
  }

  if (customers.length === 0) {
    return <div className="text-center py-20 text-gray-500">找不到符合條件的客戶。</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-4">
        {customers.map(customer => (
          <CustomerCard 
            key={customer.id} 
            customer={customer} 
            isExpanded={expandedId === customer.id}
            onToggleExpand={() => onToggleExpand(customer.id)}
          />
        ))}
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const StaffCustomersPage = () => {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<'all' | CustomerTag>('all');
  const [sortBy, setSortBy] = useState<'lastVisit' | 'totalSpending'>('lastVisit');
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  // Initial data load simulation
  useEffect(() => {
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      try {
        setAllCustomers(mockCustomers);
      } catch (e) {
        setError('無法載入模擬資料。');
      }
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Memoized filtering and sorting
  const filteredCustomers = useMemo(() => {
    let customers = [...allCustomers];

    // Search
    if (searchTerm) {
      customers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
      );
    }

    // Filter
    if (filterTag !== 'all') {
      customers = customers.filter(c => c.tags.includes(filterTag));
    }

    // Sort
    customers.sort((a, b) => {
      if (sortBy === 'lastVisit') {
        return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
      } else {
        return b.totalSpending - a.totalSpending;
      }
    });

    return customers;
  }, [allCustomers, searchTerm, filterTag, sortBy]);

  const handleToggleExpand = (id: string) => {
    setExpandedCustomerId(prevId => (prevId === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <StaffHeader />
      <main>
        <CustomerControls 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterTag={filterTag}
          setFilterTag={setFilterTag}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        <CustomerList 
          customers={filteredCustomers}
          loading={loading}
          error={error}
          expandedId={expandedCustomerId}
          onToggleExpand={handleToggleExpand}
        />
      </main>
    </div>
  );
};

export default StaffCustomersPage;
