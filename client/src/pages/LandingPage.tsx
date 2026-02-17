/**
 * 一頁式行銷網站 /
 * 公開頁面，展示 YOKAGE 平台功能與優勢
 */
import React from "react";
import { useLocation } from "wouter";
import {
  Building2,
  Calendar,
  Users,
  BarChart3,
  Shield,
  Zap,
  Star,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: <Calendar className="size-6" />,
    title: "智慧預約管理",
    description: "線上預約、自動提醒、智慧排程，減少 No-show 率達 40%",
  },
  {
    icon: <Users className="size-6" />,
    title: "全方位 CRM",
    description: "客戶 360° 視圖、RFM 分析、自動化標籤，精準行銷",
  },
  {
    icon: <BarChart3 className="size-6" />,
    title: "營運 BI 儀表板",
    description: "即時營收追蹤、員工績效、庫存管理，一目了然",
  },
  {
    icon: <Shield className="size-6" />,
    title: "企業級資安",
    description: "RLS 資料隔離、加密傳輸、HIPAA 合規，守護病患隱私",
  },
  {
    icon: <Zap className="size-6" />,
    title: "LINE 深度整合",
    description: "Rich Menu、推播、LIFF 會員中心、LINE Pay 一站整合",
  },
  {
    icon: <Star className="size-6" />,
    title: "遊戲化行銷",
    description: "一番賞、拉霸機、集點卡，提升客戶回訪率與黏著度",
  },
];

const plans = [
  {
    name: "Starter",
    price: "NT$ 2,990",
    period: "/月",
    features: [
      "預約管理",
      "客戶管理",
      "員工排班",
      "打卡系統",
      "基礎報表",
      "LINE 通知",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "NT$ 7,990",
    period: "/月",
    features: [
      "Starter 所有功能",
      "BI 營運儀表板",
      "電子病歷 (EMR)",
      "AI 客服機器人",
      "Rich Menu 編輯器",
      "A/B 測試推播",
      "向量搜尋",
      "進階庫存管理",
      "多店管理",
    ],
    highlighted: true,
  },
];

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="size-5" />
            </div>
            <span className="text-xl font-bold">YOKAGE</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              功能特色
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
              方案價格
            </a>
            <button
              onClick={() => navigate("/login")}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              登入
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <Zap className="size-4 text-primary" />
          醫美診所高配版 SaaS 平台
        </div>
        <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
          讓診所管理
          <br />
          <span className="text-primary">簡單而強大</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          從預約管理到 AI 客服，從員工排班到營運分析。
          YOKAGE 為醫美診所打造一站式數位轉型解決方案。
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
          >
            免費試用 <ArrowRight className="size-4" />
          </button>
          <a
            href="#features"
            className="rounded-lg border border-border px-6 py-3 font-medium text-foreground hover:bg-accent"
          >
            了解更多
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-card/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">功能特色</h2>
            <p className="mt-2 text-muted-foreground">
              一個平台，滿足診所營運的所有需求
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">方案價格</h2>
            <p className="mt-2 text-muted-foreground">
              選擇最適合您診所的方案
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:mx-auto lg:max-w-4xl">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-8 ${
                  plan.highlighted
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    最受歡迎
                  </div>
                )}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/login")}
                  className={`mt-8 w-full rounded-lg px-4 py-2.5 font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border bg-card text-foreground hover:bg-accent"
                  }`}
                >
                  開始使用
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} YOKAGE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
