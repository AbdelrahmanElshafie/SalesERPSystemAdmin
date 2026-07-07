// Authentication Hook
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  signIn as firebaseSignIn,
  signOut as firebaseSignOut,
  resetPassword as firebaseResetPassword,
  onAuthChanged,
  getSystemAdmin,
} from '@/lib/firebase';

export const useAuth = () => {
  const {
    admin,
    isAuthenticated,
    isLoading,
    error,
    setAdmin,
    setLoading,
    setError,
    logout: storeLogout,
    hasRole,
    isSuperAdmin,
    isAdmin,
    isSupport,
    canManageCompanies,
    canManageUsers,
    canManagePayments,
    canManagePlans,
    canViewLogs,
    canManageSettings,
  } = useAuthStore();

  // Initialize auth state from Firebase
  useEffect(() => {
    const unsubscribe = onAuthChanged(async (user) => {
      if (user) {
        try {
          const adminData = await getSystemAdmin(user.uid);
          if (adminData && adminData.isActive) {
            setAdmin(adminData);
          } else {
            // User exists but not a system admin
            await firebaseSignOut();
            storeLogout();
          }
        } catch (err) {
          console.error('Error loading admin data:', err);
          await firebaseSignOut();
          storeLogout();
        }
      } else {
        storeLogout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setAdmin, setLoading, storeLogout]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { admin } = await firebaseSignIn(email, password);
      setAdmin(admin);
      return admin;
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      let errorMessage = 'Login failed. Please try again.';

      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setAdmin, setLoading, setError]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await firebaseSignOut();
      storeLogout();
    } catch (err) {
      console.error('Logout error:', err);
      storeLogout();
    }
  }, [storeLogout]);

  // Forgot password
  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      await firebaseResetPassword(email);
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      let errorMessage = 'Failed to send reset email.';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  return {
    // State
    admin,
    isAuthenticated,
    isLoading,
    error,

    // Methods
    login,
    logout,
    forgotPassword,

    // Role checks
    hasRole,
    isSuperAdmin,
    isAdmin,
    isSupport,

    // Permission checks
    canManageCompanies,
    canManageUsers,
    canManagePayments,
    canManagePlans,
    canViewLogs,
    canManageSettings,
  };
};

// Hook to require authentication
export const useRequireAuth = (redirectTo: string = '/login') => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
};

// Hook to require specific roles
export const useRequireRole = (
  allowedRoles: ('super_admin' | 'admin' | 'support')[],
  redirectTo: string = '/unauthorized'
) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else if (!hasRole(allowedRoles)) {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, hasRole, allowedRoles, navigate, redirectTo]);

  return { isAuthenticated, isLoading, hasAccess: hasRole(allowedRoles) };
};
