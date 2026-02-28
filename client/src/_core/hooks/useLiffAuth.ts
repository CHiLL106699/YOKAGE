/**
 * useLiffAuth — LIFF 自動登入 Hook
 *
 * 流程：
 * 1. liff.init() → 初始化 LIFF SDK
 * 2. 檢查 liff.isLoggedIn()，若未登入則 liff.login()
 * 3. 取得 liff.getIDToken() 和 liff.getProfile()
 * 4. 呼叫後端 auth.loginWithLiff mutation
 * 5. 將回傳的 JWT 存入 localStorage
 *
 * 安全性：
 * - idToken 僅傳送至後端驗證，前端不解析
 * - LINE Channel Secret 不在前端出現
 */
import { useCallback, useEffect, useState } from "react";
import liff from "@line/liff";
import { trpc } from "@/lib/trpc";

const LIFF_ID = "2008492658-YVUxvCIJ";
const TOKEN_KEY = "yokage_token";
const USER_KEY = "yokage_user";

export interface LiffUser {
  id: number;
  name: string;
  role: string;
  organizationId: number;
  memberLevel?: string;
  lineUserId?: string;
  picture?: string | null;
}

export interface UseLiffAuthReturn {
  user: LiffUser | null;
  loading: boolean;
  error: string | null;
  isInLiff: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

export function useLiffAuth(): UseLiffAuthReturn {
  const [user, setUser] = useState<LiffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInLiff, setIsInLiff] = useState(false);

  const loginMutation = trpc.auth.loginWithLiff.useMutation();

  const initLiff = useCallback(async () => {
    try {
      // 先檢查是否已有有效的 token（避免重複登入）
      const existingToken = localStorage.getItem(TOKEN_KEY);
      const existingUser = localStorage.getItem(USER_KEY);
      if (existingToken && existingUser) {
        try {
          const parsed = JSON.parse(existingUser);
          if (parsed && parsed.id && parsed.role === "customer") {
            setUser(parsed);
            setLoading(false);
            // 仍然初始化 LIFF 以取得 isInClient 狀態
            try {
              await liff.init({ liffId: LIFF_ID });
              setIsInLiff(liff.isInClient());
            } catch {
              // LIFF init 失敗不影響已登入狀態
            }
            return;
          }
        } catch {
          // JSON parse 失敗，繼續正常流程
        }
      }

      // 1. 初始化 LIFF
      await liff.init({ liffId: LIFF_ID });
      setIsInLiff(liff.isInClient());

      // 2. 檢查登入狀態
      if (!liff.isLoggedIn()) {
        // 未登入，觸發 LINE 登入
        liff.login();
        return; // login 會重新導向，此處不繼續
      }

      // 3. 取得 idToken
      const idToken = liff.getIDToken();
      if (!idToken) {
        throw new Error("無法取得 LINE ID Token");
      }

      // 4. 呼叫後端驗證
      const result = await loginMutation.mutateAsync({ idToken });

      // 5. 儲存 JWT 和使用者資訊
      localStorage.setItem(TOKEN_KEY, result.token);
      const liffUser: LiffUser = {
        id: result.user.id,
        name: result.user.name,
        role: result.user.role,
        organizationId: result.user.organizationId,
        memberLevel: result.user.memberLevel,
        lineUserId: result.user.lineUserId,
        picture: result.user.picture,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(liffUser));
      setUser(liffUser);
    } catch (err: any) {
      console.error("LIFF auth error:", err);
      setError(err.message || "LIFF 認證失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initLiff();
  }, [initLiff]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    if (liff.isLoggedIn()) {
      liff.logout();
    }
    window.location.href = "/";
  }, []);

  return {
    user,
    loading,
    error,
    isInLiff,
    isAuthenticated: Boolean(user),
    logout,
  };
}
