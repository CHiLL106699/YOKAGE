/**
 * Netlify Function: /api/trpc/*
 * 將 tRPC 請求代理到 yochillsaas.lat 後端
 * 除了 auth.login / auth.me 由本地 auth function 處理
 */
import type { Context } from "@netlify/functions";

const BACKEND_URL = "https://yochillsaas.lat";

export default async (req: Request, context: Context) => {
  const CORS_HEADERS: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;

  try {
    const headers: Record<string, string> = {};
    // Forward relevant headers
    for (const [key, value] of req.headers.entries()) {
      if (["content-type", "authorization", "accept"].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method === "POST" || req.method === "PUT") {
      fetchOptions.body = await req.text();
    }

    const response = await fetch(targetUrl, fetchOptions);
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Proxy error: " + err.message }), {
      status: 502,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/trpc/*",
};
