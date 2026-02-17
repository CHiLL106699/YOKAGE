/**
 * Sprint 4: Supabase Admin Client (Service Role)
 *
 * 用於超級管理員後端操作，使用 service_role key 繞過 RLS。
 * 僅在後端使用，前端嚴禁引用此模組。
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || "";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
