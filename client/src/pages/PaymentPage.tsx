
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
// Organization context - using hardcoded value for now
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { QueryLoading, QueryError } from "@/components/ui/query-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Assuming these types exist based on the context
type Order = {
  id: number;
  organizationId: number;
  customerId: number;
  orderNumber: string;
  status: string | null;
  subtotal: string;
  discount: string | null;
  tax: string | null;
  total: string;
  couponId: number | null;
  createdAt: Date;
  updatedAt: Date;
  customer: { name: string; phone: string; };
  items: { name: string; quantity: number; price: number; }[];
  appointment: { date: string; };
};

type Transaction = {
  id: string;
  customerName: string;
  orderId: string;
  status: string;
  amount: number;
  createdAt: Date;
};

export default function PaymentPage() {
  const organizationId = 1; // TODO: from context
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("full");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Transaction | null>(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  const { data: txData, isLoading: txLoading, error: txError, refetch: refetchTx } = trpc.payment.getTransactions.useQuery(
    { organizationId, limit: 50 },
    { enabled: !!organizationId }
  );

  const { data: providers, isLoading: provLoading } = trpc.payment.listProviders.useQuery();

  const { data: ordersData, isLoading: ordersLoading } = trpc.order.list.useQuery(
    { organizationId, limit: 20 },
    { enabled: !!organizationId }
  );
  
  const orders = (ordersData as any)?.data ?? (Array.isArray(ordersData) ? ordersData : []);
  const transactions = (txData as any)?.data ?? (Array.isArray(txData) ? txData : []);

  const handlePayment = async () => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    // Mock payment logic
    setTimeout(() => {
      const isLinePay = Math.random() > 0.5;
      if (isLinePay) {
        toast.success("正在跳轉至 LINE Pay...", {
          description: "請在 LINE App 中完成付款"
        });
      } else {
        toast.success("付款成功！", {
          description: `已收取 NT$ ${paymentType === "deposit" ? selectedOrder.subtotal : selectedOrder.total}`
        });
      }
      setIsProcessing(false);
      setShowPaymentDialog(false);
    }, 1500);
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;
    setIsProcessing(true);
    // Mock refund logic
    setTimeout(() => {
      toast.success("退款成功！");
      setIsProcessing(false);
      setShowRefundDialog(false);
      setSelectedPayment(null);
    }, 1500);
  };

  const filteredRecords = useMemo(() => transactions.filter((record: Transaction) => {
    const matchesSearch = record.customerName.includes(searchTerm) || 
                         record.orderId.includes(searchTerm) ||
                         record.id.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [transactions, searchTerm, statusFilter]);

  if (txLoading || ordersLoading) return <QueryLoading variant="skeleton" />;

  if (txError) return <QueryError message={txError.message} onRetry={refetchTx} />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">支付與交易管理</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>待付款訂單</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 overflow-y-auto max-h-[600px]">
              {orders.map((order: any) => (
                <div 
                  key={order.id} 
                  className={`p-3 rounded-lg border cursor-pointer ${selectedOrder?.id === order.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                    </div>
                    <Badge variant="outline">{order.orderNumber}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    預約時間：{order.appointment.date}
                  </div>
                  <div className="space-y-1">
                    {(order.items as any[]).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.name} x {item.quantity}</span>
                        <span>NT$ {item.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <span className="text-sm">訂金 / 總額</span>
                    <div className="text-right">
                      <span className="text-primary font-medium">NT$ {Number(order.subtotal).toLocaleString()}</span>
                      <span className="text-muted-foreground"> / NT$ {Number(order.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedOrder && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>訂單詳情: {selectedOrder.orderNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>客戶:</strong> {selectedOrder.customer.name}</p>
                <Button onClick={() => setShowPaymentDialog(true)} className="mt-4">進行付款</Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>交易紀錄</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex space-x-2 mb-4">
                <Input 
                  placeholder="搜尋客戶名稱、訂單號..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="狀態" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有狀態</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="pending">處理中</SelectItem>
                    <SelectItem value="failed">失敗</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>客戶</TableHead>
                    <TableHead>訂單號</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>日期</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record: Transaction) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.id}</TableCell>
                      <TableCell>{record.customerName}</TableCell>
                      <TableCell>{record.orderId}</TableCell>
                      <TableCell>NT$ {record.amount.toLocaleString()}</TableCell>
                      <TableCell><Badge>{record.status}</Badge></TableCell>
                      <TableCell>{new Date(record.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedPayment(record); setShowRefundDialog(true); }}>退款</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>處理訂單 #{selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div>
              <p><strong>客戶:</strong> {selectedOrder.customer.name}</p>
              <div className="my-4">
                <Select value={paymentType} onValueChange={(v) => setPaymentType(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="付款類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">全額付款 (NT$ {Number(selectedOrder.total).toLocaleString()})</SelectItem>
                    <SelectItem value="deposit">支付訂金 (NT$ {Number(selectedOrder.subtotal).toLocaleString()})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-lg font-bold text-right my-4">
                應付金額: NT$ {paymentType === 'deposit' ? Number(selectedOrder.subtotal).toLocaleString() : Number(selectedOrder.total).toLocaleString()}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)} disabled={isProcessing}>取消</Button>
            <Button onClick={handlePayment} disabled={isProcessing}>{isProcessing ? '處理中...' : '確認付款'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認退款</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div>
              <p>確定要為交易 <strong>{selectedPayment.id}</strong> 辦理退款嗎？</p>
              <p>金額: NT$ {selectedPayment.amount.toLocaleString()}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)} disabled={isProcessing}>取消</Button>
            <Button variant="destructive" onClick={handleRefund} disabled={isProcessing}>{isProcessing ? '處理中...' : '確認退款'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
