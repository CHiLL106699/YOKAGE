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

// Mock data for inventory items
const mockInventory = [
  {
    id: 1,
    name: "玻尿酸 1ml",
    sku: "HA-001",
    category: "注射材料",
    currentStock: 5,
    minStock: 10,
    maxStock: 50,
    unit: "支",
    costPrice: 3000,
    status: "low",
    lastRestocked: "2024-01-10",
  },
  {
    id: 2,
    name: "肉毒桿菌 100U",
    sku: "BTX-001",
    category: "注射材料",
    currentStock: 3,
    minStock: 5,
    maxStock: 30,
    unit: "瓶",
    costPrice: 8000,
    status: "critical",
    lastRestocked: "2024-01-05",
  },
  {
    id: 3,
    name: "雷射探頭",
    sku: "LSR-001",
    category: "耗材",
    currentStock: 20,
    minStock: 10,
    maxStock: 100,
    unit: "個",
    costPrice: 500,
    status: "normal",
    lastRestocked: "2024-01-12",
  },
  {
    id: 4,
    name: "保濕精華液",
    sku: "SKC-001",
    category: "保養品",
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    unit: "瓶",
    costPrice: 200,
    status: "normal",
    lastRestocked: "2024-01-08",
  },
  {
    id: 5,
    name: "消毒紗布",
    sku: "MED-001",
    category: "醫療耗材",
    currentStock: 8,
    minStock: 20,
    maxStock: 200,
    unit: "包",
    costPrice: 50,
    status: "low",
    lastRestocked: "2024-01-01",
  },
  {
    id: 6,
    name: "手術手套 M",
    sku: "GLV-M01",
    category: "醫療耗材",
    currentStock: 150,
    minStock: 100,
    maxStock: 500,
    unit: "雙",
    costPrice: 10,
    status: "normal",
    lastRestocked: "2024-01-14",
  },
];

// Mock data for inventory movements
const mockMovements = [
  {
    id: 1,
    itemName: "玻尿酸 1ml",
    type: "out",
    quantity: 2,
    reason: "療程使用",
    operator: "王醫師",
    createdAt: "2024-01-15 14:30:00",
    note: "客戶：李小華",
  },
  {
    id: 2,
    itemName: "肉毒桿菌 100U",
    type: "out",
    quantity: 1,
    reason: "療程使用",
    operator: "陳醫師",
    createdAt: "2024-01-15 11:00:00",
    note: "客戶：張美麗",
  },
  {
    id: 3,
    itemName: "保濕精華液",
    type: "in",
    quantity: 20,
    reason: "進貨補充",
    operator: "管理員",
    createdAt: "2024-01-14 09:00:00",
    note: "供應商：美麗生技",
  },
  {
    id: 4,
    itemName: "消毒紗布",
    type: "out",
    quantity: 5,
    reason: "療程使用",
    operator: "護理師",
    createdAt: "2024-01-14 16:00:00",
    note: "",
  },
  {
    id: 5,
    itemName: "雷射探頭",
    type: "in",
    quantity: 10,
    reason: "進貨補充",
    operator: "管理員",
    createdAt: "2024-01-12 10:00:00",
    note: "供應商：醫療器材公司",
  },
];

// Mock alerts
const mockAlerts = [
  {
    id: 1,
    itemName: "肉毒桿菌 100U",
    type: "critical",
    message: "庫存嚴重不足，僅剩 3 瓶",
    createdAt: "2024-01-15 08:00:00",
    isRead: false,
  },
  {
    id: 2,
    itemName: "玻尿酸 1ml",
    type: "low",
    message: "庫存低於安全水位，目前 5 支",
    createdAt: "2024-01-15 08:00:00",
    isRead: false,
  },
  {
    id: 3,
    itemName: "消毒紗布",
    type: "low",
    message: "庫存低於安全水位，目前 8 包",
    createdAt: "2024-01-15 08:00:00",
    isRead: true,
  },
];

const statusColors: Record<string, string> = {
  normal: "bg-green-100 text-green-800",
  low: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  normal: "正常",
  low: "偏低",
  critical: "嚴重不足",
};

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof mockInventory[0] | null>(null);
  const [adjustType, setAdjustType] = useState<"in" | "out">("in");
  const [adjustQuantity, setAdjustQuantity] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  const filteredInventory = mockInventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(mockInventory.map(item => item.category)));

  const handleAdjustStock = (item: typeof mockInventory[0], type: "in" | "out") => {
    setSelectedItem(item);
    setAdjustType(type);
    setAdjustQuantity("");
    setAdjustReason("");
    setIsAdjustDialogOpen(true);
  };

  const handleSaveAdjustment = () => {
    if (!adjustQuantity || !adjustReason) {
      toast.error("請填寫數量和原因");
      return;
    }
    toast.success(`庫存${adjustType === "in" ? "入庫" : "出庫"}成功`);
    setIsAdjustDialogOpen(false);
  };

  const lowStockCount = mockInventory.filter(i => i.status === "low").length;
  const criticalStockCount = mockInventory.filter(i => i.status === "critical").length;
  const totalValue = mockInventory.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0);

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
              <div className="text-2xl font-bold">{mockInventory.length}</div>
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
        {mockAlerts.filter(a => !a.isRead).length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-orange-500" />
                庫存警示
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockAlerts.filter(a => !a.isRead).map((alert) => (
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
                    {mockMovements.map((movement) => (
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
                      {mockInventory.slice(0, 4).map((item) => (
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
