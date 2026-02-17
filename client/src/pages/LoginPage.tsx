/**
 * 統一登入頁 /login
 *
 * 1. Email + 密碼 → Supabase Auth 驗證（或 Manus OAuth）
 * 2. 查詢使用者角色
 * 3. 若有多重角色 → 顯示「選擇身份」中間頁
 * 4. 根據角色自動重導向
 */
import React, { useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2, Building2, Shield, UserCog, User } from "lucide-react";

type RoleOption = {
  role: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  tenantName?: string;
};

function getRoleOptions(user: any): RoleOption[] {
  const options: RoleOption[] = [];
  const role = user?.role ?? "user";

  if (role === "super_admin") {
    options.push({
      role: "super_admin",
      label: "超級管理員",
      description: "管理所有租戶與系統設定",
      icon: <Shield className="size-6" />,
      path: "/admin",
    });
  }

  // admin 和 staff 角色可能同時存在（多租戶場景）
  if (role === "admin" || role === "super_admin") {
    options.push({
      role: "admin",
      label: "租戶管理員",
      description: "管理診所營運、員工與客戶",
      icon: <Building2 className="size-6" />,
      path: "/dashboard",
    });
  }

  if (role === "staff" || role === "admin" || role === "super_admin") {
    options.push({
      role: "staff",
      label: "員工",
      description: "查看班表、打卡、管理預約",
      icon: <UserCog className="size-6" />,
      path: "/staff",
    });
  }

  if (options.length === 0) {
    options.push({
      role: "user",
      label: "一般使用者",
      description: "瀏覽服務與預約",
      icon: <User className="size-6" />,
      path: "/",
    });
  }

  return options;
}

function getDefaultRedirect(role: string): string {
  switch (role) {
    case "super_admin":
      return "/admin";
    case "admin":
      return "/dashboard";
    case "staff":
      return "/staff";
    default:
      return "/";
  }
}

export default function LoginPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);

  // 已登入 → 判斷角色
  React.useEffect(() => {
    if (loading || !isAuthenticated || !user) return;

    const options = getRoleOptions(user);
    if (options.length === 1) {
      // 單一角色，直接導向
      navigate(options[0].path);
    } else {
      // 多重角色，顯示選擇頁
      setRoleOptions(options);
      setShowRoleSelector(true);
    }
  }, [user, loading, isAuthenticated, navigate]);

  const handleRoleSelect = useCallback(
    (option: RoleOption) => {
      navigate(option.path);
    },
    [navigate]
  );

  // 載入中
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">驗證身份中...</p>
        </div>
      </div>
    );
  }

  // 多重角色選擇頁
  if (showRoleSelector && isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-6 p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">選擇身份</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              您好，{user?.name || "使用者"}！請選擇要進入的平台：
            </p>
          </div>

          <div className="space-y-3">
            {roleOptions.map((option) => (
              <button
                key={option.role}
                onClick={() => handleRoleSelect(option)}
                className="flex w-full items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-accent"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {option.label}
                    {option.tenantName && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({option.tenantName})
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {option.description}
                  </div>
                </div>
                <svg
                  className="size-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 未登入 → 顯示登入表單
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-6">
        {/* Logo / Brand */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Building2 className="size-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">YOKAGE</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            醫美診所高配版 SaaS 平台
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              密碼
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            onClick={() => {
              // 透過 Manus OAuth 登入（現有流程）
              const loginUrl = (() => {
                const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
                const appId = import.meta.env.VITE_APP_ID;
                const redirectUri = `${window.location.origin}/api/oauth/callback`;
                const state = btoa(redirectUri);
                const url = new URL(`${oauthPortalUrl}/app-auth`);
                url.searchParams.set("appId", appId);
                url.searchParams.set("redirectUri", redirectUri);
                url.searchParams.set("state", state);
                url.searchParams.set("type", "signIn");
                return url.toString();
              })();
              window.location.href = loginUrl;
            }}
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            登入
          </button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>登入即表示您同意我們的服務條款與隱私政策</p>
        </div>
      </div>
    </div>
  );
}
