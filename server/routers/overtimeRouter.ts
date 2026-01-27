import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { overtimeRecords } from "../../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export const overtimeRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
        startDate: z.number().optional(),
        endDate: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(overtimeRecords.organizationId, ctx.user.organizationId)];
      
      if (input.employeeId) {
        conditions.push(eq(overtimeRecords.employeeId, input.employeeId));
      }
      if (input.startDate) {
        conditions.push(gte(overtimeRecords.overtimeDate, input.startDate));
      }
      if (input.endDate) {
        conditions.push(lte(overtimeRecords.overtimeDate, input.endDate));
      }

      return await db.query.overtimeRecords.findMany({
        where: and(...conditions),
        orderBy: [desc(overtimeRecords.overtimeDate)],
        with: {
          employee: true,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        overtimeDate: z.number(),
        startTime: z.string(),
        endTime: z.string(),
        hours: z.number(),
        reason: z.string().optional(),
        approvedBy: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [record] = await db
        .insert(overtimeRecords)
        .values({
          ...input,
          organizationId: ctx.user.organizationId,
          status: "pending",
        })
        .returning();
      return record;
    }),

  approve: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [record] = await db
        .update(overtimeRecords)
        .set({
          status: "approved",
          approvedBy: ctx.user.id,
          approvedAt: Date.now(),
        })
        .where(
          and(
            eq(overtimeRecords.id, input.id),
            eq(overtimeRecords.organizationId, ctx.user.organizationId)
          )
        )
        .returning();
      return record;
    }),

  calculatePay: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        startDate: z.number(),
        endDate: z.number(),
        hourlyRate: z.number(),
        multiplier: z.number().default(1.5),
      })
    )
    .query(async ({ ctx, input }) => {
      const records = await db.query.overtimeRecords.findMany({
        where: and(
          eq(overtimeRecords.organizationId, ctx.user.organizationId),
          eq(overtimeRecords.employeeId, input.employeeId),
          eq(overtimeRecords.status, "approved"),
          gte(overtimeRecords.overtimeDate, input.startDate),
          lte(overtimeRecords.overtimeDate, input.endDate)
        ),
      });

      const totalHours = records.reduce((sum, r) => sum + r.hours, 0);
      const totalPay = totalHours * input.hourlyRate * input.multiplier;

      return {
        totalHours,
        totalPay,
        recordCount: records.length,
        records,
      };
    }),
});
