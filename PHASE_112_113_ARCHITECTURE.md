# Phase 112 & 113：知識庫向量化與語意搜尋架構分析

**文件日期**：2026年2月16日
**負責人**：Manus

---

## 1. 總體目標

本文件旨在規劃與說明 YOChiLL SaaS 平台 Phase 112 與 Phase 113 的技術實作架構。核心目標是為 AI 對話機器人模組引入向量化與語意搜尋功能，提升知識庫的搜尋準確性與問題推薦的相關性。

- **Phase 112 (知識庫向量化)**：建立一個流程，將 `ai_knowledge_base` 資料表中的問答對 (Q&A) 轉換為向量，並儲存於 `ai_knowledge_base_vectors` 資料表中。
- **Phase 113 (語意搜尋與問題推薦)**：實作 API，允許使用者透過自然語言進行語意搜尋，並根據現有知識庫條目推薦相似問題。

## 2. 資安優先原則檢查 (Security First Check)

根據使用者設定的絕對行為準則，我們將嚴格遵守資安優先原則：

1.  **前端金鑰隔離**：前端 (`AiChatbotSettings.tsx`) **不會**直接接觸 `OPENAI_API_KEY`。所有對 OpenAI Embeddings API 的呼叫都將在後端 `embedding.ts` 服務中進行。
2.  **API 封裝**：所有資料庫操作，特別是向量搜尋，都將透過後端的 tRPC Router (`aiChatbot.ts`) 進行，前端僅呼叫已定義的 API 端點，不會直接執行 SQL 查詢。
3.  **RLS 有效性**：本次修改主要集中在 `aiChatbot` 相關的資料表。`pgvector` 的啟用與使用將透過 Supabase 的 SQL function (`match_knowledge_base`) 進行，此函數將在 `security_definer` 模式下執行，確保權限控管與現有的 RLS 策略一致，不會讓 RLS 失效。

## 3. 資料庫與架構變更

### 3.1. 資料庫層 (Supabase/PostgreSQL)

1.  **啟用 `pgvector` 擴充套件**：
    -   **動作**：執行 `CREATE EXTENSION IF NOT EXISTS vector;` SQL 指令。
    -   **方式**：將透過 Supabase SQL Editor 或建立一個遷移檔案來執行。

2.  **修改 `ai_knowledge_base_vectors` 資料表**：
    -   **動作**：將 `embedding` 欄位的資料類型從 `JSONB` 更改為 `vector(1536)`。
    -   **SQL**：`ALTER TABLE ai_knowledge_base_vectors ALTER COLUMN embedding TYPE vector(1536) USING (embedding::text::vector);`
    -   **備註**：`1536` 維度對應 OpenAI `text-embedding-3-small` 模型。

3.  **建立向量索引**：
    -   **動作**：為了加速相似度搜尋，將在 `embedding` 欄位上建立索引。
    -   **索引類型**：考慮使用 `HNSW` 或 `IVFFlat`。`HNSW` 在高維度資料和需要高召回率的場景下通常表現更好，但建構時間較長。`IVFFlat` 則是速度與精確度的平衡。
    -   **SQL (HNSW)**：`CREATE INDEX ON ai_knowledge_base_vectors USING hnsw (embedding vector_cosine_ops);`
    -   **SQL (IVFFlat)**：`CREATE INDEX ON ai_knowledge_base_vectors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`
    -   **決策**：初期將採用 `IVFFlat` 以求快速實現，未來可根據效能評估更換為 `HNSW`。

4.  **建立 SQL Function (`match_knowledge_base`)**：
    -   **動作**：建立一個 PostgreSQL 函數，用於執行向量相似度搜尋。
    -   **SQL**：
        ```sql
        CREATE OR REPLACE FUNCTION match_knowledge_base (
          query_embedding vector(1536),
          match_threshold float,
          match_count int
        )
        RETURNS TABLE (
          id int,
          knowledge_base_id int,
          similarity float
        )
        LANGUAGE sql STABLE
        AS $$
          SELECT
            akbv.id,
            akbv.knowledge_base_id,
            1 - (akbv.embedding <=> query_embedding) as similarity
          FROM ai_knowledge_base_vectors AS akbv
          WHERE 1 - (akbv.embedding <=> query_embedding) > match_threshold
          ORDER BY similarity DESC
          LIMIT match_count;
        $$;
        ```

### 3.2. 資料流向圖

```mermaid
graph TD
    subgraph Client (React)
        A[AiChatbotSettings.tsx] -- tRPC Call --> B{aiChatbot.ts Router}
    end

    subgraph Server (tRPC)
        B -- Calls --> C[embedding.ts Service]
        B -- Drizzle ORM --> D[Supabase DB]
        C -- API Call --> E[OpenAI Embeddings API]
        D -- SQL Function Call --> F[match_knowledge_base]
    end

    subgraph External
        E
    end

    A -- 1. vectorizeKnowledge --> B
    B -- 2. Get content --> D
    B -- 3. Pass content --> C
    C -- 4. Get embedding --> E
    C -- 5. Return embedding --> B
    B -- 6. Save embedding --> D

    A -- 7. semanticSearch --> B
    B -- 8. Get query embedding --> C
    B -- 9. Call search function --> F
    F -- 10. Return similar items --> B
    B -- 11. Return results --> A
```

## 4. 預計修改與新增的檔案清單

| 檔案路徑 | 類型 | 修改摘要 |
| :--- | :--- | :--- |
| `/home/ubuntu/YOKAGE/drizzle/schema.ts` | 修改 | - 將 `aiKnowledgeBaseVectors.embedding` 的類型從 `jsonb` 改為 `customType('vector')` 以支援 Drizzle。 |
| `/home/ubuntu/YOKAGE/server/_core/env.ts` | 修改 | - 新增 `OPENAI_API_KEY` 環境變數讀取。 |
| `/home/ubuntu/YOKAGE/server/services/embedding.ts` | **新增** | - 建立新服務，封裝對 OpenAI Embeddings API (`text-embedding-3-small`) 的呼叫邏輯。 |
| `/home/ubuntu/YOKAGE/server/routers/aiChatbot.ts` | 修改 | - **新增 `vectorizeKnowledge` API**：接收 `knowledge_base_id`，從資料庫讀取內容，呼叫 `embedding.ts` 服務取得向量，並存入 `ai_knowledge_base_vectors`。
- **新增 `vectorizeAll` API**：批次處理所有尚未向量化的知識庫條目。
- **新增 `getVectorizationStatus` API**：查詢總條目數與已向量化條目數，回傳進度。
- **新增 `semanticSearch` API**：接收查詢字串，向量化後呼叫 `match_knowledge_base` SQL function 進行搜尋。
- **新增 `getSimilarQuestions` API**：接收 `knowledge_base_id`，取得其向量後，搜尋相似條目。 |
| `/home/ubuntu/YOKAGE/client/src/pages/dashboard/AiChatbotSettings.tsx` | 修改 | - 在「知識庫管理」Tab 中，為每個條目新增「向量化」按鈕。
- 新增全域的「全部向量化」按鈕與進度條。
- 新增一個語意搜尋區塊，包含輸入框與即時搜尋結果列表。
- 在每個知識庫條目下方，新增「推薦相似問題」按鈕與顯示區塊。 |
| `/home/ubuntu/YOKAGE/migrations/000X_enable_pgvector.sql` | **新增** | - 包含 `CREATE EXTENSION`、`ALTER TABLE`、`CREATE INDEX`、`CREATE FUNCTION` 的 SQL 指令。 |

## 5. 交付驗收清單 (Checklist)

### Phase 112: 知識庫向量化

- [ ] `pgvector` 擴充套件已在 Supabase 中成功啟用。
- [ ] `ai_knowledge_base_vectors.embedding` 欄位已成功遷移至 `vector(1536)` 類型。
- [ ] `embedding` 欄位上已建立 `IVFFlat` 或 `HNSW` 索引。
- [ ] `server/services/embedding.ts` 檔案已建立，並能成功從 OpenAI 獲取 embeddings。
- [ ] `aiChatbot.ts` 中 `vectorizeKnowledge` API 可對單一條目進行向量化。
- [ ] `aiChatbot.ts` 中 `vectorizeAll` API 可進行批次向量化。
- [ ] `aiChatbot.ts` 中 `getVectorizationStatus` API 能正確回傳進度。
- [ ] 前端 `AiChatbotSettings.tsx` 頁面出現「向量化」按鈕與進度顯示。

### Phase 113: 語意搜尋

- [ ] `match_knowledge_base` SQL function 已成功建立並運作正常。
- [ ] `aiChatbot.ts` 中 `semanticSearch` API 能根據文字查詢回傳相關的知識庫條目。
- [ ] `aiChatbot.ts` 中 `getSimilarQuestions` API 能回傳相似的知識庫條目。
- [ ] 前端 `AiChatbotSettings.tsx` 頁面出現語意搜尋輸入框，並能即時顯示結果。
- [ ] 前端 `AiChatbotSettings.tsx` 頁面點擊「推薦相似問題」能顯示相關問題。

---

**批准狀態**：待審閱
