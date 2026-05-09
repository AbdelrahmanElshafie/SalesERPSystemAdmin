import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { SystemLog } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable, Column } from '@/components/common/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const actionColors: Record<string, string> = {
  company_created: 'bg-green-500',
  company_updated: 'bg-blue-500',
  company_activated: 'bg-emerald-500',
  company_suspended: 'bg-orange-500',
  company_deleted: 'bg-red-500',
  subscription_changed: 'bg-purple-500',
  payment_recorded: 'bg-cyan-500',
  user_created: 'bg-green-500',
  user_updated: 'bg-blue-500',
  user_deleted: 'bg-red-500',
  user_password_reset: 'bg-yellow-500',
  admin_login: 'bg-purple-500',
  admin_logout: 'bg-gray-500',
  settings_updated: 'bg-indigo-500',
  plan_created: 'bg-green-500',
  plan_updated: 'bg-blue-500',
  plan_deleted: 'bg-red-500',
};

export function SystemLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const { logs, isLoading } = useSystemLogs();

  const filteredLogs = logs?.filter((log) => {
    const matchesSearch =
      log.description?.toLowerCase().includes(search.toLowerCase()) ||
      log.adminEmail?.toLowerCase().includes(search.toLowerCase()) ||
      log.targetId?.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.targetType === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  }) || [];

  // Get unique actions and entities for filters
  const actions = Array.from(new Set(logs?.map((l) => l.action) || []));
  const entities = Array.from(new Set(logs?.map((l) => l.targetType).filter(Boolean) || []));

  const columns: Column<SystemLog>[] = [
    {
      key: 'timestamp',
      header: 'Time',
      cell: (log) => (
        <span className="text-sm">
          {log.createdAt.toDate().toLocaleString()}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      cell: (log) => (
        <Badge
          variant="secondary"
          className={`${actionColors[log.action] || 'bg-gray-500'} text-white capitalize`}
        >
          {log.action.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'entity',
      header: 'Entity',
      cell: (log) => (
        <div>
          <p className="font-medium capitalize">{log.targetType || '-'}</p>
          {log.targetId && (
            <p className="text-xs text-muted-foreground font-mono">
              {log.targetId}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      cell: (log) => (
        <p className="text-sm max-w-md truncate">{log.description}</p>
      ),
    },
    {
      key: 'performedBy',
      header: 'Performed By',
      cell: (log) => (
        <div>
          <p className="text-sm font-medium">{log.adminName || 'System'}</p>
          <p className="text-xs text-muted-foreground">{log.adminEmail}</p>
        </div>
      ),
    },
    {
      key: 'ip',
      header: 'IP Address',
      cell: (log) => (
        <span className="text-sm font-mono text-muted-foreground">
          {log.ipAddress || '-'}
        </span>
      ),
    },
  ];

  // Count logs by action type patterns
  const createCount = logs?.filter((l) => l.action.includes('created')).length || 0;
  const deleteCount = logs?.filter((l) => l.action.includes('deleted')).length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Logs</h1>
          <p className="text-muted-foreground">
            Audit trail of all system activities
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{logs?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {logs?.filter((l) => {
                const date = l.createdAt.toDate();
                const today = new Date();
                return date.toDateString() === today.toDateString();
              }).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Create Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {createCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delete Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {deleteCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map((action) => (
              <SelectItem key={action} value={action} className="capitalize">
                {action.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {entities.map((entity) => (
              <SelectItem key={entity} value={entity!} className="capitalize">
                {entity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        isLoading={isLoading}
        emptyMessage="No logs found"
        rowKey={(log) => log.id}
      />
    </div>
  );
}
