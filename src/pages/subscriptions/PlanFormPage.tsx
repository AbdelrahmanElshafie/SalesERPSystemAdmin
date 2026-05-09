import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Save, CreditCard, Plus, X } from 'lucide-react';
import { useSubscriptionPlans, useSubscriptionPlan } from '@/hooks/useSubscriptionPlans';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/common/page-loader';

const planSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters'),
  nameAr: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  descriptionAr: z.string().optional(),
  monthlyPrice: z.number().min(0, 'Price must be positive'),
  yearlyPrice: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('USD'),
  trialDays: z.number().min(0, 'Trial days must be positive'),
  isActive: z.boolean(),
  sortOrder: z.number().min(0),
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
  features: z.array(z.string()),
});

type FormData = z.infer<typeof planSchema>;

export function PlanFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const { plan, isLoading: planLoading } = useSubscriptionPlan(id);
  const { createPlan, updatePlan, isCreating, isUpdating } = useSubscriptionPlans();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: '',
      monthlyPrice: 0,
      yearlyPrice: 0,
      currency: 'USD',
      trialDays: 14,
      isActive: true,
      sortOrder: 0,
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
      features: [],
    },
  });

  const features = watch('features');

  // Load plan data when editing
  useEffect(() => {
    if (plan && isEditing) {
      reset({
        name: plan.name,
        nameAr: plan.nameAr || '',
        description: plan.description,
        descriptionAr: plan.descriptionAr || '',
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        currency: plan.currency,
        trialDays: plan.trialDays,
        isActive: plan.isActive,
        sortOrder: plan.sortOrder,
        limits: plan.limits,
        features: plan.features || [],
      });
    }
  }, [plan, isEditing, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && id) {
        await updatePlan({ id, data });
        toast({
          title: 'Plan updated',
          description: 'Subscription plan has been updated successfully.',
        });
      } else {
        await createPlan(data);
        toast({
          title: 'Plan created',
          description: 'Subscription plan has been created successfully.',
        });
      }
      navigate('/subscriptions');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const addFeature = () => {
    const newFeature = prompt('Enter feature:');
    if (newFeature) {
      setValue('features', [...features, newFeature]);
    }
  };

  const removeFeature = (index: number) => {
    setValue(
      'features',
      features.filter((_, i) => i !== index)
    );
  };

  if (planLoading) {
    return <PageLoader message="Loading plan..." />;
  }

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/subscriptions')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Plan' : 'New Plan'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update subscription plan details' : 'Create a new subscription plan'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
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
                <Label htmlFor="nameAr">Plan Name (Arabic)</Label>
                <Input
                  id="nameAr"
                  {...register('nameAr')}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  error={!!errors.description}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                <Textarea
                  id="descriptionAr"
                  {...register('descriptionAr')}
                  dir="rtl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Monthly Price *</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  step="0.01"
                  {...register('monthlyPrice', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearlyPrice">Yearly Price</Label>
                <Input
                  id="yearlyPrice"
                  type="number"
                  step="0.01"
                  {...register('yearlyPrice', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  {...register('currency')}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="trialDays">Trial Days</Label>
                <Input
                  id="trialDays"
                  type="number"
                  {...register('trialDays', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  {...register('sortOrder', { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Limits</CardTitle>
            <CardDescription>
              Set limits for this plan. Use -1 for unlimited.
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

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              List features included in this plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addFeature}>
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
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
                  Make this plan available for new subscriptions
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
            onClick={() => navigate('/subscriptions')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
