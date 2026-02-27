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
      // 沒有 token，嘗試從 localStorage 讀取 cached user
      const cached = localStorage.getItem("yokage_user");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
          setLoading(false);
          return;
        } catch { /* ignore */ }
      }
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("yokage_user", JSON.stringify(data.user));
      } else {
        // token 無效，清除
        localStorage.removeItem("yokage_token");
        localStorage.removeItem("yokage_user");
        setUser(null);
      }
    } catch (err: any) {
      // /api/auth/me 不可用時，fallback 到 localStorage cached user
      const cached = localStorage.getItem("yokage_user");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          setUser(null);
        }
      } else {
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
