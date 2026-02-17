import { trpc } from '@/lib/trpc';
import { QueryLoading, QueryError } from '@/components/ui/query-state';

export default function HrDashboard() {
  const organizationId = 1; // TODO: from context

  const { data: staffData, isLoading: staffLoading, error: staffError, refetch: refetchStaff } = trpc.staff.list.useQuery(
    { organizationId: organizationId! },
    { enabled: !!organizationId }
  );

  const { data: attendanceData, isLoading: attLoading } = trpc.attendance.listRecords.useQuery(
    { organizationId: organizationId! },
    { enabled: !!organizationId }
  );

  const isLoading = staffLoading || attLoading;

  const getStatusColor = (status: string) => {
    switch (status) {
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <QueryLoading variant="skeleton" />;
  if (staffError) return <QueryError message={staffError.message} onRetry={refetchStaff} />;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
    </div>
  );
}
