/**
 * Enhanced tRPC Procedures
 * 包含 Feature Gating middleware 的進階 procedure
 */
import { TRPCError } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { getTenantModules, checkModuleAccess } from "./featureGating";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

// ============================================
// Feature Gating Middleware Factory
// 根據 requiredModule 建立對應的 middleware
// ============================================
export function createFeatureGatingMiddleware(requiredModule: string) {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
    }

    // 從 user 的 organizationUsers 關聯取得 tenantId
    // 這裡假設 ctx 中已有 tenantId，或從 header 取得
    const tenantId = ctx.req.headers["x-tenant-id"];
    if (!tenantId) {
      // 若無 tenantId，允許 super_admin 通過
      if (ctx.user.role === "super_admin") {
        return next({ ctx });
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Tenant ID is required (x-tenant-id header)",
      });
    }

    const numericTenantId = parseInt(tenantId as string, 10);
    if (isNaN(numericTenantId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid tenant ID format",
      });
    }

    const availableModules = await getTenantModules(numericTenantId);
    if (!checkModuleAccess(availableModules, requiredModule)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Module "${requiredModule}" is not available for your current plan. Please upgrade to access this feature.`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        tenantId: numericTenantId,
        availableModules,
      },
    });
  });
}

// ============================================
// Pro Module Procedure (YOKAGE 專屬功能)
// ============================================
export function createProProcedure(moduleName: string) {
  return t.procedure
    .use(async ({ ctx, next }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
      }
      return next({ ctx: { ...ctx, user: ctx.user } });
    })
    .use(createFeatureGatingMiddleware(moduleName));
}

// ============================================
// LINE Module Procedure (YaoYouQian 強化功能)
// ============================================
export function createLineProcedure(moduleName: string) {
  return t.procedure
    .use(async ({ ctx, next }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
      }
      return next({ ctx: { ...ctx, user: ctx.user } });
    })
    .use(createFeatureGatingMiddleware(moduleName));
}
