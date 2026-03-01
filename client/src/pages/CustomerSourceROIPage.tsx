import { useState } from "react";
import { safeDate, safeDateTime, safeStr, safeTime, safeMoney } from '@/lib/safeFormat';
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Users, 
  TrendingUp, 
  DollarSign,
  Target,
  Plus,
  BarChart3,
  PieChart,
  Megaphone,
  Share2,
  Globe,
  MessageCircle
} from "lucide-react";

export default function CustomerSourceROIPage() {
  const [organizationId] = useState(1);
  const [isAddCampaignOpen, setIsAddCampaignOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    campaignType: "facebook" as "facebook" | "google" | "line" | "instagram" | "referral" | "event" | "other",
    budget: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  // 行銷活動列表
  const { data: campaigns, refetch: refetchCampaigns } = trpc.marketing.listCampaigns.useQuery({
    organizationId,
  });

  // 來源 ROI 分析
  const { data: sourceROI } = trpc.marketing.getSourceROI.useQuery({
    organizationId,
  });

  // 新增行銷活動
  const createCampaign = trpc.marketing.createCampaign.useMutation({
    onSuccess: () => {
      toast.success("行銷活動已新增");
      setIsAddCampaignOpen(false);
      refetchCampaigns();
      setNewCampaign({
        name: "",
        campaignType: "facebook",
        budget: "",
        startDate: "",
        endDate: "",
        description: "",
      });
    },
    onError: (error) => {
      toast.error(`新增失敗：${error.message}`);
    },
  });

  const handleAddCampaign = () => {
    if (!newCampaign.name) {
      toast.error("請填寫活動名稱");
      return;
    }

    createCampaign.mutate({
      organizationId,
      name: newCampaign.name,
      campaignType: newCampaign.campaignType,
      budget: newCampaign.budget || undefined,
      startDate: newCampaign.startDate || undefined,
      endDate: newCampaign.endDate || undefined,
      description: newCampaign.description || undefined,
    });
  };

  const getCampaignTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      facebook: <Globe className="h-4 w-4 text-blue-600" />,
      google: <Globe className="h-4 w-4 text-red-500" />,
      line: <MessageCircle className="h-4 w-4 text-green-500" />,
      instagram: <Globe className="h-4 w-4 text-pink-500" />,
      referral: <Share2 className="h-4 w-4 text-purple-500" />,
      event: <Megaphone className="h-4 w-4 text-orange-500" />,
      other: <Target className="h-4 w-4 text-gray-500" />,
    };
    return icons[type] || icons.other;
  };

  const getCampaignTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      facebook: "Facebook 廣告",
      google: "Google 廣告",
      line: "LINE 行銷",
      instagram: "Instagram 廣告",
      referral: "轉介紹",
      event: "活動行銷",
      other: "其他",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "草稿", variant: "outline" },
      active: { label: "進行中", variant: "default" },
      paused: { label: "暫停", variant: "secondary" },
      completed: { label: "已結束", variant: "destructive" },
    };
    return badges[status] || { label: status, variant: "outline" as const };
  };

  // 計算總體統計
  const totalStats = sourceROI?.reduce((acc: Record<string, any>, s: Record<string, any>) => {
    acc.totalCustomers += s.customerCount;
    acc.totalValue += s.totalLifetimeValue;
    return acc;
  }, { totalCustomers: 0, totalValue: 0 }) || { totalCustomers: 0, totalValue: 0 };

  const averageLTV = totalStats.totalCustomers > 0 
    ? Math.round(totalStats.totalValue / totalStats.totalCustomers) 
    : 0;

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">客戶來源與 ROI 分析</h1>
          <p className="text-muted-foreground">追蹤行銷活動成效，分析客戶來源與終身價值</p>
        </div>
        <Dialog open={isAddCampaignOpen} onOpenChange={setIsAddCampaignOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增活動
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增行銷活動</DialogTitle>
              <DialogDescription>建立新的行銷活動以追蹤客戶來源</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>活動名稱</Label>
                <Input
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例：2024 春季優惠活動"
                />
              </div>
              <div className="space-y-2">
                <Label>活動類型</Label>
                <Select
                  value={newCampaign.campaignType}
                  onValueChange={(value: any) => setNewCampaign(prev => ({ ...prev, campaignType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook 廣告</SelectItem>
                    <SelectItem value="google">Google 廣告</SelectItem>
                    <SelectItem value="line">LINE 行銷</SelectItem>
                    <SelectItem value="instagram">Instagram 廣告</SelectItem>
                    <SelectItem value="referral">轉介紹</SelectItem>
                    <SelectItem value="event">活動行銷</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>預算</Label>
                <Input
                  type="number"
                  value={newCampaign.budget}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="選填"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>開始日期</Label>
                  <Input
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>結束日期</Label>
                  <Input
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Input
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="選填"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCampaignOpen(false)}>取消</Button>
              <Button onClick={handleAddCampaign} disabled={createCampaign.isPending}>
                {createCampaign.isPending ? "處理中..." : "新增"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 總覽統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總客戶數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">來自所有行銷渠道</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總終身價值</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">所有客戶累計消費</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均 LTV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageLTV.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">每位客戶平均終身價值</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活動數量</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns?.filter((c: Record<string, any>) => c.status === 'active').length || 0} 個進行中
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">來源分析</TabsTrigger>
          <TabsTrigger value="campaigns">行銷活動</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 來源分布 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  客戶來源分布
                </CardTitle>
                <CardDescription>各渠道帶來的客戶數量</CardDescription>
              </CardHeader>
              <CardContent>
                {sourceROI && sourceROI.length > 0 ? (
                  <div className="space-y-4">
                    {sourceROI.map((source: Record<string, any>) => {
                      const percentage = totalStats.totalCustomers > 0 
                        ? Math.round((source.customerCount / totalStats.totalCustomers) * 100) 
                        : 0;
                      return (
                        <div key={source.sourceType} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getCampaignTypeIcon(source.sourceType)}
                              <span className="font-medium">{getCampaignTypeLabel(source.sourceType)}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {source.customerCount} 人 ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">尚無來源資料</p>
                    <p className="text-sm">開始追蹤客戶來源以查看分析</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 來源 ROI */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  來源終身價值
                </CardTitle>
                <CardDescription>各渠道客戶的平均終身價值</CardDescription>
              </CardHeader>
              <CardContent>
                {sourceROI && sourceROI.length > 0 ? (
                  <div className="space-y-4">
                    {sourceROI
                      .sort((a: Record<string, any>, b: Record<string, any>) => b.averageLifetimeValue - a.averageLifetimeValue)
                      .map((source: Record<string, any>) => (
                        <div key={source.sourceType} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getCampaignTypeIcon(source.sourceType)}
                            <div>
                              <p className="font-medium">{getCampaignTypeLabel(source.sourceType)}</p>
                              <p className="text-sm text-muted-foreground">
                                {source.customerCount} 位客戶
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              ${Math.round(source.averageLifetimeValue).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">平均 LTV</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">尚無 ROI 資料</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">行銷活動列表</CardTitle>
              <CardDescription>管理所有行銷活動與追蹤成效</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns && campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign: Record<string, any>) => {
                    const statusBadge = getStatusBadge(campaign.status);
                    return (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {getCampaignTypeIcon(campaign.campaignType)}
                          </div>
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {getCampaignTypeLabel(campaign.campaignType)}
                              {campaign.startDate && ` · ${safeDate(campaign.startDate)}`}
                              {campaign.endDate && ` - ${safeDate(campaign.endDate)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {campaign.budget && (
                            <div className="text-right">
                              <p className="font-medium">${Number(campaign.budget).toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">預算</p>
                            </div>
                          )}
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">尚無行銷活動</p>
                  <p className="text-sm">點擊「新增活動」開始追蹤行銷成效</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
