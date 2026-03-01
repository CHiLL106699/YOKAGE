/**
 * ProtectedRoute — 路由守衛高階元件
 *
 * 根據使用者角色控制路由存取：
 * - super_admin → /admin/*
 * - admin → /dashboard/*
 * - staff → /staff/*
 * - 未登入 → /login
 * - 無權限 → /login
 */
import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

type AllowedRole = "super_admin" | "admin" | "staff" | "user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: AllowedRole[];
  /** 若需要 tenantId 才能存取（admin / staff 路由） */
  requireTenantId?: boolean;
}

function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">驗證身份中...</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireTenantId = false,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  // 載入中
  if (loading) {
    return <LoadingScreen />;
  }

  // 未登入 → 導向 /login
  if (!isAuthenticated || !user) {
    return <Redirect to="/login" />;
  }

  // 角色檢查
  const userRole = (user.role ?? "user") as AllowedRole;
  if (!allowedRoles.includes(userRole)) {
    // 無權限，根據角色導向對應平台
    const redirectMap: Record<string, string> = {
      super_admin: "/admin",
      admin: "/clinic",
      staff: "/staff",
      user: "/",
    };
    const target = redirectMap[userRole] || "/login";
    return <Redirect to={target} />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
