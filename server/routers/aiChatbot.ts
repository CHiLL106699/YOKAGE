import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { aiConversations, aiIntents, aiKnowledgeBase, customers, InsertAiConversation } from "../../drizzle/schema";
import { eq, and, sql, desc, like, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";

/**
 * AI 對話機器人 Router
 * 
 * 功能：
 * - 對話處理與記錄
 * - 意圖識別
 * - 知識庫管理
 * - 對話統計
 */

export const aiChatbotRouter = router({
  /**
   * 處理客戶訊息（AI 對話）
   */
  chat: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      lineUserId: z.string(),
      message: z.string(),
      sessionId: z.string().optional(), // 如果不提供，則自動生成
    }))
    .mutation(async ({ input }) => {
      // 1. 取得或生成 Session ID
      const sessionId = input.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 2. 查詢客戶 ID
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.lineUserId, input.lineUserId))
        .limit(1);

      // 3. 取得對話歷史（最近 10 則）
      const conversationHistory = await db
        .select()
        .from(aiConversations)
        .where(
          and(
            eq(aiConversations.organizationId, input.organizationId),
            eq(aiConversations.lineUserId, input.lineUserId),
            eq(aiConversations.sessionId, sessionId)
          )
        )
        .orderBy(desc(aiConversations.createdAt))
        .limit(10);

      // 4. 取得知識庫
      const knowledgeBase = await db
        .select()
        .from(aiKnowledgeBase)
        .where(
          and(
            eq(aiKnowledgeBase.organizationId, input.organizationId),
            eq(aiKnowledgeBase.isActive, true)
          )
        )
        .orderBy(desc(aiKnowledgeBase.priority));

      // 5. 建構 AI Prompt
      const systemPrompt = `你是 YOChiLL 醫美診所的智慧客服助理。請根據以下知識庫回答客戶問題：

知識庫：
${knowledgeBase.map((kb) => `Q: ${kb.question}\nA: ${kb.answer}`).join("\n\n")}

請遵循以下規則：
1. 如果問題與知識庫相關，請直接引用知識庫內容回答
2. 如果問題與預約相關，請引導客戶提供姓名、電話、預約日期、預約時間
3. 如果問題與諮詢相關，請引導客戶提供姓名、電話、諮詢項目
4. 如果無法回答，請禮貌地告知客戶並建議聯繫客服人員
5. 回答請簡潔、專業、友善`;

      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.reverse().flatMap((conv) => [
          { role: "user" as const, content: conv.userMessage },
          { role: "assistant" as const, content: conv.aiResponse },
        ]),
        { role: "user", content: input.message },
      ];

      // 6. 呼叫 AI 模型
      const aiResponse = await invokeLLM({ messages: messages as any });
      const aiMessage = aiResponse.choices[0].message.content || "抱歉，我無法理解您的問題，請聯繫客服人員。";

      // 7. 意圖識別（簡單關鍵字匹配）
      let intent = "general";
      let confidence = 0.5;

      if (input.message.includes("預約") || input.message.includes("約診")) {
        intent = "appointment";
        confidence = 0.9;
      } else if (input.message.includes("諮詢") || input.message.includes("詢問")) {
        intent = "consultation";
        confidence = 0.9;
      } else if (knowledgeBase.some((kb) => input.message.includes(kb.question.substring(0, 5)))) {
        intent = "faq";
        confidence = 0.8;
      }

      // 8. 儲存對話記錄
      const insertData = {
        organizationId: input.organizationId,
        customerId: customer?.id,
        lineUserId: input.lineUserId,
        sessionId,
        userMessage: String(input.message),
        aiResponse: String(aiMessage),
        intent,
        confidence: confidence.toFixed(2),
        context: { conversationHistory: conversationHistory.length } as any,
      };
      
      await db.insert(aiConversations).values(insertData);

      return {
        message: aiMessage,
        intent,
        confidence,
        sessionId,
      };
    }),

  /**
   * 列出對話記錄
   */
  listConversations: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      customerId: z.number().optional(),
      lineUserId: z.string().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const conditions: any[] = [eq(aiConversations.organizationId, input.organizationId)];

      if (input.customerId) {
        conditions.push(eq(aiConversations.customerId, input.customerId));
      }

      if (input.lineUserId) {
        conditions.push(eq(aiConversations.lineUserId, input.lineUserId));
      }

      const conversations = await db
        .select()
        .from(aiConversations)
        .where(and(...conditions))
        .orderBy(desc(aiConversations.createdAt))
        .limit(input.limit);

      return conversations;
    }),

  /**
   * 取得對話統計
   */
  getConversationStats: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
    }))
    .query(async ({ input }) => {
      // 1. 總對話次數
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(aiConversations)
        .where(eq(aiConversations.organizationId, input.organizationId));

      const totalConversations = Number(totalResult.count);

      // 2. 各意圖分布
      const intentDistribution = await db
        .select({
          intent: aiConversations.intent,
          count: sql<number>`count(*)`,
        })
        .from(aiConversations)
        .where(eq(aiConversations.organizationId, input.organizationId))
        .groupBy(aiConversations.intent);

      const intentStats = intentDistribution.map((row) => ({
        intent: row.intent || "unknown",
        count: Number(row.count),
      }));

      // 3. 獨立使用者數
      const [uniqueUsersResult] = await db
        .select({ count: sql<number>`count(distinct ${aiConversations.lineUserId})` })
        .from(aiConversations)
        .where(eq(aiConversations.organizationId, input.organizationId));

      const uniqueUsers = Number(uniqueUsersResult.count);

      return {
        totalConversations,
        uniqueUsers,
        intentStats,
      };
    }),

  /**
   * 列出所有意圖定義
   */
  listIntents: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
    }))
    .query(async ({ input }) => {
      const intents = await db
        .select()
        .from(aiIntents)
        .where(eq(aiIntents.organizationId, input.organizationId))
        .orderBy(desc(aiIntents.createdAt));

      return intents;
    }),

  /**
   * 建立意圖定義
   */
  createIntent: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string(),
      description: z.string().optional(),
      keywords: z.array(z.string()),
      trainingExamples: z.array(z.string()).optional(),
      responseTemplate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const [result] = await db.insert(aiIntents).values({
        organizationId: input.organizationId,
        name: input.name,
        description: input.description,
        keywords: input.keywords as any,
        trainingExamples: input.trainingExamples as any,
        responseTemplate: input.responseTemplate,
      });

      const insertId: number = Number(result.insertId);
      const [newIntent] = await db
        .select()
        .from(aiIntents)
        .where(eq(aiIntents.id, insertId))
        .limit(1);

      return newIntent;
    }),

  /**
   * 更新意圖定義
   */
  updateIntent: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      trainingExamples: z.array(z.string()).optional(),
      responseTemplate: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const updateData: any = {
        name: input.name,
        description: input.description,
        keywords: input.keywords,
        trainingExamples: input.trainingExamples,
        responseTemplate: input.responseTemplate,
        isActive: input.isActive,
      };

      // 移除 undefined 的欄位
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await db
        .update(aiIntents)
        .set(updateData)
        .where(eq(aiIntents.id, input.id));

      const [updatedIntent] = await db
        .select()
        .from(aiIntents)
        .where(eq(aiIntents.id, input.id))
        .limit(1);

      return updatedIntent;
    }),

  /**
   * 刪除意圖定義
   */
  deleteIntent: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db
        .delete(aiIntents)
        .where(eq(aiIntents.id, input.id));

      return { success: true };
    }),

  /**
   * 列出知識庫
   */
  listKnowledgeBase: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      category: z.string().optional(),
      keyword: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const conditions: any[] = [eq(aiKnowledgeBase.organizationId, input.organizationId)];

      if (input.category) {
        conditions.push(eq(aiKnowledgeBase.category, input.category));
      }

      if (input.keyword) {
        conditions.push(
          or(
            like(aiKnowledgeBase.question, `%${input.keyword}%`),
            like(aiKnowledgeBase.answer, `%${input.keyword}%`)
          )
        );
      }

      const knowledgeBase = await db
        .select()
        .from(aiKnowledgeBase)
        .where(and(...conditions))
        .orderBy(desc(aiKnowledgeBase.priority), desc(aiKnowledgeBase.createdAt));

      return knowledgeBase;
    }),

  /**
   * 建立知識庫條目
   */
  createKnowledge: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      category: z.string(),
      question: z.string(),
      answer: z.string(),
      keywords: z.array(z.string()).optional(),
      priority: z.number().default(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const [result] = await db.insert(aiKnowledgeBase).values({
        organizationId: input.organizationId,
        category: input.category,
        question: input.question,
        answer: input.answer,
        keywords: input.keywords as any,
        priority: input.priority,
        createdBy: ctx.user.id,
      });

      const insertId: number = Number(result.insertId);
      const [newKnowledge] = await db
        .select()
        .from(aiKnowledgeBase)
        .where(eq(aiKnowledgeBase.id, insertId))
        .limit(1);

      return newKnowledge;
    }),

  /**
   * 更新知識庫條目
   */
  updateKnowledge: protectedProcedure
    .input(z.object({
      id: z.number(),
      category: z.string().optional(),
      question: z.string().optional(),
      answer: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      priority: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const updateData: any = {
        category: input.category,
        question: input.question,
        answer: input.answer,
        keywords: input.keywords,
        priority: input.priority,
        isActive: input.isActive,
      };

      // 移除 undefined 的欄位
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await db
        .update(aiKnowledgeBase)
        .set(updateData)
        .where(eq(aiKnowledgeBase.id, input.id));

      const [updatedKnowledge] = await db
        .select()
        .from(aiKnowledgeBase)
        .where(eq(aiKnowledgeBase.id, input.id))
        .limit(1);

      return updatedKnowledge;
    }),

  /**
   * 刪除知識庫條目
   */
  deleteKnowledge: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db
        .delete(aiKnowledgeBase)
        .where(eq(aiKnowledgeBase.id, input.id));

      return { success: true };
    }),

  /**
   * 批量匯入知識庫（從 CSV 或 JSON）
   */
  importKnowledge: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      knowledgeList: z.array(z.object({
        category: z.string(),
        question: z.string(),
        answer: z.string(),
        keywords: z.array(z.string()).optional(),
        priority: z.number().default(0),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const values = input.knowledgeList.map((kb) => ({
        organizationId: input.organizationId,
        category: kb.category,
        question: kb.question,
        answer: kb.answer,
        keywords: kb.keywords as any,
        priority: kb.priority,
        createdBy: ctx.user.id,
      }));

      await db.insert(aiKnowledgeBase).values(values);

      return { success: true, count: values.length };
    }),
});
