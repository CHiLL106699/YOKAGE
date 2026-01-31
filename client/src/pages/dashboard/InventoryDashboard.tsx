import React from 'react';
import { Package, Box, AlertCircle, Plus, Settings } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const InventoryDashboard: React.FC = () => {
  const { data: inventoryItems, isLoading } = trpc.dashboardB.inventory.list.useQuery();

  // Calculate stats based on real data
  const totalValue = inventoryItems?.reduce((acc, item) => acc + (item.quantity || 0) * 100, 0) || 0;
  const lowStockItems = inventoryItems?.filter(item => (item.quantity || 0) < (item.minStock || 10)).length || 0;
  // const expiredItems = inventoryItems?.filter(item => item.expiryDate && new Date(item.expiryDate) < new Date()).length || 0;
  const expiredItems = 0; // TODO: Fix date comparison

  const getStatusBadgeClass = (quantity: number, minStock: number) => {
    if (quantity <= 0) return 'bg-red-100 text-red-800';
    if (quantity < minStock) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (quantity: number, minStock: number) => {
    if (quantity <= 0) return 'Out of Stock';
    if (quantity < minStock) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">庫存管理</h1>
        <div className="flex space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            新增項目
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Settings className="-ml-1 mr-2 h-5 w-5" />
            設定
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Card 1: Total Value */}
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">總庫存價值</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">NT$ {totalValue.toLocaleString()}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Card 2: Low Stock Items */}
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <Box className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">低庫存項目</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{lowStockItems}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Card 3: Expired Items */}
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">已過期項目</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{expiredItems}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Inventory Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">庫存清單</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">項目 ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名稱</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">類別</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">庫存量</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最低庫存</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">到期日</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                  </tr>
                ) : inventoryItems?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{String(item.id).substring(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Product {String(item.productId).substring(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.minStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(item.quantity, item.minStock || 10)}`}>
                        {getStatusText(item.quantity, item.minStock || 10)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
