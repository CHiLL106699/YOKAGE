/**
 * Safe formatting utilities to prevent React Error #31
 * (Objects are not valid as a React child)
 * 
 * Drizzle ORM returns timestamp columns as Date objects.
 * These must be converted to strings before rendering in JSX.
 */

/** Safely convert any value to a displayable string */
export function safeStr(value: unknown, fallback = "-"): string {
  if (value === null || value === undefined || value === "") return fallback;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? fallback : value.toLocaleDateString("zh-TW");
  }
  if (typeof value === "object") {
    // Handle tag objects like { id, name, color }
    if ("name" in (value as any)) return String((value as any).name);
    return JSON.stringify(value);
  }
  return String(value);
}

/** Safely format a date value to YYYY/MM/DD */
export function safeDate(value: unknown, fallback = "-"): string {
  if (value === null || value === undefined || value === "") return fallback;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? fallback : value.toLocaleDateString("zh-TW");
  }
  if (typeof value === "string") {
    // Handle ISO strings
    if (value.includes("T")) return value.split("T")[0];
    return value;
  }
  return fallback;
}

/** Safely format a datetime value to YYYY/MM/DD HH:mm */
export function safeDateTime(value: unknown, fallback = "-"): string {
  if (value === null || value === undefined || value === "") return fallback;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? fallback : value.toLocaleString("zh-TW");
  }
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleString("zh-TW");
  }
  return fallback;
}

/** Safely format a time value (HH:mm) */
export function safeTime(value: unknown, fallback = ""): string {
  if (value === null || value === undefined || value === "") return fallback;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? fallback : value.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
  }
  return String(value);
}

/** Safely format a number for currency display */
export function safeMoney(value: unknown, fallback = "0"): string {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  return isNaN(num) ? fallback : num.toLocaleString();
}
