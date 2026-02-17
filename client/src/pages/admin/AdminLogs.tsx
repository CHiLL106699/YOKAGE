/**
 * AdminLogs — 系統日誌 (/admin/logs)
 */
import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  FileText,
  Search,
  RefreshCw,
  Download,
  Filter,
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  LayoutDashboard,
  Building2,
  DollarSign,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
} from "lucide-react";

type LogLevel = "INFO" | "WARN" | "ERROR" | "CRITICAL";
type LogSource = "API" | "Auth" | "System" | "Webhook";

interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  user: string;
  ip: string;
}

const mockLogs: LogEntry[] = [
  { id: 1, timestamp: "2026-02-17 09:45:23", level: "INFO", source: "API", message: "GET /api/tenants - 200 OK (45ms)", user: "admin@yokage.com", ip: "203.145.12.34" },
  { id: 2, timestamp: "2026-02-17 09:44:12", level: "WARN", source: "Auth", message: "Failed login attempt for user@test.com (3rd attempt)", user: "user@test.com", ip: "118.232.45.67" },
  { id: 3, timestamp: "2026-02-17 09:43:05", level: "ERROR", source: "Webhook", message: "LINE webhook delivery failed - timeout after 30s", user: "system", ip: "10.0.0.1" },
  { id: 4, timestamp: "2026-02-17 09:42:30", level: "INFO", source: "System", message: "Scheduled backup completed successfully", user: "system", ip: "10.0.0.1" },
  { id: 5, timestamp: "2026-02-17 09:41:15", level: "CRITICAL", source: "System", message: "Database connection pool exhausted - scaling up", user: "system", ip: "10.0.0.1" },
  { id: 6, timestamp: "2026-02-17 09:40:00", level: "INFO", source: "API", message: "POST /api/appointments - 201 Created (120ms)", user: "staff@clinic1.com", ip: "220.135.78.90" },
  { id: 7, timestamp: "2026-02-17 09:39:45", level: "INFO", source: "Auth", message: "User login successful: admin@yokage.com", user: "admin@yokage.com", ip: "203.145.12.34" },
  { id: 8, timestamp: "2026-02-17 09:38:30", level: "WARN", source: "API", message: "Rate limit approaching for tenant clinic-abc (80%)", user: "system", ip: "10.0.0.1" },
  { id: 9, timestamp: "2026-02-17 09:37:20", level: "ERROR", source: "Webhook", message: "Payment webhook signature verification failed", user: "system", ip: "52.68.123.45" },
  { id: 10, timestamp: "2026-02-17 09:36:10", level: "INFO", source: "System", message: "Cache cleared for tenant beauty-spa", user: "admin@yokage.com", ip: "203.145.12.34" },
  { id: 11, timestamp: "2026-02-17 09:35:00", level: "INFO", source: "API", message: "PUT /api/customers/456 - 200 OK (67ms)", user: "staff@clinic2.com", ip: "114.32.56.78" },
  { id: 12, timestamp: "2026-02-17 09:34:45", level: "WARN", source: "System", message: "Disk usage at 75% on primary storage", user: "system", ip: "10.0.0.1" },
  { id: 13, timestamp: "2026-02-17 09:33:30", level: "INFO", source: "Auth", message: "Password reset requested for user@clinic3.com", user: "user@clinic3.com", ip: "61.220.34.56" },
  { id: 14, timestamp: "2026-02-17 09:32:15", level: "ERROR", source: "API", message: "Internal server error on /api/reports/export - NullPointerException", user: "admin@clinic1.com", ip: "220.135.78.90" },
  { id: 15, timestamp: "2026-02-17 09:31:00", level: "INFO", source: "Webhook", message: "LINE message webhook received and processed (user: U1234567890)", user: "system", ip: "147.92.150.1" },
  { id: 16, timestamp: "2026-02-17 09:30:45", level: "INFO", source: "API", message: "GET /api/dashboard/stats - 200 OK (230ms)", user: "admin@clinic4.com", ip: "180.176.89.12" },
  { id: 17, timestamp: "2026-02-17 09:29:30", level: "WARN", source: "Auth", message: "JWT token expired for session abc123", user: "staff@clinic5.com", ip: "122.116.45.67" },
  { id: 18, timestamp: "2026-02-17 09:28:15", level: "INFO", source: "System", message: "Auto-scaling triggered: 2 → 3 instances", user: "system", ip: "10.0.0.1" },
  { id: 19, timestamp: "2026-02-17 09:27:00", level: "CRITICAL", source: "System", message: "SSL certificate expiring in 7 days for yochillsaas.com", user: "system", ip: "10.0.0.1" },
  { id: 20, timestamp: "2026-02-17 09:26:45", level: "INFO", source: "API", message: "DELETE /api/appointments/789 - 200 OK (34ms)", user: "admin@clinic1.com", ip: "220.135.78.90" },
  { id: 21, timestamp: "2026-02-17 09:25:30", level: "ERROR", source: "Webhook", message: "ECPay callback processing error - invalid checksum", user: "system", ip: "211.23.45.67" },
  { id: 22, timestamp: "2026-02-17 09:24:15", level: "INFO", source: "Auth", message: "New user registered: newstaff@clinic6.com", user: "admin@clinic6.com", ip: "59.125.78.90" },
  { id: 23, timestamp: "2026-02-17 09:23:00", level: "INFO", source: "API", message: "POST /api/broadcast - 201 Created (890ms)", user: "admin@clinic2.com", ip: "114.32.56.78" },
  { id: 24, timestamp: "2026-02-17 09:22:45", level: "WARN", source: "System", message: "Memory usage at 82% on worker-2", user: "system", ip: "10.0.0.2" },
  { id: 25, timestamp: "2026-02-17 09:21:30", level: "INFO", source: "System", message: "Database migration v42 applied successfully", user: "system", ip: "10.0.0.1" },
  { id: 26, timestamp: "2026-02-17 09:20:15", level: "ERROR", source: "API", message: "S3 upload failed - bucket access denied", user: "staff@clinic3.com", ip: "61.220.34.56" },
  { id: 27, timestamp: "2026-02-17 09:19:00", level: "INFO", source: "Webhook", message: "Scheduled reminder sent to 45 customers", user: "system", ip: "10.0.0.1" },
  { id: 28, timestamp: "2026-02-17 09:18:45", level: "INFO", source: "Auth", message: "OAuth callback processed for LINE login", user: "system", ip: "147.92.150.1" },
  { id: 29, timestamp: "2026-02-17 09:17:30", level: "WARN", source: "API", message: "Slow query detected: getCustomerHistory (2.3s)", user: "system", ip: "10.0.0.1" },
  { id: 30, timestamp: "2026-02-17 09:16:15", level: "INFO", source: "System", message: "Health check passed - all services operational", user: "system", ip: "10.0.0.1" },
];

const levelConfig: Record<LogLevel, { color: string; bg: string; icon: React.ReactNode }> = {
  INFO: { color: "text-blue-400", bg: "bg-blue-500/10", icon: <Info className="size-4" /> },
  WARN: { color: "text-yellow-400", bg: "bg-yellow-500/10", icon: <AlertTriangle className="size-4" /> },
  ERROR: { color: "text-red-400", bg: "bg-red-500/10", icon: <AlertCircle className="size-4" /> },
  CRITICAL: { color: "text-red-300", bg: "bg-red-600/20", icon: <XCircle className="size-4" /> },
};

const sidebarItems = [
  { name: "儀表板", path: "/admin", icon: LayoutDashboard },
  { name: "租戶管理", path: "/admin/tenants", icon: Building2 },
  { name: "營收報表", path: "/admin/revenue", icon: DollarSign },
  { name: "用戶管理", path: "/admin/users", icon: Users },
  { name: "系統設定", path: "/admin/system", icon: Settings },
  { name: "系統日誌", path: "/admin/logs", icon: FileText },
];

export default function AdminLogsPage() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "ALL">("ALL");
  const [sourceFilter, setSourceFilter] = useState<LogSource | "ALL">("ALL");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = mockLogs.filter((log) => {
    if (levelFilter !== "ALL" && log.level !== levelFilter) return false;
    if (sourceFilter !== "ALL" && log.source !== sourceFilter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && !log.user.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const levelCounts = { INFO: 0, WARN: 0, ERROR: 0, CRITICAL: 0 };
  mockLogs.forEach((l) => levelCounts[l.level]++);

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <Link href="/admin"><span className="flex items-center gap-2 text-xl font-bold cursor-pointer"><span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-bold">Y</span>YOChiLL</span></Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X className="size-5" /></button>
        </div>
        <div className="px-3 py-2 text-xs font-medium uppercase text-slate-500">Super Admin</div>
        <nav className="space-y-1 px-3">
          {sidebarItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <span className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                  <item.icon className="size-5" />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4">
          <Link href="/"><span className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 cursor-pointer"><LogOut className="size-4" />登出系統</span></Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-slate-800 px-6 py-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}><Menu className="size-6" /></button>
        </div>

        <div className="p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">系統日誌</h1>
              <p className="text-sm text-slate-400">監控系統運行狀態與操作記錄</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${autoRefresh ? "bg-green-600 text-white" : "border border-slate-700 text-slate-300"}`}>
                <RefreshCw className={`size-4 ${autoRefresh ? "animate-spin" : ""}`} />
                {autoRefresh ? "自動更新中" : "自動更新"}
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
                <Download className="size-4" />匯出
              </button>
            </div>
          </div>

          {/* Level distribution */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(["INFO", "WARN", "ERROR", "CRITICAL"] as LogLevel[]).map((level) => (
              <div key={level} className={`rounded-xl border border-slate-800 ${levelConfig[level].bg} p-4`}>
                <div className={`flex items-center gap-2 ${levelConfig[level].color}`}>
                  {levelConfig[level].icon}
                  <span className="text-sm font-medium">{level}</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{levelCounts[level]}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="搜尋日誌..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none" />
            </div>
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as LogLevel | "ALL")} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none">
              <option value="ALL">所有等級</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as LogSource | "ALL")} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none">
              <option value="ALL">所有來源</option>
              <option value="API">API</option>
              <option value="Auth">Auth</option>
              <option value="System">System</option>
              <option value="Webhook">Webhook</option>
            </select>
          </div>

          {/* Log table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-left text-xs uppercase text-slate-500">
                  <th className="px-4 py-3">時間</th>
                  <th className="px-4 py-3">等級</th>
                  <th className="px-4 py-3">來源</th>
                  <th className="px-4 py-3">訊息</th>
                  <th className="hidden px-4 py-3 lg:table-cell">用戶</th>
                  <th className="hidden px-4 py-3 lg:table-cell">IP</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-400">{log.timestamp}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${levelConfig[log.level].bg} ${levelConfig[log.level].color}`}>
                        {levelConfig[log.level].icon}
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{log.source}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-200">{log.message}</td>
                    <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">{log.user}</td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-slate-500 lg:table-cell">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <span>顯示 {filtered.length} 筆記錄</span>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800"><ChevronLeft className="size-4" /></button>
              <span>第 {page} 頁</span>
              <button className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800"><ChevronRight className="size-4" /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
