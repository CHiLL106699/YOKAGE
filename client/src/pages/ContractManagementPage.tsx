import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  FileText,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pen,
  FileSignature,
  FolderOpen,
  Calendar,
  User,
  Send
} from "lucide-react";

// 合約列表
const contracts = [
  {
    id: 1,
    name: "療程同意書 - 玻尿酸注射",
    type: "療程同意書",
    customer: "王小美",
    status: "signed",
    createdAt: "2024-01-15",
    signedAt: "2024-01-15",
    expiresAt: "2025-01-15"
  },
  {
    id: 2,
    name: "療程同意書 - 皮秒雷射",
    type: "療程同意書",
    customer: "李小華",
    status: "pending",
    createdAt: "2024-01-16",
    signedAt: null,
    expiresAt: null
  },
  {
    id: 3,
    name: "會員服務合約",
    type: "會員合約",
    customer: "張大偉",
    status: "signed",
    createdAt: "2024-01-10",
    signedAt: "2024-01-10",
    expiresAt: "2025-01-10"
  }
];

// 文件模板
const templates = [
  {
    id: 1,
    name: "玻尿酸注射同意書",
    category: "療程同意書",
    version: "v2.1",
    lastUpdated: "2024-01-01",
    usageCount: 156
  },
  {
    id: 2,
    name: "肉毒桿菌注射同意書",
    category: "療程同意書",
    version: "v2.0",
    lastUpdated: "2024-01-01",
    usageCount: 89
  },
  {
    id: 3,
    name: "皮秒雷射同意書",
    category: "療程同意書",
    version: "v1.5",
    lastUpdated: "2023-12-15",
    usageCount: 124
  },
  {
    id: 4,
    name: "VIP 會員合約",
    category: "會員合約",
    version: "v3.0",
    lastUpdated: "2024-01-05",
    usageCount: 45
  }
];

export default function ContractManagementPage() {
  const [activeTab, setActiveTab] = useState("contracts");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">合約與文件</h1>
            <p className="text-gray-500 mt-1">電子簽章、合約管理與文件範本</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              上傳文件
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              建立合約
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">總合約數</p>
                  <p className="text-2xl font-bold">456</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">已簽署</p>
                  <p className="text-2xl font-bold text-green-600">423</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">待簽署</p>
                  <p className="text-2xl font-bold text-orange-600">28</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">即將到期</p>
                  <p className="text-2xl font-bold text-red-600">5</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="contracts">
              <FileSignature className="w-4 h-4 mr-2" />
              合約管理
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FolderOpen className="w-4 h-4 mr-2" />
              文件範本
            </TabsTrigger>
            <TabsTrigger value="e-sign">
              <Pen className="w-4 h-4 mr-2" />
              電子簽章
            </TabsTrigger>
          </TabsList>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>合約列表</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        placeholder="搜尋合約..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            contract.status === 'signed' ? 'bg-green-100' : 'bg-orange-100'
                          }`}>
                            <FileText className={`w-5 h-5 ${
                              contract.status === 'signed' ? 'text-green-600' : 'text-orange-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-semibold">{contract.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Badge variant="secondary">{contract.type}</Badge>
                              <span>•</span>
                              <User className="w-3 h-3" />
                              <span>{contract.customer}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="text-gray-500">建立日期</p>
                            <p>{contract.createdAt}</p>
                          </div>
                          {contract.signedAt && (
                            <div className="text-right text-sm">
                              <p className="text-gray-500">簽署日期</p>
                              <p>{contract.signedAt}</p>
                            </div>
                          )}
                          <Badge className={contract.status === 'signed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                            {contract.status === 'signed' ? '已簽署' : '待簽署'}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            {contract.status === 'pending' && (
                              <Button variant="ghost" size="sm">
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>文件範本</CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新增範本
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{template.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Badge variant="secondary">{template.category}</Badge>
                              <span>{template.version}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              更新於 {template.lastUpdated} • 使用 {template.usageCount} 次
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* E-Sign Tab */}
          <TabsContent value="e-sign" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>電子簽章</CardTitle>
                <CardDescription>支援 LINE 內嵌簽名，顧客可直接在手機上完成簽署</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">簽章流程</h4>
                    <div className="space-y-3">
                      {[
                        { step: 1, title: "選擇合約範本", desc: "從範本庫選擇適合的合約" },
                        { step: 2, title: "填寫顧客資訊", desc: "輸入顧客姓名與聯絡方式" },
                        { step: 3, title: "發送簽署連結", desc: "透過 LINE 發送簽署連結給顧客" },
                        { step: 4, title: "顧客簽署", desc: "顧客在手機上完成電子簽名" },
                        { step: 5, title: "自動歸檔", desc: "簽署完成後自動存檔並通知" }
                      ].map((item) => (
                        <div key={item.step} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-600 font-semibold">{item.step}</span>
                          </div>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">快速發送簽署</h4>
                    <div className="p-4 border rounded-lg space-y-4">
                      <div>
                        <label className="text-sm font-medium">選擇範本</label>
                        <select className="w-full mt-1 p-2 border rounded-lg">
                          <option>玻尿酸注射同意書</option>
                          <option>肉毒桿菌注射同意書</option>
                          <option>皮秒雷射同意書</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">顧客姓名</label>
                        <Input placeholder="輸入顧客姓名" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">LINE ID 或手機</label>
                        <Input placeholder="輸入 LINE ID 或手機號碼" className="mt-1" />
                      </div>
                      <Button className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        發送簽署連結
                      </Button>
                    </div>
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
