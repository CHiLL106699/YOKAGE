/**
 * 支付服務統一入口
 * 
 * 支援的支付服務商:
 * - LemonSqueezy: 國際訂閱與一次性付款
 * - 綠界 ECPay: 台灣本地支付（信用卡、ATM、超商）
 * - Stripe: 國際支付（預留）
 * - LINE Pay: LINE 生態系支付（預留）
 * - 街口支付: 台灣行動支付（預留）
 */

export * from './paymentProvider';
export * from './lemonSqueezy';
export * from './ecpay';

import { getDb } from '../../db';
import { paymentSettings, paymentTransactions } from '../../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { PaymentManager, PaymentConfig } from './paymentProvider';
import { registerLemonSqueezy } from './lemonSqueezy';
import { registerECPay, ECPAY_TEST_CONFIG } from './ecpay';

// ============================================
// 支付設定管理
// ============================================

/**
 * 取得診所的支付設定
 */
export async function getPaymentSettings(
  organizationId: number,
  provider?: string
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  if (provider) {
    return db.select().from(paymentSettings)
      .where(and(
        eq(paymentSettings.organizationId, organizationId),
        eq(paymentSettings.provider, provider as any)
      ));
  }

  return db.select().from(paymentSettings)
    .where(eq(paymentSettings.organizationId, organizationId));
}

/**
 * 儲存支付設定
 */
export async function savePaymentSettings(
  organizationId: number,
  provider: string,
  settings: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: '資料庫連線失敗' };

  try {
    const [existing] = await db.select().from(paymentSettings)
      .where(and(
        eq(paymentSettings.organizationId, organizationId),
        eq(paymentSettings.provider, provider as any)
      ))
      .limit(1);

    if (existing) {
      await db.update(paymentSettings)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(paymentSettings.id, existing.id));
    } else {
      await db.insert(paymentSettings).values({
        organizationId,
        provider: provider as any,
        ...settings,
      });
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '儲存設定失敗',
    };
  }
}

/**
 * 建立支付管理器
 */
export async function createPaymentManager(
  organizationId: number,
  provider: string
): Promise<PaymentManager | null> {
  const settings = await getPaymentSettings(organizationId, provider);
  if (settings.length === 0) return null;

  const setting = settings[0];
  
  // 根據 provider 初始化對應的支付服務
  switch (provider) {
    case 'lemonsqueezy':
      if (setting.lsApiKey && setting.lsStoreId) {
        registerLemonSqueezy({
          apiKey: setting.lsApiKey,
          storeId: setting.lsStoreId,
          webhookSecret: setting.lsWebhookSecret,
          isTestMode: setting.isTestMode,
        });
      }
      break;
    case 'ecpay':
      if (setting.ecpayMerchantId && setting.ecpayHashKey && setting.ecpayHashIv) {
        registerECPay({
          merchantId: setting.ecpayMerchantId,
          hashKey: setting.ecpayHashKey,
          hashIv: setting.ecpayHashIv,
          isTestMode: setting.isTestMode,
        });
      } else if (setting.isTestMode) {
        // 使用測試環境設定
        registerECPay(ECPAY_TEST_CONFIG);
      }
      break;
  }

  const config: PaymentConfig = {
    provider: provider as any,
    isTestMode: setting.isTestMode || false,
    credentials: {},
  };

  const manager = new PaymentManager(config);
  await manager.initialize();
  return manager;
}

// ============================================
// 支付交易記錄
// ============================================

/**
 * 建立支付交易記錄
 */
export async function createPaymentTransaction(
  organizationId: number,
  data: {
    orderId?: number;
    customerId?: number;
    provider: string;
    transactionId: string;
    amount: number;
    currency?: string;
    status?: string;
    paymentMethod?: string;
    metadata?: any;
  }
): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [result] = await db.insert(paymentTransactions).values({
      organizationId,
      orderId: data.orderId,
      customerId: data.customerId,
      provider: data.provider as any,
      transactionId: data.transactionId,
      amount: data.amount.toString(),
      currency: data.currency || 'TWD',
      status: (data.status || 'pending') as any,
      paymentMethod: data.paymentMethod,
      metadata: data.metadata,
    }).returning();

    return result.id;
  } catch (error) {
    console.error('建立支付交易記錄失敗:', error);
    return null;
  }
}

/**
 * 更新支付交易狀態
 */
export async function updatePaymentTransaction(
  transactionId: string,
  data: {
    status?: string;
    externalTransactionId?: string;
    paidAt?: Date;
    errorMessage?: string;
    receiptUrl?: string;
  }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(paymentTransactions)
      .set({
        ...data,
        status: data.status as any,
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.transactionId, transactionId));

    return true;
  } catch (error) {
    console.error('更新支付交易狀態失敗:', error);
    return false;
  }
}

/**
 * 取得支付交易記錄
 */
export async function getPaymentTransactions(
  organizationId: number,
  options?: {
    orderId?: number;
    customerId?: number;
    status?: string;
    limit?: number;
  }
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(paymentTransactions)
    .where(eq(paymentTransactions.organizationId, organizationId))
    .orderBy(paymentTransactions.createdAt);

  // 注意：實際使用時需要加入更多過濾條件
  const results = await query;
  return results;
}
