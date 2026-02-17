/**
 * useStaffContext — 取得當前登入員工的 organizationId 與 staffId
 * 
 * 優先從 auth.me + core.tenant.current 取得真實資料，
 * 若未登入則 fallback 到 ORG_ID=1, STAFF_ID=1（開發模式）。
 */
import { trpc } from '@/lib/trpc';

export function useStaffContext() {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const tenantQuery = trpc.organization.current.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!meQuery.data,
  });

  const user = meQuery.data ?? null;
  const tenant = tenantQuery.data ?? null;

  // Fallback for dev / unauthenticated
  const organizationId = (tenant as any)?.id ?? 1;
  const staffId = (user as any)?.id ?? (user as any)?.orgUser?.id ?? 1;
  const staffName = (user as any)?.name ?? '員工';
  const isLoading = meQuery.isLoading || (!!meQuery.data && tenantQuery.isLoading);

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
