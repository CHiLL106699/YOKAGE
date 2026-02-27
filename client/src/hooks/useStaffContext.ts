/**
 * useStaffContext — 取得當前登入員工的 organizationId 與 staffId
 * 
 * 優先從 localStorage JWT user 取得資料，
 * 再 fallback 到 tRPC core.tenant.current，
 * 若未登入則 fallback 到 ORG_ID=1, STAFF_ID=1（開發模式）。
 */
import { trpc } from '@/lib/trpc';
import { useMemo } from 'react';

export function useStaffContext() {
  const cachedUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("yokage_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const tenantQuery = trpc.organization.current.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!cachedUser,
  });

  const user = cachedUser;
  const tenant = tenantQuery.data ?? null;

  // Fallback for dev / unauthenticated
  const organizationId = user?.organizationId ?? (tenant as any)?.id ?? 1;
  const staffId = user?.id ?? 1;
  const staffName = user?.name ?? '員工';
  const isLoading = tenantQuery.isLoading && !!cachedUser;

  return {
    organizationId,
    staffId,
    staffName,
    user,
    tenant,
    isLoading,
    isAuthenticated: !!user,
  };
}
