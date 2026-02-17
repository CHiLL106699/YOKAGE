import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { QueryError } from '@/components/ui/query-state';

import { 
  CalendarCheck, 
  CalendarX, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle,
  UserPlus,
  Bell
} from "lucide-react";

export default function AttendanceTrackingPage() {
  const [organizationId] = useState(1);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // 到診率統計
  const { data: attendanceStats, isLoading: statsLoading, isError, refetch } = trpc.appointment.getAttendanceStats.useQuery({
    organizationId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // 爽約分析
  const { data: noShowAnalysis, isLoading: analysisLoading } = trpc.appointment.getNoShowAnalysis.useQuery({
    organizationId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // 候補名單
  const { data: waitlist, isLoading: waitlistLoading } = trpc.appointment.getWaitlist.useQuery({
    organizationId,
  });

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getNoShowColor = (rate: number) => {
    if (rate <= 5) return "text-green-600";
    if (rate <= 10) return "text-yellow-600";
    return "text-red-600";
  };

  if (isError) {

    return (

      <div className="p-6">

        <QueryError message="載入資料時發生錯誤，請稍後再試" onRetry={refetch} />

      </div>

    );

  }


  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">預約到診率追蹤</h1>
          <p className="text-muted-foreground">監控預約到診情況，分析爽約原因，管理候補名單</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="startDate">開始日期</Label>
            <Input
              id="startDate"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="endDate">結束日期</Label>
            <Input
              id="endDate"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-40"
            />
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總預約數</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">選定期間內的預約總數</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">到診率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAttendanceColor(attendanceStats?.attendanceRate || 0)}`}>
              {attendanceStats?.attendanceRate || 0}%
            </div>
            <Progress value={attendanceStats?.attendanceRate || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {attendanceStats?.completed || 0} / {attendanceStats?.total || 0} 已到診
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">爽約率</CardTitle>
            <CalendarX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getNoShowColor(attendanceStats?.noShowRate || 0)}`}>
              {attendanceStats?.noShowRate || 0}%
            </div>
            <Progress value={attendanceStats?.noShowRate || 0} className="mt-2 [&>div]:bg-red-500" />
            <p className="text-xs text-muted-foreground mt-1">
              {attendanceStats?.noShow || 0} 次爽約
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">取消數</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats?.cancelled || 0}</div>
            <p className="text-xs text-muted-foreground">
              佔總預約 {attendanceStats?.total ? Math.round((attendanceStats.cancelled / attendanceStats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 詳細分析 */}
      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis">爽約分析</TabsTrigger>
          <TabsTrigger value="waitlist">候補名單</TabsTrigger>
          <TabsTrigger value="trends">趨勢分析</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 按星期分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">按星期分析</CardTitle>
                <CardDescription>各星期爽約分布情況</CardDescription>
              </CardHeader>
              <CardContent>
                {analysisLoading ? (
                  <div className="text-center py-4 text-muted-foreground">載入中...</div>
                ) : noShowAnalysis?.byDayOfWeek && noShowAnalysis.byDayOfWeek.length > 0 ? (
                  <div className="space-y-3">
                    {noShowAnalysis.byDayOfWeek.map((item) => (
                      <div key={item.day} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.day}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${Math.min((item.count / Math.max(...noShowAnalysis.byDayOfWeek.map(d => d.count))) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>太棒了！選定期間內沒有爽約記錄</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 按時段分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">按時段分析</CardTitle>
                <CardDescription>各時段爽約分布情況</CardDescription>
              </CardHeader>
              <CardContent>
                {analysisLoading ? (
                  <div className="text-center py-4 text-muted-foreground">載入中...</div>
                ) : noShowAnalysis?.byTimeSlot && noShowAnalysis.byTimeSlot.length > 0 ? (
                  <div className="space-y-3">
                    {noShowAnalysis.byTimeSlot.map((item) => (
                      <div key={item.slot} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{item.slot}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${Math.min((item.count / Math.max(...noShowAnalysis.byTimeSlot.map(d => d.count))) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>沒有時段分析資料</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 高風險客戶 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                高風險客戶
              </CardTitle>
              <CardDescription>爽約次數較多的客戶，建議加強確認或收取訂金</CardDescription>
            </CardHeader>
            <CardContent>
              {analysisLoading ? (
                <div className="text-center py-4 text-muted-foreground">載入中...</div>
              ) : noShowAnalysis?.byCustomer && noShowAnalysis.byCustomer.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {noShowAnalysis.byCustomer.map((item) => (
                    <div key={item.customerId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">客戶 #{item.customerId}</p>
                          <p className="text-xs text-muted-foreground">需加強確認</p>
                        </div>
                      </div>
                      <Badge variant="destructive">{item.noShowCount} 次爽約</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>沒有高風險客戶</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-500" />
                候補名單管理
              </CardTitle>
              <CardDescription>當有預約取消時，可自動通知候補客戶</CardDescription>
            </CardHeader>
            <CardContent>
              {waitlistLoading ? (
                <div className="text-center py-4 text-muted-foreground">載入中...</div>
              ) : waitlist && waitlist.length > 0 ? (
                <div className="space-y-3">
                  {waitlist.map((item: Record<string, any>) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">客戶 #{item.customerId}</p>
                          <p className="text-sm text-muted-foreground">
                            希望日期：{new Date(item.preferredDate).toLocaleDateString('zh-TW')}
                            {item.preferredTimeSlot && ` ${item.preferredTimeSlot}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.status === 'waiting' ? 'secondary' : 'default'}>
                          {item.status === 'waiting' ? '等待中' : 
                           item.status === 'notified' ? '已通知' : 
                           item.status === 'booked' ? '已預約' : '已取消'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Bell className="h-4 w-4 mr-1" />
                          通知
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">目前沒有候補客戶</p>
                  <p className="text-sm">當客戶無法預約到理想時段時，可加入候補名單</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">月度趨勢</CardTitle>
              <CardDescription>爽約數量的月度變化趨勢</CardDescription>
            </CardHeader>
            <CardContent>
              {analysisLoading ? (
                <div className="text-center py-4 text-muted-foreground">載入中...</div>
              ) : noShowAnalysis?.trends && noShowAnalysis.trends.length > 0 ? (
                <div className="space-y-3">
                  {noShowAnalysis.trends.map((item) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.month}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-48 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-red-500 h-3 rounded-full" 
                            style={{ width: `${Math.min((item.count / Math.max(...noShowAnalysis.trends.map(d => d.count), 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{item.count} 次</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>沒有趨勢資料</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
