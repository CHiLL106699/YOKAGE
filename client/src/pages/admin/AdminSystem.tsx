import React, { useState, FC, PropsWithChildren, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Settings, Annoyed, Wrench, ChevronRight, Plus, Search, Edit, Trash2, X, Loader2, AlertCircle, Building, Languages, Clock, Users, CalendarDays, Info, ShieldAlert, Skull } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { QueryLoading, QueryError } from '@/components/ui/query-state';
import { Skeleton } from '@/components/ui/skeleton';

// --- TYPESCRIPT INTERFACES ---
type GlobalSettings = {
  platformName: string;
  defaultLanguage: 'en' | 'zh-TW' | 'ja';
  timezone: string;
  maxTenants: number;
  trialDays: number;
};

type AnnouncementType = 'info' | 'warning' | 'critical';
type Audience = 'all' | 'admins' | 'users';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  targetAudience: Audience;
  publishDate: string;
}

interface MaintenanceConfig {
  isEnabled: boolean;
  startTime: string;
  endTime: string;
  message: string;
}

// --- HELPER & LAYOUT COMPONENTS ---

const Card: FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

const AdminLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [location] = useLocation();
  const navItems = [
    { href: '/admin/dashboard', icon: Settings, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'User Management' },
    { href: '/admin/system', icon: Wrench, label: 'System Settings' },
    { href: '/admin/billing', icon: Annoyed, label: 'Billing' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex">
      <aside className="w-16 md:w-64 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0">
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">YOChiLL</h1>
        </div>
        <nav className="mt-6">
          <ul>
            {navItems.map(item => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a className={`flex items-center p-4 text-sm font-medium transition-colors duration-200 ${location === item.href ? 'bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 border-r-4 border-indigo-500' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                    <item.icon className="h-5 w-5 mr-0 md:mr-3" />
                    <span className="hidden md:inline">{item.label}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

const LoadingSpinner: FC = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
  </div>
);

const ErrorMessage: FC<{ message: string, onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md my-4" role="alert">
    <div className="flex justify-between items-center">
        <div className="flex">
            <AlertCircle className="h-5 w-5 mr-3" />
            <div>
                <p className="font-bold">Error</p>
                <p>{message}</p>
            </div>
        </div>
        {onRetry && <button onClick={onRetry} className="px-3 py-1 border border-red-500 text-red-500 rounded-md text-sm hover:bg-red-200 dark:hover:bg-red-900/30">Retry</button>}
    </div>
  </div>
);

// --- SECTION COMPONENTS ---

const GlobalSettingsSection: FC = () => {
  const utils = trpc.useUtils();
  const { data: settingsData, isLoading, error, refetch } = trpc.superAdmin.getSystemSettingsByCategory.useQuery({ category: 'system' });

  const [settings, setSettings] = useState<GlobalSettings | null>(null);

  useEffect(() => {
    if (settingsData) {
      const formattedSettings = settingsData.reduce<Record<string, any>>((acc, item) => {
        let value: any = item.value ?? '';
        if (item.key === 'maxTenants' || item.key === 'trialDays') {
          value = parseInt(value as string, 10) || 0;
        }
        return { ...acc, [item.key]: value };
      }, {}) as unknown as GlobalSettings;
      setSettings(formattedSettings);
    }
  }, [settingsData]);

  const updateSettingMutation = trpc.superAdmin.saveSystemSetting.useMutation({
    onSuccess: (data, variables) => {
        // Invalidate the specific category query to refetch
        utils.superAdmin.getSystemSettingsByCategory.invalidate({ category: 'system' });
    },
    // Optional: onError handling
  });

  const handleSave = () => {
    if (!settings) return;

    const originalSettings = settingsData?.reduce<Record<string, string>>((acc, item) => ({ ...acc, [item.key]: item.value ?? '' }), {}) || {};

    Object.entries(settings).forEach(([key, value]) => {
        const originalValue = (originalSettings as Record<string, string>)[key];
        const currentValue = String(value);
        if (originalValue !== currentValue) {
            updateSettingMutation.mutate({ key, value: currentValue, category: 'system' });
        }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? ({ ...prev, [name]: name === 'maxTenants' || name === 'trialDays' ? parseInt(value, 10) : value }) : null);
  };

  if (isLoading) return <Card><h2 className="text-xl font-bold mb-4 flex items-center"><Building className="mr-2"/>全域參數</h2><QueryLoading/></Card>;
  if (error) return <Card><h2 className="text-xl font-bold mb-4 flex items-center"><Building className="mr-2"/>全域參數</h2><QueryError message={error.message} onRetry={() => refetch()} /></Card>;
  if (!settings) return null;

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 flex items-center"><Building className="mr-2"/>全域參數</h2>
      {updateSettingMutation.error && <ErrorMessage message={updateSettingMutation.error.message} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="platformName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Platform Name</label>
          <input type="text" id="platformName" name="platformName" value={settings.platformName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Language</label>
          <select id="defaultLanguage" name="defaultLanguage" value={settings.defaultLanguage} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            <option value="en">English</option>
            <option value="zh-TW">繁體中文</option>
            <option value="ja">日本語</option>
          </select>
        </div>
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
          <input type="text" id="timezone" name="timezone" value={settings.timezone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="maxTenants" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Tenants</label>
          <input type="number" id="maxTenants" name="maxTenants" value={settings.maxTenants} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="trialDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trial Days</label>
          <input type="number" id="trialDays" name="trialDays" value={settings.trialDays} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={updateSettingMutation.isPending} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-600">
          {updateSettingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
        </button>
      </div>
    </Card>
  );
};

const AnnouncementsSection: FC = () => {
  const utils = trpc.useUtils();
  const { data: announcementsData, isLoading, error, refetch } = trpc.superAdmin.getSystemSettingsByCategory.useQuery({ category: 'notification' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);

  const announcements: Announcement[] = announcementsData?.map(item => { try { return JSON.parse(item.value ?? '{}') as Announcement; } catch { return null; } }).filter((a): a is Announcement => a !== null) || [];

  const saveMutation = trpc.superAdmin.saveSystemSetting.useMutation({
    onSuccess: () => {
      utils.superAdmin.getSystemSettingsByCategory.invalidate({ category: 'notification' });
      closeModal();
    }
  });

  const openModal = (announcement: Announcement | null = null) => {
    setCurrentAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentAnnouncement(null);
  };

  const handleSave = (announcement: Announcement) => {
    const id = announcement.id || `anno-${Date.now()}`;
    const finalAnnouncement = { ...announcement, id };
    saveMutation.mutate({ 
        key: `announcement_${id}`,
        value: JSON.stringify(finalAnnouncement),
        category: 'notification',
        description: `Announcement: ${finalAnnouncement.title}`
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
        // To delete, we save an empty value. A dedicated delete mutation would be better.
        saveMutation.mutate({ key: `announcement_${id}`, value: 'DELETED', category: 'notification' });
    }
  };

  const Badge: FC<{type: AnnouncementType}> = ({ type }) => {
    const styles = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    const icons = {
        info: <Info className="h-4 w-4 mr-1.5"/>,
        warning: <ShieldAlert className="h-4 w-4 mr-1.5"/>,
        critical: <Skull className="h-4 w-4 mr-1.5"/>,
    }
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type]}`}>{icons[type]} {type}</span>;
  };

  return (
    <Card className="mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl font-bold mb-4 sm:mb-0 flex items-center"><CalendarDays className="mr-2"/>系統公告</h2>
        <button onClick={() => openModal()} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <Plus className="-ml-1 mr-2 h-5 w-5" /> Create Announcement
        </button>
      </div>
      {isLoading && <QueryLoading />}
      {error && <QueryError message={error.message} onRetry={() => refetch()} />}
      {saveMutation.isPending && <LoadingSpinner />}
      {saveMutation.error && <ErrorMessage message={saveMutation.error.message} />}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Audience</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Publish Date</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {!isLoading && announcements.filter(a => a.id).map((ann) => (
              <tr key={ann.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{ann.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge type={ann.type} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{ann.targetAudience}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ann.publishDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModal(ann)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-4"><Edit className="h-5 w-5"/></button>
                  <button onClick={() => handleDelete(ann.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><Trash2 className="h-5 w-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && <AnnouncementModal announcement={currentAnnouncement} onSave={handleSave} onClose={closeModal} isSaving={saveMutation.isPending} />}
    </Card>
  );
};

const AnnouncementModal: FC<{ announcement: Announcement | null, onSave: (announcement: Announcement) => void, onClose: () => void, isSaving: boolean }> = ({ announcement, onSave, onClose, isSaving }) => {
  const [formState, setFormState] = useState<Omit<Announcement, 'id'>>({
    title: announcement?.title || '',
    content: announcement?.content || '',
    type: announcement?.type || 'info',
    targetAudience: announcement?.targetAudience || 'all',
    publishDate: announcement?.publishDate || new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formState, id: announcement?.id || '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{announcement ? 'Edit' : 'Create'} Announcement</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <input type="text" name="title" id="title" value={formState.title} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
              <textarea name="content" id="content" value={formState.content} onChange={handleChange} required rows={4} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <select name="type" id="type" value={formState.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Audience</label>
                <select name="targetAudience" id="targetAudience" value={formState.targetAudience} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700">
                  <option value="all">All</option>
                  <option value="admins">Admins</option>
                  <option value="users">Users</option>
                </select>
              </div>
              <div>
                <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Publish Date</label>
                <input type="date" name="publishDate" id="publishDate" value={formState.publishDate} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700" />
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-600">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MaintenanceModeSection: FC = () => {
  const utils = trpc.useUtils();
  const { data: maintenanceData, isLoading, error, refetch } = trpc.superAdmin.getSystemSettingsByCategory.useQuery({ category: 'platform' });

  const [config, setConfig] = useState<MaintenanceConfig | null>(null);

  useEffect(() => {
    if (maintenanceData) {
      const formattedConfig = maintenanceData.reduce<Record<string, any>>((acc, item) => {
        let value: any = item.value ?? '';
        if (item.key === 'isEnabled') {
          value = value === 'true';
        }
        return { ...acc, [item.key]: value };
      }, {}) as unknown as MaintenanceConfig;
      setConfig(formattedConfig);
    }
  }, [maintenanceData]);

  const saveMutation = trpc.superAdmin.saveSystemSettings.useMutation({
      onSuccess: () => {
          utils.superAdmin.getSystemSettingsByCategory.invalidate({ category: 'platform' });
      }
  });

  const handleSave = () => {
    if (!config) return;
    const settingsToSave = Object.entries(config).map(([key, value]) => ({
        key,
        value: String(value),
        category: 'platform' as const
    }));
    saveMutation.mutate(settingsToSave); // Type assertion due to mismatch in function signature expectation
  };

  const handleToggle = () => {
    setConfig(prev => prev ? ({ ...prev, isEnabled: !prev.isEnabled }) : null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  if (isLoading) return <Card className="mt-8"><h2 className="text-xl font-bold mb-4 flex items-center"><Wrench className="mr-2"/>維護模式</h2><QueryLoading/></Card>;
  if (error) return <Card className="mt-8"><h2 className="text-xl font-bold mb-4 flex items-center"><Wrench className="mr-2"/>維護模式</h2><QueryError message={error.message} onRetry={() => refetch()} /></Card>;
  if (!config) return null;

  return (
    <Card className="mt-8">
      <h2 className="text-xl font-bold mb-4 flex items-center"><Wrench className="mr-2"/>維護模式</h2>
      {saveMutation.error && <ErrorMessage message={saveMutation.error.message} />}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Maintenance Mode</span>
        <button
          type="button"
          className={`${config.isEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
          role="switch"
          aria-checked={config.isEnabled}
          onClick={handleToggle}
        >
          <span
            aria-hidden="true"
            className={`${config.isEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
          />
        </button>
      </div>
      {config.isEnabled && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scheduled Start Time</label>
              <input type="datetime-local" id="startTime" name="startTime" value={config.startTime} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scheduled End Time</label>
              <input type="datetime-local" id="endTime" name="endTime" value={config.endTime} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700" />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maintenance Message</label>
            <textarea id="message" name="message" value={config.message} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700" />
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saveMutation.isPending} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-600">
          {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
        </button>
      </div>
    </Card>
  );
};

// --- MAIN PAGE COMPONENT ---

const AdminSystemPage: FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <GlobalSettingsSection />
        <AnnouncementsSection />
        <MaintenanceModeSection />
      </div>
    </AdminLayout>
  );
};

export default AdminSystemPage;
