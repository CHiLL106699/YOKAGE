import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, Calendar, Clock, Home, StickyNote, Sun, Moon, Sunrise, Coffee } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useStaffContext } from '@/hooks/useStaffContext';
import { PageLoadingSkeleton, PageError, CalendarSkeleton } from '@/components/ui/page-skeleton';

// --- TYPES --- //
type ShiftType = 'morning' | 'afternoon' | 'evening' | 'full' | 'off' | 'custom';

// --- HELPERS --- //
const SHIFT_LEGEND: Record<ShiftType, { label: string; color: string; textColor: string }> = {
  morning: { label: '早班', color: 'bg-blue-100', textColor: 'text-blue-800' },
  afternoon: { label: '午班', color: 'bg-amber-100', textColor: 'text-amber-800' },
  evening: { label: '晚班', color: 'bg-purple-100', textColor: 'text-purple-800' },
  full: { label: '全天', color: 'bg-green-100', textColor: 'text-green-800' },
  off: { label: '休假', color: 'bg-gray-100', textColor: 'text-gray-500' },
  custom: { label: '自訂', color: 'bg-indigo-100', textColor: 'text-indigo-800' },
};

const StaffSchedulePage = () => {
  const { organizationId, staffId, staffName, isLoading: ctxLoading } = useStaffContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Date range for API
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  // --- tRPC Queries --- //
  const schedulesQuery = trpc.schedule.list.useQuery(
    { organizationId, staffId, startDate, endDate },
    { enabled: !ctxLoading }
  );

  const rawSchedules: any[] = Array.isArray(schedulesQuery.data) ? schedulesQuery.data : (schedulesQuery.data as any)?.data ?? [];

  // Build schedule map: date -> schedule
  const scheduleMap = useMemo(() => {
    const map: Record<string, any> = {};
    rawSchedules.forEach((s: any) => {
      const dateKey = s.scheduleDate ?? '';
      map[dateKey] = s;
    });
    return map;
  }, [rawSchedules]);

  const calendarDays = useMemo(() => {
    const days: { key: string; isEmpty?: boolean; day?: number; date?: Date }[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ key: `empty-${i}`, isEmpty: true });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ key: `day-${i}`, day: i, date: new Date(year, month, i) });
    }
    return days;
  }, [year, month, daysInMonth, startingDayOfWeek]);

  const handleMonthChange = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    setSelectedDate(null);
  };

  const selectedSchedule = useMemo(() => {
    if (!selectedDate) return null;
    const dateString = selectedDate.toISOString().split('T')[0];
    return scheduleMap[dateString] ?? null;
  }, [selectedDate, scheduleMap]);

  // Calculate week summary from schedules
  const weekSummary = useMemo(() => {
    let totalMinutes = 0;
    rawSchedules.forEach((s: any) => {
      if (s.startTime && s.endTime) {
        const [sh, sm] = s.startTime.split(':').map(Number);
        const [eh, em] = s.endTime.split(':').map(Number);
        totalMinutes += (eh * 60 + em) - (sh * 60 + sm);
      }
    });
    const workHours = Math.round(totalMinutes / 60);
    const overtime = Math.max(0, workHours - (rawSchedules.length * 8));
    return { workHours, overtime };
  }, [rawSchedules]);

  if (ctxLoading || schedulesQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
        <header className="flex items-center justify-between mb-6">
          <Link href="/staff">
            <a className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
              <ChevronLeft className="w-5 h-5 mr-2" />
              返回員工主頁
            </a>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">個人班表</h1>
          <div className="w-24"></div>
        </header>
        <CalendarSkeleton />
      </div>
    );
  }

  if (schedulesQuery.isError) {
    return <PageError message="無法載入排班資料" onRetry={() => schedulesQuery.refetch()} />;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
      <header className="flex items-center justify-between mb-6">
        <Link href="/staff">
          <a className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
            <ChevronLeft className="w-5 h-5 mr-2" />
            返回員工主頁
          </a>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">個人班表</h1>
        <div className="w-24"></div>
      </header>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:space-x-8">
          {/* --- Calendar View --- */}
          <div className="flex-grow md:w-2/3">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><ChevronLeft /></button>
              <h2 className="text-xl font-semibold text-gray-700">
                {year} 年 {currentDate.toLocaleString('zh-TW', { month: 'long' })}
              </h2>
              <button onClick={() => handleMonthChange(1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><ChevronRight /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="font-medium text-gray-500 py-2">{day}</div>
              ))}
              {calendarDays.map(dayInfo => {
                if (dayInfo.isEmpty) return <div key={dayInfo.key}></div>;
                const dateString = dayInfo.date!.toISOString().split('T')[0];
                const schedule = scheduleMap[dateString];
                const shiftType: ShiftType = (schedule?.shiftType as ShiftType) ?? 'off';
                const legend = SHIFT_LEGEND[shiftType] ?? SHIFT_LEGEND.off;
                const isSelected = selectedDate?.toDateString() === dayInfo.date?.toDateString();
                const isToday = dateString === todayStr;

                return (
                  <div
                    key={dayInfo.key}
                    onClick={() => setSelectedDate(dayInfo.date ?? null)}
                    className={`p-1 cursor-pointer border-2 rounded-lg transition-all duration-200 ${isSelected ? 'border-indigo-500 scale-105' : isToday ? 'border-indigo-300' : 'border-transparent hover:bg-gray-100'}`}>
                    <div className={`w-full aspect-square flex flex-col items-center justify-center rounded-md ${legend.color}`}>
                      <span className={`font-semibold ${legend.textColor}`}>
                        {dayInfo.day}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- Details Panel --- */}
          <div className="md:w-1/3 mt-8 md:mt-0 md:border-l md:pl-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">排班詳情</h3>
            {selectedDate ? (
              <div className="space-y-4 text-gray-700">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="font-semibold text-lg">{selectedDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  {selectedSchedule ? (
                    <p className={`mt-1 font-bold text-xl ${(SHIFT_LEGEND[(selectedSchedule.shiftType as ShiftType) ?? 'full'] ?? SHIFT_LEGEND.full).textColor}`}>
                      {(SHIFT_LEGEND[(selectedSchedule.shiftType as ShiftType) ?? 'full'] ?? SHIFT_LEGEND.full).label}
                    </p>
                  ) : (
                    <p className="mt-1 font-bold text-xl text-gray-500">休假</p>
                  )}
                </div>
                {selectedSchedule ? (
                  <>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-3 text-gray-400" />
                      <span>{selectedSchedule.startTime?.substring(0, 5) ?? 'N/A'} - {selectedSchedule.endTime?.substring(0, 5) ?? 'N/A'}</span>
                    </div>
                    {selectedSchedule.notes && (
                      <div className="flex items-start">
                        <StickyNote className="w-5 h-5 mr-3 text-gray-400 mt-1" />
                        <span className="whitespace-pre-wrap">{selectedSchedule.notes}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">本日無排班</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50 rounded-lg min-h-[120px]">
                <p>請選擇一個日期查看詳情</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t">
              <h4 className="font-bold text-gray-800 mb-3">本月摘要</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">排班天數</span>
                  <span className="font-semibold text-gray-800">{rawSchedules.length} 天</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">預估工時</span>
                  <span className="font-semibold text-gray-800">{weekSummary.workHours}h</span>
                </div>
                {weekSummary.overtime > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">加班</span>
                    <span className="font-semibold text-red-500">{weekSummary.overtime}h</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <h4 className="font-bold text-gray-800 mb-3">圖例</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {(Object.entries(SHIFT_LEGEND) as [ShiftType, typeof SHIFT_LEGEND[ShiftType]][]).map(([key, item]) => (
                  <div key={key} className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${item.color}`}></span>
                    <span className={item.textColor}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="text-center mt-8">
        <p className="text-sm text-gray-500">Powered by <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">YOChiLL</span></p>
      </footer>
    </div>
  );
};

export default StaffSchedulePage;
