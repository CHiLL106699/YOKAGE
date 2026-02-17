import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Plus,
  Minus,
  History,
  Settings,
  Bell,
  Search,
  Filter,
} from "lucide-react";


export default function InventoryPage() {
  const organizationId = 1; // TODO: from context
  
  const { data: productsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = trpc.product.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const { data: transactionsData, isLoading: txLoading, refetch: refetchTx } = trpc.inventory.listTransactions.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const createTxMutation = trpc.inventory.createTransaction.useMutation({
    onSuccess: () => { toast.success("庫存交易已建立"); refetchProducts(); refetchTx(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const isLoading = productsLoading || txLoading;
  const inventoryItems = (productsData?.data ?? []).map((p: any) => ({
    id: p.id, name: p.name, sku: p.sku || `SKU-${p.id}`, category: p.category || "一般",
    currentStock: p.stock ?? 0, minStock: p.minStock ?? 10, maxStock: p.maxStock ?? 100,
    unit: p.unit || "個", costPrice: Number(p.costPrice || 0), sellingPrice: Number(p.price || 0),
    supplier: p.supplier || "-", lastRestocked: p.updatedAt || "-", status: p.isActive ? "正常" : "停用",
    expiryDate: p.expiryDate || null,
  }));
  const transactions = (transactionsData ?? []).map((t: any) => ({
    id: t.id, productName: t.productName || `產品 #${t.productId}`, type: t.transactionType,
    quantity: t.quantity, date: t.transactionDate, notes: t.notes || "",
    staffName: t.staffName || "-",
  }));

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [adjustQuantity, setAdjustQuantity] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  const filteredInventory = inventoryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalValue = filteredInventory.reduce((sum, item) => sum + item.costPrice * item.currentStock, 0);
  const lowStockCount = filteredInventory.filter(item => item.currentStock < item.minStock && item.currentStock > 0).length;
  const criticalStockCount = filteredInventory.filter(item => item.currentStock === 0).length;
  const categories = [...new Set(inventoryItems.map(i => i.category))];


  const handleSaveAdjustment = () => {
    if (!adjustQuantity || !adjustReason) {
      toast.error("請填寫數量和原因");
      return;
    }
    toast.success(`庫存${adjustType === "in" ? "入庫" : "出庫"}成功`);
    setIsAdjustDialogOpen(false);
  };


  if (productsError) return <QueryError message={productsError.message} onRetry={refetchProducts} />;


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">庫存管理</h1>
            <p className="text-muted-foreground mt-1">管理產品庫存與警示設定</p>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總品項數</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryItems.length}</div>
              <p className="text-xs text-muted-foreground">管理中的品項</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">庫存總值</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                NT$ {totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">以成本價計算</p>
            </CardContent>
          </Card>

          <Card className={lowStockCount > 0 ? "border-yellow-500" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">庫存偏低</CardTitle>
              <TrendingDown className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
              <p className="text-xs text-muted-foreground">需要補貨</p>
            </CardContent>
          </Card>

          <Card className={criticalStockCount > 0 ? "border-red-500" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">嚴重不足</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalStockCount}</div>
              <p className="text-xs text-muted-foreground">緊急補貨</p>
            </CardContent>
          </Card>
        </div>

        {/* 警示通知 */}
        {([] as any[]).filter(a => !a.isRead).length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-orange-500" />
                庫存警示
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {([] as any[]).filter(a => !a.isRead).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${alert.type === "critical" ? "text-red-500" : "text-yellow-500"}`} />
                      <span className="font-medium">{alert.itemName}</span>
                      <span className="text-sm text-muted-foreground">{alert.message}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      立即補貨
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 主要內容 */}
        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">庫存列表</TabsTrigger>
            <TabsTrigger value="movements">進出記錄</TabsTrigger>
            <TabsTrigger value="settings">警示設定</TabsTrigger>
          </TabsList>

          {/* 庫存列表 */}
          <TabsContent value="inventory" className="space-y-4">
            {/* 搜尋與篩選 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋品項名稱或 SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="分類篩選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分類</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="狀態篩選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  <SelectItem value="normal">正常</SelectItem>
                  <SelectItem value="low">偏低</SelectItem>
                  <SelectItem value="critical">嚴重不足</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 庫存表格 */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>品項名稱</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>分類</TableHead>
                    <TableHead className="text-right">目前庫存</TableHead>
                    <TableHead className="text-right">安全庫存</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>最後進貨</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.status !== "normal" ? "text-red-600 font-bold" : ""}>
                          {item.currentStock}
                        </span>
                        <span className="text-muted-foreground ml-1">{item.unit}</span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.minStock} {item.unit}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[item.status]}>
                          {statusLabels[item.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.lastRestocked}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdjustStock(item, "in")}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdjustStock(item, "out")}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* 進出記錄 */}
          <TabsContent value="movements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">庫存異動記錄</CardTitle>
                <CardDescription>查看所有庫存進出記錄</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>時間</TableHead>
                      <TableHead>品項</TableHead>
                      <TableHead>類型</TableHead>
                      <TableHead className="text-right">數量</TableHead>
                      <TableHead>原因</TableHead>
                      <TableHead>操作人</TableHead>
                      <TableHead>備註</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {([] as any[]).map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {movement.createdAt}
                        </TableCell>
                        <TableCell className="font-medium">{movement.itemName}</TableCell>
                        <TableCell>
                          <Badge className={movement.type === "in" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                            {movement.type === "in" ? "入庫" : "出庫"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={movement.type === "in" ? "text-green-600" : "text-blue-600"}>
                            {movement.type === "in" ? "+" : "-"}{movement.quantity}
                          </span>
                        </TableCell>
                        <TableCell>{movement.reason}</TableCell>
                        <TableCell>{movement.operator}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {movement.note || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 警示設定 */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">全域警示設定</CardTitle>
                  <CardDescription>設定庫存警示的全域規則</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>低庫存警示閾值（%）</Label>
                    <Input type="number" defaultValue="50" />
                    <p className="text-xs text-muted-foreground">
                      當庫存低於安全庫存的此百分比時發出警示
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>嚴重不足閾值（%）</Label>
                    <Input type="number" defaultValue="20" />
                    <p className="text-xs text-muted-foreground">
                      當庫存低於安全庫存的此百分比時發出緊急警示
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">通知設定</CardTitle>
                  <CardDescription>設定警示通知方式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>系統內通知</Label>
                      <p className="text-xs text-muted-foreground">在系統內顯示警示</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>LINE 通知</Label>
                      <p className="text-xs text-muted-foreground">發送 LINE 訊息給管理員</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email 通知</Label>
                      <p className="text-xs text-muted-foreground">發送 Email 給管理員</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">品項個別設定</CardTitle>
                  <CardDescription>為特定品項設定不同的安全庫存</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>品項名稱</TableHead>
                        <TableHead className="text-right">最低庫存</TableHead>
                        <TableHead className="text-right">最高庫存</TableHead>
                        <TableHead className="text-right">建議訂購量</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryItems.slice(0, 4).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              defaultValue={item.minStock}
                              className="w-20 text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              defaultValue={item.maxStock}
                              className="w-20 text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              defaultValue={item.maxStock - item.minStock}
                              className="w-20 text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              儲存
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* 庫存調整對話框 */}
        <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {adjustType === "in" ? "庫存入庫" : "庫存出庫"}
              </DialogTitle>
              <DialogDescription>
                {selectedItem?.name} - 目前庫存：{selectedItem?.currentStock} {selectedItem?.unit}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>數量</Label>
                <Input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  placeholder={`輸入${adjustType === "in" ? "入庫" : "出庫"}數量`}
                />
              </div>
              <div className="space-y-2">
                <Label>原因</Label>
                <Select value={adjustReason} onValueChange={setAdjustReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇原因" />
                  </SelectTrigger>
                  <SelectContent>
                    {adjustType === "in" ? (
                      <>
                        <SelectItem value="purchase">進貨補充</SelectItem>
                        <SelectItem value="return">退貨入庫</SelectItem>
                        <SelectItem value="adjust">盤點調整</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="treatment">療程使用</SelectItem>
                        <SelectItem value="sale">銷售出貨</SelectItem>
                        <SelectItem value="damage">損壞報廢</SelectItem>
                        <SelectItem value="adjust">盤點調整</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveAdjustment}>
                確認{adjustType === "in" ? "入庫" : "出庫"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}