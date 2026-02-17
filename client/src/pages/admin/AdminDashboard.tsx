/**
 * /admin — 超級管理員平台首頁
 * 重新包裝既有的 SuperAdminDashboard，加入路由守衛
 */
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

const SuperAdminDashboard = React.lazy(() => import("../SuperAdminDashboard"));

export default function AdminDashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SuperAdminDashboard />
    </Suspense>
  );
}
