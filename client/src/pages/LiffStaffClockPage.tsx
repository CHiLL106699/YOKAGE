"use client";

import { useState, useEffect } from "react";
import { useLiffContext } from "@/components/auth/LiffAuthProvider";
import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, LogIn, LogOut, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const LiffStaffClockPage = () => {
  const { user, loading, error: liffError, isAuthenticated } = useLiffContext();
  const organizationId = 1; // TODO: from context
  const staffId = profile?.sub; // Assuming liff user.sub is the staffId

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading || !profile) {
    return <QueryLoading message="載入 LIFF 資料中..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">YOKAGE 打卡</h1>
          <p className="text-gray-500">{format(currentTime, "yyyy-MM-dd")}</p>
        </header>

        <main>
          <ClockCard currentTime={currentTime} profile={profile} />
          <RecentRecords staffId={staffId} />
        </main>
      </div>
    </div>
  );
};

const ClockCard = ({ currentTime, profile }) => {
  const organizationId = 1; // TODO: from context
  const staffId = profile?.sub;

  const { data: todayStatus, isLoading, error, refetch } = (trpc as any).attendance.getTodayStatus.useQuery(
    { organizationId, staffId },
    { enabled: !!staffId }
  );

  const clockInMutation = (trpc as any).attendance.clockIn.useMutation({
    onSuccess: () => {
      toast.success("打卡上班成功！");
      refetch();
    },
    onError: (err) => {
      toast.error(`打卡失敗: ${err.message}`);
    },
  });

  const clockOutMutation = (trpc as any).attendance.clockOut.useMutation({
    onSuccess: () => {
      toast.success("打卡下班成功！");
      refetch();
    },
    onError: (err) => {
      toast.error(`打卡失敗: ${err.message}`);
    },
  });

  const handleClockIn = () => {
    clockInMutation.mutate({ organizationId, staffId });
  };

  const handleClockOut = () => {
    if (todayStatus?.id) {
      clockOutMutation.mutate({ id: todayStatus.id });
    } else {
      toast.error("找不到今日的打卡記錄");
    }
  };

  if (isLoading) return <QueryLoading message="讀取打卡狀態..." />;
  if (error) return <QueryError error={error.message} />;

  const clockedIn = todayStatus && todayStatus.clock_in && !todayStatus.clock_out;

  return (
    <Card className="mb-6 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.pictureUrl} alt={user.displayName} />
            <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{user.displayName}</h2>
            <p className="text-sm text-gray-500">Staff ID: {staffId}</p>
          </div>
        </div>
        <div className="text-center p-4 bg-gray-100 rounded-lg mb-4">
          <p className="text-4xl font-bold text-gray-800">
            {format(currentTime, "HH:mm:ss")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleClockIn}
            disabled={clockedIn || clockInMutation.isLoading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <LogIn className="mr-2 h-4 w-4" />
            {clockInMutation.isLoading ? "處理中..." : "上班打卡"}
          </Button>
          <Button
            onClick={handleClockOut}
            disabled={!clockedIn || clockOutMutation.isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {clockOutMutation.isLoading ? "處理中..." : "下班打卡"}
          </Button>
        </div>
        {clockedIn && todayStatus.clock_in && (
          <p className="text-center text-sm text-green-600 mt-4">
            已於 {format(new Date(todayStatus.clock_in), "HH:mm")} 打卡上班
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const RecentRecords = ({ staffId }) => {
  const organizationId = 1; // TODO: from context
  const { data: records, isLoading, error } = (trpc as any).attendance.listRecords.useQuery(
    { organizationId, staffId, limit: 5 },
    { enabled: !!staffId }
  );

  if (isLoading) return <QueryLoading message="讀取最近記錄..." />;
  if (error) return <QueryError error={error.message} />;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          最近五筆打卡記錄
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {records && records.length > 0 ? (
            records.map((record) => (
              <li key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-semibold">{format(new Date(record.clock_in), "yyyy-MM-dd")}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(record.clock_in), "HH:mm:ss")} - {record.clock_out ? format(new Date(record.clock_out), "HH:mm:ss") : "尚未下班"}
                  </p>
                </div>
                <div className={`text-sm font-medium px-2 py-1 rounded-full ${record.clock_out ? 'bg-gray-200 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                  {record.clock_out ? "已完成" : "進行中"}
                </div>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">沒有最近的打卡記錄</p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default LiffStaffClockPage;
