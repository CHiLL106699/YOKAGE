/**
 * LINE Messaging API 服務模組
 * 提供真實的 LINE 訊息推播功能
 */

const LINE_API_BASE = 'https://api.line.me/v2/bot';

interface LineMessage {
  type: 'text' | 'flex' | 'image' | 'video' | 'audio' | 'location' | 'sticker';
  text?: string;
  altText?: string;
  contents?: any;
  originalContentUrl?: string;
  previewImageUrl?: string;
}

interface PushMessageRequest {
  to: string;
  messages: LineMessage[];
}

interface BroadcastMessageRequest {
  messages: LineMessage[];
}

interface MulticastMessageRequest {
  to: string[];
  messages: LineMessage[];
}

interface LineApiResponse {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * 取得 LINE Channel Access Token
 */
function getAccessToken(): string {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN 環境變數未設定');
  }
  return token;
}

/**
 * 發送 LINE API 請求
 */
async function lineApiRequest(
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  body?: any
): Promise<LineApiResponse> {
  try {
    const response = await fetch(`${LINE_API_BASE}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
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
 * 推送訊息給單一用戶
 */
export async function pushMessage(
  userId: string,
  messages: LineMessage[]
): Promise<LineApiResponse> {
  return lineApiRequest('/message/push', 'POST', {
    to: userId,
    messages,
  });
}

/**
 * 推送文字訊息給單一用戶
 */
export async function pushTextMessage(
  userId: string,
  text: string
): Promise<LineApiResponse> {
  return pushMessage(userId, [{ type: 'text', text }]);
}

/**
 * 推送 Flex Message 給單一用戶
 */
export async function pushFlexMessage(
  userId: string,
  altText: string,
  contents: any
): Promise<LineApiResponse> {
  return pushMessage(userId, [{
    type: 'flex',
    altText,
    contents,
  }]);
}

/**
 * 廣播訊息給所有好友
 */
export async function broadcastMessage(
  messages: LineMessage[]
): Promise<LineApiResponse> {
  return lineApiRequest('/message/broadcast', 'POST', { messages });
}

/**
 * 廣播文字訊息給所有好友
 */
export async function broadcastTextMessage(
  text: string
): Promise<LineApiResponse> {
  return broadcastMessage([{ type: 'text', text }]);
}

/**
 * 多播訊息給多個用戶
 */
export async function multicastMessage(
  userIds: string[],
  messages: LineMessage[]
): Promise<LineApiResponse> {
  return lineApiRequest('/message/multicast', 'POST', {
    to: userIds,
    messages,
  });
}

/**
 * 多播文字訊息給多個用戶
 */
export async function multicastTextMessage(
  userIds: string[],
  text: string
): Promise<LineApiResponse> {
  return multicastMessage(userIds, [{ type: 'text', text }]);
}

/**
 * 取得 Bot 資訊
 */
export async function getBotInfo(): Promise<LineApiResponse> {
  return lineApiRequest('/info', 'GET');
}

/**
 * 取得用戶資料
 */
export async function getUserProfile(userId: string): Promise<LineApiResponse> {
  return lineApiRequest(`/profile/${userId}`, 'GET');
}

/**
 * 取得訊息配額
 */
export async function getMessageQuota(): Promise<LineApiResponse> {
  return lineApiRequest('/message/quota', 'GET');
}

/**
 * 取得訊息配額使用量
 */
export async function getMessageQuotaConsumption(): Promise<LineApiResponse> {
  return lineApiRequest('/message/quota/consumption', 'GET');
}

// ============================================
// 療程到期提醒 Flex Message 模板
// ============================================

/**
 * 建立療程到期提醒 Flex Message
 */
export function createTreatmentExpiryFlexMessage(params: {
  customerName: string;
  treatmentName: string;
  expiryDate: string;
  remainingSessions: number;
  clinicName: string;
  bookingUrl?: string;
}): any {
  const { customerName, treatmentName, expiryDate, remainingSessions, clinicName, bookingUrl } = params;

  return {
    type: 'bubble',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '⏰ 療程到期提醒',
          weight: 'bold',
          size: 'lg',
          color: '#FF6B6B',
        },
      ],
      backgroundColor: '#FFF5F5',
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
          text: `您的「${treatmentName}」療程即將到期`,
          size: 'sm',
          color: '#666666',
          margin: 'md',
          wrap: true,
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
                {
                  type: 'text',
                  text: '到期日期',
                  size: 'sm',
                  color: '#999999',
                  flex: 1,
                },
                {
                  type: 'text',
                  text: expiryDate,
                  size: 'sm',
                  color: '#FF6B6B',
                  weight: 'bold',
                  flex: 2,
                  align: 'end',
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              margin: 'md',
              contents: [
                {
                  type: 'text',
                  text: '剩餘堂數',
                  size: 'sm',
                  color: '#999999',
                  flex: 1,
                },
                {
                  type: 'text',
                  text: `${remainingSessions} 堂`,
                  size: 'sm',
                  color: '#1DB446',
                  weight: 'bold',
                  flex: 2,
                  align: 'end',
                },
              ],
            },
          ],
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
            label: '立即預約',
            uri: bookingUrl || 'https://line.me',
          },
          style: 'primary',
          color: '#FF6B6B',
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

// ============================================
// 沉睡客戶喚醒 Flex Message 模板
// ============================================

/**
 * 建立沉睡客戶喚醒 Flex Message
 */
export function createDormantCustomerFlexMessage(params: {
  customerName: string;
  lastVisitDate: string;
  daysSinceLastVisit: number;
  specialOffer?: string;
  clinicName: string;
  bookingUrl?: string;
}): any {
  const { customerName, lastVisitDate, daysSinceLastVisit, specialOffer, clinicName, bookingUrl } = params;

  return {
    type: 'bubble',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '💝 我們想念您',
          weight: 'bold',
          size: 'lg',
          color: '#E91E63',
        },
      ],
      backgroundColor: '#FCE4EC',
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
          text: `距離您上次來訪已經 ${daysSinceLastVisit} 天了`,
          size: 'sm',
          color: '#666666',
          margin: 'md',
          wrap: true,
        },
        {
          type: 'text',
          text: '我們非常想念您！期待再次為您服務 ✨',
          size: 'sm',
          color: '#666666',
          margin: 'sm',
          wrap: true,
        },
        ...(specialOffer ? [
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            backgroundColor: '#FFF8E1',
            cornerRadius: '8px',
            paddingAll: '12px',
            contents: [
              {
                type: 'text',
                text: '🎁 專屬回歸優惠',
                size: 'sm',
                weight: 'bold',
                color: '#FF8F00',
              },
              {
                type: 'text',
                text: specialOffer,
                size: 'sm',
                color: '#666666',
                margin: 'sm',
                wrap: true,
              },
            ],
          },
        ] : []),
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
            label: '立即預約回訪',
            uri: bookingUrl || 'https://line.me',
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

// ============================================
// 票券到期提醒 Flex Message 模板
// ============================================

/**
 * 建立票券到期提醒 Flex Message
 */
export function createVoucherExpiryFlexMessage(params: {
  customerName: string;
  voucherName: string;
  expiryDate: string;
  voucherCode: string;
  clinicName: string;
  redeemUrl?: string;
}): any {
  const { customerName, voucherName, expiryDate, voucherCode, clinicName, redeemUrl } = params;

  return {
    type: 'bubble',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '🎫 票券到期提醒',
          weight: 'bold',
          size: 'lg',
          color: '#FF9800',
        },
      ],
      backgroundColor: '#FFF3E0',
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
          text: `您的「${voucherName}」票券即將到期`,
          size: 'sm',
          color: '#666666',
          margin: 'md',
          wrap: true,
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
                {
                  type: 'text',
                  text: '票券代碼',
                  size: 'sm',
                  color: '#999999',
                  flex: 1,
                },
                {
                  type: 'text',
                  text: voucherCode,
                  size: 'sm',
                  color: '#333333',
                  weight: 'bold',
                  flex: 2,
                  align: 'end',
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              margin: 'md',
              contents: [
                {
                  type: 'text',
                  text: '到期日期',
                  size: 'sm',
                  color: '#999999',
                  flex: 1,
                },
                {
                  type: 'text',
                  text: expiryDate,
                  size: 'sm',
                  color: '#FF9800',
                  weight: 'bold',
                  flex: 2,
                  align: 'end',
                },
              ],
            },
          ],
        },
        {
          type: 'text',
          text: '請把握時間使用，逾期將無法兌換！',
          size: 'xs',
          color: '#FF5722',
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
            label: '立即使用',
            uri: redeemUrl || 'https://line.me',
          },
          style: 'primary',
          color: '#FF9800',
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

/**
 * 發送票券到期提醒
 */
export async function sendVoucherExpiryReminders(
  daysBeforeExpiry: number = 3,
  organizationId?: number
): Promise<{
  success: boolean;
  totalScanned: number;
  remindersSent: number;
  errors: string[];
}> {
  // TODO: 實作票券到期提醒邏輯
  // 目前返回模擬結果，待與票券系統整合
  return {
    success: true,
    totalScanned: 0,
    remindersSent: 0,
    errors: [],
  };
}

export default {
  pushMessage,
  pushTextMessage,
  pushFlexMessage,
  broadcastMessage,
  broadcastTextMessage,
  multicastMessage,
  multicastTextMessage,
  getBotInfo,
  getUserProfile,
  getMessageQuota,
  getMessageQuotaConsumption,
  createTreatmentExpiryFlexMessage,
  createDormantCustomerFlexMessage,
  createVoucherExpiryFlexMessage,
  sendVoucherExpiryReminders,
};
