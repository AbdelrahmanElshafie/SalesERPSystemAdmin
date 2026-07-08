// Firestore Database Operations
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import type {
  Company,
  CompanyUser,
  SubscriptionPlan,
  SystemAdmin,
  CompanyPayment,
  SystemLog,
  SystemSettings,
  LogAction,
} from '@/types/models';

// ============================================
// GENERIC HELPERS
// ============================================

export const getDocument = async <T>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as T;
};

export const getDocuments = async <T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
};

export const addDocument = async <T extends Record<string, unknown>>(
  collectionName: string,
  data: T
): Promise<string> => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const setDocument = async <T extends Record<string, unknown>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> => {
  await setDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const updateDocument = async (
  collectionName: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> => {
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  await deleteDoc(doc(db, collectionName, docId));
};

export const subscribeToDocument = <T>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
): (() => void) => {
  return onSnapshot(doc(db, collectionName, docId), (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }
    callback({ id: docSnap.id, ...docSnap.data() } as T);
  });
};

export const subscribeToCollection = <T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void
): (() => void) => {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
    callback(results);
  });
};

// ============================================
// SYSTEM ADMIN OPERATIONS
// ============================================

export const getSystemAdmin = async (uid: string): Promise<SystemAdmin | null> => {
  return getDocument<SystemAdmin>('systemAdmins', uid);
};

export const isSystemAdmin = async (uid: string): Promise<boolean> => {
  const admin = await getSystemAdmin(uid);
  return admin !== null && admin.isActive;
};

export const updateAdminLastLogin = async (uid: string): Promise<void> => {
  await updateDocument('systemAdmins', uid, {
    lastLogin: Timestamp.now(),
  });
};

// ============================================
// COMPANY OPERATIONS
// ============================================

export const getCompany = async (id: string): Promise<Company | null> => {
  return getDocument<Company>('companies', id);
};

export const getCompanies = async (
  constraints: QueryConstraint[] = []
): Promise<Company[]> => {
  return getDocuments<Company>('companies', constraints);
};

export const getAllCompanies = async (): Promise<Company[]> => {
  return getCompanies([orderBy('createdAt', 'desc')]);
};

export const getActiveCompanies = async (): Promise<Company[]> => {
  return getCompanies([
    where('isActive', '==', true),
    orderBy('createdAt', 'desc'),
  ]);
};

export const getCompaniesByStatus = async (status: string): Promise<Company[]> => {
  return getCompanies([
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
  ]);
};

export const getCompaniesByPlan = async (planId: string): Promise<Company[]> => {
  return getCompanies([
    where('subscriptionPlanId', '==', planId),
    orderBy('createdAt', 'desc'),
  ]);
};

export const createCompany = async (
  data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  return addDocument('companies', data as Record<string, unknown>);
};

export const updateCompany = async (
  id: string,
  data: Partial<Company>
): Promise<void> => {
  await updateDocument('companies', id, data as Record<string, unknown>);
};

export const deleteCompany = async (id: string): Promise<void> => {
  await deleteDocument('companies', id);
};

export const activateCompany = async (id: string): Promise<void> => {
  await updateCompany(id, {
    isActive: true,
    status: 'active',
  });
};

export const suspendCompany = async (id: string): Promise<void> => {
  await updateCompany(id, {
    isActive: false,
    status: 'suspended',
  });
};

export const updateCompanyBalance = async (
  id: string,
  amount: number
): Promise<void> => {
  const companyRef = doc(db, 'companies', id);
  await updateDoc(companyRef, {
    balance: increment(amount),
    updatedAt: Timestamp.now(),
  });
};

// ============================================
// SUBSCRIPTION PLAN OPERATIONS
// ============================================

export const getSubscriptionPlan = async (id: string): Promise<SubscriptionPlan | null> => {
  return getDocument<SubscriptionPlan>('subscriptionPlans', id);
};

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  return getDocuments<SubscriptionPlan>('subscriptionPlans', [
    orderBy('sortOrder', 'asc'),
  ]);
};

export const getActiveSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  return getDocuments<SubscriptionPlan>('subscriptionPlans', [
    where('isActive', '==', true),
    orderBy('sortOrder', 'asc'),
  ]);
};

export const createSubscriptionPlan = async (
  data: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  return addDocument('subscriptionPlans', data as Record<string, unknown>);
};

export const updateSubscriptionPlan = async (
  id: string,
  data: Partial<SubscriptionPlan>
): Promise<void> => {
  await updateDocument('subscriptionPlans', id, data as Record<string, unknown>);
};

export const deleteSubscriptionPlan = async (id: string): Promise<void> => {
  await deleteDocument('subscriptionPlans', id);
};

// ============================================
// COMPANY USER OPERATIONS
// ============================================

export const getCompanyUser = async (
  companyId: string,
  userId: string
): Promise<CompanyUser | null> => {
  return getDocument<CompanyUser>(`companies/${companyId}/users`, userId);
};

export const getCompanyUsers = async (companyId: string): Promise<CompanyUser[]> => {
  return getDocuments<CompanyUser>(`companies/${companyId}/users`, [
    orderBy('createdAt', 'desc'),
  ]);
};

export const getAllUsers = async (): Promise<CompanyUser[]> => {
  // Get all companies first, then get users from each
  const companies = await getAllCompanies();
  const allUsers: CompanyUser[] = [];

  for (const company of companies) {
    const users = await getCompanyUsers(company.id);
    const usersWithCompanyName = users.map((user) => ({
      ...user,
      companyName: company.name,
    }));
    allUsers.push(...usersWithCompanyName);
  }

  return allUsers.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
};

export const createCompanyUser = async (
  companyId: string,
  userId: string,
  data: Omit<CompanyUser, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  await setDocument('users', userId, {
    ...data,
    id: userId,
    createdAt: Timestamp.now(),
  } as Record<string, unknown>);

  await setDocument(`companies/${companyId}/users`, userId, {
    ...data,
    createdAt: Timestamp.now(),
  } as Record<string, unknown>);

  // Update company user count
  const companyRef = doc(db, 'companies', companyId);
  await updateDoc(companyRef, {
    'usage.usersCount': increment(1),
    updatedAt: Timestamp.now(),
  });
};

export const updateCompanyUser = async (
  companyId: string,
  userId: string,
  data: Partial<CompanyUser>
): Promise<void> => {
  await updateDocument(`companies/${companyId}/users`, userId, data as Record<string, unknown>);
};

export const deleteCompanyUser = async (
  companyId: string,
  userId: string
): Promise<void> => {
  await deleteDocument(`companies/${companyId}/users`, userId);

  // Update company user count
  const companyRef = doc(db, 'companies', companyId);
  await updateDoc(companyRef, {
    'usage.usersCount': increment(-1),
    updatedAt: Timestamp.now(),
  });
};

// ============================================
// PAYMENT OPERATIONS
// ============================================

export const getCompanyPayment = async (id: string): Promise<CompanyPayment | null> => {
  return getDocument<CompanyPayment>('companyPayments', id);
};

export const getCompanyPayments = async (
  constraints: QueryConstraint[] = []
): Promise<CompanyPayment[]> => {
  return getDocuments<CompanyPayment>('companyPayments', constraints);
};

export const getAllPayments = async (): Promise<CompanyPayment[]> => {
  return getCompanyPayments([orderBy('createdAt', 'desc')]);
};

export const getPaymentsByCompany = async (companyId: string): Promise<CompanyPayment[]> => {
  return getCompanyPayments([
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc'),
  ]);
};

export const getRecentPayments = async (limitCount: number = 10): Promise<CompanyPayment[]> => {
  return getCompanyPayments([
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ]);
};

export const createPayment = async (
  data: Omit<CompanyPayment, 'id' | 'createdAt'>
): Promise<string> => {
  const paymentId = await addDocument('companyPayments', data as Record<string, unknown>);

  // If payment is completed, update company balance
  if (data.status === 'completed') {
    const amount = data.type === 'refund' ? -data.amount : data.amount;
    await updateCompanyBalance(data.companyId, amount);
  }

  return paymentId;
};

export const updatePayment = async (
  id: string,
  data: Partial<CompanyPayment>
): Promise<void> => {
  await updateDocument('companyPayments', id, data as Record<string, unknown>);
};

// ============================================
// SYSTEM LOG OPERATIONS
// ============================================

export const getSystemLogs = async (
  constraints: QueryConstraint[] = []
): Promise<SystemLog[]> => {
  return getDocuments<SystemLog>('systemLogs', constraints);
};

export const getRecentLogs = async (limitCount: number = 50): Promise<SystemLog[]> => {
  return getSystemLogs([
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ]);
};

export const getLogsByAdmin = async (adminId: string): Promise<SystemLog[]> => {
  return getSystemLogs([
    where('adminId', '==', adminId),
    orderBy('createdAt', 'desc'),
  ]);
};

export const getLogsByTarget = async (
  targetType: string,
  targetId: string
): Promise<SystemLog[]> => {
  return getSystemLogs([
    where('targetType', '==', targetType),
    where('targetId', '==', targetId),
    orderBy('createdAt', 'desc'),
  ]);
};

export const createSystemLog = async (
  action: LogAction,
  description: string,
  admin: { id: string; name: string; email: string },
  target?: { type: 'company' | 'user' | 'payment' | 'plan' | 'settings'; id: string; name: string },
  metadata?: Record<string, unknown>
): Promise<string> => {
  return addDocument('systemLogs', {
    action,
    description,
    adminId: admin.id,
    adminName: admin.name,
    adminEmail: admin.email,
    targetType: target?.type,
    targetId: target?.id,
    targetName: target?.name,
    metadata,
  });
};

// ============================================
// SYSTEM SETTINGS OPERATIONS
// ============================================

export const getSystemSettings = async (): Promise<SystemSettings | null> => {
  return getDocument<SystemSettings>('systemSettings', 'default');
};

export const updateSystemSettings = async (
  data: Partial<SystemSettings>,
  updatedBy: string
): Promise<void> => {
  await setDocument('systemSettings', 'default', {
    ...data,
    updatedBy,
    updatedAt: Timestamp.now(),
  } as Record<string, unknown>);
};

// ============================================
// STATISTICS OPERATIONS
// ============================================

export const getCompanyStats = async (): Promise<{
  total: number;
  active: number;
  trial: number;
  suspended: number;
  cancelled: number;
}> => {
  const companies = await getAllCompanies();

  return {
    total: companies.length,
    active: companies.filter((c) => c.status === 'active').length,
    trial: companies.filter((c) => c.subscriptionStatus === 'trial').length,
    suspended: companies.filter((c) => c.status === 'suspended').length,
    cancelled: companies.filter((c) => c.status === 'cancelled').length,
  };
};

export const getRevenueStats = async (): Promise<{
  total: number;
  thisMonth: number;
}> => {
  const payments = await getAllPayments();
  const completedPayments = payments.filter(
    (p) => p.status === 'completed' && p.type !== 'refund'
  );

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const total = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const thisMonth = completedPayments
    .filter((p) => p.createdAt.toDate() >= startOfMonth)
    .reduce((sum, p) => sum + p.amount, 0);

  return { total, thisMonth };
};

export { where, orderBy, limit, startAfter, Timestamp };
