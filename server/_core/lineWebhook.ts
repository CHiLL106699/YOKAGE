import crypto from 'crypto';

/**
 * 驗證 LINE Webhook 簽章
 * @param body - Webhook 請求的原始 body (string)
 * @param signature - LINE 提供的 x-line-signature header
 * @param channelSecret - LINE Channel Secret
 * @returns boolean - 簽章是否有效
 */
export function verifyLineSignature(
  body: string,
  signature: string,
  channelSecret: string
): boolean {
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(Buffer.from(body, 'utf8'))
    .digest('base64');
  
  return hash === signature;
}

/**
 * LINE Webhook 事件類型
 */
export type LineWebhookEventType = 
  | 'message'
  | 'follow'
  | 'unfollow'
  | 'join'
  | 'leave'
  | 'postback'
  | 'beacon';

/**
 * LINE 訊息類型
 */
export type LineMessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'location'
  | 'sticker';

/**
 * LINE Webhook 事件結構
 */
export interface LineWebhookEvent {
  type: LineWebhookEventType;
  timestamp: number;
  source: {
    type: 'user' | 'group' | 'room';
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  replyToken?: string;
  message?: {
    type: LineMessageType;
    id: string;
    text?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * LINE Webhook Payload 結構
 */
export interface LineWebhookPayload {
  destination: string;
  events: LineWebhookEvent[];
}
