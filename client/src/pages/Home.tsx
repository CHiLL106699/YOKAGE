import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { 
  Building2, Calendar, Users, Package, Heart, 
  Shield, Zap, Globe, ArrowRight, Sparkles
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users based on role
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === "super_admin") {
        setLocation("/super-admin");
      } else {
        setLocation("/clinic");
      }
    }
  }, [loading, isAuthenticated, user, setLocation]);

  const features = [
    {
      icon: Calendar,
      title: "智慧預約系統",
      description: "線上預約、自動提醒、衝突檢測，讓預約管理輕鬆無憂",
    },
    {
      icon: Users,
      title: "客戶關係管理",
      description: "完整客戶檔案、消費記錄、會員等級，深度經營每位顧客",
    },
    {
      icon: Package,
      title: "產品與庫存",
      description: "療程管理、產品銷售、庫存追蹤，一站式商品管理",
    },
    {
      icon: Heart,
      title: "術後關懷",
      description: "自動追蹤、回訪提醒、滿意度調查，提升客戶滿意度",
    },
  ];

  const benefits = [
    { icon: Shield, text: "企業級資安防護" },
    { icon: Zap, text: "快速部署上線" },
    { icon: Globe, text: "LINE 深度整合" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">YOChiLL</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/clinic">
                <Button>進入後台</Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button>登入</Button>
              </a>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            專為醫美診所打造的 SaaS 平台
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            讓診所營運
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {" "}更智慧、更高效
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            整合預約、客戶、產品、員工管理，搭配 LINE 深度整合，
            打造您專屬的數位化診所管理系統
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link href="/clinic">
                <Button size="lg" className="gap-2 px-8">
                  進入後台
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="gap-2 px-8">
                  免費開始使用
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
            )}
            <Button variant="outline" size="lg" className="gap-2 px-8">
              <Building2 className="h-5 w-5" />
              預約產品展示
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <benefit.icon className="h-5 w-5 text-blue-600" />
              <span className="font-medium">{benefit.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            全方位診所管理功能
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            從預約到售後，從前台到後勤，一個平台滿足所有需求
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              準備好升級您的診所管理了嗎？
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              立即開始免費試用，體驗智慧化診所管理的便利
            </p>
            {isAuthenticated ? (
              <Link href="/clinic">
                <Button size="lg" variant="secondary" className="gap-2 px-8">
                  進入後台
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" variant="secondary" className="gap-2 px-8">
                  免費開始使用
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">YOChiLL SaaS</span>
          </div>
          <p>© 2024 YOChiLL. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
