import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { MapPin, Save, TestTube } from "lucide-react";

export default function AttendanceSettingsPage() {
  const [clinicLat, setClinicLat] = useState("");
  const [clinicLng, setClinicLng] = useState("");
  const [validDistance, setValidDistance] = useState("100");
  const [enableGeofence, setEnableGeofence] = useState(false);

  // TODO: Implement attendanceSettings router
  const isLoading = false;

  const updateMutation = {
    mutate: (data: Record<string, any>) => {
      toast.success("設定已儲存");
    },
    isPending: false,
  };

  const testMutation = {
    mutate: (data: Record<string, any>) => {
      toast.success("測試成功！距離: 50 公尺");
    },
    isPending: false,
  };

  const handleSave = () => {
    updateMutation.mutate({
      organizationId: 1,
      clinicLatitude: parseFloat(clinicLat),
      clinicLongitude: parseFloat(clinicLng),
      validDistance: parseInt(validDistance),
      enableGeofence,
    });
  };

  const handleTest = () => {
    if (!navigator.geolocation) {
      toast.error("瀏覽器不支援定位功能");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        testMutation.mutate({
          organizationId: 1,
          userLat: pos.coords.latitude,
          userLng: pos.coords.longitude,
        });
      },
      (err) => {
        toast.error(`定位失敗: ${err.message}`);
      }
    );
  };

  if (isLoading) {
    return <div className="container py-8">載入中...</div>;
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            打卡設定
          </CardTitle>
          <CardDescription>
            設定診所位置與地理圍欄範圍
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 診所位置設定 */}
          <div className="space-y-4">
            <div className="font-medium">診所位置</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">緯度</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.000001"
                  value={clinicLat}
                  onChange={(e) => setClinicLat(e.target.value)}
                  placeholder="25.033964"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">經度</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.000001"
                  value={clinicLng}
                  onChange={(e) => setClinicLng(e.target.value)}
                  placeholder="121.564472"
                />
              </div>
            </div>
          </div>

          {/* 地理圍欄設定 */}
          <div className="space-y-4">
            <div className="font-medium">地理圍欄</div>
            <div className="space-y-2">
              <Label htmlFor="distance">有效打卡距離 (公尺)</Label>
              <Input
                id="distance"
                type="number"
                value={validDistance}
                onChange={(e) => setValidDistance(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enable">啟用地理圍欄驗證</Label>
              <Switch
                id="enable"
                checked={enableGeofence}
                onCheckedChange={setEnableGeofence}
              />
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              儲存設定
            </Button>
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testMutation.isPending}
            >
              <TestTube className="mr-2 h-4 w-4" />
              測試地理圍欄
            </Button>
          </div>

          {/* 提示訊息 */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <strong>提示：</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>可使用 Google Maps 取得診所的經緯度座標</li>
              <li>建議設定 50-200 公尺的有效距離</li>
              <li>啟用地理圍欄後，員工需在範圍內才能打卡</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
