import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Package, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, DollarSign } from "lucide-react";
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

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">產品管理</h1>
            <p className="text-gray-500 mt-1">管理診所療程與產品</p>
          </div>
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
        </div>

        {/* Search & Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜尋產品名稱..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-500">
                共 {productsData?.total || 0} 項產品
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Package className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">尚無產品資料</p>
                <p className="text-sm">點擊「新增產品」開始建立</p>
              </div>
            ) : (
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
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.description && (
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(product.category)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
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
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              查看詳情
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              編輯
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
