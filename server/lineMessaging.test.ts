import { describe, it, expect } from 'vitest';
import {
  pushTextMessage,
  pushFlexMessage,
  getBotInfo,
  getUserProfile,
  getMessageQuota,
  createTreatmentExpiryFlexMessage,
  createDormantCustomerFlexMessage,
  createVoucherExpiryFlexMessage,
} from './services/lineMessaging';

describe('LINE Messaging API 真實推播測試', () => {
  const testUserId = process.env.LINE_USER_ID!;

  it('取得 Bot 資訊', async () => {
    const result = await getBotInfo();
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('userId');
    expect(result.data).toHaveProperty('displayName');
    console.log('Bot Info:', result.data);
  });

  it('取得用戶資料', async () => {
    const result = await getUserProfile(testUserId);
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('displayName');
    console.log('User Profile:', result.data);
  });

  it('取得訊息配額', async () => {
    const result = await getMessageQuota();
    expect(result.success).toBe(true);
    console.log('Message Quota:', result.data);
  });

  it('發送真實文字訊息', async () => {
    const result = await pushTextMessage(
      testUserId,
      '🎉 YOChiLL 系統測試訊息\n\n這是一則來自 YOChiLL 醫美診所 SaaS 平台的測試訊息。\n\n如果您收到這則訊息，表示 LINE 整合已成功！'
    );
    
    expect(result.success).toBe(true);
    console.log('Text Message Result:', result);
  });

  it('發送療程到期提醒 Flex Message', async () => {
    const flexContent = createTreatmentExpiryFlexMessage({
      customerName: '祐翔',
      treatmentName: '玻尿酸填充療程',
      expiryDate: '2026/02/15',
      remainingSessions: 2,
      clinicName: 'YOChiLL 診所',
      bookingUrl: 'https://line.me',
    });

    const result = await pushFlexMessage(
      testUserId,
      '療程到期提醒',
      flexContent
    );

    expect(result.success).toBe(true);
    console.log('Treatment Expiry Flex Message Result:', result);
  });

  it('發送沉睡客戶喚醒 Flex Message', async () => {
    const flexContent = createDormantCustomerFlexMessage({
      customerName: '祐翔',
      lastVisitDate: '2025/11/15',
      daysSinceLastVisit: 64,
      specialOffer: '回歸專屬 85 折優惠，限時 7 天！',
      clinicName: 'YOChiLL 診所',
      bookingUrl: 'https://line.me',
    });

    const result = await pushFlexMessage(
      testUserId,
      '我們想念您',
      flexContent
    );

    expect(result.success).toBe(true);
    console.log('Dormant Customer Flex Message Result:', result);
  });

  it('發送票券到期提醒 Flex Message', async () => {
    const flexContent = createVoucherExpiryFlexMessage({
      customerName: '祐翔',
      voucherName: '新春美白療程券',
      expiryDate: '2026/01/31',
      voucherCode: 'VCH-2026-0118',
      clinicName: 'YOChiLL 診所',
      redeemUrl: 'https://line.me',
    });

    const result = await pushFlexMessage(
      testUserId,
      '票券到期提醒',
      flexContent
    );

    expect(result.success).toBe(true);
    console.log('Voucher Expiry Flex Message Result:', result);
  });
});
