import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => ({
  getSuperAdminStats: vi.fn().mockResolvedValue({
    totalOrganizations: 5,
    activeOrganizations: 4,
    totalUsers: 100,
    totalRevenue: 50000,
  }),
  listOrganizations: vi.fn().mockResolvedValue([
    {
      organization: {
        id: 1,
        name: "Test Clinic",
        slug: "test-clinic",
        email: "test@clinic.com",
        phone: "0912345678",
        createdAt: new Date(),
      },
      userCount: 5,
    },
  ]),
  getOrganizationBySlug: vi.fn().mockResolvedValue(null),
  createOrganization: vi.fn().mockResolvedValue(1),
  listCustomers: vi.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        organizationId: 1,
        name: "Test Customer",
        phone: "0912345678",
        email: "customer@test.com",
        gender: "female",
        memberLevel: "bronze",
        visitCount: 5,
        totalSpent: 10000,
      },
    ],
    total: 1,
  }),
  createCustomer: vi.fn().mockResolvedValue(1),
  listProducts: vi.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        organizationId: 1,
        name: "Test Treatment",
        category: "treatment",
        price: "5000",
        duration: 60,
        isActive: true,
      },
    ],
    total: 1,
  }),
  createProduct: vi.fn().mockResolvedValue(1),
  listStaff: vi.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        organizationId: 1,
        name: "Dr. Test",
        position: "doctor",
        phone: "0912345678",
        email: "doctor@test.com",
        isActive: true,
      },
    ],
    total: 1,
  }),
  createStaff: vi.fn().mockResolvedValue(1),
  listAppointments: vi.fn().mockResolvedValue({
    data: [],
    total: 0,
  }),
  listAftercareRecords: vi.fn().mockResolvedValue([]),
}));

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@test.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "super_admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@test.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "clinic_admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Super Admin Router", () => {
  it("returns stats for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.superAdmin.stats();

    expect(result).toHaveProperty("totalOrganizations");
    expect(result).toHaveProperty("activeOrganizations");
    expect(result).toHaveProperty("totalUsers");
  });

  it("lists organizations for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.superAdmin.listOrganizations();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Customer Router", () => {
  it("lists customers for authenticated users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.customer.list({ organizationId: 1 });

    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("creates a customer", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.customer.create({
      organizationId: 1,
      name: "New Customer",
      phone: "0987654321",
      gender: "female",
    });

    expect(result).toHaveProperty("id");
  });
});

describe("Product Router", () => {
  it("lists products for authenticated users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.product.list({ organizationId: 1 });

    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("creates a product", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.product.create({
      organizationId: 1,
      name: "New Treatment",
      price: "3000",
      category: "treatment",
    });

    expect(result).toHaveProperty("id");
  });
});

describe("Staff Router", () => {
  it("lists staff for authenticated users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.staff.list({ organizationId: 1 });

    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("creates a staff member", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.staff.create({
      organizationId: 1,
      name: "New Doctor",
      position: "doctor",
    });

    expect(result).toHaveProperty("id");
  });
});

describe("Clinic Dashboard Router", () => {
  it("returns clinic stats", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clinic.stats({ organizationId: 1 });

    expect(result).toHaveProperty("todayAppointments");
    expect(result).toHaveProperty("customers");
    expect(result).toHaveProperty("monthlyRevenue");
    expect(result).toHaveProperty("pendingAftercare");
  });
});
