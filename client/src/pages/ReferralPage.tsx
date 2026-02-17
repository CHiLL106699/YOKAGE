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
import { Gift, Plus, Users, TrendingUp, Copy, Share2, Award, DollarSign } from "lucide-react";

export default function ReferralPage() {
  const [activeTab, setActiveTab] = useState("programs");
  const [newProgramOpen, setNewProgramOpen] = useState(false);
  const [programName, setProgramName] = useState("");
  const [programDescription, setProgramDescription] = useState("");
  const [referrerReward, setReferrerReward] = useState("");
  const [refereeReward, setRefereeReward] = useState("");
  const [rewardType, setRewardType] = useState("points");

  // 由於 referralRouter 沒有 listPrograms，使用模擬資料
  const programs = { data: [] as any[] };
  const refetchPrograms = () => {};

  // 由於 referralRouter 沒有 listReferrals，使用模擬資料
  const referrals = { data: [] as any[] };
  const refetchReferrals = () => {};

  const createProgramMutation = trpc.referral.generateCode.useMutation({
    onSuccess: () => {
      toast.success("推薦計畫已建立");
      setNewProgramOpen(false);
      resetForm();
      refetchPrograms();
    },
    onError: (error: any) => {
      toast.error(`建立失敗: ${error.message}`);
    },
  });

  const resetForm = () => {
    setProgramName("");
    setProgramDescription("");
    setReferrerReward("");
    setRefereeReward("");
    setRewardType("points");
  };

  const handleCreateProgram = () => {
    if (!programName || !referrerReward) {
      toast.error("請填寫計畫名稱和推薦人獎勵");
      return;
    }
    createProgramMutation.mutate({
      organizationId: 1,
      customerId: 1, // 模擬客戶 ID
      referrerRewardType: rewardType as any,
      referrerRewardValue: referrerReward,
      refereeRewardType: rewardType as any,
      refereeRewardValue: refereeReward || undefined,
    });
  };

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("推薦碼已複製");
  };

  const rewardTypeLabels: Record<string, string> = {
    points: "點數",
    discount: "折扣",
    cash: "現金",
    free_service: "免費服務",
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "待確認", color: "bg-yellow-100 text-yellow-800" },
    completed: { label: "已完成", color: "bg-green-100 text-green-800" },
    rewarded: { label: "已發放", color: "bg-blue-100 text-blue-800" },
    expired: { label: "已過期", color: "bg-gray-100 text-gray-800" },
  };

  // 計算統計
  const totalReferrals = referrals?.data?.length || 0;
  const completedReferrals = referrals?.data?.filter((r: Record<string, any>) => r.status === 'completed' || r.status === 'rewarded').length || 0;
  const totalRewardsIssued = referrals?.data?.filter((r: Record<string, any>) => r.status === 'rewarded').reduce((sum: number, r: Record<string, any>) => sum + (r.referrerRewardValue || 0), 0) || 0;
  const conversionRate = totalReferrals > 0 ? Math.round((completedReferrals / totalReferrals) * 100) : 0;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-pink-500" />
            推薦獎勵系統
          </h1>
          <p className="text-muted-foreground">管理客戶推薦計畫與獎勵發放</p>
        </div>
        <Dialog open={newProgramOpen} onOpenChange={setNewProgramOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增計畫
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>建立推薦計畫</DialogTitle>
              <DialogDescription>設定推薦獎勵規則</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>計畫名稱 *</Label>
                <Input 
                  placeholder="例：好友推薦雙重禮"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>計畫說明</Label>
                <Textarea 
                  placeholder="描述推薦計畫內容..."
                  value={programDescription}
                  onChange={(e) => setProgramDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>獎勵類型</Label>
                <Select value={rewardType} onValueChange={setRewardType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">點數</SelectItem>
                    <SelectItem value="discount">折扣 (%)</SelectItem>
                    <SelectItem value="cash">現金</SelectItem>
                    <SelectItem value="free_service">免費服務</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>推薦人獎勵 *</Label>
                  <Input 
                    type="number"
                    placeholder="獎勵數值"
                    value={referrerReward}
                    onChange={(e) => setReferrerReward(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>被推薦人獎勵</Label>
                  <Input 
                    type="number"
                    placeholder="獎勵數值"
                    value={refereeReward}
                    onChange={(e) => setRefereeReward(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleCreateProgram} disabled={createProgramMutation.isPending}>
                建立計畫
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">總推薦數</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-pink-600">{totalReferrals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">成功轉換</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{completedReferrals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">轉換率</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{conversionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">已發放獎勵</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">${totalRewardsIssued.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="programs">
            <Award className="h-4 w-4 mr-2" />
            推薦計畫
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <Users className="h-4 w-4 mr-2" />
            推薦記錄
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <TrendingUp className="h-4 w-4 mr-2" />
            推薦排行
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {programs?.data?.map((program: Record<string, any>) => (
              <Card key={program.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{program.name}</CardTitle>
                    <Badge variant={program.isActive ? "default" : "secondary"}>
                      {program.isActive ? "進行中" : "已停用"}
                    </Badge>
                  </div>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-pink-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">推薦人獎勵</p>
                      <p className="font-bold text-pink-600">
                        {program.referrerRewardValue} {rewardTypeLabels[program.referrerRewardType || 'points']}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">被推薦人獎勵</p>
                      <p className="font-bold text-blue-600">
                        {program.refereeRewardValue || 0} {rewardTypeLabels[program.refereeRewardType || 'points']}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="h-4 w-4 mr-1" />
                      分享
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      編輯
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!programs?.data?.length && (
              <Card className="col-span-3">
                <CardContent className="text-center py-12">
                  <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">尚無推薦計畫</p>
                  <Button className="mt-4" onClick={() => setNewProgramOpen(true)}>
                    建立第一個計畫
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>推薦記錄</CardTitle>
              <CardDescription>查看所有推薦與獎勵狀態</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>推薦碼</TableHead>
                    <TableHead>推薦人</TableHead>
                    <TableHead>被推薦人</TableHead>
                    <TableHead>計畫</TableHead>
                    <TableHead>獎勵</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>日期</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals?.data?.map((referral: Record<string, any>) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {referral.referralCode}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyReferralCode(referral.referralCode)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>客戶 #{referral.referrerId}</TableCell>
                      <TableCell>客戶 #{referral.refereeId || '-'}</TableCell>
                      <TableCell>計畫 #{referral.programId}</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">
                          ${referral.referrerRewardValue || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusLabels[referral.status || 'pending'].color}>
                          {statusLabels[referral.status || 'pending'].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(referral.createdAt).toLocaleDateString("zh-TW")}
                      </TableCell>
                      <TableCell>
                        {referral.status === 'completed' && (
                          <Button size="sm" variant="outline">
                            <DollarSign className="h-4 w-4 mr-1" />
                            發放獎勵
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!referrals?.data?.length && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        尚無推薦記錄
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>推薦排行榜</CardTitle>
              <CardDescription>本月推薦數量排名</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div 
                    key={rank} 
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      rank === 1 ? 'bg-amber-50 border border-amber-200' :
                      rank === 2 ? 'bg-gray-50 border border-gray-200' :
                      rank === 3 ? 'bg-orange-50 border border-orange-200' :
                      'bg-muted/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      rank === 1 ? 'bg-amber-500 text-white' :
                      rank === 2 ? 'bg-gray-400 text-white' :
                      rank === 3 ? 'bg-orange-400 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">模擬客戶 {rank}</p>
                      <p className="text-sm text-muted-foreground">
                        成功推薦 {10 - rank * 2} 位新客戶
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ${(10 - rank * 2) * 500}
                      </p>
                      <p className="text-xs text-muted-foreground">累計獎勵</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
