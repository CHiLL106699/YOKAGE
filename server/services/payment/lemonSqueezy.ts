/**
 * LemonSqueezy 支付服務實作
 * 
 * 文檔: https://docs.lemonsqueezy.com/api
 * 
 * 設定步驟:
 * 1. 前往 https://app.lemonsqueezy.com 建立帳號
 * 2. 建立 Store 並取得 Store ID
 * 3. 在 Settings > API 建立 API Key
 * 4. 在 Settings > Webhooks 設定 Webhook URL
 * 5. 將 API Key、Store ID、Webhook Secret 設定到環境變數
 */

import {
  PaymentProvider,
  CreatePaymentParams,
  PaymentResult,
  VerifyPaymentParams,
  VerifyResult,
  RefundParams,
  RefundResult,
  PaymentStatus,
  PaymentProviderFactory,
} from './paymentProvider';
import crypto from 'crypto';

const LEMONSQUEEZY_API_BASE = 'https://api.lemonsqueezy.com/v1';

interface LemonSqueezyConfig {
  apiKey: string;
  storeId: string;
  webhookSecret?: string;
  isTestMode?: boolean;
}

export class LemonSqueezyProvider implements PaymentProvider {
  name = 'lemonsqueezy';
  private config: LemonSqueezyConfig;

  constructor(config: LemonSqueezyConfig) {
    this.config = config;
  }

  private async apiRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
  ): Promise<any> {
    const response = await fetch(`${LEMONSQUEEZY_API_BASE}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.errors?.[0]?.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 建立結帳連結
   * 使用 Checkout API 建立一次性付款連結
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      // 注意：LemonSqueezy 需要先建立 Product 和 Variant
      // 這裡假設已有對應的 Variant ID
      // 實際使用時需要根據金額動態建立或選擇對應的 Variant
      
      const checkoutData = {
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: params.amount * 100, // LemonSqueezy 使用分為單位
            product_options: {
              name: params.description,
              description: params.description,
              redirect_url: params.returnUrl,
            },
            checkout_options: {
              embed: false,
              media: true,
              button_color: '#7C3AED',
            },
            checkout_data: {
              email: params.customerEmail,
              name: params.customerName,
              custom: {
                order_id: params.orderId,
                ...params.metadata,
              },
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: this.config.storeId,
              },
            },
            // 注意：需要提供有效的 variant ID
            // variant: {
            //   data: {
            //     type: 'variants',
            //     id: variantId,
            //   },
            // },
          },
        },
      };

      // 由於 LemonSqueezy 需要預先建立產品，這裡返回預留的結構
      // 實際整合時需要：
      // 1. 預先在 LemonSqueezy 建立產品和變體
      // 2. 或使用 Custom Checkout 功能（需要 Pro 方案）
      
      return {
        success: true,
        transactionId: `ls_${Date.now()}`,
        paymentUrl: `https://checkout.lemonsqueezy.com/checkout/buy/${this.config.storeId}?checkout[custom][order_id]=${params.orderId}`,
        rawResponse: {
          note: 'LemonSqueezy 整合需要預先建立產品。請參考文檔設定。',
          setupUrl: 'https://app.lemonsqueezy.com',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '建立付款失敗',
      };
    }
  }

  /**
   * 驗證 Webhook 簽名
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyResult> {
    try {
      if (!this.config.webhookSecret || !params.signature || !params.payload) {
        return {
          success: false,
          verified: false,
          error: 'Missing webhook secret or signature',
        };
      }

      // 驗證簽名
      const hmac = crypto.createHmac('sha256', this.config.webhookSecret);
      const digest = hmac.update(JSON.stringify(params.payload)).digest('hex');
      const verified = crypto.timingSafeEqual(
        Buffer.from(params.signature),
        Buffer.from(digest)
      );

      if (!verified) {
        return {
          success: false,
          verified: false,
          error: 'Invalid signature',
        };
      }

      // 解析 Webhook 資料
      const event = params.payload;
      const eventName = event.meta?.event_name;
      const data = event.data;

      if (eventName === 'order_created' || eventName === 'subscription_payment_success') {
        return {
          success: true,
          verified: true,
          transactionId: data.id,
          amount: data.attributes?.total ? data.attributes.total / 100 : undefined,
          status: 'completed',
        };
      }

      return {
        success: true,
        verified: true,
        transactionId: data?.id,
        status: eventName,
      };
    } catch (error) {
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : '驗證失敗',
      };
    }
  }

  /**
   * 退款
   */
  async refundPayment(params: RefundParams): Promise<RefundResult> {
    try {
      // LemonSqueezy 退款需要透過 Orders API
      const response = await this.apiRequest(
        `/orders/${params.transactionId}/refund`,
        'POST',
        {
          data: {
            type: 'orders',
            id: params.transactionId,
          },
        }
      );

      return {
        success: true,
        refundId: response.data?.id,
        amount: params.amount,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '退款失敗',
      };
    }
  }

  /**
   * 取得付款狀態
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const response = await this.apiRequest(`/orders/${transactionId}`);
      const order = response.data;

      let status: PaymentStatus['status'] = 'pending';
      if (order.attributes?.status === 'paid') {
        status = 'completed';
      } else if (order.attributes?.status === 'refunded') {
        status = 'refunded';
      } else if (order.attributes?.status === 'failed') {
        status = 'failed';
      }

      return {
        transactionId,
        status,
        amount: order.attributes?.total ? order.attributes.total / 100 : undefined,
        paidAt: order.attributes?.created_at ? new Date(order.attributes.created_at) : undefined,
      };
    } catch (error) {
      return {
        transactionId,
        status: 'failed',
        error: error instanceof Error ? error.message : '查詢失敗',
      };
    }
  }
}

// 註冊到工廠
export function registerLemonSqueezy(config: LemonSqueezyConfig): void {
  PaymentProviderFactory.registerProvider('lemonsqueezy', new LemonSqueezyProvider(config));
}
