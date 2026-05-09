import { useEffect, useState } from 'react';
import { Save, Loader2, Settings, Bell, Shield, Database } from 'lucide-react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export function SettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } = useSystemSettings();

  // General settings
  const [platformName, setPlatformName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');

  // Feature toggles
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [enableTrials, setEnableTrials] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Default limits
  const [defaultTrialDays, setDefaultTrialDays] = useState(14);
  const [gracePeriodDays, setGracePeriodDays] = useState(7);

  // Load settings when available
  useEffect(() => {
    if (settings) {
      setPlatformName(settings.systemName || 'Sales ERP');
      setSupportEmail(settings.supportEmail || '');
      setSupportPhone(settings.supportPhone || '');
      setMaintenanceMode(settings.maintenanceMode || false);
      setMaintenanceMessage(settings.maintenanceMessage || '');
      setEmailNotifications(settings.enableEmailNotifications ?? true);
      setSmsNotifications(settings.enableSmsNotifications ?? false);
      setDefaultTrialDays(settings.defaultTrialDays || 14);
      setGracePeriodDays(settings.gracePeriodDays || 7);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      systemName: platformName,
      supportEmail,
      supportPhone,
      maintenanceMode,
      maintenanceMessage,
      enableEmailNotifications: emailNotifications,
      enableSmsNotifications: smsNotifications,
      defaultTrialDays,
      gracePeriodDays,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage system-wide configuration
          </p>
        </div>
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="features">
            <Shield className="mr-2 h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="defaults">
            <Database className="mr-2 h-4 w-4" />
            Defaults
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                General configuration for the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input
                  id="supportPhone"
                  type="tel"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>
                Enable maintenance mode to prevent users from accessing the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, only system admins can access the platform
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
              {maintenanceMode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Input
                    id="maintenanceMessage"
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="We are currently performing scheduled maintenance..."
                  />
                  <p className="text-xs text-muted-foreground">
                    This message will be displayed to users when they try to access the platform
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Company Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new companies to register on the platform
                  </p>
                </div>
                <Switch
                  checked={enableRegistration}
                  onCheckedChange={setEnableRegistration}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Free Trials</Label>
                  <p className="text-sm text-muted-foreground">
                    Offer free trial period to new companies
                  </p>
                </div>
                <Switch
                  checked={enableTrials}
                  onCheckedChange={setEnableTrials}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaults" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Values</CardTitle>
              <CardDescription>
                Default settings for new companies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultTrialDays">Default Trial Days</Label>
                  <Input
                    id="defaultTrialDays"
                    type="number"
                    value={defaultTrialDays}
                    onChange={(e) => setDefaultTrialDays(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of trial days for new companies
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gracePeriodDays">Grace Period Days</Label>
                  <Input
                    id="gracePeriodDays"
                    type="number"
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Days after subscription expiry before suspension
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default Resource Limits</CardTitle>
              <CardDescription>
                Default limits for new companies (can be overridden per company)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Max Users</Label>
                  <Input
                    type="number"
                    defaultValue={settings?.defaultLimits?.maxUsers || 5}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Clients</Label>
                  <Input
                    type="number"
                    defaultValue={settings?.defaultLimits?.maxClients || 100}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Vendors</Label>
                  <Input
                    type="number"
                    defaultValue={settings?.defaultLimits?.maxVendors || 50}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Products</Label>
                  <Input
                    type="number"
                    defaultValue={settings?.defaultLimits?.maxProducts || 500}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Invoices/Month</Label>
                  <Input
                    type="number"
                    defaultValue={settings?.defaultLimits?.maxInvoices || 100}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Bills/Month</Label>
                  <Input
                    type="number"
                    defaultValue={settings?.defaultLimits?.maxBills || 100}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Warehouses</Label>
                  <Input
                    type="number"
                    defaultValue={settings?.defaultLimits?.maxWarehouses || 2}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Storage (GB)</Label>
                  <Input
                    type="number"
                    defaultValue={settings?.defaultLimits?.storageGB || 5}
                    disabled
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Default limits are managed through subscription plans. Create or edit plans to change default limits.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
