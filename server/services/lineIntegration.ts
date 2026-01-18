/**
 * LINE 整合服務模組
 * 支援多診所各自設定 LINE Channel
 */

import { getDb } from "../db";
import { lineChannelSettings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const LINE_API_BASE = 'https://api.line.me/v2/bot';

// ============================================
// 類型定義
// ============================================

export interface LineChannelConfig {
  channelId: string;
  channelSecret: string;
  channelAccessToken: string;
  liffId?: string;
}

export interface LineApiResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export interface LineMessage {
  type: 'text' | 'flex' | 'image' | 'video' | 'audio' | 'location' | 'sticker';
  text?: string;
  altText?: string;
  contents?: any;
  originalContentUrl?: string;
  previewImageUrl?: string;
}

// ============================================
// LINE Channel 設定管理
// ============================================

/**
 * 取得診所的 LINE Channel 設定
 */
export async function getLineChannelConfig(organizationId: number): Promise<LineChannelConfig | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [settings] = await db.select().from(lineChannelSettings).where(eq(lineChannelSettings.organizationId, organizationId)).limit(1);

  if (!settings || !settings.channelAccessToken) {
    return null;
  }

  return {
    channelId: settings.channelId || '',
    channelSecret: settings.channelSecret || '',
    channelAccessToken: settings.channelAccessToken,
    liffId: settings.liffId || undefined,
  };
}

/**
 * 儲存或更新 LINE Channel 設定
 */
export async function saveLineChannelConfig(
  organizationId: number,
  config: Partial<LineChannelConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) return { success: false, error: '資料庫連線失敗' };
    
    const [existing] = await db.select().from(lineChannelSettings).where(eq(lineChannelSettings.organizationId, organizationId)).limit(1);

    if (existing) {
      await db.update(lineChannelSettings)
        .set({
          channelId: config.channelId,
          channelSecret: config.channelSecret,
          channelAccessToken: config.channelAccessToken,
          liffId: config.liffId,
          updatedAt: new Date(),
        })
        .where(eq(lineChannelSettings.organizationId, organizationId));
    } else {
      await db.insert(lineChannelSettings).values({
        organizationId,
        channelId: config.channelId,
        channelSecret: config.channelSecret,
        channelAccessToken: config.channelAccessToken,
        liffId: config.liffId,
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
 * 驗證 LINE Channel 憑證
 */
export async function verifyLineChannel(
  organizationId: number,
  accessToken: string
): Promise<LineApiResponse> {
  try {
    const response = await fetch(`${LINE_API_BASE}/info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const botInfo = await response.json();
      
      // 更新驗證狀態與 Bot 資訊
      const db = await getDb();
      if (db) {
        await db.update(lineChannelSettings)
        .set({
          isVerified: true,
          verifiedAt: new Date(),
          botBasicId: botInfo.basicId,
          botDisplayName: botInfo.displayName,
          botPictureUrl: botInfo.pictureUrl,
          updatedAt: new Date(),
        })
          .where(eq(lineChannelSettings.organizationId, organizationId));
      }

      return {
        success: true,
        data: {
          basicId: botInfo.basicId,
          displayName: botInfo.displayName,
          pictureUrl: botInfo.pictureUrl,
        },
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.message || `驗證失敗: ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '驗證請求失敗',
    };
  }
}

/**
 * 取得 LINE Channel 設定狀態
 */
export async function getLineChannelStatus(organizationId: number): Promise<{
  isConfigured: boolean;
  isVerified: boolean;
  botInfo?: {
    basicId: string;
    displayName: string;
    pictureUrl: string;
  };
  settings?: {
    notificationEnabled: boolean;
    appointmentReminderEnabled: boolean;
    marketingMessageEnabled: boolean;
  };
}> {
  const db = await getDb();
  if (!db) {
    return { isConfigured: false, isVerified: false };
  }
  
  const [settings] = await db.select().from(lineChannelSettings).where(eq(lineChannelSettings.organizationId, organizationId)).limit(1);

  if (!settings) {
    return {
      isConfigured: false,
      isVerified: false,
    };
  }

  return {
    isConfigured: !!settings.channelAccessToken,
    isVerified: settings.isVerified || false,
    botInfo: settings.botBasicId ? {
      basicId: settings.botBasicId,
      displayName: settings.botDisplayName || '',
      pictureUrl: settings.botPictureUrl || '',
    } : undefined,
    settings: {
      notificationEnabled: settings.notificationEnabled || true,
      appointmentReminderEnabled: settings.appointmentReminderEnabled || true,
      marketingMessageEnabled: settings.marketingMessageEnabled || true,
    },
  };
}

// ============================================
// LINE 訊息發送（多診所版本）
// ============================================

/**
 * 使用診所專屬 Channel 發送 LINE API 請求
 */
async function lineApiRequestWithOrg(
  organizationId: number,
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  body?: any
): Promise<LineApiResponse> {
  const config = await getLineChannelConfig(organizationId);
  
  if (!config) {
    return {
      success: false,
      error: '診所尚未設定 LINE Channel',
    };
  }

  try {
    const response = await fetch(`${LINE_API_BASE}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${config.channelAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 200 || response.status === 204) {
      const data = response.status === 204 ? null : await response.json().catch(() => null);
      return { success: true, data };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.message || `LINE API 錯誤: ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    };
  }
}

/**
 * 推送訊息給單一用戶（多診所版本）
 */
export async function pushMessageToUser(
  organizationId: number,
  userId: string,
  messages: LineMessage[]
): Promise<LineApiResponse> {
  return lineApiRequestWithOrg(organizationId, '/message/push', 'POST', {
    to: userId,
    messages,
  });
}

/**
 * 推送文字訊息給單一用戶（多診所版本）
 */
export async function pushTextMessageToUser(
  organizationId: number,
  userId: string,
  text: string
): Promise<LineApiResponse> {
  return pushMessageToUser(organizationId, userId, [{ type: 'text', text }]);
}

/**
 * 推送 Flex Message 給單一用戶（多診所版本）
 */
export async function pushFlexMessageToUser(
  organizationId: number,
  userId: string,
  altText: string,
  contents: any
): Promise<LineApiResponse> {
  return pushMessageToUser(organizationId, userId, [{
    type: 'flex',
    altText,
    contents,
  }]);
}

/**
 * 廣播訊息給所有好友（多診所版本）
 */
export async function broadcastMessageToAll(
  organizationId: number,
  messages: LineMessage[]
): Promise<LineApiResponse> {
  return lineApiRequestWithOrg(organizationId, '/message/broadcast', 'POST', { messages });
}

/**
 * 多播訊息給多個用戶（多診所版本）
 */
export async function multicastMessageToUsers(
  organizationId: number,
  userIds: string[],
  messages: LineMessage[]
): Promise<LineApiResponse> {
  return lineApiRequestWithOrg(organizationId, '/message/multicast', 'POST', {
    to: userIds,
    messages,
  });
}

/**
 * 取得訊息配額（多診所版本）
 */
export async function getMessageQuotaForOrg(organizationId: number): Promise<LineApiResponse> {
  return lineApiRequestWithOrg(organizationId, '/message/quota', 'GET');
}

/**
 * 取得用戶資料（多診所版本）
 */
export async function getUserProfileForOrg(
  organizationId: number,
  userId: string
): Promise<LineApiResponse> {
  return lineApiRequestWithOrg(organizationId, `/profile/${userId}`, 'GET');
}

// ============================================
// 通知設定管理
// ============================================

/**
 * 更新通知設定
 */
export async function updateNotificationSettings(
  organizationId: number,
  settings: {
    notificationEnabled?: boolean;
    appointmentReminderEnabled?: boolean;
    marketingMessageEnabled?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) return { success: false, error: '資料庫連線失敗' };
    
    await db.update(lineChannelSettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(lineChannelSettings.organizationId, organizationId));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新設定失敗',
    };
  }
}

// ============================================
// 預約提醒 Flex Message 模板
// ============================================

export function createAppointmentReminderFlex(params: {
  customerName: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
  staffName?: string;
  clinicName: string;
  clinicAddress?: string;
  confirmUrl?: string;
}): any {
  const { customerName, appointmentDate, appointmentTime, serviceName, staffName, clinicName, clinicAddress, confirmUrl } = params;

  return {
    type: 'bubble',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '📅 預約提醒',
          weight: 'bold',
          size: 'lg',
          color: '#4F46E5',
        },
      ],
      backgroundColor: '#EEF2FF',
      paddingAll: '15px',
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: `親愛的 ${customerName}`,
          size: 'md',
          margin: 'md',
        },
        {
          type: 'text',
          text: '您有一個即將到來的預約：',
          size: 'sm',
          color: '#666666',
          margin: 'md',
        },
        {
          type: 'separator',
          margin: 'lg',
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: '日期', size: 'sm', color: '#999999', flex: 1 },
                { type: 'text', text: appointmentDate, size: 'sm', weight: 'bold', flex: 2, align: 'end' },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              margin: 'md',
              contents: [
                { type: 'text', text: '時間', size: 'sm', color: '#999999', flex: 1 },
                { type: 'text', text: appointmentTime, size: 'sm', weight: 'bold', flex: 2, align: 'end' },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              margin: 'md',
              contents: [
                { type: 'text', text: '服務', size: 'sm', color: '#999999', flex: 1 },
                { type: 'text', text: serviceName, size: 'sm', weight: 'bold', flex: 2, align: 'end', wrap: true },
              ],
            },
            ...(staffName ? [{
              type: 'box',
              layout: 'horizontal',
              margin: 'md',
              contents: [
                { type: 'text', text: '服務人員', size: 'sm', color: '#999999', flex: 1 },
                { type: 'text', text: staffName, size: 'sm', weight: 'bold', flex: 2, align: 'end' },
              ],
            }] : []),
          ],
        },
        ...(clinicAddress ? [{
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          contents: [
            { type: 'text', text: '📍 地址', size: 'xs', color: '#999999' },
            { type: 'text', text: clinicAddress, size: 'sm', margin: 'sm', wrap: true },
          ],
        }] : []),
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        ...(confirmUrl ? [{
          type: 'button',
          action: {
            type: 'uri',
            label: '確認預約',
            uri: confirmUrl,
          },
          style: 'primary',
          color: '#4F46E5',
        }] : []),
        {
          type: 'text',
          text: clinicName,
          size: 'xs',
          color: '#999999',
          align: 'center',
          margin: 'md',
        },
      ],
    },
  };
}

// ============================================
// 行銷訊息 Flex Message 模板
// ============================================

export function createMarketingFlex(params: {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  clinicName: string;
}): any {
  const { title, subtitle, imageUrl, description, buttonLabel, buttonUrl, clinicName } = params;

  return {
    type: 'bubble',
    ...(imageUrl ? {
      hero: {
        type: 'image',
        url: imageUrl,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
      },
    } : {}),
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: title,
          weight: 'bold',
          size: 'xl',
          wrap: true,
        },
        ...(subtitle ? [{
          type: 'text',
          text: subtitle,
          size: 'sm',
          color: '#999999',
          margin: 'sm',
        }] : []),
        {
          type: 'text',
          text: description,
          size: 'sm',
          color: '#666666',
          margin: 'lg',
          wrap: true,
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: buttonLabel,
            uri: buttonUrl,
          },
          style: 'primary',
          color: '#E91E63',
        },
        {
          type: 'text',
          text: clinicName,
          size: 'xs',
          color: '#999999',
          align: 'center',
          margin: 'md',
        },
      ],
    },
  };
}
