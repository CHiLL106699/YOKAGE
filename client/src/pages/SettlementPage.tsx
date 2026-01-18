import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { 
  Calculator, 
  DollarSign, 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Minus,
  FileText,
  RefreshCw,
  Download,
  Banknote,
  Receipt,
  Users,
  ShoppingCart,
  Settings,
  BarChart3,
  PieChart,
  Filter,
  ArrowUpDown,
  Search
} from "lucide-react";

export default function SettlementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("today");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [openingCash, setOpeningCash] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
  const [cashOperationAmount, setCashOperationAmount] = useState("");
  const [cashOperationReason, setCashOperationReason] = useState("");
  const [cashOperationType, setCashOperationType] = useState<"deposit" | "withdrawal">("deposit");
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isCashOperationDialogOpen, setIsCashOperationDialogOpen] = useState(false);
  const [isAutoSettingsDialogOpen, setIsAutoSettingsDialogOpen] = useState(false);
  
  // 進階篩選狀態
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterOperator, setFilterOperator] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "revenue" | "orders" | "cashDifference">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // 自動結帳設定狀態
  const [autoSettleEnabled, setAutoSettleEnabled] = useState(false);
  const [autoSettleTime, setAutoSettleTime] = useState("23:00");
  const [autoGenerateReport, setAutoGenerateReport] = useState(true);
  const [reportFormat, setReportFormat] = useState<"pdf" | "excel" | "both">("pdf");
  const [sendLineNotification, setSendLineNotification] = useState(false);

  // 獲取當前診所
  const { data: currentOrg } = trpc.organization.current.useQuery();
  const organizationId = currentOrg?.organization?.id;

  // 獲取當日結帳記錄
  const { data: todaySettlement, refetch: refetchToday } = trpc.settlement.getByDate.useQuery(
    { organizationId: organizationId!, date: selectedDate },
    { enabled: !!organizationId }
  );

  // 獲取當日統計
  const { data: dailyStats } = trpc.settlement.calculateDailyStats.useQuery(
    { organizationId: organizationId!, date: selectedDate },
    { enabled: !!organizationId }
  );

  // 獲取結帳歷史（進階篩選）
  const { data: settlementHistory, refetch: refetchHistory } = trpc.settlement.listAdvanced.useQuery(
    { 
      organizationId: organizationId!, 
      startDate: filterStartDate || undefined,
      endDate: filterEndDate || undefined,
      minAmount: filterMinAmount ? Number(filterMinAmount) : undefined,
      maxAmount: filterMaxAmount ? Number(filterMaxAmount) : undefined,
      status: filterStatus || undefined,
      operatorId: filterOperator ? Number(filterOperator) : undefined,
      sortBy,
      sortOrder,
      limit: 30 
    },
    { enabled: !!organizationId }
  );

  // 獲取收銀機記錄
  const { data: cashDrawerRecords } = trpc.settlement.getCashDrawerRecords.useQuery(
    { settlementId: todaySettlement?.id! },
    { enabled: !!todaySettlement?.id }
  );

  // 獲取營收儀表板數據
  const { data: dashboardData } = trpc.settlement.getDashboardData.useQuery(
    { organizationId: organizationId! },
    { enabled: !!organizationId }
  );

  // 獲取自動結帳設定
  const { data: autoSettings } = trpc.settlement.getAutoSettings.useQuery(
    { organizationId: organizationId! },
    { enabled: !!organizationId }
  );

  // 獲取操作者列表
  const { data: operators } = trpc.settlement.getOperators.useQuery(
    { organizationId: organizationId! },
    { enabled: !!organizationId }
  );

  // 獲取結帳報表列表
  const { data: reports } = trpc.settlement.listReports.useQuery(
    { organizationId: organizationId!, limit: 10 },
    { enabled: !!organizationId }
  );

  // Mutations
  const openSettlement = trpc.settlement.open.useMutation({
    onSuccess: () => {
      toast.success("開帳成功");
      refetchToday();
      setIsOpenDialogOpen(false);
      setOpeningCash("");
    },
    onError: (error) => {
      toast.error(error.message || "開帳失敗");
    },
  });

  const closeSettlement = trpc.settlement.close.useMutation({
    onSuccess: (result) => {
      if (result.cashDifference !== 0) {
        toast.warning(`結帳完成，現金差異: ${result.cashDifference.toLocaleString()} 元`);
      } else {
        toast.success("結帳成功，現金無差異");
      }
      refetchToday();
      refetchHistory();
      setIsCloseDialogOpen(false);
      setClosingCash("");
      setClosingNotes("");
    },
    onError: (error) => {
      toast.error(error.message || "結帳失敗");
    },
  });

  const addCashOperation = trpc.settlement.addCashOperation.useMutation({
    onSuccess: () => {
      toast.success(cashOperationType === "deposit" ? "存入成功" : "取出成功");
      refetchToday();
      setIsCashOperationDialogOpen(false);
      setCashOperationAmount("");
      setCashOperationReason("");
    },
    onError: (error) => {
      toast.error(error.message || "操作失敗");
    },
  });

  const updateAutoSettings = trpc.settlement.updateAutoSettings.useMutation({
    onSuccess: () => {
      toast.success("自動結帳設定已更新");
      setIsAutoSettingsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "更新失敗");
    },
  });

  const generateReport = trpc.settlement.generateReport.useMutation({
    onSuccess: () => {
      toast.success("報表生成成功");
    },
    onError: (error) => {
      toast.error(error.message || "報表生成失敗");
    },
  });

  const handleOpenSettlement = () => {
    if (!organizationId || !openingCash) return;
    openSettlement.mutate({
      organizationId,
      date: selectedDate,
      openingCash: Number(openingCash),
    });
  };

  const handleCloseSettlement = () => {
    if (!todaySettlement?.id || !closingCash) return;
    closeSettlement.mutate({
      settlementId: todaySettlement.id,
      closingCash: Number(closingCash),
      notes: closingNotes || undefined,
    });
  };

  const handleCashOperation = () => {
    if (!todaySettlement?.id || !organizationId || !cashOperationAmount) return;
    addCashOperation.mutate({
      settlementId: todaySettlement.id,
      organizationId,
      operationType: cashOperationType,
      amount: Number(cashOperationAmount),
      reason: cashOperationReason || undefined,
    });
  };

  const handleSaveAutoSettings = () => {
    if (!organizationId) return;
    updateAutoSettings.mutate({
      organizationId,
      isEnabled: autoSettleEnabled,
      autoSettleTime,
      autoGenerateReport,
      reportFormat,
      sendLineNotification,
    });
  };

  const handleGenerateReport = (settlementId: number) => {
    generateReport.mutate({ settlementId });
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    const num = Number(amount || 0);
    return `NT$ ${num.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">營業中</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">已結帳</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 計算預期結帳現金
  const expectedClosingCash = todaySettlement 
    ? Number(todaySettlement.openingCash || 0) + (dailyStats?.cashRevenue || 0)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">每日結帳</h1>
            <p className="text-muted-foreground">管理每日營收結算與收銀機操作</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
            <Dialog open={isAutoSettingsDialogOpen} onOpenChange={setIsAutoSettingsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>自動結帳設定</DialogTitle>
                  <DialogDescription>設定每日自動結帳時間與報表生成</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>啟用自動結帳</Label>
                    <Switch
                      checked={autoSettleEnabled}
                      onCheckedChange={setAutoSettleEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>自動結帳時間</Label>
                    <Input
                      type="time"
                      value={autoSettleTime}
                      onChange={(e) => setAutoSettleTime(e.target.value)}
                      disabled={!autoSettleEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>自動產生報表</Label>
                    <Switch
                      checked={autoGenerateReport}
                      onCheckedChange={setAutoGenerateReport}
                      disabled={!autoSettleEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>報表格式</Label>
                    <Select value={reportFormat} onValueChange={(v) => setReportFormat(v as any)} disabled={!autoSettleEnabled || !autoGenerateReport}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="both">PDF + Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>LINE 通知</Label>
                    <Switch
                      checked={sendLineNotification}
                      onCheckedChange={setSendLineNotification}
                      disabled={!autoSettleEnabled}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAutoSettingsDialogOpen(false)}>取消</Button>
                  <Button onClick={handleSaveAutoSettings}>儲存設定</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="today">今日結帳</TabsTrigger>
            <TabsTrigger value="dashboard">營收儀表板</TabsTrigger>
            <TabsTrigger value="history">結帳歷史</TabsTrigger>
            <TabsTrigger value="reports">報表管理</TabsTrigger>
          </TabsList>

          {/* 今日結帳 Tab */}
          <TabsContent value="today" className="space-y-6">
            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="今日營收"
                value={formatCurrency(dailyStats?.totalRevenue)}
                icon={DollarSign}
                trend={dailyStats?.totalRevenue && dailyStats.totalRevenue > 0 ? { value: 0, isPositive: true } : undefined}
              />
              <StatCard
                title="現金收入"
                value={formatCurrency(dailyStats?.cashRevenue)}
                icon={Banknote}
              />
              <StatCard
                title="刷卡收入"
                value={formatCurrency(dailyStats?.cardRevenue)}
                icon={CreditCard}
              />
              <StatCard
                title="LINE Pay"
                value={formatCurrency(dailyStats?.linePayRevenue)}
                icon={Wallet}
              />
            </div>

            {/* 結帳狀態卡片 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>結帳狀態</CardTitle>
                    <CardDescription>{selectedDate}</CardDescription>
                  </div>
                  {todaySettlement && todaySettlement.status && getStatusBadge(todaySettlement.status)}
                </div>
              </CardHeader>
              <CardContent>
                {!todaySettlement ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">尚未開帳</p>
                    <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          開始營業
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>開帳</DialogTitle>
                          <DialogDescription>輸入今日開帳現金金額</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>開帳現金</Label>
                            <Input
                              type="number"
                              placeholder="輸入金額"
                              value={openingCash}
                              onChange={(e) => setOpeningCash(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsOpenDialogOpen(false)}>取消</Button>
                          <Button onClick={handleOpenSettlement} disabled={openSettlement.isPending}>
                            {openSettlement.isPending ? "處理中..." : "確認開帳"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : todaySettlement.status === 'open' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">開帳現金</p>
                        <p className="text-2xl font-bold">{formatCurrency(todaySettlement.openingCash)}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">預期結帳現金</p>
                        <p className="text-2xl font-bold">{formatCurrency(expectedClosingCash)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog open={isCashOperationDialogOpen} onOpenChange={setIsCashOperationDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Banknote className="h-4 w-4 mr-2" />
                            收銀機操作
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>收銀機操作</DialogTitle>
                            <DialogDescription>存入或取出現金</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>操作類型</Label>
                              <Select value={cashOperationType} onValueChange={(v) => setCashOperationType(v as any)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="deposit">存入</SelectItem>
                                  <SelectItem value="withdrawal">取出</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>金額</Label>
                              <Input
                                type="number"
                                placeholder="輸入金額"
                                value={cashOperationAmount}
                                onChange={(e) => setCashOperationAmount(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>原因</Label>
                              <Textarea
                                placeholder="輸入原因（選填）"
                                value={cashOperationReason}
                                onChange={(e) => setCashOperationReason(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCashOperationDialogOpen(false)}>取消</Button>
                            <Button onClick={handleCashOperation} disabled={addCashOperation.isPending}>
                              {addCashOperation.isPending ? "處理中..." : "確認"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            結帳
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>結帳</DialogTitle>
                            <DialogDescription>輸入實際結帳現金金額</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground">預期結帳現金</p>
                              <p className="text-xl font-bold">{formatCurrency(expectedClosingCash)}</p>
                            </div>
                            <div className="space-y-2">
                              <Label>實際結帳現金</Label>
                              <Input
                                type="number"
                                placeholder="輸入金額"
                                value={closingCash}
                                onChange={(e) => setClosingCash(e.target.value)}
                              />
                            </div>
                            {closingCash && Number(closingCash) !== expectedClosingCash && (
                              <div className={`p-3 rounded-lg ${Number(closingCash) > expectedClosingCash ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                <p className="text-sm font-medium">
                                  現金差異: {formatCurrency(Number(closingCash) - expectedClosingCash)}
                                </p>
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label>備註</Label>
                              <Textarea
                                placeholder="輸入備註（選填）"
                                value={closingNotes}
                                onChange={(e) => setClosingNotes(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>取消</Button>
                            <Button onClick={handleCloseSettlement} disabled={closeSettlement.isPending}>
                              {closeSettlement.isPending ? "處理中..." : "確認結帳"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* 收銀機記錄 */}
                    {cashDrawerRecords && cashDrawerRecords.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2">收銀機操作記錄</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>時間</TableHead>
                              <TableHead>操作</TableHead>
                              <TableHead className="text-right">金額</TableHead>
                              <TableHead>原因</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cashDrawerRecords.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>{new Date(record.operatedAt || '').toLocaleTimeString()}</TableCell>
                                <TableCell>
                                  <Badge variant={record.operationType === 'deposit' ? 'default' : 'destructive'}>
                                    {record.operationType === 'deposit' ? '存入' : record.operationType === 'withdrawal' ? '取出' : record.operationType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(record.amount)}</TableCell>
                                <TableCell>{record.reason || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">開帳現金</p>
                        <p className="text-xl font-bold">{formatCurrency(todaySettlement.openingCash)}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">結帳現金</p>
                        <p className="text-xl font-bold">{formatCurrency(todaySettlement.closingCash)}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">總營收</p>
                        <p className="text-xl font-bold">{formatCurrency(todaySettlement.totalRevenue)}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${Number(todaySettlement.cashDifference || 0) === 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="text-sm text-muted-foreground">現金差異</p>
                        <p className={`text-xl font-bold ${Number(todaySettlement.cashDifference || 0) === 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {formatCurrency(todaySettlement.cashDifference)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleGenerateReport(todaySettlement.id)}>
                        <FileText className="h-4 w-4 mr-2" />
                        產生報表
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 訂單與預約統計 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">訂單統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">總訂單數</span>
                      <span className="font-medium">{dailyStats?.totalOrders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">已完成</span>
                      <span className="font-medium text-green-600">{dailyStats?.completedOrders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">已取消</span>
                      <span className="font-medium text-red-600">{dailyStats?.cancelledOrders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">已退款</span>
                      <span className="font-medium text-orange-600">{dailyStats?.refundedOrders || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">預約統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">總預約數</span>
                      <span className="font-medium">{dailyStats?.totalAppointments || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">已完成</span>
                      <span className="font-medium text-green-600">{dailyStats?.completedAppointments || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">未到</span>
                      <span className="font-medium text-red-600">{dailyStats?.noShowAppointments || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 營收儀表板 Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* 營收摘要 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="本月營收"
                value={formatCurrency(dashboardData?.summary.totalRevenue)}
                icon={DollarSign}
              />
              <StatCard
                title="本月訂單"
                value={(dashboardData?.summary as any)?.totalOrders?.toString() || "0"}
                icon={ShoppingCart}
              />
              <StatCard
                title="平均客單價"
                value={formatCurrency((dashboardData?.summary as any)?.avgOrderValue)}
                icon={TrendingUp}
              />
              <StatCard
                title="結帳次數"
                value={(dashboardData?.summary as any)?.settlementCount?.toString() || "0"}
                icon={Receipt}
              />
            </div>

            {/* 支付方式佔比 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  支付方式佔比
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {dashboardData?.paymentMethodBreakdown.map((item, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">{item.method}</p>
                      <p className="text-xl font-bold">{formatCurrency(item.amount)}</p>
                      <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 營收趨勢 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  營收趨勢（最近 30 天）
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.dailyTrend && dashboardData.dailyTrend.length > 0 ? (
                  <div className="space-y-2">
                    {dashboardData.dailyTrend.slice(-10).map((day, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <span className="w-24 text-sm text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                          <div 
                            className="bg-primary h-full rounded-full flex items-center justify-end pr-2"
                            style={{ 
                              width: `${Math.min(100, (day.totalRevenue / Math.max(...dashboardData.dailyTrend.map(d => d.totalRevenue))) * 100)}%` 
                            }}
                          >
                            <span className="text-xs text-primary-foreground font-medium">
                              {formatCurrency(day.totalRevenue)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">暫無數據</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 結帳歷史 Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* 進階篩選 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  篩選條件
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="space-y-2">
                    <Label>開始日期</Label>
                    <Input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>結束日期</Label>
                    <Input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>最低金額</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filterMinAmount}
                      onChange={(e) => setFilterMinAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>最高金額</Label>
                    <Input
                      type="number"
                      placeholder="不限"
                      value={filterMaxAmount}
                      onChange={(e) => setFilterMaxAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>狀態</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="全部" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="open">營業中</SelectItem>
                        <SelectItem value="closed">已結帳</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>經手人</Label>
                    <Select value={filterOperator} onValueChange={setFilterOperator}>
                      <SelectTrigger>
                        <SelectValue placeholder="全部" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        {operators?.map((op) => (
                          <SelectItem key={op.id} value={op.id.toString()}>{op.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Label>排序</Label>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">日期</SelectItem>
                        <SelectItem value="revenue">營收</SelectItem>
                        <SelectItem value="orders">訂單數</SelectItem>
                        <SelectItem value="cashDifference">現金差異</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => {
                    setFilterStartDate("");
                    setFilterEndDate("");
                    setFilterMinAmount("");
                    setFilterMaxAmount("");
                    setFilterStatus("all");
                    setFilterOperator("all");
                    setSortBy("date");
                    setSortOrder("desc");
                  }}>
                    清除篩選
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 篩選結果統計 */}
            {settlementHistory?.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">篩選結果營收</p>
                  <p className="text-xl font-bold">{formatCurrency(settlementHistory.stats.totalRevenue)}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">篩選結果訂單</p>
                  <p className="text-xl font-bold">{settlementHistory.stats.totalOrders}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">平均每日營收</p>
                  <p className="text-xl font-bold">{formatCurrency(settlementHistory.stats.avgRevenue)}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">現金差異總計</p>
                  <p className={`text-xl font-bold ${settlementHistory.stats.totalCashDifference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(settlementHistory.stats.totalCashDifference)}
                  </p>
                </Card>
              </div>
            )}

            {/* 結帳歷史列表 */}
            <Card>
              <CardHeader>
                <CardTitle>結帳記錄</CardTitle>
                <CardDescription>共 {settlementHistory?.total || 0} 筆記錄</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日期</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className="text-right">總營收</TableHead>
                      <TableHead className="text-right">現金</TableHead>
                      <TableHead className="text-right">刷卡</TableHead>
                      <TableHead className="text-right">現金差異</TableHead>
                      <TableHead>開帳人</TableHead>
                      <TableHead>結帳人</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settlementHistory?.data.map((settlement) => (
                      <TableRow key={settlement.id}>
                        <TableCell>{new Date(settlement.settlementDate).toLocaleDateString()}</TableCell>
                        <TableCell>{settlement.status && getStatusBadge(settlement.status)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(settlement.totalRevenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(settlement.cashRevenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(settlement.cardRevenue)}</TableCell>
                        <TableCell className={`text-right ${Number(settlement.cashDifference || 0) === 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(settlement.cashDifference)}
                        </TableCell>
                        <TableCell>{settlement.openedByName || '-'}</TableCell>
                        <TableCell>{settlement.closedByName || '-'}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleGenerateReport(settlement.id)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 報表管理 Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>結帳報表</CardTitle>
                <CardDescription>查看與下載結帳報表</CardDescription>
              </CardHeader>
              <CardContent>
                {reports?.data && reports.data.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>報表標題</TableHead>
                        <TableHead>類型</TableHead>
                        <TableHead>期間</TableHead>
                        <TableHead className="text-right">總營收</TableHead>
                        <TableHead>生成方式</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>建立時間</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.data.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {report.reportType === 'daily' ? '每日' : report.reportType === 'weekly' ? '每週' : '每月'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(report.totalRevenue)}</TableCell>
                          <TableCell>
                            <Badge variant={report.generatedBy === 'auto' ? 'secondary' : 'default'}>
                              {report.generatedBy === 'auto' ? '自動' : '手動'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={report.status === 'completed' ? 'default' : report.status === 'failed' ? 'destructive' : 'secondary'}>
                              {report.status === 'completed' ? '完成' : report.status === 'failed' ? '失敗' : '生成中'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(report.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            {report.pdfUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">暫無報表</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
