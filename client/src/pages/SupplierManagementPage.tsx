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
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  ShoppingCart,
  ClipboardList,
  Phone,
  Mail,
  MapPin,
  Star,
  RefreshCw
} from "lucide-react";

// 供應商列表
const suppliers = [
  {
    id: 1,
    name: "美德醫療器材",
    category: "醫療耗材",
    contact: "王經理",
    phone: "02-2345-6789",
    email: "wang@mede.com",
    address: "台北市信義區",
    rating: 4.8,
    totalOrders: 156,
    totalAmount: 2450000,
    status: "active",
    paymentTerms: "月結 30 天"
  },
  {
    id: 2,
    name: "玻尿酸原廠代理",
    category: "注射填充物",
    contact: "李小姐",
    phone: "02-8765-4321",
    email: "lee@hya.com",
    address: "台北市大安區",
    rating: 4.9,
    totalOrders: 89,
    totalAmount: 3800000,
    status: "active",
    paymentTerms: "月結 45 天"
  },
  {
    id: 3,
    name: "雷射設備維護",
    category: "設備維護",
    contact: "張工程師",
    phone: "02-1234-5678",
    email: "zhang@laser.com",
    address: "新北市板橋區",
    rating: 4.5,
    totalOrders: 24,
    totalAmount: 560000,
    status: "active",
    paymentTerms: "現金"
  }
];

// 採購訂單
const purchaseOrders = [
  {
    id: "PO-2024-001",
    supplier: "美德醫療器材",
    items: 5,
    amount: 125000,
    orderDate: "2024-01-15",
    expectedDate: "2024-01-20",
    status: "pending"
  },
  {
    id: "PO-2024-002",
    supplier: "玻尿酸原廠代理",
    items: 3,
    amount: 280000,
    orderDate: "2024-01-14",
    expectedDate: "2024-01-18",
    status: "shipped"
  },
  {
    id: "PO-2024-003",
    supplier: "美德醫療器材",
    items: 8,
    amount: 95000,
    orderDate: "2024-01-10",
    expectedDate: "2024-01-15",
    status: "received"
  }
];

// 自動補貨建議
const restockSuggestions = [
  {
    id: 1,
    product: "玻尿酸 1cc",
    currentStock: 5,
    minStock: 10,
    suggestedQty: 20,
    supplier: "玻尿酸原廠代理",
    urgency: "high"
  },
  {
    id: 2,
    product: "無菌手套 (M)",
    currentStock: 50,
    minStock: 100,
    suggestedQty: 200,
    supplier: "美德醫療器材",
    urgency: "medium"
  },
  {
    id: 3,
    product: "消毒酒精",
    currentStock: 8,
    minStock: 15,
    suggestedQty: 30,
    supplier: "美德醫療器材",
    urgency: "low"
  }
];

export default function SupplierManagementPage() {
  const [activeTab, setActiveTab] = useState("suppliers");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">供應商與採購</h1>
            <p className="text-gray-500 mt-1">供應商管理、採購訂單與成本分析</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              自動補貨
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新增採購單
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">供應商數</p>
                  <p className="text-2xl font-bold">12</p>
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
                  <p className="text-sm text-gray-500">本月採購</p>
                  <p className="text-2xl font-bold">NT$580K</p>
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
                  <p className="text-sm text-gray-500">待收貨</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">待補貨</p>
                  <p className="text-2xl font-bold text-red-600">8</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">成本節省</p>
                  <p className="text-2xl font-bold text-green-600">-8%</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="suppliers">
              <Building2 className="w-4 h-4 mr-2" />
              供應商
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ClipboardList className="w-4 h-4 mr-2" />
              採購訂單
            </TabsTrigger>
            <TabsTrigger value="receiving">
              <Package className="w-4 h-4 mr-2" />
              進貨驗收
            </TabsTrigger>
            <TabsTrigger value="restock">
              <RefreshCw className="w-4 h-4 mr-2" />
              自動補貨
            </TabsTrigger>
            <TabsTrigger value="cost">
              <BarChart3 className="w-4 h-4 mr-2" />
              成本分析
            </TabsTrigger>
          </TabsList>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>供應商列表</CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新增供應商
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{supplier.name}</h4>
                              <Badge variant="secondary">{supplier.category}</Badge>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm">{supplier.rating}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{supplier.phone}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span>{supplier.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{supplier.address}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{supplier.paymentTerms}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">訂單數</p>
                            <p className="font-semibold">{supplier.totalOrders}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">累計金額</p>
                            <p className="font-semibold">NT${(supplier.totalAmount / 10000).toFixed(0)}萬</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            詳情
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>採購訂單</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {purchaseOrders.map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            order.status === 'received' ? 'bg-green-100' :
                            order.status === 'shipped' ? 'bg-blue-100' :
                            'bg-yellow-100'
                          }`}>
                            {order.status === 'received' && <CheckCircle className="w-5 h-5 text-green-600" />}
                            {order.status === 'shipped' && <Truck className="w-5 h-5 text-blue-600" />}
                            {order.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{order.id}</h4>
                              <Badge className={
                                order.status === 'received' ? 'bg-green-100 text-green-800' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {order.status === 'received' ? '已收貨' :
                                 order.status === 'shipped' ? '運送中' : '待出貨'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{order.supplier}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">品項數</p>
                            <p className="font-semibold">{order.items}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">金額</p>
                            <p className="font-semibold">NT${order.amount.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">預計到貨</p>
                            <p className="font-semibold">{order.expectedDate}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            查看
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receiving Tab */}
          <TabsContent value="receiving" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>進貨驗收</CardTitle>
                <CardDescription>待驗收的採購訂單</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {purchaseOrders.filter(o => o.status === 'shipped').map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{order.id}</h4>
                          <p className="text-sm text-gray-500">{order.supplier}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">待驗收</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">訂購數量</p>
                          <p className="font-semibold">{order.items} 品項</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">訂單金額</p>
                          <p className="font-semibold">NT${order.amount.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">預計到貨</p>
                          <p className="font-semibold">{order.expectedDate}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          確認驗收
                        </Button>
                        <Button variant="outline">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          回報問題
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restock Tab */}
          <TabsContent value="restock" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>自動補貨建議</CardTitle>
                <CardDescription>根據庫存水位自動產生補貨建議</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restockSuggestions.map((item) => (
                    <div key={item.id} className={`p-4 border rounded-lg ${
                      item.urgency === 'high' ? 'border-red-200 bg-red-50' :
                      item.urgency === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            item.urgency === 'high' ? 'bg-red-100' :
                            item.urgency === 'medium' ? 'bg-yellow-100' :
                            'bg-blue-100'
                          }`}>
                            <Package className={`w-5 h-5 ${
                              item.urgency === 'high' ? 'text-red-600' :
                              item.urgency === 'medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-semibold">{item.product}</h4>
                            <p className="text-sm text-gray-500">{item.supplier}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">目前庫存</p>
                            <p className={`font-semibold ${item.currentStock < item.minStock ? 'text-red-600' : ''}`}>
                              {item.currentStock}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">安全庫存</p>
                            <p className="font-semibold">{item.minStock}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">建議補貨</p>
                            <p className="font-semibold text-blue-600">{item.suggestedQty}</p>
                          </div>
                          <Badge className={
                            item.urgency === 'high' ? 'bg-red-100 text-red-800' :
                            item.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {item.urgency === 'high' ? '緊急' :
                             item.urgency === 'medium' ? '建議' : '一般'}
                          </Badge>
                          <Button size="sm">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            立即採購
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Tab */}
          <TabsContent value="cost" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>採購成本趨勢</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['醫療耗材', '注射填充物', '設備維護', '其他'].map((category, idx) => (
                      <div key={category} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{category}</span>
                          <span className="text-sm text-gray-500">
                            NT${[180, 380, 56, 45][idx]}K
                          </span>
                        </div>
                        <Progress value={[30, 60, 10, 8][idx]} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>成本節省分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { item: "批量採購折扣", saved: 45000, percent: 5 },
                      { item: "供應商議價", saved: 28000, percent: 3 },
                      { item: "替代品選用", saved: 15000, percent: 2 }
                    ].map((saving) => (
                      <div key={saving.item} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{saving.item}</p>
                            <p className="text-sm text-gray-500">節省 {saving.percent}%</p>
                          </div>
                          <p className="text-lg font-bold text-green-600">
                            -NT${saving.saved.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">本月總節省</span>
                        <span className="text-xl font-bold text-green-600">-NT$88,000</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
