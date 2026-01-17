import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Users, Plus, MoreHorizontal, Edit, Trash2, Calendar, Phone, Mail, UserCheck, Briefcase, Stethoscope } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// 使用優化後的通用元件
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput, useSearch } from "@/components/ui/search-input";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataPagination, usePagination } from "@/components/ui/data-pagination";
import { ExportButton, downloadCSV } from "@/components/ui/export-button";
import { StatCard, StatGrid } from "@/components/ui/stat-card";

export default function StaffPage() {
  const { search, setSearch, debouncedSearch } = useSearch();
  const { page, pageSize, setPage, setPageSize, offset, limit } = usePagination(20);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; staffId: number | null }>({
    open: false,
    staffId: null,
  });
  const [newStaff, setNewStaff] = useState({
    name: "",
    phone: "",
    email: "",
    position: "staff",
  });
  
  // TODO: Get organizationId from context
  const organizationId = 1;
  
  const { data: staffData, isLoading, refetch } = trpc.staff.list.useQuery({
    organizationId,
  });

  const createMutation = trpc.staff.create.useMutation({
    onSuccess: () => {
      toast.success("員工新增成功");
      setIsDialogOpen(false);
      setNewStaff({ name: "", phone: "", email: "", position: "staff" });
      refetch();
    },
    onError: (error) => {
      toast.error(`新增失敗: ${error.message}`);
    },
  });

  const handleCreateStaff = () => {
    if (!newStaff.name.trim()) {
      toast.error("請輸入員工姓名");
      return;
    }
    createMutation.mutate({
      organizationId,
      name: newStaff.name,
      phone: newStaff.phone || undefined,
      email: newStaff.email || undefined,
      position: newStaff.position,
    });
  };

  const handleDeleteStaff = () => {
    toast.info("刪除功能開發中");
    setDeleteConfirm({ open: false, staffId: null });
  };

  const handleExport = async (format: "csv" | "xlsx" | "json") => {
    const staff = staffData?.data || [];
    if (staff.length === 0) {
      toast.error("沒有資料可匯出");
      return;
    }

    const exportData = staff.map((s) => ({
      姓名: s.name,
      職位: getPositionText(s.position),
      電話: s.phone || "",
      Email: s.email || "",
      狀態: s.isActive ? "在職" : "離職",
      員工編號: s.employeeId || "",
    }));

    if (format === "csv") {
      downloadCSV(exportData, `員工列表_${new Date().toISOString().split("T")[0]}`);
    }
  };

  const getPositionText = (position: string | null) => {
    switch (position) {
      case "doctor": return "醫師";
      case "nurse": return "護理師";
      case "consultant": return "諮詢師";
      case "receptionist": return "櫃檯";
      case "manager": return "經理";
      default: return "員工";
    }
  };

  const getPositionBadge = (position: string | null) => {
    switch (position) {
      case "doctor":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">醫師</Badge>;
      case "nurse":
        return <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100">護理師</Badge>;
      case "consultant":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">諮詢師</Badge>;
      case "receptionist":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">櫃檯</Badge>;
      case "manager":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">經理</Badge>;
      default:
        return <Badge variant="secondary">員工</Badge>;
    }
  };

  const staff = staffData?.data || [];

  // Filter by search
  const filteredStaff = debouncedSearch
    ? staff.filter(s => 
        s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        s.phone?.includes(debouncedSearch) ||
        s.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : staff;

  // 計算統計數據
  const stats = {
    total: staff.length,
    active: staff.filter(s => s.isActive).length,
    doctors: staff.filter(s => s.position === "doctor").length,
    nurses: staff.filter(s => s.position === "nurse").length,
  };

  // 分頁處理
  const paginatedStaff = filteredStaff.slice(offset, offset + limit);
  const totalPages = Math.ceil(filteredStaff.length / pageSize);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Actions */}
        <PageHeader
          title="員工管理"
          description="管理診所員工資料與排班"
          actions={
            <>
              <ExportButton onExport={handleExport} formats={["csv"]} />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    新增員工
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新增員工</DialogTitle>
                    <DialogDescription>
                      填寫員工基本資料
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">姓名 *</Label>
                      <Input
                        id="name"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                        placeholder="請輸入員工姓名"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="position">職位</Label>
                      <Select
                        value={newStaff.position}
                        onValueChange={(value) => setNewStaff({ ...newStaff, position: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇職位" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="doctor">醫師</SelectItem>
                          <SelectItem value="nurse">護理師</SelectItem>
                          <SelectItem value="consultant">諮詢師</SelectItem>
                          <SelectItem value="receptionist">櫃檯</SelectItem>
                          <SelectItem value="manager">經理</SelectItem>
                          <SelectItem value="staff">一般員工</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">電話</Label>
                      <Input
                        id="phone"
                        value={newStaff.phone}
                        onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                        placeholder="請輸入電話號碼"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                        placeholder="請輸入 Email"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleCreateStaff} disabled={createMutation.isPending}>
                      {createMutation.isPending ? "新增中..." : "新增"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          }
        />

        {/* Stats Cards */}
        <StatGrid columns={4}>
          <StatCard
            title="總員工數"
            value={stats.total}
            icon={Users}
            description="位員工"
          />
          <StatCard
            title="在職人員"
            value={stats.active}
            icon={UserCheck}
          />
          <StatCard
            title="醫師"
            value={stats.doctors}
            icon={Stethoscope}
          />
          <StatCard
            title="護理師"
            value={stats.nurses}
            icon={Briefcase}
          />
        </StatGrid>

        {/* Search & Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="搜尋員工姓名、電話..."
                className="max-w-sm"
              />
              <div className="text-sm text-muted-foreground">
                共 {filteredStaff.length} 位員工
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable
                columns={5}
                rows={5}
                headers={["員工姓名", "職位", "聯絡方式", "狀態", ""]}
              />
            ) : filteredStaff.length === 0 ? (
              <EmptyState
                icon={Users}
                title="尚無員工資料"
                description="點擊「新增員工」開始建立"
                action={{
                  label: "新增員工",
                  onClick: () => setIsDialogOpen(true),
                }}
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>員工姓名</TableHead>
                      <TableHead>職位</TableHead>
                      <TableHead>聯絡方式</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStaff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-medium">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {member.employeeId || "-"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getPositionBadge(member.position)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {member.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {member.phone}
                              </div>
                            )}
                            {member.email && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {member.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.isActive ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">在職</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">離職</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast.info("編輯功能開發中")}>
                                <Edit className="h-4 w-4 mr-2" />
                                編輯
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("排班管理功能開發中")}>
                                <Calendar className="h-4 w-4 mr-2" />
                                排班管理
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => setDeleteConfirm({ open: true, staffId: member.id })}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                刪除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <DataPagination
                      currentPage={page}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalItems={filteredStaff.length}
                      onPageChange={setPage}
                      onPageSizeChange={setPageSize}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
          title="確認刪除員工"
          description="確定要刪除此員工嗎？此操作無法復原。"
          confirmText="刪除"
          cancelText="取消"
          variant="destructive"
          onConfirm={handleDeleteStaff}
        />
      </div>
    </DashboardLayout>
  );
}
