import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Video, Plus, Calendar, Clock, User, Play, FileText, Phone } from "lucide-react";

export default function TeleconsultPage() {
  const [activeTab, setActiveTab] = useState("sessions");
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [scheduledTime, setScheduledTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [consultType, setConsultType] = useState("initial");
  const [notes, setNotes] = useState("");

  // 模擬客戶資料
  const mockCustomers = [
    { id: 1, name: "王小明" },
    { id: 2, name: "李小華" },
    { id: 3, name: "張美玲" },
  ];

  const { data: sessions, refetch: refetchSessions } = trpc.teleConsult.list.useQuery({
    organizationId: 1,
  });

  const createSessionMutation = trpc.teleConsult.create.useMutation({
    onSuccess: () => {
      toast.success("遠程諮詢已排程");
      setNewSessionOpen(false);
      resetForm();
      refetchSessions();
    },
    onError: (error: any) => {
      toast.error(`排程失敗: ${error.message}`);
    },
  });

  const handleStartSession = (id: number) => {
    toast.info("正在啟動視訊諮詢...");
    // 實際整合時會開啟視訊會議連結
  };

  const resetForm = () => {
    setSelectedCustomerId(null);
    setScheduledTime("");
    setDuration("30");
    setConsultType("initial");
    setNotes("");
  };

  const handleCreateSession = () => {
    if (!selectedCustomerId || !scheduledTime) {
      toast.error("請選擇客戶和時間");
      return;
    }
    createSessionMutation.mutate({
      organizationId: 1,
      customerId: selectedCustomerId,
      staffId: 1, // 假設當前登入的醫師 ID
      scheduledAt: new Date(scheduledTime).toISOString(),
      duration: parseInt(duration),
      consultationType: consultType as any,
      notes: notes || undefined,
    });
  };

  const consultTypeLabels: Record<string, string> = {
    initial: "初診諮詢",
    follow_up: "術後追蹤",
    treatment_plan: "療程規劃",
    emergency: "緊急諮詢",
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    scheduled: { label: "已排程", color: "bg-blue-100 text-blue-800" },
    in_progress: { label: "進行中", color: "bg-green-100 text-green-800" },
    completed: { label: "已完成", color: "bg-gray-100 text-gray-800" },
    cancelled: { label: "已取消", color: "bg-red-100 text-red-800" },
    no_show: { label: "未出席", color: "bg-yellow-100 text-yellow-800" },
  };

  // 計算統計
  const todaySessions = sessions?.data?.filter((s: any) => {
    const date = new Date(s.scheduledAt);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).length || 0;

  const completedSessions = sessions?.data?.filter((s: any) => s.status === 'completed').length || 0;
  const scheduledSessions = sessions?.data?.filter((s: any) => s.status === 'scheduled').length || 0;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6 text-blue-500" />
            遠程諮詢
          </h1>
          <p className="text-muted-foreground">管理視訊諮詢與術後追蹤</p>
        </div>
        <Dialog open={newSessionOpen} onOpenChange={setNewSessionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              排程諮詢
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>排程遠程諮詢</DialogTitle>
              <DialogDescription>為客戶安排視訊諮詢時間</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>選擇客戶 *</Label>
                <Select onValueChange={(v) => setSelectedCustomerId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇客戶" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomers.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>諮詢類型</Label>
                <Select value={consultType} onValueChange={setConsultType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">初診諮詢</SelectItem>
                    <SelectItem value="follow_up">術後追蹤</SelectItem>
                    <SelectItem value="treatment_plan">療程規劃</SelectItem>
                    <SelectItem value="emergency">緊急諮詢</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>預約時間 *</Label>
                  <Input 
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>預計時長（分鐘）</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 分鐘</SelectItem>
                      <SelectItem value="30">30 分鐘</SelectItem>
                      <SelectItem value="45">45 分鐘</SelectItem>
                      <SelectItem value="60">60 分鐘</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>備註</Label>
                <Textarea 
                  placeholder="諮詢備註..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateSession} disabled={createSessionMutation.isPending}>
                確認排程
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">今日諮詢</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{todaySessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">待進行</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{scheduledSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">已完成</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{completedSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">總時長</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {sessions?.data?.reduce((sum: number, s: any) => sum + (s.actualDuration || s.duration || 0), 0) || 0} 分鐘
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sessions">
            <Video className="h-4 w-4 mr-2" />
            諮詢列表
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            行事曆
          </TabsTrigger>
          <TabsTrigger value="recordings">
            <Play className="h-4 w-4 mr-2" />
            錄影存檔
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>諮詢列表</CardTitle>
              <CardDescription>管理所有遠程諮詢</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>客戶</TableHead>
                    <TableHead>類型</TableHead>
                    <TableHead>預約時間</TableHead>
                    <TableHead>時長</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions?.data?.map((session: any) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          客戶 #{session.customerId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {consultTypeLabels[session.consultType || 'initial']}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {new Date(session.scheduledAt).toLocaleString("zh-TW")}
                        </div>
                      </TableCell>
                      <TableCell>{session.duration} 分鐘</TableCell>
                      <TableCell>
                        <Badge className={statusLabels[session.status || 'scheduled'].color}>
                          {statusLabels[session.status || 'scheduled'].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {session.status === 'scheduled' && (
                            <Button 
                              size="sm"
                              onClick={() => handleStartSession(session.id)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              開始
                            </Button>
                          )}
                          {session.status === 'in_progress' && (
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4 mr-1" />
                              加入
                            </Button>
                          )}
                          {session.status === 'completed' && session.recordingUrl && (
                            <Button size="sm" variant="outline">
                              <Play className="h-4 w-4 mr-1" />
                              觀看
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!sessions?.data?.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        尚無諮詢記錄
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>諮詢行事曆</CardTitle>
              <CardDescription>以行事曆檢視諮詢排程</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                  <div key={day} className="text-center font-medium py-2 bg-muted rounded">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - date.getDay() + i);
                  const daySessions = sessions?.data?.filter((s: any) => {
                    const sDate = new Date(s.scheduledAt);
                    return sDate.toDateString() === date.toDateString();
                  }) || [];
                  
                  return (
                    <div 
                      key={i} 
                      className={`min-h-24 p-2 border rounded ${
                        date.toDateString() === new Date().toDateString() 
                          ? 'bg-blue-50 border-blue-200' 
                          : ''
                      }`}
                    >
                      <div className="text-sm font-medium">{date.getDate()}</div>
                      {daySessions.slice(0, 2).map((s: any) => (
                        <div 
                          key={s.id} 
                          className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 mt-1 truncate"
                        >
                          {new Date(s.scheduledAt).toLocaleTimeString("zh-TW", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ))}
                      {daySessions.length > 2 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          +{daySessions.length - 2} 更多
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recordings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>錄影存檔</CardTitle>
              <CardDescription>查看諮詢錄影</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sessions?.data?.filter((s: any) => s.status === 'completed' && s.recordingUrl).map((session: any) => (
                  <Card key={session.id}>
                    <CardContent className="pt-4">
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                        <Play className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">客戶 #{session.customerId}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.scheduledAt).toLocaleDateString("zh-TW")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          時長：{session.actualDuration || session.duration} 分鐘
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        <Play className="h-4 w-4 mr-2" />
                        觀看錄影
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {!sessions?.data?.filter((s: any) => s.status === 'completed' && s.recordingUrl).length && (
                  <div className="col-span-3 text-center text-muted-foreground py-12">
                    <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>尚無錄影存檔</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
