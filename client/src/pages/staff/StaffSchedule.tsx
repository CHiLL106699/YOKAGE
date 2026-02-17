import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, startOfWeek, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";

// Mock Data
const mockShifts = [
  { date: "2026-07-14", type: "morning", startTime: "09:00", endTime: "13:00" },
  { date: "2026-07-15", type: "afternoon", startTime: "14:00", endTime: "18:00" },
  { date: "2026-07-16", type: "full", startTime: "09:00", endTime: "18:00" },
  { date: "2026-07-18", type: "morning", startTime: "09:00", endTime: "13:00" },
];

const shiftColors: { [key: string]: string } = {
  morning: "bg-blue-500 text-white",
  afternoon: "bg-green-500 text-white",
  full: "bg-purple-500 text-white",
};

const StaffSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date("2026-07-17"));

  const startDay = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDay, i));

  const handlePrevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground p-4 sm:p-6">
      <header className="mb-6">
        <div className="flex items-center mb-2">
          <Link to="/staff" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Staff</Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <h1 className="text-lg font-semibold">Schedule</h1>
        </div>
        <div className="flex items-center justify-between mt-4">
          <h2 className="text-2xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handlePrevWeek} className="p-2 rounded-md hover:bg-muted">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="text-sm font-medium px-4 py-2 rounded-md hover:bg-muted border">
              Today
            </button>
            <button onClick={handleNextWeek} className="p-2 rounded-md hover:bg-muted">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-7 border-t border-l border-border">
        {weekDays.map((day) => (
          <div key={day.toString()} className="flex flex-col border-r border-b border-border">
            <div className="p-2 text-center font-medium text-sm border-b border-border bg-muted/50">
              <div>{format(day, "EEE")}</div>
              <div className="text-2xl font-bold">{format(day, "d")}</div>
            </div>
            <div className="flex-1 p-1 space-y-1">
              {mockShifts
                .filter((shift) => format(new Date(shift.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))
                .map((shift, index) => (
                  <div key={index} className={`p-2 rounded-md text-xs ${shiftColors[shift.type]}`}>
                    <p className="font-semibold capitalize">{shift.type} Shift</p>
                    <p>{shift.startTime} - {shift.endTime}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffSchedule;
