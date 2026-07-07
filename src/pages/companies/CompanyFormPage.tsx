import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Save, Building2, UserPlus } from 'lucide-react';
import { useCompanies, useCompany } from '@/hooks/useCompanies';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useToast } from '@/hooks/useToast';
import { CompanyFormData } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/common/page-loader';

const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  nameAr: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  commercialRegistration: z.string().optional(),
  taxNumber: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  subscriptionPlanId: z.string().min(1, 'Please select a subscription plan'),
  isActive: z.boolean(),
  autoRenew: z.boolean(),
  limits: z.object({
    maxUsers: z.number().min(-1),
    maxClients: z.number().min(-1),
    maxVendors: z.number().min(-1),
    maxInvoices: z.number().min(-1),
    maxBills: z.number().min(-1),
    maxProducts: z.number().min(-1),
    maxWarehouses: z.number().min(-1),
    storageGB: z.number().min(-1),
  }),
  initialUserName: z.string().optional(),
  initialUserEmail: z.string().optional(),
  initialUserPhone: z.string().optional(),
  initialUserPassword: z.string().optional(),
});

const getCompanySchema = (isEditing: boolean) =>
  companySchema.superRefine((data, ctx) => {
    if (isEditing) return;

    if (!data.initialUserName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['initialUserName'],
        message: 'Admin name is required',
      });
    }

    if (!data.initialUserEmail?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['initialUserEmail'],
        message: 'Admin email is required',
      });
    } else if (!z.string().email().safeParse(data.initialUserEmail).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['initialUserEmail'],
        message: 'Invalid admin email address',
      });
    }

    if (!data.initialUserPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['initialUserPassword'],
        message: 'Admin password is required',
      });
    } else if (data.initialUserPassword.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['initialUserPassword'],
        message: 'Password must be at least 8 characters',
      });
    }
  });

type FormData = z.infer<typeof companySchema>;

export function CompanyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const { company, isLoading: companyLoading } = useCompany(id);
  const { plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { createCompany, updateCompany, isCreating, isUpdating } = useCompanies();
  const formSchema = useMemo(() => getCompanySchema(isEditing), [isEditing]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      isActive: true,
      autoRenew: true,
      subscriptionPlanId: '',
      limits: {
        maxUsers: 5,
        maxClients: 100,
        maxVendors: 50,
        maxInvoices: 500,
        maxBills: 500,
        maxProducts: 1000,
        maxWarehouses: 3,
        storageGB: 5,
      },
      initialUserName: '',
      initialUserEmail: '',
      initialUserPhone: '',
      initialUserPassword: '',
    },
  });

  const selectedPlanId = watch('subscriptionPlanId');

  // Load company data when editing
  useEffect(() => {
    if (company && isEditing) {
      reset({
        name: company.name,
        nameAr: company.nameAr || '',
        email: company.email,
        phone: company.phone,
        website: company.website || '',
        commercialRegistration: company.commercialRegistration || '',
        taxNumber: company.taxNumber || '',
        address: company.address || {},
        subscriptionPlanId: company.subscriptionPlanId,
        isActive: company.isActive,
        autoRenew: company.autoRenew,
        limits: company.limits,
      });
    }
  }, [company, isEditing, reset]);

  // Apply plan limits when plan changes
  useEffect(() => {
    if (selectedPlanId && plans && !isEditing) {
      const plan = plans.find((p) => p.id === selectedPlanId);
      if (plan) {
        setValue('limits', plan.limits);
      }
    }
  }, [selectedPlanId, plans, setValue, isEditing]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && id) {
        await updateCompany({ id, data: data as CompanyFormData });
        toast({
          title: 'Company updated',
          description: 'Company has been updated successfully.',
        });
      } else {
        await createCompany(data as CompanyFormData);
        toast({
          title: 'Company created',
          description: 'Company has been created successfully.',
        });
      }
      navigate('/companies');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  if (companyLoading || plansLoading) {
    return <PageLoader message="Loading..." />;
  }

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/companies')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Company' : 'New Company'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update company details' : 'Create a new company account'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Company details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  error={!!errors.name}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">Company Name (Arabic)</Label>
                <Input
                  id="nameAr"
                  {...register('nameAr')}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  error={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  error={!!errors.phone}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  {...register('website')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commercialRegistration">Commercial Registration</Label>
                <Input
                  id="commercialRegistration"
                  {...register('commercialRegistration')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxNumber">Tax Number</Label>
              <Input
                id="taxNumber"
                {...register('taxNumber')}
              />
            </div>
          </CardContent>
        </Card>

        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Company Admin User
              </CardTitle>
              <CardDescription>Create the first login account for this company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="initialUserName">Admin Name *</Label>
                  <Input
                    id="initialUserName"
                    {...register('initialUserName')}
                    error={!!errors.initialUserName}
                  />
                  {errors.initialUserName && (
                    <p className="text-sm text-destructive">
                      {errors.initialUserName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initialUserEmail">Admin Email *</Label>
                  <Input
                    id="initialUserEmail"
                    type="email"
                    {...register('initialUserEmail')}
                    error={!!errors.initialUserEmail}
                  />
                  {errors.initialUserEmail && (
                    <p className="text-sm text-destructive">
                      {errors.initialUserEmail.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="initialUserPhone">Admin Phone</Label>
                  <Input
                    id="initialUserPhone"
                    {...register('initialUserPhone')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initialUserPassword">Admin Password *</Label>
                  <Input
                    id="initialUserPassword"
                    type="password"
                    autoComplete="new-password"
                    {...register('initialUserPassword')}
                    error={!!errors.initialUserPassword}
                  />
                  {errors.initialUserPassword && (
                    <p className="text-sm text-destructive">
                      {errors.initialUserPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Textarea
                id="street"
                {...register('address.street')}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('address.city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Region</Label>
                <Input id="state" {...register('address.state')} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register('address.country')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" {...register('address.postalCode')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Select a subscription plan for this company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Subscription Plan *</Label>
              <Controller
                name="subscriptionPlanId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger error={!!errors.subscriptionPlanId}>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.monthlyPrice}/month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subscriptionPlanId && (
                <p className="text-sm text-destructive">{errors.subscriptionPlanId.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Renew</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically renew subscription when it expires
                </p>
              </div>
              <Controller
                name="autoRenew"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Limits</CardTitle>
            <CardDescription>
              Set limits for this company. Use -1 for unlimited.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="maxUsers">Max Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  {...register('limits.maxUsers', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxClients">Max Clients</Label>
                <Input
                  id="maxClients"
                  type="number"
                  {...register('limits.maxClients', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxVendors">Max Vendors</Label>
                <Input
                  id="maxVendors"
                  type="number"
                  {...register('limits.maxVendors', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxProducts">Max Products</Label>
                <Input
                  id="maxProducts"
                  type="number"
                  {...register('limits.maxProducts', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxInvoices">Max Invoices/Month</Label>
                <Input
                  id="maxInvoices"
                  type="number"
                  {...register('limits.maxInvoices', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBills">Max Bills/Month</Label>
                <Input
                  id="maxBills"
                  type="number"
                  {...register('limits.maxBills', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxWarehouses">Max Warehouses</Label>
                <Input
                  id="maxWarehouses"
                  type="number"
                  {...register('limits.maxWarehouses', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storageGB">Storage (GB)</Label>
                <Input
                  id="storageGB"
                  type="number"
                  {...register('limits.storageGB', { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable company access to the platform
                </p>
              </div>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/companies')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Update Company' : 'Create Company'}
          </Button>
        </div>
      </form>
    </div>
  );
}
