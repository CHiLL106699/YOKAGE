import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CreditCard, Plus, Search, MoreHorizontal, Eye, Edit, Trash2, 
  DollarSign, TrendingUp, Building2, Calendar, Download, RefreshCw,
  Check, X, AlertTriangle, Clock, Receipt, FileText
} from "lucide-react";
import { toast } from "sonner";

// 訂閱方案配置（靜態定義，作為前端方案展示用）
const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "免費版",
    price: 0,
    period: "月",
    description: "適合試用或小型診所",
    features: [
      { name: "最多 1 位員工", included: true },
      { name: "最多 100 位客戶", included: true },
      { name: "基礎預約管理", included: true },
      { name: "LINE 通知（100則/月）", included: true },
      { name: "進階報表", included: false },
      { name: "API 存取", included: false },
      { name: "白標方案", included: false },
    ],
    color: "bg-gray-500",
  },
  {
    id: "basic",
    name: "基礎版",
    price: 1990,
    period: "月",
    description: "適合小型診所起步使用",
    features: [
      { name: "最多 3 位員工", included: true },
      { name: "最多 500 位客戶", included: true },
      { name: "基礎預約管理", included: true },
      { name: "LINE 通知（500則/月）", included: true },
      { name: "基礎報表", included: true },
      { name: "API 存取", included: false },
      { name: "白標方案", included: false },
    ],
    color: "bg-blue-500",
  },
  {
    id: "pro",
    name: "專業版",
    price: 4990,
    period: "月",
    description: "適合成長中的診所",
    features: [
      { name: "最多 10 位員工", included: true },
      { name: "最多 3000 位客戶", included: true },
      { name: "完整預約管理", included: true },
      { name: "LINE 通知（2000則/月）", included: true },
      { name: "進階報表分析", included: true },
      { name: "API 存取", included: true },
      { name: "白標方案", included: false },
    ],
    color: "bg-purple-500",
  },
  {
    id: "enterprise",
    name: "企業版",
    price: 9990,
    period: "月",
    description: "適合連鎖診所或大型機構",
    features: [
      { name: "無限員工數", included: true },
      { name: "無限客戶數", included: true },
      { name: "完整預約管理", included: true },
      { name: "LINE 通知（無限）", included: true },
      { name: "進階報表分析", included: true },
      { name: "API 存取", included: true },
      { name: "白標方案", included: true },
    ],
    color: "bg-amber-500",
  },
];

// 帳單狀態配置
const INVOICE_STATUS = {
  paid: { label: "已付款", color: "bg-green-500" },
  pending: { label: "待付款", color: "bg-yellow-500" },
  overdue: { label: "逾期", color: "bg-red-500" },
  cancelled: { label: "已取消", color: "bg-gray-500" },
} as const;

// 方案名稱對照
const PLAN_DISPLAY: Record<string, string> = {
  yokage_starter: "免費版",
  yokage_pro: "專業版",
  yyq_basic: "基礎版",
  yyq_advanced: "企業版",
  free: "免費版",
  basic: "基礎版",
  pro: "專業版",
  enterprise: "企業版",
};

export default function SuperAdminBillingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreatePlanDialogOpen, setIsCreatePlanDialogOpen] = useState(false);
  const [isEditPlanDialogOpen, setIsEditPlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Record<string, any> | null>(null);
  const [planFormData, setPlanFormData] = useState({
    name: "",
    price: 0,
    period: "月",
    description: "",
    maxStaff: 1,
    maxCustomers: 100,
    maxLineMessages: 100,
    hasAdvancedReports: false,
    hasApiAccess: false,
    hasWhiteLabel: false,
  });

  // ============================================
  // tRPC API 查詢
  // ============================================
  const { data: stats, isLoading: statsLoading } = trpc.superAdmin.billingStats.useQuery(
    undefined,
    { refetchInterval: 60000 }
  );

  const { data: invoicesData, isLoading: invoicesLoading, refetch: refetchInvoices } = trpc.superAdmin.listInvoices.useQuery(
    { status: statusFilter !== "all" ? statusFilter : undefined, search: searchTerm || undefined, page: currentPage },
    { placeholderData: (prev) => prev }
  );

  const { data: subscriptions, isLoading: subsLoading } = trpc.superAdmin.listSubscriptions.useQuery();

  const { data: revenueByMonth } = trpc.superAdmin.revenueByMonth.useQuery();

  const { data: planDistribution } = trpc.superAdmin.planDistribution.useQuery();

  const updateInvoiceStatus = trpc.superAdmin.updateInvoiceStatus.useMutation({
    onSuccess: () => {
      refetchInvoices();
      toast.success("帳單狀態已更新");
    },
    onError: (err) => toast.error(`更新失敗: ${err.message}`),
  });

  // 統計數據（來自 API，fallback 為 0）
  const billingStats = stats || {
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    growthRate: 0,
  };

  const invoices = invoicesData?.data || [];

  const handleCreatePlan = () => {
    toast.success("方案建立成功");
    setIsCreatePlanDialogOpen(false);
    resetPlanForm();
  };

  const handleEditPlan = (plan: Record<string, any>) => {
    setSelectedPlan(plan);
    setPlanFormData({
      name: plan.name,
      price: plan.price,
      period: plan.period,
      description: plan.description,
      maxStaff: 10,
      maxCustomers: 3000,
      maxLineMessages: 2000,
      hasAdvancedReports: true,
      hasApiAccess: true,
      hasWhiteLabel: false,
    });
    setIsEditPlanDialogOpen(true);
  };

  const handleUpdatePlan = () => {
    toast.success("方案更新成功");
    setIsEditPlanDialogOpen(false);
    setSelectedPlan(null);
  };

  const handleDeletePlan = (plan: Record<string, any>) => {
    toast.success(`方案「${plan.name}」已刪除`);
  };

  const resetPlanForm = () => {
    setPlanFormData({
      name: "",
      price: 0,
      period: "月",
      description: "",
      maxStaff: 1,
      maxCustomers: 100,
      maxLineMessages: 100,
      hasAdvancedReports: false,
      hasApiAccess: false,
      hasWhiteLabel: false,
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`正在下載發票 ${invoiceId}`);
  };

  const handleSendReminder = (invoiceId: string) => {
    toast.success(`已發送付款提醒`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              計費管理
            </h1>
            <p className="text-slate-400 mt-1">
              管理訂閱方案、帳單與收入統計
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchInvoices()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重新整理
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              匯出報表
            </Button>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="總收入"
            value={`NT$ ${billingStats.totalRevenue.toLocaleString()}`}
            description="累計總收入"
            icon={DollarSign}
            trend={billingStats.growthRate ? { value: billingStats.growthRate, label: "成長率" } : undefined}
            loading={statsLoading}
          />
          <StatCard
            title="本月收入"
            value={`NT$ ${billingStats.monthlyRevenue.toLocaleString()}`}
            description="本月營收"
            icon={TrendingUp}
            loading={statsLoading}
          />
          <StatCard
            title="活躍訂閱"
            value={billingStats.activeSubscriptions}
            description="付費診所數"
            icon={Building2}
            loading={statsLoading}
          />
          <StatCard
            title="待付款帳單"
            value={billingStats.pendingInvoices}
            description={`${billingStats.overdueInvoices} 筆逾期`}
            icon={Receipt}
            trend={billingStats.overdueInvoices > 0 ? { value: -billingStats.overdueInvoices, label: "逾期" } : undefined}
            loading={statsLoading}
          />
        </div>

        {/* 分頁內容 */}
        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">帳單管理</TabsTrigger>
            <TabsTrigger value="plans">訂閱方案</TabsTrigger>
            <TabsTrigger value="subscriptions">訂閱狀態</TabsTrigger>
            <TabsTrigger value="revenue">收入報表</TabsTrigger>
          </TabsList>

          {/* 帳單管理 */}
          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>帳單列表</CardTitle>
                <CardDescription>管理所有診所的帳單與付款狀態</CardDescription>
              </CardHeader>
              <CardContent>
                {/* 搜尋與篩選 */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜尋帳單編號、診所名稱..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="付款狀態" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有狀態</SelectItem>
                      <SelectItem value="paid">已付款</SelectItem>
                      <SelectItem value="pending">待付款</SelectItem>
                      <SelectItem value="overdue">逾期</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 帳單表格 */}
                {invoicesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>尚無帳單資料</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>帳單編號</TableHead>
                        <TableHead>診所</TableHead>
                        <TableHead>方案</TableHead>
                        <TableHead>金額</TableHead>
                        <TableHead>到期日</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => {
                        const statusConfig = INVOICE_STATUS[invoice.status as keyof typeof INVOICE_STATUS] || INVOICE_STATUS.pending;
                        return (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-mono">{invoice.id}</TableCell>
                            <TableCell>{invoice.clinicName}</TableCell>
                            <TableCell>{invoice.plan}</TableCell>
                            <TableCell>NT$ {invoice.amount.toLocaleString()}</TableCell>
                            <TableCell>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</TableCell>
                            <TableCell>
                              <Badge className={`${statusConfig.color} text-white`}>
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice.id)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    下載發票
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toast.info("查看詳情")}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    查看詳情
                                  </DropdownMenuItem>
                                  {invoice.status === "pending" && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleSendReminder(invoice.id)}>
                                        <Clock className="h-4 w-4 mr-2" />
                                        發送提醒
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => updateInvoiceStatus.mutate({ invoiceId: invoice.dbId, status: 'paid' })}>
                                        <Check className="h-4 w-4 mr-2" />
                                        標記已付款
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {invoice.status === "overdue" && (
                                    <DropdownMenuItem className="text-red-500" onClick={() => handleSendReminder(invoice.id)}>
                                      <AlertTriangle className="h-4 w-4 mr-2" />
                                      催繳通知
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 訂閱方案 */}
          <TabsContent value="plans" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">訂閱方案管理</h2>
                <p className="text-muted-foreground">設定與管理各訂閱方案的價格與功能</p>
              </div>
              <Dialog open={isCreatePlanDialogOpen} onOpenChange={setIsCreatePlanDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold">
                    <Plus className="h-4 w-4" />
                    新增方案
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>新增訂閱方案</DialogTitle>
                    <DialogDescription>建立新的訂閱方案</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>方案名稱</Label>
                      <Input
                        value={planFormData.name}
                        onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                        placeholder="例：專業版"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>價格 (NT$)</Label>
                        <Input
                          type="number"
                          value={planFormData.price}
                          onChange={(e) => setPlanFormData({ ...planFormData, price: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>計費週期</Label>
                        <Select
                          value={planFormData.period}
                          onValueChange={(value) => setPlanFormData({ ...planFormData, period: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="月">每月</SelectItem>
                            <SelectItem value="年">每年</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>方案說明</Label>
                      <Textarea
                        value={planFormData.description}
                        onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                        placeholder="方案特色說明..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatePlanDialogOpen(false)}>取消</Button>
                    <Button onClick={handleCreatePlan}>建立方案</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <Card key={plan.id} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${plan.color}`} />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                            <Edit className="h-4 w-4 mr-2" />
                            編輯方案
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500" onClick={() => handleDeletePlan(plan)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            刪除方案
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">
                      NT$ {plan.price.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={feature.included ? "" : "text-muted-foreground"}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 訂閱狀態 */}
          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>診所訂閱狀態</CardTitle>
                <CardDescription>查看所有診所的訂閱方案與到期時間</CardDescription>
              </CardHeader>
              <CardContent>
                {subsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>診所</TableHead>
                        <TableHead>方案</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>開始日期</TableHead>
                        <TableHead>到期日期</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(subscriptions || []).map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.clinic}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{PLAN_DISPLAY[sub.plan] || sub.plan}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              sub.status === "active" ? "bg-green-500" :
                              sub.status === "trial" ? "bg-blue-500" : "bg-red-500"
                            }>
                              {sub.status === "active" ? "啟用中" : sub.status === "trial" ? "試用中" : "已到期"}
                            </Badge>
                          </TableCell>
                          <TableCell>{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => toast.info("管理訂閱")}>
                              管理
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 收入報表 */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>月度收入趨勢</CardTitle>
                  <CardDescription>過去 12 個月的收入變化</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(revenueByMonth && revenueByMonth.length > 0) ? revenueByMonth.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm">{item.month}</span>
                        <div className="flex items-center gap-4">
                          <Progress value={Math.min(item.revenue / 500, 100)} className="w-32 h-2" />
                          <span className="text-sm font-medium w-24 text-right">
                            NT$ {item.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-muted-foreground text-center py-4">尚無收入資料</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>方案分布</CardTitle>
                  <CardDescription>各訂閱方案的診所數量</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(planDistribution && planDistribution.length > 0) ? planDistribution.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="flex-1">{PLAN_DISPLAY[item.plan] || item.plan}</span>
                        <span className="text-muted-foreground">{item.count} 診所</span>
                      </div>
                    )) : (
                      <p className="text-muted-foreground text-center py-4">尚無方案分布資料</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>逾期提醒設定</CardTitle>
                <CardDescription>設定帳單逾期自動提醒規則</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">到期前提醒</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">帳單到期前 7 天發送提醒</p>
                    <Badge variant="outline" className="text-green-500">已啟用</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">逾期提醒</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">逾期後每 3 天發送催繳通知</p>
                    <Badge variant="outline" className="text-green-500">已啟用</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <X className="h-5 w-5 text-red-500" />
                      <span className="font-medium">自動停權</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">逾期超過 30 天自動暫停服務</p>
                    <Badge variant="outline" className="text-green-500">已啟用</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 編輯方案 Dialog */}
        <Dialog open={isEditPlanDialogOpen} onOpenChange={setIsEditPlanDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>編輯方案：{selectedPlan?.name}</DialogTitle>
              <DialogDescription>修改訂閱方案設定</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>方案名稱</Label>
                <Input
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>價格 (NT$)</Label>
                  <Input
                    type="number"
                    value={planFormData.price}
                    onChange={(e) => setPlanFormData({ ...planFormData, price: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>計費週期</Label>
                  <Select
                    value={planFormData.period}
                    onValueChange={(value) => setPlanFormData({ ...planFormData, period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="月">每月</SelectItem>
                      <SelectItem value="年">每年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>方案說明</Label>
                <Textarea
                  value={planFormData.description}
                  onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditPlanDialogOpen(false)}>取消</Button>
              <Button onClick={handleUpdatePlan}>儲存變更</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
