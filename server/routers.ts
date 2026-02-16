import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { lineSettingsRouter } from "./routers/lineSettingsRouter";
import { dataImportRouter } from "./routers/dataImportRouter";
import { paymentRouter } from "./routers/paymentRouter";
// Phase 35: 定位打卡與 LINE 遊戲模組
import { attendanceSettingsRouter } from "./routers/attendanceSettingsRouter";
import { gameRouter } from "./routers/gameRouter";
import { prizeRouter } from "./routers/prizeRouter";
import { couponRouter as couponManagementRouter } from "./routers/couponRouter";
import { lineRichMenuRouter } from "./routers/lineRichMenu";
import { leaveManagementRouter } from "./routers/leaveManagement";
import { attendanceRouter as smartAttendanceRouter } from "./routers/attendance";
// Phase 84: 新建立的 Router
import { organizationRouter as newOrganizationRouter } from "./routers/organization";
import { customerRouter as newCustomerRouter } from "./routers/customer";
import { appointmentRouter as newAppointmentRouter } from "./routers/appointment";
import { staffRouter as newStaffRouter } from "./routers/staff";
import { gameRouter as newGameRouter } from "./routers/game";
import { subscriptionRouter as newSubscriptionRouter } from "./routers/subscription";
import { voucherRouter as newVoucherRouter } from "./routers/voucher";
import { couponRouter as newCouponRouter } from "./routers/coupon";
import { notificationRouter } from "./routers/notification";
import { analyticsRouter } from "./routers/analytics";
import { reportRouter as newReportRouter } from "./routers/report";
import { aiChatRouter } from "./routers/aiChat";
import { dataImportRouter as newDataImportRouter } from "./routers/dataImport";
import { settingsRouter } from "./routers/settings";
import { TRPCError } from "@trpc/server";
// Phase 86: 系統 B 整合 - 6 大核心模組
import { dashboardSystemBRouter } from "./routers/dashboardSystemB";
// Phase 92: 營運分析模組匯出報表功能
import { biExportRouter } from './routers/biExport.js';
// Phase 95: CRM 模組客戶標籤功能
import { crmTagsRouter } from './routers/crmTags.js';
// Phase 96: CRM 模組客戶 CRUD 功能
import { crmCustomersRouter } from './routers/crmCustomers.js';
// Phase 97: CRM 模組客戶互動歷史記錄功能
import { interactionsRouter } from './routers/interactions.js';
// Phase 98: CRM 模組自動化標籤系統
import { tagRulesRouter } from './routers/tagRules.js';
// Phase 99: CRM 模組 LINE Messaging API 整合
import { lineMessagingRouter } from './routers/lineMessaging.js';
// Phase 100: LINE Webhook 自動接收訊息功能
import { lineWebhookRouter } from './routers/lineWebhook.js';
import { autoReplyRulesRouter } from './routers/autoReplyRules.js';
// Phase 101-103: Rich Menu 動態管理、分群推播、AI 對話機器人
import { richMenuRouter } from './routers/richMenu.js';
import { broadcastRouter } from './routers/broadcast.js';
import { aiChatbotRouter } from './routers/aiChatbot.js';
// ============================================
// Super Admin Router
// ============================================
const superAdminRouter = router({
  stats: adminProcedure.query(async () => {
    return await db.getSuperAdminStats();
  }),

  listOrganizations: adminProcedure
    .input(z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.listOrganizations(input);
    }),

  createOrganization: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      subscriptionPlan: z.enum(["free", "basic", "pro", "enterprise"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const existing = await db.getOrganizationBySlug(input.slug);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Slug already exists" });
      }
      const id = await db.createOrganization(input);
      return { id };
    }),

  updateOrganization: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      subscriptionPlan: z.enum(["free", "basic", "pro", "enterprise"]).optional(),
      subscriptionStatus: z.enum(["active", "suspended", "cancelled"]).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateOrganization(id, data);
      return { success: true };
    }),

  deleteOrganization: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteOrganization(input.id);
      return { success: true };
    }),

  getOrganization: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getOrganizationById(input.id);
    }),

  // Super Admin 票券管理
  voucherStats: adminProcedure.query(async () => {
    return await db.getGlobalVoucherStats();
  }),

  listAllVoucherTemplates: adminProcedure
    .input(z.object({
      type: z.string().optional(),
      isActive: z.boolean().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.listAllVoucherTemplates(input);
    }),

  voucherStatsByOrganization: adminProcedure.query(async () => {
    return await db.getVoucherStatsByOrganization();
  }),

  getExpiringVouchers: adminProcedure
    .input(z.object({ days: z.number().default(3) }))
    .query(async ({ input }) => {
      return await db.getAllExpiringVouchers(input.days);
    }),

  // 批量匯入票券模板
  batchImportTemplates: adminProcedure
    .input(z.object({
      organizationId: z.number().nullable(), // null 表示全域模板
      templates: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        type: z.enum(["treatment", "discount", "gift_card", "stored_value", "free_item"]),
        value: z.string(),
        valueType: z.enum(["fixed_amount", "percentage", "treatment_count"]),
        validDays: z.number().default(90),
        minPurchase: z.string().optional(),
        maxDiscount: z.string().optional(),
        usageLimit: z.number().optional(),
        isTransferable: z.boolean().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      // 如果沒有指定診所，則為所有診所建立模板
      if (input.organizationId === null) {
        const orgs = await db.listOrganizations({});
        const results: number[] = [];
        for (const org of orgs.data) {
          const templatesWithOrg = input.templates.map(t => ({
            ...t,
            organizationId: org.id,
            validityType: 'days_from_issue' as const,
          }));
          const ids = await db.batchCreateVoucherTemplates(templatesWithOrg);
          results.push(...ids);
        }
        return { success: true, createdCount: results.length };
      } else {
        const templatesWithOrg = input.templates.map(t => ({
          ...t,
          organizationId: input.organizationId!,
          validityType: 'days_from_issue' as const,
        }));
        const ids = await db.batchCreateVoucherTemplates(templatesWithOrg);
        return { success: true, createdCount: ids.length };
      }
    }),

  // 系統設定
  getSystemSettings: adminProcedure.query(async () => {
    return await db.getAllSystemSettings();
  }),

  getSystemSettingsByCategory: adminProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      return await db.getSystemSettingsByCategory(input.category);
    }),

  saveSystemSetting: adminProcedure
    .input(z.object({
      key: z.string(),
      value: z.string(),
      description: z.string().optional(),
      category: z.enum(["platform", "voucher", "notification", "system"]).optional(),
    }))
    .mutation(async ({ input }) => {
      await db.upsertSystemSetting(input.key, input.value, input.description, input.category);
      return { success: true };
    }),

  saveSystemSettings: adminProcedure
    .input(z.array(z.object({
      key: z.string(),
      value: z.string(),
      description: z.string().optional(),
      category: z.enum(["platform", "voucher", "notification", "system"]).optional(),
    })))
    .mutation(async ({ input }) => {
      for (const setting of input) {
        await db.upsertSystemSetting(setting.key, setting.value, setting.description, setting.category);
      }
      return { success: true, savedCount: input.length };
    }),

  // 票券到期提醒排程
  scheduleExpiryReminders: adminProcedure
    .input(z.object({
      organizationId: z.number().nullable(), // null 表示所有診所
      daysBeforeExpiry: z.number().default(3),
    }))
    .mutation(async ({ input }) => {
      if (input.organizationId === null) {
        const orgs = await db.listOrganizations({});
        let totalCreated = 0;
        for (const org of orgs.data) {
          const count = await db.scheduleVoucherExpiryReminders(org.id, input.daysBeforeExpiry);
          totalCreated += count;
        }
        return { success: true, createdCount: totalCreated };
      } else {
        const count = await db.scheduleVoucherExpiryReminders(input.organizationId, input.daysBeforeExpiry);
        return { success: true, createdCount: count };
      }
    }),

  getReminderStats: adminProcedure.query(async () => {
    return await db.getReminderStats();
  }),

  listReminderLogs: adminProcedure
    .input(z.object({
      organizationId: z.number().optional(),
      status: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.listVoucherReminderLogs(input);
    }),

  // 使用者管理 API
  listAllUsers: adminProcedure
    .input(z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
      role: z.string().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.listAllUsers(input);
    }),

  userStats: adminProcedure.query(async () => {
    return await db.getUserStats();
  }),

  updateUser: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { userId, ...data } = input;
      await db.updateUserById(userId, data);
      return { success: true };
    }),

  toggleUserStatus: adminProcedure
    .input(z.object({
      userId: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      await db.toggleUserStatus(input.userId, input.isActive);
      return { success: true };
    }),

  // 系統監控 API
  getSystemHealth: adminProcedure.query(async () => {
    return await db.getSystemHealth();
  }),

  getErrorLogs: adminProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return await db.getErrorLogs(input);
    }),

  getAuditLogs: adminProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return await db.getAuditLogs(input);
    }),

  getPerformanceMetrics: adminProcedure.query(async () => {
    return await db.getPerformanceMetrics();
  }),

  // 通知中心 API
  notificationStats: adminProcedure.query(async () => {
    return await db.getNotificationStats();
  }),

  listNotifications: adminProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return await db.listNotifications(input);
    }),

  listNotificationTemplates: adminProcedure.query(async () => {
    return await db.listNotificationTemplates();
  }),

  sendNotification: adminProcedure
    .input(z.object({
      title: z.string(),
      content: z.string(),
      type: z.string(),
      targetScope: z.string(),
      targetOrganizations: z.array(z.number()).optional(),
      sendLine: z.boolean(),
      sendEmail: z.boolean(),
      scheduledAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.sendNotification(input);
    }),

  saveNotificationTemplate: adminProcedure
    .input(z.object({
      title: z.string(),
      content: z.string(),
      type: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await db.saveNotificationTemplate(input);
    }),

  // LINE Channel 設定 API
  listLineChannelConfigs: adminProcedure
    .input(z.object({
      organizationId: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.listLineChannelConfigs(input);
    }),

  getPlatformLineChannelConfig: adminProcedure.query(async () => {
    return await db.getPlatformLineChannelConfig();
  }),

  createLineChannelConfig: adminProcedure
    .input(z.object({
      organizationId: z.number().optional(),
      isPlatformLevel: z.boolean().optional(),
      channelId: z.string(),
      channelSecret: z.string(),
      channelAccessToken: z.string(),
      liffId: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // 驗證憑證
      const verification = await db.verifyLineChannelCredentials(
        input.channelId,
        input.channelSecret,
        input.channelAccessToken
      );
      
      if (!verification.success) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `LINE Channel 驗證失敗: ${verification.error}` 
        });
      }
      
      const id = await db.createLineChannelConfig({
        ...input,
        verificationStatus: 'verified',
        lastVerifiedAt: new Date(),
      });
      
      return { id, botInfo: verification.botInfo };
    }),

  updateLineChannelConfig: adminProcedure
    .input(z.object({
      id: z.number(),
      channelId: z.string().optional(),
      channelSecret: z.string().optional(),
      channelAccessToken: z.string().optional(),
      liffId: z.string().optional(),
      isActive: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateLineChannelConfig(id, data);
      return { success: true };
    }),

  verifyLineChannelConfig: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const config = await db.getLineChannelConfigById(input.id);
      if (!config) {
        throw new TRPCError({ code: "NOT_FOUND", message: "LINE Channel 設定不存在" });
      }
      
      const verification = await db.verifyLineChannelCredentials(
        config.channelId,
        config.channelSecret,
        config.channelAccessToken
      );
      
      await db.updateLineChannelConfig(input.id, {
        verificationStatus: verification.success ? 'verified' : 'failed',
        lastVerifiedAt: new Date(),
      });
      
      return { success: verification.success, error: verification.error, botInfo: verification.botInfo };
    }),

});

// ============================================
// Organization Router (Clinic Admin)
// ============================================
const organizationRouter = router({
  current: protectedProcedure.query(async ({ ctx }) => {
    const orgs = await db.getUserOrganizations(ctx.user.id);
    return orgs.length > 0 ? orgs[0] : null;
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserOrganizations(ctx.user.id);
  }),

  stats: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getOrganizationStats(input.organizationId);
    }),

  users: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getOrganizationUsers(input.organizationId);
    }),
});

// ============================================
// Customer Router
// ============================================
const customerRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listCustomers(organizationId, options);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const customer = await db.getCustomerById(input.id);
      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }
      const tags = await db.getCustomerTags(input.id);
      return { ...customer, tags };
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string().min(1),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      birthday: z.string().optional(),
      address: z.string().optional(),
      notes: z.string().optional(),
      source: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createCustomer(input as any);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      birthday: z.string().optional(),
      address: z.string().optional(),
      notes: z.string().optional(),
      memberLevel: z.enum(["bronze", "silver", "gold", "platinum", "diamond"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCustomer(id, data as any);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteCustomer(input.id);
      return { success: true };
    }),

  // 批次操作
  batchDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const result = await db.batchDeleteCustomers(input.ids);
      return { success: true, affected: result.affected };
    }),

  batchUpdateLevel: protectedProcedure
    .input(z.object({
      ids: z.array(z.number()),
      memberLevel: z.enum(["bronze", "silver", "gold", "platinum", "diamond"]),
    }))
    .mutation(async ({ input }) => {
      const result = await db.batchUpdateCustomerLevel(input.ids, input.memberLevel);
      return { success: true, affected: result.affected };
    }),

  batchAddTag: protectedProcedure
    .input(z.object({
      customerIds: z.array(z.number()),
      tagId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.batchAddTagToCustomers(input.customerIds, input.tagId);
      return { success: true, affected: result.affected };
    }),

  tags: router({
    list: protectedProcedure
      .input(z.object({ organizationId: z.number() }))
      .query(async ({ input }) => {
        return await db.listCustomerTags(input.organizationId);
      }),

    create: protectedProcedure
      .input(z.object({
        organizationId: z.number(),
        name: z.string().min(1),
        color: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createCustomerTag(input);
        return { id };
      }),

    addToCustomer: protectedProcedure
      .input(z.object({ customerId: z.number(), tagId: z.number() }))
      .mutation(async ({ input }) => {
        await db.addTagToCustomer(input.customerId, input.tagId);
        return { success: true };
      }),
  }),
});

// ============================================
// Product Router
// ============================================
const productRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      page: z.number().optional(),
      limit: z.number().optional(),
      category: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listProducts(organizationId, options);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getProductById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.string().optional(),
      type: z.enum(["service", "product", "package"]).optional(),
      price: z.string(),
      costPrice: z.string().optional(),
      duration: z.number().optional(),
      stock: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createProduct(input);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      type: z.enum(["service", "product", "package"]).optional(),
      price: z.string().optional(),
      costPrice: z.string().optional(),
      duration: z.number().optional(),
      stock: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateProduct(id, data);
      return { success: true };
    }),

  // 批次操作
  batchDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const result = await db.batchDeleteProducts(input.ids);
      return { success: true, affected: result.affected };
    }),

  batchUpdateStatus: protectedProcedure
    .input(z.object({
      ids: z.array(z.number()),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.batchUpdateProductStatus(input.ids, input.isActive);
      return { success: true, affected: result.affected };
    }),
});

// ============================================
// Staff Router
// ============================================
const staffRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listStaff(organizationId, options);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getStaffById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string().min(1),
      employeeId: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      position: z.string().optional(),
      department: z.string().optional(),
      hireDate: z.string().optional(),
      salary: z.string().optional(),
      salaryType: z.enum(["monthly", "hourly", "commission"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createStaff(input as any);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      employeeId: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      position: z.string().optional(),
      department: z.string().optional(),
      salary: z.string().optional(),
      salaryType: z.enum(["monthly", "hourly", "commission"]).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateStaff(id, data);
      return { success: true };
    }),

  // 批次操作
  batchDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const result = await db.batchDeleteStaff(input.ids);
      return { success: true, affected: result.affected };
    }),

  batchUpdateStatus: protectedProcedure
    .input(z.object({
      ids: z.array(z.number()),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.batchUpdateStaffStatus(input.ids, input.isActive);
      return { success: true, affected: result.affected };
    }),
});

// ============================================
// Appointment Router
// ============================================
const appointmentRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      page: z.number().optional(),
      limit: z.number().optional(),
      date: z.string().optional(),
      staffId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listAppointments(organizationId, options);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getAppointmentById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      staffId: z.number().optional(),
      productId: z.number().optional(),
      appointmentDate: z.string(),
      startTime: z.string(),
      endTime: z.string().optional(),
      notes: z.string().optional(),
      source: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createAppointment(input as any);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      staffId: z.number().optional(),
      productId: z.number().optional(),
      appointmentDate: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      status: z.enum(["pending", "confirmed", "arrived", "in_progress", "completed", "cancelled", "no_show"]).optional(),
      notes: z.string().optional(),
      internalNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateAppointment(id, data as any);
      return { success: true };
    }),

  // 到診率統計 API
  getAttendanceStats: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      staffId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, startDate, endDate, staffId } = input;
      return await db.getAppointmentAttendanceStats(organizationId, { startDate, endDate, staffId });
    }),

  // 爹約分析 API
  getNoShowAnalysis: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, startDate, endDate } = input;
      return await db.getNoShowAnalysis(organizationId, { startDate, endDate });
    }),

  // 候補名單管理 API
  getWaitlist: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      date: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getWaitlist(input.organizationId, input.date);
    }),

  addToWaitlist: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      preferredDate: z.string(),
      preferredTimeSlot: z.string().optional(),
      productId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { preferredDate, ...rest } = input;
      const id = await db.addToWaitlist({
        ...rest,
        preferredDate: preferredDate,
      });
      return { id };
    }),

  // 批次操作
  batchDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const result = await db.batchDeleteAppointments(input.ids);
      return { success: true, affected: result.affected };
    }),

  batchUpdateStatus: protectedProcedure
    .input(z.object({
      ids: z.array(z.number()),
      status: z.enum(["pending", "confirmed", "arrived", "in_progress", "completed", "cancelled", "no_show"]),
    }))
    .mutation(async ({ input }) => {
      const result = await db.batchUpdateAppointmentStatus(input.ids, input.status);
      return { success: true, affected: result.affected };
    }),
});

// ============================================
// Schedule Router
// ============================================
const scheduleRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      staffId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listSchedules(organizationId, options);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      scheduleDate: z.string(),
      shiftType: z.enum(["morning", "afternoon", "evening", "full", "off", "custom"]).optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createSchedule(input as any);
      return { id };
    }),
});

// ============================================
// Attendance Router
// ============================================
const attendanceRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      date: z.string().optional(),
      staffId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listAttendanceRecords(organizationId, options);
    }),

  clockIn: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      location: z.object({ lat: z.number(), lng: z.number() }).optional(),
    }))
    .mutation(async ({ input }) => {
      const today = new Date().toISOString().split('T')[0];
      const id = await db.createAttendanceRecord({
        organizationId: input.organizationId,
        staffId: input.staffId,
        recordDate: today,
        clockIn: new Date(),
        clockInLocation: input.location,
      } as any);
      return { id };
    }),

  clockOut: protectedProcedure
    .input(z.object({
      id: z.number(),
      location: z.object({ lat: z.number(), lng: z.number() }).optional(),
    }))
    .mutation(async ({ input }) => {
      await db.updateAttendanceRecord(input.id, {
        clockOut: new Date(),
        clockOutLocation: input.location,
      });
      return { success: true };
    }),
});

// ============================================
// Order Router
// ============================================
const orderRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      page: z.number().optional(),
      limit: z.number().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listOrders(organizationId, options);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getOrderById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      orderNumber: z.string(),
      subtotal: z.string(),
      discount: z.string().optional(),
      tax: z.string().optional(),
      total: z.string(),
      couponId: z.number().optional(),
      paymentMethod: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createOrder(input);
      return { id };
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "paid", "processing", "completed", "cancelled", "refunded"]),
    }))
    .mutation(async ({ input }) => {
      await db.updateOrder(input.id, { status: input.status });
      return { success: true };
    }),
});

// ============================================
// Coupon Router
// ============================================
const couponRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.listCoupons(input.organizationId);
    }),

  validate: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      code: z.string(),
    }))
    .query(async ({ input }) => {
      const coupon = await db.getCouponByCode(input.organizationId, input.code);
      if (!coupon) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid coupon code" });
      }
      return coupon;
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      code: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      discountType: z.enum(["percentage", "fixed"]).optional(),
      discountValue: z.string(),
      minPurchase: z.string().optional(),
      maxDiscount: z.string().optional(),
      usageLimit: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { startDate, endDate, ...rest } = input;
      const data: Record<string, unknown> = { ...rest };
      if (startDate) data.startDate = new Date(startDate);
      if (endDate) data.endDate = new Date(endDate);
      const id = await db.createCoupon(data as any);
      return { id };
    }),
});

// ============================================
// Aftercare Router
// ============================================
const aftercareRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listAftercareRecords(organizationId, options);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      appointmentId: z.number().optional(),
      productId: z.number().optional(),
      staffId: z.number().optional(),
      treatmentDate: z.string(),
      followUpDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { treatmentDate, followUpDate, ...rest } = input;
      const data: Record<string, unknown> = { ...rest, treatmentDate };
      if (followUpDate) data.followUpDate = followUpDate;
      const id = await db.createAftercareRecord(data as any);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
      notes: z.string().optional(),
      customerFeedback: z.string().optional(),
      followUpDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, followUpDate, ...rest } = input;
      const data: Record<string, unknown> = { ...rest };
      if (followUpDate) data.followUpDate = followUpDate;
      await db.updateAftercareRecord(id, data);
      return { success: true };
    }),
});

// ============================================
// LINE Channel Router
// ============================================
const lineRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.listLineChannels(input.organizationId);
    }),

  getChannel: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getLineChannelByOrg(input.organizationId);
    }),

  createChannel: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      channelName: z.string().min(1),
      channelId: z.string().min(1),
      channelSecret: z.string().optional(),
      accessToken: z.string().optional(),
      liffId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createLineChannel(input);
      return { id };
    }),

  // 真實 LINE 推播 API
  sendTextMessage: protectedProcedure
    .input(z.object({
      userId: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { pushTextMessage } = await import('./services/lineMessaging');
      return await pushTextMessage(input.userId, input.message);
    }),

  sendFlexMessage: protectedProcedure
    .input(z.object({
      userId: z.string(),
      altText: z.string(),
      contents: z.any(),
    }))
    .mutation(async ({ input }) => {
      const { pushFlexMessage } = await import('./services/lineMessaging');
      return await pushFlexMessage(input.userId, input.altText, input.contents);
    }),

  // 療程到期提醒
  sendTreatmentReminders: protectedProcedure
    .input(z.object({
      daysBeforeExpiry: z.number().optional(),
      organizationId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { sendTreatmentExpiryReminders } = await import('./services/treatmentReminder');
      return await sendTreatmentExpiryReminders(
        input.daysBeforeExpiry || 3,
        input.organizationId
      );
    }),

  // 沉睡客戶喚醒
  sendDormantReminders: protectedProcedure
    .input(z.object({
      minDays: z.number().optional(),
      maxDays: z.number().optional(),
      organizationId: z.number().optional(),
      specialOffer: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { sendDormantCustomerReminders } = await import('./services/dormantCustomer');
      return await sendDormantCustomerReminders(
        input.minDays || 30,
        input.maxDays || 180,
        input.organizationId,
        input.specialOffer
      );
    }),

  // 沉睡客戶統計
  getDormantStats: protectedProcedure
    .input(z.object({ organizationId: z.number().optional() }))
    .query(async ({ input }) => {
      const { getDormantCustomerStats } = await import('./services/dormantCustomer');
      return await getDormantCustomerStats(input.organizationId);
    }),

  // 票券到期提醒
  sendVoucherReminders: protectedProcedure
    .input(z.object({
      daysBeforeExpiry: z.number().optional(),
      organizationId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { sendVoucherExpiryReminders } = await import('./services/lineMessaging');
      return await sendVoucherExpiryReminders(
        input.daysBeforeExpiry || 3,
        input.organizationId
      );
    }),
});

// ============================================
// Report Router
// ============================================
const reportRouter = router({
  revenue: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const { organizationId, startDate, endDate } = input;
      // Get orders within date range
      const orders = await db.listOrders(organizationId, {
        status: 'completed',
      });
      
      const totalRevenue = orders.data.reduce((sum, order) => sum + Number(order.subtotal), 0);
      
      // Generate daily revenue data
      const dailyMap = new Map<string, number>();
      orders.data.forEach(order => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) || 0) + Number(order.subtotal));
      });
      
      const dailyRevenue = Array.from(dailyMap.entries()).map(([date, amount]) => ({
        date,
        amount,
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      // Revenue by category (simplified)
      const byCategory = [
        { category: '療程', amount: Math.round(totalRevenue * 0.6) },
        { category: '產品', amount: Math.round(totalRevenue * 0.3) },
        { category: '其他', amount: Math.round(totalRevenue * 0.1) },
      ];
      
      return {
        totalRevenue,
        growthRate: 12.5, // TODO: Calculate actual growth
        dailyRevenue,
        byCategory,
      };
    }),

  appointmentStats: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const { organizationId, startDate, endDate } = input;
      const appointments = await db.listAppointments(organizationId, {
        date: startDate,
      });
      
      const total = appointments.data.length;
      const completed = appointments.data.filter(a => a.status === 'completed').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // By time slot
      const timeSlotMap = new Map<string, number>();
      appointments.data.forEach(apt => {
        const hour = new Date(apt.appointmentDate).getHours();
        const slot = `${hour}:00`;
        timeSlotMap.set(slot, (timeSlotMap.get(slot) || 0) + 1);
      });
      
      const byTimeSlot = Array.from(timeSlotMap.entries()).map(([timeSlot, count]) => ({
        timeSlot,
        count,
      })).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
      
      // By status
      const statusMap = new Map<string, number>();
      appointments.data.forEach(apt => {
        const status = apt.status || 'pending';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });
      
      const statusLabels: Record<string, string> = {
        pending: '待確認',
        confirmed: '已確認',
        completed: '已完成',
        cancelled: '已取消',
        no_show: '未到',
      };
      
      const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
        status: statusLabels[status] || status,
        count,
      }));
      
      return {
        totalAppointments: total,
        completionRate,
        byTimeSlot,
        byStatus,
      };
    }),

  customerStats: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const { organizationId, startDate, endDate } = input;
      const customers = await db.listCustomers(organizationId, { limit: 1000 });
      
      const start = new Date(startDate);
      const newCustomers = customers.data.filter(c => new Date(c.createdAt) >= start).length;
      const returningCustomers = customers.total - newCustomers;
      const returnRate = customers.total > 0 ? Math.round((returningCustomers / customers.total) * 100) : 0;
      
      // By member level
      const levelMap = new Map<string, number>();
      customers.data.forEach(c => {
        const level = c.memberLevel || 'regular';
        levelMap.set(level, (levelMap.get(level) || 0) + 1);
      });
      
      const levelLabels: Record<string, string> = {
        regular: '一般',
        silver: '銀卡',
        gold: '金卡',
        platinum: '白金',
        diamond: '鑽石',
      };
      
      const byMemberLevel = Array.from(levelMap.entries()).map(([level, count]) => ({
        level: levelLabels[level] || level,
        count,
      }));
      
      // By frequency (simplified)
      const byFrequency = [
        { frequency: '1次', count: Math.round(customers.total * 0.4) },
        { frequency: '2-3次', count: Math.round(customers.total * 0.3) },
        { frequency: '4-6次', count: Math.round(customers.total * 0.2) },
        { frequency: '7次以上', count: Math.round(customers.total * 0.1) },
      ];
      
      return {
        newCustomers,
        returningCustomers,
        returnRate,
        byMemberLevel,
        byFrequency,
      };
    }),

  productStats: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const { organizationId } = input;
      const products = await db.listProducts(organizationId, { limit: 100 });
      
      // Sort by some metric (simplified - using price as proxy)
      const sortedProducts = [...products.data].sort((a, b) => Number(b.price) - Number(a.price));
      
      const topProducts = sortedProducts.slice(0, 10).map((p, i) => ({
        name: p.name,
        count: 50 - i * 5, // Placeholder counts
      }));
      
      return {
        topProduct: topProducts[0] || null,
        topProducts,
      };
    }),

  staffPerformance: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const { organizationId } = input;
      const staffResult = await db.listStaff(organizationId);
      
      // Generate mock performance data
      const rankings = staffResult.data.map((s: { id: number; name: string }, i: number) => ({
        staffId: s.id,
        name: s.name,
        revenue: 100000 - i * 15000,
        serviceCount: 30 - i * 3,
      })).sort((a: { revenue: number }, b: { revenue: number }) => b.revenue - a.revenue);
      
      return {
        rankings,
      };
    }),
});

// ============================================
// Clinic Dashboard Router (for clinic admins)
// ============================================
const clinicRouter = router({
  stats: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      const { organizationId } = input;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get today's appointments
      const appointments = await db.listAppointments(organizationId, {
        date: today.toISOString().split('T')[0],
      });
      
      // Get customer count
      const customers = await db.listCustomers(organizationId, { limit: 1 });
      
      // Get pending aftercare
      const aftercare = await db.listAftercareRecords(organizationId, { status: 'pending' });
      
      return {
        todayAppointments: appointments.data.length,
        customers: customers.total,
        monthlyRevenue: 0, // TODO: Calculate from orders
        pendingAftercare: aftercare.length,
      };
    }),
});

// ============================================
// Treatment Record Router - 核心功能 1
// ============================================
const treatmentRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listTreatmentRecords(organizationId, options);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getTreatmentRecordById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      appointmentId: z.number().optional(),
      staffId: z.number().optional(),
      productId: z.number().optional(),
      treatmentDate: z.string(),
      treatmentType: z.string().optional(),
      treatmentArea: z.string().optional(),
      dosage: z.string().optional(),
      notes: z.string().optional(),
      internalNotes: z.string().optional(),
      satisfactionScore: z.number().optional(),
      nextFollowUpDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { treatmentDate, nextFollowUpDate, ...rest } = input;
      const data: any = {
        ...rest,
        treatmentDate: new Date(treatmentDate),
      };
      if (nextFollowUpDate) {
        data.nextFollowUpDate = nextFollowUpDate;
      }
      const id = await db.createTreatmentRecord(data);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      treatmentType: z.string().optional(),
      treatmentArea: z.string().optional(),
      dosage: z.string().optional(),
      notes: z.string().optional(),
      internalNotes: z.string().optional(),
      satisfactionScore: z.number().optional(),
      nextFollowUpDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateTreatmentRecord(id, data as any);
      return { success: true };
    }),

  getTimeline: protectedProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCustomerTreatmentTimeline(input.customerId);
    }),

  // 療程照片相關
  listPhotos: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      treatmentRecordId: z.number().optional(),
      photoType: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listTreatmentPhotos(input.customerId, input);
    }),

  uploadPhoto: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      treatmentRecordId: z.number().optional(),
      photoType: z.enum(["before", "after", "during", "other"]),
      photoUrl: z.string(),
      thumbnailUrl: z.string().optional(),
      photoDate: z.string(),
      angle: z.string().optional(),
      notes: z.string().optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { photoDate, ...rest } = input;
      const id = await db.createTreatmentPhoto({
        ...rest,
        photoDate: new Date(photoDate),
      });
      return { id };
    }),

  getBeforeAfter: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      treatmentRecordId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getBeforeAfterPhotos(input.customerId, input.treatmentRecordId);
    }),
});

// ============================================
// Customer Package Router - 核心功能 2
// ============================================
const packageRouter = router({
  list: protectedProcedure
    .input(z.object({
      customerId: z.number().optional(),
      organizationId: z.number().optional(),
      status: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      if (input.customerId) {
        return await db.listCustomerPackages(input.customerId, { status: input.status });
      }
      if (input.organizationId) {
        return await db.listOrganizationPackages(input.organizationId, input);
      }
      return [];
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getCustomerPackageById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      productId: z.number(),
      packageName: z.string(),
      totalSessions: z.number(),
      purchasePrice: z.string(),
      purchaseDate: z.string(),
      expiryDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { purchaseDate, expiryDate, ...rest } = input;
      const id = await db.createCustomerPackage({
        ...rest,
        remainingSessions: input.totalSessions,
        purchaseDate: new Date(purchaseDate),
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      });
      return { id };
    }),

  deductSession: protectedProcedure
    .input(z.object({
      packageId: z.number(),
      sessionsToDeduct: z.number().optional(),
      appointmentId: z.number().optional(),
      treatmentRecordId: z.number().optional(),
      staffId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { packageId, sessionsToDeduct = 1, ...usageData } = input;
      
      // 扣除堂數
      const result = await db.deductPackageSession(packageId, sessionsToDeduct);
      
      // 建立使用記錄
      const pkg = await db.getCustomerPackageById(packageId);
      if (pkg) {
        await db.createPackageUsageRecord({
          packageId,
          customerId: pkg.customerId,
          sessionsUsed: sessionsToDeduct,
          usageDate: new Date(),
          ...usageData,
        });
      }
      
      return result;
    }),

  getUsageRecords: protectedProcedure
    .input(z.object({ packageId: z.number() }))
    .query(async ({ input }) => {
      return await db.listPackageUsageRecords(input.packageId);
    }),
});

// ============================================
// Consultation Router - 核心功能 3
// ============================================
const consultationRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      status: z.string().optional(),
      staffId: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listConsultations(organizationId, options);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getConsultationById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number().optional(),
      prospectName: z.string().optional(),
      prospectPhone: z.string().optional(),
      prospectEmail: z.string().optional(),
      consultationDate: z.string(),
      consultationType: z.enum(["walk_in", "phone", "online", "referral"]).optional(),
      staffId: z.number().optional(),
      interestedProducts: z.array(z.number()).optional(),
      concerns: z.string().optional(),
      recommendations: z.string().optional(),
      source: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { consultationDate, ...rest } = input;
      const id = await db.createConsultation({
        ...rest,
        consultationDate: new Date(consultationDate),
      });
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["new", "contacted", "scheduled", "converted", "lost"]).optional(),
      staffId: z.number().optional(),
      recommendations: z.string().optional(),
      notes: z.string().optional(),
      convertedOrderId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      if (data.status === 'converted') {
        (data as any).conversionDate = new Date();
      }
      await db.updateConsultation(id, data as any);
      return { success: true };
    }),

  getConversionStats: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getConsultationConversionStats(input.organizationId);
    }),
});

// ============================================
// Follow-up Router - 核心功能 3
// ============================================
const followUpRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      consultationId: z.number().optional(),
      customerId: z.number().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listFollowUps(organizationId, options);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      consultationId: z.number().optional(),
      customerId: z.number().optional(),
      staffId: z.number().optional(),
      followUpDate: z.string(),
      followUpType: z.enum(["call", "sms", "line", "email", "visit"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { followUpDate, ...rest } = input;
      const id = await db.createFollowUp({
        ...rest,
        followUpDate: new Date(followUpDate),
      });
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "completed", "cancelled", "rescheduled"]).optional(),
      outcome: z.string().optional(),
      notes: z.string().optional(),
      nextFollowUpDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, nextFollowUpDate, ...rest } = input;
      const data: any = { ...rest };
      if (nextFollowUpDate) data.nextFollowUpDate = new Date(nextFollowUpDate);
      await db.updateFollowUp(id, data);
      return { success: true };
    }),

  getPending: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getPendingFollowUps(input.organizationId, input.staffId);
    }),
});

// ============================================
// RFM Analysis Router - 核心功能 4
// ============================================
const rfmRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      segment: z.string().optional(),
      minChurnRisk: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listCustomerRfmScores(organizationId, options);
    }),

  getCustomerScore: protectedProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCustomerRfmScore(input.customerId);
    }),

  calculate: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const rfmData = await db.calculateCustomerRfm(input.organizationId, input.customerId);
      await db.upsertCustomerRfmScore({
        organizationId: input.organizationId,
        customerId: input.customerId,
        ...rfmData,
      });
      return rfmData;
    }),

  // 背景任務模式：建立任務並立即返回，後台繼續處理
  calculateAll: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // 建立背景任務
      const jobId = await db.createBackgroundJob({
        organizationId: input.organizationId,
        jobType: 'rfm_calculation',
        status: 'pending',
        createdBy: ctx.user?.id,
      });
      
      // 非同步執行（不等待完成）
      db.processRfmCalculationJob(jobId, input.organizationId).catch(err => {
        console.error('[RFM] Background job failed:', err);
      });
      
      return { jobId, status: 'started' };
    }),

  // 查詢任務狀態
  getJobStatus: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ input }) => {
      const job = await db.getBackgroundJobById(input.jobId);
      if (!job) return null;
      return {
        id: job.id,
        status: job.status,
        progress: job.progress,
        totalItems: job.totalItems,
        processedItems: job.processedItems,
        result: job.result,
        errorMessage: job.errorMessage,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
      };
    }),

  // 取得最新的 RFM 計算任務
  getLatestJob: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      const job = await db.getLatestJobByType(input.organizationId, 'rfm_calculation');
      if (!job) return null;
      return {
        id: job.id,
        status: job.status,
        progress: job.progress,
        totalItems: job.totalItems,
        processedItems: job.processedItems,
        result: job.result,
        errorMessage: job.errorMessage,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        createdAt: job.createdAt,
      };
    }),

  getChurnRiskList: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      minRisk: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const scores = await db.listCustomerRfmScores(input.organizationId, {
        minChurnRisk: input.minRisk || 50,
      });
      return scores.sort((a, b) => (b.churnRisk || 0) - (a.churnRisk || 0));
    }),

  // 真實 RFM 分析 API
  performAnalysis: protectedProcedure
    .input(z.object({
      organizationId: z.number().optional(),
      lookbackDays: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { performRFMAnalysis } = await import('./services/rfmAnalysis');
      return await performRFMAnalysis(input.organizationId, input.lookbackDays);
    }),

  getSummary: protectedProcedure
    .input(z.object({ organizationId: z.number().optional() }))
    .query(async ({ input }) => {
      const { getRFMSummary } = await import('./services/rfmAnalysis');
      return await getRFMSummary(input.organizationId);
    }),

  getCustomersBySegment: protectedProcedure
    .input(z.object({
      segment: z.string(),
      organizationId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { getCustomersBySegment } = await import('./services/rfmAnalysis');
      return await getCustomersBySegment(input.segment as any, input.organizationId);
    }),
});

// ============================================
// Commission Router - 核心功能 6
// ============================================
const commissionRouter = router({
  listRules: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.listCommissionRules(input.organizationId);
    }),

  createRule: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string(),
      productId: z.number().optional(),
      productCategory: z.string().optional(),
      commissionType: z.enum(["percentage", "fixed"]).optional(),
      commissionValue: z.string(),
      minSalesAmount: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createCommissionRule(input);
      return { id };
    }),

  updateRule: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      commissionType: z.enum(["percentage", "fixed"]).optional(),
      commissionValue: z.string().optional(),
      minSalesAmount: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCommissionRule(id, data as any);
      return { success: true };
    }),

  listCommissions: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listStaffCommissions(organizationId, options);
    }),

  createCommission: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      orderId: z.number().optional(),
      orderItemId: z.number().optional(),
      appointmentId: z.number().optional(),
      commissionRuleId: z.number().optional(),
      salesAmount: z.string(),
      commissionAmount: z.string(),
      commissionDate: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { commissionDate, ...rest } = input;
      const id = await db.createStaffCommission({
        ...rest,
        commissionDate: new Date(commissionDate),
      });
      return { id };
    }),

  updateCommissionStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "approved", "paid", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      const data: any = { status: input.status };
      if (input.status === 'paid') data.paidAt = new Date();
      await db.updateStaffCommission(input.id, data);
      return { success: true };
    }),

  getStaffSummary: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      staffId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      return await db.getStaffCommissionSummary(
        input.organizationId,
        input.staffId,
        new Date(input.startDate),
        new Date(input.endDate)
      );
    }),

  // 真實佣金計算 API
  calculatePeriod: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      organizationId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { calculateCommissions } = await import('./services/commissionCalculator');
      return await calculateCommissions(
        new Date(input.startDate),
        new Date(input.endDate),
        input.organizationId
      );
    }),

  calculateCurrentMonth: protectedProcedure
    .input(z.object({ organizationId: z.number().optional() }))
    .mutation(async ({ input }) => {
      const { calculateCurrentMonthCommissions } = await import('./services/commissionCalculator');
      return await calculateCurrentMonthCommissions(input.organizationId);
    }),

  getLeaderboard: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      organizationId: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { getCommissionLeaderboard } = await import('./services/commissionCalculator');
      return await getCommissionLeaderboard(
        new Date(input.startDate),
        new Date(input.endDate),
        input.organizationId,
        input.limit
      );
    }),

  getSummaryStats: protectedProcedure
    .input(z.object({ organizationId: z.number().optional() }))
    .query(async ({ input }) => {
      const { getCommissionSummary } = await import('./services/commissionCalculator');
      return await getCommissionSummary(input.organizationId);
    }),
});

// ============================================
// Inventory Router - 核心功能 7
// ============================================
const inventoryRouter = router({
  listTransactions: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      productId: z.number().optional(),
      transactionType: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listInventoryTransactions(organizationId, options);
    }),

  createTransaction: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      productId: z.number(),
      transactionType: z.enum(["purchase", "sale", "adjustment", "return", "transfer", "waste"]),
      quantity: z.number(),
      unitCost: z.string().optional(),
      totalCost: z.string().optional(),
      referenceId: z.number().optional(),
      referenceType: z.string().optional(),
      batchNumber: z.string().optional(),
      expiryDate: z.string().optional(),
      notes: z.string().optional(),
      staffId: z.number().optional(),
      transactionDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { transactionDate, expiryDate, ...rest } = input;
      const data: any = {
        ...rest,
        transactionDate: new Date(transactionDate),
      };
      if (expiryDate) {
        data.expiryDate = expiryDate;
      }
      const id = await db.createInventoryTransaction(data);
      return { id };
    }),

  getCostAnalysis: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      productId: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.getProductCostAnalysis(input.organizationId, input.productId);
    }),

  getGrossMargin: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      productId: z.number(),
    }))
    .query(async ({ input }) => {
      const product = await db.getProductById(input.productId);
      const costAnalysis = await db.getProductCostAnalysis(input.organizationId, input.productId);
      
      if (!product) return { grossMargin: 0, marginRate: 0 };
      
      const sellingPrice = Number(product.price);
      const cost = costAnalysis.averageCost;
      const grossMargin = sellingPrice - cost;
      const marginRate = sellingPrice > 0 ? (grossMargin / sellingPrice) * 100 : 0;
      
      return { grossMargin, marginRate, sellingPrice, cost };
    }),
});

// ============================================
// Revenue Target Router - 核心功能 8
// ============================================
const revenueTargetRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      year: z.number().optional(),
      targetType: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listRevenueTargets(organizationId, options);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      targetType: z.enum(["monthly", "quarterly", "yearly"]).optional(),
      targetYear: z.number(),
      targetMonth: z.number().optional(),
      targetQuarter: z.number().optional(),
      targetAmount: z.string(),
      staffId: z.number().optional(),
      productCategory: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createRevenueTarget(input);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      targetAmount: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateRevenueTarget(id, data as any);
      return { success: true };
    }),

  getAchievement: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      year: z.number(),
      month: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.calculateRevenueAchievement(input.organizationId, input.year, input.month);
    }),
});

// ============================================
// Marketing Campaign Router - 核心功能 9
// ============================================
const marketingRouter = router({
  listCampaigns: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listMarketingCampaigns(organizationId, options);
    }),

  createCampaign: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string(),
      campaignType: z.enum(["facebook", "google", "line", "instagram", "referral", "event", "other"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      budget: z.string().optional(),
      targetAudience: z.string().optional(),
      description: z.string().optional(),
      trackingCode: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { startDate, endDate, ...rest } = input;
      const id = await db.createMarketingCampaign({
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
      return { id };
    }),

  updateCampaign: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      status: z.enum(["draft", "active", "paused", "completed"]).optional(),
      actualSpend: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateMarketingCampaign(id, data as any);
      return { success: true };
    }),

  getSourceROI: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      campaignId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getSourceROIAnalysis(input.organizationId, input.campaignId);
    }),

  trackCustomerSource: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      campaignId: z.number().optional(),
      sourceType: z.string().optional(),
      sourceName: z.string().optional(),
      referralCode: z.string().optional(),
      referredByCustomerId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createCustomerSource({
        ...input,
        firstVisitDate: new Date(),
      });
      return { id };
    }),
});

// ============================================
// Satisfaction Survey Router - 核心功能 10
// ============================================
const satisfactionRouter = router({
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number().optional(),
      status: z.string().optional(),
      surveyType: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listSatisfactionSurveys(organizationId, options);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      appointmentId: z.number().optional(),
      treatmentRecordId: z.number().optional(),
      surveyType: z.enum(["post_treatment", "post_purchase", "general", "nps"]).optional(),
      staffId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createSatisfactionSurvey(input);
      return { id };
    }),

  submit: protectedProcedure
    .input(z.object({
      id: z.number(),
      overallScore: z.number().optional(),
      serviceScore: z.number().optional(),
      staffScore: z.number().optional(),
      facilityScore: z.number().optional(),
      valueScore: z.number().optional(),
      npsScore: z.number().optional(),
      wouldRecommend: z.boolean().optional(),
      feedback: z.string().optional(),
      improvementSuggestions: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateSatisfactionSurvey(id, {
        ...data,
        status: 'completed',
        completedAt: new Date(),
      });
      return { success: true };
    }),

  getNPSStats: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getNPSStats(input.organizationId);
    }),

  getTrend: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      months: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getSatisfactionTrend(input.organizationId, input.months);
    }),
});

// ============================================
// Phase 41: 注射點位圖 Router
// ============================================
const injectionRouter = router({
  createRecord: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      appointmentId: z.number().optional(),
      treatmentRecordId: z.number().optional(),
      staffId: z.number(),
      templateType: z.enum(["face_front", "face_side_left", "face_side_right", "body_front", "body_back"]).optional(),
      productUsed: z.string().optional(),
      totalUnits: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createInjectionRecord(input);
      return { id };
    }),

  getRecord: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const record = await db.getInjectionRecordById(input.id);
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      const points = await db.listInjectionPoints(input.id);
      return { ...record, points };
    }),

  listRecords: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listInjectionRecords(input.customerId, input);
    }),

  addPoint: protectedProcedure
    .input(z.object({
      injectionRecordId: z.number(),
      positionX: z.string(),
      positionY: z.string(),
      units: z.string(),
      depth: z.string().optional(),
      technique: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createInjectionPoint(input);
      return { id };
    }),

  compareHistory: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      templateType: z.string(),
    }))
    .query(async ({ input }) => {
      return await db.compareInjectionHistory(input.customerId, input.templateType);
    }),
});

// ============================================
// Phase 42: 電子同意書 Router
// ============================================
const consentRouter = router({
  createTemplate: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string(),
      category: z.enum(["treatment", "surgery", "anesthesia", "photography", "general"]).optional(),
      content: z.string(),
      requiredFields: z.any().optional(),
      version: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createConsentFormTemplate(input);
      return { id };
    }),

  updateTemplate: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      content: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateConsentFormTemplate(id, data);
      return { success: true };
    }),

  listTemplates: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      category: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listConsentFormTemplates(input.organizationId, input);
    }),

  sign: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      templateId: z.number(),
      appointmentId: z.number().optional(),
      treatmentRecordId: z.number().optional(),
      signatureImageUrl: z.string(),
      signedContent: z.string().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      witnessName: z.string().optional(),
      witnessSignatureUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createConsentSignature({ ...input, status: 'signed' });
      return { id };
    }),

  getSignature: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getConsentSignatureById(input.id);
    }),

  listSignatures: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listCustomerConsentSignatures(input.customerId, input);
    }),
});

// ============================================
// Phase 43: 處方管理 Router
// ============================================
const prescriptionRouter = router({
  createMedication: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string(),
      genericName: z.string().optional(),
      category: z.enum(["oral", "topical", "injection", "supplement", "other"]).optional(),
      dosageForm: z.string().optional(),
      strength: z.string().optional(),
      unit: z.string().optional(),
      manufacturer: z.string().optional(),
      contraindications: z.string().optional(),
      sideEffects: z.string().optional(),
      instructions: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createMedication(input);
      return { id };
    }),

  listMedications: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      category: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listMedications(input.organizationId, input);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      prescriberId: z.number(),
      appointmentId: z.number().optional(),
      treatmentRecordId: z.number().optional(),
      medicationId: z.number(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string().optional(),
      quantity: z.number(),
      refillsAllowed: z.number().optional(),
      instructions: z.string().optional(),
      warnings: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // 檢查過敏衝突
      const conflict = await db.checkAllergyConflict(input.customerId, input.medicationId);
      if (conflict.hasConflict) {
        throw new TRPCError({ 
          code: "PRECONDITION_FAILED", 
          message: `過敏警告: ${conflict.conflicts.map(c => c.allergen).join(', ')}` 
        });
      }
      const id = await db.createPrescription(input);
      return { id };
    }),

  listPrescriptions: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      status: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listCustomerPrescriptions(input.customerId, input);
    }),

  addAllergy: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      allergyType: z.enum(["medication", "food", "environmental", "other"]).optional(),
      allergen: z.string(),
      severity: z.enum(["mild", "moderate", "severe", "life_threatening"]).optional(),
      reaction: z.string().optional(),
      diagnosedDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createCustomerAllergy({
        ...input,
        diagnosedDate: input.diagnosedDate ?? undefined,
      });
      return { id };
    }),

  listAllergies: protectedProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.listCustomerAllergies(input.customerId);
    }),

  checkConflict: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      medicationId: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.checkAllergyConflict(input.customerId, input.medicationId);
    }),
});

// ============================================
// Phase 44: AI 膚質分析 Router
// ============================================
const skinAnalysisRouter = router({
  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      appointmentId: z.number().optional(),
      photoUrl: z.string(),
      analysisType: z.enum(["full_face", "forehead", "cheeks", "chin", "nose", "eyes"]).optional(),
    }))
    .mutation(async ({ input }) => {
      // 建立分析記錄（實際 AI 分析需要整合外部服務）
      const id = await db.createSkinAnalysisRecord(input);
      
      // 模擬 AI 分析結果（實際應用時替換為真實 AI 服務）
      const metricTypes = ['wrinkles', 'spots', 'pores', 'texture', 'hydration', 'oiliness', 'redness', 'elasticity'] as const;
      for (const metricType of metricTypes) {
        await db.createSkinMetric({
          analysisRecordId: id,
          metricType,
          score: Math.floor(Math.random() * 40) + 60, // 60-100 的隨機分數
          severity: 'mild',
        });
      }
      
      return { id };
    }),

  getRecord: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const record = await db.getSkinAnalysisRecordById(input.id);
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      const metrics = await db.listSkinMetrics(input.id);
      return { ...record, metrics };
    }),

  listRecords: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listSkinAnalysisRecords(input.customerId, input);
    }),

  compare: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      metricType: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.compareSkinAnalysis(input.customerId, input.metricType);
    }),
});

// ============================================
// Phase 45: 會員訂閱制 Router
// ============================================
const subscriptionRouter = router({
  createPlan: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string(),
      description: z.string().optional(),
      monthlyPrice: z.string(),
      annualPrice: z.string().optional(),
      benefits: z.any().optional(),
      includedServices: z.any().optional(),
      discountPercentage: z.number().optional(),
      priorityBooking: z.boolean().optional(),
      freeConsultations: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createMembershipPlan(input);
      return { id };
    }),

  updatePlan: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      monthlyPrice: z.string().optional(),
      annualPrice: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateMembershipPlan(id, data);
      return { success: true };
    }),

  listPlans: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listMembershipPlans(input.organizationId, input);
    }),

  subscribe: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      planId: z.number(),
      billingCycle: z.enum(["monthly", "annual"]).optional(),
      paymentMethod: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const startDateObj = new Date();
      const endDateObj = new Date();
      if (input.billingCycle === 'annual') {
        endDateObj.setFullYear(endDateObj.getFullYear() + 1);
      } else {
        endDateObj.setMonth(endDateObj.getMonth() + 1);
      }
      const startDate = startDateObj.toISOString().split('T')[0];
      const endDate = endDateObj.toISOString().split('T')[0];
      
      const id = await db.createMemberSubscription({
        ...input,
        startDate,
        endDate,
        nextBillingDate: endDate,
        status: 'active',
      });
      return { id };
    }),

  cancelSubscription: protectedProcedure
    .input(z.object({
      id: z.number(),
      cancelReason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.updateMemberSubscription(input.id, {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: input.cancelReason,
        autoRenew: false,
      });
      return { success: true };
    }),

  getCustomerSubscription: protectedProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCustomerSubscription(input.customerId);
    }),

  listSubscriptions: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      status: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listOrganizationSubscriptions(input.organizationId, input);
    }),

  listPayments: protectedProcedure
    .input(z.object({ subscriptionId: z.number() }))
    .query(async ({ input }) => {
      return await db.listSubscriptionPayments(input.subscriptionId);
    }),
});

// ============================================
// Phase 46: 遠程諮詢 Router
// ============================================
const teleConsultRouter = router({
  create: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      staffId: z.number(),
      appointmentId: z.number().optional(),
      scheduledAt: z.string(),
      duration: z.number().optional(),
      consultationType: z.enum(["initial", "follow_up", "pre_treatment", "post_treatment"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const id = await db.createTeleConsultation({
        ...input,
        scheduledAt: new Date(input.scheduledAt),
        roomId,
        roomUrl: `https://meet.example.com/${roomId}`,
      });
      return { id, roomId };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "no_show"]).optional(),
      notes: z.string().optional(),
      summary: z.string().optional(),
      startedAt: z.string().optional(),
      endedAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, startedAt, endedAt, ...data } = input;
      await db.updateTeleConsultation(id, {
        ...data,
        startedAt: startedAt ? new Date(startedAt) : undefined,
        endedAt: endedAt ? new Date(endedAt) : undefined,
      });
      return { success: true };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const consultation = await db.getTeleConsultationById(input.id);
      if (!consultation) throw new TRPCError({ code: "NOT_FOUND" });
      const recordings = await db.listConsultationRecordings(input.id);
      return { ...consultation, recordings };
    }),

  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      status: z.string().optional(),
      customerId: z.number().optional(),
      staffId: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listTeleConsultations(input.organizationId, input);
    }),

  addRecording: protectedProcedure
    .input(z.object({
      teleConsultationId: z.number(),
      recordingUrl: z.string(),
      duration: z.number().optional(),
      fileSize: z.number().optional(),
      format: z.string().optional(),
      transcription: z.string().optional(),
      consentGiven: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createConsultationRecording(input);
      return { id };
    }),
});

// ============================================
// Phase 47: 推薦獎勵系統 Router
// ============================================
const referralRouter = router({
  generateCode: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number(),
      referrerRewardType: z.enum(["points", "credit", "discount", "free_service"]).optional(),
      referrerRewardValue: z.string().optional(),
      refereeRewardType: z.enum(["points", "credit", "discount", "free_service"]).optional(),
      refereeRewardValue: z.string().optional(),
      maxUses: z.number().optional(),
      expiresAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const code = `REF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const id = await db.createReferralCode({
        ...input,
        code,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      });
      return { id, code };
    }),

  getCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      return await db.getReferralCodeByCode(input.code);
    }),

  getCustomerCode: protectedProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCustomerReferralCode(input.customerId);
    }),

  useCode: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      code: z.string(),
      refereeId: z.number(),
      refereeOrderId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const referralCode = await db.getReferralCodeByCode(input.code);
      if (!referralCode) throw new TRPCError({ code: "NOT_FOUND", message: "推薦碼不存在" });
      if (!referralCode.isActive) throw new TRPCError({ code: "BAD_REQUEST", message: "推薦碼已停用" });
      if (referralCode.maxUses && (referralCode.usedCount || 0) >= referralCode.maxUses) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "推薦碼已達使用上限" });
      }
      
      // 建立推薦記錄
      const recordId = await db.createReferralRecord({
        organizationId: input.organizationId,
        referralCodeId: referralCode.id,
        referrerId: referralCode.customerId,
        refereeId: input.refereeId,
        refereeOrderId: input.refereeOrderId,
        status: 'qualified',
        qualifiedAt: new Date(),
      });
      
      // 更新使用次數
      await db.updateReferralCodeUsage(referralCode.id);
      
      // 建立推薦人獎勵
      await db.createReferralReward({
        referralRecordId: recordId,
        recipientId: referralCode.customerId,
        recipientType: 'referrer',
        rewardType: referralCode.referrerRewardType || 'points',
        rewardValue: referralCode.referrerRewardValue || '0',
        status: 'issued',
        issuedAt: new Date(),
      });
      
      // 建立被推薦人獎勵
      await db.createReferralReward({
        referralRecordId: recordId,
        recipientId: input.refereeId,
        recipientType: 'referee',
        rewardType: referralCode.refereeRewardType || 'discount',
        rewardValue: referralCode.refereeRewardValue || '0',
        status: 'issued',
        issuedAt: new Date(),
      });
      
      return { success: true, recordId };
    }),

  listRecords: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      referrerId: z.number().optional(),
      status: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listReferralRecords(input.organizationId, input);
    }),

  listRewards: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listCustomerReferralRewards(input.customerId, input);
    }),

  getStats: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getReferralStats(input.organizationId);
    }),
});

// ============================================
// Phase 48: 社群媒體整合 Router
// ============================================
const socialRouter = router({
  connectAccount: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      platform: z.enum(["facebook", "instagram", "line", "tiktok", "youtube", "xiaohongshu"]),
      accountName: z.string(),
      accountId: z.string().optional(),
      accessToken: z.string().optional(),
      refreshToken: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createSocialAccount({
        ...input,
        isConnected: !!input.accessToken,
      });
      return { id };
    }),

  updateAccount: protectedProcedure
    .input(z.object({
      id: z.number(),
      accountName: z.string().optional(),
      accessToken: z.string().optional(),
      refreshToken: z.string().optional(),
      isConnected: z.boolean().optional(),
      followerCount: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateSocialAccount(id, data);
      return { success: true };
    }),

  listAccounts: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.listSocialAccounts(input.organizationId);
    }),

  createPost: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      socialAccountId: z.number(),
      content: z.string(),
      mediaUrls: z.array(z.string()).optional(),
      hashtags: z.array(z.string()).optional(),
      scheduledAt: z.string(),
      postType: z.enum(["image", "video", "carousel", "story", "reel"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createScheduledPost({
        ...input,
        scheduledAt: new Date(input.scheduledAt),
        status: 'scheduled',
        createdBy: ctx.user?.id,
      });
      return { id };
    }),

  updatePost: protectedProcedure
    .input(z.object({
      id: z.number(),
      content: z.string().optional(),
      mediaUrls: z.array(z.string()).optional(),
      scheduledAt: z.string().optional(),
      status: z.enum(["draft", "scheduled", "published", "failed", "cancelled"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, scheduledAt, ...data } = input;
      await db.updateScheduledPost(id, {
        ...data,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      });
      return { success: true };
    }),

  listPosts: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      status: z.string().optional(),
      socialAccountId: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listScheduledPosts(input.organizationId, input);
    }),

  getAnalytics: protectedProcedure
    .input(z.object({
      socialAccountId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getSocialAnalytics(input.socialAccountId, input);
    }),

  getStats: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getSocialAccountStats(input.organizationId);
    }),
});

// ============================================
// Phase 56: 電子票券系統 Router
// ============================================
const voucherRouter = router({
  // 票券模板 CRUD
  createTemplate: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string(),
      description: z.string().optional(),
      type: z.enum(["treatment", "discount", "gift_card", "stored_value", "free_item"]).optional(),
      value: z.string().optional(),
      valueType: z.enum(["fixed_amount", "percentage", "treatment_count"]).optional(),
      applicableProducts: z.array(z.number()).optional(),
      applicableCategories: z.array(z.string()).optional(),
      applicableServices: z.array(z.number()).optional(),
      minPurchase: z.string().optional(),
      maxDiscount: z.string().optional(),
      usageLimit: z.number().optional(),
      validityType: z.enum(["fixed_date", "days_from_issue", "no_expiry"]).optional(),
      validDays: z.number().optional(),
      fixedStartDate: z.string().optional(),
      fixedEndDate: z.string().optional(),
      imageUrl: z.string().optional(),
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
      isTransferable: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createVoucherTemplate({
        ...input,
        fixedStartDate: input.fixedStartDate ?? undefined,
        fixedEndDate: input.fixedEndDate ?? undefined,
      });
      return { id };
    }),

  updateTemplate: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      value: z.string().optional(),
      usageLimit: z.number().optional(),
      validDays: z.number().optional(),
      imageUrl: z.string().optional(),
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
      isActive: z.boolean().optional(),
      isTransferable: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateVoucherTemplate(id, data);
      return { success: true };
    }),

  getTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getVoucherTemplateById(input.id);
    }),

  listTemplates: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      type: z.string().optional(),
      isActive: z.boolean().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listVoucherTemplates(input.organizationId, input);
    }),

  deleteTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteVoucherTemplate(input.id);
      return { success: true };
    }),

  // 票券發送
  issueVoucher: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      templateId: z.number(),
      customerId: z.number(),
      issueReason: z.string().optional(),
      issueChannel: z.enum(["manual", "campaign", "birthday", "referral", "purchase", "line"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const results = await db.issueVouchersToCustomers(
        input.organizationId,
        input.templateId,
        [input.customerId],
        {
          issuedBy: ctx.user?.id,
          issueReason: input.issueReason,
          issueChannel: input.issueChannel,
        }
      );
      return results[0];
    }),

  // 批量發送票券
  batchIssue: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      templateId: z.number(),
      customerIds: z.array(z.number()),
      batchName: z.string(),
      issueReason: z.string().optional(),
      issueChannel: z.enum(["manual", "campaign", "birthday", "referral", "purchase", "line"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 建立批次記錄
      const batchId = await db.createVoucherBatch({
        organizationId: input.organizationId,
        templateId: input.templateId,
        batchName: input.batchName,
        batchType: input.issueChannel === 'campaign' ? 'campaign' : 'manual',
        totalRecipients: input.customerIds.length,
        status: 'processing',
        createdBy: ctx.user?.id,
        startedAt: new Date(),
      });

      // 發送票券
      const results = await db.issueVouchersToCustomers(
        input.organizationId,
        input.templateId,
        input.customerIds,
        {
          issuedBy: ctx.user?.id,
          issueReason: input.issueReason,
          issueChannel: input.issueChannel,
          batchId,
        }
      );

      return { batchId, issued: results.length };
    }),

  // 票券實例查詢
  getInstance: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getVoucherInstanceById(input.id);
    }),

  getInstanceByCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      return await db.getVoucherInstanceByCode(input.code);
    }),

  listInstances: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number().optional(),
      templateId: z.number().optional(),
      status: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listVoucherInstances(input.organizationId, input);
    }),

  // 客戶票券列表（LIFF 用）
  myVouchers: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      status: z.string().optional(),
      includeExpired: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listCustomerVouchers(input.customerId, input);
    }),

  // 票券核銷
  redeem: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      voucherCode: z.string(),
      customerId: z.number(),
      redemptionMethod: z.enum(["qr_scan", "manual_code", "auto_apply"]).optional(),
      orderId: z.number().optional(),
      appointmentId: z.number().optional(),
      treatmentRecordId: z.number().optional(),
      discountApplied: z.string().optional(),
      originalAmount: z.string().optional(),
      finalAmount: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 取得票券實例
      const voucher = await db.getVoucherInstanceByCode(input.voucherCode);
      if (!voucher) {
        throw new TRPCError({ code: "NOT_FOUND", message: "票券不存在" });
      }
      if (voucher.organizationId !== input.organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "票券不屬於此診所" });
      }

      const redemptionId = await db.redeemVoucher({
        organizationId: input.organizationId,
        voucherInstanceId: voucher.id,
        customerId: input.customerId,
        redemptionMethod: input.redemptionMethod || 'qr_scan',
        redeemedBy: ctx.user?.id,
        orderId: input.orderId,
        appointmentId: input.appointmentId,
        treatmentRecordId: input.treatmentRecordId,
        discountApplied: input.discountApplied,
        originalAmount: input.originalAmount,
        finalAmount: input.finalAmount,
        notes: input.notes,
      });

      return { redemptionId, success: true };
    }),

  // 核銷記錄查詢
  listRedemptions: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      voucherInstanceId: z.number().optional(),
      customerId: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listVoucherRedemptions(input.organizationId, input);
    }),

  // 批次發送記錄
  listBatches: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      status: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listVoucherBatches(input.organizationId, input);
    }),

  getBatch: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getVoucherBatchById(input.id);
    }),

  // 票券統計
  getStats: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getVoucherStats(input.organizationId);
    }),

  // 轉贈票券
  transfer: protectedProcedure
    .input(z.object({
      voucherId: z.number(),
      newCustomerId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const newVoucherId = await db.transferVoucher(input.voucherId, input.newCustomerId);
      return { newVoucherId, success: true };
    }),

  // 更新過期票券
  updateExpired: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateExpiredVouchers(input.organizationId);
      return { success: true };
    }),

  // 取消票券
  cancel: protectedProcedure
    .input(z.object({
      id: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.updateVoucherInstance(input.id, {
        status: 'cancelled',
        notes: input.reason,
      });
      return { success: true };
    }),

  // 建立轉贈記錄
  createTransfer: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      voucherInstanceId: z.number(),
      fromCustomerId: z.number(),
      fromCustomerName: z.string().optional(),
      fromCustomerPhone: z.string().optional(),
      toCustomerName: z.string().optional(),
      toCustomerPhone: z.string(),
      toCustomerEmail: z.string().optional(),
      giftMessage: z.string().optional(),
      notificationChannel: z.enum(["line", "sms", "email"]).optional(),
    }))
    .mutation(async ({ input }) => {
      // 生成領取碼
      const claimCode = `GIFT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      // 設定預設有效期（7天）
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const transferId = await db.createVoucherTransfer({
        ...input,
        claimCode,
        expiresAt,
      });
      const transfer = await db.getVoucherTransferById(transferId);
      return { transferId, claimCode: transfer?.claimCode, success: true };
    }),

  // 領取轉贈票券
  claimTransfer: publicProcedure
    .input(z.object({
      claimCode: z.string(),
      customerId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const newVoucherId = await db.claimVoucherTransfer(input.claimCode, input.customerId);
      return { newVoucherId, success: true };
    }),

  // 取消轉贈
  cancelTransfer: protectedProcedure
    .input(z.object({ transferId: z.number() }))
    .mutation(async ({ input }) => {
      await db.cancelVoucherTransfer(input.transferId);
      return { success: true };
    }),

  // 查詢轉贈記錄（根據領取碼）
  getTransferByClaimCode: publicProcedure
    .input(z.object({ claimCode: z.string() }))
    .query(async ({ input }) => {
      return await db.getVoucherTransferByClaimCode(input.claimCode);
    }),

  // 列出客戶發出的轉贈
  listSentTransfers: protectedProcedure
    .input(z.object({
      customerId: z.number(),
      status: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listSentTransfers(input.customerId, input);
    }),

  // 列出待領取的轉贈（根據手機號碼）
  listPendingTransfers: publicProcedure
    .input(z.object({ phone: z.string() }))
    .query(async ({ input }) => {
      return await db.listPendingTransfersByPhone(input.phone);
    }),

  // 轉贈統計
  getTransferStats: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getTransferStats(input.organizationId);
    }),

  // 過期未領取的轉贈處理
  expirePendingTransfers: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .mutation(async ({ input }) => {
      const count = await db.expirePendingTransfers(input.organizationId);
      return { expiredCount: count, success: true };
    }),

  // 發送 LINE Flex Message 票券
  sendLineVoucher: protectedProcedure
    .input(z.object({
      voucherInstanceId: z.number(),
      customerId: z.number(),
    }))
    .mutation(async ({ input }) => {
      // 取得票券實例與模板資訊
      const voucher = await db.getVoucherInstanceById(input.voucherInstanceId);
      if (!voucher) {
        throw new TRPCError({ code: "NOT_FOUND", message: "票券不存在" });
      }

      // 取得客戶 LINE ID
      const customer = await db.getCustomerById(input.customerId);
      if (!customer || !customer.lineUserId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "客戶未綁定 LINE" });
      }

      // 更新票券狀態為待推送
      await db.updateVoucherInstance(input.voucherInstanceId, {
        linePushStatus: 'pending',
      });

      // 返回 Flex Message 模板資料（實際推送需要 LINE Channel 懑證）
      return {
        success: true,
        message: '票券已標記為待推送，請設定 LINE Channel 後即可自動發送',
        voucherCode: voucher.voucherCode,
        customerId: input.customerId,
        lineUserId: customer.lineUserId,
      };
    }),

  // 批次發送 LINE Flex Message
  sendLineBatchVouchers: protectedProcedure
    .input(z.object({
      batchId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const batch = await db.getVoucherBatchById(input.batchId);
      if (!batch) {
        throw new TRPCError({ code: "NOT_FOUND", message: "批次發送記錄不存在" });
      }

      // 更新批次狀態
      await db.updateVoucherBatch(input.batchId, {
        status: 'processing',
      });

      return {
        success: true,
        message: '批次票券已標記為處理中，請設定 LINE Channel 後即可自動發送',
        batchId: input.batchId,
      };
    }),
});

// ============================================
// Phase 61: 每日結帳系統 Router
// ============================================
const settlementRouter = router({
  // 開帳
  open: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      date: z.string(),
      openingCash: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.openDailySettlement(
        input.organizationId,
        input.date,
        input.openingCash,
        ctx.user.id
      );
      return { id };
    }),

  // 結帳
  close: protectedProcedure
    .input(z.object({
      settlementId: z.number(),
      closingCash: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await db.closeDailySettlement(
        input.settlementId,
        input.closingCash,
        ctx.user.id,
        input.notes
      );
      return result;
    }),

  // 獲取當日結帳記錄
  getByDate: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      date: z.string(),
    }))
    .query(async ({ input }) => {
      return await db.getDailySettlementByDate(input.organizationId, input.date);
    }),

  // 獲取結帳記錄
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getDailySettlementById(input.id);
    }),

  // 列出結帳記錄
  list: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      status: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listDailySettlements(organizationId, options);
    }),

  // 獲取結帳明細
  getItems: protectedProcedure
    .input(z.object({
      settlementId: z.number(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.listSettlementItems(input.settlementId, input);
    }),

  // 獲取收銀機記錄
  getCashDrawerRecords: protectedProcedure
    .input(z.object({ settlementId: z.number() }))
    .query(async ({ input }) => {
      return await db.listCashDrawerRecords(input.settlementId);
    }),

  // 新增收銀機操作（存入/取出）
  addCashOperation: protectedProcedure
    .input(z.object({
      settlementId: z.number(),
      organizationId: z.number(),
      operationType: z.enum(["deposit", "withdrawal"]),
      amount: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createCashDrawerRecord({
        settlementId: input.settlementId,
        organizationId: input.organizationId,
        operationType: input.operationType,
        amount: input.amount.toString(),
        operatedBy: ctx.user.id,
        reason: input.reason,
      });
      return { id };
    }),

  // 獲取統計摘要
  getSummary: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getSettlementSummary(input.organizationId, input);
    }),

  // 計算當日統計
  calculateDailyStats: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      date: z.string(),
    }))
    .query(async ({ input }) => {
      return await db.calculateDailyStats(input.organizationId, input.date);
    }),

  // 付款記錄
  createPayment: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      orderId: z.number().optional(),
      appointmentId: z.number().optional(),
      customerId: z.number().optional(),
      paymentMethod: z.enum(["cash", "credit_card", "debit_card", "line_pay", "transfer", "other"]),
      amount: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createPaymentRecord({
        ...input,
        amount: input.amount.toString(),
        status: 'completed',
        paidAt: new Date(),
        processedBy: ctx.user.id,
      });
      return { id };
    }),

  listPayments: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      status: z.string().optional(),
      paymentMethod: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listPaymentRecords(organizationId, options);
    }),

  // Phase 62: 自動結帳設定
  getAutoSettings: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getAutoSettlementSettings(input.organizationId);
    }),

  updateAutoSettings: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      isEnabled: z.boolean().optional(),
      autoSettleTime: z.string().optional(),
      timezone: z.string().optional(),
      autoGenerateReport: z.boolean().optional(),
      reportRecipients: z.array(z.string()).optional(),
      reportFormat: z.enum(["pdf", "excel", "both"]).optional(),
      sendLineNotification: z.boolean().optional(),
      lineNotifyRecipients: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { organizationId, ...data } = input;
      const id = await db.upsertAutoSettlementSettings(organizationId, data);
      return { id };
    }),

  // 執行自動結帳
  executeAutoSettlement: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .mutation(async ({ input }) => {
      return await db.executeAutoSettlement(input.organizationId);
    }),

  // 結帳報表
  generateReport: protectedProcedure
    .input(z.object({ settlementId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const reportId = await db.generateDailySettlementReport(input.settlementId, ctx.user.id);
      return { reportId };
    }),

  listReports: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      reportType: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listSettlementReports(organizationId, options);
    }),

  getReport: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getSettlementReportById(input.id);
    }),

  // 營收儀表板
  getDashboardData: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.getRevenueDashboardData(organizationId, options);
    }),

  // 營收趨勢
  getRevenueTrends: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      periodType: z.enum(["daily", "weekly", "monthly"]),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.getRevenueTrends(organizationId, options);
    }),

  // 進階篩選結帳歷史
  listAdvanced: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      minAmount: z.number().optional(),
      maxAmount: z.number().optional(),
      status: z.string().optional(),
      operatorId: z.number().optional(),
      sortBy: z.enum(["date", "revenue", "orders", "cashDifference"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { organizationId, ...options } = input;
      return await db.listDailySettlementsAdvanced(organizationId, options);
    }),

  // 獲取操作者列表
  getOperators: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getSettlementOperators(input.organizationId);
    }),
});

// ============================================
// Main App Router
// ============================================
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  superAdmin: superAdminRouter,
  organization: organizationRouter,
  customer: customerRouter,
  product: productRouter,
  staff: staffRouter,
  appointment: appointmentRouter,
  schedule: scheduleRouter,
  attendance: smartAttendanceRouter, // 智慧打卡系統（Phase 79-B）
  order: orderRouter,
  coupon: couponRouter,
  aftercare: aftercareRouter,
  line: lineRouter,
  clinic: clinicRouter,
  report: reportRouter,
  // 核心功能模組
  treatment: treatmentRouter,
  package: packageRouter,
  consultation: consultationRouter,
  followUp: followUpRouter,
  rfm: rfmRouter,
  commission: commissionRouter,
  inventory: inventoryRouter,
  revenueTarget: revenueTargetRouter,
  marketing: marketingRouter,
  satisfaction: satisfactionRouter,
  // Phase 41-48 進階功能模組
  injection: injectionRouter,
  consent: consentRouter,
  prescription: prescriptionRouter,
  skinAnalysis: skinAnalysisRouter,
  subscription: subscriptionRouter,
  teleConsult: teleConsultRouter,
  referral: referralRouter,
  social: socialRouter,
  // Phase 56: 電子票券系統
  voucher: voucherRouter,
  // Phase 61: 每日結帳系統
  settlement: settlementRouter,
  // Phase 29-31: LINE 整合、資料匯入、支付整合
  lineSettings: lineSettingsRouter,
  dataImport: dataImportRouter,
  payment: paymentRouter,
  // Phase 35: 定位打卡與 LINE 遊戲模組
  attendanceSettings: attendanceSettingsRouter,
  game: gameRouter,
  prize: prizeRouter,
  couponManagement: couponManagementRouter,
  lineRichMenu: lineRichMenuRouter,
  leaveManagement: leaveManagementRouter,
  // Phase 86: 系統 B 整合 - 6 大核心模組
  dashboardB: dashboardSystemBRouter,
  // Phase 92: 營運分析模組匯出報表功能
  biExport: biExportRouter,
  // Phase 95: CRM 模組客戶標籤功能
  crmTags: crmTagsRouter,
  // Phase 96: CRM 模組客戶 CRUD 功能
  crmCustomers: crmCustomersRouter,
  // Phase 97: CRM 模組客戶互動歷史記錄功能
  interactions: interactionsRouter,
  // Phase 98: CRM 模組自動化標籤系統
  tagRules: tagRulesRouter,
  // Phase 99: CRM 模組 LINE Messaging API 整合
  lineMessaging: lineMessagingRouter,
  // Phase 100: LINE Webhook 自動接收訊息功能
  lineWebhook: lineWebhookRouter,
  autoReplyRules: autoReplyRulesRouter,
  // Phase 101-103: Rich Menu 動態管理、分群推播、AI 對話機器人
  richMenu: richMenuRouter,
  broadcast: broadcastRouter,
  aiChatbot: aiChatbotRouter,
});

export type AppRouter = typeof appRouter;
