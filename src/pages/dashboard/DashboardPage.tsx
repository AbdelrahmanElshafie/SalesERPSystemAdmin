import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Users,
  CreditCard,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Company, CompanyPayment } from '@/types/models';
import { StatsCard } from '@/components/common/stats-card';
import { StatusBadge } from '@/components/common/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  monthlyRevenue: number;
  trialCompanies: number;
  expiredSubscriptions: number;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const companiesRef = collection(db, 'companies');

  // Fetch all companies
  const companiesSnapshot = await getDocs(companiesRef);
  const companies = companiesSnapshot.docs.map(doc => doc.data() as Company);

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const trialCompanies = companies.filter(c => c.subscriptionStatus === 'trial').length;
  const expiredSubscriptions = companies.filter(c => c.subscriptionStatus === 'expired').length;
  const totalUsers = companies.reduce((sum, c) => sum + (c.usage?.usersCount || 0), 0);

  // Fetch payments for this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const paymentsRef = collection(db, 'companyPayments');
  const paymentsQuery = query(
    paymentsRef,
    where('status', '==', 'completed'),
    where('createdAt', '>=', startOfMonth)
  );
  const paymentsSnapshot = await getDocs(paymentsQuery);
  const monthlyRevenue = paymentsSnapshot.docs.reduce(
    (sum, doc) => sum + (doc.data().amount || 0),
    0
  );

  return {
    totalCompanies,
    activeCompanies,
    totalUsers,
    monthlyRevenue,
    trialCompanies,
    expiredSubscriptions,
  };
}

async function fetchRecentCompanies(): Promise<Company[]> {
  const companiesRef = collection(db, 'companies');
  const q = query(companiesRef, orderBy('createdAt', 'desc'), limit(5));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
}

async function fetchRecentPayments(): Promise<CompanyPayment[]> {
  const paymentsRef = collection(db, 'companyPayments');
  const q = query(paymentsRef, orderBy('createdAt', 'desc'), limit(5));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CompanyPayment));
}

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const { data: recentCompanies, isLoading: companiesLoading } = useQuery({
    queryKey: ['recent-companies'],
    queryFn: fetchRecentCompanies,
  });

  const { data: recentPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['recent-payments'],
    queryFn: fetchRecentPayments,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of the Sales ERP platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Total Companies"
              value={stats?.totalCompanies || 0}
              description={`${stats?.activeCompanies || 0} active`}
              icon={<Building2 className="h-4 w-4" />}
            />
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              description="Across all companies"
              icon={<Users className="h-4 w-4" />}
            />
            <StatsCard
              title="Monthly Revenue"
              value={`$${(stats?.monthlyRevenue || 0).toLocaleString()}`}
              description="This month"
              icon={<DollarSign className="h-4 w-4" />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Trials"
              value={stats?.trialCompanies || 0}
              description={`${stats?.expiredSubscriptions || 0} expired`}
              icon={<CreditCard className="h-4 w-4" />}
            />
          </>
        )}
      </div>

      {/* Alerts */}
      {stats && stats.expiredSubscriptions > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-700 dark:text-yellow-500">
                {stats.expiredSubscriptions} company subscriptions have expired
              </p>
              <p className="text-sm text-yellow-600/80">
                Review and contact these companies to renew their subscriptions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Data */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Recent Companies
            </CardTitle>
            <CardDescription>Latest registered companies</CardDescription>
          </CardHeader>
          <CardContent>
            {companiesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCompanies?.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>
                        <StatusBadge status={company.status} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={company.subscriptionStatus} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!recentCompanies || recentCompanies.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No companies found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Payments
            </CardTitle>
            <CardDescription>Latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.companyName}
                      </TableCell>
                      <TableCell>
                        ${payment.amount.toLocaleString()} {payment.currency}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!recentPayments || recentPayments.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No payments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
