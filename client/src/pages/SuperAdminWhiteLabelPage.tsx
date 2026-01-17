import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { StatCard } from "@/components/ui/stat-card";
import { 
  Globe, Plus, Search, MoreHorizontal, Eye, Edit, Trash2, 
  Palette, Image, Link2, CheckCircle, XCircle, ExternalLink,
  Building2, DollarSign, Settings, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

// 白標方案配置
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

export default function SuperAdminWhiteLabelPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
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

  // 模擬白標客戶資料
  const whiteLabelClients = [
    {
      id: 1,
      clinicName: "曜美診所",
      plan: "專業白標",
      customDomain: "booking.yomei.com.tw",
      domainStatus: "active",
      primaryColor: "#8B5CF6",
      createdAt: "2025-06-01",
      monthlyFee: 5990,
    },
    {
      id: 2,
      clinicName: "美麗人生診所",
      plan: "企業白標",
      customDomain: "app.beautifullife.com.tw",
      domainStatus: "active",
      primaryColor: "#EC4899",
      createdAt: "2025-03-15",
      monthlyFee: 9990,
    },
    {
      id: 3,
      clinicName: "新光診所",
      plan: "基礎白標",
      customDomain: null,
      domainStatus: null,
      primaryColor: "#3B82F6",
      createdAt: "2025-09-01",
      monthlyFee: 2990,
    },
  ];

  // 統計資料
  const stats = {
    totalClients: 3,
    activeClients: 3,
    monthlyRevenue: 18970,
    customDomains: 2,
  };

  const handleCreate = () => {
    toast.success("白標方案已建立");
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEdit = (client: any) => {
    setSelectedClient(client);
    setFormData({
      clinicId: client.id.toString(),
      plan: client.plan,
      customDomain: client.customDomain || "",
      primaryColor: client.primaryColor,
      secondaryColor: "#EC4899",
      logoUrl: "",
      faviconUrl: "",
      loginPageTitle: "",
      loginPageDescription: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    toast.success("白標設定已更新");
    setIsEditDialogOpen(false);
    setSelectedClient(null);
  };

  const handleDelete = (client: any) => {
    toast.success(`「${client.clinicName}」的白標方案已取消`);
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

  const handleVerifyDomain = (domain: string) => {
    toast.success(`正在驗證網域 ${domain}...`);
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
            <Button variant="outline">
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
                    <Label>選擇診所</Label>
                    <Select
                      value={formData.clinicId}
                      onValueChange={(value) => setFormData({ ...formData, clinicId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇診所..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">曜美診所</SelectItem>
                        <SelectItem value="2">美麗人生診所</SelectItem>
                        <SelectItem value="3">新光診所</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="pro">專業白標 (NT$ 5,990/月)</SelectItem>
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
                      需將網域 CNAME 指向 app.yochill.com
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>取消</Button>
                  <Button onClick={handleCreate}>建立白標</Button>
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
          />
          <StatCard
            title="活躍客戶"
            value={stats.activeClients}
            description="正常運作中"
            icon={CheckCircle}
          />
          <StatCard
            title="月收入"
            value={`NT$ ${stats.monthlyRevenue.toLocaleString()}`}
            description="白標方案收入"
            icon={DollarSign}
          />
          <StatCard
            title="自訂網域"
            value={stats.customDomains}
            description="已設定的網域"
            icon={Globe}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>診所</TableHead>
                      <TableHead>方案</TableHead>
                      <TableHead>品牌色</TableHead>
                      <TableHead>自訂網域</TableHead>
                      <TableHead>月費</TableHead>
                      <TableHead>建立日期</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whiteLabelClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.clinicName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.plan}</Badge>
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
                              <CheckCircle className="h-4 w-4 text-green-500" />
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
                        <TableCell>NT$ {client.monthlyFee.toLocaleString()}</TableCell>
                        <TableCell>{client.createdAt}</TableCell>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>診所</TableHead>
                      <TableHead>自訂網域</TableHead>
                      <TableHead>DNS 狀態</TableHead>
                      <TableHead>SSL 憑證</TableHead>
                      <TableHead>設定日期</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { clinic: "曜美診所", domain: "booking.yomei.com.tw", dnsStatus: "verified", sslStatus: "active", createdAt: "2025-06-01" },
                      { clinic: "美麗人生診所", domain: "app.beautifullife.com.tw", dnsStatus: "verified", sslStatus: "active", createdAt: "2025-03-15" },
                    ].map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.clinic}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={`https://${item.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {item.domain}
                            </a>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            已驗證
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            有效
                          </Badge>
                        </TableCell>
                        <TableCell>{item.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerifyDomain(item.domain)}
                          >
                            重新驗證
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">DNS 設定說明</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    要設定自訂網域，請在您的 DNS 服務商新增以下 CNAME 記錄：
                  </p>
                  <div className="bg-background p-3 rounded border font-mono text-sm">
                    <div className="flex gap-4">
                      <span className="text-muted-foreground">類型:</span>
                      <span>CNAME</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-muted-foreground">名稱:</span>
                      <span>booking (或您想要的子網域)</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-muted-foreground">值:</span>
                      <span>app.yochill.com</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
