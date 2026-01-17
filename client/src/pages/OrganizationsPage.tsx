import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
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
import { trpc } from "@/lib/trpc";
import { 
  Building2, Plus, Search, MoreHorizontal, Eye, Edit, Trash2, 
  Power, PowerOff, Users, Calendar, TrendingUp, Filter,
  ChevronLeft, ChevronRight, RefreshCw, Download, AlertTriangle
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// 訂閱方案配置
const SUBSCRIPTION_PLANS = {
  free: { label: "免費版", color: "bg-gray-500", features: "基本功能" },
  basic: { label: "基礎版", color: "bg-blue-500", features: "進階功能" },
  pro: { label: "專業版", color: "bg-purple-500", features: "完整功能" },
  enterprise: { label: "企業版", color: "bg-amber-500", features: "客製化服務" },
} as const;

// 訂閱狀態配置
const SUBSCRIPTION_STATUS = {
  active: { label: "啟用中", color: "bg-green-500" },
  suspended: { label: "已暫停", color: "bg-yellow-500" },
  cancelled: { label: "已取消", color: "bg-red-500" },
} as const;

type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;
type SubscriptionStatus = keyof typeof SUBSCRIPTION_STATUS;

interface OrganizationFormData {
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  subscriptionPlan: SubscriptionPlan;
}

export default function OrganizationsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: "",
    slug: "",
    email: "",
    phone: "",
    address: "",
    subscriptionPlan: "free",
  });

  const pageSize = 10;

  // tRPC Queries
  const { data: organizationsData, isLoading, refetch } = trpc.superAdmin.listOrganizations.useQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
  });

  const { data: stats } = trpc.superAdmin.stats.useQuery();

  // tRPC Mutations
  const createMutation = trpc.superAdmin.createOrganization.useMutation({
    onSuccess: () => {
      toast.success("診所建立成功");
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "建立失敗");
    },
  });

  const updateMutation = trpc.superAdmin.updateOrganization.useMutation({
    onSuccess: () => {
      toast.success("診所更新成功");
      setIsEditDialogOpen(false);
      setSelectedOrg(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "更新失敗");
    },
  });

  const deleteMutation = trpc.superAdmin.deleteOrganization.useMutation({
    onSuccess: () => {
      toast.success("診所已刪除");
      setIsDeleteDialogOpen(false);
      setSelectedOrg(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "刪除失敗");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      email: "",
      phone: "",
      address: "",
      subscriptionPlan: "free",
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.slug) {
      toast.error("請填寫診所名稱和網址代碼");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (org: any) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      email: org.email || "",
      phone: org.phone || "",
      address: org.address || "",
      subscriptionPlan: org.subscriptionPlan || "free",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedOrg) return;
    updateMutation.mutate({
      id: selectedOrg.id,
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      subscriptionPlan: formData.subscriptionPlan,
    });
  };

  const handleToggleStatus = (org: any) => {
    updateMutation.mutate({
      id: org.id,
      isActive: !org.isActive,
      subscriptionStatus: org.isActive ? "suspended" : "active",
    });
  };

  const handleDelete = () => {
    if (!selectedOrg) return;
    deleteMutation.mutate({ id: selectedOrg.id });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const totalPages = Math.ceil((organizationsData?.total || 0) / pageSize);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              診所管理
            </h1>
            <p className="text-slate-400 mt-1">
              管理所有診所的資料、訂閱方案與狀態
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold">
                <Plus className="h-4 w-4" />
                新增診所
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border-amber-500/30">
              <DialogHeader>
                <DialogTitle className="text-amber-100">新增診所</DialogTitle>
                <DialogDescription className="text-slate-400">
                  填寫診所基本資料，建立後可進一步設定詳細資訊
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-amber-100">診所名稱 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      });
                    }}
                    placeholder="例：美麗佳人醫美診所"
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug" className="text-amber-100">網址代碼 *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="例：beauty-clinic"
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                  <p className="text-xs text-slate-500">用於系統識別，僅限英文、數字和連字號</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-amber-100">電子郵件</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="clinic@example.com"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-amber-100">聯絡電話</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="02-1234-5678"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address" className="text-amber-100">地址</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="診所地址"
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="plan" className="text-amber-100">訂閱方案</Label>
                  <Select
                    value={formData.subscriptionPlan}
                    onValueChange={(value: SubscriptionPlan) => setFormData({ ...formData, subscriptionPlan: value })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                        <SelectItem key={key} value={key} className="text-slate-100">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${plan.color}`}></span>
                            {plan.label} - {plan.features}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-slate-700 text-slate-300">
                  取消
                </Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={createMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                >
                  {createMutation.isPending ? "建立中..." : "建立診所"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">診所總數</p>
                  <p className="text-2xl font-bold text-amber-100">{stats?.organizations || 0}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Building2 className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">使用者總數</p>
                  <p className="text-2xl font-bold text-amber-100">{stats?.users || 0}</p>
                </div>
                <div className="p-3 rounded-full bg-green-500/20">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">客戶總數</p>
                  <p className="text-2xl font-bold text-amber-100">{stats?.customers || 0}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-500/20">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">預約總數</p>
                  <p className="text-2xl font-bold text-amber-100">{stats?.appointments || 0}</p>
                </div>
                <div className="p-3 rounded-full bg-orange-500/20">
                  <Calendar className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-slate-900/50 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜尋診所名稱..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => refetch()} className="border-slate-700 text-slate-300">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-300">
                  <Download className="h-4 w-4 mr-2" />
                  匯出
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organizations Table */}
        <Card className="bg-slate-900/50 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-100">診所列表</CardTitle>
            <CardDescription className="text-slate-400">
              共 {organizationsData?.total || 0} 間診所
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : organizationsData?.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Building2 className="h-12 w-12 mb-4 opacity-50" />
                <p>尚無診所資料</p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-amber-500/50 text-amber-400"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  建立第一間診所
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-slate-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-slate-800/50">
                        <TableHead className="text-amber-200">診所名稱</TableHead>
                        <TableHead className="text-amber-200">訂閱方案</TableHead>
                        <TableHead className="text-amber-200">狀態</TableHead>
                        <TableHead className="text-amber-200">聯絡資訊</TableHead>
                        <TableHead className="text-amber-200">建立時間</TableHead>
                        <TableHead className="text-amber-200 text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizationsData?.data.map((org: any) => (
                        <TableRow key={org.id} className="border-slate-700 hover:bg-slate-800/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-amber-400" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-100">{org.name}</p>
                                <p className="text-sm text-slate-500">{org.slug}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${SUBSCRIPTION_PLANS[org.subscriptionPlan as SubscriptionPlan]?.color || "bg-gray-500"} text-white`}>
                              {SUBSCRIPTION_PLANS[org.subscriptionPlan as SubscriptionPlan]?.label || "未知"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${org.isActive ? "bg-green-500" : "bg-red-500"}`}></span>
                              <span className={org.isActive ? "text-green-400" : "text-red-400"}>
                                {org.isActive ? "啟用中" : "已停用"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="text-slate-300">{org.email || "-"}</p>
                              <p className="text-slate-500">{org.phone || "-"}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-400">
                            {new Date(org.createdAt).toLocaleDateString("zh-TW")}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-amber-400">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                <DropdownMenuItem 
                                  className="text-slate-300 hover:text-amber-400 cursor-pointer"
                                  onClick={() => setLocation(`/super-admin/organizations/${org.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  查看詳情
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-slate-300 hover:text-amber-400 cursor-pointer"
                                  onClick={() => handleEdit(org)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  編輯資料
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem 
                                  className="text-slate-300 hover:text-amber-400 cursor-pointer"
                                  onClick={() => handleToggleStatus(org)}
                                >
                                  {org.isActive ? (
                                    <>
                                      <PowerOff className="h-4 w-4 mr-2" />
                                      停用診所
                                    </>
                                  ) : (
                                    <>
                                      <Power className="h-4 w-4 mr-2" />
                                      啟用診所
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem 
                                  className="text-red-400 hover:text-red-300 cursor-pointer"
                                  onClick={() => {
                                    setSelectedOrg(org);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  刪除診所
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-slate-400">
                      第 {currentPage} 頁，共 {totalPages} 頁
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="border-slate-700 text-slate-300"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="border-slate-700 text-slate-300"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-slate-900 border-amber-500/30">
            <DialogHeader>
              <DialogTitle className="text-amber-100">編輯診所</DialogTitle>
              <DialogDescription className="text-slate-400">
                修改診所資料
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name" className="text-amber-100">診所名稱</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email" className="text-amber-100">電子郵件</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone" className="text-amber-100">聯絡電話</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address" className="text-amber-100">地址</Label>
                <Textarea
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-plan" className="text-amber-100">訂閱方案</Label>
                <Select
                  value={formData.subscriptionPlan}
                  onValueChange={(value: SubscriptionPlan) => setFormData({ ...formData, subscriptionPlan: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                      <SelectItem key={key} value={key} className="text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${plan.color}`}></span>
                          {plan.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-700 text-slate-300">
                取消
              </Button>
              <Button 
                onClick={handleUpdate} 
                disabled={updateMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900"
              >
                {updateMutation.isPending ? "更新中..." : "儲存變更"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-slate-900 border-red-500/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                確認刪除診所
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                您確定要刪除「{selectedOrg?.name}」嗎？此操作無法復原，所有相關資料將被永久刪除。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-700 text-slate-300">取消</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {deleteMutation.isPending ? "刪除中..." : "確認刪除"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
