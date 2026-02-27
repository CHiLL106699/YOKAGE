/**
 * Netlify Function: /api/auth
 * 處理 JWT 登入認證，直連 Supabase PostgreSQL
 * 
 * Endpoints:
 *   POST /api/auth/login  — 帳號密碼登入，回傳 JWT
 *   GET  /api/auth/me     — 驗證 JWT，回傳用戶資訊
 *   POST /api/auth/logout — 登出（前端清除 token）
 */
import type { Context } from "@netlify/functions";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pg from "pg";

const JWT_SECRET = process.env.JWT_SECRET || "yokage-jwt-secret-2026-imei";
const DATABASE_URL = process.env.DATABASE_URL || "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

async function getDbClient() {
  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  return client;
}

async function handleLogin(body: any) {
  const { username, password } = body || {};
  if (!username || !password) {
    return jsonResponse({ error: "請輸入帳號和密碼" }, 400);
  }

  let client;
  try {
    client = await getDbClient();

    // 查詢 staff_accounts 表
    const result = await client.query(
      `SELECT sa.id as account_id, sa.username, sa.password_hash, sa.role,
              s.id as staff_id, s.name as staff_name, s."organizationId" as tenant_id,
              t.name as tenant_name, t.slug as tenant_slug
       FROM staff_accounts sa
       LEFT JOIN staff s ON sa.staff_id = s.id
       LEFT JOIN tenants t ON s."organizationId" = t.id
       WHERE sa.username = $1 AND sa.is_active = true`,
      [username]
    );

    if (result.rows.length === 0) {
      return jsonResponse({ error: "帳號不存在或已停用" }, 401);
    }

    const account = result.rows[0];

    // 驗證密碼
    const isValid = await bcrypt.compare(password, account.password_hash);
    if (!isValid) {
      return jsonResponse({ error: "密碼錯誤" }, 401);
    }

    // 簽發 JWT
    const tokenPayload = {
      staffId: account.staff_id,
      accountId: account.account_id,
      role: account.role,
      organizationId: account.tenant_id,
      tenantSlug: account.tenant_slug,
      name: account.staff_name,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    return jsonResponse({
      success: true,
      token,
      user: {
        id: account.staff_id,
        name: account.staff_name,
        role: account.role,
        organizationId: account.tenant_id,
        tenantName: account.tenant_name,
        tenantSlug: account.tenant_slug,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return jsonResponse({ error: "伺服器錯誤: " + err.message }, 500);
  } finally {
    if (client) await client.end();
  }
}

async function handleMe(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return jsonResponse({ user: null });
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return jsonResponse({
      user: {
        id: decoded.staffId,
        name: decoded.name,
        role: decoded.role,
        organizationId: decoded.organizationId,
        tenantSlug: decoded.tenantSlug,
      },
    });
  } catch {
    return jsonResponse({ user: null });
  }
}

export default async (req: Request, context: Context) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/auth\/?/, "").replace(/\/$/, "");

  if (req.method === "POST" && (path === "login" || path === "")) {
    const body = await req.json().catch(() => null);
    return handleLogin(body);
  }

  if (req.method === "GET" && path === "me") {
    return handleMe(req.headers.get("Authorization"));
  }

  if (req.method === "POST" && path === "logout") {
    return jsonResponse({ success: true });
  }

  return jsonResponse({ error: "Not found" }, 404);
};

export const config = {
  path: "/api/auth/*",
};
