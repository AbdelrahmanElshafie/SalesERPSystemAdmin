import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Download,
  Building2,
} from 'lucide-react';
import { useAllPayments } from '@/hooks/useCompanyPayments';
import { CompanyPayment } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable, Column } from '@/components/common/data-table';
import { StatusBadge } from '@/components/common/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PaymentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { payments, isLoading } = useAllPayments();

  const filteredPayments = payments?.filter((payment) => {
    const matchesSearch =
      payment.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (payment.paymentReference?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  const totalRevenue = payments?.filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0) || 0;

  const pendingAmount = payments?.filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0) || 0;

  const columns: Column<CompanyPayment>[] = [
    {
      key: 'company',
      header: 'Company',
      cell: (payment) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{payment.companyName}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (payment) => (
        <span className="font-medium">
          ${payment.amount.toLocaleString()} {payment.currency}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      cell: (payment) => (
        <span className="capitalize">{payment.type.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      cell: (payment) => (
        <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (payment) => <StatusBadge status={payment.status} />,
    },
    {
      key: 'date',
      header: 'Date',
      cell: (payment) => (
        <span className="text-sm text-muted-foreground">
          {payment.createdAt.toDate().toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      cell: (payment) => (
        <span className="text-sm text-muted-foreground">
          {payment.paymentReference || '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            Track and manage company payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => navigate('/payments/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{payments?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ${totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              ${pendingAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {payments?.filter((p) => {
                const date = p.createdAt.toDate();
                const now = new Date();
                return (
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear()
                );
              }).length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
            <SelectItem value="addon">Add-on</SelectItem>
            <SelectItem value="overage">Overage</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredPayments}
        isLoading={isLoading}
        emptyMessage="No payments found"
        rowKey={(payment) => payment.id}
      />
    </div>
  );
}
