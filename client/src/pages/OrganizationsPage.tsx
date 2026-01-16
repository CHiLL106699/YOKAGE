import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Building2, Plus, Search, MoreHorizontal, Users, Calendar, Edit, Trash2 } from "lucide-react";
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

export default function OrganizationsPage() {
  const [search, setSearch] = useState("");
  const { data: organizations, isLoading } = trpc.organization.list.useQuery();

  const filteredOrgs = organizations?.filter(item => 
    item.organization.name.toLowerCase().includes(search.toLowerCase()) ||
    item.organization.slug?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">營運中</Badge>;
      case "trial":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">試用期</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">已暫停</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">企業版</Badge>;
      case "professional":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">專業版</Badge>;
      case "basic":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">基礎版</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">診所管理</h1>
            <p className="text-gray-500 mt-1">管理所有已註冊的診所</p>
          </div>
          <Link href="/super-admin/organizations/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              新增診所
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜尋診所名稱..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredOrgs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Building2 className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">尚無診所資料</p>
                <p className="text-sm">點擊「新增診所」開始建立</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>診所名稱</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>方案</TableHead>
                    <TableHead>聯絡電話</TableHead>
                    <TableHead>建立日期</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrgs.map((item) => (
                    <TableRow key={item.organization.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{item.organization.name}</p>
                            <p className="text-sm text-gray-500">{item.organization.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge("active")}</TableCell>
                      <TableCell>{getPlanBadge("basic")}</TableCell>
                      <TableCell>{item.organization.phone || "-"}</TableCell>
                      <TableCell>
                        {item.organization.createdAt ? new Date(item.organization.createdAt).toLocaleDateString("zh-TW") : "-"}
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
                              <Users className="h-4 w-4 mr-2" />
                              管理成員
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              查看預約
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
