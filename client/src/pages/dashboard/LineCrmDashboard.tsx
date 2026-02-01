import React from 'react';
import { MessageSquare, Users, Tag, Send, Settings, Search } from 'lucide-react';
import { useLocation } from 'wouter';

interface Customer {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  tags: string[];
  unread: number;
}

const mockCustomers: Customer[] = [
  {
    id: 'C001',
    name: '林小美',
    avatar: 'https://i.pravatar.cc/150?u=C001',
    lastMessage: '請問皮秒雷射還有優惠嗎？',
    lastMessageTime: '10:30 AM',
    tags: ['VIP', '皮秒雷射'],
    unread: 2,
  },
  {
    id: 'C002',
    name: '陳大文',
    avatar: 'https://i.pravatar.cc/150?u=C002',
    lastMessage: '已預約下週二的回診',
    lastMessageTime: '昨天',
    tags: ['新客', '肉毒'],
    unread: 0,
  },
  {
    id: 'C003',
    name: '張雅婷',
    avatar: 'https://i.pravatar.cc/150?u=C003',
    lastMessage: '謝謝醫師，效果很滿意！',
    lastMessageTime: '前天',
    tags: ['忠誠客戶', '玻尿酸'],
    unread: 0,
  },
  {
    id: 'C004',
    name: '王志豪',
    avatar: 'https://i.pravatar.cc/150?u=C004',
    lastMessage: '請問營業時間？',
    lastMessageTime: '1 週前',
    tags: ['潛在客戶'],
    unread: 1,
  },
];

const LineCrmDashboard: React.FC = () => {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <span className="text-[#00B900] mr-2"><MessageSquare className="h-8 w-8" /></span>
          LINE 智能 iCRM
        </h1>
        <div className="flex space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#00B900] hover:bg-[#009900] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B900]">
            <Send className="-ml-1 mr-2 h-5 w-5" />
            群發訊息
          </button>
          <button
            onClick={() => navigate('/dashboard/crm/tags')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Tag className="-ml-1 mr-2 h-5 w-5" />
            標籤管理
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Settings className="-ml-1 mr-2 h-5 w-5" />
            設定
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden bg-white shadow rounded-lg border border-gray-200">
        {/* Sidebar: Customer List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                placeholder="搜尋客戶..."
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {mockCustomers.map((customer) => (
                <li key={customer.id} className="hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out">
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 flex items-center">
                      <div className="flex-shrink-0">
                        <img className="h-12 w-12 rounded-full" src={customer.avatar} alt="" />
                      </div>
                      <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">{customer.name}</p>
                          <p className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="truncate">{customer.lastMessage}</span>
                          </p>
                        </div>
                        <div className="hidden md:block">
                          <div className="flex flex-col items-end">
                            <p className="text-sm text-gray-900">{customer.lastMessageTime}</p>
                            {customer.unread > 0 && (
                              <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {customer.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Chat Area (Mockup) */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
            <div className="flex items-center">
              <img className="h-10 w-10 rounded-full" src={mockCustomers[0].avatar} alt="" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{mockCustomers[0].name}</p>
                <div className="flex space-x-1 mt-1">
                  {mockCustomers[0].tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      {tag}
                    </span>
                  ))}
                  <button className="text-gray-400 hover:text-gray-600">
                    <PlusTagIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
               <button className="p-2 text-gray-400 hover:text-gray-600">
                 <Users className="h-5 w-5" />
               </button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="flex justify-end">
              <div className="bg-[#00B900] text-white rounded-lg py-2 px-4 max-w-xs">
                您好，請問有什麼可以為您服務的嗎？
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 text-gray-900 rounded-lg py-2 px-4 max-w-xs">
                請問皮秒雷射還有優惠嗎？
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex space-x-3">
              <input
                type="text"
                className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="輸入訊息..."
              />
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper icon component
const PlusTagIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

export default LineCrmDashboard;
