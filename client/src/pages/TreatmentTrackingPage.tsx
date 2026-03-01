
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { QueryLoading, QueryError } from "@/components/ui/query-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
// Image component replaced with standard img tag

// Define types for better code quality
type TreatmentCase = {
  id: string;
  customerName: string;
  treatmentName: string;
  status: '追蹤中' | '已完成' | '需注意';
  lastUpdate: string;
  progress: number;
  photos: {
    before: string[];
    after: string[];
  };
  notes: string;
};

const TreatmentDetailModal = ({ caseData }: { caseData: TreatmentCase }) => {
  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>{caseData.customerName} - {caseData.treatmentName}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <h3 className="font-bold text-lg mb-2">術前照片</h3>
          <Carousel className="w-full">
            <CarouselContent>
              {caseData.photos.before.map((photo, index) => (
                <CarouselItem key={index}>
                  <img src={photo} alt={`術前 ${index + 1}`} width={400} height={300} className="rounded-lg object-cover w-full" loading="lazy" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">術後照片</h3>
          <Carousel className="w-full">
            <CarouselContent>
              {caseData.photos.after.map((photo, index) => (
                <CarouselItem key={index}>
                  <img src={photo} alt={`術後 ${index + 1}`} width={400} height={300} className="rounded-lg object-cover w-full" loading="lazy" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="font-bold text-lg mb-2">追蹤備註</h3>
        <p className="text-gray-600 whitespace-pre-wrap">{caseData.notes}</p>
      </div>
    </DialogContent>
  );
};

const TreatmentTrackingPage = () => {
  const organizationId = 1; // TODO: from context
  const { data: cases, isLoading, isError, error } = (trpc as any).treatment.list.useQuery({ organizationId });

  const getStatusBadgeVariant = (status: TreatmentCase['status']) => {
    switch (status) {
      case '已完成':
        return 'green';
      case '需注意':
        return 'destructive';
      case '追蹤中':
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold mb-6">療程追蹤</h1>
          <QueryLoading />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold mb-6">療程追蹤</h1>
          <QueryError error={error.message} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">療程追蹤</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cases?.map((caseData: TreatmentCase) => (
            <Dialog key={caseData.id}>
              <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{caseData.customerName}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(caseData.status)}>{caseData.status}</Badge>
                  </div>
                  <CardDescription>{caseData.treatmentName}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${caseData.progress}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-500">進度: {caseData.progress}%</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">更新於: {caseData.lastUpdate}</p>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">查看詳情</Button>
                  </DialogTrigger>
                </CardFooter>
              </Card>
              <TreatmentDetailModal caseData={caseData} />
            </Dialog>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TreatmentTrackingPage;
