import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { MessageCircle, Plus, Settings, ExternalLink, Copy, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
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
import { toast } from "sonner";

export default function LineSettingsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [newChannel, setNewChannel] = useState({
    channelName: "",
    channelId: "",
    channelSecret: "",
    accessToken: "",
    liffId: "",
  });
  
  // TODO: Get organizationId from context
  const organizationId = 1;
  
  const { data: channels, isLoading, refetch } = trpc.line.list.useQuery({
    organizationId,
  });

  const createMutation = trpc.line.createChannel.useMutation({
    onSuccess: () => {
      toast.success("LINE Channel 新增成功");
      setIsDialogOpen(false);
      setNewChannel({
        channelName: "",
        channelId: "",
        channelSecret: "",
        accessToken: "",
        liffId: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(`新增失敗: ${error.message}`);
    },
  });

  const handleCreateChannel = () => {
    if (!newChannel.channelName.trim() || !newChannel.channelId.trim()) {
      toast.error("請填寫必要欄位");
      return;
    }
    createMutation.mutate({
      organizationId,
      channelName: newChannel.channelName,
      channelId: newChannel.channelId,
      channelSecret: newChannel.channelSecret || undefined,
      accessToken: newChannel.accessToken || undefined,
      liffId: newChannel.liffId || undefined,
    });
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("已複製到剪貼簿");
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Webhook URL for this organization
  const webhookUrl = `${window.location.origin}/api/line/webhook/${organizationId}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">LINE 設定</h1>
            <p className="text-gray-500 mt-1">管理 LINE Official Account 與 LIFF 整合</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                新增 Channel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>新增 LINE Channel</DialogTitle>
                <DialogDescription>
                  請從 LINE Developers Console 取得以下資訊
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="channelName">Channel 名稱 *</Label>
                  <Input
                    id="channelName"
                    value={newChannel.channelName}
                    onChange={(e) => setNewChannel({ ...newChannel, channelName: e.target.value })}
                    placeholder="例：曜醫美官方帳號"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="channelId">Channel ID *</Label>
                  <Input
                    id="channelId"
                    value={newChannel.channelId}
                    onChange={(e) => setNewChannel({ ...newChannel, channelId: e.target.value })}
                    placeholder="從 LINE Developers Console 取得"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="channelSecret">Channel Secret</Label>
                  <Input
                    id="channelSecret"
                    type="password"
                    value={newChannel.channelSecret}
                    onChange={(e) => setNewChannel({ ...newChannel, channelSecret: e.target.value })}
                    placeholder="從 LINE Developers Console 取得"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={newChannel.accessToken}
                    onChange={(e) => setNewChannel({ ...newChannel, accessToken: e.target.value })}
                    placeholder="長效 Access Token"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="liffId">LIFF ID</Label>
                  <Input
                    id="liffId"
                    value={newChannel.liffId}
                    onChange={(e) => setNewChannel({ ...newChannel, liffId: e.target.value })}
                    placeholder="例：1234567890-abcdefgh"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateChannel} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "新增中..." : "新增"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Webhook URL Card */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-green-600" />
              Webhook 設定
            </CardTitle>
            <CardDescription>
              請將以下 Webhook URL 設定到您的 LINE Official Account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="font-mono text-sm bg-white"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(webhookUrl, "webhook")}
              >
                {copiedField === "webhook" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              前往{" "}
              <a
                href="https://developers.line.biz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline inline-flex items-center gap-1"
              >
                LINE Developers Console
                <ExternalLink className="h-3 w-3" />
              </a>
              {" "}設定 Webhook URL
            </p>
          </CardContent>
        </Card>

        {/* Channels List */}
        <div className="grid gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !channels || channels.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                <MessageCircle className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">尚未設定 LINE Channel</p>
                <p className="text-sm">點擊「新增 Channel」開始整合</p>
              </CardContent>
            </Card>
          ) : (
            channels.map((channel: { id: number; channelName: string; channelId: string; channelSecret: string | null; accessToken: string | null; liffId: string | null; isActive: boolean | null }) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{channel.channelName}</CardTitle>
                        <CardDescription>Channel ID: {channel.channelId}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {channel.isActive ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">啟用中</Badge>
                      ) : (
                        <Badge variant="secondary">停用</Badge>
                      )}
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Channel Secret</p>
                      <p className="font-mono">
                        {channel.channelSecret ? "••••••••" : (
                          <span className="text-orange-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            未設定
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Access Token</p>
                      <p className="font-mono">
                        {channel.accessToken ? "••••••••" : (
                          <span className="text-orange-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            未設定
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">LIFF ID</p>
                      <p className="font-mono">
                        {channel.liffId || (
                          <span className="text-orange-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            未設定
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">整合指南</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>前往 <a href="https://developers.line.biz/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LINE Developers Console</a> 建立 Messaging API Channel</li>
              <li>在 Channel 設定中啟用 Webhook，並填入上方的 Webhook URL</li>
              <li>取得 Channel ID、Channel Secret 和 Access Token</li>
              <li>建立 LIFF 應用程式並取得 LIFF ID</li>
              <li>在此頁面新增 Channel 並填入相關資訊</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
