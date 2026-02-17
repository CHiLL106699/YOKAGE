
import React, { useState, useMemo, useCallback } from 'react';
import { useLocation, Link } from 'wouter';
import { Search, UserPlus, MoreVertical, Shield, User, Briefcase, Users, ChevronDown, ChevronLeft, ChevronRight, Edit, UserX, KeyRound } from 'lucide-react';

// --- MOCK DATA AND TYPES ---
type UserRole = 'super_admin' | 'admin' | 'staff' | 'user';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenant: string;
  lastLogin: string;
  status: 'active' | 'inactive';
  avatar: string;
}

const mockUsers: UserData[] = Array.from({ length: 20 }, (_, i) => ({
  id: `user_${i + 1}`,
  name: `User Name ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: (['super_admin', 'admin', 'staff', 'user'] as UserRole[])[i % 4],
  tenant: `Tenant ${String.fromCharCode(65 + (i % 3))}`,
  lastLogin: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 14).toISOString(),
  status: Math.random() > 0.2 ? 'active' : 'inactive',
  avatar: `https://i.pravatar.cc/40?u=user${i + 1}`,
}));

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

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                <Icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
        </div>
    </div>
);

const ITEMS_PER_PAGE = 10;

// --- MAIN PAGE COMPONENT ---

const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const filteredUsers = useMemo(() => users
    .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(user => roleFilter === 'all' || user.role === roleFilter), [users, searchTerm, roleFilter]);

  const paginatedUsers = useMemo(() => 
    filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
  [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const handleAction = (action: string, userId: string) => {
    // In a real app, you'd dispatch an action to your state management library or make an API call.
    setActiveDropdown(null); // Close dropdown after action
  };

  const toggleDropdown = (userId: string) => {
    if (activeDropdown === userId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(userId);
    }
  };

  if (loading) {
    return (
        <AdminLayout>
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">Loading user data...</p>
                </div>
            </div>
        </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-red-600">An Error Occurred</h2>
            <p className="text-red-500 mt-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">User Management</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <StatCard title="Total Users" value="3,892" icon={Users} />
        <StatCard title="Admins" value="156" icon={Shield} />
        <StatCard title="Staff" value="2,100" icon={Briefcase} />
        <StatCard title="Users" value="1,636" icon={User} />
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
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt={`${user.name}'s avatar`} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">{user.tenant}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{new Date(user.lastLogin).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <div className="relative inline-block text-left">
                        <button onClick={() => toggleDropdown(user.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500">
                            <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </button>
                        {activeDropdown === user.id && (
                            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                    <a href="#" onClick={() => handleAction('edit_role', user.id)} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                        <Edit className="mr-3 h-5 w-5 text-gray-400"/>
                                        <span>編輯角色</span>
                                    </a>
                                    <a href="#" onClick={() => handleAction('deactivate', user.id)} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                        <UserX className="mr-3 h-5 w-5 text-gray-400"/>
                                        <span>停用帳號</span>
                                    </a>
                                    <a href="#" onClick={() => handleAction('reset_password', user.id)} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                        <KeyRound className="mr-3 h-5 w-5 text-gray-400"/>
                                        <span>重置密碼</span>
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

        <div className="flex items-center justify-between py-3 px-1">
            <div className="text-sm text-gray-700 dark:text-gray-400">
                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> of <span className="font-medium">{filteredUsers.length}</span> results
            </div>
            <div className="flex items-center space-x-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                {[...Array.from({length: totalPages}, (_, i) => i)].map(n => (
                    <button key={n+1} onClick={() => setCurrentPage(n + 1)} className={`px-4 py-2 text-sm rounded-md ${currentPage === n + 1 ? 'bg-indigo-100 text-indigo-600 dark:bg-gray-700 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{n + 1}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
