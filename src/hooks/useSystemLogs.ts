// System Logs Hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRecentLogs,
  getLogsByAdmin,
  getLogsByTarget,
  createSystemLog,
} from '@/lib/firebase/firestore';
import type { LogAction } from '@/types/models';

// Query keys
const RECENT_LOGS_KEY = ['systemLogs', 'recent'];
const ADMIN_LOGS_KEY = (adminId: string) => ['systemLogs', 'admin', adminId];
const TARGET_LOGS_KEY = (targetType: string, targetId: string) => ['systemLogs', 'target', targetType, targetId];

// Combined hook to get system logs with mutations
export function useSystemLogs(limit: number = 50) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...RECENT_LOGS_KEY, limit],
    queryFn: () => getRecentLogs(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const createMutation = useMutation({
    mutationFn: async ({
      action,
      description,
      admin,
      target,
      metadata,
    }: {
      action: LogAction;
      description: string;
      admin: { id: string; name: string; email: string };
      target?: { type: 'company' | 'user' | 'payment' | 'plan' | 'settings'; id: string; name: string };
      metadata?: Record<string, unknown>;
    }) => {
      return createSystemLog(action, description, admin, target, metadata);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECENT_LOGS_KEY });
    },
  });

  return {
    logs: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createLog: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

// Hook to get logs by admin
export function useAdminLogs(adminId: string | undefined) {
  const query = useQuery({
    queryKey: ADMIN_LOGS_KEY(adminId || ''),
    queryFn: () => (adminId ? getLogsByAdmin(adminId) : []),
    enabled: !!adminId,
    staleTime: 1000 * 60 * 2,
  });

  return {
    logs: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// Hook to get logs by target
export function useTargetLogs(targetType: string | undefined, targetId: string | undefined) {
  const query = useQuery({
    queryKey: TARGET_LOGS_KEY(targetType || '', targetId || ''),
    queryFn: () => (targetType && targetId ? getLogsByTarget(targetType, targetId) : []),
    enabled: !!targetType && !!targetId,
    staleTime: 1000 * 60 * 2,
  });

  return {
    logs: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
