import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronRight, Clock, Calendar, CheckCircle, XCircle } from "lucide-react";

const Breadcrumb = () => (
  <nav aria-label="breadcrumb" className="mb-6 flex items-center text-sm text-muted-foreground">
    <Link to="/staff" className="hover:text-foreground">Staff</Link>
    <ChevronRight className="mx-2 h-4 w-4" />
    <span className="text-foreground">Clock In/Out</span>
  </nav>
);

const ClockDisplay = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="my-8 text-center">
      <p className="text-7xl font-bold tracking-tighter text-foreground">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
      <p className="mt-2 text-lg text-muted-foreground">
        {time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
};

const AttendanceRecord = () => {
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (clockInTime) {
      intervalId = setInterval(() => {
        setDuration(Math.floor((new Date().getTime() - clockInTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [clockInTime]);

  const handleClockIn = () => {
    setClockInTime(new Date());
    setDuration(0);
  };

  const handleClockOut = () => {
    // In a real app, this would save the final record to the backend.
    setClockInTime(null);
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full max-w-md gap-4">
        <button 
          onClick={handleClockIn}
          disabled={!!clockInTime}
          className="flex-1 rounded-lg bg-blue-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          Clock In
        </button>
        <button 
          onClick={handleClockOut}
          disabled={!clockInTime}
          className="flex-1 rounded-lg bg-red-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          Clock Out
        </button>
      </div>
      {clockInTime && (
        <div className="w-full max-w-md rounded-lg border bg-card p-4 text-card-foreground">
          <h3 className="font-semibold">Today's Record</h3>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Clock In Time:</span>
            <span>{clockInTime.toLocaleTimeString()}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-muted-foreground">Work Duration:</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const mockHistory = [
  { date: "2026-02-16", clockIn: "09:01:15", clockOut: "18:05:30", duration: "9h 4m", status: "On Time" },
  { date: "2026-02-15", clockIn: "09:10:45", clockOut: "18:02:10", duration: "8h 51m", status: "Late" },
  { date: "2026-02-14", clockIn: "08:58:20", clockOut: "17:30:00", duration: "8h 31m", status: "On Time" },
  { date: "2026-02-13", clockIn: "09:05:00", clockOut: "18:15:22", duration: "9h 10m", status: "On Time" },
  { date: "2026-02-12", clockIn: "N/A", clockOut: "N/A", duration: "N/A", status: "Absent" },
  { date: "2026-02-11", clockIn: "08:55:50", clockOut: "18:01:05", duration: "9h 5m", status: "On Time" },
  { date: "2026-02-10", clockIn: "09:03:18", clockOut: "17:50:45", duration: "8h 47m", status: "On Time" },
];

const AttendanceHistory = () => (
  <div className="mt-12">
    <h3 className="mb-4 text-lg font-semibold">Recent 7-Day Attendance</h3>
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-border bg-card text-card-foreground">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Clock In</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Clock Out</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Duration</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {mockHistory.map((record, index) => (
            <tr key={index}>
              <td className="whitespace-nowrap px-6 py-4 text-sm">{record.date}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">{record.clockIn}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">{record.clockOut}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">{record.duration}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${record.status === 'On Time' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : record.status === 'Late' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                  {record.status === 'On Time' && <CheckCircle className="mr-1.5 h-4 w-4" />}
                  {record.status === 'Late' && <Clock className="mr-1.5 h-4 w-4" />}
                  {record.status === 'Absent' && <XCircle className="mr-1.5 h-4 w-4" />}
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const StaffClock = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Breadcrumb />
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
          <Clock className="h-8 w-8" />
          Clock In / Out
        </h1>
        <p className="mt-2 text-muted-foreground">Manage your work hours and view attendance history.</p>
      </header>

      <main>
        <div className="mx-auto max-w-4xl">
          <ClockDisplay />
          <AttendanceRecord />
          <AttendanceHistory />
        </div>
      </main>
    </div>
  );
};

export default StaffClock;
