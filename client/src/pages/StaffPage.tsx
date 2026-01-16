import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Users, Plus, Search, MoreHorizontal, Edit, Trash2, Calendar, Phone, Mail } from "lucide-react";
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

export default function StaffPage() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">員工管理</h1>
            <p className="text-gray-500 mt-1">管理診所員工資料與排班</p>
          </div>
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
        </div>

        {/* Search & Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜尋員工姓名、電話..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-500">
                共 {staffData?.total || 0} 位員工
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Users className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">尚無員工資料</p>
                <p className="text-sm">點擊「新增員工」開始建立</p>
              </div>
            ) : (
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
                  {filteredStaff.map((member) => (
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
                            <p className="text-sm text-gray-500">
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
                              <Phone className="h-3 w-3 text-gray-400" />
                              {member.phone}
                            </div>
                          )}
                          {member.email && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="h-3 w-3 text-gray-400" />
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
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              編輯
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              排班管理
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
