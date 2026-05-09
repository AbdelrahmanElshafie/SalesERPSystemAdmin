// Auth Store - System Admin Authentication State
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SystemAdmin, SystemAdminRole } from '@/types/models';

interface AuthState {
  admin: SystemAdmin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAdmin: (admin: SystemAdmin | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;

  // Role checks
  hasRole: (roles: SystemAdminRole[]) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isSupport: () => boolean;

  // Permission checks
  canManageCompanies: () => boolean;
  canManageUsers: () => boolean;
  canManagePayments: () => boolean;
  canManagePlans: () => boolean;
  canViewLogs: () => boolean;
  canManageSettings: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      // Actions
      setAdmin: (admin) => {
        set({
          admin,
          isAuthenticated: !!admin,
          isLoading: false,
          error: null,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      logout: () => {
        set({
          admin: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      // Role checks
      hasRole: (roles) => {
        const { admin } = get();
        if (!admin) return false;
        return roles.includes(admin.role);
      },

      isSuperAdmin: () => {
        const { admin } = get();
        return admin?.role === 'super_admin';
      },

      isAdmin: () => {
        const { admin } = get();
        return admin?.role === 'admin' || admin?.role === 'super_admin';
      },

      isSupport: () => {
        const { admin } = get();
        return admin?.role === 'support';
      },

      // Permission checks - Super admins can do everything
      canManageCompanies: () => {
        const { admin, isSuperAdmin, isAdmin } = get();
        if (!admin) return false;
        if (isSuperAdmin()) return true;
        if (isAdmin()) return true;
        return admin.permissions?.includes('manage_companies') ?? false;
      },

      canManageUsers: () => {
        const { admin, isSuperAdmin, isAdmin } = get();
        if (!admin) return false;
        if (isSuperAdmin()) return true;
        if (isAdmin()) return true;
        return admin.permissions?.includes('manage_users') ?? false;
      },

      canManagePayments: () => {
        const { admin, isSuperAdmin, isAdmin } = get();
        if (!admin) return false;
        if (isSuperAdmin()) return true;
        if (isAdmin()) return true;
        return admin.permissions?.includes('manage_payments') ?? false;
      },

      canManagePlans: () => {
        const { admin, isSuperAdmin } = get();
        if (!admin) return false;
        if (isSuperAdmin()) return true;
        return admin.permissions?.includes('manage_plans') ?? false;
      },

      canViewLogs: () => {
        const { admin, isSuperAdmin, isAdmin } = get();
        if (!admin) return false;
        if (isSuperAdmin()) return true;
        if (isAdmin()) return true;
        return admin.permissions?.includes('view_logs') ?? false;
      },

      canManageSettings: () => {
        const { admin, isSuperAdmin } = get();
        if (!admin) return false;
        return isSuperAdmin() || (admin.permissions?.includes('manage_settings') ?? false);
      },
    }),
    {
      name: 'system-admin-auth',
      partialize: (state) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
