
import { useState, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useLiffContext } from '@/components/auth/LiffAuthProvider';
import { QueryLoading, QueryError } from '@/components/ui/query-state';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Calendar as CalendarIcon, User, Scissors, MessageSquare } from 'lucide-react';
import { format, parse, add, startOfDay } from 'date-fns';

const organizationId = 1; // TODO: from context

// Helper to generate time slots from schedules
const generateTimeSlots = (schedules: any[], selectedDate: Date): string[] => {
  if (!schedules || schedules.length === 0) return [];

  const slots = new Set<string>();
  const now = new Date();
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

  schedules.forEach(schedule => {
    // Assuming startTime and endTime are in 'HH:mm' format
    const startTime = parse(schedule.startTime, 'HH:mm', selectedDate);
    const endTime = parse(schedule.endTime, 'HH:mm', selectedDate);

    let currentTime = startTime;
    while (currentTime < endTime) {
      if (!isToday || (isToday && currentTime > now)) {
        slots.add(format(currentTime, 'HH:mm'));
      }
      currentTime = add(currentTime, { minutes: 30 });
    }
  });

  return Array.from(slots).sort();
};

export default function LiffBookingPage() {
  const { user, isReady: liffReady, error: liffError } = useLiffContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfDay(new Date()));
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (liffError) {
      toast.error('LIFF 初始化失敗，請稍後再試。');
    }
  }, [liffError]);

  const { data: productsData, isLoading: productsLoading, error: productsError } = trpc.product.list.useQuery({ organizationId });

  const { data: scheduleData, isLoading: scheduleLoading, error: scheduleError } = trpc.schedule.list.useQuery(
    {
      organizationId,
      startDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
      endDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
    },
    { enabled: !!selectedDate }
  );

  const createAppointmentMutation = trpc.appointment.create.useMutation({
    onSuccess: () => {
      toast.success('預約成功！感謝您的預約，我們將盡快與您確認。');
      setSelectedDate(startOfDay(new Date()));
      setSelectedTime(undefined);
      setSelectedProductId(undefined);
      setNotes('');
      // liff.closeWindow();
    },
    onError: (error) => {
      toast.error(`預約失敗: ${error.message}`);
    },
  });

  const availableTimeSlots = useMemo(() => {
    if (!scheduleData || !selectedDate) return [];
    return generateTimeSlots(scheduleData, selectedDate);
  }, [scheduleData, selectedDate]);

  const handleBooking = () => {
    if (!liffReady || !user) {
      toast.error('使用者資訊尚未準備好，請稍候...');
      return;
    }
    if (!selectedDate || !selectedTime || !selectedProductId) {
      toast.warning('請選擇完整的預約資訊：服務、日期和時間。');
      return;
    }

    createAppointmentMutation.mutate({
      organizationId,
      // Assuming liff user id can be mapped to customer id
      // This might need a lookup: customer.getByLineId
      customerId: user.userId, // This is a potential issue, might need a proper customer ID.
      productId: parseInt(selectedProductId, 10),
      appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
      startTime: selectedTime,
      notes,
      source: 'LIFF',
    });
  };

  if (!liffReady) {
    return <QueryLoading message="正在載入 LIFF..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4" style={{ backgroundColor: '#F0F0F0' }}>
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <header className="p-6 bg-green-600 text-white text-center">
          {user && (
            <div className="flex items-center justify-center mb-4">
              <Avatar className="h-16 w-16 mr-4">
                <AvatarImage src={user.pictureUrl} alt={user.displayName} />
                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold">嗨，{user.displayName}</h1>
                <p className="text-sm">歡迎預約我們的服務</p>
              </div>
            </div>
          )}
        </header>

        <main className="p-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center space-x-2 pb-2">
              <Scissors className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">1. 選擇服務項目</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading && <QueryLoading />}
              {productsError && <QueryError error={productsError} />}
              {productsData && (
                <Select onValueChange={setSelectedProductId} value={selectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇一個服務" />
                  </SelectTrigger>
                  <SelectContent>
                    {productsData.map((product: any) => (
                      <SelectItem key={product.id} value={String(product.id)}>
                        {product.name} - ${product.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-x-2 pb-2">
              <CalendarIcon className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">2. 選擇預約日期</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => { 
                  setSelectedDate(date ? startOfDay(date) : undefined);
                  setSelectedTime(undefined); // Reset time when date changes
                }}
                disabled={(date) => date < startOfDay(new Date())}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-x-2 pb-2">
              <Clock className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">3. 選擇預約時段</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduleLoading && <QueryLoading message="正在查詢可預約時段..." />}
              {scheduleError && <QueryError error={scheduleError} />}
              {!scheduleLoading && !scheduleError && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        onClick={() => setSelectedTime(time)}
                        className={selectedTime === time ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {time}
                      </Button>
                    ))
                  ) : (
                    <p className="col-span-full text-center text-gray-500">此日期無可預約時段，請選擇其他日期。</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-x-2 pb-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">4. 備註事項 (選填)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="若有特殊需求，請在此輸入..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-lg"
            onClick={handleBooking}
            disabled={createAppointmentMutation.isLoading}
          >
            {createAppointmentMutation.isLoading ? '正在送出預約...' : '確認預約'}
          </Button>
        </main>
      </div>
    </div>
  );
}
