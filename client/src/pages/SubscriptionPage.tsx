import { useState } from "react";
import { safeDate, safeDateTime, safeStr, safeTime, safeMoney } from '@/lib/safeFormat';
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CreditCard, Plus, Users, TrendingUp, Calendar, Gift, Crown, Star } from "lucide-react";

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState("plans");
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [newSubscriptionOpen, setNewSubscriptionOpen] = useState(false);

  // 方案表單狀態
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [planFeatures, setPlanFeatures] = useState("");
  const [trialDays, setTrialDays] = useState("");

  // 訂閱表單狀態
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [autoRenew, setAutoRenew] = useState(true);

  // 模擬客戶資料
  const mockCustomers = [
    { id: 1, name: "王小明" },
    { id: 2, name: "李小華" },
    { id: 3, name: "張美玲" },
  ];

  const { data: plans, refetch: refetchPlans } = trpc.subscription.listPlans.useQuery({
    organizationId: 1,
  });

  const { data: subscriptions, refetch: refetchSubscriptions } = trpc.subscription.listSubscriptions.useQuery({
    organizationId: 1,
  });

  // 統計資料從 subscriptions 計算
  const stats = {
    activeSubscriptions: subscriptions?.data?.filter(s => s.status === 'active').length || 0,
    monthlyRevenue: 0, // 待實作
    renewalRate: 85, // 模擬數據
    expiringCount: subscriptions?.data?.filter(s => {
      if (!s.endDate) return false;
      const endDate = new Date(s.endDate);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // 7 天內到期
    }).length || 0,
  };

  const createPlanMutation = trpc.subscription.createPlan.useMutation({
    onSuccess: () => {
      toast.success("訂閱方案已建立");
      setNewPlanOpen(false);
      resetPlanForm();
      refetchPlans();
    },
    onError: (error: any) => {
      toast.error(`建立失敗: ${error.message}`);
    },
  });

  const subscribeMutation = trpc.subscription.subscribe.useMutation({
    onSuccess: () => {
      toast.success("訂閱已建立");
      setNewSubscriptionOpen(false);
      resetSubscriptionForm();
      refetchSubscriptions();
    },
    onError: (error: any) => {
      toast.error(`訂閱失敗: ${error.message}`);
    },
  });

  const handleCancel = (id: number) => {
    toast.info("取消訂閱功能開發中");
  };

  const resetPlanForm = () => {
    setPlanName("");
    setPlanDescription("");
    setPlanPrice("");
    setBillingCycle("monthly");
    setPlanFeatures("");
    setTrialDays("");
  };

  const resetSubscriptionForm = () => {
    setSelectedCustomerId(null);
    setSelectedPlanId(null);
    setAutoRenew(true);
  };

  const handleCreatePlan = () => {
    if (!planName || !planPrice) {
      toast.error("請填寫方案名稱和價格");
      return;
    }
    createPlanMutation.mutate({
      organizationId: 1,
      name: planName,
      description: planDescription || undefined,
      monthlyPrice: planPrice,
      benefits: planFeatures ? planFeatures.split('\n').filter(f => f.trim()) : undefined,
    });
  };

  const handleSubscribe = () => {
    if (!selectedCustomerId || !selectedPlanId) {
      toast.error("請選擇客戶和方案");
      return;
    }
    subscribeMutation.mutate({
      organizationId: 1,
      customerId: selectedCustomerId,
      planId: selectedPlanId,
      billingCycle: 'monthly',
    });
  };

  const billingCycleLabels: Record<string, string> = {
    monthly: "月繳",
    quarterly: "季繳",
    yearly: "年繳",
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    active: { label: "有效", color: "bg-green-100 text-green-800" },
    trial: { label: "試用中", color: "bg-blue-100 text-blue-800" },
    past_due: { label: "逾期", color: "bg-yellow-100 text-yellow-800" },
    cancelled: { label: "已取消", color: "bg-gray-100 text-gray-800" },
    expired: { label: "已過期", color: "bg-red-100 text-red-800" },
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" />
            會員訂閱制管理
          </h1>
          <p className="text-muted-foreground">管理訂閱方案與會員訂閱狀態</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={newPlanOpen} onOpenChange={setNewPlanOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                新增方案
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增訂閱方案</DialogTitle>
                <DialogDescription>建立新的會員訂閱方案</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>方案名稱 *</Label>
                  <Input 
                    placeholder="例如：VIP 尊榮會員"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>方案說明</Label>
                  <Textarea 
                    placeholder="描述方案內容..."
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>價格 *</Label>
                    <Input 
                      type="number"
                      placeholder="每期價格"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>計費週期</Label>
                    <Select value={billingCycle} onValueChange={setBillingCycle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">月繳</SelectItem>
                        <SelectItem value="quarterly">季繳</SelectItem>
                        <SelectItem value="yearly">年繳</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>試用天數</Label>
                  <Input 
                    type="number"
                    placeholder="0 表示無試用期"
                    value={trialDays}
                    onChange={(e) => setTrialDays(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>方案權益（每行一項）</Label>
                  <Textarea 
                    placeholder="例如：&#10;每月免費療程 1 次&#10;專屬折扣 85 折&#10;生日禮金 $500"
                    rows={4}
                    value={planFeatures}
                    onChange={(e) => setPlanFeatures(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreatePlan} disabled={createPlanMutation.isPending}>
                  建立方案
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={newSubscriptionOpen} onOpenChange={setNewSubscriptionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新增訂閱
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增會員訂閱</DialogTitle>
                <DialogDescription>為客戶建立新訂閱</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>選擇客戶 *</Label>
                  <Select onValueChange={(v) => setSelectedCustomerId(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇客戶" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>選擇方案 *</Label>
                  <Select onValueChange={(v) => setSelectedPlanId(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇方案" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} - ${plan.monthlyPrice}/月
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>自動續約</Label>
                  <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
                </div>
                <Button onClick={handleSubscribe} disabled={subscribeMutation.isPending}>
                  建立訂閱
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">有效訂閱</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats?.activeSubscriptions || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本月營收</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${stats?.monthlyRevenue?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">續約率</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats?.renewalRate || 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">即將到期</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{stats?.expiringCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans">
            <Gift className="h-4 w-4 mr-2" />
            訂閱方案
          </TabsTrigger>
          <TabsTrigger value="subscriptions">
            <Users className="h-4 w-4 mr-2" />
            會員訂閱
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            付款記錄
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans?.map((plan) => (
              <Card key={plan.id} className={plan.isActive ? "" : "opacity-60"}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      {plan.name}
                    </CardTitle>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "啟用" : "停用"}
                    </Badge>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold">${plan.monthlyPrice}</span>
                    <span className="text-muted-foreground">/月</span>
                  </div>
                  {plan.benefits ? (
                    <ul className="space-y-2">
                      {(plan.benefits as any[] || []).map((benefit: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-green-500">✓</span>
                          <span>{String(typeof benefit === 'string' ? benefit : benefit?.name || '')}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      訂閱人數：{subscriptions?.data?.filter(s => s.planId === plan.id && s.status === 'active').length || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!plans?.length && (
              <Card className="col-span-3">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>尚未建立訂閱方案</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>會員訂閱列表</CardTitle>
              <CardDescription>管理所有會員的訂閱狀態</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>會員</TableHead>
                    <TableHead>方案</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>開始日期</TableHead>
                    <TableHead>到期日期</TableHead>
                    <TableHead>自動續約</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions?.data?.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        客戶 #{sub.customerId}
                      </TableCell>
                      <TableCell>
                        {plans?.find(p => p.id === sub.planId)?.name || `方案 #${sub.planId}`}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusLabels[sub.status || 'active'].color}>
                          {statusLabels[sub.status || 'active'].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {safeDate(sub.startDate)}
                      </TableCell>
                      <TableCell>
                        {sub.endDate ? safeDate(sub.endDate) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sub.autoRenew ? "default" : "outline"}>
                          {sub.autoRenew ? "是" : "否"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sub.status === 'active' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCancel(sub.id)}
                          >
                            取消訂閱
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!subscriptions?.data?.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        尚無訂閱記錄
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>付款記錄</CardTitle>
              <CardDescription>查看訂閱付款歷史</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>訂閱</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>付款方式</TableHead>
                    <TableHead>付款日期</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      付款記錄功能開發中
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
