
import { useState, Fragment } from "react";
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QueryLoading, QueryError } from "@/components/ui/query-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  Key,
  Eye,
  EyeOff,
  Code,
  FileJson,
  Lock,
  Unlock,
  ExternalLink,
  ChevronRight,
  Play,
  Trash2,
} from "lucide-react";

// API Endpoints documentation (static content)
const apiEndpoints = [
    {
        category: "客戶管理",
        endpoints: [
            { method: "GET", path: "/api/v1/customers", description: "取得客戶列表", auth: true },
            { method: "GET", path: "/api/v1/customers/:id", description: "取得單一客戶詳情", auth: true },
            { method: "POST", path: "/api/v1/customers", description: "建立新客戶", auth: true },
            { method: "PUT", path: "/api/v1/customers/:id", description: "更新客戶資料", auth: true },
            { method: "DELETE", path: "/api/v1/customers/:id", description: "刪除客戶", auth: true },
        ],
    },
    {
        category: "預約管理",
        endpoints: [
            { method: "GET", path: "/api/v1/appointments", description: "取得預約列表", auth: true },
            { method: "GET", path: "/api/v1/appointments/:id", description: "取得單一預約詳情", auth: true },
            { method: "POST", path: "/api/v1/appointments", description: "建立新預約", auth: true },
            { method: "PUT", path: "/api/v1/appointments/:id", description: "更新預約狀態", auth: true },
            { method: "DELETE", path: "/api/v1/appointments/:id", description: "取消預約", auth: true },
        ],
    },
    {
        category: "產品管理",
        endpoints: [
            { method: "GET", path: "/api/v1/products", description: "取得產品列表", auth: true },
            { method: "GET", path: "/api/v1/products/:id", description: "取得單一產品詳情", auth: true },
            { method: "POST", path: "/api/v1/products", description: "建立新產品", auth: true },
            { method: "PUT", path: "/api/v1/products/:id", description: "更新產品資料", auth: true },
        ],
    },
    {
        category: "訂單管理",
        endpoints: [
            { method: "GET", path: "/api/v1/orders", description: "取得訂單列表", auth: true },
            { method: "GET", path: "/api/v1/orders/:id", description: "取得單一訂單詳情", auth: true },
            { method: "POST", path: "/api/v1/orders", description: "建立新訂單", auth: true },
            { method: "PUT", path: "/api/v1/orders/:id/status", description: "更新訂單狀態", auth: true },
        ],
    },
    {
        category: "Webhook",
        endpoints: [
            { method: "POST", path: "/api/v1/webhooks", description: "註冊 Webhook 端點", auth: true },
            { method: "GET", path: "/api/v1/webhooks", description: "取得已註冊的 Webhook 列表", auth: true },
            { method: "DELETE", path: "/api/v1/webhooks/:id", description: "刪除 Webhook", auth: true },
        ],
    },
];

// Sample code snippets (static content)
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

const ApiKeySkeleton = () => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-2 w-full">
            <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-5 w-full max-w-md" />
            <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
        </div>
    </div>
);

export default function ApiDocsPage() {
    const utils = trpc.useUtils();
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [selectedLanguage, setSelectedLanguage] = useState<"curl" | "javascript" | "python">("javascript");
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [generatedKey, setGeneratedKey] = useState<{ apiKey: string; keyPrefix: string } | null>(null);

    const apiKeysQuery = trpc.superAdmin.listApiKeys.useQuery();

    const createApiKeyMutation = trpc.superAdmin.createApiKey.useMutation({
        onSuccess: (data) => {
            toast.success("API 金鑰已成功建立！");
            utils.superAdmin.listApiKeys.invalidate();
            setGeneratedKey({ apiKey: data.apiKey, keyPrefix: data.keyPrefix });
            setNewKeyName("");
            // Keep the modal open to show the new key
        },
        onError: (error) => {
            toast.error(`建立失敗: ${error.message}`);
        }
    });

    const revokeApiKeyMutation = trpc.superAdmin.revokeApiKey.useMutation({
        onSuccess: (_, variables) => {
            toast.success("API 金鑰已成功撤銷。");
            utils.superAdmin.listApiKeys.invalidate();
            setShowKeys(prev => {
                const newShowKeys = { ...prev };
                delete newShowKeys[String(variables.apiKeyId)];
                return newShowKeys;
            });
        },
        onError: (error) => {
            toast.error(`撤銷失敗: ${error.message}`);
        }
    });

    const handleCreateKey = () => {
        if (!newKeyName.trim()) {
            toast.warning("請輸入金鑰名稱。");
            return;
        }
        // organizationId is required by the API
        createApiKeyMutation.mutate({ organizationId: 1, name: newKeyName });
    };

    const handleCloseModal = () => {
        setCreateModalOpen(false);
        setGeneratedKey(null);
        setNewKeyName("");
    }

    const toggleKeyVisibility = (id: string) => {
        setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text: string, successMessage: string = "已複製到剪貼簿") => {
        navigator.clipboard.writeText(text);
        toast.success(successMessage);
    };

    const getMethodBadgeColor = (method: string) => {
        switch (method) {
            case "GET": return "bg-green-100 text-green-800";
            case "POST": return "bg-blue-100 text-blue-800";
            case "PUT": return "bg-yellow-100 text-yellow-800";
            case "DELETE": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
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

                    <TabsContent value="keys" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">API 金鑰管理</CardTitle>
                                        <CardDescription>管理您的 API 金鑰，用於存取 YOChiLL API</CardDescription>
                                    </div>
                                    <Button onClick={() => setCreateModalOpen(true)}>
                                        <Key className="h-4 w-4 mr-2" />
                                        建立新金鑰
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {apiKeysQuery.isLoading ? (
                                        <>
                                            <ApiKeySkeleton />
                                            <ApiKeySkeleton />
                                        </>
                                    ) : apiKeysQuery.isError ? (
                                        <QueryError message={apiKeysQuery.error?.message ?? '載入 API 金鑰失敗'} onRetry={() => apiKeysQuery.refetch()} />
                                    ) : (apiKeysQuery.data ?? []).length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">尚未建立任何 API 金鑰。</p>
                                    ) : (
                                        (apiKeysQuery.data ?? []).map((apiKey: any) => (
                                            <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="space-y-1 flex-grow">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">{apiKey.name}</p>
                                                        <Badge className={apiKey.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                                            {apiKey.status === 'active' ? "啟用中" : "已撤銷"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 font-mono text-sm">
                                                        <span>
                                                            {showKeys[apiKey.id]
                                                                ? `${apiKey.keyPrefix}...`
                                                                : `${apiKey.keyPrefix}....................`}
                                                        </span>
                                                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.keyPrefix, "已複製金鑰前綴")}>
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        建立於 {format(new Date(apiKey.createdAt), 'yyyy-MM-dd')}
                                                        {apiKey.lastUsedAt && ` · 最後使用 ${format(new Date(apiKey.lastUsedAt), 'yyyy-MM-dd HH:mm')}`}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => revokeApiKeyMutation.mutate({ apiKeyId: apiKey.id })}
                                                        disabled={revokeApiKeyMutation.isPending || apiKey.status !== 'active'}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        撤銷
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="docs">
                        <Card>
                            <CardHeader>
                                <CardTitle>API 文件</CardTitle>
                                <CardDescription>探索可用的 API 端點</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {apiEndpoints.map((category) => (
                                    <div key={category.category}>
                                        <h3 className="text-lg font-semibold mb-2">{category.category}</h3>
                                        <div className="border rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[100px]">Method</TableHead>
                                                        <TableHead>Endpoint</TableHead>
                                                        <TableHead>說明</TableHead>
                                                        <TableHead className="text-right">需驗證</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {category.endpoints.map((endpoint) => (
                                                        <TableRow key={endpoint.path}>
                                                            <TableCell>
                                                                <Badge className={`${getMethodBadgeColor(endpoint.method)} hover:${getMethodBadgeColor(endpoint.method)}`}>
                                                                    {endpoint.method}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-sm">{endpoint.path}</TableCell>
                                                            <TableCell>{endpoint.description}</TableCell>
                                                            <TableCell className="text-right">
                                                                {endpoint.auth ? <Lock className="h-4 w-4 inline-block text-muted-foreground" /> : <Unlock className="h-4 w-4 inline-block text-muted-foreground" />}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="examples">
                        <Card>
                            <CardHeader>
                                <CardTitle>程式碼範例</CardTitle>
                                <CardDescription>快速開始使用我們的 API</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="javascript" onValueChange={(value) => setSelectedLanguage(value as any)}>
                                    <TabsList>
                                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                                        <TabsTrigger value="python">Python</TabsTrigger>
                                        <TabsTrigger value="curl">cURL</TabsTrigger>
                                    </TabsList>
                                    <div className="mt-4 bg-gray-900 text-white rounded-lg p-4 relative font-mono text-sm">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2 text-white hover:bg-gray-700"
                                            onClick={() => copyToClipboard(codeSnippets[selectedLanguage])}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <pre><code>{codeSnippets[selectedLanguage]}</code></pre>
                                    </div>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="webhooks">
                        <Card>
                            <CardHeader>
                                <CardTitle>Webhooks</CardTitle>
                                <CardDescription>設定 Webhooks 以接收即時事件通知</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>透過 Webhooks，您可以在特定事件發生時 (例如：新預約建立、訂單付款成功) 接收到來自我們系統的 HTTP POST 請求。</p>
                                <Button variant="outline">
                                    閱讀 Webhook 文件 <ExternalLink className="h-4 w-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{generatedKey ? "API 金鑰已建立" : "建立新的 API 金鑰"}</DialogTitle>
                        <DialogDescription>
                            {generatedKey ? "請妥善保管您的新金鑰，此金鑰將不會再次顯示。" : "為您的新 API 金鑰命名。"}
                        </DialogDescription>
                    </DialogHeader>
                    {generatedKey ? (
                        <div className="space-y-4 py-4">
                            <p className="text-sm text-muted-foreground">金鑰名稱: <span className="font-medium text-primary">{newKeyName}</span></p>
                            <div className="p-4 bg-secondary rounded-md font-mono text-sm break-all relative">
                                {generatedKey.apiKey}
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => copyToClipboard(generatedKey.apiKey, "API 金鑰已複製！")}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">金鑰前綴: {generatedKey.keyPrefix}</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="key-name" className="text-right">金鑰名稱</Label>
                                <Input
                                    id="key-name"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    className="col-span-3"
                                    placeholder="例如：我的正式環境金鑰"
                                    disabled={createApiKeyMutation.isPending}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        {generatedKey ? (
                            <DialogClose asChild>
                                <Button type="button">完成</Button>
                            </DialogClose>
                        ) : (
                            <>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" disabled={createApiKeyMutation.isPending}>取消</Button>
                                </DialogClose>
                                <Button onClick={handleCreateKey} disabled={createApiKeyMutation.isPending || !newKeyName.trim()}>
                                    {createApiKeyMutation.isPending ? "建立中..." : "建立金鑰"}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
