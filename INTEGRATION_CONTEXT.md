# YOKAGE API Integration Context

## Project Structure
- tRPC client: `import { trpc } from "@/lib/trpc";`
- Auth hook: `import { useAuth } from "@/_core/hooks/useAuth";`
- Query state components: `import { QueryLoading, QueryError } from "@/components/ui/query-state";`
- Skeleton components: `import { SkeletonTable, SkeletonCard, SkeletonStats, SkeletonList, SkeletonForm } from "@/components/ui/skeleton-table";`
- Organization ID pattern: `const organizationId = 1; // TODO: from context`
- Toast: `import { toast } from "sonner";`

## Available tRPC Routers (flat structure in appRouter)

### organization
- `organization.current.useQuery()` → returns current org
- `organization.list.useQuery()` → returns org list
- `organization.stats.useQuery({ organizationId })` → returns org stats
- `organization.users.useQuery({ organizationId })` → returns org users

### customer
- `customer.list.useQuery({ organizationId, page?, limit?, search? })` → `{ data: Customer[], total: number }`
- `customer.get.useQuery({ id })` → Customer with tags
- `customer.create.useMutation()` → `{ id }`
- `customer.update.useMutation()` → `{ success }`
- `customer.delete.useMutation()` → `{ success }`
- `customer.tags.list.useQuery({ organizationId })` → Tag[]
- `customer.tags.create.useMutation()` → `{ id }`

### product
- `product.list.useQuery({ organizationId, page?, limit?, category? })` → `{ data: Product[], total: number }`
- `product.get.useQuery({ id })` → Product
- `product.create.useMutation()` → `{ id }`
- `product.update.useMutation()` → `{ success }`

### staff
- `staff.list.useQuery({ organizationId, page?, limit? })` → `{ data: Staff[], total: number }`
- `staff.get.useQuery({ id })` → Staff
- `staff.create.useMutation()` → `{ id }`
- `staff.update.useMutation()` → `{ success }`

### appointment
- `appointment.list.useQuery({ organizationId, page?, limit?, date?, staffId? })` → `{ data: Appointment[], total: number }`
- `appointment.get.useQuery({ id })` → Appointment
- `appointment.create.useMutation()` → `{ id }`
- `appointment.update.useMutation()` → `{ success }`

### schedule
- `schedule.list.useQuery({ organizationId, startDate?, endDate?, staffId? })` → Schedule[]
- `schedule.create.useMutation()` → `{ id }`

### inventory
- `inventory.listTransactions.useQuery({ organizationId, productId?, transactionType? })` → InventoryTransaction[]
- `inventory.createTransaction.useMutation()` → `{ id }`
- `inventory.getCostAnalysis.useQuery({ organizationId, productId })` → CostAnalysis
- `inventory.getGrossMargin.useQuery({ organizationId, productId })` → MarginData

### report
- `report.revenue.useQuery({ organizationId, startDate, endDate })` → RevenueReport
- `report.appointmentStats.useQuery({ organizationId, startDate, endDate })` → AppointmentStats
- `report.customerStats.useQuery({ organizationId, startDate, endDate })` → CustomerStats

### marketing
- `marketing.listCampaigns.useQuery({ organizationId, status? })` → MarketingCampaign[]
- `marketing.createCampaign.useMutation()` → `{ id }`
- `marketing.updateCampaign.useMutation()` → `{ success }`
- `marketing.getSourceROI.useQuery({ organizationId, campaignId? })` → ROIData

### clinic
- `clinic.stats.useQuery({ organizationId })` → ClinicStats

### order
- `order.list.useQuery({ organizationId, page?, limit?, status? })` → `{ data: Order[], total: number }`
- `order.create.useMutation()` → `{ id }`
- `order.updateStatus.useMutation()` → `{ success }`

### payment (external router)
- `payment.getSettings.useQuery({ organizationId, provider? })` → PaymentSettings
- `payment.saveLemonSqueezySettings.useMutation()`
- `payment.saveECPaySettings.useMutation()`
- `payment.saveStripeSettings.useMutation()`
- `payment.saveLinePaySettings.useMutation()`
- `payment.createPayment.useMutation()`
- `payment.getTransactions.useQuery({ organizationId, page?, limit? })` → PaymentTransactions
- `payment.listProviders.useQuery({ organizationId })` → Provider[]

### lineSettings (external router)
- `lineSettings.getStatus.useQuery({ organizationId })` → LineStatus
- `lineSettings.saveConfig.useMutation()`
- `lineSettings.verifyChannel.useMutation()`
- `lineSettings.getMessageQuota.useQuery({ organizationId })` → QuotaData
- `lineSettings.sendTextMessage.useMutation()`
- `lineSettings.sendFlexMessage.useMutation()`
- `lineSettings.broadcast.useMutation()`

### lineWebhook (external router)
- `lineWebhook.listEvents.useQuery({ organizationId, page?, limit?, eventType? })` → WebhookEvents
- `lineWebhook.getEvent.useQuery({ id })` → WebhookEvent

### richMenu (external router)
- `richMenu.list.useQuery({ organizationId })` → RichMenu[]
- `richMenu.getById.useQuery({ id })` → RichMenu
- `richMenu.create.useMutation()`
- `richMenu.update.useMutation()`
- `richMenu.delete.useMutation()`
- `richMenu.getClickStats.useQuery({ richMenuId, organizationId })` → ClickStats

### broadcast (external router)
- `broadcast.list.useQuery({ organizationId, page?, limit? })` → BroadcastCampaign[]
- `broadcast.getById.useQuery({ id })` → BroadcastCampaign
- `broadcast.create.useMutation()`
- `broadcast.update.useMutation()`
- `broadcast.delete.useMutation()`
- `broadcast.send.useMutation()`
- `broadcast.getStats.useQuery({ campaignId })` → BroadcastStats

### notification (external router)
- `notification.sendNotification.useMutation()`
- `notification.getNotificationLog.useQuery({ page?, limit?, status? })` → NotificationLog
- `notification.updateNotificationSettings.useMutation()`
- `notification.getNotificationSettings.useQuery()` → NotificationSettings

### settings (external router)
- `settings.get.useQuery({ id?, key?, is_global? })` → Setting
- `settings.list.useQuery({ is_global? })` → Setting[]
- `settings.create.useMutation()`
- `settings.update.useMutation()`
- `settings.delete.useMutation()`

### analytics (external router)
- `analytics.getReport.useQuery({ reportType, dateRange? })` → AnalyticsReport
- `analytics.getMetricDetail.useQuery({ metricId })` → MetricDetail

### attendance (smartAttendanceRouter)
- `attendance.listRecords.useQuery({ organizationId, staffId?, startDate?, endDate? })` → AttendanceRecord[]
- `attendance.getTodayStatus.useQuery({ organizationId, staffId })` → TodayStatus
- `attendance.clockIn.useMutation()`
- `attendance.clockOut.useMutation()`

## Pattern for tRPC Integration

```tsx
import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function ExamplePage() {
  const { user } = useAuth();
  const organizationId = 1; // TODO: from context

  // Queries
  const { data, isLoading, error, refetch } = trpc.someRouter.someQuery.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  // Mutations
  const createMutation = trpc.someRouter.create.useMutation({
    onSuccess: () => {
      toast.success("建立成功");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  if (isLoading) return <QueryLoading variant="skeleton-cards" />;
  if (error) return <QueryError message={error.message} onRetry={refetch} />;

  return (/* JSX */);
}
```

## Key Rules
1. All queries use `trpc.routerName.procedureName.useQuery(input, options?)`
2. All mutations use `trpc.routerName.procedureName.useMutation(options?)`
3. Use `enabled` option to prevent queries from firing without required data
4. Use `QueryLoading` and `QueryError` from existing components
5. Use `toast` from sonner for success/error feedback
6. Keep organizationId = 1 as placeholder (TODO comment)
7. Use `refetch()` after mutations to refresh data
8. Preserve all existing UI structure and styling
9. Remove mock data constants and replace with API data
10. Handle nullable/undefined data with optional chaining and fallbacks
