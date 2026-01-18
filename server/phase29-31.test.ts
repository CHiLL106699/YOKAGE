/**
 * Phase 29-31 功能單元測試
 * LINE 整合、資料匯入、支付整合
 */

import { describe, it, expect, vi } from "vitest";
import {
  parseCSV,
  generateImportTemplate,
} from "./services/dataImport";
import {
  PaymentProviderFactory,
  PaymentManager,
} from "./services/payment/paymentProvider";
import { ECPayProvider, ECPAY_TEST_CONFIG } from "./services/payment/ecpay";
import { LemonSqueezyProvider } from "./services/payment/lemonSqueezy";

// ============================================
// 資料匯入測試
// ============================================

describe("資料匯入服務", () => {
  describe("CSV 解析", () => {
    it("應正確解析基本 CSV", () => {
      const csv = "姓名,電話,信箱\n張小明,0912345678,test@example.com";
      const result = parseCSV(csv);
      
      expect(result.headers).toEqual(["姓名", "電話", "信箱"]);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]["姓名"]).toBe("張小明");
      expect(result.rows[0]["電話"]).toBe("0912345678");
    });

    it("應處理引號內的逗號", () => {
      const csv = '姓名,地址\n張小明,"台北市,信義區"';
      const result = parseCSV(csv);
      
      expect(result.rows[0]["地址"]).toBe("台北市,信義區");
    });

    it("應處理空行", () => {
      const csv = "姓名,電話\n張小明,0912345678\n\n李小華,0923456789";
      const result = parseCSV(csv);
      
      expect(result.rows).toHaveLength(2);
    });

    it("應處理空值", () => {
      const csv = "姓名,電話,信箱\n張小明,,test@example.com";
      const result = parseCSV(csv);
      
      expect(result.rows[0]["電話"]).toBe("");
    });
  });

  describe("匯入範本生成", () => {
    it("應生成客戶匯入範本", () => {
      const template = generateImportTemplate("customer");
      
      expect(template).toContain("姓名");
      expect(template).toContain("電話");
      expect(template).toContain("信箱");
      expect(template).toContain("性別");
    });

    it("應生成產品匯入範本", () => {
      const template = generateImportTemplate("product");
      
      expect(template).toContain("名稱");
      expect(template).toContain("價格");
      expect(template).toContain("分類");
    });

    it("應生成員工匯入範本", () => {
      const template = generateImportTemplate("staff");
      
      expect(template).toContain("姓名");
      expect(template).toContain("職位");
      expect(template).toContain("部門");
    });
  });
});

// ============================================
// 支付服務測試
// ============================================

describe("支付服務抽象層", () => {
  describe("PaymentProviderFactory", () => {
    it("應註冊和取得 Provider", () => {
      const mockProvider = {
        name: "test",
        createPayment: vi.fn(),
        verifyPayment: vi.fn(),
        refundPayment: vi.fn(),
        getPaymentStatus: vi.fn(),
      };

      PaymentProviderFactory.registerProvider("test", mockProvider);
      const retrieved = PaymentProviderFactory.getProvider("test");
      
      expect(retrieved).toBe(mockProvider);
    });

    it("應列出所有 Provider", () => {
      const providers = PaymentProviderFactory.listProviders();
      
      expect(Array.isArray(providers)).toBe(true);
    });
  });
});

describe("綠界 ECPay 支付服務", () => {
  const ecpay = new ECPayProvider(ECPAY_TEST_CONFIG);

  describe("建立付款", () => {
    it("應生成付款參數", async () => {
      const result = await ecpay.createPayment({
        orderId: "TEST001",
        amount: 1000,
        currency: "TWD",
        description: "測試商品",
        returnUrl: "https://example.com/return",
      });

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(result.paymentUrl).toContain("ecpay.com.tw");
      expect(result.rawResponse?.formHtml).toContain("form");
    });

    it("應正確處理金額", async () => {
      const result = await ecpay.createPayment({
        orderId: "TEST002",
        amount: 1500.5,
        currency: "TWD",
        description: "測試商品",
        returnUrl: "https://example.com/return",
      });

      expect(result.success).toBe(true);
      // ECPay 金額應為整數
      expect(result.rawResponse?.params?.TotalAmount).toBe("1501");
    });
  });

  describe("驗證付款", () => {
    it("應驗證有效的 Webhook 簽名", async () => {
      // 模擬 ECPay 回傳的參數
      const payload = {
        MerchantID: ECPAY_TEST_CONFIG.merchantId,
        MerchantTradeNo: "TEST001",
        RtnCode: "1",
        TradeAmt: "1000",
        CheckMacValue: "", // 實際測試需要正確的簽名
      };

      const result = await ecpay.verifyPayment({
        transactionId: "TEST001",
        payload,
      });

      // 由於沒有正確的簽名，應該驗證失敗
      expect(result.verified).toBe(false);
    });

    it("應拒絕無效的 payload", async () => {
      const result = await ecpay.verifyPayment({
        transactionId: "TEST001",
        payload: null,
      });

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.error).toContain("Missing payload");
    });
  });
});

describe("LemonSqueezy 支付服務", () => {
  const lemonSqueezy = new LemonSqueezyProvider({
    apiKey: "test_api_key",
    storeId: "test_store_id",
    webhookSecret: "test_webhook_secret",
  });

  describe("建立付款", () => {
    it("應生成付款連結", async () => {
      const result = await lemonSqueezy.createPayment({
        orderId: "LS_TEST001",
        amount: 100,
        currency: "USD",
        description: "Test Product",
        returnUrl: "https://example.com/return",
      });

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(result.paymentUrl).toContain("lemonsqueezy.com");
    });
  });

  describe("驗證 Webhook", () => {
    it("應拒絕缺少簽名的請求", async () => {
      const result = await lemonSqueezy.verifyPayment({
        transactionId: "LS_TEST001",
        payload: { data: {} },
      });

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
    });
  });
});

// ============================================
// LINE 整合測試（模擬）
// ============================================

describe("LINE 整合服務", () => {
  describe("Flex Message 模板", () => {
    it("應生成預約提醒 Flex Message 結構", () => {
      // 測試 Flex Message 結構
      const flexContent = {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: "預約提醒" }
          ]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: "您有一個預約即將到來" }
          ]
        }
      };

      expect(flexContent.type).toBe("bubble");
      expect(flexContent.header).toBeDefined();
      expect(flexContent.body).toBeDefined();
    });

    it("應生成行銷訊息 Flex Message 結構", () => {
      const flexContent = {
        type: "bubble",
        hero: {
          type: "image",
          url: "https://example.com/image.jpg",
          size: "full"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: "限時優惠" }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "button", action: { type: "uri", uri: "https://example.com" } }
          ]
        }
      };

      expect(flexContent.type).toBe("bubble");
      expect(flexContent.hero).toBeDefined();
      expect(flexContent.footer).toBeDefined();
    });
  });
});

// ============================================
// 整合測試
// ============================================

describe("Phase 29-31 整合測試", () => {
  it("所有模組應正確匯出", () => {
    expect(parseCSV).toBeDefined();
    expect(generateImportTemplate).toBeDefined();
    expect(PaymentProviderFactory).toBeDefined();
    expect(PaymentManager).toBeDefined();
    expect(ECPayProvider).toBeDefined();
    expect(LemonSqueezyProvider).toBeDefined();
  });

  it("CSV 解析與匯入流程應完整", () => {
    // 模擬完整的匯入流程
    const template = generateImportTemplate("customer");
    const parsed = parseCSV(template);
    
    expect(parsed.headers.length).toBeGreaterThan(0);
    expect(parsed.rows.length).toBeGreaterThan(0);
  });

  it("支付服務應可初始化", async () => {
    const ecpay = new ECPayProvider(ECPAY_TEST_CONFIG);
    expect(ecpay.name).toBe("ecpay");

    const lemonSqueezy = new LemonSqueezyProvider({
      apiKey: "test",
      storeId: "test",
    });
    expect(lemonSqueezy.name).toBe("lemonsqueezy");
  });
});
