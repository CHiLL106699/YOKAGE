
import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Minus, Search, Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { QueryLoading } from '@/components/ui/query-state';
import { Label } from '@/components/ui/label';

// Placeholder for missing component
const QueryError = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="text-red-500">
    <p>Error: {message}</p>
    <Button onClick={onRetry}>Retry</Button>
  </div>
);

const statusColors: { [key: string]: string } = {
  'in-stock': 'bg-green-100 text-green-800',
  'low-stock': 'bg-yellow-100 text-yellow-800',
  'out-of-stock': 'bg-red-100 text-red-800',
};

const statusLabels: { [key: string]: string } = {
  'in-stock': '正常',
  'low-stock': '低庫存',
  'out-of-stock': '缺貨',
};

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  costPrice: number;
  status: string;
  lastRestocked: string;
}

export default function InventoryPage() {
  const organization = { id: 1 }; // TODO: from context
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const { data: productsData, error: productsError, isLoading: productsLoading, refetch: refetchProducts } = trpc.dashboardB.inventory.list.useQuery(
    { organizationId: organization.id },
    { enabled: !!organization.id }
  );

  const inventoryItems = useMemo(() => (productsData as any)?.data ?? productsData ?? [], [productsData]);

  const filteredInventory = useMemo(() => {
    return inventoryItems.filter((item: any) => {
      const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventoryItems, searchTerm, selectedCategory]);

  const totalValue = filteredInventory.reduce((sum: number, item: any) => sum + (Number(item.costPrice) || 0) * (item.currentStock || 0), 0);
  const lowStockCount = filteredInventory.filter((item: any) => (item.currentStock || 0) < (item.minStock || 0) && (item.currentStock || 0) > 0).length;
  const criticalStockCount = filteredInventory.filter((item: any) => (item.currentStock || 0) === 0).length;
  const categories = Array.from(new Set(inventoryItems.map((i: any) => i.category)));

  const handleAdjustStock = (item: any, type: 'in' | 'out') => {
    setSelectedItem(item);
    setAdjustType(type);
    setIsAdjustDialogOpen(true);
    setAdjustQuantity('');
    setAdjustReason('');
  };

  const handleSaveAdjustment = () => {
    if (!adjustQuantity || !adjustReason) {
      toast.error("請填寫數量和原因");
      return;
    }
    toast.success(`庫存${adjustType === "in" ? "入庫" : "出庫"}成功`);
    setIsAdjustDialogOpen(false);
  };

  if (productsLoading) return <DashboardLayout><QueryLoading variant="skeleton-cards" /></DashboardLayout>;
  if (productsError) return <QueryError message={productsError.message} onRetry={refetchProducts} />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">庫存管理</h1>
          <Button>新增品項</Button>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總庫存價值</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">所有品項的總成本</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">低庫存品項</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockCount}</div>
              <p className="text-xs text-muted-foreground">庫存量低於安全庫存</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">缺貨品項</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalStockCount}</div>
              <p className="text-xs text-muted-foreground">庫存量為零</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋品項名稱..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="所有分類" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有分類</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>品項名稱</TableHead>
                    <TableHead>分類</TableHead>
                    <TableHead className="text-right">現有庫存</TableHead>
                    <TableHead className="text-right">安全庫存</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>上次補貨</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.category}</TableCell>
                        <TableCell className="text-right">
                          {item.currentStock} {item.unit}
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        無符合條件的品項
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

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
                        <SelectItem value="sale">銷售出庫</SelectItem>
                        <SelectItem value="expired">過期報廢</SelectItem>
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
