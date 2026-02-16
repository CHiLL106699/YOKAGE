-- Phase 112: 知識庫向量化 - 資料庫遷移
-- 執行日期: 2026-02-16
-- 說明: 啟用 pgvector、修改 embedding 欄位類型、建立索引與搜尋函數

-- 1. 啟用 pgvector 擴充套件
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 將 embedding 欄位從 JSONB 改為 vector(1536)
ALTER TABLE ai_knowledge_base_vectors ALTER COLUMN embedding DROP NOT NULL;
ALTER TABLE ai_knowledge_base_vectors ALTER COLUMN embedding DROP DEFAULT;
ALTER TABLE ai_knowledge_base_vectors ALTER COLUMN embedding TYPE vector(1536) USING NULL;
ALTER TABLE ai_knowledge_base_vectors ALTER COLUMN embedding SET NOT NULL;

-- 3. 建立 HNSW 索引（用於 cosine similarity 搜尋）
CREATE INDEX IF NOT EXISTS idx_ai_kb_vectors_embedding_hnsw 
ON ai_knowledge_base_vectors 
USING hnsw (embedding vector_cosine_ops);

-- 4. 建立向量相似度搜尋 SQL Function
CREATE OR REPLACE FUNCTION match_knowledge_base (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
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
    akbv."knowledgeBaseId" as knowledge_base_id,
    1 - (akbv.embedding <=> query_embedding) as similarity
  FROM ai_knowledge_base_vectors AS akbv
  WHERE 1 - (akbv.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
