import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

async function fetchAdminStatus(): Promise<{ isAdmin: boolean }> {
  const response = await fetch("/api/user/admin-status");
  if (!response.ok) {
    return { isAdmin: false };
  }
  return response.json();
}

export function useAdminStatus() {
  return useQuery({
    queryKey: queryKeys.user.adminStatus(),
    queryFn: fetchAdminStatus,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
