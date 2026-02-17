import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Package, Minus, AlertCircle, CheckCircle, Clock, Search, User } from "lucide-react";
import { toast } from "sonner";

export default function CustomerPackagesPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeductDialogOpen, setIsDeductDialogOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const organizationId = 1;
  
  const { data: packagesData, isLoading, refetch } = trpc.package.list.useQuery({
    organizationId,
    customerId: selectedCustomerId,
  });

  const { data: customers } = trpc.customer.list.useQuery({
    organizationId,
    limit: 100,
  });

  const { data: products } = trpc.product.list.useQuery({ organizationId });
  const { data: staffList } = trpc.staff.list.useQuery({ organizationId });

  const createMutation = trpc.package.create.useMutation({
    onSuccess: () => {
      toast.success("療程套餐已建立");
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deductMutation = trpc.package.deductSession.useMutation({
    onSuccess: () => {
      toast.success("堂數已扣除");
      setIsDeductDialogOpen(false);
      setSelectedPackageId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [formData, setFormData] = useState({
    customerId: 0,
    productId: 0,
    packageName: "",
    totalSessions: 10,
    purchasePrice: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: "",
    notes: "",
  });

  const [deductData, setDeductData] = useState({
    sessionsToDeduct: 1,
    staffId: undefined as number | undefined,
    notes: "",
  });

  const handleCreateSubmit = () => {
    if (!formData.customerId || !formData.packageName || !formData.purchasePrice) {
      toast.error("請填寫必要欄位");
      return;
    }
    createMutation.mutate({
      organizationId,
      ...formData,
      purchaseDate: new Date(formData.purchaseDate).toISOString(),
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
    });
  };

  const handleDeductSubmit = () => {
    if (!selectedPackageId) return;
    deductMutation.mutate({
      packageId: selectedPackageId,
      ...deductData,
    });
  };

  const getStatusBadge = (pkg: Record<string, any>) => {
    if (pkg.status === "expired") {
      return <Badge variant="destructive">已過期</Badge>;
    }
    if (pkg.status === "completed") {
      return <Badge variant="secondary">已用完</Badge>;
    }
    if (pkg.remainingSessions <= 2) {
      return <Badge variant="outline" className="border-orange-500 text-orange-500">即將用完</Badge>;
    }
    return <Badge className="bg-green-500">使用中</Badge>;
  };

  const packagesList = Array.isArray(packagesData) ? packagesData : (packagesData?.data || []);
  const filteredPackages = packagesList.filter((pkg: Record<string, any>) => {
    if (!searchTerm) return true;
    const customer = customers?.data?.find(c => c.id === pkg.customerId);
    return customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           pkg.packageName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 統計數據
  const stats = {
    total: filteredPackages.length,
    active: filteredPackages.filter((p: Record<string, any>) => p.status === "active").length,
    expiringSoon: filteredPackages.filter((p: Record<string, any>) => {
      if (!p.expiryDate) return false;
      const daysLeft = Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysLeft > 0 && daysLeft <= 30;
    }).length,
    lowSessions: filteredPackages.filter((p: Record<string, any>) => p.remainingSessions > 0 && p.remainingSessions <= 2).length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">療程套餐管理</h1>
          <p className="text-muted-foreground">管理客戶購買的療程套餐與堂數</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新增套餐
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>新增療程套餐</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>客戶 *</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, customerId: Number(v) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇客戶" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.data?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>套餐名稱 *</Label>
                <Input
                  value={formData.packageName}
                  onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                  placeholder="例如：玻尿酸10堂套餐"
                />
              </div>
              <div>
                <Label>關聯療程項目</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, productId: Number(v) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇療程項目" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.data?.map((p: Record<string, any>) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>總堂數 *</Label>
                  <Input
                    type="number"
                    value={formData.totalSessions}
                    onChange={(e) => setFormData({ ...formData, totalSessions: Number(e.target.value) })}
                    min={1}
                  />
                </div>
                <div>
                  <Label>購買金額 *</Label>
                  <Input
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder="NT$"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>購買日期 *</Label>
                  <Input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>有效期限</Label>
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>備註</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="套餐備註"
                />
              </div>
              <Button onClick={handleCreateSubmit} className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "建立中..." : "建立套餐"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4" />
              總套餐數
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              使用中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              即將到期
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">30天內到期</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              堂數不足
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowSessions}</div>
            <p className="text-xs text-muted-foreground">剩餘2堂以下</p>
          </CardContent>
        </Card>
      </div>

      {/* 篩選與搜尋 */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜尋客戶或套餐名稱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select onValueChange={(v) => setSelectedCustomerId(v === "all" ? undefined : Number(v))}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="篩選客戶" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部客戶</SelectItem>
            {customers?.data?.map((customer) => (
              <SelectItem key={customer.id} value={customer.id.toString()}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 套餐列表 */}
      <Card>
        <CardHeader>
          <CardTitle>套餐列表</CardTitle>
          <CardDescription>共 {filteredPackages.length} 個套餐</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">載入中...</div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">尚無套餐記錄</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>客戶</TableHead>
                  <TableHead>套餐名稱</TableHead>
                  <TableHead>堂數進度</TableHead>
                  <TableHead>購買金額</TableHead>
                  <TableHead>有效期限</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackages.map((pkg: Record<string, any>) => {
                  const customer = customers?.data?.find(c => c.id === pkg.customerId);
                  const usedSessions = pkg.totalSessions - pkg.remainingSessions;
                  const progress = (usedSessions / pkg.totalSessions) * 100;
                  const daysLeft = pkg.expiryDate 
                    ? Math.ceil((new Date(pkg.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;
                  
                  return (
                    <TableRow key={pkg.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {customer?.name || "未知"}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{pkg.packageName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>已使用 {usedSessions} / {pkg.totalSessions} 堂</span>
                            <span className="text-muted-foreground">剩餘 {pkg.remainingSessions} 堂</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>NT$ {Number(pkg.purchasePrice).toLocaleString()}</TableCell>
                      <TableCell>
                        {pkg.expiryDate ? (
                          <div>
                            <div>{new Date(pkg.expiryDate).toLocaleDateString('zh-TW')}</div>
                            {daysLeft !== null && daysLeft > 0 && (
                              <div className={`text-xs ${daysLeft <= 30 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                                剩餘 {daysLeft} 天
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">無期限</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(pkg)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pkg.remainingSessions <= 0 || pkg.status === "expired"}
                          onClick={() => {
                            setSelectedPackageId(pkg.id);
                            setIsDeductDialogOpen(true);
                          }}
                        >
                          <Minus className="w-4 h-4 mr-1" />
                          扣堂
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 扣堂對話框 */}
      <Dialog open={isDeductDialogOpen} onOpenChange={setIsDeductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>扣除堂數</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>扣除堂數</Label>
              <Input
                type="number"
                value={deductData.sessionsToDeduct}
                onChange={(e) => setDeductData({ ...deductData, sessionsToDeduct: Number(e.target.value) })}
                min={1}
              />
            </div>
            <div>
              <Label>執行人員</Label>
              <Select onValueChange={(v) => setDeductData({ ...deductData, staffId: Number(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇執行人員" />
                </SelectTrigger>
                <SelectContent>
                  {staffList?.data?.map((s: Record<string, any>) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>備註</Label>
              <Textarea
                value={deductData.notes}
                onChange={(e) => setDeductData({ ...deductData, notes: e.target.value })}
                placeholder="扣堂備註"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeductDialogOpen(false)}>取消</Button>
            <Button onClick={handleDeductSubmit} disabled={deductMutation.isPending}>
              {deductMutation.isPending ? "處理中..." : "確認扣堂"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
