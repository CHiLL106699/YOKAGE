
'use client';

import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { QueryLoading, QueryError } from '@/components/ui/query-state';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';

const organizationId = 1; // TODO: from context

const CreateCampaignModal = ({ onCampaignCreated }: { onCampaignCreated: () => void }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [campaignType, setCampaignType] = useState('');

  const createCampaignMutation = (trpc as any).marketing.createCampaign.useMutation({
    onSuccess: () => {
      toast.success('行銷活動已成功建立');
      onCampaignCreated();
      setOpen(false);
      setName('');
      setCampaignType('');
    },
    onError: (error: any) => {
      toast.error(`建立失敗: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!name) {
      toast.warning('請輸入活動名稱');
      return;
    }
    createCampaignMutation.mutate({ organizationId, name, campaignType });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          建立新活動
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>建立新的行銷活動</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              活動名稱
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="例如：夏季美白特惠"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              活動類型
            </Label>
            <Input
              id="type"
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className="col-span-3"
              placeholder="例如：折扣、體驗券"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              取消
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={createCampaignMutation.isLoading}>
            {createCampaignMutation.isLoading ? '建立中...' : '確認建立'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CampaignList = ({ data, onCampaignCreated }: { data: any[], onCampaignCreated: () => void }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'planned':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>行銷活動列表</CardTitle>
        <CreateCampaignModal onCampaignCreated={onCampaignCreated} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>活動名稱</TableHead>
              <TableHead>類型</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>開始日期</TableHead>
              <TableHead>結束日期</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.campaignType || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
                  </TableCell>
                  <TableCell>{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  目前沒有任何行銷活動。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default function DashboardMarketing() {
  const { data, isLoading, error, refetch } = (trpc as any).marketing.listCampaigns.useQuery({ organizationId });

  const handleCampaignCreated = () => {
    refetch();
  };

  return (
    <DashboardLayout title="行銷管理">
      <div className="space-y-4">
        {isLoading && <QueryLoading />}
        {error && <QueryError message={error.message} onRetry={refetch} />}
        {data && <CampaignList data={data} onCampaignCreated={handleCampaignCreated} />}
      </div>
    </DashboardLayout>
  );
}
