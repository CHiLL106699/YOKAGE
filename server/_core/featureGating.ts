/**
 * Feature Gating Middleware
 * 根據 tenant 的 plan_type 和 enabled_modules 控制 API 存取
 */
import { TRPCError } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import type { TrpcContext } from "./context";
import { eq } from "drizzle-orm";
import { tenants } from "../../drizzle/schema";
import { getDb } from "../db";

// ============================================
// Plan → Module 映射表
// ============================================
const PLAN_MODULES: Record<string, string[]> = {
  yokage_starter: [
    "appointment", "customer", "staff", "schedule", "clock",
    "notification", "tenant", "auth", "lineWebhook", "gamification",
  ],
  yokage_pro: [
    // 繼承 starter 所有模組
    "appointment", "customer", "staff", "schedule", "clock",
    "notification", "tenant", "auth", "lineWebhook", "gamification",
    // Pro 專屬
    "biDashboard", "emr", "aiChatbot", "richMenuEditor", "abTest",
    "vectorSearch", "advancedInventory", "advancedMarketing", "multiStore",
  ],
  yyq_basic: [
    "appointment", "customer", "staff", "schedule", "clock",
    "notification", "tenant", "auth", "lineWebhook", "gamification",
    // LINE 基礎
    "liffAuth", "linePay", "liffBooking", "liffShop", "liffMember",
  ],
  yyq_advanced: [
    // 繼承 yyq_basic 所有模組
    "appointment", "customer", "staff", "schedule", "clock",
    "notification", "tenant", "auth", "lineWebhook", "gamification",
    "liffAuth", "linePay", "liffBooking", "liffShop", "liffMember",
    // 進階功能
    "biDashboard", "advancedMarketing",
  ],
};

// ============================================
// 取得 Tenant 的可用模組
// ============================================
export async function getTenantModules(tenantId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      planType: tenants.planType,
      enabledModules: tenants.enabledModules,
    })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (result.length === 0) return [];

  const tenant = result[0];
  const planModules = PLAN_MODULES[tenant.planType ?? "yokage_starter"] ?? [];
  const customModules = (tenant.enabledModules as string[] | null) ?? [];

  // 合併 plan 預設模組 + 自訂啟用模組
  const merged = Array.from(new Set([...planModules, ...customModules]));
  return merged;
}

// ============================================
// Feature Gating 檢查函式
// ============================================
export function checkModuleAccess(
  availableModules: string[],
  requiredModule: string
): boolean {
  return availableModules.includes(requiredModule);
}

// ============================================
// 匯出 Plan 映射供其他模組使用
// ============================================
export { PLAN_MODULES };
