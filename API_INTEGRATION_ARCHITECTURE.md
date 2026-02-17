# Phase 1: Staff & LIFF API Integration - Architecture & Plan

**Author:** Manus AI
**Date:** 2026-02-17
**Status:** DRAFT

## 1. Executive Summary

This document outlines the architecture and implementation plan for replacing all mock/hardcoded data in 18 specified Staff and LIFF pages within the YOKAGE project with live tRPC API calls. The primary goal is to create a fully data-driven application, ensuring a seamless, secure, and maintainable connection between the frontend and the Supabase backend.

The project will be executed in a phased approach, starting with the creation of necessary backend schemas and routers, followed by the systematic integration of each frontend page. Each integration will include the implementation of loading skeletons and robust error handling to enhance user experience. The final deliverable will be a fully integrated, type-safe, and build-verified application, with all changes pushed to the `main` branch.

## 2. Current State Analysis

A thorough analysis of the existing codebase reveals a solid foundation but a critical dependency on mock data across all targeted pages. 

- **Frontend**: The 18 pages in scope are currently non-functional from a data perspective, using hardcoded arrays and objects to simulate API responses. This prevents any real-world use.
- **Backend (tRPC)**: A comprehensive tRPC setup is in place with `@trpc/react-query`. Numerous routers and procedures already exist, covering core entities like `staff`, `appointment`, `customer`, and `order`. However, there are functional gaps.
- **Database (Drizzle/Supabase)**: A rich Drizzle schema is defined, mapping to a wide array of tables in Supabase. Most required tables (`staff`, `appointments`, `orders`, etc.) are present. 

## 3. Gap Analysis & Proposed Solution

The core task is to bridge the gap between the mock-data-driven frontend and the existing backend infrastructure. This involves both creating new backend components and connecting the frontend to them.

### 3.1. Data Flow Architecture

The proposed data flow will follow a standard, secure, and efficient pattern:

```mermaid
graph TD
    A[Frontend Component] -- tRPC Hook --> B(tRPC Client);
    B -- HTTP Request --> C(tRPC Router);
    C -- Drizzle ORM --> D(Supabase DB);
    D -- Fetched Data --> C;
    C -- JSON Response --> B;
    B -- React Query Cache --> A;

    subgraph Browser (Client-side)
        A
        B
    end

    subgraph Server (Supabase Edge Function)
        C
    end

    subgraph Database
        D
    end
```

**Figure 1:** Proposed data flow from frontend component to Supabase database via tRPC.

### 3.2. Missing Backend Components

While the backend is robust, two key areas require new development:

1.  **`StaffPerformance` Logic**: The current `clinicRouter.staffPerformance` procedure uses mock data. This will be replaced with a real implementation that aggregates data from the `orders` and `staffCommissions` tables to calculate revenue and service counts per staff member.
2.  **`StaffTasks` Module**: This functionality is entirely absent. A new database table, `staffTasks`, will be created, along with a corresponding tRPC router (`taskRouter`) to handle CRUD operations for tasks assigned to staff.

#### New Drizzle Schema: `staffTasks`

```typescript
// In drizzle/schema.ts
export const staffTasks = pgTable("staff_tasks", {
  id: serial("id").primaryKey(),
  organizationId: integer("organizationId").notNull().references(() => tenants.id),
  assignedTo: integer("assignedTo").notNull().references(() => staff.id),
  createdBy: integer("createdBy").notNull().references(() => staff.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: text("status", { enum: ["pending", "in_progress", "completed", "cancelled"] }).notNull().default("pending"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

#### New tRPC Router: `taskRouter`

A new file, `server/routers/task.ts`, will be created with the following procedures:

- `task.list`: Query to list tasks, with filters for status and assignee.
- `task.create`: Mutation to create a new task.
- `task.update`: Mutation to update a task's status, description, etc.
- `task.getById`: Query to fetch a single task's details.

### 3.3. Frontend Integration Plan

Each of the 18 pages will be refactored to remove mock data and integrate the corresponding tRPC hooks. A standardized component structure will be used to handle API states.

```jsx
// Example for a component fetching data
import { trpc } from "@/lib/trpc";
import { QueryLoading, QueryError } from "@/components/ui/query-state";

function MyComponent() {
  const { data, isLoading, isError, error, refetch } = trpc.myRouter.myQuery.useQuery({ id: 123 });

  if (isLoading) {
    return <QueryLoading variant="skeleton" />;
  }

  if (isError) {
    return <QueryError message={error.message} onRetry={refetch} />;
  }

  return (
    // Render component with `data`
  );
}
```

This pattern ensures a consistent user experience with clear loading and error states, leveraging the existing `query-state.tsx` component.

## 4. Page-by-Page API Mapping

The following table details the specific API endpoints required for each page and whether they need to be created or can be reused.

| # | Page File | Mock Data Variables | Required tRPC Procedures | Action | 
|---|---|---|---|---|
| **Staff** | | | | |
| 1 | `StaffHome.tsx` | `mockStaff`, `mockAppointments`, `mockStats` | `staff.me`, `appointment.list`, `staff.getDashboardStats` | Create `staff.me`, `staff.getDashboardStats` | 
| 2 | `StaffAppointments.tsx` | `mockAppointments` | `appointment.list`, `appointment.updateStatus` | Reuse `appointment.list`, Create `appointment.updateStatus` | 
| 3 | `StaffClock.tsx` | `mockStaff`, `mockRecentRecords` | `sprint5.attendance.todayStatus`, `sprint5.attendance.listRecords`, `sprint5.attendance.clockIn`, `sprint5.attendance.clockOut` | Reuse All | 
| 4 | `StaffCustomers.tsx` | `mockCustomers` | `customer.list`, `customer.get` | Reuse All | 
| 5 | `StaffPerformance.tsx` | `mockData` | `pro.biDashboard.staffPerformance` | **Implement** `staffPerformance` logic | 
| 6 | `StaffSchedule.tsx` | `mockData` | `schedule.list` | Reuse `schedule.list` | 
| **LIFF** | | | | |
| 7 | `LandingPage.tsx` | `testimonials`, `coreFeatures`, `pricingPlans` | `cms.getPageContent("landing")` | **New** `cms` router | 
| 8 | `LiffBookingPage.tsx` | `services`, `timeSlots` | `product.list({type: "service"})`, `schedule.getAvailability` | Reuse `product.list`, Create `schedule.getAvailability` | 
| 9 | `LiffCartPage.tsx` | `mockCartItems`, `mockCoupons` | `cart.get`, `cart.update`, `cart.remove`, `coupon.validate` | **New** `cart` router, Reuse `coupon.validate` | 
| 10 | `LiffCheckoutPage.tsx` | `mockOrderItems` | `order.createFromCart` | Create `order.createFromCart` | 
| 11 | `LiffMemberPage.tsx` | `member`, `recentAppointments` | `customer.me`, `appointment.list` | Create `customer.me`, Reuse `appointment.list` | 
| 12 | `LiffOrdersPage.tsx` | `mockOrders` | `order.list` | Reuse `order.list` | 
| 13 | `LiffOrderDetailPage.tsx` | `mockOrderDetail` | `order.get` | Reuse `order.get` | 
| 14 | `LiffShopPage.tsx` | `mockProducts` | `product.list` | Reuse `product.list` | 
| 15 | `LiffStaffClockPage.tsx` | `mockStaff`, `mockTodayRecords`, `mockWeekRecords` | `sprint5.attendance.todayStatus`, `sprint5.attendance.listRecords`, `sprint5.attendance.clockIn`, `sprint5.attendance.clockOut` | Reuse All | 
| 16 | `LiffStaffLeavePage.tsx` | `mockLeaveRecords` | `leaveManagement.getMyLeaveRequests`, `leaveManagement.submitLeaveRequest` | Reuse All | 
| 17 | `LiffStaffSchedulePage.tsx` | `mockSchedule` | `schedule.list` | Reuse `schedule.list` | 
| 18 | `LiffStaffTasksPage.tsx` | `mockTasks` | `task.list`, `task.update` | **New** `task` router | 

## 5. Implementation Phases & Checklist

The work will be broken down into the following phases:

**Phase 1: Backend Development (New Schemas & Routers)**
- [ ] Create `staff_tasks` table schema in `drizzle/schema.ts`.
- [ ] Create `task.ts` tRPC router with `list`, `create`, `update`, `getById` procedures.
- [ ] Create `cart.ts` tRPC router with `get`, `add`, `update`, `remove` procedures.
- [ ] Create `cms.ts` tRPC router for managing static page content like the landing page.
- [ ] Implement real data aggregation logic for `pro.biDashboard.staffPerformance`.
- [ ] Create `schedule.getAvailability` procedure to show available booking slots.
- [ ] Create `customer.me` and `staff.me` procedures to fetch current user/staff profile.
- [ ] Register all new routers in the main `appRouter`.

**Phase 2: Frontend Integration - Staff Pages**
- [ ] Integrate `StaffHome.tsx`.
- [ ] Integrate `StaffAppointments.tsx`.
- [ ] Integrate `StaffClock.tsx`.
- [ ] Integrate `StaffCustomers.tsx`.
- [ ] Integrate `StaffPerformance.tsx`.
- [ ] Integrate `StaffSchedule.tsx`.

**Phase 3: Frontend Integration - LIFF Pages**
- [ ] Integrate `LandingPage.tsx`.
- [ ] Integrate `LiffBookingPage.tsx`.
- [ ] Integrate `LiffCartPage.tsx`.
- [ ] Integrate `LiffCheckoutPage.tsx`.
- [ ] Integrate `LiffMemberPage.tsx`.
- [ ] Integrate `LiffOrdersPage.tsx`.
- [ ] Integrate `LiffOrderDetailPage.tsx`.
- [ ] Integrate `LiffShopPage.tsx`.
- [ ] Integrate `LiffStaffClockPage.tsx`.
- [ ] Integrate `LiffStaffLeavePage.tsx`.
- [ ] Integrate `LiffStaffSchedulePage.tsx`.
- [ ] Integrate `LiffStaffTasksPage.tsx`.

**Phase 4: Verification & Deployment**
- [ ] Run `pnpm install` to ensure all dependencies are correct.
- [ ] Run `tsc --noEmit` and fix all TypeScript errors.
- [ ] Run `pnpm build` to confirm the project builds successfully.
- [ ] Push all changes to the `main` branch.
- [ ] Generate final modification report.

## 6. Security Considerations

- All tRPC procedures will be `protectedProcedure` by default, ensuring only authenticated users can access them.
- Data access will be scoped to the user's `organizationId` to enforce Row-Level Security.
- Sensitive information will not be exposed to the client-side.

Upon approval of this document, implementation will commence immediately proceed to Phase 4 of the main plan (Implement missing Drizzle schemas and tRPC routers).
