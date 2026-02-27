import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import jwt from "jsonwebtoken";
import { ENV } from "./env";
import * as db from "../db";

/** JWT payload 結構 */
export interface JwtPayload {
  staffId: number;
  staffAccountId: number;
  role: string;
  organizationId: number;
  username: string;
}

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * 從 Authorization header 中提取並驗證 JWT token，
 * 將對應的 staff 資訊映射為相容的 User 物件注入到 tRPC context。
 *
 * 向後相容：如果 JWT 驗證失敗，嘗試用舊的 cookie-based 認證。
 */
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // 優先嘗試 JWT Bearer token 認證
    const authHeader = opts.req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const secret = ENV.cookieSecret; // JWT_SECRET 環境變數
      if (secret) {
        const payload = jwt.verify(token, secret) as JwtPayload;
        // 將 staff 資訊映射為 User 相容物件
        user = {
          id: payload.staffId,
          openId: `staff_${payload.staffId}`,
          name: payload.username,
          email: payload.username,
          phone: null,
          avatar: null,
          loginMethod: "password",
          role: payload.role === "admin" ? "super_admin" : payload.role,
          lineUserId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        } as User;
      }
    }

    // 如果 JWT 認證未成功，嘗試舊的 Manus OAuth cookie 認證
    if (!user) {
      try {
        const { sdk } = await import("./sdk");
        user = await sdk.authenticateRequest(opts.req);
      } catch {
        // 兩種認證都失敗，user 保持 null
        user = null;
      }
    }
  } catch (error) {
    // JWT 驗證失敗（過期、簽名錯誤等），嘗試舊認證
    try {
      const { sdk } = await import("./sdk");
      user = await sdk.authenticateRequest(opts.req);
    } catch {
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
