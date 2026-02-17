import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  XCircle,
  RefreshCw,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  RotateCcw
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";



export default function PaymentPage() {
  const organizationId = 1; // TODO: from context
  
  const { data: txData, isLoading: txLoading, error: txError, refetch: refetchTx } = trpc.payment.getTransactions.useQuery(
    { organizationId, page: 1, limit: 50 },
    { enabled: !!organizationId }
  );
  
  const { data: providers, isLoading: provLoading } = trpc.payment.listProviders.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );
  
  const { data: orders, isLoading: ordersLoading } = trpc.order.list.useQuery(
    { organizationId, limit: 20 },
    { enabled: !!organizationId }
  );
  
  const createPaymentMutation = trpc.payment.createPayment.useMutation({
    onSuccess: () => { toast.success("付款已建立"); refetchTx(); },
    onError: (err: any) => toast.error(err.message),
  });
  
  const isLoading = txLoading || provLoading;
  const transactions = (txData as any)?.data ?? (txData as any)?.transactions ?? [];
  const orderList = orders?.data ?? [];

  const [activeTab, setActiveTab] = useState("checkout");
  const [selectedOrder, setSelectedOrder] = useState<typeof orderList[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("deposit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<typeof transactions[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 信用卡表單狀態
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />已完成</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />處理中</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />失敗</Badge>;
      case "refunded":
        return <Badge className="bg-gray-100 text-gray-800"><RotateCcw className="w-3 h-3 mr-1" />已退款</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "line_pay":
        return <div className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-green-600" /><span>LINE Pay</span></div>;
      case "credit_card":
        return <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-600" /><span>信用卡</span></div>;
      default:
        return method;
    }
  };

  const handlePayment = async () => {
    if (!selectedOrder || !paymentMethod) {
      toast.error("請選擇付款方式");
      return;
    }

    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    if (paymentMethod === "line_pay") {
      toast.success("正在跳轉至 LINE Pay...", {
        description: "請在 LINE App 中完成付款"
      });
    } else {
      toast.success("付款成功！", {
        description: `已收取 NT$ ${paymentType === "deposit" ? selectedOrder.depositRequired : selectedOrder.totalAmount}`
      });
    }

    setIsProcessing(false);
    setShowPaymentDialog(false);
    setSelectedOrder(null);
    setPaymentMethod("");
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("退款申請已送出", {
      description: `NT$ ${selectedPayment.amount} 將於 3-5 個工作天內退回`
    });

    setIsProcessing(false);
    setShowRefundDialog(false);
    setSelectedPayment(null);
  };

  const filteredRecords = transactions.filter(record => {
    const matchesSearch = record.customerName.includes(searchTerm) || 
                         record.orderId.includes(searchTerm) ||
                         record.id.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <QueryLoading variant="skeleton-table" />;

  if (txError) return <QueryError message={txError.message} onRetry={refetchTx} />;


  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">金流管理</h1>
        <p className="text-muted-foreground mt-2">管理 LINE Pay 與信用卡付款</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="checkout" className="gap-2">
            <DollarSign className="w-4 h-4" />
            收款結帳
          </TabsTrigger>
          <TabsTrigger value="records" className="gap-2">
            <ArrowUpDown className="w-4 h-4" />
            付款記錄
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <CreditCard className="w-4 h-4" />
            金流設定
          </TabsTrigger>
        </TabsList>

        {/* 收款結帳 */}
        <TabsContent value="checkout">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 待付款訂單列表 */}
            <Card>
              <CardHeader>
                <CardTitle>待付款訂單</CardTitle>
                <CardDescription>選擇訂單進行收款</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderList.map(order => (
                  <div 
                    key={order.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOrder?.id === order.id ? "border-primary bg-primary/5" : "hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                      </div>
                      <Badge variant="outline">{order.id}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      預約時間：{order.appointmentDate}
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.name} x {item.quantity}</span>
                          <span>NT$ {item.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <span className="text-sm">訂金 / 總額</span>
                      <div className="text-right">
                        <span className="text-primary font-medium">NT$ {order.depositRequired.toLocaleString()}</span>
                        <span className="text-muted-foreground"> / NT$ {order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 付款方式選擇 */}
            <Card>
              <CardHeader>
                <CardTitle>付款方式</CardTitle>
                <CardDescription>選擇付款方式並完成收款</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedOrder ? (
                  <>
                    {/* 訂單摘要 */}
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">訂單摘要</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>客戶</span>
                          <span>{selectedOrder.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>訂單編號</span>
                          <span>{selectedOrder.id}</span>
                        </div>
                        <div className="flex justify-between font-medium text-base mt-2 pt-2 border-t">
                          <span>應付金額</span>
                          <span className="text-primary">
                            NT$ {(paymentType === "deposit" ? selectedOrder.depositRequired : selectedOrder.totalAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 付款類型 */}
                    <div className="space-y-2">
                      <Label>付款類型</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant={paymentType === "deposit" ? "default" : "outline"}
                          className="h-auto py-3"
                          onClick={() => setPaymentType("deposit")}
                        >
                          <div className="text-center">
                            <div className="font-medium">預付訂金</div>
                            <div className="text-sm opacity-80">NT$ {selectedOrder.depositRequired.toLocaleString()}</div>
                          </div>
                        </Button>
                        <Button
                          variant={paymentType === "full" ? "default" : "outline"}
                          className="h-auto py-3"
                          onClick={() => setPaymentType("full")}
                        >
                          <div className="text-center">
                            <div className="font-medium">全額付款</div>
                            <div className="text-sm opacity-80">NT$ {selectedOrder.totalAmount.toLocaleString()}</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    {/* 付款方式 */}
                    <div className="space-y-2">
                      <Label>付款方式</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant={paymentMethod === "line_pay" ? "default" : "outline"}
                          className="h-auto py-4"
                          onClick={() => setPaymentMethod("line_pay")}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                              <Smartphone className="w-6 h-6 text-white" />
                            </div>
                            <span>LINE Pay</span>
                          </div>
                        </Button>
                        <Button
                          variant={paymentMethod === "credit_card" ? "default" : "outline"}
                          className="h-auto py-4"
                          onClick={() => setPaymentMethod("credit_card")}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <span>信用卡</span>
                          </div>
                        </Button>
                      </div>
                    </div>

                    {/* 信用卡表單 */}
                    {paymentMethod === "credit_card" && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Label>持卡人姓名</Label>
                          <Input 
                            placeholder="請輸入持卡人姓名"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>卡號</Label>
                          <Input 
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>有效期限</Label>
                            <Input 
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>安全碼</Label>
                            <Input 
                              placeholder="CVC"
                              type="password"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      size="lg"
                      disabled={!paymentMethod || isProcessing}
                      onClick={handlePayment}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          處理中...
                        </>
                      ) : (
                        <>
                          確認收款 NT$ {(paymentType === "deposit" ? selectedOrder.depositRequired : selectedOrder.totalAmount).toLocaleString()}
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>請從左側選擇待付款訂單</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 付款記錄 */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>付款記錄</CardTitle>
                  <CardDescription>查看所有付款交易記錄</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="搜尋客戶或訂單..."
                      className="pl-9 w-[200px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="狀態" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部狀態</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                      <SelectItem value="pending">處理中</SelectItem>
                      <SelectItem value="failed">失敗</SelectItem>
                      <SelectItem value="refunded">已退款</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    匯出
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>交易編號</TableHead>
                    <TableHead>訂單編號</TableHead>
                    <TableHead>客戶</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>付款方式</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>時間</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">{record.id}</TableCell>
                      <TableCell className="font-mono text-sm">{record.orderId}</TableCell>
                      <TableCell>{record.customerName}</TableCell>
                      <TableCell className="font-medium">NT$ {record.amount.toLocaleString()}</TableCell>
                      <TableCell>{getMethodIcon(record.method)}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{record.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(record);
                              setShowPaymentDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {record.status === "completed" && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(record);
                                setShowRefundDialog(true);
                              }}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 金流設定 */}
        <TabsContent value="settings">
          <div className="grid gap-6 md:grid-cols-2">
            {/* LINE Pay 設定 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>LINE Pay</CardTitle>
                    <CardDescription>設定 LINE Pay 收款</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>連線狀態</span>
                  <Badge className="bg-yellow-100 text-yellow-800">待設定</Badge>
                </div>
                <div className="space-y-2">
                  <Label>Channel ID</Label>
                  <Input placeholder="請輸入 LINE Pay Channel ID" />
                </div>
                <div className="space-y-2">
                  <Label>Channel Secret Key</Label>
                  <Input type="password" placeholder="請輸入 Channel Secret Key" />
                </div>
                <div className="space-y-2">
                  <Label>環境</Label>
                  <Select defaultValue="sandbox">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">測試環境 (Sandbox)</SelectItem>
                      <SelectItem value="production">正式環境 (Production)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">
                  儲存設定
                </Button>
              </CardContent>
            </Card>

            {/* 信用卡設定 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>信用卡收款</CardTitle>
                    <CardDescription>設定信用卡金流串接</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>連線狀態</span>
                  <Badge className="bg-yellow-100 text-yellow-800">待設定</Badge>
                </div>
                <div className="space-y-2">
                  <Label>金流服務商</Label>
                  <Select defaultValue="tappay">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tappay">TapPay</SelectItem>
                      <SelectItem value="ecpay">綠界 ECPay</SelectItem>
                      <SelectItem value="newebpay">藍新 NewebPay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Merchant ID</Label>
                  <Input placeholder="請輸入商店代號" />
                </div>
                <div className="space-y-2">
                  <Label>Hash Key</Label>
                  <Input type="password" placeholder="請輸入 Hash Key" />
                </div>
                <div className="space-y-2">
                  <Label>Hash IV</Label>
                  <Input type="password" placeholder="請輸入 Hash IV" />
                </div>
                <Button className="w-full">
                  儲存設定
                </Button>
              </CardContent>
            </Card>

            {/* 收款設定 */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>收款設定</CardTitle>
                <CardDescription>設定訂金比例與付款規則</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>預設訂金比例</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20%</SelectItem>
                        <SelectItem value="30">30%</SelectItem>
                        <SelectItem value="50">50%</SelectItem>
                        <SelectItem value="100">100% (全額預付)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>最低訂金金額</Label>
                    <Input type="number" placeholder="1000" defaultValue="1000" />
                  </div>
                  <div className="space-y-2">
                    <Label>付款期限（天）</Label>
                    <Input type="number" placeholder="3" defaultValue="3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 付款詳情 Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>付款詳情</DialogTitle>
            <DialogDescription>交易編號：{selectedPayment?.id}</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">客戶</Label>
                  <p className="font-medium">{selectedPayment.customerName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">訂單編號</Label>
                  <p className="font-medium">{selectedPayment.orderId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">金額</Label>
                  <p className="font-medium text-lg">NT$ {selectedPayment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">付款方式</Label>
                  <p className="font-medium">{getMethodIcon(selectedPayment.method)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">狀態</Label>
                  <p>{getStatusBadge(selectedPayment.status)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">建立時間</Label>
                  <p className="text-sm">{selectedPayment.createdAt}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">說明</Label>
                <p>{selectedPayment.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 退款確認 Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認退款</DialogTitle>
            <DialogDescription>
              確定要為此筆交易申請退款嗎？
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>交易編號</span>
                  <span className="font-mono">{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>客戶</span>
                  <span>{selectedPayment.customerName}</span>
                </div>
                <div className="flex justify-between text-lg font-medium">
                  <span>退款金額</span>
                  <span className="text-red-600">NT$ {selectedPayment.amount.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>退款原因</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇退款原因" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cancel">客戶取消預約</SelectItem>
                    <SelectItem value="refund">客戶要求退款</SelectItem>
                    <SelectItem value="error">收款錯誤</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleRefund} disabled={isProcessing}>
              {isProcessing ? "處理中..." : "確認退款"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
