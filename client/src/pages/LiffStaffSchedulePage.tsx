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
  Coffee,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useStaffContext } from "@/hooks/useStaffContext";
import { PageLoadingSkeleton, PageError } from "@/components/ui/page-skeleton";

const shiftConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  "早班": { icon: Sun, color: "text-orange-600", bgColor: "bg-orange-100" },
  "中班": { icon: Coffee, color: "text-blue-600", bgColor: "bg-blue-100" },
  "晚班": { icon: Moon, color: "text-purple-600", bgColor: "bg-purple-100" },
  "休假": { icon: Calendar, color: "text-gray-400", bgColor: "bg-gray-100" },
};

export default function LiffStaffSchedulePage() {
  const { organizationId, staffId, isLoading: ctxLoading } = useStaffContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch schedules for the current month
  const scheduleQuery = trpc.schedule.list.useQuery(
    { organizationId, staffId, limit: 100 },
    { enabled: !ctxLoading }
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
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
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
  };

  if (ctxLoading || scheduleQuery.isLoading) {
    return <PageLoadingSkeleton message="載入班表..." />;
  }

  if (scheduleQuery.isError) {
    return <PageError message="無法載入班表" onRetry={() => scheduleQuery.refetch()} />;
  }

  const rawSchedules = scheduleQuery.data;
  const allSchedules: any[] = Array.isArray(rawSchedules) ? rawSchedules : (rawSchedules as any)?.data ?? [];

  // Build schedule map by date
  const scheduleMap: Record<string, any> = {};
  allSchedules.forEach((schedule: any) => {
    const dateKey = schedule.date ?? schedule.scheduleDate;
    if (dateKey) {
      scheduleMap[dateKey] = schedule;
    }
  });

  // Calculate monthly stats
  const monthStats = allSchedules
    .filter((s: any) => {
      const dateKey = s.date ?? s.scheduleDate;
      return dateKey?.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`);
    })
    .reduce(
      (acc: any, schedule: any) => {
        const shiftType = schedule.shiftType ?? schedule.shift ?? "休假";
        if (shiftType !== "休假") {
          acc.workDays++;
          if (shiftType === "早班") acc.morningShifts++;
          else if (shiftType === "中班") acc.afternoonShifts++;
          else if (shiftType === "晚班") acc.eveningShifts++;
        } else {
          acc.offDays++;
        }
        return acc;
      },
      { workDays: 0, offDays: 0, morningShifts: 0, afternoonShifts: 0, eveningShifts: 0 }
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/liff/member">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">班表</h1>
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
              {/* Week day headers */}
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-bold text-gray-500 py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateKey = formatDateKey(day);
                const schedule = scheduleMap[dateKey];
                const shiftType = schedule?.shiftType ?? schedule?.shift ?? "休假";
                const config = shiftConfig[shiftType] ?? shiftConfig["休假"];
                const ShiftIcon = config.icon;

                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-center text-xs font-medium transition-colors ${
                      isToday(day)
                        ? "bg-blue-100 border-2 border-blue-500"
                        : `${config.bgColor} ${config.color}`
                    }`}
                  >
                    <span>{day}</span>
                    <ShiftIcon className="w-3 h-3 mt-0.5" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">本月統計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{monthStats.workDays}</p>
                <p className="text-xs text-gray-500">出勤天數</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{monthStats.morningShifts}</p>
                <p className="text-xs text-gray-500">早班</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{monthStats.eveningShifts}</p>
                <p className="text-xs text-gray-500">晚班</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shift Legend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">班別說明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(shiftConfig).map(([shift, config]) => {
                const Icon = config.icon;
                return (
                  <div key={shift} className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded ${config.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-3 h-3 ${config.color}`} />
                    </div>
                    <span className="text-sm">{shift}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
