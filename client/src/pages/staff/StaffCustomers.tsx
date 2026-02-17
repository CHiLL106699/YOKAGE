import React, { useState, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { Search, Phone, MessageSquare, ChevronDown, ChevronUp, User, Tag, Calendar, Users, DollarSign, Star, FileText, Settings } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useStaffContext } from '@/hooks/useStaffContext';
import { PageLoadingSkeleton, PageError } from '@/components/ui/page-skeleton';

type CustomerTag = 'VIP' | '新客';

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
  customer: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
}> = ({ customer, isExpanded, onToggleExpand }) => {
  const TagChip: React.FC<{ tag: string }> = ({ tag }) => (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tag === 'VIP' || tag === 'diamond' || tag === 'platinum' || tag === 'gold' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
      {tag === 'diamond' ? 'VIP' : tag === 'platinum' ? 'VIP' : tag === 'gold' ? 'VIP' : tag}
    </span>
  );

  const memberLevel = customer.memberLevel ?? 'bronze';
  const isVip = ['gold', 'platinum', 'diamond'].includes(memberLevel);
  const isNew = (customer.visitCount ?? 0) <= 1;
  const tags: string[] = [];
  if (isVip) tags.push('VIP');
  if (isNew) tags.push('新客');

  const totalSpent = Number(customer.totalSpent ?? 0);
  const visitCount = customer.visitCount ?? 0;
  const lastVisit = customer.updatedAt ?? customer.createdAt;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-4 cursor-pointer" onClick={onToggleExpand}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <p className="font-bold text-lg text-gray-800">{customer.name}</p>
              <p className="text-sm text-gray-500">{customer.phone ?? '-'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
            <div className="text-center">
              <p className="text-xs text-gray-500">最近訪問</p>
              <p className="font-semibold text-gray-700">
                {lastVisit ? new Date(lastVisit).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }) : '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">總訪問</p>
              <p className="font-semibold text-gray-700">{visitCount} 次</p>
            </div>
            <div className="flex items-center space-x-2">
              {tags.map(tag => <TagChip key={tag} tag={tag} />)}
            </div>
            <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-gray-50/70 p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center"><DollarSign className="w-4 h-4 mr-2 text-indigo-500" />消費資訊</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm bg-white p-2 rounded-md">
                  <span className="text-gray-600">會員等級</span>
                  <span className="font-semibold text-gray-800">{memberLevel}</span>
                </div>
                <div className="flex justify-between items-center text-sm bg-white p-2 rounded-md">
                  <span className="text-gray-600">累計消費</span>
                  <span className="font-semibold text-gray-800">NT$ {totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm bg-white p-2 rounded-md">
                  <span className="text-gray-600">來訪次數</span>
                  <span className="font-semibold text-gray-800">{visitCount} 次</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><FileText className="w-4 h-4 mr-2 text-indigo-500" />備註</h4>
                <p className="text-sm text-gray-600 bg-white p-2 rounded-md min-h-[4rem]">{customer.notes || '無'}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition">
              <MessageSquare className="w-4 h-4 mr-2" /> 發送訊息
            </button>
            {customer.phone && (
              <a href={`tel:${customer.phone}`} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full hover:opacity-90 transition">
                <Phone className="w-4 h-4 mr-2" /> 撥打電話
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const StaffCustomersPage = () => {
  const { organizationId, isLoading: ctxLoading } = useStaffContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<'all' | CustomerTag>('all');
  const [sortBy, setSortBy] = useState<'lastVisit' | 'totalSpending'>('lastVisit');
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  const customersQuery = trpc.customer.list.useQuery(
    { organizationId, limit: 100, search: searchTerm || undefined },
    { enabled: !ctxLoading }
  );

  const rawData = customersQuery.data;
  const allCustomers: any[] = Array.isArray(rawData) ? rawData : (rawData as any)?.data ?? [];

  const filteredCustomers = useMemo(() => {
    let customers = [...allCustomers];

    // Filter by tag
    if (filterTag === 'VIP') {
      customers = customers.filter(c => ['gold', 'platinum', 'diamond'].includes(c.memberLevel ?? ''));
    } else if (filterTag === '新客') {
      customers = customers.filter(c => (c.visitCount ?? 0) <= 1);
    }

    // Sort
    customers.sort((a, b) => {
      if (sortBy === 'lastVisit') {
        return new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() - new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      } else {
        return Number(b.totalSpent ?? 0) - Number(a.totalSpent ?? 0);
      }
    });

    return customers;
  }, [allCustomers, filterTag, sortBy]);

  const handleToggleExpand = (id: string) => {
    setExpandedCustomerId(prevId => (prevId === id ? null : id));
  };

  if (ctxLoading || customersQuery.isLoading) {
    return <PageLoadingSkeleton message="載入客戶資料..." />;
  }

  if (customersQuery.isError) {
    return <PageError message="無法載入客戶資料" onRetry={() => customersQuery.refetch()} />;
  }

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-20 text-gray-500">找不到符合條件的客戶。</div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map(customer => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  isExpanded={expandedCustomerId === String(customer.id)}
                  onToggleExpand={() => handleToggleExpand(String(customer.id))}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StaffCustomersPage;
