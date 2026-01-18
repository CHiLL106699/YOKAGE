/**
 * 資安強化工具模組
 * 
 * 功能：
 * 1. 輸入驗證與清理
 * 2. XSS 防護
 * 3. SQL 注入防護
 * 4. CSRF 防護
 * 5. 敏感資料遮罩
 * 6. 安全日誌記錄
 */

import { TRPCError } from "@trpc/server";

// ============================================
// Input Sanitization
// ============================================

/**
 * 清理 HTML 標籤（防止 XSS）
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * 清理 SQL 特殊字符（額外防護層）
 */
export function sanitizeSql(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, "")
    .replace(/--/g, "")
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "");
}

/**
 * 清理檔案名稱
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .substring(0, 255);
}

/**
 * 清理路徑（防止目錄遍歷攻擊）
 */
export function sanitizePath(path: string): string {
  return path
    .replace(/\.\./g, "")
    .replace(/\/\//g, "/")
    .replace(/^\//, "");
}

/**
 * 通用輸入清理
 */
export function sanitizeInput(input: string, options?: {
  maxLength?: number;
  allowHtml?: boolean;
  trim?: boolean;
}): string {
  let result = input;
  
  if (options?.trim !== false) {
    result = result.trim();
  }
  
  if (!options?.allowHtml) {
    result = sanitizeHtml(result);
  }
  
  if (options?.maxLength && result.length > options.maxLength) {
    result = result.substring(0, options.maxLength);
  }
  
  return result;
}

// ============================================
// Validation
// ============================================

/**
 * 驗證電子郵件格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 驗證台灣手機號碼格式
 */
export function isValidTaiwanPhone(phone: string): boolean {
  const phoneRegex = /^09\d{8}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ""));
}

/**
 * 驗證 URL 格式
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 驗證日期格式 (YYYY-MM-DD)
 */
export function isValidDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
}

/**
 * 驗證 UUID 格式
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * 驗證正整數
 */
export function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

// ============================================
// Data Masking
// ============================================

/**
 * 遮罩電子郵件
 * example@domain.com -> e***e@d***n.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***";
  
  const maskedLocal = local.length > 2 
    ? `${local[0]}***${local[local.length - 1]}`
    : "***";
  
  const domainParts = domain.split(".");
  const maskedDomain = domainParts.map((part, index) => {
    if (index === domainParts.length - 1) return part; // 保留頂級域名
    return part.length > 2 
      ? `${part[0]}***${part[part.length - 1]}`
      : "***";
  }).join(".");
  
  return `${maskedLocal}@${maskedDomain}`;
}

/**
 * 遮罩電話號碼
 * 0912345678 -> 0912***678
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/[-\s]/g, "");
  if (cleaned.length < 6) return "***";
  return `${cleaned.substring(0, 4)}***${cleaned.substring(cleaned.length - 3)}`;
}

/**
 * 遮罩身分證字號
 * A123456789 -> A12***789
 */
export function maskIdNumber(id: string): string {
  if (id.length < 6) return "***";
  return `${id.substring(0, 3)}***${id.substring(id.length - 3)}`;
}

/**
 * 遮罩信用卡號
 * 4111111111111111 -> ****-****-****-1111
 */
export function maskCreditCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/[-\s]/g, "");
  if (cleaned.length < 4) return "****";
  return `****-****-****-${cleaned.substring(cleaned.length - 4)}`;
}

/**
 * 遮罩姓名
 * 王小明 -> 王**
 */
export function maskName(name: string): string {
  if (name.length <= 1) return "*";
  return `${name[0]}${"*".repeat(name.length - 1)}`;
}

/**
 * 遮罩地址
 * 台北市信義區信義路五段7號 -> 台北市信義區***
 */
export function maskAddress(address: string): string {
  // 保留前 6 個字符
  if (address.length <= 6) return "***";
  return `${address.substring(0, 6)}***`;
}

// ============================================
// Security Logging
// ============================================

interface SecurityEvent {
  timestamp: Date;
  type: "auth" | "access" | "data" | "error" | "suspicious";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  userId?: number | string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  details?: Record<string, unknown>;
}

const securityEvents: SecurityEvent[] = [];
const MAX_SECURITY_EVENTS = 10000;

/**
 * 記錄安全事件
 */
export function logSecurityEvent(event: Omit<SecurityEvent, "timestamp">): void {
  securityEvents.push({
    ...event,
    timestamp: new Date(),
  });
  
  // 保持事件數量在限制內
  if (securityEvents.length > MAX_SECURITY_EVENTS) {
    securityEvents.shift();
  }
  
  // 高嚴重性事件輸出到控制台
  if (event.severity === "high" || event.severity === "critical") {
    console.warn(`[SECURITY ${event.severity.toUpperCase()}] ${event.type}: ${event.message}`, event.details);
  }
}

/**
 * 獲取最近的安全事件
 */
export function getRecentSecurityEvents(options?: {
  limit?: number;
  type?: SecurityEvent["type"];
  severity?: SecurityEvent["severity"];
}): SecurityEvent[] {
  let events = [...securityEvents];
  
  if (options?.type) {
    events = events.filter(e => e.type === options.type);
  }
  
  if (options?.severity) {
    events = events.filter(e => e.severity === options.severity);
  }
  
  return events.slice(-(options?.limit || 100));
}

/**
 * 獲取安全事件統計
 */
export function getSecurityStats(): {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  criticalCount: number;
} {
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  let criticalCount = 0;
  
  for (const event of securityEvents) {
    byType[event.type] = (byType[event.type] || 0) + 1;
    bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
    if (event.severity === "critical") criticalCount++;
  }
  
  return {
    total: securityEvents.length,
    byType,
    bySeverity,
    criticalCount,
  };
}

// ============================================
// Security Checks
// ============================================

/**
 * 檢查可疑的 SQL 注入模式
 */
export function detectSqlInjection(input: string): boolean {
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
    /('|")\s*(OR|AND)\s*('|"|\d)/i,
    /;\s*(DROP|DELETE|UPDATE|INSERT)/i,
    /--\s*$/,
    /\/\*.*\*\//,
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

/**
 * 檢查可疑的 XSS 模式
 */
export function detectXss(input: string): boolean {
  const patterns = [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe\b[^>]*>/i,
    /<object\b[^>]*>/i,
    /<embed\b[^>]*>/i,
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

/**
 * 檢查可疑的路徑遍歷模式
 */
export function detectPathTraversal(input: string): boolean {
  const patterns = [
    /\.\.\//,
    /\.\.\\/, 
    /%2e%2e%2f/i,
    /%2e%2e\//i,
    /\.\.%2f/i,
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

/**
 * 綜合安全檢查
 */
export function performSecurityCheck(input: string, options?: {
  checkSql?: boolean;
  checkXss?: boolean;
  checkPath?: boolean;
}): { safe: boolean; threats: string[] } {
  const threats: string[] = [];
  
  if (options?.checkSql !== false && detectSqlInjection(input)) {
    threats.push("SQL Injection");
  }
  
  if (options?.checkXss !== false && detectXss(input)) {
    threats.push("XSS");
  }
  
  if (options?.checkPath !== false && detectPathTraversal(input)) {
    threats.push("Path Traversal");
  }
  
  return {
    safe: threats.length === 0,
    threats,
  };
}

/**
 * 安全檢查並拋出錯誤
 */
export function assertSecure(input: string, fieldName: string = "input"): void {
  const result = performSecurityCheck(input);
  
  if (!result.safe) {
    logSecurityEvent({
      type: "suspicious",
      severity: "high",
      message: `Potential security threat detected in ${fieldName}`,
      details: { threats: result.threats, input: input.substring(0, 100) },
    });
    
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `輸入包含不安全的內容`,
    });
  }
}

// ============================================
// Password Security
// ============================================

/**
 * 檢查密碼強度
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // 長度檢查
  if (password.length >= 8) score += 1;
  else feedback.push("密碼至少需要 8 個字符");
  
  if (password.length >= 12) score += 1;
  
  // 複雜度檢查
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("建議包含小寫字母");
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("建議包含大寫字母");
  
  if (/\d/.test(password)) score += 1;
  else feedback.push("建議包含數字");
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push("建議包含特殊字符");
  
  // 常見密碼檢查
  const commonPasswords = ["password", "123456", "qwerty", "admin", "letmein"];
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push("密碼過於常見，請選擇更安全的密碼");
  }
  
  return { score, feedback };
}

// ============================================
// Token Security
// ============================================

/**
 * 生成安全的隨機 token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  
  return result;
}

/**
 * 生成安全的數字驗證碼
 */
export function generateVerificationCode(length: number = 6): string {
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  
  let result = "";
  for (let i = 0; i < length; i++) {
    result += (randomValues[i] % 10).toString();
  }
  
  return result;
}
