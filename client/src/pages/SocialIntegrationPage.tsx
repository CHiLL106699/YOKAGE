import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Share2, Plus, Calendar, Image, Heart, MessageCircle, Eye, TrendingUp, Facebook, Instagram, Send } from "lucide-react";

export default function SocialIntegrationPage() {
  const [activeTab, setActiveTab] = useState("posts");
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook", "instagram"]);
  const [scheduledTime, setScheduledTime] = useState("");

  const { data: posts, refetch: refetchPosts } = trpc.social.listPosts.useQuery({
    organizationId: 1,
  });

  const { data: accounts } = trpc.social.listAccounts.useQuery({
    organizationId: 1,
  });

  const createPostMutation = trpc.social.createPost.useMutation({
    onSuccess: () => {
      toast.success("貼文已排程");
      setNewPostOpen(false);
      resetForm();
      refetchPosts();
    },
    onError: (error: any) => {
      toast.error(`排程失敗: ${error.message}`);
    },
  });

  const resetForm = () => {
    setPostContent("");
    setSelectedPlatforms(["facebook", "instagram"]);
    setScheduledTime("");
  };

  const handleCreatePost = () => {
    if (!postContent) {
      toast.error("請輸入貼文內容");
      return;
    }
    createPostMutation.mutate({
      organizationId: 1,
      socialAccountId: 1, // 預設社群帳號 ID
      content: postContent,
      scheduledAt: scheduledTime ? new Date(scheduledTime).toISOString() : new Date().toISOString(),
    });
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const platformIcons: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    line: Send,
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: "草稿", color: "bg-gray-100 text-gray-800" },
    scheduled: { label: "已排程", color: "bg-blue-100 text-blue-800" },
    published: { label: "已發布", color: "bg-green-100 text-green-800" },
    failed: { label: "發布失敗", color: "bg-red-100 text-red-800" },
  };

  // 計算統計
  const totalPosts = posts?.data?.length || 0;
  const publishedPosts = posts?.data?.filter((p: any) => p.status === 'published').length || 0;
  const scheduledPosts = posts?.data?.filter((p: any) => p.status === 'scheduled').length || 0;
  const totalEngagement = posts?.data?.reduce((sum: number, p: any) => 
    sum + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0) || 0;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="h-6 w-6 text-indigo-500" />
            社群媒體整合
          </h1>
          <p className="text-muted-foreground">管理社群貼文排程與互動數據</p>
        </div>
        <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增貼文
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>建立社群貼文</DialogTitle>
              <DialogDescription>編輯內容並選擇發布平台</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>貼文內容 *</Label>
                <Textarea 
                  placeholder="輸入貼文內容..."
                  rows={5}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {postContent.length} / 2000 字元
                </p>
              </div>
              <div className="space-y-2">
                <Label>發布平台</Label>
                <div className="flex gap-2">
                  {["facebook", "instagram", "line"].map((platform) => {
                    const Icon = platformIcons[platform];
                    return (
                      <Button
                        key={platform}
                        variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePlatform(platform)}
                      >
                        <Icon className="h-4 w-4 mr-1" />
                        {platform === "facebook" ? "Facebook" : 
                         platform === "instagram" ? "Instagram" : "LINE"}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label>排程發布時間（選填）</Label>
                <Input 
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  留空則儲存為草稿
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreatePost} disabled={createPostMutation.isPending}>
                  {scheduledTime ? "排程發布" : "儲存草稿"}
                </Button>
                <Button variant="outline" onClick={() => setNewPostOpen(false)}>
                  取消
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">總貼文數</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-600">{totalPosts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">已發布</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{publishedPosts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">待發布</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{scheduledPosts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">總互動數</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-pink-600">{totalEngagement.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="posts">
            <Image className="h-4 w-4 mr-2" />
            貼文管理
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            排程日曆
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            數據分析
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <Share2 className="h-4 w-4 mr-2" />
            帳號管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>貼文列表</CardTitle>
              <CardDescription>管理所有社群貼文</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>內容預覽</TableHead>
                    <TableHead>平台</TableHead>
                    <TableHead>排程時間</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>互動</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts?.data?.map((post: any) => (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{post.content}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {(post.platforms || []).map((p: string) => {
                            const Icon = platformIcons[p] || Share2;
                            return <Icon key={p} className="h-4 w-4 text-muted-foreground" />;
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.scheduledAt 
                          ? new Date(post.scheduledAt).toLocaleString("zh-TW")
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <Badge className={statusLabels[post.status || 'draft'].color}>
                          {statusLabels[post.status || 'draft'].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" /> {post.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" /> {post.comments || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {post.views || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">編輯</Button>
                          {post.status === 'draft' && (
                            <Button size="sm">發布</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!posts?.data?.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        尚無貼文
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>排程日曆</CardTitle>
              <CardDescription>以日曆檢視貼文排程</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                  <div key={day} className="text-center font-medium py-2 bg-muted rounded">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - date.getDay() + i);
                  const dayPosts = posts?.data?.filter((p: any) => {
                    if (!p.scheduledAt) return false;
                    const pDate = new Date(p.scheduledAt);
                    return pDate.toDateString() === date.toDateString();
                  }) || [];
                  
                  return (
                    <div 
                      key={i} 
                      className={`min-h-24 p-2 border rounded ${
                        date.toDateString() === new Date().toDateString() 
                          ? 'bg-indigo-50 border-indigo-200' 
                          : ''
                      }`}
                    >
                      <div className="text-sm font-medium">{date.getDate()}</div>
                      {dayPosts.slice(0, 2).map((p: any) => (
                        <div 
                          key={p.id} 
                          className="text-xs bg-indigo-100 text-indigo-800 rounded px-1 py-0.5 mt-1 truncate"
                        >
                          {new Date(p.scheduledAt).toLocaleTimeString("zh-TW", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          +{dayPosts.length - 2} 更多
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>平台互動比較</CardTitle>
                <CardDescription>各平台互動數據</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["facebook", "instagram", "line"].map((platform) => {
                    const Icon = platformIcons[platform];
                    const engagement = Math.floor(Math.random() * 1000);
                    return (
                      <div key={platform} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium capitalize">{platform}</span>
                            <span className="text-muted-foreground">{engagement}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${(engagement / 1000) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>最佳發布時段</CardTitle>
                <CardDescription>互動率最高的時段</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: "12:00 - 13:00", rate: 85 },
                    { time: "19:00 - 20:00", rate: 78 },
                    { time: "21:00 - 22:00", rate: 72 },
                    { time: "08:00 - 09:00", rate: 65 },
                  ].map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-32 text-sm">{slot.time}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${slot.rate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{slot.rate}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>已連結帳號</CardTitle>
              <CardDescription>管理社群媒體帳號連結</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {accounts?.map((account: any) => {
                  const Icon = platformIcons[account.platform] || Share2;
                  return (
                    <Card key={account.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-medium">{account.accountName}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {account.platform}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">粉絲數</span>
                          <span className="font-medium">{account.followers?.toLocaleString() || 0}</span>
                        </div>
                        <Badge 
                          className="mt-3 w-full justify-center"
                          variant={account.isConnected ? "default" : "secondary"}
                        >
                          {account.isConnected ? "已連結" : "未連結"}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
                <Card className="border-dashed">
                  <CardContent className="pt-4 flex flex-col items-center justify-center h-full min-h-40">
                    <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">連結新帳號</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      新增連結
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
