import { ENV } from "../_core/env";

/**
 * Embedding Service
 *
 * 封裝 OpenAI Embeddings API 呼叫邏輯。
 * 使用 text-embedding-3-small 模型（1536 維度）。
 *
 * 資安注意：
 * - OPENAI_API_KEY 僅在後端使用，前端不可接觸。
 * - 所有 embedding 操作都必須透過此服務進行。
 */

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";

/**
 * 取得 OpenAI API Key，優先使用環境變數 OPENAI_API_KEY，
 * 若未設定則 fallback 到 forgeApiKey（Manus 內建 OpenAI-compatible API）。
 */
function getApiKey(): string {
  const key = ENV.openaiApiKey || ENV.forgeApiKey;
  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Please set the OPENAI_API_KEY environment variable."
    );
  }
  return key;
}

/**
 * 取得 API Base URL。
 * 若有設定 OPENAI_API_KEY 則使用 OpenAI 官方 API，
 * 否則使用 Manus Forge API。
 */
function getApiUrl(): string {
  if (ENV.openaiApiKey) {
    return OPENAI_EMBEDDINGS_URL;
  }
  // Fallback to Forge API (OpenAI-compatible)
  const forgeBase = ENV.forgeApiUrl?.replace(/\/$/, "") || "https://forge.manus.im";
  return `${forgeBase}/v1/embeddings`;
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * 將單一文字轉換為向量 embedding
 *
 * @param text - 要向量化的文字
 * @returns EmbeddingResult 包含 embedding 向量與使用量資訊
 */
export async function getEmbedding(text: string): Promise<EmbeddingResult> {
  const apiKey = getApiKey();
  const apiUrl = getApiUrl();

  // 清理文字：移除多餘空白與換行
  const cleanedText = text.replace(/\n/g, " ").trim();

  if (!cleanedText) {
    throw new Error("Cannot generate embedding for empty text");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: cleanedText,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI Embeddings API failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  const data = await response.json();

  return {
    embedding: data.data[0].embedding,
    model: data.model || EMBEDDING_MODEL,
    usage: data.usage || { prompt_tokens: 0, total_tokens: 0 },
  };
}

/**
 * 批次將多個文字轉換為向量 embeddings
 *
 * @param texts - 要向量化的文字陣列
 * @returns EmbeddingResult[] 包含每個文字的 embedding 向量
 */
export async function getEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  const apiKey = getApiKey();
  const apiUrl = getApiUrl();

  // 清理文字
  const cleanedTexts = texts.map((t) => t.replace(/\n/g, " ").trim()).filter(Boolean);

  if (cleanedTexts.length === 0) {
    return [];
  }

  // OpenAI API 支援批次 input（最多 2048 個）
  // 為安全起見，每批次最多處理 100 個
  const BATCH_SIZE = 100;
  const results: EmbeddingResult[] = [];

  for (let i = 0; i < cleanedTexts.length; i += BATCH_SIZE) {
    const batch = cleanedTexts.slice(i, i + BATCH_SIZE);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: batch,
        dimensions: EMBEDDING_DIMENSIONS,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI Embeddings API batch failed: ${response.status} ${response.statusText} – ${errorText}`
      );
    }

    const data = await response.json();

    for (const item of data.data) {
      results.push({
        embedding: item.embedding,
        model: data.model || EMBEDDING_MODEL,
        usage: data.usage || { prompt_tokens: 0, total_tokens: 0 },
      });
    }
  }

  return results;
}

/**
 * 取得 embedding 模型名稱
 */
export function getEmbeddingModel(): string {
  return EMBEDDING_MODEL;
}

/**
 * 取得 embedding 維度
 */
export function getEmbeddingDimensions(): number {
  return EMBEDDING_DIMENSIONS;
}
