// Company Payments Hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllPayments,
  getCompanyPayment,
  getPaymentsByCompany,
  getRecentPayments,
  createPayment,
  updatePayment,
  getRevenueStats,
} from '@/lib/firebase/firestore';
import type { CompanyPayment, PaymentFormData } from '@/types/models';
import { Timestamp } from 'firebase/firestore';
import { toast } from '@/hooks/useToast';

// Query keys
const ALL_PAYMENTS_KEY = ['payments', 'all'];
const PAYMENT_KEY = (id: string) => ['payments', id];
const COMPANY_PAYMENTS_KEY = (companyId: string) => ['payments', 'company', companyId];
const RECENT_PAYMENTS_KEY = ['payments', 'recent'];
const REVENUE_STATS_KEY = ['payments', 'revenue'];

// Combined hook to get all payments with mutations
export function useAllPayments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ALL_PAYMENTS_KEY,
    queryFn: getAllPayments,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: async (data: PaymentFormData & { companyName: string; processedBy: string; processedByName: string }) => {
      const paymentData: Omit<CompanyPayment, 'id' | 'createdAt'> = {
        companyId: data.companyId,
        companyName: data.companyName,
        amount: data.amount,
        currency: data.currency,
        type: data.type,
        status: 'completed', // Default to completed
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        subscriptionPlanId: data.subscriptionPlanId,
        periodStart: data.periodStart ? Timestamp.fromDate(data.periodStart) : undefined,
        periodEnd: data.periodEnd ? Timestamp.fromDate(data.periodEnd) : undefined,
        notes: data.notes,
        processedBy: data.processedBy,
        processedByName: data.processedByName,
      };
      return createPayment(paymentData);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ALL_PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: COMPANY_PAYMENTS_KEY(data.companyId) });
      queryClient.invalidateQueries({ queryKey: RECENT_PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: REVENUE_STATS_KEY });
      queryClient.invalidateQueries({ queryKey: ['companies', data.companyId] });
      toast({ title: 'Payment recorded successfully', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to record payment', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyPayment> }) => {
      return updatePayment(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ALL_PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEY(id) });
      queryClient.invalidateQueries({ queryKey: RECENT_PAYMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: REVENUE_STATS_KEY });
      toast({ title: 'Payment updated successfully', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update payment', description: error.message, variant: 'destructive' });
    },
  });

  return {
    payments: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createPayment: createMutation.mutateAsync,
    updatePayment: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

// Hook to get a single payment
export function usePayment(id: string | undefined) {
  const query = useQuery({
    queryKey: PAYMENT_KEY(id || ''),
    queryFn: () => (id ? getCompanyPayment(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    payment: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// Hook to get payments for a specific company
export function useCompanyPayments(companyId: string | undefined) {
  const query = useQuery({
    queryKey: COMPANY_PAYMENTS_KEY(companyId || ''),
    queryFn: () => (companyId ? getPaymentsByCompany(companyId) : []),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    payments: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// Hook to get recent payments
export function useRecentPayments(limit: number = 10) {
  const query = useQuery({
    queryKey: [...RECENT_PAYMENTS_KEY, limit],
    queryFn: () => getRecentPayments(limit),
    staleTime: 1000 * 60 * 5,
  });

  return {
    payments: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// Hook to get revenue statistics
export function useRevenueStats() {
  const query = useQuery({
    queryKey: REVENUE_STATS_KEY,
    queryFn: getRevenueStats,
    staleTime: 1000 * 60 * 5,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
