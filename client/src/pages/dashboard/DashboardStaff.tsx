import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { QueryLoading, QueryError } from '@/components/ui/query-state';

interface Staff {
  id: number;
  name: string;
  role: string;
  [key: string]: any;
}

const DashboardStaff = () => {
  const organizationId = 1; // TODO: from context
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: staffData, isLoading, error, refetch } = trpc.staff.list.useQuery({
    organizationId,
  }, {
    enabled: !!organizationId,
  });

  const staffList: Staff[] = ((staffData as any)?.data ?? staffData ?? []).map((s: any) => ({
    id: s.id,
    name: s.name || `員工 #${s.id}`,
    role: s.role || s.position || '員工',
    ...s,
  }));

  if (isLoading) return <QueryLoading variant="skeleton-cards" />;
  if (error) return <QueryError message={error.message} onRetry={refetch} />;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">員工管理</h1>
          <p className="text-muted-foreground mt-2">管理診所員工資訊與排班</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
          >
            {viewMode === 'grid' ? '列表檢視' : '卡片檢視'}
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {staffList.map((staff) => (
            <div key={staff.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg">{staff.name}</h3>
              <p className="text-muted-foreground">{staff.role}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">姓名</th>
                <th className="p-4 text-left">職位</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff.id} className="border-t">
                  <td className="p-4">{staff.name}</td>
                  <td className="p-4">{staff.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DashboardStaff;
