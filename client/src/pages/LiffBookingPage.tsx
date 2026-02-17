import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ChevronRight, MapPin, Phone, Loader2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useStaffContext } from "@/hooks/useStaffContext";
import { PageLoadingSkeleton, PageError } from "@/components/ui/page-skeleton";

// LIFF 預約頁面 - 顧客端
export default function LiffBookingPage() {
  const { organizationId, isLoading: ctxLoading } = useStaffContext();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");

  // Fetch real services (products)
  const productsQuery = trpc.product.list.useQuery(
    { organizationId, limit: 50 },
    { enabled: !ctxLoading }
  );

  // Create appointment mutation
  const createAppointment = trpc.appointment.create.useMutation({
    onSuccess: () => {
      alert("預約成功！我們會盡快與您確認。");
      setSelectedService("");
      setSelectedDate("");
      setSelectedTime("");
    },
    onError: (err) => {
      alert(`預約失敗: ${err.message}`);
    },
  });

  const rawProducts = productsQuery.data;
  const productsList: any[] = Array.isArray(rawProducts) ? rawProducts : (rawProducts as any)?.data ?? [];
  const services = productsList.map((p: any) => ({
    id: String(p.id),
    name: p.name,
    duration: p.duration ?? 60,
    price: Number(p.price ?? 0),
  }));

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  ];

  const handleConfirmBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    createAppointment.mutate({
      organizationId,
      customerId: 1, // Will be resolved from LIFF auth context in production
      productId: Number(selectedService),
      appointmentDate: selectedDate,
      startTime: selectedTime,
      source: "liff",
    });
  };

  if (ctxLoading || productsQuery.isLoading) {
    return <PageLoadingSkeleton message="載入預約頁面..." />;
  }

  if (productsQuery.isError) {
    return <PageError message="無法載入服務項目" onRetry={() => productsQuery.refetch()} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold">
              Y
            </div>
            <div>
              <h1 className="font-bold text-lg">YOChiLL 醫美診所</h1>
              <p className="text-xs text-gray-500">線上預約系統</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Step 1: Select Service */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <CardTitle className="text-lg">選擇療程</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {services.length === 0 ? (
              <p className="text-gray-500 text-center py-4">目前沒有可預約的療程</p>
            ) : (
              services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedService === service.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-100 hover:border-pink-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {service.duration} 分鐘
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-pink-600">
                        NT$ {service.price.toLocaleString()}
                      </p>
                      <ChevronRight className="h-5 w-5 text-gray-300 ml-auto mt-1" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Step 2: Select Date */}
        {selectedService && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <CardTitle className="text-lg">選擇日期</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 14 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const dateStr = date.toISOString().split("T")[0];
                  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        selectedDate === dateStr
                          ? "bg-pink-500 text-white"
                          : isWeekend
                          ? "bg-gray-50 text-gray-400"
                          : "bg-white border hover:border-pink-300"
                      }`}
                    >
                      <p className="text-xs">{dayNames[date.getDay()]}</p>
                      <p className="font-bold">{date.getDate()}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select Time */}
        {selectedDate && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <CardTitle className="text-lg">選擇時段</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      selectedTime === time
                        ? "bg-pink-500 text-white"
                        : "bg-white border hover:border-pink-300"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirm Button */}
        {selectedService && selectedDate && selectedTime && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
            <Button
              onClick={handleConfirmBooking}
              disabled={createAppointment.isPending}
              className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-lg font-bold"
            >
              {createAppointment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  預約中...
                </>
              ) : (
                "確認預約"
              )}
            </Button>
          </div>
        )}

        {/* Clinic Info */}
        <Card className="mb-24">
          <CardHeader>
            <CardTitle className="text-base">診所資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <p>台北市大安區忠孝東路四段123號5樓</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <p>02-2771-1234</p>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <p>週一至週六 09:00-18:00</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
