
import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Settings, Building, Clock, Briefcase, ChevronDown, Plus, X, Image as ImageIcon, Upload, Trash2, Edit, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";
import { toast } from "sonner";




// Type Definitions
type ClinicInfo = any;
type BusinessHour = any;
type Service = any;

// Main Component
const DashboardSettingsPage = () => {
  const organizationId = 1; // TODO: from context
  
  const { data: settingsData, isLoading: settingsLoading, error: settingsError, refetch: refetchSettings } = trpc.settings.list.useQuery(
    { is_global: false },
  );
  
  const { data: orgData } = trpc.organization.current.useQuery();
  
  const updateSettingMutation = trpc.settings.update.useMutation({
    onSuccess: () => { toast.success("設定已儲存"); refetchSettings(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const isLoading = settingsLoading;
  const settings = settingsData ?? [];

  const [location, setLocation] = useLocation();
  
  

  
// Section Components
const ServiceManagementSection = () => {
  const [services, setServices] = useState<Service[]>(([] as any[]));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const openModal = (service: Service | null = null) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSaveService = (service: Service) => {
    if (editingService) {
      setServices(services.map(s => s.id === service.id ? service : s));
    } else {
      setServices([...services, { ...service, id: `S${Date.now()}` }]);
    }
    closeModal();
  };

  const toggleStatus = (serviceId: string) => {
    setServices(services.map(s => s.id === serviceId ? { ...s, status: !s.status } : s));
  };

  if (isLoading) return <QueryLoading variant="skeleton-cards" />;

  if (settingsError) return <QueryError message={settingsError.message} onRetry={refetchSettings} />;


  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center"><Briefcase className="w-5 h-5 mr-2 text-indigo-500"/>服務項目管理</h3>
        <button onClick={() => openModal()} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          新增服務
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">服務名稱</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時長 (分)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">價格</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分類</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">編輯</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map(service => (
              <tr key={service.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.duration}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${service.price.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    type="button"
                    className={`${service.status ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    onClick={() => toggleStatus(service.id)}
                  >
                    <span className="sr-only">Toggle Status</span>
                    <span aria-hidden="true" className={`${service.status ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}/>
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModal(service)} className="text-indigo-600 hover:text-indigo-900"><Edit className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && <ServiceModal service={editingService} onSave={handleSaveService} onClose={closeModal} />}
    </div>
  );
};

const ServiceModal = ({ service, onSave, onClose }: { service: Service | null, onSave: (service: Service) => void, onClose: () => void }) => {
  const [formData, setFormData] = useState<Omit<Service, 'id'>>({
    name: service?.name || '',
    duration: service?.duration || 30,
    price: service?.price || 0,
    category: service?.category || '基礎護理',
    status: service?.status ?? true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<Service, 'id' | 'status'>, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof Omit<Service, 'id' | 'status'>, string>> = {};
    if (!formData.name) newErrors.name = '服務名稱為必填項';
    if (formData.duration <= 0) newErrors.duration = '時長必須大於 0';
    if (formData.price < 0) newErrors.price = '價格不能為負數';
    if (!formData.category) newErrors.category = '分類為必填項';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...formData, id: service?.id || '' });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{service ? '編輯服務' : '新增服務'}</h3>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700">服務名稱</label>
            <input type="text" id="serviceName" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">時長 (分鐘)</label>
            <input type="number" id="duration" value={formData.duration} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.duration ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
            {errors.duration && <p className="mt-1 text-xs text-red-500">{errors.duration}</p>}
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">價格</label>
            <input type="number" id="price" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">分類</label>
            <input type="text" id="category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} type="button" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">取消</button>
          <button onClick={handleSave} type="button" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">儲存</button>
        </div>
      </div>
    </div>
  );
};

const BusinessHoursSection = () => {
  const [hours, setHours] = useState<BusinessHour[]>(([] as any[]));
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleHourChange = (index: number, field: keyof BusinessHour, value: any) => {
    const newHours = [...hours];
    (newHours[index] as any)[field] = value;
    setHours(newHours);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-indigo-500"/>營業時間</h3>
      <div className="space-y-4">
        {hours.map((h, index) => (
          <div key={index} className="grid grid-cols-3 sm:grid-cols-5 gap-4 items-center p-3 rounded-md bg-gray-50">
            <div className="col-span-3 sm:col-span-1 font-medium text-gray-800">{h.day}</div>
            <div className="flex items-center space-x-2">
              <input type="time" value={h.open} onChange={e => handleHourChange(index, 'open', e.target.value)} disabled={!h.isOpen} className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-200" />
              <span>-</span>
              <input type="time" value={h.close} onChange={e => handleHourChange(index, 'close', e.target.value)} disabled={!h.isOpen} className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-200" />
            </div>
            <div className="flex items-center justify-end col-span-2 sm:col-span-1">
                <span className={`text-sm mr-3 ${h.isOpen ? 'text-gray-800' : 'text-gray-500'}`}>{h.isOpen ? '營業' : '休息'}</span>
                <button
                    type="button"
                    className={`${h.isOpen ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    onClick={() => handleHourChange(index, 'isOpen', !h.isOpen)}
                >
                    <span className="sr-only">Use setting</span>
                    <span
                        aria-hidden="true"
                        className={`${h.isOpen ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={isSaving} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed">
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              儲存中...
            </>
          ) : saveSuccess ? (
            <><CheckCircle className="-ml-1 mr-2 h-5 w-5"/> 儲存成功!</>
          ) : (
            <><Save className="-ml-1 mr-2 h-5 w-5"/> 儲存變更</>
          )}
        </button>
      </div>
    </div>
  );
};

const ClinicInfoSection = () => {
  const [info, setInfo] = useState<ClinicInfo>(orgData ?? {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ClinicInfo, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof ClinicInfo, string>> = {};
    if (!info.name) newErrors.name = '診所名稱為必填項';
    if (!info.phone) newErrors.phone = '聯絡電話為必填項';
    if (!info.email) {
      newErrors.email = '電子郵件為必填項';
    } else if (!/\S+@\S+\.\S+/.test(info.email)) {
      newErrors.email = '電子郵件格式不正確';
    }
    if (!info.address) newErrors.address = '診所地址為必填項';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    setSaveSuccess(false);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfo({ ...info, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center"><Building className="w-5 h-5 mr-2 text-indigo-500"/>基本資訊</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700">診所名稱</label>
            <input type="text" id="clinicName" value={info.name} onChange={e => setInfo({...info, name: e.target.value})} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="clinicPhone" className="block text-sm font-medium text-gray-700">聯絡電話</label>
            <input type="text" id="clinicPhone" value={info.phone} onChange={e => setInfo({...info, phone: e.target.value})} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="clinicEmail" className="block text-sm font-medium text-gray-700">電子郵件</label>
            <input type="email" id="clinicEmail" value={info.email} onChange={e => setInfo({...info, email: e.target.value})} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
           <div className="sm:col-span-2">
            <label htmlFor="clinicAddress" className="block text-sm font-medium text-gray-700">診所地址</label>
            <input type="text" id="clinicAddress" value={info.address} onChange={e => setInfo({...info, address: e.target.value})} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">診所 Logo</label>
          <div className="mt-1 flex justify-center items-center w-full h-40 border-2 border-gray-300 border-dashed rounded-md">
            {info.logo ? (
              <div className="relative group">
                 <img src={info.logo} alt="Clinic Logo" className="h-36 w-auto object-contain" />
                 <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setInfo({...info, logo: null})} className="text-white"><Trash2 size={24} /></button>
                 </div>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <span>上傳圖片</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                </label>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
        </div>
        <div className="md:col-span-3">
            <label htmlFor="clinicDescription" className="block text-sm font-medium text-gray-700">診所描述</label>
            <textarea id="clinicDescription" rows={4} value={info.description} onChange={e => setInfo({...info, description: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={isSaving} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed">
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              儲存中...
            </>
          ) : saveSuccess ? (
            <><CheckCircle className="-ml-1 mr-2 h-5 w-5"/> 儲存成功!</>
          ) : (
            <><Save className="-ml-1 mr-2 h-5 w-5"/> 儲存變更</>
          )}
        </button>
      </div>
    </div>
  );
};

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">YOChiLL</h1>
        </div>
        <nav className="mt-6">
          <Link href="/dashboard/settings" className="flex items-center px-6 py-3 text-gray-700 bg-gray-200">
            <Settings className="w-5 h-5" />
            <span className="mx-3">診所設定</span>
          </Link>
          {/* Other links can be added here */}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b">
          <h2 className="text-xl font-semibold">診所設定</h2>
        </header>
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Content will be rendered here */}
          <div className="space-y-6">
            <ClinicInfoSection />
            <BusinessHoursSection />
            <ServiceManagementSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardSettingsPage;

