import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Users, Plus, Search, MoreHorizontal, Phone, Mail, Edit, Trash2, Calendar, Eye } from "lucide-react";
import { Link } from "wouter";
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

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "other" as "male" | "female" | "other",
  });
  
  // TODO: Get organizationId from context
  const organizationId = 1;
  
  const { data: customersData, isLoading, refetch } = trpc.customer.list.useQuery({
    organizationId,
    search: search || undefined,
  });

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

  const customers = customersData?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">客戶管理</h1>
            <p className="text-gray-500 mt-1">管理診所客戶資料</p>
          </div>
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
        </div>

        {/* Search & Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜尋客戶姓名、電話..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-500">
                共 {customersData?.total || 0} 位客戶
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Users className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">尚無客戶資料</p>
                <p className="text-sm">點擊「新增客戶」開始建立</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium">
                              {customer.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-500">
                              {customer.gender === "male" ? "男" : customer.gender === "female" ? "女" : ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="h-3 w-3 text-gray-400" />
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
