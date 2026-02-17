/**
 * 完整通知服務模組
 * 
 * 功能：
 * 1. Email 通知（透過 Manus Forge API）
 * 2. SMS 通知（透過 Manus Forge API）
 * 3. LINE 通知（透過 LINE Messaging API）
 * 4. 系統內部通知
 * 5. 通知模板管理
 * 6. 通知歷史記錄
 */

import { TRPCError } from "@trpc/server";
import { ENV } from "./env";

// ============================================
// Types
// ============================================

export type NotificationChannel = "email" | "sms" | "line" | "system" | "push";

export interface NotificationRecipient {
  id?: number | string;
  name?: string;
  email?: string;
  phone?: string;
  lineUserId?: string;
}

export interface NotificationPayload {
  channel: NotificationChannel;
  recipient: NotificationRecipient;
  subject?: string;
  title: string;
  content: string;
  templateId?: string;
  templateData?: Record<string, string | number>;
  priority?: "low" | "normal" | "high" | "urgent";
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  messageId?: string;
  error?: string;
  sentAt?: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: NotificationChannel;
  subject?: string;
  titleTemplate: string;
  contentTemplate: string;
  variables: string[];
}

// ============================================
// Notification Templates
// ============================================

export const notificationTemplates: Record<string, NotificationTemplate> = {
  // 預約相關
  appointment_confirmation: {
    id: "appointment_confirmation",
    name: "預約確認",
    channel: "email",
    subject: "【YOChiLL】您的預約已確認",
    titleTemplate: "預約確認通知",
    contentTemplate: `親愛的 {{customerName}} 您好，

您的預約已確認，詳細資訊如下：

預約日期：{{appointmentDate}}
預約時間：{{appointmentTime}}
服務項目：{{serviceName}}
服務人員：{{staffName}}

如需更改或取消預約，請提前 24 小時聯繫我們。

YOChiLL 醫美診所 敬上`,
    variables: ["customerName", "appointmentDate", "appointmentTime", "serviceName", "staffName"],
  },
  
  appointment_reminder: {
    id: "appointment_reminder",
    name: "預約提醒",
    channel: "sms",
    titleTemplate: "預約提醒",
    contentTemplate: `【YOChiLL】{{customerName}}您好，提醒您明日{{appointmentTime}}有預約{{serviceName}}，請準時到診。如需更改請撥打客服專線。`,
    variables: ["customerName", "appointmentTime", "serviceName"],
  },
  
  appointment_cancelled: {
    id: "appointment_cancelled",
    name: "預約取消",
    channel: "email",
    subject: "【YOChiLL】您的預約已取消",
    titleTemplate: "預約取消通知",
    contentTemplate: `親愛的 {{customerName}} 您好，

您於 {{appointmentDate}} {{appointmentTime}} 的預約已取消。

取消原因：{{cancelReason}}

如有任何問題，歡迎隨時聯繫我們重新預約。

YOChiLL 醫美診所 敬上`,
    variables: ["customerName", "appointmentDate", "appointmentTime", "cancelReason"],
  },
  
  // 術後關懷
  aftercare_day1: {
    id: "aftercare_day1",
    name: "術後第一天關懷",
    channel: "line",
    titleTemplate: "術後關懷",
    contentTemplate: `{{customerName}}您好 💕

感謝您選擇 YOChiLL！

術後第一天，請注意以下事項：
✅ {{careInstructions}}

如有任何不適，請隨時聯繫我們。

祝您恢復順利！`,
    variables: ["customerName", "careInstructions"],
  },
  
  aftercare_followup: {
    id: "aftercare_followup",
    name: "術後回診提醒",
    channel: "sms",
    titleTemplate: "回診提醒",
    contentTemplate: `【YOChiLL】{{customerName}}您好，您的{{treatmentName}}已滿{{daysSinceTreatment}}天，建議安排回診檢查。預約專線：{{clinicPhone}}`,
    variables: ["customerName", "treatmentName", "daysSinceTreatment", "clinicPhone"],
  },
  
  // 行銷相關
  birthday_greeting: {
    id: "birthday_greeting",
    name: "生日祝福",
    channel: "line",
    titleTemplate: "生日快樂",
    contentTemplate: `🎂 {{customerName}}，生日快樂！

YOChiLL 祝您生日快樂，青春永駐！

為您準備了專屬生日禮：
🎁 {{birthdayOffer}}

優惠期限：{{offerExpiry}}
立即預約享優惠！`,
    variables: ["customerName", "birthdayOffer", "offerExpiry"],
  },
  
  promotion_announcement: {
    id: "promotion_announcement",
    name: "優惠活動通知",
    channel: "email",
    subject: "【YOChiLL】專屬優惠活動",
    titleTemplate: "優惠活動",
    contentTemplate: `親愛的 {{customerName}} 您好，

YOChiLL 為您準備了專屬優惠：

{{promotionTitle}}
{{promotionDescription}}

活動期間：{{promotionPeriod}}
優惠內容：{{promotionDetails}}

立即預約，享受美麗！

YOChiLL 醫美診所 敬上`,
    variables: ["customerName", "promotionTitle", "promotionDescription", "promotionPeriod", "promotionDetails"],
  },
  
  // 會員相關
  membership_upgrade: {
    id: "membership_upgrade",
    name: "會員升級通知",
    channel: "line",
    titleTemplate: "會員升級",
    contentTemplate: `🎉 恭喜 {{customerName}}！

您已升級為 {{newLevel}} 會員！

新會員等級專屬權益：
{{membershipBenefits}}

感謝您的支持與信任！`,
    variables: ["customerName", "newLevel", "membershipBenefits"],
  },
  
  points_expiring: {
    id: "points_expiring",
    name: "點數即將到期",
    channel: "sms",
    titleTemplate: "點數到期提醒",
    contentTemplate: `【YOChiLL】{{customerName}}您好，您有{{expiringPoints}}點即將於{{expiryDate}}到期，請盡快使用！`,
    variables: ["customerName", "expiringPoints", "expiryDate"],
  },
  
  // 訂單相關
  order_confirmation: {
    id: "order_confirmation",
    name: "訂單確認",
    channel: "email",
    subject: "【YOChiLL】訂單確認 #{{orderNumber}}",
    titleTemplate: "訂單確認",
    contentTemplate: `親愛的 {{customerName}} 您好，

感謝您的訂購！您的訂單已確認。

訂單編號：{{orderNumber}}
訂單金額：NT$ {{orderAmount}}
付款方式：{{paymentMethod}}

訂購項目：
{{orderItems}}

如有任何問題，歡迎聯繫客服。

YOChiLL 醫美診所 敬上`,
    variables: ["customerName", "orderNumber", "orderAmount", "paymentMethod", "orderItems"],
  },
  
  payment_success: {
    id: "payment_success",
    name: "付款成功",
    channel: "sms",
    titleTemplate: "付款成功",
    contentTemplate: "【YOChiLL】{{customerName}}您好，訂單#{{orderNumber}}付款成功，金額NT${{amount}}。感謝您的支持！",
    variables: ["customerName", "orderNumber", "amount"],
  },
};

// ============================================
// Template Rendering
// ============================================

/**
 * 渲染通知模板
 */
export function renderTemplate(
  template: NotificationTemplate,
  data: Record<string, string | number>
): { title: string; content: string; subject?: string } {
  let title = template.titleTemplate;
  let content = template.contentTemplate;
  let subject = template.subject;
  
  // 替換變數
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`;
    const stringValue = String(value);
    title = title.replace(new RegExp(placeholder, "g"), stringValue);
    content = content.replace(new RegExp(placeholder, "g"), stringValue);
    if (subject) {
      subject = subject.replace(new RegExp(placeholder, "g"), stringValue);
    }
  }
  
  return { title, content, subject };
}

/**
 * 獲取模板
 */
export function getTemplate(templateId: string): NotificationTemplate | undefined {
  return notificationTemplates[templateId];
}

/**
 * 獲取所有模板
 */
export function getAllTemplates(): NotificationTemplate[] {
  return Object.values(notificationTemplates);
}

// ============================================
// Email Notification
// ============================================

/**
 * 發送 Email 通知
 */
export async function sendEmailNotification(
  recipient: NotificationRecipient,
  subject: string,
  content: string
): Promise<NotificationResult> {
  if (!recipient.email) {
    return {
      success: false,
      channel: "email",
      error: "收件人 Email 未設定",
    };
  }
  
  // 使用 Manus Forge API 發送 Email
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[Email] Forge API not configured, skipping email notification");
    return {
      success: false,
      channel: "email",
      error: "Email 服務未設定",
    };
  }
  
  try {
    const endpoint = `${ENV.forgeApiUrl.replace(/\/$/, "")}/webdevtoken.v1.WebDevService/SendEmail`;
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to: recipient.email,
        subject,
        body: content,
        recipientName: recipient.name,
      }),
    });
    
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[Email] Failed to send (${response.status}): ${detail}`);
      return {
        success: false,
        channel: "email",
        error: `發送失敗: ${response.status}`,
      };
    }
    
    const result = await response.json();
    return {
      success: true,
      channel: "email",
      messageId: result.messageId,
      sentAt: new Date(),
    };
  } catch (error) {
    console.error("[Email] Error:", error);
    return {
      success: false,
      channel: "email",
      error: error instanceof Error ? error.message : "發送失敗",
    };
  }
}

// ============================================
// SMS Notification
// ============================================

/**
 * 發送 SMS 通知
 */
export async function sendSmsNotification(
  recipient: NotificationRecipient,
  content: string
): Promise<NotificationResult> {
  if (!recipient.phone) {
    return {
      success: false,
      channel: "sms",
      error: "收件人電話未設定",
    };
  }
  
  // 使用 Manus Forge API 發送 SMS
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[SMS] Forge API not configured, skipping SMS notification");
    return {
      success: false,
      channel: "sms",
      error: "SMS 服務未設定",
    };
  }
  
  try {
    const endpoint = `${ENV.forgeApiUrl.replace(/\/$/, "")}/webdevtoken.v1.WebDevService/SendSMS`;
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to: recipient.phone,
        message: content,
      }),
    });
    
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[SMS] Failed to send (${response.status}): ${detail}`);
      return {
        success: false,
        channel: "sms",
        error: `發送失敗: ${response.status}`,
      };
    }
    
    const result = await response.json();
    return {
      success: true,
      channel: "sms",
      messageId: result.messageId,
      sentAt: new Date(),
    };
  } catch (error) {
    console.error("[SMS] Error:", error);
    return {
      success: false,
      channel: "sms",
      error: error instanceof Error ? error.message : "發送失敗",
    };
  }
}

// ============================================
// LINE Notification
// ============================================

/**
 * 發送 LINE 通知
 */
export async function sendLineNotification(
  recipient: NotificationRecipient,
  content: string
): Promise<NotificationResult> {
  const lineUserId = recipient.lineUserId || ENV.lineUserId;
  
  if (!lineUserId) {
    return {
      success: false,
      channel: "line",
      error: "LINE 用戶 ID 未設定",
    };
  }
  
  if (!ENV.lineChannelAccessToken) {
    console.warn("[LINE] Channel access token not configured");
    return {
      success: false,
      channel: "line",
      error: "LINE 服務未設定",
    };
  }
  
  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.lineChannelAccessToken}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [
          {
            type: "text",
            text: content,
          },
        ],
      }),
    });
    
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[LINE] Failed to send (${response.status}): ${detail}`);
      return {
        success: false,
        channel: "line",
        error: `發送失敗: ${response.status}`,
      };
    }
    
    return {
      success: true,
      channel: "line",
      sentAt: new Date(),
    };
  } catch (error) {
    console.error("[LINE] Error:", error);
    return {
      success: false,
      channel: "line",
      error: error instanceof Error ? error.message : "發送失敗",
    };
  }
}

/**
 * 發送 LINE Flex Message
 */
export async function sendLineFlexMessage(
  recipient: NotificationRecipient,
  altText: string,
  flexContent: Record<string, unknown>
): Promise<NotificationResult> {
  const lineUserId = recipient.lineUserId || ENV.lineUserId;
  
  if (!lineUserId) {
    return {
      success: false,
      channel: "line",
      error: "LINE 用戶 ID 未設定",
    };
  }
  
  if (!ENV.lineChannelAccessToken) {
    return {
      success: false,
      channel: "line",
      error: "LINE 服務未設定",
    };
  }
  
  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.lineChannelAccessToken}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [
          {
            type: "flex",
            altText,
            contents: flexContent,
          },
        ],
      }),
    });
    
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[LINE Flex] Failed to send (${response.status}): ${detail}`);
      return {
        success: false,
        channel: "line",
        error: `發送失敗: ${response.status}`,
      };
    }
    
    return {
      success: true,
      channel: "line",
      sentAt: new Date(),
    };
  } catch (error) {
    console.error("[LINE Flex] Error:", error);
    return {
      success: false,
      channel: "line",
      error: error instanceof Error ? error.message : "發送失敗",
    };
  }
}

// ============================================
// Unified Notification Service
// ============================================

/**
 * 統一通知發送服務
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<NotificationResult> {
  const { channel, recipient, subject, title, content, templateId, templateData } = payload;
  
  // 如果使用模板，先渲染模板
  let finalTitle = title;
  let finalContent = content;
  let finalSubject = subject;
  
  if (templateId && templateData) {
    const template = getTemplate(templateId);
    if (template) {
      const rendered = renderTemplate(template, templateData);
      finalTitle = rendered.title;
      finalContent = rendered.content;
      finalSubject = rendered.subject || subject;
    }
  }
  
  // 根據渠道發送通知
  switch (channel) {
    case "email":
      return sendEmailNotification(recipient, finalSubject || finalTitle, finalContent);
    
    case "sms":
      return sendSmsNotification(recipient, finalContent);
    
    case "line":
      return sendLineNotification(recipient, finalContent);
    
    case "system":
      // 系統內部通知（存入資料庫）
      return {
        success: true,
        channel: "system",
        sentAt: new Date(),
      };
    
    case "push":
      // Push 通知（未來擴展）
      return {
        success: false,
        channel: "push",
        error: "Push 通知尚未實作",
      };
    
    default:
      return {
        success: false,
        channel,
        error: `不支援的通知渠道: ${channel}`,
      };
  }
}

/**
 * 批次發送通知
 */
export async function sendBulkNotifications(
  payloads: NotificationPayload[]
): Promise<NotificationResult[]> {
  const results = await Promise.all(
    payloads.map(payload => sendNotification(payload))
  );
  return results;
}

/**
 * 發送多渠道通知（同一訊息發送到多個渠道）
 */
export async function sendMultiChannelNotification(
  channels: NotificationChannel[],
  recipient: NotificationRecipient,
  title: string,
  content: string,
  options?: {
    subject?: string;
    templateId?: string;
    templateData?: Record<string, string | number>;
  }
): Promise<NotificationResult[]> {
  const payloads: NotificationPayload[] = channels.map(channel => ({
    channel,
    recipient,
    title,
    content,
    subject: options?.subject,
    templateId: options?.templateId,
    templateData: options?.templateData,
  }));
  
  return sendBulkNotifications(payloads);
}

// ============================================
// Notification History (In-Memory)
// ============================================

interface NotificationHistoryEntry {
  id: string;
  payload: NotificationPayload;
  result: NotificationResult;
  createdAt: Date;
}

const notificationHistory: NotificationHistoryEntry[] = [];
const MAX_HISTORY = 1000;

/**
 * 記錄通知歷史
 */
export function logNotificationHistory(
  payload: NotificationPayload,
  result: NotificationResult
): void {
  notificationHistory.push({
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    payload,
    result,
    createdAt: new Date(),
  });
  
  // 保持歷史記錄在限制內
  if (notificationHistory.length > MAX_HISTORY) {
    notificationHistory.shift();
  }
}

/**
 * 獲取通知歷史
 */
export function getNotificationHistory(options?: {
  limit?: number;
  channel?: NotificationChannel;
  success?: boolean;
}): NotificationHistoryEntry[] {
  let entries = [...notificationHistory];
  
  if (options?.channel) {
    entries = entries.filter(e => e.payload.channel === options.channel);
  }
  
  if (options?.success !== undefined) {
    entries = entries.filter(e => e.result.success === options.success);
  }
  
  return entries.slice(-(options?.limit || 100));
}

/**
 * 獲取通知統計
 */
export function getNotificationStats(): {
  total: number;
  byChannel: Record<string, { sent: number; failed: number }>;
  successRate: number;
} {
  const byChannel: Record<string, { sent: number; failed: number }> = {};
  let totalSent = 0;
  let totalFailed = 0;
  
  for (const entry of notificationHistory) {
    const channel = entry.payload.channel;
    if (!byChannel[channel]) {
      byChannel[channel] = { sent: 0, failed: 0 };
    }
    
    if (entry.result.success) {
      byChannel[channel].sent++;
      totalSent++;
    } else {
      byChannel[channel].failed++;
      totalFailed++;
    }
  }
  
  const total = totalSent + totalFailed;
  const successRate = total > 0 ? (totalSent / total) * 100 : 0;
  
  return {
    total,
    byChannel,
    successRate,
  };
}
