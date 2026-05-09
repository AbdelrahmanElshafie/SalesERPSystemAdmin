// Utility Functions
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

// ============================================
// CLASS UTILITIES
// ============================================

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// DATE UTILITIES
// ============================================

// Format Firestore timestamp
export const formatTimestamp = (
  timestamp: Timestamp | null | undefined,
  formatStr: string = 'PPP'
): string => {
  if (!timestamp) return '-';
  const date = timestamp.toDate();
  return format(date, formatStr, { locale: enUS });
};

// Format date
export const formatDate = (
  date: Date | Timestamp | string | null | undefined,
  formatStr: string = 'PPP'
): string => {
  if (!date) return '-';
  let dateObj: Date;
  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }
  if (!isValid(dateObj)) return '-';
  return format(dateObj, formatStr, { locale: enUS });
};

// Format time
export const formatTime = (
  date: Date | Timestamp | null | undefined
): string => {
  if (!date) return '-';
  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  return format(dateObj, 'p', { locale: enUS });
};

// Format date and time
export const formatDateTime = (
  date: Date | Timestamp | null | undefined
): string => {
  if (!date) return '-';
  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  return format(dateObj, 'PPp', { locale: enUS });
};

// Format relative time
export const formatRelativeTime = (
  date: Date | Timestamp | null | undefined
): string => {
  if (!date) return '-';
  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: enUS });
};

// Get today's date as string
export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

// ============================================
// NUMBER & CURRENCY UTILITIES
// ============================================

// Format currency
export const formatCurrency = (
  amount: number | null | undefined,
  currency: string = 'SAR',
  locale: string = 'en-US'
): string => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format number
export const formatNumber = (
  num: number | null | undefined,
  locale: string = 'en-US'
): string => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat(locale).format(num);
};

// Format percentage
export const formatPercent = (
  value: number | null | undefined,
  locale: string = 'en-US'
): string => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

// Format bytes to human readable
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// ============================================
// STRING UTILITIES
// ============================================

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate string
export const truncate = (str: string, length: number = 50): string => {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

// Generate initials from name
export const getInitials = (name: string | null | undefined, maxLength: number = 2): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, maxLength)
    .join('')
    .toUpperCase();
};

// Format phone number
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('966')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
};

// Slugify string
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ============================================
// VALIDATION UTILITIES
// ============================================

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^\+?\d{8,15}$/;
  return phoneRegex.test(cleaned);
};

// ============================================
// OBJECT UTILITIES
// ============================================

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Remove undefined values from object
export const removeUndefined = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key as keyof T] = value as T[keyof T];
    }
  }
  return result;
};

// ============================================
// ID GENERATION
// ============================================

// Generate short ID
export const generateShortId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// ============================================
// STATUS & COLOR UTILITIES
// ============================================

// Get status color
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    trial: 'bg-blue-100 text-blue-800',
    suspended: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    expired: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Get status variant for Badge component
export const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'> = {
    active: 'success',
    pending: 'warning',
    trial: 'info',
    suspended: 'destructive',
    cancelled: 'secondary',
    expired: 'warning',
    completed: 'success',
    failed: 'destructive',
    refunded: 'secondary',
  };
  return variants[status] || 'default';
};

// Get role label
export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    support: 'Support',
    manager: 'Manager',
    accountant: 'Accountant',
    sales_rep: 'Sales Rep',
    inventory_keeper: 'Inventory Keeper',
    viewer: 'Viewer',
  };
  return labels[role] || role;
};

// Get status label
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: 'Active',
    pending: 'Pending',
    trial: 'Trial',
    suspended: 'Suspended',
    cancelled: 'Cancelled',
    expired: 'Expired',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded',
    inactive: 'Inactive',
  };
  return labels[status] || status;
};

// Get payment type label
export const getPaymentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    subscription: 'Subscription',
    addon: 'Add-on',
    overage: 'Overage',
    refund: 'Refund',
  };
  return labels[type] || type;
};

// Get payment method label
export const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    bank_transfer: 'Bank Transfer',
    credit_card: 'Credit Card',
    cash: 'Cash',
    other: 'Other',
  };
  return labels[method] || method;
};

// ============================================
// LIMIT UTILITIES
// ============================================

// Check if limit is unlimited
export const isUnlimited = (value: number): boolean => {
  return value === -1;
};

// Format limit value
export const formatLimit = (value: number): string => {
  if (value === -1) return 'Unlimited';
  return formatNumber(value);
};

// Calculate usage percentage
export const calculateUsagePercent = (used: number, limit: number): number => {
  if (limit === -1) return 0; // Unlimited
  if (limit === 0) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
};

// Get usage status
export const getUsageStatus = (used: number, limit: number): 'normal' | 'warning' | 'critical' => {
  if (limit === -1) return 'normal'; // Unlimited
  const percent = calculateUsagePercent(used, limit);
  if (percent >= 90) return 'critical';
  if (percent >= 75) return 'warning';
  return 'normal';
};
