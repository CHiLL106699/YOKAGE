import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Copy,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Code,
  FileJson,
  Lock,
  Unlock,
  ExternalLink,
  ChevronRight,
  Play,
} from "lucide-react";

// Mock API keys
const mockApiKeys = [
  {
    id: 1,
    name: "Production API Key",
    key: "yc_live_xxxxxxxxxxxxxxxxxxxxxxxx",
    created: "2024-01-01",
    lastUsed: "2024-01-15",
    status: "active",
  },
  {
    id: 2,
    name: "Development API Key",
    key: "yc_test_xxxxxxxxxxxxxxxxxxxxxxxx",
    created: "2024-01-05",
    lastUsed: "2024-01-14",
    status: "active",
  },
];

// API Endpoints documentation
const apiEndpoints = [
  {
    category: "客戶管理",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/customers",
        description: "取得客戶列表",
        auth: true,
      },
      {
        method: "GET",
        path: "/api/v1/customers/:id",
        description: "取得單一客戶詳情",
        auth: true,
      },
      {
        method: "POST",
        path: "/api/v1/customers",
        description: "建立新客戶",
        auth: true,
      },
      {
        method: "PUT",
        path: "/api/v1/customers/:id",
        description: "更新客戶資料",
        auth: true,
      },
      {
        method: "DELETE",
        path: "/api/v1/customers/:id",
        description: "刪除客戶",
        auth: true,
      },
    ],
  },
  {
    category: "預約管理",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/appointments",
        description: "取得預約列表",
        auth: true,
      },
      {
        method: "GET",
        path: "/api/v1/appointments/:id",
        description: "取得單一預約詳情",
        auth: true,
      },
      {
        method: "POST",
        path: "/api/v1/appointments",
        description: "建立新預約",
        auth: true,
      },
      {
        method: "PUT",
        path: "/api/v1/appointments/:id",
        description: "更新預約狀態",
        auth: true,
      },
      {
        method: "DELETE",
        path: "/api/v1/appointments/:id",
        description: "取消預約",
        auth: true,
      },
    ],
  },
  {
    category: "產品管理",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/products",
        description: "取得產品列表",
        auth: true,
      },
      {
        method: "GET",
        path: "/api/v1/products/:id",
        description: "取得單一產品詳情",
        auth: true,
      },
      {
        method: "POST",
        path: "/api/v1/products",
        description: "建立新產品",
        auth: true,
      },
      {
        method: "PUT",
        path: "/api/v1/products/:id",
        description: "更新產品資料",
        auth: true,
      },
    ],
  },
  {
    category: "訂單管理",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/orders",
        description: "取得訂單列表",
        auth: true,
      },
      {
        method: "GET",
        path: "/api/v1/orders/:id",
        description: "取得單一訂單詳情",
        auth: true,
      },
      {
        method: "POST",
        path: "/api/v1/orders",
        description: "建立新訂單",
        auth: true,
      },
      {
        method: "PUT",
        path: "/api/v1/orders/:id/status",
        description: "更新訂單狀態",
        auth: true,
      },
    ],
  },
  {
    category: "Webhook",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/webhooks",
        description: "註冊 Webhook 端點",
        auth: true,
      },
      {
        method: "GET",
        path: "/api/v1/webhooks",
        description: "取得已註冊的 Webhook 列表",
        auth: true,
      },
      {
        method: "DELETE",
        path: "/api/v1/webhooks/:id",
        description: "刪除 Webhook",
        auth: true,
      },
    ],
  },
];

// Sample code snippets
const codeSnippets = {
  curl: `curl -X GET "https://api.yochill.com/v1/customers" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
  javascript: `const response = await fetch('https://api.yochill.com/v1/customers', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const customers = await response.json();
console.log(customers);`,
  python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.yochill.com/v1/customers',
    headers=headers
)

customers = response.json()
print(customers)`,
};

export default function ApiDocsPage() {
  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<"curl" | "javascript" | "python">("javascript");

  const toggleKeyVisibility = (id: number) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已複製到剪貼簿");
  };

  const regenerateKey = (id: number) => {
    toast.success("API Key 已重新產生");
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800";
      case "POST":
        return "bg-blue-100 text-blue-800";
      case "PUT":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div>
          <h1 className="text-3xl font-bold">API 開放平台</h1>
          <p className="text-muted-foreground mt-1">管理 API 金鑰與查閱 API 文件</p>
        </div>

        <Tabs defaultValue="keys" className="space-y-4">
          <TabsList>
            <TabsTrigger value="keys">API 金鑰</TabsTrigger>
            <TabsTrigger value="docs">API 文件</TabsTrigger>
            <TabsTrigger value="examples">程式範例</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          {/* API 金鑰管理 */}
          <TabsContent value="keys" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">API 金鑰管理</CardTitle>
                    <CardDescription>
                      管理您的 API 金鑰，用於存取 YOChiLL API
                    </CardDescription>
                  </div>
                  <Button>
                    <Key className="h-4 w-4 mr-2" />
                    建立新金鑰
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockApiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{apiKey.name}</p>
                          <Badge className={apiKey.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {apiKey.status === "active" ? "啟用中" : "已停用"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-sm">
                          <span>
                            {showKeys[apiKey.id]
                              ? apiKey.key
                              : apiKey.key.replace(/./g, "•").slice(0, 20) + "..."}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {showKeys[apiKey.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          建立於 {apiKey.created} · 最後使用 {apiKey.lastUsed}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => regenerateKey(apiKey.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          重新產生
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 使用限制 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">API 使用限制</CardTitle>
                <CardDescription>您目前方案的 API 呼叫限制</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">每分鐘請求數</p>
                    <p className="text-2xl font-bold">60</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">每日請求數</p>
                    <p className="text-2xl font-bold">10,000</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">今日已使用</p>
                    <p className="text-2xl font-bold">2,345</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API 文件 */}
          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">API 端點文件</CardTitle>
                <CardDescription>
                  所有可用的 API 端點與說明
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {apiEndpoints.map((category) => (
                    <div key={category.category}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        {category.category}
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-24">方法</TableHead>
                            <TableHead>端點</TableHead>
                            <TableHead>說明</TableHead>
                            <TableHead className="w-24">認證</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {category.endpoints.map((endpoint, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Badge className={getMethodBadgeColor(endpoint.method)}>
                                  {endpoint.method}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {endpoint.path}
                              </TableCell>
                              <TableCell>{endpoint.description}</TableCell>
                              <TableCell>
                                {endpoint.auth ? (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Unlock className="h-4 w-4 text-muted-foreground" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 程式範例 */}
          <TabsContent value="examples" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">程式範例</CardTitle>
                    <CardDescription>
                      各種程式語言的 API 呼叫範例
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedLanguage === "curl" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLanguage("curl")}
                    >
                      cURL
                    </Button>
                    <Button
                      variant={selectedLanguage === "javascript" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLanguage("javascript")}
                    >
                      JavaScript
                    </Button>
                    <Button
                      variant={selectedLanguage === "python" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLanguage("python")}
                    >
                      Python
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">{codeSnippets[selectedLanguage]}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(codeSnippets[selectedLanguage])}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* API 測試工具 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">API 測試工具</CardTitle>
                <CardDescription>
                  直接在瀏覽器中測試 API 端點
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <select className="border rounded-md px-3 py-2">
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                      <option>DELETE</option>
                    </select>
                    <Input
                      placeholder="https://api.yochill.com/v1/customers"
                      className="flex-1"
                    />
                    <Button>
                      <Play className="h-4 w-4 mr-2" />
                      發送請求
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg min-h-[200px]">
                    <p className="text-sm text-muted-foreground">回應將顯示在這裡...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Webhook 設定</CardTitle>
                    <CardDescription>
                      設定事件通知的 Webhook 端點
                    </CardDescription>
                  </div>
                  <Button>
                    新增 Webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">預約事件通知</p>
                      <Badge className="bg-green-100 text-green-800">啟用中</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      https://your-server.com/webhooks/appointments
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">appointment.created</Badge>
                      <Badge variant="outline">appointment.updated</Badge>
                      <Badge variant="outline">appointment.cancelled</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">訂單事件通知</p>
                      <Badge className="bg-green-100 text-green-800">啟用中</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      https://your-server.com/webhooks/orders
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">order.created</Badge>
                      <Badge variant="outline">order.paid</Badge>
                      <Badge variant="outline">order.completed</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Webhook 事件類型 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">可用的 Webhook 事件</CardTitle>
                <CardDescription>
                  系統支援的所有 Webhook 事件類型
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>事件類型</TableHead>
                      <TableHead>說明</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-sm">customer.created</TableCell>
                      <TableCell>新客戶建立時觸發</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">customer.updated</TableCell>
                      <TableCell>客戶資料更新時觸發</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">appointment.created</TableCell>
                      <TableCell>新預約建立時觸發</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">appointment.confirmed</TableCell>
                      <TableCell>預約確認時觸發</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">appointment.cancelled</TableCell>
                      <TableCell>預約取消時觸發</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">order.created</TableCell>
                      <TableCell>新訂單建立時觸發</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">order.paid</TableCell>
                      <TableCell>訂單付款完成時觸發</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">order.completed</TableCell>
                      <TableCell>訂單完成時觸發</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
