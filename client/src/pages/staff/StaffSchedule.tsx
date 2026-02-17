
import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, Calendar, Clock, Home, StickyNote } from 'lucide-react';

// --- TYPES --- //
type ShiftType = 'early' | 'late' | 'off' | 'special';

interface ScheduleEntry {
  shift: ShiftType;
  startTime: string;
  endTime: string;
  room: string;
  notes: string;
}

interface MockScheduleData {
  [date: string]: ScheduleEntry;
}

// --- MOCK DATA --- //
const mockData: MockScheduleData = {
  '2026-02-02': { shift: 'early', startTime: '09:00', endTime: '18:00', room: '診療室 A', notes: '常規檢查' },
  '2026-02-03': { shift: 'early', startTime: '09:00', endTime: '18:00', room: '診療室 A', notes: '' },
  '2026-02-04': { shift: 'late', startTime: '13:00', endTime: '22:00', room: '診療室 B', notes: '跟進預約' },
  '2026-02-05': { shift: 'late', startTime: '13:00', endTime: '22:00', room: '診療室 B', notes: '會議' },
  '2026-02-06': { shift: 'early', startTime: '09:00', endTime: '19:00', room: '診療室 A', notes: '加班 1 小時' },
  '2026-02-09': { shift: 'early', startTime: '09:00', endTime: '18:00', room: '診療室 A', notes: '' },
  '2026-02-10': { shift: 'special', startTime: 'N/A', endTime: 'N/A', room: 'N/A', notes: '年度特休' },
  '2026-02-11': { shift: 'late', startTime: '13:00', endTime: '22:00', room: '診療室 C', notes: '' },
  '2026-02-12': { shift: 'late', startTime: '13:00', endTime: '22:00', room: '診療室 B', notes: '' },
  '2026-02-13': { shift: 'early', startTime: '09:00', endTime: '18:00', room: '診療室 A', notes: '' },
  '2026-02-16': { shift: 'early', startTime: '09:00', endTime: '18:00', room: '診療室 A', notes: '' },
  '2026-02-17': { shift: 'late', startTime: '13:00', endTime: '22:00', room: '診療室 B', notes: '' },
  '2026-02-18': { shift: 'early', startTime: '09:00', endTime: '19:00', room: '診療室 A', notes: '加班 1 小時' },
  '2026-02-19': { shift: 'late', startTime: '13:00', endTime: '22:00', room: '診療室 C', notes: '' },
  '2026-02-20': { shift: 'early', startTime: '09:00', endTime: '18:00', room: '診療室 A', notes: '' },
  '2026-02-23': { shift: 'early', startTime: '09:00', endTime: '18:00', room: '診療室 A', notes: '' },
  '2026-02-24': { shift: 'late', startTime: '13:00', endTime: '22:00', room: '診療室 B', notes: '' },
  '2026-02-25': { shift: 'late', startTime: '13:00', endTime: '22:00', room: '診療室 B', notes: '' },
  '2026-02-26': { shift: 'special', startTime: 'N/A', endTime: 'N/A', room: 'N/A', notes: '年度特休' },
  '2026-02-27': { shift: 'early', startTime: '09:00', endTime: '18:00', room: '診療室 A', notes: '' },
};

// --- HELPERS --- //
const SHIFT_LEGEND: Record<ShiftType, { label: string; color: string; textColor: string }> = {
  early: { label: '早班', color: 'bg-blue-100', textColor: 'text-blue-800' },
  late: { label: '晚班', color: 'bg-purple-100', textColor: 'text-purple-800' },
  off: { label: '休假', color: 'bg-gray-100', textColor: 'text-gray-500' },
  special: { label: '特休', color: 'bg-green-100', textColor: 'text-green-800' },
};

const StaffSchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Feb 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 1, 2));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ...

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ key: `empty-${i}`, isEmpty: true });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ key: `day-${i}`, day: i, isToday: false, date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i) });
    }
    return days;
  }, [currentDate, daysInMonth, startingDayOfWeek]);

  const handleMonthChange = (offset: number) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
      setSelectedDate(null);
      setIsLoading(false);
    }, 500); // Simulate network latency
  };

  const selectedSchedule = useMemo(() => {
    if (!selectedDate) return null;
    const dateString = selectedDate.toISOString().split('T')[0];
    return mockData[dateString] || { shift: 'off', startTime: 'N/A', endTime: 'N/A', room: 'N/A', notes: '本日無排班' };
  }, [selectedDate]);

  const weekSummary = {
    workHours: 40,
    overtime: 2,
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-red-500 bg-red-100 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">發生錯誤</h2>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="mt-6 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">重試</button>
        </div>
      </div>
    );
  }

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
                {currentDate.getFullYear()} 年 {currentDate.toLocaleString('default', { month: 'long' })}
              </h2>
              <button onClick={() => handleMonthChange(1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><ChevronRight /></button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                  <div key={day} className="font-medium text-gray-500 py-2">{day}</div>
                ))}
                {calendarDays.map(dayInfo => {
                  if (dayInfo.isEmpty) return <div key={dayInfo.key}></div>;
                  const dateString = dayInfo.date!.toISOString().split('T')[0];
                  const schedule = mockData[dateString];
                  const isSelected = selectedDate?.toDateString() === dayInfo.date?.toDateString();

                  return (
                    <div
                      key={dayInfo.key}
                      onClick={() => setSelectedDate(dayInfo.date ?? null)}
                      className={`p-1 cursor-pointer border-2 rounded-lg transition-all duration-200 ${isSelected ? 'border-indigo-500 scale-105' : 'border-transparent hover:bg-gray-100'}`}>
                      <div className={`w-full aspect-square flex flex-col items-center justify-center rounded-md ${schedule ? SHIFT_LEGEND[schedule.shift].color : SHIFT_LEGEND.off.color}`}>
                        <span className={`font-semibold ${schedule ? SHIFT_LEGEND[schedule.shift].textColor : SHIFT_LEGEND.off.textColor}`}>
                          {dayInfo.day}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* --- Details Panel --- */}
          <div className="md:w-1/3 mt-8 md:mt-0 md:border-l md:pl-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">排班詳情</h3>
            {selectedDate && selectedSchedule ? (
              <div className="space-y-4 text-gray-700">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="font-semibold text-lg">{selectedDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className={`mt-1 font-bold text-xl ${SHIFT_LEGEND[selectedSchedule.shift].textColor}`}>{SHIFT_LEGEND[selectedSchedule.shift].label}</p>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{selectedSchedule.startTime} - {selectedSchedule.endTime}</span>
                </div>
                <div className="flex items-center">
                  <Home className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{selectedSchedule.room}</span>
                </div>
                <div className="flex items-start">
                  <StickyNote className="w-5 h-5 mr-3 text-gray-400 mt-1" />
                  <span className="whitespace-pre-wrap">{selectedSchedule.notes || '無特別備註'}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50 rounded-lg">
                <p>請選擇一個日期查看詳情</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t">
              <h4 className="font-bold text-gray-800 mb-3">本週摘要</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">本週工時</span>
                  <span className="font-semibold text-gray-800">{weekSummary.workHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">加班</span>
                  <span className="font-semibold text-red-500">{weekSummary.overtime}h</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <h4 className="font-bold text-gray-800 mb-3">圖例</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {Object.values(SHIFT_LEGEND).map(item => (
                  <div key={item.label} className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${item.color.replace('bg-', 'border-2 border-')}`}></span>
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
