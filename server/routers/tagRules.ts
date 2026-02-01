import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { db } from "../db";
import { tagRules, customerTags, customers, customerTagRelations } from "../../drizzle/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export const tagRulesRouter = router({
  // 查詢所有標籤規則
  list: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const rules = await db
        .select()
        .from(tagRules)
        .where(eq(tagRules.organizationId, input.organizationId))
        .orderBy(desc(tagRules.createdAt));

      return rules;
    }),

  // 新增標籤規則
  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        tagId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        ruleType: z.enum(["spending", "visit_count", "last_visit", "member_level"]),
        condition: z.object({
          operator: z.enum([">=", "<=", ">", "<", "=="]),
          value: z.union([z.number(), z.string()]),
        }),
        isActive: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [rule] = await db.insert(tagRules).values(input);

      return { success: true, id: rule.insertId };
    }),

  // 更新標籤規則
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        condition: z.object({
          operator: z.enum([">=", "<=", ">", "<", "=="]),
          value: z.union([z.number(), z.string()]),
        }).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;

      await db
        .update(tagRules)
        .set(updates)
        .where(eq(tagRules.id, id));

      return { success: true };
    }),

  // 刪除標籤規則
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.delete(tagRules).where(eq(tagRules.id, input.id));

      return { success: true };
    }),

  // 執行標籤自動分配（根據所有規則）
  applyRules: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 查詢所有啟用的規則
      const rules = await db
        .select()
        .from(tagRules)
        .where(and(
          eq(tagRules.organizationId, input.organizationId),
          eq(tagRules.isActive, true)
        ));

      // 查詢該診所的所有客戶
      const allCustomers = await db
        .select()
        .from(customers)
        .where(eq(customers.organizationId, input.organizationId));

      let assignedCount = 0;

      for (const rule of rules) {
        for (const customer of allCustomers) {
          let shouldAssignTag = false;

          // 根據規則類型判斷是否應分配標籤
          const condition = rule.condition as { operator: string; value: number | string };
          
          if (rule.ruleType === "spending") {
            const totalSpent = parseFloat(customer.totalSpent || "0");
            const conditionValue = Number(condition.value);
            shouldAssignTag = evaluateCondition(totalSpent, condition.operator, conditionValue);
          } else if (rule.ruleType === "visit_count") {
            const visitCount = customer.visitCount || 0;
            const conditionValue = Number(condition.value);
            shouldAssignTag = evaluateCondition(visitCount, condition.operator, conditionValue);
          } else if (rule.ruleType === "last_visit") {
            // 計算最後到店時間距今天數
            const lastVisit = customer.updatedAt;
            const daysSinceLastVisit = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
            const conditionValue = Number(condition.value);
            shouldAssignTag = evaluateCondition(daysSinceLastVisit, condition.operator, conditionValue);
          } else if (rule.ruleType === "member_level") {
            const memberLevel = customer.memberLevel || "";
            const conditionValue = String(condition.value);
            shouldAssignTag = memberLevel === conditionValue;
          }

          // 如果應分配標籤，檢查是否已分配
          if (shouldAssignTag) {
            const existingAssignment = await db
              .select()
              .from(customerTagRelations)
              .where(and(
                eq(customerTagRelations.customerId, customer.id),
                eq(customerTagRelations.tagId, rule.tagId)
              ))
              .limit(1);

            if (existingAssignment.length === 0) {
              await db.insert(customerTagRelations).values({
                customerId: customer.id,
                tagId: rule.tagId,
              });
              assignedCount++;
            }
          }
        }
      }

      return { success: true, assignedCount };
    }),
});

// 輔助函數：評估條件
function evaluateCondition(value: number, operator: string, conditionValue: number): boolean {
  switch (operator) {
    case ">=":
      return value >= conditionValue;
    case "<=":
      return value <= conditionValue;
    case ">":
      return value > conditionValue;
    case "<":
      return value < conditionValue;
    case "==":
      return value === conditionValue;
    default:
      return false;
  }
}
