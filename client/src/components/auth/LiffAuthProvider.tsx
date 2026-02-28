/**
 * LiffAuthProvider — LIFF 認證 Context Provider
 *
 * 包裹所有 /liff/* 路由，提供：
 * - 自動 LIFF 初始化與登入
 * - 使用者資訊 Context
 * - Loading / Error 狀態處理
 */
import React, { createContext, useContext } from "react";
import { useLiffAuth, type LiffUser, type UseLiffAuthReturn } from "@/_core/hooks/useLiffAuth";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

// Context
const LiffAuthContext = createContext<UseLiffAuthReturn | null>(null);

/**
 * 在 LIFF 頁面中取得認證資訊
 */
export function useLiffContext(): UseLiffAuthReturn {
  const ctx = useContext(LiffAuthContext);
  if (!ctx) {
    throw new Error("useLiffContext must be used within LiffAuthProvider");
  }
  return ctx;
}

/**
 * LiffAuthProvider
 * 負責 LIFF SDK 初始化、LINE 登入、後端 JWT 交換
 */
export function LiffAuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useLiffAuth();

  // Loading 狀態
  if (auth.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
        <p className="text-gray-600 text-lg">正在透過 LINE 登入...</p>
        <p className="text-gray-400 text-sm mt-2">請稍候</p>
      </div>
    );
  }

  // Error 狀態
  if (auth.error && !auth.isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-50 to-white p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-800 text-lg font-medium mb-2">登入失敗</p>
        <p className="text-gray-500 text-sm text-center mb-6">{auth.error}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重新嘗試
        </button>
      </div>
    );
  }

  return (
    <LiffAuthContext.Provider value={auth}>
      {children}
    </LiffAuthContext.Provider>
  );
}

export default LiffAuthProvider;
