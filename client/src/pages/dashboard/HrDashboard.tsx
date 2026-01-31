import React from 'react';
import { Users, Calendar, DollarSign, Clock, Briefcase, CheckCircle } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'On Duty' | 'Off Duty' | 'Leave';
  checkInTime?: string;
  monthlySales: number;
  commission: number;
}

const mockEmployees: Employee[] = [
  {
    id: 'E001',
    name: 'Dr. 陳醫師',
    role: '主治醫師',
    status: 'On Duty',
    checkInTime: '09:55 AM',
    monthlySales: 1200000,
    commission: 360000,
  },
  {
    id: 'E002',
    name: 'Dr. 林醫師',
    role: '兼任醫師',
    status: 'Off Duty',
    monthlySales: 450000,
    commission: 135000,
  },
  {
    id: 'E003',
    name: 'Amy',
    role: '諮詢師',
    status: 'On Duty',
    checkInTime: '09:45 AM',
    monthlySales: 800000,
    commission: 40000,
  },
  {
    id: 'E004',
    name: 'Jessica',
    role: '美容師',
    status: 'Leave',
    monthlySales: 300000,
    commission: 15000,
  },
  {
    id: 'E005',
    name: 'Kevin',
    role: '店長',
    status: 'On Duty',
    checkInTime: '09:30 AM',
    monthlySales: 0,
    commission: 50000, // Base + Bonus
  },
];

const HrDashboard: React.FC = () => {
  const getStatusBadgeClass = (status: Employee['status']) => {
    switch (status) {
      case 'On Duty':
        return 'bg-green-100 text-green-800';
      case 'Off Duty':
        return 'bg-gray-100 text-gray-800';
      case 'Leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">人資與薪酬管理</h1>
          <p className="mt-1 text-sm text-gray-500">員工出勤、排班與業績獎金計算</p>
        </div>
        <div className="flex space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Calendar className="-ml-1 mr-2 h-5 w-5" />
            排班表
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <DollarSign className="-ml-1 mr-2 h-5 w-5" />
            結算薪資
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">總員工數</dt>
                  <dd className="text-2xl font-semibold text-gray-900">12</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">今日出勤</dt>
                  <dd className="text-2xl font-semibold text-gray-900">8 / 12</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">本月遲到</dt>
                  <dd className="text-2xl font-semibold text-gray-900">3 次</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">預估發放獎金</dt>
                  <dd className="text-2xl font-semibold text-gray-900">NT$ 600K</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">員工狀態與業績概覽</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">職位</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">今日狀態</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">打卡時間</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">本月個人業績</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">預估獎金</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {employee.name.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.checkInTime || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">NT$ {employee.monthlySales.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">NT$ {employee.commission.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-indigo-600 hover:text-indigo-900">詳情</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;
