// Firebase Authentication for System Admin
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './config';
import { getSystemAdmin, updateAdminLastLogin, isSystemAdmin } from './firestore';
import type { SystemAdmin } from '@/types/models';

export interface AuthResult {
  user: User;
  admin: SystemAdmin;
}

/**
 * Sign in as a system admin
 */
export const signIn = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  // First, sign in with Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  let admin: SystemAdmin | null;
  try {
    // Check if user is a system admin
    admin = await getSystemAdmin(user.uid);
  } catch (error) {
    await firebaseSignOut(auth);
    throw error;
  }

  if (!admin) {
    await firebaseSignOut(auth);
    throw new Error('Access denied. You are not a system administrator.');
  }

  if (!admin.isActive) {
    await firebaseSignOut(auth);
    throw new Error('Your account has been deactivated. Please contact support.');
  }

  // Update last login
  await updateAdminLastLogin(user.uid);

  return { user, admin };
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Subscribe to auth state changes
 */
export const onAuthChanged = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Check if current user is a system admin
 */
export const checkIsSystemAdmin = async (): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user) return false;
  return isSystemAdmin(user.uid);
};

/**
 * Get current admin data
 */
export const getCurrentAdmin = async (): Promise<SystemAdmin | null> => {
  const user = getCurrentUser();
  if (!user) return null;
  return getSystemAdmin(user.uid);
};

export { auth };
