import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Sun,
  Moon,
  Coffee
} from "lucide-react";
import { Link } from "wouter";

// 模擬班表資料
const mockSchedule: Record<string, { shift: string; time: string; status: string }> = {
  "2024-01-15": { shift: "早班", time: "09:00 - 18:00", status: "working" },
  "2024-01-16": { shift: "早班", time: "09:00 - 18:00", status: "working" },
  "2024-01-17": { shift: "晚班", time: "13:00 - 22:00", status: "working" },
  "2024-01-18": { shift: "早班", time: "09:00 - 18:00", status: "working" },
  "2024-01-19": { shift: "休假", time: "-", status: "off" },
  "2024-01-20": { shift: "休假", time: "-", status: "off" },
  "2024-01-21": { shift: "早班", time: "09:00 - 18:00", status: "working" },
  "2024-01-22": { shift: "早班", time: "09:00 - 18:00", status: "working" },
  "2024-01-23": { shift: "中班", time: "11:00 - 20:00", status: "working" },
  "2024-01-24": { shift: "早班", time: "09:00 - 18:00", status: "working" },
  "2024-01-25": { shift: "早班", time: "09:00 - 18:00", status: "working" },
  "2024-01-26": { shift: "休假", time: "-", status: "off" },
  "2024-01-27": { shift: "休假", time: "-", status: "off" }
};

const shiftConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  "早班": { icon: Sun, color: "text-orange-600", bgColor: "bg-orange-100" },
  "中班": { icon: Coffee, color: "text-blue-600", bgColor: "bg-blue-100" },
  "晚班": { icon: Moon, color: "text-purple-600", bgColor: "bg-purple-100" },
  "休假": { icon: Calendar, color: "text-gray-400", bgColor: "bg-gray-100" }
};

export default function LiffStaffSchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 取得當月天數
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // 取得當月第一天是星期幾
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return year === today.getFullYear() && 
           month === today.getMonth() && 
           day === today.getDate();
  };

  // 計算本月統計
  const monthStats = Object.entries(mockSchedule)
    .filter(([date]) => date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`))
    .reduce((acc, [_, schedule]) => {
      if (schedule.status === "working") {
        acc.workDays++;
        if (schedule.shift === "早班") acc.morningShifts++;
        else if (schedule.shift === "中班") acc.afternoonShifts++;
        else if (schedule.shift === "晚班") acc.nightShifts++;
      } else {
        acc.offDays++;
      }
      return acc;
    }, { workDays: 0, offDays: 0, morningShifts: 0, afternoonShifts: 0, nightShifts: 0 });

  const selectedSchedule = selectedDate ? mockSchedule[selectedDate] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/liff/staff/clock">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">班表查詢</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Month Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-bold">
                {year} 年 {month + 1} 月
              </h2>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Week Headers */}
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm text-gray-500 py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before first day of month */}
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square" />
              ))}

              {/* Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dateKey = formatDateKey(day);
                const schedule = mockSchedule[dateKey];
                const ShiftIcon = schedule ? shiftConfig[schedule.shift]?.icon : null;

                return (
                  <button
                    key={day}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors ${
                      isToday(day) ? "ring-2 ring-blue-500" : ""
                    } ${
                      selectedDate === dateKey ? "bg-blue-100" : "hover:bg-gray-100"
                    } ${
                      schedule?.status === "off" ? "text-gray-400" : ""
                    }`}
                    onClick={() => setSelectedDate(dateKey)}
                  >
                    <span className={isToday(day) ? "font-bold text-blue-600" : ""}>
                      {day}
                    </span>
                    {schedule && ShiftIcon && (
                      <ShiftIcon className={`w-3 h-3 mt-0.5 ${shiftConfig[schedule.shift]?.color}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Sun className="w-4 h-4 text-orange-500" />
            <span>早班</span>
          </div>
          <div className="flex items-center gap-1">
            <Coffee className="w-4 h-4 text-blue-500" />
            <span>中班</span>
          </div>
          <div className="flex items-center gap-1">
            <Moon className="w-4 h-4 text-purple-500" />
            <span>晚班</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>休假</span>
          </div>
        </div>

        {/* Selected Date Detail */}
        {selectedSchedule && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {selectedDate?.replace(/-/g, "/")} 班表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${shiftConfig[selectedSchedule.shift]?.bgColor}`}>
                  {(() => {
                    const ShiftIcon = shiftConfig[selectedSchedule.shift]?.icon;
                    return ShiftIcon ? (
                      <ShiftIcon className={`w-7 h-7 ${shiftConfig[selectedSchedule.shift]?.color}`} />
                    ) : null;
                  })()}
                </div>
                <div>
                  <p className="text-xl font-bold">{selectedSchedule.shift}</p>
                  <p className="text-gray-500">{selectedSchedule.time}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Month Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              本月統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{monthStats.workDays}</p>
                <p className="text-xs text-gray-500">出勤天數</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-600">{monthStats.offDays}</p>
                <p className="text-xs text-gray-500">休假天數</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center p-2 bg-orange-50 rounded">
                <p className="font-bold text-orange-600">{monthStats.morningShifts}</p>
                <p className="text-xs text-gray-500">早班</p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <p className="font-bold text-blue-600">{monthStats.afternoonShifts}</p>
                <p className="text-xs text-gray-500">中班</p>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded">
                <p className="font-bold text-purple-600">{monthStats.nightShifts}</p>
                <p className="text-xs text-gray-500">晚班</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              近期班表
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(mockSchedule)
              .filter(([date]) => new Date(date) >= new Date())
              .slice(0, 7)
              .map(([date, schedule]) => {
                const ShiftIcon = shiftConfig[schedule.shift]?.icon;
                const dateObj = new Date(date);
                const dayOfWeek = weekDays[dateObj.getDay()];
                
                return (
                  <div 
                    key={date} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${shiftConfig[schedule.shift]?.bgColor}`}>
                        {ShiftIcon && (
                          <ShiftIcon className={`w-5 h-5 ${shiftConfig[schedule.shift]?.color}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {date.slice(5).replace("-", "/")} ({dayOfWeek})
                        </p>
                        <p className="text-sm text-gray-500">{schedule.time}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      className={schedule.status === "off" ? "text-gray-500" : "text-blue-600"}
                    >
                      {schedule.shift}
                    </Badge>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
