
/**
 * AdminLogs — 系統日誌 (/admin/logs)
 */
import React, { useState, useMemo, useEffect } from "react";
import { safeDate, safeDateTime, safeStr, safeTime, safeMoney } from '@/lib/safeFormat';
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
import { trpc } from '@/lib/trpc';
import { QueryLoading, QueryError } from '@/components/ui/query-state';
import { Skeleton } from '@/components/ui/skeleton';

type LogLevel = "INFO" | "WARN" | "ERROR" | "CRITICAL";

// The API response doesn't provide a direct 'source', so we'll define a smaller set or infer it.
// For now, we'll simplify the UI to work without a dedicated source filter.
interface LogEntry {
  id: number; // API returns number IDs
  timestamp: string | Date;
  level: LogLevel;
  action: string; // 'message' from mock is now 'action'
  userName: string; // 'user' from mock is now 'userName'
  target: string | null;
  details: unknown;
  success: boolean;
}

// Helper to derive LogLevel from the API response
const getLogLevel = (log: { success: boolean; action: string }): LogLevel => {
  const actionLower = log.action.toLowerCase();
  if (actionLower.includes('critical') || actionLower.includes('exhausted') || actionLower.includes('expiring')) return 'CRITICAL';
  if (!log.success) return 'ERROR';
  if (actionLower.includes('failed') || actionLower.includes('warn') || actionLower.includes('approaching')) return 'WARN';
  return 'INFO';
};

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

const LOGS_PER_PAGE = 30;

const SkeletonLogTable = () => (
  <div className="space-y-2">
    {[...Array(15)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 rounded-lg bg-slate-800/50 p-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
);

export default function AdminLogsPage() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "ALL">("ALL");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [page, setPage] = useState(1); // Pagination state is kept for UI controls

  const { data, isLoading, error, refetch } = trpc.superAdmin.getAuditLogs.useQuery(
    { limit: 500 }, // Fetch a larger set of logs to allow for client-side filtering and pagination
    { refetchInterval: autoRefresh ? 5000 : false, refetchOnWindowFocus: false }
  );

  const processedLogs: LogEntry[] = useMemo(() => {
    if (!data?.logs) return [];
    return data.logs.map(log => ({
      ...log,
      level: getLogLevel(log),
    }));
  }, [data]);

  const filteredLogs = useMemo(() => {
    return processedLogs.filter((log) => {
      if (levelFilter !== "ALL" && log.level !== levelFilter) return false;
      const searchLower = search.toLowerCase();
      if (search && 
          !log.action.toLowerCase().includes(searchLower) && 
          !log.userName.toLowerCase().includes(searchLower) &&
          !(log.target && log.target.toLowerCase().includes(searchLower))
      ) return false;
      return true;
    });
  }, [processedLogs, search, levelFilter]);

  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * LOGS_PER_PAGE;
    const end = start + LOGS_PER_PAGE;
    return filteredLogs.slice(start, end);
  }, [filteredLogs, page]);

  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);

  const levelCounts = useMemo(() => {
    const counts = { INFO: 0, WARN: 0, ERROR: 0, CRITICAL: 0 };
    processedLogs.forEach((l) => counts[l.level]++);
    return counts;
  }, [processedLogs]);

  useEffect(() => {
    setPage(1);
  }, [search, levelFilter]);

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

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
              <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${autoRefresh ? "bg-green-600 text-white" : "border border-slate-700 text-slate-300 hover:bg-slate-800"}`}>
                <RefreshCw className={`size-4 ${autoRefresh ? "animate-spin" : ""}`} />
                {autoRefresh ? "自動更新中" : "自動更新"}
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
                <Download className="size-4" />匯出
              </button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(["INFO", "WARN", "ERROR", "CRITICAL"] as LogLevel[]).map((level) => (
              <div key={level} className={`rounded-xl border border-slate-800 ${levelConfig[level].bg} p-4`}>
                <div className={`flex items-center gap-2 ${levelConfig[level].color}`}>
                  {levelConfig[level].icon}
                  <span className="text-sm font-medium">{level}</span>
                </div>
                {isLoading ? <Skeleton className="mt-2 h-8 w-12" /> : <p className="mt-2 text-2xl font-bold">{levelCounts[level]}</p>}
              </div>
            ))}
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="搜尋日誌 (操作, 用戶, 目標)..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none" />
            </div>
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as LogLevel | "ALL")} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none">
              <option value="ALL">所有等級</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900">
            <div className="min-w-full">
              {isLoading ? (
                <div className="p-4"><SkeletonLogTable /></div>
              ) : error ? (
                <QueryError message={error?.message ?? '載入日誌失敗'} onRetry={() => refetch()} />
              ) : (
                <div className="divide-y divide-slate-800">
                  {paginatedLogs.map((log) => (
                    <div key={log.id} className="flex flex-col gap-2 p-4 text-sm md:flex-row md:items-center">
                      <div className={`flex items-center gap-2 font-mono text-xs ${levelConfig[log.level].color} md:w-48`}>
                        {levelConfig[log.level].icon}
                        <span>{safeDateTime(log.timestamp)}</span>
                      </div>
                      <div className="flex-1 truncate font-mono text-slate-300" title={log.action}>{log.action}</div>
                      <div className="w-48 truncate font-mono text-slate-400" title={log.userName}>{log.userName}</div>
                      <div className="w-48 truncate font-mono text-slate-500" title={log.target || ''}>{log.target}</div>
                    </div>
                  ))}
                  {paginatedLogs.length === 0 && (
                    <div className="p-8 text-center text-slate-500">沒有符合條件的日誌</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="size-4" />
                上一頁
              </button>
              <span className="text-slate-400">第 {page} / {totalPages} 頁</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                下一頁
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
