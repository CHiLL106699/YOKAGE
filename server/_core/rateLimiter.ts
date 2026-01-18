/**
 * API 請求頻率限制器
 * 
 * 功能：
 * 1. 基於 IP 的請求頻率限制
 * 2. 基於用戶的請求頻率限制
 * 3. 滑動窗口算法
 * 4. 可配置的限制策略
 * 
 * 資安考量：
 * - 防止暴力破解攻擊
 * - 防止 DDoS 攻擊
 * - 防止 API 濫用
 */

import { TRPCError } from "@trpc/server";

// ============================================
// Types
// ============================================
interface RateLimitConfig {
  /** 時間窗口（毫秒） */
  windowMs: number;
  /** 窗口內最大請求數 */
  maxRequests: number;
  /** 限制訊息 */
  message?: string;
  /** 是否跳過成功的請求 */
  skipSuccessfulRequests?: boolean;
  /** 是否跳過失敗的請求 */
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// ============================================
// Rate Limit Store (In-Memory)
// ============================================
class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // 每分鐘清理過期的條目
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key);
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.store.forEach((entry, key) => {
      if (entry.resetTime < now) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.store.delete(key));
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// 全局存儲實例
const globalStore = new RateLimitStore();

// ============================================
// Rate Limiter
// ============================================
export class RateLimiter {
  private config: RateLimitConfig;
  private store: RateLimitStore;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      windowMs: config.windowMs ?? 60000, // 預設 1 分鐘
      maxRequests: config.maxRequests ?? 100, // 預設 100 次
      message: config.message ?? "請求過於頻繁，請稍後再試",
      skipSuccessfulRequests: config.skipSuccessfulRequests ?? false,
      skipFailedRequests: config.skipFailedRequests ?? false,
    };
    this.store = globalStore;
  }

  /**
   * 檢查請求是否被允許
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    // 如果沒有記錄或已過期，創建新記錄
    if (!entry || entry.resetTime < now) {
      this.store.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
        firstRequest: now,
      });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    // 檢查是否超過限制
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    // 增加計數
    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * 重置特定 key 的限制
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * 獲取配置
   */
  getConfig(): RateLimitConfig {
    return { ...this.config };
  }
}

// ============================================
// Pre-configured Rate Limiters
// ============================================

/** 標準 API 限制：每分鐘 100 次 */
export const standardLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  message: "請求過於頻繁，請稍後再試",
});

/** 嚴格限制：每分鐘 20 次（用於敏感操作） */
export const strictLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 20,
  message: "操作過於頻繁，請稍後再試",
});

/** 登入限制：每 15 分鐘 5 次 */
export const loginLimiter = new RateLimiter({
  windowMs: 900000, // 15 分鐘
  maxRequests: 5,
  message: "登入嘗試次數過多，請 15 分鐘後再試",
});

/** 寬鬆限制：每分鐘 500 次（用於讀取操作） */
export const readLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 500,
  message: "請求過於頻繁，請稍後再試",
});

/** 批次操作限制：每分鐘 10 次 */
export const batchLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 10,
  message: "批次操作過於頻繁，請稍後再試",
});

/** 匯出限制：每小時 10 次 */
export const exportLimiter = new RateLimiter({
  windowMs: 3600000, // 1 小時
  maxRequests: 10,
  message: "匯出操作過於頻繁，請 1 小時後再試",
});

// ============================================
// Helper Functions
// ============================================

/**
 * 生成基於 IP 的限制 key
 */
export function getIpKey(ip: string | undefined, prefix: string = "ip"): string {
  return `${prefix}:${ip || "unknown"}`;
}

/**
 * 生成基於用戶的限制 key
 */
export function getUserKey(userId: number | string, prefix: string = "user"): string {
  return `${prefix}:${userId}`;
}

/**
 * 生成組合 key（IP + 用戶）
 */
export function getCombinedKey(ip: string | undefined, userId?: number | string, prefix: string = "combined"): string {
  const ipPart = ip || "unknown";
  const userPart = userId || "anonymous";
  return `${prefix}:${ipPart}:${userPart}`;
}

/**
 * 檢查並拋出限制錯誤
 */
export function checkRateLimit(
  limiter: RateLimiter,
  key: string,
  customMessage?: string
): void {
  const result = limiter.check(key);
  
  if (!result.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: customMessage || limiter.getConfig().message || "請求過於頻繁",
    });
  }
}

/**
 * 創建自定義限制器
 */
export function createRateLimiter(config: Partial<RateLimitConfig>): RateLimiter {
  return new RateLimiter(config);
}

// ============================================
// Rate Limit Headers
// ============================================

/**
 * 生成速率限制響應頭
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
    ...(result.retryAfter ? { "Retry-After": String(result.retryAfter) } : {}),
  };
}

// ============================================
// Audit Log for Rate Limit Events
// ============================================

interface RateLimitEvent {
  timestamp: Date;
  key: string;
  allowed: boolean;
  remaining: number;
  ip?: string;
  userId?: number | string;
  endpoint?: string;
}

const rateLimitEvents: RateLimitEvent[] = [];
const MAX_EVENTS = 1000;

/**
 * 記錄速率限制事件
 */
export function logRateLimitEvent(event: Omit<RateLimitEvent, "timestamp">): void {
  rateLimitEvents.push({
    ...event,
    timestamp: new Date(),
  });
  
  // 保持事件數量在限制內
  if (rateLimitEvents.length > MAX_EVENTS) {
    rateLimitEvents.shift();
  }
}

/**
 * 獲取最近的速率限制事件
 */
export function getRecentRateLimitEvents(limit: number = 100): RateLimitEvent[] {
  return rateLimitEvents.slice(-limit);
}

/**
 * 獲取被阻擋的請求統計
 */
export function getBlockedRequestStats(): {
  total: number;
  byKey: Record<string, number>;
  byHour: Record<string, number>;
} {
  const blocked = rateLimitEvents.filter(e => !e.allowed);
  const byKey: Record<string, number> = {};
  const byHour: Record<string, number> = {};
  
  for (const event of blocked) {
    byKey[event.key] = (byKey[event.key] || 0) + 1;
    const hour = event.timestamp.toISOString().slice(0, 13);
    byHour[hour] = (byHour[hour] || 0) + 1;
  }
  
  return {
    total: blocked.length,
    byKey,
    byHour,
  };
}
