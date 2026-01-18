import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Users, Plus, MoreHorizontal, Phone, Mail, Edit, Trash2, Calendar, Eye, Download, Tag, Crown } from "lucide-react";
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
  DropdownMenuSeparator,
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
import {
  BatchActionsToolbar,
  useBatchSelection,
  SelectionCheckbox,
  BatchAction,
  createBatchDeleteAction,
} from "@/components/ui/batch-actions";

type Customer = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  memberLevel: string | null;
  visitCount: number | null;
  totalSpent: number | null;
};

export default function CustomersPage() {
  const { search, setSearch, debouncedSearch } = useSearch();
  const { page, pageSize, setPage, setPageSize, offset, limit } = usePagination(20);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; customerId: number | null }>({
    open: false,
    customerId: null,
  });
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "other" as "male" | "female" | "other",
  });
  const [levelUpdateDialog, setLevelUpdateDialog] = useState<{ open: boolean; level: string }>({
    open: false,
    level: "bronze",
  });
  
  // TODO: Get organizationId from context
  const organizationId = 1;
  
  const { data: customersData, isLoading, refetch } = trpc.customer.list.useQuery({
    organizationId,
    search: debouncedSearch || undefined,
    limit,
    page,
  });

  const customers = (customersData?.data || []) as Customer[];
  const totalItems = customersData?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // 批次選擇 Hook
  const {
    selectedIds,
    selectedItems,
    isAllSelected,
    isPartialSelected,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    hasSelection,
  } = useBatchSelection(customers);

  // 統計數據 - 使用列表資料計算
  const statsData = {
    totalCustomers: customersData?.total || 0,
    newThisMonth: 0,
    growthRate: 0,
    activeCustomers: 0,
    avgSpending: 0,
  };

  const createMutation = trpc.customer.create.useMutation({
    onSuccess: () => {
      toast.success("客戶新增成功");
      setIsDialogOpen(false);
      setNewCustomer({ name: "", phone: "", email: "", gender: "other" });
      refetch();
    },
    onError: (error) => {
      toast.error(`新增失敗: ${error.message}`);
    },
  });

  const deleteMutation = trpc.customer.delete.useMutation({
    onSuccess: () => {
      toast.success("客戶已刪除");
      setDeleteConfirm({ open: false, customerId: null });
      refetch();
    },
    onError: (error) => {
      toast.error(`刪除失敗: ${error.message}`);
    },
  });

  // 批次操作 Mutations
  const batchDeleteMutation = trpc.customer.batchDelete.useMutation({
    onSuccess: (data) => {
      toast.success(`已成功刪除 ${data.affected} 位客戶`);
      clearSelection();
      refetch();
    },
    onError: (error) => {
      toast.error(`批次刪除失敗: ${error.message}`);
    },
  });

  const batchUpdateLevelMutation = trpc.customer.batchUpdateLevel.useMutation({
    onSuccess: (data) => {
      toast.success(`已成功更新 ${data.affected} 位客戶的會員等級`);
      clearSelection();
      setLevelUpdateDialog({ open: false, level: "bronze" });
      refetch();
    },
    onError: (error) => {
      toast.error(`批次更新失敗: ${error.message}`);
    },
  });

  // 批次操作定義
  const batchActions: BatchAction<Customer>[] = [
    {
      id: "batch-update-level",
      label: "批次更新會員等級",
      icon: <Crown className="h-4 w-4" />,
      onExecute: async () => {
        setLevelUpdateDialog({ open: true, level: "bronze" });
      },
    },
    {
      id: "batch-export",
      label: "匯出選中客戶",
      icon: <Download className="h-4 w-4" />,
      onExecute: async (_, items) => {
        const exportData = items.map((c) => ({
          姓名: c.name,
          電話: c.phone || "",
          Email: c.email || "",
          性別: c.gender === "male" ? "男" : c.gender === "female" ? "女" : "其他",
          會員等級: getMemberLevelText(c.memberLevel),
          消費次數: c.visitCount || 0,
          累計消費: c.totalSpent || 0,
        }));
        downloadCSV(exportData, `選中客戶_${new Date().toISOString().split("T")[0]}`);
        toast.success(`已匯出 ${items.length} 位客戶資料`);
      },
    },
    createBatchDeleteAction<Customer>(async (ids) => {
      await batchDeleteMutation.mutateAsync({ ids });
    }),
  ];

  const handleCreateCustomer = () => {
    if (!newCustomer.name.trim()) {
      toast.error("請輸入客戶姓名");
      return;
    }
    createMutation.mutate({
      organizationId,
      name: newCustomer.name,
      phone: newCustomer.phone || undefined,
      email: newCustomer.email || undefined,
      gender: newCustomer.gender,
    });
  };

  const handleDeleteCustomer = async () => {
    if (deleteConfirm.customerId) {
      deleteMutation.mutate({ id: deleteConfirm.customerId });
    }
  };

  const handleExport = async (format: "csv" | "xlsx" | "json") => {
    if (customers.length === 0) {
      toast.error("沒有資料可匯出");
      return;
    }

    const exportData = customers.map((c) => ({
      姓名: c.name,
      電話: c.phone || "",
      Email: c.email || "",
      性別: c.gender === "male" ? "男" : c.gender === "female" ? "女" : "其他",
      會員等級: getMemberLevelText(c.memberLevel),
      消費次數: c.visitCount || 0,
      累計消費: c.totalSpent || 0,
    }));

    if (format === "csv") {
      downloadCSV(exportData, `客戶列表_${new Date().toISOString().split("T")[0]}`);
    }
  };

  const handleBatchUpdateLevel = () => {
    if (selectedIds.length === 0) return;
    batchUpdateLevelMutation.mutate({
      ids: selectedIds,
      memberLevel: levelUpdateDialog.level as any,
    });
  };

  const getMemberLevelText = (level: string | null) => {
    switch (level) {
      case "diamond": return "鑽石";
      case "platinum": return "白金";
      case "gold": return "黃金";
      case "silver": return "白銀";
      case "bronze":
      default: return "銅牌";
    }
  };

  const getMemberLevelBadge = (level: string | null) => {
    switch (level) {
      case "diamond":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">鑽石</Badge>;
      case "platinum":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">白金</Badge>;
      case "gold":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">黃金</Badge>;
      case "silver":
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">白銀</Badge>;
      case "bronze":
      default:
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">銅牌</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Actions */}
        <PageHeader
          title="客戶管理"
          description="管理診所客戶資料"
          actions={
            <>
              <ExportButton onExport={handleExport} formats={["csv"]} />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    新增客戶
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新增客戶</DialogTitle>
                    <DialogDescription>
                      填寫客戶基本資料
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">姓名 *</Label>
                      <Input
                        id="name"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        placeholder="請輸入客戶姓名"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">電話</Label>
                      <Input
                        id="phone"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        placeholder="請輸入電話號碼"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        placeholder="請輸入 Email"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gender">性別</Label>
                      <Select
                        value={newCustomer.gender}
                        onValueChange={(value: "male" | "female" | "other") => 
                          setNewCustomer({ ...newCustomer, gender: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇性別" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">男</SelectItem>
                          <SelectItem value="female">女</SelectItem>
                          <SelectItem value="other">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleCreateCustomer} disabled={createMutation.isPending}>
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
            title="總客戶數"
            value={statsData?.totalCustomers || 0}
            icon={Users}
            description="位客戶"
          />
          <StatCard
            title="本月新增"
            value={statsData?.newThisMonth || 0}
            trend={statsData?.growthRate ? { value: statsData.growthRate, label: "較上月" } : undefined}
          />
          <StatCard
            title="活躍客戶"
            value={statsData?.activeCustomers || 0}
            description="近 30 天有消費"
          />
          <StatCard
            title="平均消費"
            value={`NT$ ${(statsData?.avgSpending || 0).toLocaleString()}`}
          />
        </StatGrid>

        {/* Search & Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="搜尋客戶姓名、電話..."
                className="max-w-sm"
              />
              <div className="text-sm text-muted-foreground">
                共 {totalItems} 位客戶
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 批次操作工具列 */}
            <BatchActionsToolbar
              selectedIds={selectedIds}
              selectedItems={selectedItems}
              totalCount={customers.length}
              actions={batchActions}
              onClearSelection={clearSelection}
              isLoading={batchDeleteMutation.isPending || batchUpdateLevelMutation.isPending}
            />

            {isLoading ? (
              <SkeletonTable
                columns={7}
                rows={5}
                headers={["", "客戶姓名", "聯絡方式", "會員等級", "消費次數", "累計消費", ""]}
              />
            ) : customers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="尚無客戶資料"
                description="點擊「新增客戶」開始建立"
                action={{
                  label: "新增客戶",
                  onClick: () => setIsDialogOpen(true),
                }}
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <SelectionCheckbox
                          checked={isAllSelected}
                          indeterminate={isPartialSelected}
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead>客戶姓名</TableHead>
                      <TableHead>聯絡方式</TableHead>
                      <TableHead>會員等級</TableHead>
                      <TableHead>消費次數</TableHead>
                      <TableHead>累計消費</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id} className={isSelected(customer.id) ? "bg-primary/5" : ""}>
                        <TableCell>
                          <SelectionCheckbox
                            checked={isSelected(customer.id)}
                            onCheckedChange={() => toggleItem(customer.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-medium">
                                {customer.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {customer.gender === "male" ? "男" : customer.gender === "female" ? "女" : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {customer.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {customer.phone}
                              </div>
                            )}
                            {customer.email && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getMemberLevelBadge(customer.memberLevel)}</TableCell>
                        <TableCell>{customer.visitCount || 0} 次</TableCell>
                        <TableCell>NT$ {(customer.totalSpent || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                查看詳情
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                編輯
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                新增預約
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteConfirm({ open: true, customerId: customer.id })}
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
                <DataPagination
                  currentPage={page}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
          title="確認刪除"
          description="確定要刪除此客戶嗎？此操作無法復原。"
          onConfirm={handleDeleteCustomer}
          confirmText="刪除"
          cancelText="取消"
          variant="destructive"
          loading={deleteMutation.isPending}
        />

        {/* Batch Update Level Dialog */}
        <Dialog open={levelUpdateDialog.open} onOpenChange={(open) => setLevelUpdateDialog({ ...levelUpdateDialog, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>批次更新會員等級</DialogTitle>
              <DialogDescription>
                將選中的 {selectedIds.length} 位客戶更新為指定會員等級
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>選擇會員等級</Label>
                <Select
                  value={levelUpdateDialog.level}
                  onValueChange={(value) => setLevelUpdateDialog({ ...levelUpdateDialog, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇會員等級" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">銅牌</SelectItem>
                    <SelectItem value="silver">白銀</SelectItem>
                    <SelectItem value="gold">黃金</SelectItem>
                    <SelectItem value="platinum">白金</SelectItem>
                    <SelectItem value="diamond">鑽石</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLevelUpdateDialog({ open: false, level: "bronze" })}>
                取消
              </Button>
              <Button onClick={handleBatchUpdateLevel} disabled={batchUpdateLevelMutation.isPending}>
                {batchUpdateLevelMutation.isPending ? "更新中..." : "確認更新"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
