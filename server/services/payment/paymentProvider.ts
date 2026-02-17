/**
 * 支付服務抽象層
 * 統一的支付介面，支援多種支付服務商
 */

// ============================================
// 類型定義
// ============================================

export interface PaymentProvider {
  name: string;
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyResult>;
  refundPayment(params: RefundParams): Promise<RefundResult>;
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;
}

export interface CreatePaymentParams {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  customerEmail?: string;
  customerName?: string;
  returnUrl: string;
  cancelUrl?: string;
  webhookUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawResponse?: any;
}

export interface VerifyPaymentParams {
  transactionId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
  signature?: string;
}

export interface VerifyResult {
  success: boolean;
  verified: boolean;
  transactionId?: string;
  amount?: number;
  status?: string;
  error?: string;
}

export interface RefundParams {
  transactionId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  error?: string;
}

export interface PaymentStatus {
  transactionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  amount?: number;
  paidAt?: Date;
  error?: string;
}

export interface PaymentConfig {
  provider: 'lemonsqueezy' | 'ecpay' | 'stripe' | 'linepay' | 'jkopay';
  isTestMode: boolean;
  credentials: Record<string, string>;
}

// ============================================
// 支付服務工廠
// ============================================

export class PaymentProviderFactory {
  private static providers: Map<string, PaymentProvider> = new Map();

  static registerProvider(name: string, provider: PaymentProvider): void {
    this.providers.set(name, provider);
  }

  static getProvider(name: string): PaymentProvider | undefined {
    return this.providers.get(name);
  }

  static listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// ============================================
// 支付服務管理器
// ============================================

export class PaymentManager {
  private config: PaymentConfig;
  private provider: PaymentProvider | null = null;

  constructor(config: PaymentConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    const provider = PaymentProviderFactory.getProvider(this.config.provider);
    if (!provider) {
      throw new Error(`Payment provider "${this.config.provider}" not found`);
    }
    this.provider = provider;
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    if (!this.provider) {
      return { success: false, error: 'Payment provider not initialized' };
    }
    return this.provider.createPayment(params);
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyResult> {
    if (!this.provider) {
      return { success: false, verified: false, error: 'Payment provider not initialized' };
    }
    return this.provider.verifyPayment(params);
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    if (!this.provider) {
      return { success: false, error: 'Payment provider not initialized' };
    }
    return this.provider.refundPayment(params);
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    if (!this.provider) {
      return { transactionId, status: 'failed', error: 'Payment provider not initialized' };
    }
    return this.provider.getPaymentStatus(transactionId);
  }
}
