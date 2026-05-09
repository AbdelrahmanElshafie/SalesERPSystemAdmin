// Subscription Plans Hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubscriptionPlans,
  getSubscriptionPlan,
  getActiveSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from '@/lib/firebase/firestore';
import type { SubscriptionPlan, SubscriptionPlanFormData } from '@/types/models';
import { toast } from '@/hooks/useToast';

// Query keys
const PLANS_KEY = ['subscriptionPlans'];
const PLAN_KEY = (id: string) => ['subscriptionPlans', id];
const ACTIVE_PLANS_KEY = ['subscriptionPlans', 'active'];

// Combined hook to get all subscription plans with mutations
export function useSubscriptionPlans() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PLANS_KEY,
    queryFn: getSubscriptionPlans,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const createMutation = useMutation({
    mutationFn: async (data: SubscriptionPlanFormData) => {
      return createSubscriptionPlan(data as Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANS_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVE_PLANS_KEY });
      toast({ title: 'Subscription plan created successfully', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create subscription plan', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SubscriptionPlanFormData> }) => {
      return updateSubscriptionPlan(id, data as Partial<SubscriptionPlan>);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PLANS_KEY });
      queryClient.invalidateQueries({ queryKey: PLAN_KEY(id) });
      queryClient.invalidateQueries({ queryKey: ACTIVE_PLANS_KEY });
      toast({ title: 'Subscription plan updated successfully', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update subscription plan', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubscriptionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANS_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVE_PLANS_KEY });
      toast({ title: 'Subscription plan deleted successfully', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete subscription plan', description: error.message, variant: 'destructive' });
    },
  });

  return {
    plans: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createPlan: createMutation.mutateAsync,
    updatePlan: updateMutation.mutateAsync,
    deletePlan: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Hook to get active subscription plans
export function useActiveSubscriptionPlans() {
  const query = useQuery({
    queryKey: ACTIVE_PLANS_KEY,
    queryFn: getActiveSubscriptionPlans,
    staleTime: 1000 * 60 * 10,
  });

  return {
    plans: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// Hook to get a single subscription plan
export function useSubscriptionPlan(id: string | undefined) {
  const query = useQuery({
    queryKey: PLAN_KEY(id || ''),
    queryFn: () => (id ? getSubscriptionPlan(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });

  return {
    plan: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
