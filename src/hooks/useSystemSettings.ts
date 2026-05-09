// System Settings Hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSystemSettings, updateSystemSettings } from '@/lib/firebase/firestore';
import type { SystemSettings } from '@/types/models';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/useToast';

const SETTINGS_KEY = ['systemSettings'];

export function useSystemSettings() {
  const queryClient = useQueryClient();
  const { admin } = useAuthStore();

  const query = useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: getSystemSettings,
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SystemSettings>) => {
      if (!admin) throw new Error('Not authenticated');
      return updateSystemSettings(data, admin.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
      toast({ title: 'Settings saved successfully', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to save settings', description: error.message, variant: 'destructive' });
    },
  });

  // Default settings if none exist
  const defaultSettings: Omit<SystemSettings, 'id' | 'updatedAt' | 'updatedBy'> = {
    systemName: 'Sales ERP',
    supportEmail: 'support@saleserp.com',
    supportPhone: '',
    defaultLimits: {
      maxUsers: 5,
      maxClients: 100,
      maxVendors: 50,
      maxInvoices: 100,
      maxBills: 100,
      maxProducts: 500,
      maxWarehouses: 2,
      storageGB: 5,
    },
    defaultTrialDays: 14,
    trialFeatures: [],
    gracePeriodDays: 7,
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    maintenanceMode: false,
    maintenanceMessage: '',
  };

  return {
    settings: query.data || defaultSettings as SystemSettings,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
