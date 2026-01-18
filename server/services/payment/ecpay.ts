/**
 * 綠界 ECPay 支付服務實作
 * 
 * 文檔: https://developers.ecpay.com.tw/
 * 
 * 設定步驟:
 * 1. 前往 https://www.ecpay.com.tw 申請商店帳號
 * 2. 取得 MerchantID、HashKey、HashIV
 * 3. 設定付款完成通知網址 (ReturnURL)
 * 4. 設定付款結果通知網址 (PaymentInfoURL)
 * 5. 將憑證設定到環境變數
 * 
 * 測試環境:
 * - API URL: https://payment-stage.ecpay.com.tw
 * - MerchantID: 3002607
 * - HashKey: pwFHCqoQZGmho4w6
 * - HashIV: EkRm7iFT261dpevs
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

const ECPAY_API_BASE_TEST = 'https://payment-stage.ecpay.com.tw';
const ECPAY_API_BASE_PROD = 'https://payment.ecpay.com.tw';

interface ECPayConfig {
  merchantId: string;
  hashKey: string;
  hashIv: string;
  isTestMode?: boolean;
}

export class ECPayProvider implements PaymentProvider {
  name = 'ecpay';
  private config: ECPayConfig;
  private apiBase: string;

  constructor(config: ECPayConfig) {
    this.config = config;
    this.apiBase = config.isTestMode ? ECPAY_API_BASE_TEST : ECPAY_API_BASE_PROD;
  }

  /**
   * 產生檢查碼 (CheckMacValue)
   */
  private generateCheckMacValue(params: Record<string, string>): string {
    // 1. 將參數依照 A-Z 排序
    const sortedKeys = Object.keys(params).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    // 2. 組合參數字串
    let paramString = `HashKey=${this.config.hashKey}`;
    for (const key of sortedKeys) {
      if (key !== 'CheckMacValue') {
        paramString += `&${key}=${params[key]}`;
      }
    }
    paramString += `&HashIV=${this.config.hashIv}`;

    // 3. URL Encode
    paramString = encodeURIComponent(paramString).toLowerCase();

    // 4. 特殊字元轉換
    paramString = paramString
      .replace(/%2d/g, '-')
      .replace(/%5f/g, '_')
      .replace(/%2e/g, '.')
      .replace(/%21/g, '!')
      .replace(/%2a/g, '*')
      .replace(/%28/g, '(')
      .replace(/%29/g, ')')
      .replace(/%20/g, '+');

    // 5. SHA256 雜湊
    const hash = crypto.createHash('sha256').update(paramString).digest('hex');
    
    return hash.toUpperCase();
  }

  /**
   * 驗證檢查碼
   */
  private verifyCheckMacValue(params: Record<string, string>): boolean {
    const receivedCheckMac = params.CheckMacValue;
    if (!receivedCheckMac) return false;

    const calculatedCheckMac = this.generateCheckMacValue(params);
    return receivedCheckMac.toUpperCase() === calculatedCheckMac.toUpperCase();
  }

  /**
   * 建立付款
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const now = new Date();
      const merchantTradeNo = `${params.orderId}_${Date.now()}`.substring(0, 20);
      const merchantTradeDate = this.formatDate(now);

      const ecpayParams: Record<string, string> = {
        MerchantID: this.config.merchantId,
        MerchantTradeNo: merchantTradeNo,
        MerchantTradeDate: merchantTradeDate,
        PaymentType: 'aio',
        TotalAmount: Math.round(params.amount).toString(),
        TradeDesc: encodeURIComponent(params.description || '商品購買'),
        ItemName: params.description || '商品',
        ReturnURL: params.webhookUrl || params.returnUrl,
        ChoosePayment: 'ALL', // 全部付款方式
        ClientBackURL: params.cancelUrl || params.returnUrl,
        OrderResultURL: params.returnUrl,
        NeedExtraPaidInfo: 'Y',
        EncryptType: '1',
      };

      // 加入自訂欄位
      if (params.metadata) {
        ecpayParams.CustomField1 = JSON.stringify(params.metadata).substring(0, 50);
      }

      // 產生檢查碼
      ecpayParams.CheckMacValue = this.generateCheckMacValue(ecpayParams);

      // 建立表單 HTML（ECPay 需要透過表單 POST 跳轉）
      const formHtml = this.generateFormHtml(ecpayParams);

      return {
        success: true,
        transactionId: merchantTradeNo,
        paymentUrl: `${this.apiBase}/Cashier/AioCheckOut/V5`,
        rawResponse: {
          formHtml,
          params: ecpayParams,
          note: '使用 formHtml 建立隱藏表單並自動提交，或將參數 POST 到 paymentUrl',
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
   * 產生自動提交表單 HTML
   */
  private generateFormHtml(params: Record<string, string>): string {
    const inputs = Object.entries(params)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
      .join('\n');

    return `
      <form id="ecpay-form" method="POST" action="${this.apiBase}/Cashier/AioCheckOut/V5">
        ${inputs}
      </form>
      <script>document.getElementById('ecpay-form').submit();</script>
    `;
  }

  /**
   * 格式化日期 (yyyy/MM/dd HH:mm:ss)
   */
  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  /**
   * 驗證付款結果
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyResult> {
    try {
      const payload = params.payload as Record<string, string>;
      
      if (!payload) {
        return {
          success: false,
          verified: false,
          error: 'Missing payload',
        };
      }

      // 驗證檢查碼
      const verified = this.verifyCheckMacValue(payload);
      
      if (!verified) {
        return {
          success: false,
          verified: false,
          error: 'Invalid CheckMacValue',
        };
      }

      // 檢查交易狀態
      const rtnCode = payload.RtnCode;
      const isSuccess = rtnCode === '1';

      return {
        success: true,
        verified: true,
        transactionId: payload.MerchantTradeNo,
        amount: parseFloat(payload.TradeAmt || '0'),
        status: isSuccess ? 'completed' : 'failed',
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
   * 退款（ECPay 需要透過後台或 API 處理）
   */
  async refundPayment(params: RefundParams): Promise<RefundResult> {
    try {
      // ECPay 退款需要使用 DoAction API
      // 這裡提供基本結構，實際整合時需要完整實作
      
      const refundParams: Record<string, string> = {
        MerchantID: this.config.merchantId,
        MerchantTradeNo: params.transactionId,
        TradeNo: params.transactionId,
        Action: 'R', // R = 退款
        TotalAmount: (params.amount || 0).toString(),
      };

      refundParams.CheckMacValue = this.generateCheckMacValue(refundParams);

      // 實際退款需要呼叫 ECPay API
      // const response = await fetch(`${this.apiBase}/CreditDetail/DoAction`, {...});

      return {
        success: true,
        refundId: `refund_${params.transactionId}`,
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
   * 查詢付款狀態
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      // ECPay 查詢需要使用 QueryTradeInfo API
      const queryParams: Record<string, string> = {
        MerchantID: this.config.merchantId,
        MerchantTradeNo: transactionId,
        TimeStamp: Math.floor(Date.now() / 1000).toString(),
      };

      queryParams.CheckMacValue = this.generateCheckMacValue(queryParams);

      // 實際查詢需要呼叫 ECPay API
      // const response = await fetch(`${this.apiBase}/Cashier/QueryTradeInfo/V5`, {...});

      return {
        transactionId,
        status: 'pending',
        // 實際狀態需要從 API 回應解析
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
export function registerECPay(config: ECPayConfig): void {
  PaymentProviderFactory.registerProvider('ecpay', new ECPayProvider(config));
}

// 測試環境設定
export const ECPAY_TEST_CONFIG: ECPayConfig = {
  merchantId: '3002607',
  hashKey: 'pwFHCqoQZGmho4w6',
  hashIv: 'EkRm7iFT261dpevs',
  isTestMode: true,
};
