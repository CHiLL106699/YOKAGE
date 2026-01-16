import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Building2,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Eye,
  Settings,
  BarChart3,
  Package,
  Calendar,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Shield,
  Palette
} from "lucide-react";

// 分店列表
const branches = [
  {
    id: 1,
    name: "YOChiLL 信義旗艦店",
    address: "台北市信義區信義路五段 100 號",
    phone: "02-2345-6789",
    manager: "王經理",
    employees: 15,
    revenue: 2850000,
    revenueGrowth: 12,
    customers: 456,
    rating: 4.8,
    status: "active"
  },
  {
    id: 2,
    name: "YOChiLL 大安店",
    address: "台北市大安區忠孝東路四段 200 號",
    phone: "02-2765-4321",
    manager: "李經理",
    employees: 10,
    revenue: 1950000,
    revenueGrowth: 8,
    customers: 312,
    rating: 4.6,
    status: "active"
  },
  {
    id: 3,
    name: "YOChiLL 新竹店",
    address: "新竹市東區光復路一段 88 號",
    phone: "03-5678-1234",
    manager: "張經理",
    employees: 8,
    revenue: 1250000,
    revenueGrowth: -3,
    customers: 198,
    rating: 4.5,
    status: "active"
  }
];

// 跨店預約
const crossBranchBookings = [
  {
    id: 1,
    customer: "王小美",
    originalBranch: "信義旗艦店",
    targetBranch: "大安店",
    treatment: "玻尿酸",
    date: "2024-01-20",
    time: "14:00",
    status: "confirmed"
  },
  {
    id: 2,
    customer: "李小華",
    originalBranch: "大安店",
    targetBranch: "信義旗艦店",
    treatment: "皮秒雷射",
    date: "2024-01-22",
    time: "10:00",
    status: "pending"
  }
];

// 庫存調度
const inventoryTransfers = [
  {
    id: 1,
    product: "玻尿酸 1cc",
    from: "信義旗艦店",
    to: "新竹店",
    quantity: 10,
    status: "in_transit",
    date: "2024-01-16"
  },
  {
    id: 2,
    product: "肉毒桿菌 50U",
    from: "大安店",
    to: "信義旗艦店",
    quantity: 5,
    status: "completed",
    date: "2024-01-14"
  }
];

export default function MultiBranchPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const totalRevenue = branches.reduce((sum, b) => sum + b.revenue, 0);
  const totalEmployees = branches.reduce((sum, b) => sum + b.employees, 0);
  const totalCustomers = branches.reduce((sum, b) => sum + b.customers, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">多分店管理</h1>
            <p className="text-gray-500 mt-1">連鎖經營、跨店調度與品牌一致性管理</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              同步數據
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新增分店
            </Button>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">分店數量</p>
                  <p className="text-2xl font-bold">{branches.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">總營收</p>
                  <p className="text-2xl font-bold">NT${(totalRevenue / 10000).toFixed(0)}萬</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">總員工</p>
                  <p className="text-2xl font-bold">{totalEmployees}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">總顧客</p>
                  <p className="text-2xl font-bold">{totalCustomers}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">平均成長</p>
                  <p className="text-2xl font-bold text-green-600">+5.7%</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">
              <Building2 className="w-4 h-4 mr-2" />
              分店總覽
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <BarChart3 className="w-4 h-4 mr-2" />
              績效比較
            </TabsTrigger>
            <TabsTrigger value="cross-booking">
              <Calendar className="w-4 h-4 mr-2" />
              跨店預約
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <Package className="w-4 h-4 mr-2" />
              庫存調度
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Shield className="w-4 h-4 mr-2" />
              權限管理
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Palette className="w-4 h-4 mr-2" />
              品牌一致性
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {branches.map((branch) => (
                <Card key={branch.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <Building2 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{branch.name}</h3>
                            <Badge className="bg-green-100 text-green-800">營運中</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {branch.address}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {branch.phone}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">店長：{branch.manager}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="grid grid-cols-4 gap-6 text-center">
                          <div>
                            <p className="text-xs text-gray-500">本月營收</p>
                            <p className="text-lg font-bold">NT${(branch.revenue / 10000).toFixed(0)}萬</p>
                            <p className={`text-xs flex items-center justify-center ${branch.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {branch.revenueGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {Math.abs(branch.revenueGrowth)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">員工數</p>
                            <p className="text-lg font-bold">{branch.employees}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">顧客數</p>
                            <p className="text-lg font-bold">{branch.customers}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">評分</p>
                            <p className="text-lg font-bold">{branch.rating}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            詳情
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            設定
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>分店績效比較</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Revenue Comparison */}
                  <div>
                    <h4 className="font-medium mb-3">營收比較</h4>
                    <div className="space-y-3">
                      {branches.map((branch) => (
                        <div key={branch.id} className="flex items-center gap-4">
                          <span className="w-32 text-sm truncate">{branch.name.replace('YOChiLL ', '')}</span>
                          <div className="flex-1">
                            <Progress value={(branch.revenue / totalRevenue) * 100} className="h-4" />
                          </div>
                          <span className="w-24 text-right font-semibold">
                            NT${(branch.revenue / 10000).toFixed(0)}萬
                          </span>
                          <span className={`w-16 text-right text-sm ${branch.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {branch.revenueGrowth >= 0 ? '+' : ''}{branch.revenueGrowth}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Comparison */}
                  <div>
                    <h4 className="font-medium mb-3">顧客數比較</h4>
                    <div className="space-y-3">
                      {branches.map((branch) => (
                        <div key={branch.id} className="flex items-center gap-4">
                          <span className="w-32 text-sm truncate">{branch.name.replace('YOChiLL ', '')}</span>
                          <div className="flex-1">
                            <Progress value={(branch.customers / totalCustomers) * 100} className="h-4" />
                          </div>
                          <span className="w-24 text-right font-semibold">{branch.customers} 人</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rating Comparison */}
                  <div>
                    <h4 className="font-medium mb-3">評分比較</h4>
                    <div className="space-y-3">
                      {branches.map((branch) => (
                        <div key={branch.id} className="flex items-center gap-4">
                          <span className="w-32 text-sm truncate">{branch.name.replace('YOChiLL ', '')}</span>
                          <div className="flex-1">
                            <Progress value={branch.rating * 20} className="h-4" />
                          </div>
                          <span className="w-24 text-right font-semibold">{branch.rating} / 5.0</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cross Booking Tab */}
          <TabsContent value="cross-booking" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>跨店預約</CardTitle>
                    <CardDescription>顧客可在任一分店預約其他分店的療程</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新增跨店預約
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crossBranchBookings.map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{booking.originalBranch}</Badge>
                            <span className="text-gray-400">→</span>
                            <Badge>{booking.targetBranch}</Badge>
                          </div>
                          <div>
                            <p className="font-medium">{booking.customer}</p>
                            <p className="text-sm text-gray-500">{booking.treatment}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{booking.date}</p>
                            <p className="text-sm text-gray-500">{booking.time}</p>
                          </div>
                          <Badge className={booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {booking.status === 'confirmed' ? '已確認' : '待確認'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>庫存調度</CardTitle>
                    <CardDescription>跨分店庫存調撥與追蹤</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新增調撥
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryTransfers.map((transfer) => (
                    <div key={transfer.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transfer.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            <Package className={`w-5 h-5 ${
                              transfer.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{transfer.product}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{transfer.from}</span>
                              <span>→</span>
                              <span>{transfer.to}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">數量</p>
                            <p className="font-semibold">{transfer.quantity}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">日期</p>
                            <p className="font-semibold">{transfer.date}</p>
                          </div>
                          <Badge className={transfer.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {transfer.status === 'completed' ? '已完成' : '運送中'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>分店權限管理</CardTitle>
                <CardDescription>設定各分店的系統存取權限</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {branches.map((branch) => (
                    <div key={branch.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{branch.name}</h4>
                          <p className="text-sm text-gray-500">店長：{branch.manager}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          編輯權限
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        {[
                          { name: "顧客資料", enabled: true },
                          { name: "財務報表", enabled: branch.id === 1 },
                          { name: "庫存管理", enabled: true },
                          { name: "員工管理", enabled: true }
                        ].map((permission) => (
                          <div key={permission.name} className="flex items-center gap-2">
                            {permission.enabled ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={permission.enabled ? '' : 'text-gray-400'}>{permission.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>品牌一致性管理</CardTitle>
                <CardDescription>確保所有分店遵循品牌規範</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">品牌規範檢查</h4>
                    {[
                      { item: "Logo 使用規範", status: "pass", branches: 3 },
                      { item: "色彩規範", status: "pass", branches: 3 },
                      { item: "服務流程標準", status: "warning", branches: 2 },
                      { item: "價格一致性", status: "pass", branches: 3 },
                      { item: "行銷素材規範", status: "pass", branches: 3 }
                    ].map((check) => (
                      <div key={check.item} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {check.status === 'pass' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          )}
                          <span>{check.item}</span>
                        </div>
                        <Badge className={check.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {check.branches}/{branches.length} 分店
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">品牌資源</h4>
                    {[
                      { name: "品牌識別手冊", type: "PDF", size: "2.5 MB" },
                      { name: "Logo 素材包", type: "ZIP", size: "15 MB" },
                      { name: "行銷模板", type: "ZIP", size: "8 MB" },
                      { name: "服務流程 SOP", type: "PDF", size: "1.2 MB" }
                    ].map((resource) => (
                      <div key={resource.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{resource.name}</p>
                          <p className="text-sm text-gray-500">{resource.type} • {resource.size}</p>
                        </div>
                        <Button variant="outline" size="sm">下載</Button>
                      </div>
                    ))}
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
