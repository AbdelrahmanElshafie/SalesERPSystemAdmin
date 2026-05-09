// Company Users Hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsers,
  getCompanyUsers,
  getCompanyUser,
  createCompanyUser,
  updateCompanyUser,
  deleteCompanyUser,
} from '@/lib/firebase/firestore';
import { createUserWithoutSignIn, resetUserPassword } from '@/lib/firebase/config';
import type { CompanyUser, UserFormData } from '@/types/models';
import { toast } from '@/hooks/useToast';

// Query keys
const ALL_USERS_KEY = ['users', 'all'];
const COMPANY_USERS_KEY = (companyId: string) => ['users', 'company', companyId];
const USER_KEY = (companyId: string, userId: string) => ['users', companyId, userId];

// Combined hook to get all users across all companies with mutations
export function useAllUsers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ALL_USERS_KEY,
    queryFn: getAllUsers,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      if (!data.password) {
        throw new Error('Password is required');
      }

      // Create Firebase Auth user
      const userId = await createUserWithoutSignIn(data.email, data.password);

      // Create user document in Firestore
      await createCompanyUser(data.companyId, userId, {
        companyId: data.companyId,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role,
        status: 'active',
      });

      return userId;
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ALL_USERS_KEY });
      queryClient.invalidateQueries({ queryKey: COMPANY_USERS_KEY(data.companyId) });
      toast({ title: 'User created successfully', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create user', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      companyId,
      userId,
      data,
    }: {
      companyId: string;
      userId: string;
      data: Partial<CompanyUser>;
    }) => {
      return updateCompanyUser(companyId, userId, data);
    },
    onSuccess: (_, { companyId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ALL_USERS_KEY });
      queryClient.invalidateQueries({ queryKey: COMPANY_USERS_KEY(companyId) });
      queryClient.invalidateQueries({ queryKey: USER_KEY(companyId, userId) });
      toast({ title: 'User updated successfully', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update user', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ companyId, userId }: { companyId: string; userId: string }) => {
      return deleteCompanyUser(companyId, userId);
    },
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ALL_USERS_KEY });
      queryClient.invalidateQueries({ queryKey: COMPANY_USERS_KEY(companyId) });
      toast({ title: 'User deleted successfully', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete user', description: error.message, variant: 'destructive' });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ companyId, userId }: { companyId: string; userId: string }) => {
      return updateCompanyUser(companyId, userId, { status: 'suspended' });
    },
    onSuccess: (_, { companyId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ALL_USERS_KEY });
      queryClient.invalidateQueries({ queryKey: COMPANY_USERS_KEY(companyId) });
      queryClient.invalidateQueries({ queryKey: USER_KEY(companyId, userId) });
      toast({ title: 'User suspended successfully', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to suspend user', description: error.message, variant: 'destructive' });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async ({ companyId, userId }: { companyId: string; userId: string }) => {
      return updateCompanyUser(companyId, userId, { status: 'active' });
    },
    onSuccess: (_, { companyId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ALL_USERS_KEY });
      queryClient.invalidateQueries({ queryKey: COMPANY_USERS_KEY(companyId) });
      queryClient.invalidateQueries({ queryKey: USER_KEY(companyId, userId) });
      toast({ title: 'User activated successfully', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to activate user', description: error.message, variant: 'destructive' });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return resetUserPassword(email);
    },
    onSuccess: () => {
      toast({ title: 'Password reset email sent successfully', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to send password reset email', description: error.message, variant: 'destructive' });
    },
  });

  return {
    users: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    suspendUser: suspendMutation.mutateAsync,
    activateUser: activateMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSuspending: suspendMutation.isPending,
    isActivating: activateMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
  };
}

// Hook to get users for a specific company
export function useCompanyUsers(companyId: string | undefined) {
  const query = useQuery({
    queryKey: COMPANY_USERS_KEY(companyId || ''),
    queryFn: () => (companyId ? getCompanyUsers(companyId) : []),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    users: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// Hook to get a single user
export function useCompanyUser(companyId: string | undefined, userId: string | undefined) {
  const query = useQuery({
    queryKey: USER_KEY(companyId || '', userId || ''),
    queryFn: () => (companyId && userId ? getCompanyUser(companyId, userId) : null),
    enabled: !!companyId && !!userId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
