import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Package, Plus, MoreHorizontal, Edit, Trash2, Eye, DollarSign, Boxes, TrendingUp, ShoppingBag } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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

export default function ProductsPage() {
  const { search, setSearch, debouncedSearch } = useSearch();
  const { page, pageSize, setPage, setPageSize, offset, limit } = usePagination(20);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; productId: number | null }>({
    open: false,
    productId: null,
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "treatment",
    price: "",
    duration: "",
  });
  
  // TODO: Get organizationId from context
  const organizationId = 1;
  
  const { data: productsData, isLoading, refetch } = trpc.product.list.useQuery({
    organizationId,
  });

  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      toast.success("產品新增成功");
      setIsDialogOpen(false);
      setNewProduct({ name: "", description: "", category: "treatment", price: "", duration: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(`新增失敗: ${error.message}`);
    },
  });

  // Note: product.delete API 尚未實作，暫時使用 toast 提示
  const handleDeleteProduct = () => {
    toast.info("刪除功能開發中");
    setDeleteConfirm({ open: false, productId: null });
  };

  const handleCreateProduct = () => {
    if (!newProduct.name.trim()) {
      toast.error("請輸入產品名稱");
      return;
    }
    if (!newProduct.price) {
      toast.error("請輸入價格");
      return;
    }
    createMutation.mutate({
      organizationId,
      name: newProduct.name,
      description: newProduct.description || undefined,
      category: newProduct.category,
      price: newProduct.price,
      duration: newProduct.duration ? parseInt(newProduct.duration) : undefined,
    });
  };

  

  const handleExport = async (format: "csv" | "xlsx" | "json") => {
    const products = productsData?.data || [];
    if (products.length === 0) {
      toast.error("沒有資料可匯出");
      return;
    }

    const exportData = products.map((p) => ({
      名稱: p.name,
      類別: p.category === "treatment" ? "療程" : p.category === "product" ? "產品" : p.category === "package" ? "套餐" : "諮詢",
      價格: Number(p.price || 0),
      時長: p.duration ? `${p.duration} 分鐘` : "-",
      狀態: p.isActive ? "上架中" : "已下架",
      描述: p.description || "",
    }));

    if (format === "csv") {
      downloadCSV(exportData, `產品列表_${new Date().toISOString().split("T")[0]}`);
    }
  };

  const getCategoryBadge = (category: string | null) => {
    switch (category) {
      case "treatment":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">療程</Badge>;
      case "product":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">產品</Badge>;
      case "package":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">套餐</Badge>;
      case "consultation":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">諮詢</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  const products = productsData?.data || [];
  const filteredProducts = debouncedSearch
    ? products.filter(p => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : products;

  // 計算統計數據
  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    treatments: products.filter(p => p.category === "treatment").length,
    avgPrice: products.length > 0 
      ? Math.round(products.reduce((sum, p) => sum + Number(p.price || 0), 0) / products.length)
      : 0,
  };

  // 分頁處理
  const paginatedProducts = filteredProducts.slice(offset, offset + limit);
  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Actions */}
        <PageHeader
          title="產品管理"
          description="管理診所療程與產品"
          actions={
            <>
              <ExportButton onExport={handleExport} formats={["csv"]} />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    新增產品
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新增產品</DialogTitle>
                    <DialogDescription>
                      填寫產品/療程資料
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">名稱 *</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="請輸入產品名稱"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">類別</Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇類別" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="treatment">療程</SelectItem>
                          <SelectItem value="product">產品</SelectItem>
                          <SelectItem value="package">套餐</SelectItem>
                          <SelectItem value="consultation">諮詢</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">價格 (NT$) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="duration">時長 (分鐘)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={newProduct.duration}
                          onChange={(e) => setNewProduct({ ...newProduct, duration: e.target.value })}
                          placeholder="60"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">描述</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="請輸入產品描述"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleCreateProduct} disabled={createMutation.isPending}>
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
            title="總產品數"
            value={stats.total}
            icon={Boxes}
            description="項產品"
          />
          <StatCard
            title="上架中"
            value={stats.active}
            icon={ShoppingBag}
          />
          <StatCard
            title="療程項目"
            value={stats.treatments}
            icon={Package}
          />
          <StatCard
            title="平均價格"
            value={`NT$ ${stats.avgPrice.toLocaleString()}`}
            icon={TrendingUp}
          />
        </StatGrid>

        {/* Search & Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="搜尋產品名稱..."
                className="max-w-sm"
              />
              <div className="text-sm text-muted-foreground">
                共 {filteredProducts.length} 項產品
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable
                columns={6}
                rows={5}
                headers={["產品名稱", "類別", "價格", "時長", "狀態", ""]}
              />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title="尚無產品資料"
                description="點擊「新增產品」開始建立"
                action={{
                  label: "新增產品",
                  onClick: () => setIsDialogOpen(true),
                }}
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>產品名稱</TableHead>
                      <TableHead>類別</TableHead>
                      <TableHead>價格</TableHead>
                      <TableHead>時長</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryBadge(product.category)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            NT$ {Number(product.price || 0).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>{product.duration ? `${product.duration} 分鐘` : "-"}</TableCell>
                        <TableCell>
                          {product.isActive ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">上架中</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">已下架</Badge>
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
                              <DropdownMenuItem onClick={() => toast.info("查看詳情功能開發中")}>
                                <Eye className="h-4 w-4 mr-2" />
                                查看詳情
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("編輯功能開發中")}>
                                <Edit className="h-4 w-4 mr-2" />
                                編輯
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => setDeleteConfirm({ open: true, productId: product.id })}
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
                      totalItems={filteredProducts.length}
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
          title="確認刪除產品"
          description="確定要刪除此產品嗎？此操作無法復原。"
          confirmText="刪除"
          cancelText="取消"
          variant="destructive"
          onConfirm={handleDeleteProduct}
        />
      </div>
    </DashboardLayout>
  );
}
