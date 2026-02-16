import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  aiConversations,
  aiIntents,
  aiKnowledgeBase,
  aiKnowledgeBaseVectors,
  customers,
  InsertAiConversation,
} from "../../drizzle/schema";
import { eq, and, sql, desc, like, or, notInArray, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";
import {
  getEmbedding,
  getEmbeddings,
  getEmbeddingModel,
} from "../services/embedding";

/**
 * AI 對話機器人 Router
 *
 * 功能：
 * - 對話處理與記錄
 * - 意圖識別
 * - 知識庫管理
 * - 對話統計
 * - Phase 112: 知識庫向量化
 * - Phase 113: 語意搜尋與問題推薦
 */

export const aiChatbotRouter = router({
  /**
   * 處理客戶訊息（AI 對話）
   */
  chat: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        lineUserId: z.string(),
        message: z.string(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const sessionId =
        input.sessionId ||
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.lineUserId, input.lineUserId))
        .limit(1);

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

      // 嘗試使用語意搜尋取得相關知識庫（Phase 113 增強）
      let relevantKnowledge: Array<{
        question: string;
        answer: string;
        similarity?: number;
      }> = [];

      try {
        const queryEmbedding = await getEmbedding(input.message);
        const vectorStr = `[${queryEmbedding.embedding.join(",")}]`;

        const matchResults = await db.execute(
          sql`SELECT * FROM match_knowledge_base(${vectorStr}::vector, 0.3, 5)`
        );

        const rows = matchResults as any[];
        if (rows && rows.length > 0) {
          const matchedIds = rows.map(
            (r: any) => r.knowledge_base_id
          );
          const matchedKb = await db
            .select()
            .from(aiKnowledgeBase)
            .where(
              and(
                inArray(aiKnowledgeBase.id, matchedIds as number[]),
                eq(aiKnowledgeBase.isActive, true)
              )
            );

          relevantKnowledge = matchedKb.map((kb) => {
            const matchRow = rows.find(
              (r: any) => r.knowledge_base_id === kb.id
            );
            return {
              question: kb.question,
              answer: kb.answer,
              similarity: matchRow ? Number(matchRow.similarity) : 0,
            };
          });
        }
      } catch {
        // Fallback: 如果向量搜尋失敗，使用傳統的知識庫查詢
      }

      // 如果語意搜尋沒有結果，使用傳統方式
      if (relevantKnowledge.length === 0) {
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

        relevantKnowledge = knowledgeBase.map((kb) => ({
          question: kb.question,
          answer: kb.answer,
        }));
      }

      const systemPrompt = `你是 YOChiLL 醫美診所的智慧客服助理。請根據以下知識庫回答客戶問題：

知識庫：
${relevantKnowledge.map((kb) => `Q: ${kb.question}\nA: ${kb.answer}`).join("\n\n")}

請遵循以下規則：
1. 如果問題與知識庫相關，請直接引用知識庫內容回答
2. 如果問題與預約相關，請引導客戶提供姓名、電話、預約日期、預約時間
3. 如果問題與諮詢相關，請引導客戶提供姓名、電話、諮詢項目
4. 如果無法回答，請禮貌地告知客戶並建議聯繫客服人員
5. 回答請簡潔、專業、友善`;

      const messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }> = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.reverse().flatMap((conv) => [
          { role: "user" as const, content: conv.userMessage },
          { role: "assistant" as const, content: conv.aiResponse },
        ]),
        { role: "user", content: input.message },
      ];

      const aiResponse = await invokeLLM({ messages: messages as any });
      const aiMessage =
        aiResponse.choices[0].message.content ||
        "抱歉，我無法理解您的問題，請聯繫客服人員。";

      let intent = "general";
      let confidence = 0.5;

      if (input.message.includes("預約") || input.message.includes("約診")) {
        intent = "appointment";
        confidence = 0.9;
      } else if (
        input.message.includes("諮詢") ||
        input.message.includes("詢問")
      ) {
        intent = "consultation";
        confidence = 0.9;
      } else if (
        relevantKnowledge.some(
          (kb) => kb.similarity && kb.similarity > 0.7
        )
      ) {
        intent = "faq";
        confidence = 0.8;
      }

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
    .input(
      z.object({
        organizationId: z.number(),
        customerId: z.number().optional(),
        lineUserId: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const conditions: any[] = [
        eq(aiConversations.organizationId, input.organizationId),
      ];

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
    .input(
      z.object({
        organizationId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(aiConversations)
        .where(eq(aiConversations.organizationId, input.organizationId));

      const totalConversations = Number(totalResult.count);

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

      const [uniqueUsersResult] = await db
        .select({
          count: sql<number>`count(distinct ${aiConversations.lineUserId})`,
        })
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
    .input(
      z.object({
        organizationId: z.number(),
      })
    )
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
    .input(
      z.object({
        organizationId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        keywords: z.array(z.string()),
        trainingExamples: z.array(z.string()).optional(),
        responseTemplate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [result] = await db
        .insert(aiIntents)
        .values({
          organizationId: input.organizationId,
          name: input.name,
          description: input.description,
          keywords: input.keywords as any,
          trainingExamples: input.trainingExamples as any,
          responseTemplate: input.responseTemplate,
        })
        .returning();

      const insertId = result.id;
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
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        trainingExamples: z.array(z.string()).optional(),
        responseTemplate: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updateData: any = {
        name: input.name,
        description: input.description,
        keywords: input.keywords,
        trainingExamples: input.trainingExamples,
        responseTemplate: input.responseTemplate,
        isActive: input.isActive,
      };

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
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await db.delete(aiIntents).where(eq(aiIntents.id, input.id));

      return { success: true };
    }),

  /**
   * 列出知識庫
   */
  listKnowledgeBase: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        category: z.string().optional(),
        keyword: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const conditions: any[] = [
        eq(aiKnowledgeBase.organizationId, input.organizationId),
      ];

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
    .input(
      z.object({
        organizationId: z.number(),
        category: z.string(),
        question: z.string(),
        answer: z.string(),
        keywords: z.array(z.string()).optional(),
        priority: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [result] = await db
        .insert(aiKnowledgeBase)
        .values({
          organizationId: input.organizationId,
          category: input.category,
          question: input.question,
          answer: input.answer,
          keywords: input.keywords as any,
          priority: input.priority,
          createdBy: ctx.user.id,
        })
        .returning();

      const insertId = result.id;
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
    .input(
      z.object({
        id: z.number(),
        category: z.string().optional(),
        question: z.string().optional(),
        answer: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        priority: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updateData: any = {
        category: input.category,
        question: input.question,
        answer: input.answer,
        keywords: input.keywords,
        priority: input.priority,
        isActive: input.isActive,
      };

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
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // 同時刪除對應的向量記錄
      await db
        .delete(aiKnowledgeBaseVectors)
        .where(eq(aiKnowledgeBaseVectors.knowledgeBaseId, input.id));

      await db.delete(aiKnowledgeBase).where(eq(aiKnowledgeBase.id, input.id));

      return { success: true };
    }),

  /**
   * 批量匯入知識庫（從 CSV 或 JSON）
   */
  importKnowledge: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        knowledgeList: z.array(
          z.object({
            category: z.string(),
            question: z.string(),
            answer: z.string(),
            keywords: z.array(z.string()).optional(),
            priority: z.number().default(0),
          })
        ),
      })
    )
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

  // ============================================
  // Phase 112: 知識庫向量化 API
  // ============================================

  /**
   * 將單一知識庫條目向量化
   */
  vectorizeKnowledge: protectedProcedure
    .input(
      z.object({
        knowledgeBaseId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // 1. 取得知識庫條目
      const [knowledge] = await db
        .select()
        .from(aiKnowledgeBase)
        .where(eq(aiKnowledgeBase.id, input.knowledgeBaseId))
        .limit(1);

      if (!knowledge) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "知識庫條目不存在",
        });
      }

      // 2. 組合文字用於向量化（問題 + 回答）
      const textToEmbed = `${knowledge.question} ${knowledge.answer}`;

      // 3. 呼叫 embedding service
      const embeddingResult = await getEmbedding(textToEmbed);

      // 4. 檢查是否已有向量記錄
      const [existing] = await db
        .select()
        .from(aiKnowledgeBaseVectors)
        .where(
          eq(aiKnowledgeBaseVectors.knowledgeBaseId, input.knowledgeBaseId)
        )
        .limit(1);

      if (existing) {
        // 更新現有記錄
        await db
          .update(aiKnowledgeBaseVectors)
          .set({
            embedding: embeddingResult.embedding,
            embeddingModel: embeddingResult.model,
            updatedAt: new Date(),
          })
          .where(eq(aiKnowledgeBaseVectors.id, existing.id));
      } else {
        // 建立新記錄
        await db.insert(aiKnowledgeBaseVectors).values({
          knowledgeBaseId: input.knowledgeBaseId,
          embedding: embeddingResult.embedding,
          embeddingModel: embeddingResult.model,
        });
      }

      return {
        success: true,
        knowledgeBaseId: input.knowledgeBaseId,
        model: embeddingResult.model,
        usage: embeddingResult.usage,
      };
    }),

  /**
   * 批次向量化所有未向量化的知識庫條目
   */
  vectorizeAll: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // 1. 取得所有已向量化的 knowledge_base_id
      const vectorized = await db
        .select({ knowledgeBaseId: aiKnowledgeBaseVectors.knowledgeBaseId })
        .from(aiKnowledgeBaseVectors);

      const vectorizedIds = vectorized.map((v) => v.knowledgeBaseId);

      // 2. 取得所有未向量化的知識庫條目
      let unvectorized;
      if (vectorizedIds.length > 0) {
        unvectorized = await db
          .select()
          .from(aiKnowledgeBase)
          .where(
            and(
              eq(aiKnowledgeBase.organizationId, input.organizationId),
              eq(aiKnowledgeBase.isActive, true),
              notInArray(aiKnowledgeBase.id, vectorizedIds)
            )
          );
      } else {
        unvectorized = await db
          .select()
          .from(aiKnowledgeBase)
          .where(
            and(
              eq(aiKnowledgeBase.organizationId, input.organizationId),
              eq(aiKnowledgeBase.isActive, true)
            )
          );
      }

      if (unvectorized.length === 0) {
        return {
          success: true,
          vectorizedCount: 0,
          message: "所有知識庫條目已完成向量化",
        };
      }

      // 3. 批次取得 embeddings
      const texts = unvectorized.map(
        (kb) => `${kb.question} ${kb.answer}`
      );
      const embeddings = await getEmbeddings(texts);

      // 4. 批次寫入向量記錄
      const vectorRecords = unvectorized.map((kb, index) => ({
        knowledgeBaseId: kb.id,
        embedding: embeddings[index].embedding,
        embeddingModel: embeddings[index].model,
      }));

      // 分批寫入（每批 50 筆）
      const BATCH_INSERT_SIZE = 50;
      for (let i = 0; i < vectorRecords.length; i += BATCH_INSERT_SIZE) {
        const batch = vectorRecords.slice(i, i + BATCH_INSERT_SIZE);
        await db.insert(aiKnowledgeBaseVectors).values(batch);
      }

      return {
        success: true,
        vectorizedCount: unvectorized.length,
        message: `成功向量化 ${unvectorized.length} 個知識庫條目`,
      };
    }),

  /**
   * 查詢向量化進度
   */
  getVectorizationStatus: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
      })
    )
    .query(async ({ input }) => {
      // 1. 總知識庫條目數
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(aiKnowledgeBase)
        .where(
          and(
            eq(aiKnowledgeBase.organizationId, input.organizationId),
            eq(aiKnowledgeBase.isActive, true)
          )
        );

      const totalCount = Number(totalResult.count);

      // 2. 已向量化的條目數（透過 JOIN 確認）
      const [vectorizedResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(aiKnowledgeBaseVectors)
        .innerJoin(
          aiKnowledgeBase,
          eq(aiKnowledgeBaseVectors.knowledgeBaseId, aiKnowledgeBase.id)
        )
        .where(
          and(
            eq(aiKnowledgeBase.organizationId, input.organizationId),
            eq(aiKnowledgeBase.isActive, true)
          )
        );

      const vectorizedCount = Number(vectorizedResult.count);

      return {
        totalCount,
        vectorizedCount,
        pendingCount: totalCount - vectorizedCount,
        progress:
          totalCount > 0
            ? Math.round((vectorizedCount / totalCount) * 100)
            : 0,
        isComplete: vectorizedCount >= totalCount,
      };
    }),

  // ============================================
  // Phase 113: 語意搜尋與問題推薦 API
  // ============================================

  /**
   * 語意搜尋：接收查詢文字，回傳最相似的知識庫條目
   */
  semanticSearch: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        query: z.string().min(1),
        topK: z.number().default(5),
        threshold: z.number().default(0.3),
      })
    )
    .mutation(async ({ input }) => {
      // 1. 將查詢文字向量化
      const queryEmbedding = await getEmbedding(input.query);

      // 2. 使用 match_knowledge_base SQL function 進行向量搜尋
      const vectorStr = `[${queryEmbedding.embedding.join(",")}]`;

      const matchResultsRaw = await db.execute(
        sql`SELECT * FROM match_knowledge_base(${vectorStr}::vector, ${input.threshold}, ${input.topK})`
      );
      const matchRows = matchResultsRaw as any[];

      if (!matchRows || matchRows.length === 0) {
        return {
          results: [],
          query: input.query,
          model: queryEmbedding.model,
        };
      }

      // 3. 取得完整的知識庫條目資訊
      const matchedIds = matchRows.map(
        (r: any) => r.knowledge_base_id as number
      );

      const knowledgeItems = await db
        .select()
        .from(aiKnowledgeBase)
        .where(
          and(
            inArray(aiKnowledgeBase.id, matchedIds),
            eq(aiKnowledgeBase.organizationId, input.organizationId)
          )
        );

      // 4. 組合結果（保留相似度排序）
      const results = matchRows
        .map((match: any) => {
          const kb = knowledgeItems.find(
            (k) => k.id === match.knowledge_base_id
          );
          if (!kb) return null;
          return {
            id: kb.id,
            category: kb.category,
            question: kb.question,
            answer: kb.answer,
            keywords: kb.keywords,
            similarity: Number(match.similarity),
          };
        })
        .filter(Boolean);

      return {
        results,
        query: input.query,
        model: queryEmbedding.model,
      };
    }),

  /**
   * 根據一個知識庫條目，推薦相似的其他條目
   */
  getSimilarQuestions: protectedProcedure
    .input(
      z.object({
        knowledgeBaseId: z.number(),
        organizationId: z.number(),
        topK: z.number().default(5),
        threshold: z.number().default(0.5),
      })
    )
    .query(async ({ input }) => {
      // 1. 取得該條目的向量
      const [vectorRecord] = await db
        .select()
        .from(aiKnowledgeBaseVectors)
        .where(
          eq(aiKnowledgeBaseVectors.knowledgeBaseId, input.knowledgeBaseId)
        )
        .limit(1);

      if (!vectorRecord) {
        return {
          results: [],
          message: "此條目尚未向量化，請先進行向量化",
        };
      }

      // 2. 使用向量搜尋找到相似條目
      const vectorStr = `[${vectorRecord.embedding.join(",")}]`;

      // 多取一個，因為會包含自己
      const matchResultsRaw2 = await db.execute(
        sql`SELECT * FROM match_knowledge_base(${vectorStr}::vector, ${input.threshold}, ${input.topK + 1})`
      );
      const matchRows2 = matchResultsRaw2 as any[];

      if (!matchRows2 || matchRows2.length === 0) {
        return { results: [] };
      }

      // 3. 過濾掉自己，取得完整資訊
      const matchedIds = matchRows2
        .filter((r: any) => r.knowledge_base_id !== input.knowledgeBaseId)
        .slice(0, input.topK)
        .map((r: any) => r.knowledge_base_id as number);

      if (matchedIds.length === 0) {
        return { results: [] };
      }

      const knowledgeItems = await db
        .select()
        .from(aiKnowledgeBase)
        .where(
          and(
            inArray(aiKnowledgeBase.id, matchedIds),
            eq(aiKnowledgeBase.organizationId, input.organizationId)
          )
        );

      const results = matchRows2
        .filter((r: any) => r.knowledge_base_id !== input.knowledgeBaseId)
        .slice(0, input.topK)
        .map((match: any) => {
          const kb = knowledgeItems.find(
            (k) => k.id === match.knowledge_base_id
          );
          if (!kb) return null;
          return {
            id: kb.id,
            category: kb.category,
            question: kb.question,
            answer: kb.answer,
            similarity: Number(match.similarity),
          };
        })
        .filter(Boolean);

      return { results };
    }),
});
