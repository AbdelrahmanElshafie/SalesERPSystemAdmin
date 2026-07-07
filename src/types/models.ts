import { Timestamp } from 'firebase/firestore';

// ============================================
// ADDRESS
// ============================================

export interface Address {
  street?: string;
  district?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// ============================================
// COMPANY
// ============================================

export interface CompanyLimits {
  maxUsers: number;      // -1 = unlimited
  maxClients: number;
  maxVendors: number;
  maxInvoices: number;   // per month
  maxBills: number;      // per month
  maxProducts: number;
  maxWarehouses: number;
  storageGB: number;
}

export interface CompanyUsage {
  usersCount: number;
  clientsCount: number;
  vendorsCount: number;
  invoicesThisMonth: number;
  billsThisMonth: number;
  productsCount: number;
  warehousesCount: number;
  storageUsedMB: number;
}

export interface FeatureSettings {
  multiWarehouse: boolean;
  inventoryManagement: boolean;
  salesTracking: boolean;
  clientManagement: boolean;
  vendorManagement: boolean;
  expenseTracking: boolean;
  reportGeneration: boolean;
  apiAccess: boolean;
}

export type CompanyStatus = 'pending' | 'active' | 'suspended' | 'cancelled';
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';

export interface Company {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  logo?: string;

  // Contact
  email: string;
  phone: string;
  website?: string;
  address?: Address;

  // Business Info
  commercialRegistration?: string;
  taxNumber?: string;

  // Status
  isActive: boolean;
  status: CompanyStatus;

  // Subscription
  subscriptionPlanId: string;
  subscriptionStatus: SubscriptionStatus;
  trialStartDate?: Timestamp;
  trialEndDate?: Timestamp;
  subscriptionStartDate?: Timestamp;
  subscriptionEndDate?: Timestamp;
  autoRenew: boolean;

  // Limits (-1 = unlimited)
  limits: CompanyLimits;

  // Usage (current counts)
  usage: CompanyUsage;

  // Financial
  balance: number;
  currency: string;

  // Settings
  features: FeatureSettings;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  adminUserId?: string;
}

// ============================================
// SUBSCRIPTION PLAN
// ============================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;

  // Pricing
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;

  // Limits
  limits: CompanyLimits;

  // Features
  features: string[];

  // Trial
  trialDays: number;

  isActive: boolean;
  sortOrder: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// SYSTEM ADMIN
// ============================================

export type SystemAdminRole = 'super_admin' | 'admin' | 'support';

export interface SystemAdmin {
  id: string;
  email: string;
  name: string;
  role: SystemAdminRole;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// COMPANY USER (Users within companies)
// ============================================

export type UserRole = 'admin' | 'manager' | 'accountant' | 'sales_rep' | 'inventory_keeper' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface CompanyUser {
  id: string;
  companyId: string;
  companyName?: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  lastLogin?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// COMPANY PAYMENT
// ============================================

export type PaymentType = 'subscription' | 'addon' | 'overage' | 'refund';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'other';

export interface CompanyPayment {
  id: string;
  companyId: string;
  companyName: string;

  amount: number;
  currency: string;

  type: PaymentType;
  status: PaymentStatus;

  paymentMethod: PaymentMethod;
  paymentReference?: string;

  subscriptionPlanId?: string;
  periodStart?: Timestamp;
  periodEnd?: Timestamp;

  notes?: string;

  processedBy: string;
  processedByName?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ============================================
// SYSTEM LOG
// ============================================

export type LogAction =
  | 'company_created'
  | 'company_updated'
  | 'company_activated'
  | 'company_suspended'
  | 'company_deleted'
  | 'subscription_changed'
  | 'payment_recorded'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_password_reset'
  | 'admin_login'
  | 'admin_logout'
  | 'settings_updated'
  | 'plan_created'
  | 'plan_updated'
  | 'plan_deleted';

export interface SystemLog {
  id: string;
  action: LogAction;
  description: string;

  adminId: string;
  adminName: string;
  adminEmail: string;

  targetType?: 'company' | 'user' | 'payment' | 'plan' | 'settings';
  targetId?: string;
  targetName?: string;

  metadata?: Record<string, unknown>;

  ipAddress?: string;
  userAgent?: string;

  createdAt: Timestamp;
}

// ============================================
// SYSTEM SETTINGS
// ============================================

export interface SystemSettings {
  id: string;

  // General
  systemName: string;
  supportEmail: string;
  supportPhone?: string;

  // Default limits for new companies
  defaultLimits: CompanyLimits;

  // Trial settings
  defaultTrialDays: number;
  trialFeatures: string[];

  // Grace period settings
  gracePeriodDays: number;

  // Notification settings
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;

  // Maintenance mode
  maintenanceMode: boolean;
  maintenanceMessage?: string;

  updatedAt: Timestamp;
  updatedBy: string;
}

// ============================================
// DASHBOARD STATS
// ============================================

export interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  trialCompanies: number;
  suspendedCompanies: number;

  totalUsers: number;
  activeUsers: number;

  totalRevenue: number;
  monthlyRevenue: number;

  recentPayments: CompanyPayment[];
  recentCompanies: Company[];

  companiesByPlan: Record<string, number>;
  companiesByStatus: Record<string, number>;
}

// ============================================
// FORM TYPES
// ============================================

export interface CompanyFormData {
  name: string;
  nameAr?: string;
  slug?: string;
  email: string;
  phone: string;
  website?: string;
  address?: Address;
  commercialRegistration?: string;
  taxNumber?: string;
  isActive?: boolean;
  status?: CompanyStatus;
  subscriptionPlanId: string;
  subscriptionStatus?: SubscriptionStatus;
  autoRenew?: boolean;
  limits?: CompanyLimits;
  features?: FeatureSettings;
  currency?: string;
  initialUserName?: string;
  initialUserEmail?: string;
  initialUserPhone?: string;
  initialUserPassword?: string;
}

export interface SubscriptionPlanFormData {
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  limits: CompanyLimits;
  features?: string[];
  trialDays: number;
  isActive: boolean;
  sortOrder: number;
}

export interface PaymentFormData {
  companyId: string;
  amount: number;
  currency: string;
  type: PaymentType;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  subscriptionPlanId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  notes?: string;
}

export interface UserFormData {
  companyId: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  password?: string;
}
