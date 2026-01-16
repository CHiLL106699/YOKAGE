import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "super_admin" | "clinic_admin" | "staff" | "customer" = "clinic_admin"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("report.revenue", () => {
  it("returns revenue statistics for authenticated user", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.report.revenue({
      organizationId: 1,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("totalRevenue");
    expect(result).toHaveProperty("growthRate");
    expect(result).toHaveProperty("dailyRevenue");
    expect(result).toHaveProperty("byCategory");
    expect(typeof result.totalRevenue).toBe("number");
  });
});

describe("report.appointmentStats", () => {
  it("returns appointment statistics", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.report.appointmentStats({
      organizationId: 1,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("totalAppointments");
    expect(result).toHaveProperty("completionRate");
    expect(result).toHaveProperty("byTimeSlot");
    expect(result).toHaveProperty("byStatus");
  });
});

describe("report.customerStats", () => {
  it("returns customer statistics", async () => {
    const { ctx } = createAuthContext("clinic_admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.report.customerStats({
      organizationId: 1,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("newCustomers");
    expect(result).toHaveProperty("returningCustomers");
    expect(result).toHaveProperty("returnRate");
    expect(result).toHaveProperty("byMemberLevel");
    expect(result).toHaveProperty("byFrequency");
  });
});
