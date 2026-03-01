import React from 'react';
import { useLiffContext } from '@/components/auth/LiffAuthProvider';
import { trpc } from '@/lib/trpc';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LiffMemberPage: React.FC = () => {
  const { user, loading, error: liffError, isAuthenticated } = useLiffContext();
  const organizationId = 1; // TODO: from context

  const { data: customer, isLoading: isLoadingCustomer, error: customerError } = trpc.customer.get.useQuery({
    id: user?.id ?? '',
  }, {
    enabled: !!user?.id,
  });

  const { data: appointments, isLoading: isLoadingAppointments, error: appointmentsError } = trpc.appointment.list.useQuery({
    organizationId,
    customerId: user?.id,
    limit: 5,
  }, {
    enabled: !!user?.id,
  });

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-500">正在載入會員資料...</p>
        </div>
      </div>
    );
  }

  if (isLoadingCustomer || isLoadingAppointments) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
      </div>
    );
  }

  if (customerError || appointmentsError || liffError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-sm">
          <p className="font-bold">載入失敗</p>
          <p className="text-sm">{(customerError || appointmentsError)?.message || liffError || '未知錯誤'}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } catch { return dateStr; }
  };

  const appointmentList = Array.isArray(appointments?.data) ? appointments.data : Array.isArray(appointments) ? appointments : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Profile Card */}
        <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 p-5 text-white">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarImage src={user?.pictureUrl} alt={customer?.name} />
                <AvatarFallback className="bg-green-700 text-white text-xl">
                  {customer?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl font-bold text-white">{customer?.name || user?.displayName || '會員'}</CardTitle>
                <p className="text-sm text-green-100 mt-1">
                  會員等級: <Badge className="bg-white/20 text-white border-0">{customer?.level || '一般會員'}</Badge>
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">電話</span>
              <span className="font-medium">{customer?.phone || '未提供'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{customer?.email || '未提供'}</span>
            </div>
            {customer?.birthday && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">生日</span>
                <span className="font-medium">{formatDate(customer.birthday)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointments Card */}
        <Card className="bg-white shadow-lg rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">近期預約</CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentList.length > 0 ? (
              <div className="divide-y">
                {appointmentList.map((apt: any) => (
                  <div key={apt.id} className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium text-sm">
                        {formatDate(apt.appointmentDate || apt.date)} {apt.startTime || ''}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{apt.productName || apt.serviceName || '未指定服務'}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                      {apt.status === 'confirmed' ? '已確認' : apt.status === 'completed' ? '已完成' : apt.status === 'pending' ? '待確認' : apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-6">沒有近期的預約紀錄</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiffMemberPage;
