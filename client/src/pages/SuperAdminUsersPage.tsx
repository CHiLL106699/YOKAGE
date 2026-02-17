import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Users, UserCheck, UserX, Shield, Search, MoreHorizontal, 
  Eye, Edit, Power, PowerOff, Key, Mail, Calendar, Building2,
  Filter, Download, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react";

const ROLE_CONFIG = {
  super_admin: { label: "超級管理員", color: "bg-red-500", icon: Shield },
  admin: { label: "診所管理員", color: "bg-purple-500", icon: UserCheck },
  staff: { label: "員工", color: "bg-blue-500", icon: Users },
  user: { label: "一般用戶", color: "bg-gray-500", icon: Users },
} as const;

export default function SuperAdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<Record<string, any> | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  
  const pageSize = 15;

  // API 查詢
  const { data: usersData, isLoading, refetch } = trpc.superAdmin.listAllUsers.useQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: stats } = trpc.superAdmin.userStats.useQuery();

  // Mutations
  const updateUserMutation = trpc.superAdmin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("用戶資料已更新");
      setIsEditDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "更新失敗");
    },
  });

  const toggleUserStatusMutation = trpc.superAdmin.toggleUserStatus.useMutation({
    onSuccess: () => {
      toast.success("用戶狀態已更新");
      setIsStatusDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "操作失敗");
    },
  });

  const handleViewUser = (user: Record<string, any>) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  const handleEditUser = (user: Record<string, any>) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleToggleStatus = (user: Record<string, any>) => {
    setSelectedUser(user);
    setIsStatusDialogOpen(true);
  };

  const confirmToggleStatus = () => {
    if (!selectedUser) return;
    toggleUserStatusMutation.mutate({
      userId: selectedUser.id,
      isActive: !selectedUser.isActive,
    });
  };

  const handleExport = () => {
    toast.info("匯出功能開發中");
  };

  const totalPages = Math.ceil((usersData?.total || 0) / pageSize);
  const users = usersData?.users || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="使用者管理"
          description="管理平台所有使用者的帳號、角色與權限"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                重新整理
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                匯出
              </Button>
            </div>
          }
        />

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="總使用者數"
            value={stats?.total || 0}
            description="所有註冊用戶"
            icon={Users}
          />
          <StatCard
            title="活躍用戶"
            value={stats?.active || 0}
            description="帳號啟用中"
            icon={UserCheck}
            trend={{ value: stats?.activeRate || 0, label: "啟用率" }}
          />
          <StatCard
            title="管理員數"
            value={stats?.admins || 0}
            description="診所管理員"
            icon={Shield}
          />
          <StatCard
            title="本月新增"
            value={stats?.newThisMonth || 0}
            description="新註冊用戶"
            icon={Calendar}
            trend={{ value: stats?.growthRate || 0, label: "成長率" }}
          />
        </div>

        {/* 搜尋與篩選 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              搜尋與篩選
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜尋用戶名稱、Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="角色篩選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有角色</SelectItem>
                  <SelectItem value="super_admin">超級管理員</SelectItem>
                  <SelectItem value="admin">診所管理員</SelectItem>
                  <SelectItem value="staff">員工</SelectItem>
                  <SelectItem value="user">一般用戶</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="狀態篩選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有狀態</SelectItem>
                  <SelectItem value="active">啟用中</SelectItem>
                  <SelectItem value="inactive">已停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 用戶列表 */}
        <Card>
          <CardHeader>
            <CardTitle>用戶列表</CardTitle>
            <CardDescription>
              共 {usersData?.total || 0} 位用戶
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用戶</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>所屬診所</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>最後登入</TableHead>
                  <TableHead>註冊時間</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      載入中...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      沒有找到符合條件的用戶
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: Record<string, any>) => {
                    const roleConfig = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.user;
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold">
                              {user.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <div className="font-medium">{user.name || "未設定"}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${roleConfig.color} text-white`}>
                            {roleConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.organizationName || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-500 border-green-500">
                            啟用中
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.lastSignedIn 
                            ? new Date(user.lastSignedIn).toLocaleDateString("zh-TW")
                            : "-"
                          }
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("zh-TW")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                查看詳情
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                編輯資料
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(user)}
                                className="text-muted-foreground"
                              >
                                <PowerOff className="h-4 w-4 mr-2" />
                                管理帳號
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* 分頁 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  第 {currentPage} 頁，共 {totalPages} 頁
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 用戶詳情對話框 */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>用戶詳情</DialogTitle>
              <DialogDescription>
                查看用戶的完整資訊
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-semibold">
                    {selectedUser.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.name || "未設定"}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">角色</Label>
                    <p className="font-medium">
                      {ROLE_CONFIG[selectedUser.role as keyof typeof ROLE_CONFIG]?.label || "一般用戶"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">狀態</Label>
                    <p className="font-medium">
                      {selectedUser.isActive ? "啟用中" : "已停用"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">所屬診所</Label>
                    <p className="font-medium">{selectedUser.organizationName || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Open ID</Label>
                    <p className="font-medium text-xs font-mono">{selectedUser.openId}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">註冊時間</Label>
                    <p className="font-medium">
                      {new Date(selectedUser.createdAt).toLocaleString("zh-TW")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">最後登入</Label>
                    <p className="font-medium">
                      {selectedUser.lastLoginAt 
                        ? new Date(selectedUser.lastLoginAt).toLocaleString("zh-TW")
                        : "-"
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                關閉
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 編輯用戶對話框 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>編輯用戶</DialogTitle>
              <DialogDescription>
                修改用戶的角色與權限
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label>用戶名稱</Label>
                  <Input value={selectedUser.name || ""} disabled />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={selectedUser.email} disabled />
                </div>
                <div>
                  <Label>角色</Label>
                  <Select 
                    value={selectedUser.role} 
                    onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">一般用戶</SelectItem>
                      <SelectItem value="staff">員工</SelectItem>
                      <SelectItem value="admin">診所管理員</SelectItem>
                      <SelectItem value="super_admin">超級管理員</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                取消
              </Button>
              <Button 
                onClick={() => {
                  if (!selectedUser) return;
                  updateUserMutation.mutate({
                    userId: selectedUser.id,
                    role: selectedUser.role,
                  });
                }}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "儲存中..." : "儲存"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 停用/啟用確認對話框 */}
        <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedUser?.isActive ? "停用帳號" : "啟用帳號"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedUser?.isActive 
                  ? `確定要停用 ${selectedUser?.name || selectedUser?.email} 的帳號嗎？停用後該用戶將無法登入系統。`
                  : `確定要啟用 ${selectedUser?.name || selectedUser?.email} 的帳號嗎？`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmToggleStatus}
                className={selectedUser?.isActive ? "bg-red-500 hover:bg-red-600" : ""}
              >
                {toggleUserStatusMutation.isPending ? "處理中..." : "確認"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
