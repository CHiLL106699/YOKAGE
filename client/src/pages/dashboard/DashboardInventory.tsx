
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Search, PlusCircle, Inbox, AlertTriangle, Package, PackageCheck, ChevronDown, X } from 'lucide-react';

// --- TYPES --- //
type ProductStatus = '正常' | '低庫存' | '缺貨';

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  safetyStock: number;
  price: number;
  status: ProductStatus;
};

// --- MOCK DATA --- //
const mockProducts: Product[] = Array.from({ length: 20 }).map((_, i) => {
  const stock = Math.floor(Math.random() * 200);
  const safetyStock = 50;
  let status: ProductStatus = '正常';
  if (stock === 0) {
    status = '缺貨';
  } else if (stock < safetyStock) {
    status = '低庫存';
  }

  return {
    id: `product-${i + 1}`,
    name: `高效能濾藍光鏡片 #${i + 1}`,
    sku: `YCL-BLP-2024-${String(i + 1).padStart(4, '0')}`,
    category: i % 4 === 0 ? '太陽眼鏡' : i % 4 === 1 ? '日常眼鏡' : i % 4 === 2 ? '運動眼鏡' : '兒童眼鏡',
    stock,
    safetyStock,
    price: 1200 + Math.floor(Math.random() * 1500),
    status,
  };
});

const productCategories = ['所有分類', '太陽眼鏡', '日常眼鏡', '運動眼鏡', '兒童眼鏡'];

// --- HELPER COMPONENTS --- //

const StatCard = ({ icon, title, value, subtext }: { icon: React.ReactNode; title: string; value: string; subtext: string }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{subtext}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: ProductStatus }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
  const statusClasses = {
    '正常': "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    '低庫存': "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    '缺貨': "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-full overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X size={24} />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  </div>
);

// --- MAIN DASHBOARD LAYOUT (Placeholder) --- //
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  // This is a placeholder for the actual DashboardLayout
  // In a real app, this would contain the sidebar, header, etc.
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex">
      {/* Sidebar Placeholder */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md hidden lg:block p-4">
        <div className="flex items-center space-x-2 mb-10">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg"></div>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-violet-600">YOChiLL</span>
        </div>
        <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center p-2 text-gray-500 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</Link>
            <Link href="/dashboard/inventory" className="flex items-center p-2 bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-white rounded-md font-semibold">Inventory</Link>
            <Link href="/dashboard/orders" className="flex items-center p-2 text-gray-500 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Orders</Link>
            <Link href="/dashboard/customers" className="flex items-center p-2 text-gray-500 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Customers</Link>
        </nav>
      </div>
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

// --- INVENTORY PAGE COMPONENT --- //
const InventoryPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('所有分類');
  const [isNewProductModalOpen, setNewProductModalOpen] = useState(false);
  const [isStockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    const timer = setTimeout(() => {
      try {
        setProducts(mockProducts);
        setError(null);
      } catch (e) {
        setError('無法載入商品資料，請稍後再試。');
      }
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => selectedCategory === '所有分類' || p.category === selectedCategory)
      .filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [products, searchTerm, selectedCategory]);

  const lowStockItems = useMemo(() => {
    return products.filter(p => p.status === '低庫存' || p.status === '缺貨');
  }, [products]);

  const handleStockModalOpen = (product: Product) => {
    setSelectedProduct(product);
    setStockModalOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-full bg-red-50 dark:bg-red-900/20 p-8 rounded-lg">
          <AlertTriangle className="w-16 h-16 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-red-700 dark:text-red-300">發生錯誤</h2>
          <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">庫存管理</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Package size={24} className="text-indigo-500" />} title="商品總數" value="234" subtext="所有品項" />
          <StatCard icon={<AlertTriangle size={24} className="text-red-500" />} title="低庫存警示" value="12" subtext="需立即處理" />
          <StatCard icon={<Inbox size={24} className="text-green-500" />} title="本月進貨" value="NT$120,000" subtext="成本總計" />
          <StatCard icon={<PackageCheck size={24} className="text-blue-500" />} title="本月出貨" value="NT$89,000" subtext="銷售總計" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Product Table */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text"
                  placeholder="搜尋商品名稱或SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-48">
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full appearance-none pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                        {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
                <button 
                  onClick={() => setNewProductModalOpen(true)}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity"
                >
                  <PlusCircle size={20} />
                  <span>新增商品</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">商品名稱</th>
                    <th scope="col" className="px-6 py-3">SKU</th>
                    <th scope="col" className="px-6 py-3">分類</th>
                    <th scope="col" className="px-6 py-3 text-right">庫存量</th>
                    <th scope="col" className="px-6 py-3 text-right">安全庫存</th>
                    <th scope="col" className="px-6 py-3 text-right">單價</th>
                    <th scope="col" className="px-6 py-3 text-center">狀態</th>
                    <th scope="col" className="px-6 py-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{product.name}</th>
                      <td className="px-6 py-4">{product.sku}</td>
                      <td className="px-6 py-4">{product.category}</td>
                      <td className="px-6 py-4 text-right font-mono">{product.stock}</td>
                      <td className="px-6 py-4 text-right font-mono">{product.safetyStock}</td>
                      <td className="px-6 py-4 text-right font-mono">${product.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center"><StatusBadge status={product.status} /></td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleStockModalOpen(product)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">庫存變更</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side Panel: Low Stock Alerts */}
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow-md self-start">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">低庫存警示</h3>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {lowStockItems.length > 0 ? (
                lowStockItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                    <div>
                      <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${item.status === '缺貨' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{item.stock}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">/{item.safetyStock}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">所有商品庫存充足。</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isNewProductModalOpen && (
        <Modal title="新增商品" onClose={() => setNewProductModalOpen(false)}>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">商品名稱</label>
              <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700" />
            </div>
            {/* Add other form fields here */}
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => setNewProductModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">取消</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-indigo-500 to-violet-600 rounded-md shadow-sm hover:opacity-90">儲存</button>
            </div>
          </form>
        </Modal>
      )}

      {isStockModalOpen && selectedProduct && (
        <Modal title={`庫存變更: ${selectedProduct.name}`} onClose={() => setStockModalOpen(false)}>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <p><span className="font-medium">SKU:</span> {selectedProduct.sku}</p>
                <p><span className="font-medium">目前庫存:</span> {selectedProduct.stock}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">操作類型</label>
              <select className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700">
                <option>進貨 (Stock In)</option>
                <option>出貨 (Stock Out)</option>
                <option>庫存調整</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">數量</label>
              <input type="number" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => setStockModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">取消</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-indigo-500 to-violet-600 rounded-md shadow-sm hover:opacity-90">確認變更</button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default InventoryPage;
