/**
 * 統一登入頁 /login
 *
 * 1. 帳號 + 密碼 → /api/auth/login (Netlify Function) → JWT token
 * 2. 查詢使用者角色
 * 3. 若有多重角色 → 顯示「選擇身份」中間頁
 * 4. 根據角色自動重導向
 */
import React, { useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2, Building2, Shield, UserCog, User, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

type RoleOption = {
  role: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  tenantName?: string;
};

function getRoleOptions(user: Record<string, any>): RoleOption[] {
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
  const { user, loading, isAuthenticated, refresh } = useAuth();
  const [, navigate] = useLocation();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const loginMutation = trpc.auth.login.useMutation();

  // 登入表單狀態
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 已登入 → 判斷角色
  React.useEffect(() => {
    if (loading || !isAuthenticated || !user) return;

    const options = getRoleOptions(user);
    if (options.length === 1) {
      navigate(options[0].path);
    } else {
      setRoleOptions(options);
      setShowRoleSelector(true);
    }
  }, [user, loading, isAuthenticated, navigate]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      // 透過 tRPC auth.login mutation 登入
      const result = await loginMutation.mutateAsync({
        username: username.trim(),
        password,
      });

      if (!result.token) {
        throw new Error("登入失敗");
      }

      // 儲存 JWT token 到 localStorage
      localStorage.setItem("yokage_token", result.token);
      localStorage.setItem("yokage_user", JSON.stringify(result.user));

      // 重新整理 auth 狀態
      await refresh();

      // 根據角色導向
      const redirectPath = getDefaultRedirect(result.user.role);
      navigate(redirectPath);
    } catch (err: any) {
      const message = err?.message || "登入失敗，請稍後再試";
      setLoginError(message);
    } finally {
      setIsLoggingIn(false);
    }
  }, [username, password, navigate, refresh]);

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
        <form onSubmit={handleLogin} className="space-y-4">
          {loginError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-foreground"
            >
              帳號
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="請輸入帳號"
              autoComplete="username"
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              autoComplete="current-password"
              required
              className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn || !username || !password}
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggingIn ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                登入中...
              </span>
            ) : (
              "登入"
            )}
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          <p>登入即表示您同意我們的服務條款與隱私政策</p>
        </div>
      </div>
    </div>
  );
}
