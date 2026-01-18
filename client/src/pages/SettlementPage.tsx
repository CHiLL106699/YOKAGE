import { useState, useMemo } from "react";
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
  ShoppingCart
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

  // 獲取結帳歷史
  const { data: settlementHistory } = trpc.settlement.list.useQuery(
    { organizationId: organizationId!, limit: 30 },
    { enabled: !!organizationId }
  );

  // 獲取收銀機記錄
  const { data: cashDrawerRecords } = trpc.settlement.getCashDrawerRecords.useQuery(
    { settlementId: todaySettlement?.id! },
    { enabled: !!todaySettlement?.id }
  );

  // 獲取結帳摘要
  const { data: settlementSummary } = trpc.settlement.getSummary.useQuery(
    { organizationId: organizationId! },
    { enabled: !!organizationId }
  );

  // 開帳 mutation
  const openSettlement = trpc.settlement.open.useMutation({
    onSuccess: () => {
      toast.success("開帳成功");
      setIsOpenDialogOpen(false);
      setOpeningCash("");
      refetchToday();
    },
    onError: (error) => {
      toast.error(`開帳失敗: ${error.message}`);
    },
  });

  // 結帳 mutation
  const closeSettlement = trpc.settlement.close.useMutation({
    onSuccess: (result) => {
      const diff = result.cashDifference;
      if (diff === 0) {
        toast.success("結帳成功，現金無差異");
      } else if (diff > 0) {
        toast.warning(`結帳成功，現金溢收 $${diff}`);
      } else {
        toast.warning(`結帳成功，現金短少 $${Math.abs(diff)}`);
      }
      setIsCloseDialogOpen(false);
      setClosingCash("");
      setClosingNotes("");
      refetchToday();
    },
    onError: (error) => {
      toast.error(`結帳失敗: ${error.message}`);
    },
  });

  // 收銀機操作 mutation
  const addCashOperation = trpc.settlement.addCashOperation.useMutation({
    onSuccess: () => {
      toast.success(cashOperationType === "deposit" ? "現金存入成功" : "現金取出成功");
      setIsCashOperationDialogOpen(false);
      setCashOperationAmount("");
      setCashOperationReason("");
      refetchToday();
    },
    onError: (error) => {
      toast.error(`操作失敗: ${error.message}`);
    },
  });

  // 計算預期現金
  const expectedCash = useMemo(() => {
    if (!todaySettlement) return 0;
    const opening = Number(todaySettlement.openingCash) || 0;
    const cashRevenue = dailyStats?.cashRevenue || 0;
    // 加上存入，減去取出
    let adjustments = 0;
    if (cashDrawerRecords) {
      for (const record of cashDrawerRecords) {
        if (record.operationType === 'deposit') {
          adjustments += Number(record.amount);
        } else if (record.operationType === 'withdrawal') {
          adjustments -= Number(record.amount);
        }
      }
    }
    return opening + cashRevenue + adjustments;
  }, [todaySettlement, dailyStats, cashDrawerRecords]);

  const handleOpenSettlement = () => {
    if (!organizationId) return;
    openSettlement.mutate({
      organizationId,
      date: selectedDate,
      openingCash: Number(openingCash) || 0,
    });
  };

  const handleCloseSettlement = () => {
    if (!todaySettlement?.id) return;
    closeSettlement.mutate({
      settlementId: todaySettlement.id,
      closingCash: Number(closingCash) || 0,
      notes: closingNotes || undefined,
    });
  };

  const handleCashOperation = () => {
    if (!todaySettlement?.id || !organizationId) return;
    addCashOperation.mutate({
      settlementId: todaySettlement.id,
      organizationId,
      operationType: cashOperationType,
      amount: Number(cashOperationAmount) || 0,
      reason: cashOperationReason || undefined,
    });
  };

  const formatCurrency = (value: number | string | null | undefined) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-500">營業中</Badge>;
      case 'closed':
        return <Badge variant="secondary">已結帳</Badge>;
      case 'pending':
        return <Badge variant="outline">待開帳</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">每日結帳</h1>
            <p className="text-muted-foreground">管理每日營業收支與現金結算</p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
            <Button variant="outline" onClick={() => refetchToday()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重新整理
            </Button>
          </div>
        </div>

        {/* 當日狀態卡片 */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {selectedDate} 營業狀態
                </CardTitle>
                <CardDescription>
                  {todaySettlement ? (
                    <span className="flex items-center gap-2 mt-1">
                      {getStatusBadge(todaySettlement.status ?? 'pending')}
                      {todaySettlement.status === 'open' && todaySettlement.openedAt && (
                        <span className="text-sm">
                          開帳時間: {new Date(todaySettlement.openedAt).toLocaleTimeString('zh-TW')}
                        </span>
                      )}
                      {todaySettlement.status === 'closed' && todaySettlement.closedAt && (
                        <span className="text-sm">
                          結帳時間: {new Date(todaySettlement.closedAt).toLocaleTimeString('zh-TW')}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-amber-600">尚未開帳</span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {!todaySettlement && (
                  <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Clock className="h-4 w-4 mr-2" />
                        開帳
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>開始營業</DialogTitle>
                        <DialogDescription>
                          請輸入今日開帳時的現金金額
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>開帳現金</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="0"
                              value={openingCash}
                              onChange={(e) => setOpeningCash(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpenDialogOpen(false)}>
                          取消
                        </Button>
                        <Button onClick={handleOpenSettlement} disabled={openSettlement.isPending}>
                          {openSettlement.isPending ? "處理中..." : "確認開帳"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                {todaySettlement?.status === 'open' && (
                  <>
                    <Dialog open={isCashOperationDialogOpen} onOpenChange={setIsCashOperationDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Wallet className="h-4 w-4 mr-2" />
                          現金操作
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>收銀機現金操作</DialogTitle>
                          <DialogDescription>
                            存入或取出現金
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>操作類型</Label>
                            <Select value={cashOperationType} onValueChange={(v) => setCashOperationType(v as "deposit" | "withdrawal")}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="deposit">
                                  <span className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-green-500" />
                                    存入現金
                                  </span>
                                </SelectItem>
                                <SelectItem value="withdrawal">
                                  <span className="flex items-center gap-2">
                                    <Minus className="h-4 w-4 text-red-500" />
                                    取出現金
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>金額</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="0"
                                value={cashOperationAmount}
                                onChange={(e) => setCashOperationAmount(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>原因說明</Label>
                            <Textarea
                              placeholder="請輸入操作原因..."
                              value={cashOperationReason}
                              onChange={(e) => setCashOperationReason(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsCashOperationDialogOpen(false)}>
                            取消
                          </Button>
                          <Button onClick={handleCashOperation} disabled={addCashOperation.isPending}>
                            {addCashOperation.isPending ? "處理中..." : "確認"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700">
                          <Calculator className="h-4 w-4 mr-2" />
                          結帳
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>每日結帳</DialogTitle>
                          <DialogDescription>
                            請清點收銀機現金並輸入實際金額
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="bg-muted p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">開帳現金</span>
                              <span>{formatCurrency(todaySettlement?.openingCash)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">現金收入</span>
                              <span className="text-green-600">+{formatCurrency(dailyStats?.cashRevenue)}</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t pt-2">
                              <span>預期現金</span>
                              <span>{formatCurrency(expectedCash)}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>實際現金</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="0"
                                value={closingCash}
                                onChange={(e) => setClosingCash(e.target.value)}
                                className="pl-10 text-lg"
                              />
                            </div>
                          </div>
                          {closingCash && (
                            <div className={`p-3 rounded-lg ${
                              Number(closingCash) === expectedCash 
                                ? 'bg-green-100 text-green-700' 
                                : Number(closingCash) > expectedCash 
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              {Number(closingCash) === expectedCash ? (
                                <span className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  現金無差異
                                </span>
                              ) : Number(closingCash) > expectedCash ? (
                                <span className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  溢收 {formatCurrency(Number(closingCash) - expectedCash)}
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <TrendingDown className="h-4 w-4" />
                                  短少 {formatCurrency(expectedCash - Number(closingCash))}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label>備註</Label>
                            <Textarea
                              placeholder="如有差異請說明原因..."
                              value={closingNotes}
                              onChange={(e) => setClosingNotes(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
                            取消
                          </Button>
                          <Button 
                            onClick={handleCloseSettlement} 
                            disabled={closeSettlement.isPending || !closingCash}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {closeSettlement.isPending ? "處理中..." : "確認結帳"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 統計卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="今日營收"
            value={formatCurrency(dailyStats?.totalRevenue || 0)}
            icon={DollarSign}
            description={`總訂單 ${settlementSummary?.totalOrders || 0} 筆`}
          />
          <StatCard
            title="現金收入"
            value={formatCurrency(dailyStats?.cashRevenue || 0)}
            icon={Banknote}
            description={`佔比 ${dailyStats?.totalRevenue ? Math.round((dailyStats.cashRevenue / dailyStats.totalRevenue) * 100) : 0}%`}
          />
          <StatCard
            title="刷卡收入"
            value={formatCurrency(dailyStats?.cardRevenue || 0)}
            icon={CreditCard}
            description={`佔比 ${dailyStats?.totalRevenue ? Math.round((dailyStats.cardRevenue / dailyStats.totalRevenue) * 100) : 0}%`}
          />
          <StatCard
            title="LINE Pay"
            value={formatCurrency(dailyStats?.linePayRevenue || 0)}
            icon={Wallet}
            description={`佔比 ${dailyStats?.totalRevenue ? Math.round((dailyStats.linePayRevenue / dailyStats.totalRevenue) * 100) : 0}%`}
          />
        </div>

        {/* 分頁內容 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="today">今日明細</TabsTrigger>
            <TabsTrigger value="history">結帳歷史</TabsTrigger>
            <TabsTrigger value="cash">收銀機記錄</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* 訂單統計 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    訂單統計
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">總訂單數</span>
                      <span className="font-semibold">{dailyStats?.totalOrders || 0} 筆</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        已完成
                      </span>
                      <span className="text-green-600">{dailyStats?.completedOrders || 0} 筆</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        已取消
                      </span>
                      <span className="text-red-600">{dailyStats?.cancelledOrders || 0} 筆</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        已退款
                      </span>
                      <span className="text-amber-600">{dailyStats?.refundedOrders || 0} 筆</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 預約統計 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    預約統計
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">總預約數</span>
                      <span className="font-semibold">{dailyStats?.totalAppointments || 0} 筆</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        已完成
                      </span>
                      <span className="text-green-600">{dailyStats?.completedAppointments || 0} 筆</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        未到診
                      </span>
                      <span className="text-red-600">{dailyStats?.noShowAppointments || 0} 筆</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">到診率</span>
                      <span className="font-semibold">
                        {dailyStats?.totalAppointments 
                          ? Math.round(((dailyStats.totalAppointments - dailyStats.noShowAppointments) / dailyStats.totalAppointments) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 收入明細 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  收入明細
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>付款方式</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead className="text-right">佔比</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-green-500" />
                        現金
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(dailyStats?.cashRevenue)}</TableCell>
                      <TableCell className="text-right">
                        {dailyStats?.totalRevenue ? Math.round((dailyStats.cashRevenue / dailyStats.totalRevenue) * 100) : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-500" />
                        信用卡/金融卡
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(dailyStats?.cardRevenue)}</TableCell>
                      <TableCell className="text-right">
                        {dailyStats?.totalRevenue ? Math.round((dailyStats.cardRevenue / dailyStats.totalRevenue) * 100) : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-green-600" />
                        LINE Pay
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(dailyStats?.linePayRevenue)}</TableCell>
                      <TableCell className="text-right">
                        {dailyStats?.totalRevenue ? Math.round((dailyStats.linePayRevenue / dailyStats.totalRevenue) * 100) : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        其他
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(dailyStats?.otherRevenue)}</TableCell>
                      <TableCell className="text-right">
                        {dailyStats?.totalRevenue ? Math.round((dailyStats.otherRevenue / dailyStats.totalRevenue) * 100) : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow className="font-semibold bg-muted/50">
                      <TableCell>總計</TableCell>
                      <TableCell className="text-right">{formatCurrency(dailyStats?.totalRevenue)}</TableCell>
                      <TableCell className="text-right">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  結帳歷史記錄
                </CardTitle>
                <CardDescription>
                  最近 30 天的結帳記錄
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日期</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className="text-right">開帳現金</TableHead>
                      <TableHead className="text-right">結帳現金</TableHead>
                      <TableHead className="text-right">營收</TableHead>
                      <TableHead className="text-right">現金差異</TableHead>
                      <TableHead>結帳時間</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settlementHistory?.data?.map((settlement) => (
                      <TableRow key={settlement.id}>
                        <TableCell>{settlement.settlementDate ? new Date(settlement.settlementDate).toLocaleDateString('zh-TW') : '-'}</TableCell>
                        <TableCell>{getStatusBadge(settlement.status ?? 'pending')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(settlement.openingCash)}</TableCell>
                        <TableCell className="text-right">
                          {settlement.closingCash ? formatCurrency(settlement.closingCash) : '-'}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(settlement.totalRevenue)}</TableCell>
                        <TableCell className={`text-right ${
                          Number(settlement.cashDifference) === 0 
                            ? '' 
                            : Number(settlement.cashDifference) > 0 
                              ? 'text-amber-600' 
                              : 'text-red-600'
                        }`}>
                          {settlement.cashDifference 
                            ? (Number(settlement.cashDifference) > 0 ? '+' : '') + formatCurrency(settlement.cashDifference)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {settlement.closedAt 
                            ? new Date(settlement.closedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!settlementHistory?.data || settlementHistory.data.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          暫無結帳記錄
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cash" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  收銀機操作記錄
                </CardTitle>
                <CardDescription>
                  今日收銀機現金存取記錄
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>時間</TableHead>
                      <TableHead>操作類型</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead className="text-right">操作前餘額</TableHead>
                      <TableHead className="text-right">操作後餘額</TableHead>
                      <TableHead>原因</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashDrawerRecords?.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>
                          {record.operationType === 'open' && (
                            <Badge className="bg-green-500">開帳</Badge>
                          )}
                          {record.operationType === 'close' && (
                            <Badge variant="secondary">結帳</Badge>
                          )}
                          {record.operationType === 'deposit' && (
                            <Badge className="bg-blue-500">存入</Badge>
                          )}
                          {record.operationType === 'withdrawal' && (
                            <Badge className="bg-amber-500">取出</Badge>
                          )}
                        </TableCell>
                        <TableCell className={`text-right ${
                          record.operationType === 'deposit' ? 'text-green-600' : 
                          record.operationType === 'withdrawal' ? 'text-red-600' : ''
                        }`}>
                          {record.operationType === 'deposit' ? '+' : 
                           record.operationType === 'withdrawal' ? '-' : ''}
                          {formatCurrency(record.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {record.balanceBefore ? formatCurrency(record.balanceBefore) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {record.balanceAfter ? formatCurrency(record.balanceAfter) : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.reason || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!cashDrawerRecords || cashDrawerRecords.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {todaySettlement ? '暫無收銀機操作記錄' : '請先開帳'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
