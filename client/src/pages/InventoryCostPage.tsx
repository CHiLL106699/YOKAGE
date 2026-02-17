import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Package, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react";

export default function InventoryCostPage() {
  const [organizationId] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    productId: 0,
    transactionType: "purchase" as "purchase" | "sale" | "adjustment" | "return" | "transfer" | "waste",
    quantity: 0,
    unitCost: "",
    notes: "",
  });

  // 產品列表
  const { data: products } = trpc.product.list.useQuery({ organizationId });

  // 庫存異動記錄
  const { data: transactions, refetch: refetchTransactions } = trpc.inventory.listTransactions.useQuery({
    organizationId,
    productId: selectedProductId || undefined,
  });

  // 成本分析
  const { data: costAnalysis } = trpc.inventory.getCostAnalysis.useQuery(
    { organizationId, productId: selectedProductId || 0 },
    { enabled: !!selectedProductId }
  );

  // 毛利分析
  const { data: marginAnalysis } = trpc.inventory.getGrossMargin.useQuery(
    { organizationId, productId: selectedProductId || 0 },
    { enabled: !!selectedProductId }
  );

  // 新增異動
  const createTransaction = trpc.inventory.createTransaction.useMutation({
    onSuccess: () => {
      toast.success("庫存異動記錄已新增");
      setIsAddDialogOpen(false);
      refetchTransactions();
      setNewTransaction({
        productId: 0,
        transactionType: "purchase",
        quantity: 0,
        unitCost: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(`新增失敗：${error.message}`);
    },
  });

  const handleAddTransaction = () => {
    if (!newTransaction.productId || !newTransaction.quantity) {
      toast.error("請填寫必要欄位");
      return;
    }

    const totalCost = newTransaction.unitCost 
      ? (parseFloat(newTransaction.unitCost) * newTransaction.quantity).toString()
      : undefined;

    createTransaction.mutate({
      organizationId,
      productId: newTransaction.productId,
      transactionType: newTransaction.transactionType,
      quantity: newTransaction.quantity,
      unitCost: newTransaction.unitCost || undefined,
      totalCost,
      notes: newTransaction.notes || undefined,
      transactionDate: new Date().toISOString(),
    });
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      purchase: { label: "進貨", color: "bg-green-100 text-green-800", icon: <ArrowDownRight className="h-3 w-3" /> },
      sale: { label: "銷售", color: "bg-blue-100 text-blue-800", icon: <ArrowUpRight className="h-3 w-3" /> },
      adjustment: { label: "調整", color: "bg-yellow-100 text-yellow-800", icon: <RefreshCw className="h-3 w-3" /> },
      return: { label: "退貨", color: "bg-orange-100 text-orange-800", icon: <ArrowDownRight className="h-3 w-3" /> },
      transfer: { label: "調撥", color: "bg-purple-100 text-purple-800", icon: <RefreshCw className="h-3 w-3" /> },
      waste: { label: "報廢", color: "bg-red-100 text-red-800", icon: <TrendingDown className="h-3 w-3" /> },
    };
    return labels[type] || { label: type, color: "bg-gray-100 text-gray-800", icon: null };
  };

  const selectedProduct = products?.data?.find((p: Record<string, any>) => p.id === selectedProductId);

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">庫存成本與毛利分析</h1>
          <p className="text-muted-foreground">追蹤產品庫存異動、計算成本與毛利率</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增異動
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增庫存異動</DialogTitle>
              <DialogDescription>記錄產品的進貨、銷售或其他異動</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>產品</Label>
                <Select
                  value={newTransaction.productId.toString()}
                  onValueChange={(value) => setNewTransaction(prev => ({ ...prev, productId: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇產品" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.data?.map((product: Record<string, any>) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>異動類型</Label>
                <Select
                  value={newTransaction.transactionType}
                  onValueChange={(value: any) => setNewTransaction(prev => ({ ...prev, transactionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">進貨</SelectItem>
                    <SelectItem value="sale">銷售</SelectItem>
                    <SelectItem value="adjustment">調整</SelectItem>
                    <SelectItem value="return">退貨</SelectItem>
                    <SelectItem value="transfer">調撥</SelectItem>
                    <SelectItem value="waste">報廢</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>數量</Label>
                  <Input
                    type="number"
                    value={newTransaction.quantity}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>單位成本</Label>
                  <Input
                    type="number"
                    value={newTransaction.unitCost}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, unitCost: e.target.value }))}
                    placeholder="選填"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>備註</Label>
                <Input
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="選填"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>取消</Button>
              <Button onClick={handleAddTransaction} disabled={createTransaction.isPending}>
                {createTransaction.isPending ? "處理中..." : "新增"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 產品選擇 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">選擇產品</CardTitle>
          <CardDescription>選擇要分析的產品</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products?.data?.map((product: Record<string, any>) => (
              <Button
                key={product.id}
                variant={selectedProductId === product.id ? "default" : "outline"}
                className="h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => setSelectedProductId(product.id)}
              >
                <Package className="h-5 w-5" />
                <span className="text-xs text-center line-clamp-2">{product.name}</span>
                <Badge variant="secondary" className="text-xs">
                  庫存: {product.stock || 0}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedProductId && (
        <>
          {/* 成本與毛利統計 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均成本</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${costAnalysis?.averageCost?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">每單位平均進貨成本</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">總進貨成本</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${costAnalysis?.totalCost?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  共進貨 {costAnalysis?.totalQuantity || 0} 單位
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">毛利</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(marginAnalysis?.grossMargin || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${marginAnalysis?.grossMargin?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  售價 ${marginAnalysis?.sellingPrice?.toLocaleString() || 0} - 成本 ${marginAnalysis?.cost?.toLocaleString() || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">毛利率</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(marginAnalysis?.marginRate || 0) >= 30 ? 'text-green-600' : (marginAnalysis?.marginRate || 0) >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {marginAnalysis?.marginRate?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {(marginAnalysis?.marginRate || 0) >= 30 ? '健康' : (marginAnalysis?.marginRate || 0) >= 15 ? '偏低' : '需關注'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 異動記錄 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedProduct?.name} - 庫存異動記錄
              </CardTitle>
              <CardDescription>查看該產品的所有庫存異動歷史</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx: Record<string, any>) => {
                    const typeInfo = getTransactionTypeLabel(tx.transactionType);
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge className={typeInfo.color}>
                            {typeInfo.icon}
                            <span className="ml-1">{typeInfo.label}</span>
                          </Badge>
                          <div>
                            <p className="font-medium">
                              {tx.transactionType === 'purchase' || tx.transactionType === 'return' ? '+' : '-'}
                              {tx.quantity} 單位
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(tx.transactionDate).toLocaleString('zh-TW')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {tx.unitCost && (
                            <p className="font-medium">${Number(tx.unitCost).toLocaleString()} / 單位</p>
                          )}
                          {tx.totalCost && (
                            <p className="text-sm text-muted-foreground">
                              總計 ${Number(tx.totalCost).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">尚無異動記錄</p>
                  <p className="text-sm">點擊「新增異動」開始記錄</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
