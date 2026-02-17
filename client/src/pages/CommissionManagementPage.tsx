import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, DollarSign, Percent, Users, CheckCircle, Clock, Calculator, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function CommissionManagementPage() {
  const [isCreateRuleDialogOpen, setIsCreateRuleDialogOpen] = useState(false);
  const [isCreateCommissionDialogOpen, setIsCreateCommissionDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  
  const organizationId = 1;
  
  const { data: rules, refetch: refetchRules } = trpc.commission.listRules.useQuery({ organizationId });
  const { data: commissions, isLoading, refetch: refetchCommissions } = trpc.commission.listCommissions.useQuery({
    organizationId,
    staffId: selectedStaffId,
    status: statusFilter,
  });

  const { data: staffList } = trpc.staff.list.useQuery({ organizationId });
  const { data: products } = trpc.product.list.useQuery({ organizationId });

  const createRuleMutation = trpc.commission.createRule.useMutation({
    onSuccess: () => {
      toast.success("佣金規則已建立");
      setIsCreateRuleDialogOpen(false);
      refetchRules();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createCommissionMutation = trpc.commission.createCommission.useMutation({
    onSuccess: () => {
      toast.success("佣金記錄已建立");
      setIsCreateCommissionDialogOpen(false);
      refetchCommissions();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateStatusMutation = trpc.commission.updateCommissionStatus.useMutation({
    onSuccess: () => {
      toast.success("狀態已更新");
      refetchCommissions();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [ruleFormData, setRuleFormData] = useState({
    name: "",
    productId: undefined as number | undefined,
    productCategory: "",
    commissionType: "percentage" as "percentage" | "fixed",
    commissionValue: "",
    minSalesAmount: "",
  });

  const [commissionFormData, setCommissionFormData] = useState({
    staffId: 0,
    salesAmount: "",
    commissionAmount: "",
    commissionDate: new Date().toISOString().split('T')[0],
    notes: "",
  });

  const handleCreateRuleSubmit = () => {
    if (!ruleFormData.name || !ruleFormData.commissionValue) {
      toast.error("請填寫必要欄位");
      return;
    }
    createRuleMutation.mutate({
      organizationId,
      ...ruleFormData,
    });
  };

  const handleCreateCommissionSubmit = () => {
    if (!commissionFormData.staffId || !commissionFormData.salesAmount || !commissionFormData.commissionAmount) {
      toast.error("請填寫必要欄位");
      return;
    }
    createCommissionMutation.mutate({
      organizationId,
      ...commissionFormData,
      commissionDate: new Date(commissionFormData.commissionDate).toISOString(),
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "待審核", variant: "outline" },
      approved: { label: "已核准", variant: "secondary" },
      paid: { label: "已發放", variant: "default" },
      cancelled: { label: "已取消", variant: "destructive" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 計算統計數據
  const commissionList = commissions || [];
  const stats = {
    totalCommissions: commissionList.length,
    pendingAmount: commissionList
      .filter((c: Record<string, any>) => c.status === "pending")
      .reduce((sum: number, c: Record<string, any>) => sum + Number(c.commissionAmount), 0),
    approvedAmount: commissionList
      .filter((c: Record<string, any>) => c.status === "approved")
      .reduce((sum: number, c: Record<string, any>) => sum + Number(c.commissionAmount), 0),
    paidAmount: commissionList
      .filter((c: Record<string, any>) => c.status === "paid")
      .reduce((sum: number, c: Record<string, any>) => sum + Number(c.commissionAmount), 0),
    totalSales: commissionList
      .reduce((sum: number, c: Record<string, any>) => sum + Number(c.salesAmount), 0),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">佣金管理</h1>
          <p className="text-muted-foreground">管理員工佣金規則與發放記錄</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateRuleDialogOpen} onOpenChange={setIsCreateRuleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Percent className="w-4 h-4 mr-2" />
                新增規則
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增佣金規則</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>規則名稱 *</Label>
                  <Input
                    value={ruleFormData.name}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                    placeholder="例如：玻尿酸銷售佣金"
                  />
                </div>
                <div>
                  <Label>適用產品</Label>
                  <Select onValueChange={(v) => setRuleFormData({ ...ruleFormData, productId: v ? Number(v) : undefined })}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇產品（選填）" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.data?.map((p: Record<string, any>) => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>產品分類</Label>
                  <Select onValueChange={(v) => setRuleFormData({ ...ruleFormData, productCategory: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇分類（選填）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="injection">注射類</SelectItem>
                      <SelectItem value="laser">雷射類</SelectItem>
                      <SelectItem value="skincare">保養品</SelectItem>
                      <SelectItem value="surgery">手術類</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>佣金類型 *</Label>
                    <Select 
                      value={ruleFormData.commissionType}
                      onValueChange={(v) => setRuleFormData({ ...ruleFormData, commissionType: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">百分比</SelectItem>
                        <SelectItem value="fixed">固定金額</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>佣金數值 *</Label>
                    <Input
                      value={ruleFormData.commissionValue}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, commissionValue: e.target.value })}
                      placeholder={ruleFormData.commissionType === "percentage" ? "例如：10" : "例如：500"}
                    />
                  </div>
                </div>
                <div>
                  <Label>最低銷售金額（選填）</Label>
                  <Input
                    value={ruleFormData.minSalesAmount}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, minSalesAmount: e.target.value })}
                    placeholder="達到此金額才計算佣金"
                  />
                </div>
                <Button onClick={handleCreateRuleSubmit} className="w-full" disabled={createRuleMutation.isPending}>
                  {createRuleMutation.isPending ? "建立中..." : "建立規則"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateCommissionDialogOpen} onOpenChange={setIsCreateCommissionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新增佣金
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增佣金記錄</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>員工 *</Label>
                  <Select onValueChange={(v) => setCommissionFormData({ ...commissionFormData, staffId: Number(v) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇員工" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList?.data?.map((s: Record<string, any>) => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>銷售金額 *</Label>
                    <Input
                      value={commissionFormData.salesAmount}
                      onChange={(e) => setCommissionFormData({ ...commissionFormData, salesAmount: e.target.value })}
                      placeholder="NT$"
                    />
                  </div>
                  <div>
                    <Label>佣金金額 *</Label>
                    <Input
                      value={commissionFormData.commissionAmount}
                      onChange={(e) => setCommissionFormData({ ...commissionFormData, commissionAmount: e.target.value })}
                      placeholder="NT$"
                    />
                  </div>
                </div>
                <div>
                  <Label>佣金日期</Label>
                  <Input
                    type="date"
                    value={commissionFormData.commissionDate}
                    onChange={(e) => setCommissionFormData({ ...commissionFormData, commissionDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>備註</Label>
                  <Input
                    value={commissionFormData.notes}
                    onChange={(e) => setCommissionFormData({ ...commissionFormData, notes: e.target.value })}
                    placeholder="佣金備註"
                  />
                </div>
                <Button onClick={handleCreateCommissionSubmit} className="w-full" disabled={createCommissionMutation.isPending}>
                  {createCommissionMutation.isPending ? "建立中..." : "建立佣金記錄"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              總銷售額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NT$ {stats.totalSales.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              待審核
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">NT$ {stats.pendingAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              已核准
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">NT$ {stats.approvedAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              已發放
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">NT$ {stats.paidAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              佣金筆數
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommissions}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="commissions">
        <TabsList>
          <TabsTrigger value="commissions">佣金記錄</TabsTrigger>
          <TabsTrigger value="rules">佣金規則</TabsTrigger>
        </TabsList>

        <TabsContent value="commissions" className="space-y-4">
          {/* 篩選 */}
          <div className="flex gap-4 items-center">
            <Select onValueChange={(v) => setSelectedStaffId(v === "all" ? undefined : Number(v))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="篩選員工" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部員工</SelectItem>
                {staffList?.data?.map((s: Record<string, any>) => (
                  <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="狀態篩選" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部狀態</SelectItem>
                <SelectItem value="pending">待審核</SelectItem>
                <SelectItem value="approved">已核准</SelectItem>
                <SelectItem value="paid">已發放</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 佣金列表 */}
          <Card>
            <CardHeader>
              <CardTitle>佣金記錄列表</CardTitle>
              <CardDescription>共 {commissionList.length} 筆記錄</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">載入中...</div>
              ) : commissionList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">尚無佣金記錄</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日期</TableHead>
                      <TableHead>員工</TableHead>
                      <TableHead>銷售金額</TableHead>
                      <TableHead>佣金金額</TableHead>
                      <TableHead>佣金比例</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>備註</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissionList.map((commission: Record<string, any>) => {
                      const staff = staffList?.data?.find((s: Record<string, any>) => s.id === commission.staffId);
                      const rate = Number(commission.salesAmount) > 0 
                        ? ((Number(commission.commissionAmount) / Number(commission.salesAmount)) * 100).toFixed(1)
                        : 0;
                      return (
                        <TableRow key={commission.id}>
                          <TableCell>
                            {new Date(commission.commissionDate).toLocaleDateString('zh-TW')}
                          </TableCell>
                          <TableCell className="font-medium">{staff?.name || "未知"}</TableCell>
                          <TableCell>NT$ {Number(commission.salesAmount).toLocaleString()}</TableCell>
                          <TableCell className="font-bold text-green-600">
                            NT$ {Number(commission.commissionAmount).toLocaleString()}
                          </TableCell>
                          <TableCell>{rate}%</TableCell>
                          <TableCell>{getStatusBadge(commission.status)}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{commission.notes || "-"}</TableCell>
                          <TableCell>
                            <Select
                              value={commission.status}
                              onValueChange={(v) => updateStatusMutation.mutate({ id: commission.id, status: v as any })}
                            >
                              <SelectTrigger className="w-[100px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">待審核</SelectItem>
                                <SelectItem value="approved">已核准</SelectItem>
                                <SelectItem value="paid">已發放</SelectItem>
                                <SelectItem value="cancelled">已取消</SelectItem>
                              </SelectContent>
                            </Select>
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

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>佣金規則設定</CardTitle>
              <CardDescription>定義不同產品或分類的佣金計算方式</CardDescription>
            </CardHeader>
            <CardContent>
              {!rules || rules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">尚無佣金規則</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>規則名稱</TableHead>
                      <TableHead>適用產品</TableHead>
                      <TableHead>產品分類</TableHead>
                      <TableHead>佣金類型</TableHead>
                      <TableHead>佣金數值</TableHead>
                      <TableHead>最低銷售額</TableHead>
                      <TableHead>狀態</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule: Record<string, any>) => {
                      const product = products?.data?.find((p: Record<string, any>) => p.id === rule.productId);
                      return (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.name}</TableCell>
                          <TableCell>{product?.name || "全部"}</TableCell>
                          <TableCell>{rule.productCategory || "全部"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {rule.commissionType === "percentage" ? "百分比" : "固定金額"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold">
                            {rule.commissionType === "percentage" 
                              ? `${rule.commissionValue}%` 
                              : `NT$ ${Number(rule.commissionValue).toLocaleString()}`}
                          </TableCell>
                          <TableCell>
                            {rule.minSalesAmount 
                              ? `NT$ ${Number(rule.minSalesAmount).toLocaleString()}` 
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={rule.isActive ? "default" : "secondary"}>
                              {rule.isActive ? "啟用" : "停用"}
                            </Badge>
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
      </Tabs>
    </div>
  );
}
