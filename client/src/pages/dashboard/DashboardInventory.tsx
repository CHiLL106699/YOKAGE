
import { useState, useEffect } from "react";
import { safeDate, safeDateTime, safeStr, safeTime, safeMoney } from '@/lib/safeFormat';
import { Link } from "wouter";
import { ArrowLeft, Pill, ShieldCheck, Search, Plus, Minus, RefreshCw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";

// Mock data for drug control rules, assuming this is static
const drugControl = {
  title: "藥物庫存管理",
  rules: [
    "所有管制藥品必須雙人上鎖管理。",
    "藥品取用必須有醫師或護理師簽核。",
    "每日定時盤點，確保帳物相符。",
    "過期藥品應立即隔離並依規定銷毀。",
  ],
};

const categoryLabels: { [key: string]: string } = {
  controlled: '管制藥品',
  general: '常備藥品',
  consumable: '醫材耗材',
};

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  unit: string;
  min_stock: number;
}

export default function DashboardInventory() {
  const organizationId = 1; // TODO: from context

  const [searchQuery, setSearchQuery] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [actionType, setActionType] = useState<'increase' | 'decrease' | null>(null);
  const [amount, setAmount] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const inventoryQuery = (trpc as any).inventory.list.useQuery({ organizationId });
  const logsQuery = (trpc as any).inventory.listTransactions.useQuery({ organizationId });

  const updateStockMutation = (trpc as any).inventory.update.useMutation({
    onSuccess: () => {
      toast.success("庫存更新成功");
      inventoryQuery.refetch();
      logsQuery.refetch();
      setIsDialogOpen(false);
      setAmount(1);
      setOperatorName("");
    },
    onError: (error) => {
      toast.error(`更新失敗: ${error.message}`);
    },
  });
  
  const createTransactionMutation = (trpc as any).inventory.createTransaction.useMutation({
      onSuccess: () => {
        // This is part of the update, so main feedback is in updateStockMutation
      },
      onError: (error) => {
        toast.error(`紀錄操作失敗: ${error.message}`);
      }
  });

  const handleUpdateStock = async () => {
    if (!selectedItem || !actionType || !operatorName) {
      toast.error("請填寫完整資訊");
      return;
    }

    const newStock = actionType === 'increase' ? selectedItem.stock + amount : selectedItem.stock - amount;
    if (newStock < 0) {
        toast.error("庫存不能為負數");
        return;
    }

    updateStockMutation.mutate({
      id: selectedItem.id,
      stock: newStock,
    });

    createTransactionMutation.mutate({
        organizationId,
        productId: selectedItem.id,
        transactionType: actionType,
        quantity: amount,
        notes: `操作人員: ${operatorName}`,
        transactionDate: new Date().toISOString(),
    });
  };

  const openUpdateDialog = (item: InventoryItem, type: 'increase' | 'decrease') => {
    setSelectedItem(item);
    setActionType(type);
    setIsDialogOpen(true);
  };

  if (inventoryQuery.isLoading) return <QueryLoading />;
  if (inventoryQuery.error) return <QueryError error={inventoryQuery.error.message} />;

  const filteredInventory = inventoryQuery.data?.filter((item: InventoryItem) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">{drugControl.title}</h1>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-lg shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 rounded-full shrink-0">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-emerald-900">藥物管理核心原則</h2>
              <p className="text-emerald-800">
                嚴格遵守藥物管理規範，確保用藥安全與庫存準確。所有藥物取用皆需經過授權與登記。
              </p>
            </div>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-bold text-slate-900">
                執行規範 (SOP)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {drugControl.rules.map((rule, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 font-bold text-blue-600">
                    {idx + 1}
                  </div>
                  <span className="font-medium text-slate-800">{rule}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              即時庫存
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              操作紀錄
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-lg font-bold text-slate-900">
                      即時庫存查詢
                    </CardTitle>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input 
                      className="pl-9 h-9 bg-slate-50 border-slate-200" 
                      placeholder="搜尋藥物名稱..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">藥物名稱</th>
                        <th className="px-4 py-3">分類</th>
                        <th className="px-4 py-3 text-center">當前庫存</th>
                        <th className="px-4 py-3 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInventory.map((item: InventoryItem) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {item.name}
                            {item.stock <= item.min_stock && (
                              <span className="ml-2 text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                低庫存
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="font-normal text-slate-600 bg-slate-100">
                              {categoryLabels[item.category] || item.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-mono font-bold text-lg ${item.stock <= item.min_stock ? 'text-red-600' : 'text-slate-700'}`}>
                              {item.stock}
                            </span>
                            <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                                onClick={() => openUpdateDialog(item, 'decrease')}
                                disabled={item.stock <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50"
                                onClick={() => openUpdateDialog(item, 'increase')}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredInventory.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    沒有找到相關藥物
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
             <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-lg font-bold text-slate-900">
                    操作紀錄日誌
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                 {logsQuery.isLoading && <div className="p-8 text-center">載入中...</div>}
                 {logsQuery.error && <div className="p-8 text-center text-red-500">無法載入紀錄</div>}
                 {logsQuery.data && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">時間</th>
                                <th className="px-4 py-3">藥物</th>
                                <th className="px-4 py-3">操作</th>
                                <th className="px-4 py-3 text-right">數量</th>
                                <th className="px-4 py-3">操作人員</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {(logsQuery.data as any[]).map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 text-slate-500">{safeDateTime(log.transactionDate)}</td>
                                <td className="px-4 py-3 font-medium text-slate-800">{log.product_name || 'N/A'}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={log.transactionType === 'increase' ? 'success' : 'destructive'}>
                                    {log.transactionType === 'increase' ? '入庫' : '出庫'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">{log.quantity}</td>
                                <td className="px-4 py-3 text-slate-500">{log.notes?.replace('操作人員: ','') || 'N/A'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                 )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'increase' ? '增加庫存' : '扣除庫存'} - {selectedItem?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="operator-name">操作人員姓名</Label>
                <Input 
                  id="operator-name" 
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="請輸入您的姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">數量</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
              <Button onClick={handleUpdateStock} disabled={updateStockMutation.isLoading || !operatorName}>
                {updateStockMutation.isLoading ? '處理中...' : '確認'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
