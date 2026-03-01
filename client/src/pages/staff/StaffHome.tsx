import React from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Bell, Calendar } from 'lucide-react';

const StaffHome: React.FC = () => {
  const organizationId = 1; // TODO: from context
  const staffId = 1; // TODO: from context or auth

  const { data: staff, isLoading: isLoadingStaff, error: staffError } = trpc.staff.get.useQuery({ id: staffId });

  const { data: attendanceStatus, isLoading: isLoadingAttendance } = (trpc as any).attendance.getTodayStatus.useQuery(
    { organizationId, staffId },
    { retry: false }
  );

  const { data: appointmentsRaw, isLoading: isLoadingAppointments } = trpc.appointment.list.useQuery({
    organizationId,
    date: new Date().toISOString().split('T')[0],
    limit: 5,
  });

  const { data: notificationsRaw, isLoading: isLoadingNotifications } = trpc.notification.getNotificationLog.useQuery({
    organizationId,
    limit: 3,
  });

  const clockInMutation = (trpc as any).attendance.clockIn.useMutation({
    onSuccess: () => toast.success('打卡成功'),
    onError: (err: any) => toast.error(`打卡失敗: ${err.message}`),
  });

  const clockOutMutation = (trpc as any).attendance.clockOut.useMutation({
    onSuccess: () => toast.success('簽退成功'),
    onError: (err: any) => toast.error(`簽退失敗: ${err.message}`),
  });

  const appointments = Array.isArray(appointmentsRaw?.data) ? appointmentsRaw.data : Array.isArray(appointmentsRaw) ? appointmentsRaw : [];
  const notifications = Array.isArray(notificationsRaw?.data) ? notificationsRaw.data : Array.isArray(notificationsRaw) ? notificationsRaw : [];

  const formatTime = (dateStr: string) => {
    try { const d = new Date(dateStr); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }
    catch { return dateStr; }
  };

  const formatDate = (dateStr: string) => {
    try { const d = new Date(dateStr); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${formatTime(dateStr)}`; }
    catch { return dateStr; }
  };

  const Spinner = () => <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div></div>;

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-screen">
      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          {isLoadingStaff ? <Spinner /> : staffError ? (
            <p className="text-red-500 text-sm">{staffError.message}</p>
          ) : staff ? (
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={staff.avatar_url || undefined} alt={staff.name} />
                <AvatarFallback>{staff.name?.charAt(0) || 'S'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{staff.name}</h2>
                <p className="text-sm text-gray-500">{staff.title || '員工'}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Clock In/Out Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base"><Clock className="mr-2" size={18} /> 今日打卡</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAttendance ? <Spinner /> : (
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <p className="font-semibold">
                  狀態: <Badge variant={attendanceStatus?.status === 'clocked_in' ? 'default' : 'secondary'}>
                    {attendanceStatus?.status === 'clocked_in' ? '工作中' : '未打卡'}
                  </Badge>
                </p>
                {attendanceStatus?.clock_in_time && (
                  <p className="text-sm text-gray-500 mt-1">打卡時間: {formatTime(attendanceStatus.clock_in_time)}</p>
                )}
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={() => clockInMutation.mutate({ organizationId, staffId })}
                  disabled={attendanceStatus?.status === 'clocked_in' || clockInMutation.isPending}
                >
                  上班打卡
                </Button>
                <Button
                  onClick={() => attendanceStatus?.id && clockOutMutation.mutate({ id: attendanceStatus.id })}
                  variant="destructive"
                  disabled={attendanceStatus?.status !== 'clocked_in' || clockOutMutation.isPending}
                >
                  下班簽退
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base"><Calendar className="mr-2" size={18} /> 今日預約</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAppointments ? <Spinner /> : appointments.length > 0 ? (
            <div className="divide-y">
              {appointments.map((appt: any) => (
                <div key={appt.id} className="flex justify-between items-center py-3">
                  <div>
                    <p className="font-semibold text-sm">{appt.customerName || appt.customer?.name || '未知客戶'}</p>
                    <p className="text-xs text-gray-500">{appt.startTime || ''} - {appt.productName || appt.product?.name || '未指定項目'}</p>
                  </div>
                  <Badge variant={appt.status === 'confirmed' ? 'default' : 'secondary'}>{appt.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-4">今日沒有預約</p>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base"><Bell className="mr-2" size={18} /> 最新通知</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingNotifications ? <Spinner /> : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((n: any) => (
                <div key={n.id} className="py-3">
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(n.created_at || n.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-4">沒有新通知</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffHome;
