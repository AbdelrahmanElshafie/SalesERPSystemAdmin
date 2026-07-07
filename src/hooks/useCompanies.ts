// Companies Hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllCompanies,
  getCompany,
  createCompany as createCompanyFn,
  createCompanyUser,
  updateCompany as updateCompanyFn,
  deleteCompany as deleteCompanyFn,
} from '@/lib/firebase/firestore';
import { createUserWithoutSignIn } from '@/lib/firebase/config';
import type { Company, CompanyFormData } from '@/types/models';

// Query keys
const COMPANIES_KEY = ['companies'];
const COMPANY_KEY = (id: string) => ['companies', id];
const COMPANY_STATS_KEY = ['companies', 'stats'];

// Hook to get all companies with mutations
export function useCompanies() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: COMPANIES_KEY,
    queryFn: getAllCompanies,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const initialUserName = data.initialUserName?.trim();
      const initialUserEmail = data.initialUserEmail?.trim();
      const initialUserPhone = data.initialUserPhone?.trim();
      const initialUserPassword = data.initialUserPassword;

      if (!initialUserName || !initialUserEmail || !initialUserPassword) {
        throw new Error('Initial company admin name, email, and password are required.');
      }

      const defaultLimits = {
        maxUsers: 5,
        maxClients: 100,
        maxVendors: 50,
        maxInvoices: 100,
        maxBills: 100,
        maxProducts: 500,
        maxWarehouses: 1,
        storageGB: 1,
      };
      const defaultFeatures = {
        multiWarehouse: false,
        inventoryManagement: true,
        salesTracking: true,
        clientManagement: true,
        vendorManagement: true,
        expenseTracking: false,
        reportGeneration: true,
        apiAccess: false,
      };
      const companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.name,
        nameAr: data.nameAr,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        email: data.email,
        phone: data.phone,
        website: data.website,
        address: data.address,
        commercialRegistration: data.commercialRegistration,
        taxNumber: data.taxNumber,
        isActive: data.isActive ?? true,
        status: data.status || 'active',
        subscriptionPlanId: data.subscriptionPlanId,
        subscriptionStatus: data.subscriptionStatus || 'trial',
        autoRenew: data.autoRenew ?? true,
        limits: data.limits || defaultLimits,
        usage: {
          usersCount: 0,
          clientsCount: 0,
          vendorsCount: 0,
          invoicesThisMonth: 0,
          billsThisMonth: 0,
          productsCount: 0,
          warehousesCount: 0,
          storageUsedMB: 0,
        },
        balance: 0,
        currency: data.currency || 'USD',
        features: data.features || defaultFeatures,
        createdBy: 'system', // Will be replaced with actual admin ID in firestore function
      };

      let companyId: string | undefined;

      try {
        companyId = await createCompanyFn(companyData);
        const userId = await createUserWithoutSignIn(
          initialUserEmail,
          initialUserPassword
        );

        await createCompanyUser(companyId, userId, {
          companyId,
          email: initialUserEmail,
          name: initialUserName,
          phone: initialUserPhone,
          role: 'admin',
          status: 'active',
        });

        await updateCompanyFn(companyId, { adminUserId: userId });

        return companyId;
      } catch (error) {
        if (companyId) {
          try {
            await deleteCompanyFn(companyId);
          } catch (rollbackError) {
            console.error('Failed to roll back company after user creation error:', rollbackError);
          }
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      queryClient.invalidateQueries({ queryKey: COMPANY_STATS_KEY });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyFormData> }) => {
      const companyData = { ...data };
      delete companyData.initialUserName;
      delete companyData.initialUserEmail;
      delete companyData.initialUserPhone;
      delete companyData.initialUserPassword;
      return updateCompanyFn(id, companyData as Partial<Company>);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      queryClient.invalidateQueries({ queryKey: COMPANY_KEY(id) });
      queryClient.invalidateQueries({ queryKey: COMPANY_STATS_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompanyFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });
      queryClient.invalidateQueries({ queryKey: COMPANY_STATS_KEY });
    },
  });

  return {
    companies: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createCompany: createMutation.mutateAsync,
    updateCompany: updateMutation.mutateAsync,
    deleteCompany: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Hook to get a single company
export function useCompany(id: string | undefined) {
  const query = useQuery({
    queryKey: COMPANY_KEY(id || ''),
    queryFn: () => (id ? getCompany(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    company: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
