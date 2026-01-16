import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Palette,
  Image,
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  MessageCircle,
  Upload,
  Eye,
  Save,
  RefreshCw,
} from "lucide-react";

export default function WhiteLabelPage() {
  const [brandSettings, setBrandSettings] = useState({
    // 基本資訊
    clinicName: "曜醫美診所",
    clinicNameEn: "YO Aesthetic Clinic",
    slogan: "專業醫美，美麗蛻變",
    description: "提供專業的醫學美容服務，讓您由內而外散發自信光采。",
    
    // 聯絡資訊
    phone: "02-1234-5678",
    email: "contact@yochill.com",
    address: "台北市信義區信義路五段7號",
    businessHours: "週一至週六 10:00-20:00",
    
    // 社群連結
    facebook: "https://facebook.com/yochill",
    instagram: "https://instagram.com/yochill",
    line: "@yochill",
    
    // 品牌色彩
    primaryColor: "#8B5CF6",
    secondaryColor: "#EC4899",
    accentColor: "#F59E0B",
    backgroundColor: "#FFFFFF",
    textColor: "#1F2937",
    
    // 功能開關
    showSocialLinks: true,
    showBusinessHours: true,
    enableOnlineBooking: true,
    enableOnlineShop: true,
    enableMemberPoints: true,
    
    // 自訂網域
    customDomain: "",
    useCustomDomain: false,
  });

  const handleSave = () => {
    toast.success("品牌設定已儲存");
  };

  const handlePreview = () => {
    toast.info("預覽功能開發中");
  };

  const handleLogoUpload = () => {
    toast.info("Logo 上傳功能開發中");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">白標方案設定</h1>
            <p className="text-muted-foreground mt-1">自訂您的品牌外觀與設定</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              預覽
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              儲存設定
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">基本資訊</TabsTrigger>
            <TabsTrigger value="branding">品牌視覺</TabsTrigger>
            <TabsTrigger value="contact">聯絡資訊</TabsTrigger>
            <TabsTrigger value="features">功能設定</TabsTrigger>
            <TabsTrigger value="domain">自訂網域</TabsTrigger>
          </TabsList>

          {/* 基本資訊 */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">診所基本資訊</CardTitle>
                <CardDescription>設定診所的基本資訊，將顯示在顧客端介面</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">診所名稱（中文）</Label>
                    <Input
                      id="clinicName"
                      value={brandSettings.clinicName}
                      onChange={(e) => setBrandSettings({ ...brandSettings, clinicName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinicNameEn">診所名稱（英文）</Label>
                    <Input
                      id="clinicNameEn"
                      value={brandSettings.clinicNameEn}
                      onChange={(e) => setBrandSettings({ ...brandSettings, clinicNameEn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slogan">品牌標語</Label>
                  <Input
                    id="slogan"
                    value={brandSettings.slogan}
                    onChange={(e) => setBrandSettings({ ...brandSettings, slogan: e.target.value })}
                    placeholder="簡短的品牌標語"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">診所介紹</Label>
                  <Textarea
                    id="description"
                    value={brandSettings.description}
                    onChange={(e) => setBrandSettings({ ...brandSettings, description: e.target.value })}
                    rows={4}
                    placeholder="診所的詳細介紹..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 品牌視覺 */}
          <TabsContent value="branding" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Logo 設定
                  </CardTitle>
                  <CardDescription>上傳您的品牌 Logo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-lg flex items-center justify-center mb-4">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline" onClick={handleLogoUpload}>
                      <Upload className="h-4 w-4 mr-2" />
                      上傳 Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      建議尺寸：200x200px，支援 PNG、JPG、SVG
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        <Image className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button variant="outline" size="sm">
                        上傳 Favicon
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    品牌色彩
                  </CardTitle>
                  <CardDescription>自訂您的品牌色彩</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">主色調</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={brandSettings.primaryColor}
                        onChange={(e) => setBrandSettings({ ...brandSettings, primaryColor: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={brandSettings.primaryColor}
                        onChange={(e) => setBrandSettings({ ...brandSettings, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">次要色調</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={brandSettings.secondaryColor}
                        onChange={(e) => setBrandSettings({ ...brandSettings, secondaryColor: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={brandSettings.secondaryColor}
                        onChange={(e) => setBrandSettings({ ...brandSettings, secondaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">強調色</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={brandSettings.accentColor}
                        onChange={(e) => setBrandSettings({ ...brandSettings, accentColor: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={brandSettings.accentColor}
                        onChange={(e) => setBrandSettings({ ...brandSettings, accentColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* 色彩預覽 */}
                  <div className="pt-4 border-t">
                    <Label className="mb-2 block">色彩預覽</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-12 h-12 rounded-lg"
                        style={{ backgroundColor: brandSettings.primaryColor }}
                      />
                      <div
                        className="w-12 h-12 rounded-lg"
                        style={{ backgroundColor: brandSettings.secondaryColor }}
                      />
                      <div
                        className="w-12 h-12 rounded-lg"
                        style={{ backgroundColor: brandSettings.accentColor }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 聯絡資訊 */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">聯絡資訊</CardTitle>
                <CardDescription>設定診所的聯絡方式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      電話
                    </Label>
                    <Input
                      id="phone"
                      value={brandSettings.phone}
                      onChange={(e) => setBrandSettings({ ...brandSettings, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={brandSettings.email}
                      onChange={(e) => setBrandSettings({ ...brandSettings, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    地址
                  </Label>
                  <Input
                    id="address"
                    value={brandSettings.address}
                    onChange={(e) => setBrandSettings({ ...brandSettings, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessHours">營業時間</Label>
                  <Input
                    id="businessHours"
                    value={brandSettings.businessHours}
                    onChange={(e) => setBrandSettings({ ...brandSettings, businessHours: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">社群連結</CardTitle>
                <CardDescription>設定社群媒體連結</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    value={brandSettings.facebook}
                    onChange={(e) => setBrandSettings({ ...brandSettings, facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={brandSettings.instagram}
                    onChange={(e) => setBrandSettings({ ...brandSettings, instagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="line" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    LINE 官方帳號
                  </Label>
                  <Input
                    id="line"
                    value={brandSettings.line}
                    onChange={(e) => setBrandSettings({ ...brandSettings, line: e.target.value })}
                    placeholder="@..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 功能設定 */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">功能開關</CardTitle>
                <CardDescription>控制顧客端顯示的功能</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">顯示社群連結</p>
                    <p className="text-sm text-muted-foreground">在頁面底部顯示社群媒體連結</p>
                  </div>
                  <Switch
                    checked={brandSettings.showSocialLinks}
                    onCheckedChange={(checked) => setBrandSettings({ ...brandSettings, showSocialLinks: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">顯示營業時間</p>
                    <p className="text-sm text-muted-foreground">在聯絡資訊中顯示營業時間</p>
                  </div>
                  <Switch
                    checked={brandSettings.showBusinessHours}
                    onCheckedChange={(checked) => setBrandSettings({ ...brandSettings, showBusinessHours: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">線上預約功能</p>
                    <p className="text-sm text-muted-foreground">允許顧客透過網站預約</p>
                  </div>
                  <Switch
                    checked={brandSettings.enableOnlineBooking}
                    onCheckedChange={(checked) => setBrandSettings({ ...brandSettings, enableOnlineBooking: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">線上商城功能</p>
                    <p className="text-sm text-muted-foreground">允許顧客透過網站購買產品</p>
                  </div>
                  <Switch
                    checked={brandSettings.enableOnlineShop}
                    onCheckedChange={(checked) => setBrandSettings({ ...brandSettings, enableOnlineShop: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">會員積分系統</p>
                    <p className="text-sm text-muted-foreground">啟用會員積分累積與兌換功能</p>
                  </div>
                  <Switch
                    checked={brandSettings.enableMemberPoints}
                    onCheckedChange={(checked) => setBrandSettings({ ...brandSettings, enableMemberPoints: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 自訂網域 */}
          <TabsContent value="domain" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  自訂網域
                </CardTitle>
                <CardDescription>使用您自己的網域名稱</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">預設網域</p>
                    <p className="text-sm text-muted-foreground">yochill.yochill-saas.com</p>
                  </div>
                  <Button variant="outline" size="sm">
                    複製
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">使用自訂網域</p>
                    <p className="text-sm text-muted-foreground">使用您自己的網域名稱取代預設網域</p>
                  </div>
                  <Switch
                    checked={brandSettings.useCustomDomain}
                    onCheckedChange={(checked) => setBrandSettings({ ...brandSettings, useCustomDomain: checked })}
                  />
                </div>

                {brandSettings.useCustomDomain && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="customDomain">自訂網域</Label>
                      <Input
                        id="customDomain"
                        value={brandSettings.customDomain}
                        onChange={(e) => setBrandSettings({ ...brandSettings, customDomain: e.target.value })}
                        placeholder="booking.yourclinic.com"
                      />
                    </div>

                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <p className="font-medium text-sm">DNS 設定說明</p>
                      <p className="text-sm text-muted-foreground">
                        請在您的 DNS 服務商新增以下 CNAME 記錄：
                      </p>
                      <div className="bg-background p-2 rounded font-mono text-sm">
                        CNAME → yochill-saas.com
                      </div>
                    </div>

                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      驗證網域
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">SSL 憑證</CardTitle>
                <CardDescription>自訂網域的 SSL 憑證狀態</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium">SSL 憑證已啟用</p>
                    <p className="text-sm text-muted-foreground">
                      您的網站已使用 HTTPS 加密連線
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
