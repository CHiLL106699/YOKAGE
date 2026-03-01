import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Gift, Rocket } from 'lucide-react';
import DashboardLayout from "@/components/DashboardLayout";

const organizationId = 1; // TODO: from context

export default function DashboardGamification() {
  const { data: campaigns, isLoading, error } = (trpc as any).game.list.useQuery({ organizationId });

  const renderContent = () => {
    if (isLoading) return <QueryLoading />;
    if (error) return <QueryError message={error.message} />;
    if (!campaigns || campaigns.length === 0) {
      return <p>目前沒有進行中的遊戲化活動。</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign: any) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center gap-2"><Rocket className="w-5 h-5 text-primary"/>{campaign.name}</CardTitle>
                <Badge variant={campaign.isActive ? "default" : "secondary"}>
                  {campaign.isActive ? "進行中" : "已結束"}
                </Badge>
              </div>
              <CardDescription>{campaign.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">期間：{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</p>
                <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4"/> <span>獎品預覽</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Award className="w-4 h-4"/> <span>排行榜</span>
                </div>
              </div>
              <Button className="mt-4 w-full">查看詳情</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout title="遊戲化儀表板" description="管理與查看所有遊戲化活動">
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>老虎機設定</CardTitle>
                <CardDescription>管理老虎機的圖標與賠率</CardDescription>
            </CardHeader>
            <CardContent>
                <p>此區域將用於設定老虎機的獎品、圖標和賠率。</p>
                 <Button className="mt-4">管理老虎機</Button>
            </CardContent>
        </Card>
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">進行中的活動</h2>
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  );
}
