import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

type AuthUser = {
  id: number;
  name: string;
  role: string;
  organizationId: number;
  tenantSlug?: string;
} | null;

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};

  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("yokage_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // 先從 localStorage 讀取 cached user（快速顯示）
    const cached = localStorage.getItem("yokage_user");
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch { /* ignore */ }
    }

    // 用 tRPC auth.me 驗證 token 有效性
    try {
      const resp = await fetch("/api/trpc/auth.me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      // tRPC 回傳格式: { result: { data: { json: {...} } } }
      const userData = data?.result?.data?.json;
      if (userData && userData.id) {
        const authUser: AuthUser = {
          id: userData.id,
          name: userData.name,
          role: userData.role,
          organizationId: userData.organizationId ?? 0,
        };
        setUser(authUser);
        localStorage.setItem("yokage_user", JSON.stringify(authUser));
      } else if (!cached) {
        // token 無效且沒有 cache
        localStorage.removeItem("yokage_token");
        localStorage.removeItem("yokage_user");
        setUser(null);
      }
    } catch (err: any) {
      // 網路錯誤時保留 cached user
      if (!cached) {
        setUser(null);
      }
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const logout = useCallback(async () => {
    localStorage.removeItem("yokage_token");
    localStorage.removeItem("yokage_user");
    setUser(null);
    window.location.href = "/login";
  }, []);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(user)
    );
    return {
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
    };
  }, [user, loading, error]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, loading, user]);

  return {
    ...state,
    refresh: fetchMe,
    logout,
  };
}
