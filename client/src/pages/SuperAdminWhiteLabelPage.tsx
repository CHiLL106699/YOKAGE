import { useState } from "react";
import { safeDate, safeDateTime, safeStr, safeTime, safeMoney } from '@/lib/safeFormat';
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { 
  Globe, Plus, Search, MoreHorizontal, Eye, Edit, Trash2, 
  Palette, CheckCircle, XCircle, ExternalLink,
  Building2, DollarSign, Settings, RefreshCw, Shield, AlertTriangle,
  Copy, Clock, Loader2
} from "lucide-react";
import { toast } from "sonner";

// 白標方案配置（靜態定義）
const WHITE_LABEL_PLANS = [
  {
    id: "basic",
    name: "基礎白標",
    price: 2990,
    period: "月",
    features: [
      { name: "自訂 Logo", included: true },
      { name: "自訂品牌色", included: true },
      { name: "移除平台標誌", included: true },
      { name: "自訂網域", included: false },
      { name: "自訂登入頁面", included: false },
      { name: "自訂 Email 模板", included: false },
    ],
  },
  {
    id: "pro",
    name: "專業白標",
    price: 5990,
    period: "月",
    features: [
      { name: "自訂 Logo", included: true },
      { name: "自訂品牌色", included: true },
      { name: "移除平台標誌", included: true },
      { name: "自訂網域", included: true },
      { name: "自訂登入頁面", included: true },
      { name: "自訂 Email 模板", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "企業白標",
    price: 9990,
    period: "月",
    features: [
      { name: "自訂 Logo", included: true },
      { name: "自訂品牌色", included: true },
      { name: "移除平台標誌", included: true },
      { name: "自訂網域", included: true },
      { name: "自訂登入頁面", included: true },
      { name: "自訂 Email 模板", included: true },
    ],
  },
];

// 方案名稱對照
const PLAN_DISPLAY: Record<string, string> = {
  basic: "基礎白標",
  professional: "專業白標",
  enterprise: "企業白標",
};

export default function SuperAdminWhiteLabelPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Record<string, any> | null>(null);
  const [formData, setFormData] = useState({
    clinicId: "",
    plan: "basic",
    customDomain: "",
    primaryColor: "#8B5CF6",
    secondaryColor: "#EC4899",
    logoUrl: "",
    faviconUrl: "",
    loginPageTitle: "",
    loginPageDescription: "",
  });

  // DNS 驗證狀態
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [isDnsDialogOpen, setIsDnsDialogOpen] = useState(false);
  const [selectedDomainForVerify, setSelectedDomainForVerify] = useState<Record<string, any> | null>(null);
  const [dnsVerificationResult, setDnsVerificationResult] = useState<{
    success: boolean;
    message: string;
    details?: {
      cnameFound: boolean;
      cnameValue?: string;
      expectedValue: string;
      sslStatus?: string;
    };
  } | null>(null);

  // ============================================
  // tRPC API 查詢
  // ============================================
  const { data: wlStats, isLoading: statsLoading } = trpc.superAdmin.whiteLabelStats.useQuery(
    undefined,
    { refetchInterval: 60000 }
  );

  const { data: whiteLabelClients, isLoading: clientsLoading, refetch: refetchClients } = trpc.superAdmin.listWhiteLabelClients.useQuery(
    { search: searchTerm || undefined },
    { placeholderData: (prev) => prev }
  );

  const createMutation = trpc.superAdmin.createWhiteLabelConfig.useMutation({
    onSuccess: () => {
      refetchClients();
      toast.success("白標方案已建立");
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (err) => toast.error(`建立失敗: ${err.message}`),
  });

  const updateMutation = trpc.superAdmin.updateWhiteLabelConfig.useMutation({
    onSuccess: () => {
      refetchClients();
      toast.success("白標設定已更新");
      setIsEditDialogOpen(false);
      setSelectedClient(null);
    },
    onError: (err) => toast.error(`更新失敗: ${err.message}`),
  });

  const deleteMutation = trpc.superAdmin.deleteWhiteLabelConfig.useMutation({
    onSuccess: () => {
      refetchClients();
      toast.success("白標方案已取消");
    },
    onError: (err) => toast.error(`刪除失敗: ${err.message}`),
  });

  const verifyDnsMutation = trpc.superAdmin.verifyDns.useMutation({
    onSuccess: (data) => {
      setDnsVerificationResult(data);
      setVerifyingDomain(null);
      if (data.success) {
        toast.success("DNS 驗證成功");
        refetchClients();
      } else {
        toast.error(`DNS 驗證失敗: ${data.message}`);
      }
    },
    onError: (err) => {
      setVerifyingDomain(null);
      toast.error(`驗證失敗: ${err.message}`);
    },
  });

  // 統計數據
  const stats = wlStats || {
    totalClients: 0,
    activeClients: 0,
    customDomains: 0,
  };

  const clients = whiteLabelClients || [];

  const handleCreate = () => {
    if (!formData.clinicId) {
      toast.error("請選擇診所");
      return;
    }
    createMutation.mutate({
      organizationId: parseInt(formData.clinicId),
      plan: formData.plan as "basic" | "professional" | "enterprise",
      customDomain: formData.customDomain || undefined,
      primaryColor: formData.primaryColor,
      logoUrl: formData.logoUrl || undefined,
      faviconUrl: formData.faviconUrl || undefined,
    });
  };

  const handleEdit = (client: Record<string, any>) => {
    setSelectedClient(client);
    setFormData({
      clinicId: client.organizationId?.toString() || client.id.toString(),
      plan: client.plan,
      customDomain: client.customDomain || "",
      primaryColor: client.primaryColor || "#8B5CF6",
      secondaryColor: "#EC4899",
      logoUrl: client.logoUrl || "",
      faviconUrl: "",
      loginPageTitle: "",
      loginPageDescription: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedClient) return;
    updateMutation.mutate({
      configId: selectedClient.id,
      plan: formData.plan as "basic" | "professional" | "enterprise",
      customDomain: formData.customDomain || undefined,
      primaryColor: formData.primaryColor,
      logoUrl: formData.logoUrl || undefined,
      faviconUrl: formData.faviconUrl || undefined,
    });
  };

  const handleDelete = (client: Record<string, any>) => {
    deleteMutation.mutate({ configId: client.id });
  };

  const resetForm = () => {
    setFormData({
      clinicId: "",
      plan: "basic",
      customDomain: "",
      primaryColor: "#8B5CF6",
      secondaryColor: "#EC4899",
      logoUrl: "",
      faviconUrl: "",
      loginPageTitle: "",
      loginPageDescription: "",
    });
  };

  const openDnsVerifyDialog = (item: Record<string, any>) => {
    setSelectedDomainForVerify(item);
    setDnsVerificationResult(null);
    setIsDnsDialogOpen(true);
  };

  const runDnsVerification = () => {
    if (!selectedDomainForVerify) return;
    setVerifyingDomain(selectedDomainForVerify.customDomain || selectedDomainForVerify.domain);
    verifyDnsMutation.mutate({
      configId: selectedDomainForVerify.id,
      domain: selectedDomainForVerify.customDomain || selectedDomainForVerify.domain,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已複製到剪貼簿");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              白標方案
            </h1>
            <p className="text-slate-400 mt-1">
              管理診所的品牌客製化與自訂網域
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchClients()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重新整理
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold">
                  <Plus className="h-4 w-4" />
                  新增白標
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>新增白標方案</DialogTitle>
                  <DialogDescription>為診所設定品牌客製化</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>組織 ID</Label>
                    <Input
                      value={formData.clinicId}
                      onChange={(e) => setFormData({ ...formData, clinicId: e.target.value })}
                      placeholder="輸入組織 ID"
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>白標方案</Label>
                    <Select
                      value={formData.plan}
                      onValueChange={(value) => setFormData({ ...formData, plan: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">基礎白標 (NT$ 2,990/月)</SelectItem>
                        <SelectItem value="professional">專業白標 (NT$ 5,990/月)</SelectItem>
                        <SelectItem value="enterprise">企業白標 (NT$ 9,990/月)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>主要品牌色</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>次要品牌色</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>自訂網域（選填）</Label>
                    <Input
                      value={formData.customDomain}
                      onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                      placeholder="例：booking.yourclinic.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      需將網域 CNAME 指向 app.yokage.com
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>取消</Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "建立中..." : "建立白標"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="白標客戶"
            value={stats.totalClients}
            description="使用白標方案的診所"
            icon={Building2}
            loading={statsLoading}
          />
          <StatCard
            title="活躍客戶"
            value={stats.activeClients}
            description="正常運作中"
            icon={CheckCircle}
            loading={statsLoading}
          />
          <StatCard
            title="月收入"
            value={`NT$ ${(stats.totalClients * 2990).toLocaleString()}`}
            description="白標方案收入（估算）"
            icon={DollarSign}
            loading={statsLoading}
          />
          <StatCard
            title="自訂網域"
            value={stats.customDomains}
            description="已設定的網域"
            icon={Globe}
            loading={statsLoading}
          />
        </div>

        {/* 分頁內容 */}
        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="clients">白標客戶</TabsTrigger>
            <TabsTrigger value="plans">方案設定</TabsTrigger>
            <TabsTrigger value="domains">網域管理</TabsTrigger>
          </TabsList>

          {/* 白標客戶列表 */}
          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>白標客戶列表</CardTitle>
                <CardDescription>管理所有使用白標方案的診所</CardDescription>
              </CardHeader>
              <CardContent>
                {/* 搜尋 */}
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜尋診所名稱..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* 客戶表格 */}
                {clientsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Palette className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>尚無白標客戶</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>診所</TableHead>
                        <TableHead>方案</TableHead>
                        <TableHead>品牌色</TableHead>
                        <TableHead>自訂網域</TableHead>
                        <TableHead>建立日期</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.clinicName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{PLAN_DISPLAY[client.plan] || client.plan}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: client.primaryColor }}
                              />
                              <span className="text-sm font-mono">{client.primaryColor}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {client.customDomain ? (
                              <div className="flex items-center gap-2">
                                {client.domainStatus === 'active' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-amber-500" />
                                )}
                                <a
                                  href={`https://${client.customDomain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm hover:underline"
                                >
                                  {client.customDomain}
                                </a>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{client.createdAt ? safeDate(client.createdAt) : '-'}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(client)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  編輯設定
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.info("預覽功能")}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  預覽效果
                                </DropdownMenuItem>
                                {client.customDomain && (
                                  <DropdownMenuItem onClick={() => openDnsVerifyDialog(client)}>
                                    <Shield className="h-4 w-4 mr-2" />
                                    DNS 驗證
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-500"
                                  onClick={() => handleDelete(client)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  取消白標
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 方案設定 */}
          <TabsContent value="plans" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WHITE_LABEL_PLANS.map((plan) => (
                <Card key={plan.id} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.name}</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => toast.info("編輯方案")}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">
                      NT$ {plan.price.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          {feature.included ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={feature.included ? "" : "text-muted-foreground"}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>方案功能說明</CardTitle>
                <CardDescription>各白標方案的詳細功能對照</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>功能</TableHead>
                      <TableHead className="text-center">基礎白標</TableHead>
                      <TableHead className="text-center">專業白標</TableHead>
                      <TableHead className="text-center">企業白標</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { feature: "自訂 Logo", basic: true, pro: true, enterprise: true },
                      { feature: "自訂品牌色", basic: true, pro: true, enterprise: true },
                      { feature: "移除平台標誌", basic: true, pro: true, enterprise: true },
                      { feature: "自訂網域", basic: false, pro: true, enterprise: true },
                      { feature: "自訂登入頁面", basic: false, pro: true, enterprise: true },
                      { feature: "自訂 Email 模板", basic: false, pro: false, enterprise: true },
                      { feature: "自訂 LINE 訊息", basic: false, pro: false, enterprise: true },
                      { feature: "專屬客服支援", basic: false, pro: false, enterprise: true },
                    ].map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.feature}</TableCell>
                        <TableCell className="text-center">
                          {row.basic ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.pro ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.enterprise ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 網域管理 */}
          <TabsContent value="domains" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>自訂網域管理</CardTitle>
                <CardDescription>管理診所的自訂網域設定與 DNS 驗證</CardDescription>
              </CardHeader>
              <CardContent>
                {clientsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>診所</TableHead>
                        <TableHead>自訂網域</TableHead>
                        <TableHead>DNS 狀態</TableHead>
                        <TableHead>設定日期</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.filter(c => c.customDomain).map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.clinicName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={`https://${client.customDomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {client.customDomain}
                              </a>
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={client.domainStatus === 'active' ? "bg-green-500 text-white" : "bg-amber-500 text-white"}>
                              {client.domainStatus === 'active' ? (
                                <><CheckCircle className="h-3 w-3 mr-1" /> 已驗證</>
                              ) : (
                                <><Clock className="h-3 w-3 mr-1" /> 待驗證</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>{client.createdAt ? safeDate(client.createdAt) : '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDnsVerifyDialog(client)}
                              disabled={verifyingDomain === client.customDomain}
                            >
                              {verifyingDomain === client.customDomain ? (
                                <><Loader2 className="h-4 w-4 animate-spin mr-1" /> 驗證中...</>
                              ) : (
                                '重新驗證'
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {clients.filter(c => c.customDomain).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            尚無自訂網域設定
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">DNS 設定說明</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    要設定自訂網域，請在您的 DNS 服務商新增以下 CNAME 記錄：
                  </p>
                  <div className="bg-background p-3 rounded border font-mono text-sm">
                    <div className="flex gap-4 items-center">
                      <span className="text-muted-foreground w-16">類型:</span>
                      <span className="flex-1">CNAME</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard("CNAME")}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex gap-4 items-center">
                      <span className="text-muted-foreground w-16">名稱:</span>
                      <span className="flex-1">booking (或您想要的子網域)</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard("booking")}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex gap-4 items-center">
                      <span className="text-muted-foreground w-16">值:</span>
                      <span className="flex-1">app.yokage.com</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard("app.yokage.com")}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 編輯白標 Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>編輯白標設定：{selectedClient?.clinicName}</DialogTitle>
              <DialogDescription>修改品牌客製化設定</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>白標方案</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) => setFormData({ ...formData, plan: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">基礎白標 (NT$ 2,990/月)</SelectItem>
                    <SelectItem value="professional">專業白標 (NT$ 5,990/月)</SelectItem>
                    <SelectItem value="enterprise">企業白標 (NT$ 9,990/月)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>主要品牌色</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>次要品牌色</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>自訂網域（選填）</Label>
                <Input
                  value={formData.customDomain}
                  onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                  placeholder="例：booking.yourclinic.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>取消</Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "儲存中..." : "儲存變更"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DNS 驗證對話框 */}
        <Dialog open={isDnsDialogOpen} onOpenChange={setIsDnsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                DNS 驗證
              </DialogTitle>
              <DialogDescription>
                驗證網域 {selectedDomainForVerify?.customDomain || selectedDomainForVerify?.domain} 的 DNS 設定
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* 驗證狀態 */}
              {verifyingDomain ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-4" />
                  <p className="text-sm text-muted-foreground">正在驗證 DNS 設定...</p>
                </div>
              ) : dnsVerificationResult ? (
                <div className="space-y-4">
                  {/* 驗證結果 */}
                  <div className={`p-4 rounded-lg border ${dnsVerificationResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {dnsVerificationResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`font-medium ${dnsVerificationResult.success ? 'text-green-500' : 'text-red-500'}`}>
                        {dnsVerificationResult.success ? '驗證成功' : '驗證失敗'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {dnsVerificationResult.message}
                    </p>
                  </div>

                  {/* 詳細資訊 */}
                  {dnsVerificationResult.details && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">驗證詳情</h4>
                      <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CNAME 記錄</span>
                          <span className="flex items-center gap-1">
                            {dnsVerificationResult.details.cnameFound ? (
                              <><CheckCircle className="h-4 w-4 text-green-500" /> 已找到</>
                            ) : (
                              <><XCircle className="h-4 w-4 text-red-500" /> 未找到</>
                            )}
                          </span>
                        </div>
                        {dnsVerificationResult.details.cnameValue && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">CNAME 值</span>
                            <span className="font-mono">{dnsVerificationResult.details.cnameValue}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">預期值</span>
                          <span className="font-mono">{dnsVerificationResult.details.expectedValue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SSL 憑證</span>
                          <span className="flex items-center gap-1">
                            {dnsVerificationResult.details.sslStatus === 'active' ? (
                              <><CheckCircle className="h-4 w-4 text-green-500" /> 有效</>
                            ) : (
                              <><Clock className="h-4 w-4 text-amber-500" /> 等待中</>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 失敗時顯示說明 */}
                  {!dnsVerificationResult.success && (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-500 mb-1">請檢查您的 DNS 設定</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>確認已新增 CNAME 記錄</li>
                            <li>CNAME 值應為 <code className="bg-muted px-1 rounded">app.yokage.com</code></li>
                            <li>DNS 更新可能需要 24-48 小時生效</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">驗證前請確認</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>已在 DNS 服務商新增 CNAME 記錄</li>
                      <li>CNAME 指向 <code className="bg-muted px-1 rounded">app.yokage.com</code></li>
                      <li>DNS 更新已生效（通常需 5-30 分鐘）</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDnsDialogOpen(false)}>
                關閉
              </Button>
              <Button 
                onClick={runDnsVerification} 
                disabled={!!verifyingDomain}
                className="gap-2"
              >
                {verifyingDomain ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> 驗證中...</>
                ) : (
                  <><Shield className="h-4 w-4" /> {dnsVerificationResult ? '重新驗證' : '開始驗證'}</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
