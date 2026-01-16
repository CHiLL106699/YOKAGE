import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Settings, 
  Building2,
  Clock,
  Bell,
  Shield,
  Database,
  Users,
  CreditCard,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  Upload,
  Loader2,
  Key,
  Link2,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  
  // 基本設定
  const [clinicInfo, setClinicInfo] = useState({
    name: "YOChiLL 醫美診所",
    phone: "02-1234-5678",
    email: "contact@yochill.com",
    address: "台北市大安區忠孝東路四段123號5樓",
    description: "專業醫美診所，提供玻尿酸、肉毒、雷射等多項療程服務。",
    logo: ""
  });

  // 營業時間
  const [businessHours, setBusinessHours] = useState([
    { day: "週一", open: "12:00", close: "20:30", isOpen: true },
    { day: "週二", open: "12:00", close: "20:30", isOpen: true },
    { day: "週三", open: "12:00", close: "20:30", isOpen: true },
    { day: "週四", open: "12:00", close: "20:30", isOpen: true },
    { day: "週五", open: "12:00", close: "20:30", isOpen: true },
    { day: "週六", open: "10:30", close: "19:00", isOpen: true },
    { day: "週日", open: "", close: "", isOpen: false }
  ]);

  // 通知設定
  const [notifications, setNotifications] = useState({
    appointmentReminder: true,
    appointmentReminderHours: 24,
    aftercareReminder: true,
    aftercareReminderDays: 3,
    birthdayGreeting: true,
    promotionPush: true,
    lowInventoryAlert: true,
    lowInventoryThreshold: 10
  });

  // API 整合狀態
  const [integrations, setIntegrations] = useState({
    lineMessaging: { connected: true, channelId: "1234567890" },
    linePay: { connected: false, channelId: "" },
    tappay: { connected: true, merchantId: "TP12345" },
    ecpay: { connected: false, merchantId: "" }
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    toast.success("設定已儲存");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">系統設定</h1>
            <p className="text-gray-500 mt-1">管理診所基本資訊與系統設定</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                儲存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                儲存設定
              </>
            )}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="general">
              <Building2 className="w-4 h-4 mr-2" />
              基本資訊
            </TabsTrigger>
            <TabsTrigger value="hours">
              <Clock className="w-4 h-4 mr-2" />
              營業時間
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              通知設定
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Link2 className="w-4 h-4 mr-2" />
              API 整合
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              安全設定
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>診所基本資訊</CardTitle>
                <CardDescription>設定診所的基本資訊，這些資訊將顯示在顧客端頁面</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>診所名稱</Label>
                    <Input 
                      value={clinicInfo.name}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>聯絡電話</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        className="pl-10"
                        value={clinicInfo.phone}
                        onChange={(e) => setClinicInfo({ ...clinicInfo, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>電子郵件</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        className="pl-10"
                        type="email"
                        value={clinicInfo.email}
                        onChange={(e) => setClinicInfo({ ...clinicInfo, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>診所地址</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        className="pl-10"
                        value={clinicInfo.address}
                        onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>診所簡介</Label>
                  <Textarea 
                    rows={3}
                    value={clinicInfo.description}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>診所 Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      上傳 Logo
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">建議尺寸：200x200px，支援 PNG、JPG 格式</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Hours */}
          <TabsContent value="hours" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>營業時間設定</CardTitle>
                <CardDescription>設定診所的營業時間，將影響預約系統的可選時段</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessHours.map((hour, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16">
                        <span className="font-medium">{hour.day}</span>
                      </div>
                      <Switch 
                        checked={hour.isOpen}
                        onCheckedChange={(checked) => {
                          const newHours = [...businessHours];
                          newHours[idx].isOpen = checked;
                          setBusinessHours(newHours);
                        }}
                      />
                      {hour.isOpen ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input 
                            type="time"
                            value={hour.open}
                            onChange={(e) => {
                              const newHours = [...businessHours];
                              newHours[idx].open = e.target.value;
                              setBusinessHours(newHours);
                            }}
                            className="w-32"
                          />
                          <span className="text-gray-500">至</span>
                          <Input 
                            type="time"
                            value={hour.close}
                            onChange={(e) => {
                              const newHours = [...businessHours];
                              newHours[idx].close = e.target.value;
                              setBusinessHours(newHours);
                            }}
                            className="w-32"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400">休診</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>自動通知設定</CardTitle>
                <CardDescription>設定系統自動發送的通知訊息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 預約提醒 */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-500" />
                      <h4 className="font-medium">預約提醒</h4>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      在預約時間前自動發送提醒訊息給顧客
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number"
                        className="w-20"
                        value={notifications.appointmentReminderHours}
                        onChange={(e) => setNotifications({ 
                          ...notifications, 
                          appointmentReminderHours: parseInt(e.target.value) 
                        })}
                        disabled={!notifications.appointmentReminder}
                      />
                      <span className="text-sm text-gray-500">小時前</span>
                    </div>
                    <Switch 
                      checked={notifications.appointmentReminder}
                      onCheckedChange={(checked) => setNotifications({ 
                        ...notifications, 
                        appointmentReminder: checked 
                      })}
                    />
                  </div>
                </div>

                {/* 術後關懷 */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-pink-500" />
                      <h4 className="font-medium">術後關懷提醒</h4>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      療程完成後自動發送關懷訊息
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number"
                        className="w-20"
                        value={notifications.aftercareReminderDays}
                        onChange={(e) => setNotifications({ 
                          ...notifications, 
                          aftercareReminderDays: parseInt(e.target.value) 
                        })}
                        disabled={!notifications.aftercareReminder}
                      />
                      <span className="text-sm text-gray-500">天後</span>
                    </div>
                    <Switch 
                      checked={notifications.aftercareReminder}
                      onCheckedChange={(checked) => setNotifications({ 
                        ...notifications, 
                        aftercareReminder: checked 
                      })}
                    />
                  </div>
                </div>

                {/* 生日祝福 */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-yellow-500" />
                      <h4 className="font-medium">生日祝福</h4>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      在顧客生日當天自動發送祝福訊息
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.birthdayGreeting}
                    onCheckedChange={(checked) => setNotifications({ 
                      ...notifications, 
                      birthdayGreeting: checked 
                    })}
                  />
                </div>

                {/* 庫存警示 */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <h4 className="font-medium">低庫存警示</h4>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      當產品庫存低於閾值時發送通知
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">低於</span>
                      <Input 
                        type="number"
                        className="w-20"
                        value={notifications.lowInventoryThreshold}
                        onChange={(e) => setNotifications({ 
                          ...notifications, 
                          lowInventoryThreshold: parseInt(e.target.value) 
                        })}
                        disabled={!notifications.lowInventoryAlert}
                      />
                      <span className="text-sm text-gray-500">件</span>
                    </div>
                    <Switch 
                      checked={notifications.lowInventoryAlert}
                      onCheckedChange={(checked) => setNotifications({ 
                        ...notifications, 
                        lowInventoryAlert: checked 
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Integrations */}
          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API 整合狀態</CardTitle>
                <CardDescription>管理第三方服務的 API 連接</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* LINE Messaging API */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">LINE Messaging API</h4>
                      <p className="text-sm text-gray-500">
                        {integrations.lineMessaging.connected 
                          ? `Channel ID: ${integrations.lineMessaging.channelId}`
                          : "尚未連接"
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrations.lineMessaging.connected ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        已連接
                      </Badge>
                    ) : (
                      <Badge variant="outline">未連接</Badge>
                    )}
                    <Button variant="outline" size="sm">設定</Button>
                  </div>
                </div>

                {/* LINE Pay */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">LINE Pay</h4>
                      <p className="text-sm text-gray-500">
                        {integrations.linePay.connected 
                          ? `Channel ID: ${integrations.linePay.channelId}`
                          : "尚未連接"
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrations.linePay.connected ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        已連接
                      </Badge>
                    ) : (
                      <Badge variant="outline">未連接</Badge>
                    )}
                    <Button variant="outline" size="sm">設定</Button>
                  </div>
                </div>

                {/* TapPay */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">TapPay 金流</h4>
                      <p className="text-sm text-gray-500">
                        {integrations.tappay.connected 
                          ? `商店代號: ${integrations.tappay.merchantId}`
                          : "尚未連接"
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrations.tappay.connected ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        已連接
                      </Badge>
                    ) : (
                      <Badge variant="outline">未連接</Badge>
                    )}
                    <Button variant="outline" size="sm">設定</Button>
                  </div>
                </div>

                {/* ECPay */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">綠界 ECPay</h4>
                      <p className="text-sm text-gray-500">
                        {integrations.ecpay.connected 
                          ? `商店代號: ${integrations.ecpay.merchantId}`
                          : "尚未連接"
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrations.ecpay.connected ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        已連接
                      </Badge>
                    ) : (
                      <Badge variant="outline">未連接</Badge>
                    )}
                    <Button variant="outline" size="sm">設定</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>安全設定</CardTitle>
                <CardDescription>管理系統安全與存取權限</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <h4 className="font-medium">雙重驗證 (2FA)</h4>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      登入時需要額外的驗證碼
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-purple-500" />
                      <h4 className="font-medium">API 金鑰管理</h4>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      管理系統 API 存取金鑰
                    </p>
                  </div>
                  <Button variant="outline" size="sm">管理金鑰</Button>
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-green-500" />
                      <h4 className="font-medium">資料備份</h4>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      最後備份時間：2024-01-15 03:00
                    </p>
                  </div>
                  <Button variant="outline" size="sm">立即備份</Button>
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-500" />
                      <h4 className="font-medium">登入記錄</h4>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      查看所有使用者的登入活動
                    </p>
                  </div>
                  <Button variant="outline" size="sm">查看記錄</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
