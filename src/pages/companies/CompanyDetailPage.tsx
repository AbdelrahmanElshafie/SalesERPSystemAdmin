import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  FileText,
  CreditCard,
  Calendar,
  Power,
  PowerOff,
  MoreHorizontal,
  UserPlus,
  KeyRound,
  UserX,
  UserCheck,
  DollarSign,
} from 'lucide-react';
import { useCompany, useCompanies } from '@/hooks/useCompanies';
import { useCompanyUsers, useAllUsers } from '@/hooks/useCompanyUsers';
import { useCompanyPayments } from '@/hooks/useCompanyPayments';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/common/status-badge';
import { LimitIndicator } from '@/components/common/limit-indicator';
import { PageLoader } from '@/components/common/page-loader';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { company, isLoading } = useCompany(id);
  const { updateCompany, isUpdating } = useCompanies();
  const { users, isLoading: usersLoading } = useCompanyUsers(id);
  const { payments, isLoading: paymentsLoading } = useCompanyPayments(id);
  const { suspendUser, activateUser, resetPassword, isSuspending, isActivating, isResettingPassword } = useAllUsers();

  const handleToggleStatus = async () => {
    if (company) {
      await updateCompany({
        id: company.id,
        data: {
          isActive: !company.isActive,
          status: company.isActive ? 'suspended' : 'active',
        },
      });
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading company details..." />;
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-muted-foreground">Company not found</p>
        <Button onClick={() => navigate('/companies')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/companies')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{company.name}</h1>
                <StatusBadge status={company.status} />
              </div>
              {company.nameAr && (
                <p className="text-lg text-muted-foreground" dir="rtl">
                  {company.nameAr}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={isUpdating}
          >
            {company.isActive ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          <Button onClick={() => navigate(`/companies/${company.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{company.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{company.phone}</p>
                </div>
              </div>
              {company.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>
              )}
              {company.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {[
                        company.address.street,
                        company.address.city,
                        company.address.state,
                        company.address.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {company.commercialRegistration && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Commercial Registration</p>
                    <p className="font-medium">{company.commercialRegistration}</p>
                  </div>
                </div>
              )}
              {company.taxNumber && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Number</p>
                    <p className="font-medium">{company.taxNumber}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-medium capitalize">{company.subscriptionPlanId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <StatusBadge status={company.subscriptionStatus} />
                  </div>
                </div>
                {company.subscriptionStartDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">
                        {company.subscriptionStartDate.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {company.subscriptionEndDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">
                        {company.subscriptionEndDate.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Auto Renew</span>
                <Badge variant={company.autoRenew ? 'default' : 'secondary'}>
                  {company.autoRenew ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance</span>
                <span className="text-lg font-bold">
                  ${company.balance?.toLocaleString() || 0} {company.currency || 'USD'}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>
                Current usage vs configured limits
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <LimitIndicator
                label="Users"
                current={company.usage?.usersCount || 0}
                limit={company.limits?.maxUsers || 0}
              />
              <LimitIndicator
                label="Clients"
                current={company.usage?.clientsCount || 0}
                limit={company.limits?.maxClients || 0}
              />
              <LimitIndicator
                label="Vendors"
                current={company.usage?.vendorsCount || 0}
                limit={company.limits?.maxVendors || 0}
              />
              <LimitIndicator
                label="Products"
                current={company.usage?.productsCount || 0}
                limit={company.limits?.maxProducts || 0}
              />
              <LimitIndicator
                label="Invoices (This Month)"
                current={company.usage?.invoicesThisMonth || 0}
                limit={company.limits?.maxInvoices || 0}
              />
              <LimitIndicator
                label="Bills (This Month)"
                current={company.usage?.billsThisMonth || 0}
                limit={company.limits?.maxBills || 0}
              />
              <LimitIndicator
                label="Warehouses"
                current={company.usage?.warehousesCount || 0}
                limit={company.limits?.maxWarehouses || 0}
              />
              <LimitIndicator
                label="Storage"
                current={Math.round((company.usage?.storageUsedMB || 0) / 1024 * 100) / 100}
                limit={company.limits?.storageGB || 0}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Company Users
                  </CardTitle>
                  <CardDescription>
                    Users registered under this company ({users.length} total)
                  </CardDescription>
                </div>
                <Button onClick={() => navigate(`/users/new?companyId=${company.id}`)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No users found for this company
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={user.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.lastLogin
                            ? user.lastLogin.toDate().toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => resetPassword({ email: user.email })}
                                disabled={isResettingPassword}
                              >
                                <KeyRound className="mr-2 h-4 w-4" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === 'active' ? (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => suspendUser({ companyId: company.id, userId: user.id })}
                                  disabled={isSuspending}
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Suspend User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => activateUser({ companyId: company.id, userId: user.id })}
                                  disabled={isActivating}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment History
                  </CardTitle>
                  <CardDescription>
                    Payments and transactions for this company ({payments.length} total)
                  </CardDescription>
                </div>
                <Button onClick={() => navigate(`/payments/new?companyId=${company.id}`)}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No payments found for this company
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="text-muted-foreground">
                          {payment.createdAt?.toDate().toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {payment.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span className={payment.type === 'refund' ? 'text-destructive' : 'text-green-600'}>
                            {payment.type === 'refund' ? '-' : '+'}${payment.amount.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground text-sm ml-1">
                            {payment.currency}
                          </span>
                        </TableCell>
                        <TableCell className="capitalize">
                          {payment.paymentMethod.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {payment.paymentReference || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
