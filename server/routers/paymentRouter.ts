/**
 * 支付設定 Router
 * 管理診所的支付服務商設定
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getPaymentSettings,
  savePaymentSettings,
  createPaymentManager,
  createPaymentTransaction,
  updatePaymentTransaction,
  getPaymentTransactions,
} from "../services/payment";

export const paymentRouter = router({
  // 取得支付設定
  getSettings: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      provider: z.enum(['lemonsqueezy', 'ecpay', 'stripe', 'linepay', 'jkopay']).optional(),
    }))
    .query(async ({ input }) => {
      return await getPaymentSettings(input.organizationId, input.provider);
    }),

  // 儲存 LemonSqueezy 設定
  saveLemonSqueezySettings: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      apiKey: z.string().min(1, 'API Key 為必填'),
      storeId: z.string().min(1, 'Store ID 為必填'),
      webhookSecret: z.string().optional(),
      isTestMode: z.boolean().default(true),
      isEnabled: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const { organizationId, apiKey, storeId, webhookSecret, isTestMode, isEnabled } = input;
      return await savePaymentSettings(organizationId, 'lemonsqueezy', {
        lsApiKey: apiKey,
        lsStoreId: storeId,
        lsWebhookSecret: webhookSecret,
        isTestMode,
        isEnabled,
      });
    }),

  // 儲存綠界 ECPay 設定
  saveECPaySettings: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      merchantId: z.string().min(1, 'Merchant ID 為必填'),
      hashKey: z.string().min(1, 'Hash Key 為必填'),
      hashIv: z.string().min(1, 'Hash IV 為必填'),
      isTestMode: z.boolean().default(true),
      isEnabled: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const { organizationId, merchantId, hashKey, hashIv, isTestMode, isEnabled } = input;
      return await savePaymentSettings(organizationId, 'ecpay', {
        ecpayMerchantId: merchantId,
        ecpayHashKey: hashKey,
        ecpayHashIv: hashIv,
        isTestMode,
        isEnabled,
      });
    }),

  // 儲存 Stripe 設定（預留）
  saveStripeSettings: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      publishableKey: z.string().min(1, 'Publishable Key 為必填'),
      secretKey: z.string().min(1, 'Secret Key 為必填'),
      webhookSecret: z.string().optional(),
      isTestMode: z.boolean().default(true),
      isEnabled: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const { organizationId, publishableKey, secretKey, webhookSecret, isTestMode, isEnabled } = input;
      return await savePaymentSettings(organizationId, 'stripe', {
        stripePublishableKey: publishableKey,
        stripeSecretKey: secretKey,
        stripeWebhookSecret: webhookSecret,
        isTestMode,
        isEnabled,
      });
    }),

  // 儲存 LINE Pay 設定（預留）
  saveLinePaySettings: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      channelId: z.string().min(1, 'Channel ID 為必填'),
      channelSecret: z.string().min(1, 'Channel Secret 為必填'),
      isTestMode: z.boolean().default(true),
      isEnabled: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const { organizationId, channelId, channelSecret, isTestMode, isEnabled } = input;
      return await savePaymentSettings(organizationId, 'linepay', {
        linePayChannelId: channelId,
        linePayChannelSecret: channelSecret,
        isTestMode,
        isEnabled,
      });
    }),

  // 建立付款
  createPayment: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      provider: z.enum(['lemonsqueezy', 'ecpay', 'stripe', 'linepay', 'jkopay']),
      orderId: z.string(),
      amount: z.number().positive(),
      currency: z.string().default('TWD'),
      description: z.string(),
      customerEmail: z.string().email().optional(),
      customerName: z.string().optional(),
      returnUrl: z.string().url(),
      cancelUrl: z.string().url().optional(),
      webhookUrl: z.string().url().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { organizationId, provider, ...paymentParams } = input;
      
      const manager = await createPaymentManager(organizationId, provider);
      if (!manager) {
        return {
          success: false,
          error: `支付服務 ${provider} 尚未設定`,
        };
      }

      const result = await manager.createPayment(paymentParams);
      
      // 建立交易記錄
      if (result.success && result.transactionId) {
        await createPaymentTransaction(organizationId, {
          provider,
          transactionId: result.transactionId,
          amount: input.amount,
          currency: input.currency,
          status: 'pending',
          metadata: input.metadata,
        });
      }

      return result;
    }),

  // 驗證付款結果（Webhook 回調）
  verifyPayment: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      provider: z.enum(['lemonsqueezy', 'ecpay', 'stripe', 'linepay', 'jkopay']),
      transactionId: z.string(),
      payload: z.any(),
      signature: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { organizationId, provider, transactionId, payload, signature } = input;
      
      const manager = await createPaymentManager(organizationId, provider);
      if (!manager) {
        return {
          success: false,
          verified: false,
          error: `支付服務 ${provider} 尚未設定`,
        };
      }

      const result = await manager.verifyPayment({
        transactionId,
        payload,
        signature,
      });

      // 更新交易記錄
      if (result.verified) {
        await updatePaymentTransaction(transactionId, {
          status: result.status === 'completed' ? 'completed' : 'failed',
          externalTransactionId: result.transactionId,
          paidAt: result.status === 'completed' ? new Date() : undefined,
        });
      }

      return result;
    }),

  // 退款
  refundPayment: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      provider: z.enum(['lemonsqueezy', 'ecpay', 'stripe', 'linepay', 'jkopay']),
      transactionId: z.string(),
      amount: z.number().positive().optional(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { organizationId, provider, transactionId, amount, reason } = input;
      
      const manager = await createPaymentManager(organizationId, provider);
      if (!manager) {
        return {
          success: false,
          error: `支付服務 ${provider} 尚未設定`,
        };
      }

      const result = await manager.refundPayment({
        transactionId,
        amount,
        reason,
      });

      // 更新交易記錄
      if (result.success) {
        await updatePaymentTransaction(transactionId, {
          status: 'refunded',
        });
      }

      return result;
    }),

  // 取得交易記錄
  getTransactions: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      orderId: z.number().optional(),
      customerId: z.number().optional(),
      status: z.string().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await getPaymentTransactions(input.organizationId, input);
    }),

  // 取得支付服務商列表
  listProviders: protectedProcedure
    .query(async () => {
      return [
        {
          id: 'lemonsqueezy',
          name: 'LemonSqueezy',
          description: '國際訂閱與一次性付款',
          supportedCurrencies: ['USD', 'EUR', 'GBP', 'TWD'],
          features: ['訂閱', '一次性付款', 'Webhook'],
          setupUrl: 'https://app.lemonsqueezy.com',
        },
        {
          id: 'ecpay',
          name: '綠界 ECPay',
          description: '台灣本地支付（信用卡、ATM、超商）',
          supportedCurrencies: ['TWD'],
          features: ['信用卡', 'ATM', '超商代碼', '超商條碼'],
          setupUrl: 'https://www.ecpay.com.tw',
        },
        {
          id: 'stripe',
          name: 'Stripe',
          description: '國際支付（預留）',
          supportedCurrencies: ['USD', 'EUR', 'GBP', 'TWD'],
          features: ['信用卡', 'Apple Pay', 'Google Pay', '訂閱'],
          setupUrl: 'https://dashboard.stripe.com',
          status: 'coming_soon',
        },
        {
          id: 'linepay',
          name: 'LINE Pay',
          description: 'LINE 生態系支付（預留）',
          supportedCurrencies: ['TWD'],
          features: ['LINE Pay', 'LINE Points'],
          setupUrl: 'https://pay.line.me',
          status: 'coming_soon',
        },
        {
          id: 'jkopay',
          name: '街口支付',
          description: '台灣行動支付（預留）',
          supportedCurrencies: ['TWD'],
          features: ['QR Code', '行動支付'],
          setupUrl: 'https://www.jkopay.com',
          status: 'coming_soon',
        },
      ];
    }),
});
