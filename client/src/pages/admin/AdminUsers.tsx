
import React, { useState, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { Search, UserPlus, MoreVertical, Shield, User, Briefcase, Users, ChevronDown, ChevronLeft, ChevronRight, Edit, UserX, KeyRound } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { QueryLoading, QueryError } from '@/components/ui/query-state';
import { Skeleton } from '@/components/ui/skeleton';

// --- TYPES ---
type UserRole = 'super_admin' | 'admin' | 'staff' | 'user';

interface UserData {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: string;
  organizationName: string | null;
  organizationId: number | null;
  lastSignedIn: Date;
  createdAt: Date;
}

// --- HELPER COMPONENTS ---

const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const roleStyles = {
    super_admin: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
    admin: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700/50',
    staff: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/50',
    user: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  };
  const roleNames = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    staff: 'Staff',
    user: 'User',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${roleStyles[role]}`}>
      {roleNames[role]}
    </span>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Users },
    { href: '/admin/users', label: 'Users', icon: User },
    { href: '/admin/settings', label: 'Settings', icon: Briefcase },
  ];

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex items-center justify-center h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
           <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">YOChiLL</h1>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-gray-800">
          <nav className="flex-1 px-2 py-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-4 py-2 mt-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${ 
                  location === href
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                <Icon className="w-5 h-5" />
                <span className="ml-3">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; isLoading?: boolean }> = ({ title, value, icon: Icon, isLoading }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                <Icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                {isLoading ? <Skeleton className="h-9 w-24 mt-1" /> : <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>}
            </div>
        </div>
    </div>
);

const ITEMS_PER_PAGE = 10;

// A simple debounce hook
function useDebounce(value: string, delay: number): string {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

// --- MAIN PAGE COMPONENT ---

const AdminUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: statsData, isLoading: isLoadingStats } = trpc.superAdmin.userStats.useQuery();

  const { data: usersData, isLoading: isLoadingUsers, isError: isErrorUsers, error: usersError } = trpc.superAdmin.listAllUsers.useQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearchTerm,
    role: roleFilter === 'all' ? undefined : roleFilter,
  });

  const toggleUserStatusMutation = trpc.superAdmin.toggleUserStatus.useMutation({
    onSuccess: () => {
      utils.superAdmin.listAllUsers.invalidate();
      utils.superAdmin.userStats.invalidate();
    },
  });

  const handleToggleStatus = (userId: number, currentStatus: boolean) => {
    toggleUserStatusMutation.mutate({ userId, isActive: !currentStatus });
    setActiveDropdown(null);
  };

  const toggleDropdown = (userId: number) => {
    setActiveDropdown(activeDropdown === userId ? null : userId);
  };

  const totalPages = usersData ? Math.ceil(usersData.total / ITEMS_PER_PAGE) : 0;

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isErrorUsers) {
    return <AdminLayout><QueryError message={usersError?.message ?? '載入使用者失敗'} onRetry={() => utils.superAdmin.listAllUsers.invalidate()} /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">User Management</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <StatCard title="Total Users" value={statsData?.total ?? 0} icon={Users} isLoading={isLoadingStats} />
        <StatCard title="Admins" value={statsData?.admins ?? 0} icon={Shield} isLoading={isLoadingStats} />
        <StatCard title="Active Today" value={statsData?.active ?? 0} icon={Briefcase} isLoading={isLoadingStats} />
        <StatCard title="New This Month" value={statsData?.newThisMonth ?? 0} icon={User} isLoading={isLoadingStats} />
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
          <div className="relative w-full md:w-2/5">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 w-full md:w-auto justify-between md:justify-end">
            <div className="relative">
                 <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value as UserRole | 'all'); setCurrentPage(1); }}
                    className="appearance-none w-full md:w-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block py-2.5 px-4 pr-8 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                >
                    <option value="all">All Roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="user">User</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <ChevronDown className="h-4 w-4" />
                </div>
            </div>
            <button className="flex items-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 rounded-lg shadow hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 whitespace-nowrap">
              <UserPlus className="h-5 w-5 mr-2" />
              Create User
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">用戶名稱</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">角色</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">所屬租戶</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">最後登入</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">狀態</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoadingUsers ? (
                [...Array(ITEMS_PER_PAGE)].map((_, i) => (
                    <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-5 w-32" /></td>
                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell"><Skeleton className="h-5 w-48" /></td>
                        <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-6 w-20" /></td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell"><Skeleton className="h-5 w-24" /></td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell"><Skeleton className="h-5 w-28" /></td>
                        <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-6 w-16" /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><Skeleton className="h-8 w-8" /></td>
                    </tr>
                ))
              ) : usersData?.data.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={`https://i.pravatar.cc/150?u=${user.id}`} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm text-gray-900 dark:text-gray-300">{user.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleBadge role={user.role as UserRole} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                    {user.organizationName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <button onClick={() => toggleDropdown(user.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </button>
                      {activeDropdown === user.id && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                              <Edit className="mr-3 h-5 w-5" /> Edit User
                            </a>
                            <button onClick={() => handleToggleStatus(user.id, user.isActive)} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                              <UserX className="mr-3 h-5 w-5" /> {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                              <KeyRound className="mr-3 h-5 w-5" /> Reset Password
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
            <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-700 dark:text-gray-400">
                    Page <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
                </span>
                <div className="inline-flex -space-x-px rounded-md shadow-sm">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
