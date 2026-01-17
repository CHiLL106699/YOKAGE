/**
 * LINE Flex Message 票券卡片模板生成器
 * 用於生成精美的票券 Flex Message 卡片
 */

export interface VoucherFlexMessageData {
  voucherCode: string;
  voucherName: string;
  voucherType: 'treatment' | 'discount' | 'gift_card' | 'stored_value' | 'free_item';
  value: string;
  valueType: 'fixed_amount' | 'percentage' | 'treatment_count';
  expiryDate: string;
  customerName: string;
  organizationName: string;
  organizationLogo?: string;
  qrCodeUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  description?: string;
}

/**
 * 獲取票券類型的中文標籤
 */
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    treatment: '療程券',
    discount: '折扣券',
    gift_card: '禮品卡',
    stored_value: '儲值卡',
    free_item: '贈品券',
  };
  return labels[type] || '優惠券';
}

/**
 * 獲取票券價值的顯示文字
 */
function getValueDisplay(value: string, valueType: string): string {
  switch (valueType) {
    case 'fixed_amount':
      return `NT$ ${parseInt(value).toLocaleString()}`;
    case 'percentage':
      return `${value}% OFF`;
    case 'treatment_count':
      return `${value} 堂`;
    default:
      return value;
  }
}

/**
 * 獲取票券類型的圖示 emoji
 */
function getTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    treatment: '💆',
    discount: '🏷️',
    gift_card: '🎁',
    stored_value: '💳',
    free_item: '🎀',
  };
  return emojis[type] || '🎫';
}

/**
 * 生成票券 Flex Message 卡片
 */
export function generateVoucherFlexMessage(data: VoucherFlexMessageData): object {
  const bgColor = data.backgroundColor || '#1E3A5F';
  const txtColor = data.textColor || '#F5D78E';
  const typeLabel = getTypeLabel(data.voucherType);
  const valueDisplay = getValueDisplay(data.value, data.valueType);
  const typeEmoji = getTypeEmoji(data.voucherType);

  return {
    type: 'flex',
    altText: `${data.organizationName} - ${data.voucherName}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: bgColor,
        paddingAll: '20px',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                flex: 1,
                contents: [
                  {
                    type: 'text',
                    text: data.organizationName,
                    color: txtColor,
                    size: 'sm',
                    weight: 'bold',
                  },
                  {
                    type: 'text',
                    text: `${typeEmoji} ${typeLabel}`,
                    color: '#FFFFFF',
                    size: 'xs',
                    margin: 'sm',
                  },
                ],
              },
              ...(data.organizationLogo
                ? [
                    {
                      type: 'image',
                      url: data.organizationLogo,
                      size: '40px',
                      aspectRatio: '1:1',
                      aspectMode: 'cover',
                    } as const,
                  ]
                : []),
            ],
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0A1628',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: data.voucherName,
            color: '#FFFFFF',
            size: 'xl',
            weight: 'bold',
            wrap: true,
          },
          {
            type: 'text',
            text: valueDisplay,
            color: txtColor,
            size: 'xxl',
            weight: 'bold',
            margin: 'lg',
          },
          ...(data.description
            ? [
                {
                  type: 'text',
                  text: data.description,
                  color: '#94A3B8',
                  size: 'sm',
                  wrap: true,
                  margin: 'md',
                } as const,
              ]
            : []),
          {
            type: 'separator',
            margin: 'xl',
            color: '#334155',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'xl',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '票券代碼',
                    color: '#94A3B8',
                    size: 'xs',
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: data.voucherCode,
                    color: txtColor,
                    size: 'sm',
                    weight: 'bold',
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
                    text: '持有人',
                    color: '#94A3B8',
                    size: 'xs',
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: data.customerName,
                    color: '#FFFFFF',
                    size: 'sm',
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
                    text: '有效期限',
                    color: '#94A3B8',
                    size: 'xs',
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: data.expiryDate,
                    color: '#FFFFFF',
                    size: 'sm',
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
        backgroundColor: '#0F172A',
        paddingAll: '15px',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: '📱 查看票券 QR Code',
              uri: data.qrCodeUrl || `https://liff.line.me/placeholder?code=${data.voucherCode}`,
            },
            style: 'primary',
            color: bgColor,
            height: 'sm',
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            justifyContent: 'center',
            contents: [
              {
                type: 'text',
                text: '出示 QR Code 即可核銷使用',
                color: '#64748B',
                size: 'xxs',
                align: 'center',
              },
            ],
          },
        ],
      },
      styles: {
        header: {
          separator: false,
        },
        body: {
          separator: false,
        },
        footer: {
          separator: false,
        },
      },
    },
  };
}

/**
 * 生成批次發送的票券 Flex Message
 */
export function generateBatchVoucherFlexMessage(
  templateName: string,
  organizationName: string,
  totalCount: number
): object {
  return {
    type: 'flex',
    altText: `${organizationName} 批次發送票券通知`,
    contents: {
      type: 'bubble',
      size: 'kilo',
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#1E3A5F',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '🎫 票券發送通知',
            color: '#F5D78E',
            size: 'lg',
            weight: 'bold',
          },
          {
            type: 'text',
            text: `${organizationName} 已向您發送票券`,
            color: '#FFFFFF',
            size: 'sm',
            margin: 'md',
            wrap: true,
          },
          {
            type: 'separator',
            margin: 'lg',
            color: '#334155',
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'lg',
            contents: [
              {
                type: 'text',
                text: '票券名稱',
                color: '#94A3B8',
                size: 'xs',
                flex: 1,
              },
              {
                type: 'text',
                text: templateName,
                color: '#FFFFFF',
                size: 'sm',
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
                text: '發送數量',
                color: '#94A3B8',
                size: 'xs',
                flex: 1,
              },
              {
                type: 'text',
                text: `${totalCount} 張`,
                color: '#F5D78E',
                size: 'sm',
                weight: 'bold',
                align: 'end',
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0F172A',
        paddingAll: '15px',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: '查看我的票券',
              uri: 'https://liff.line.me/placeholder/my-vouchers',
            },
            style: 'primary',
            color: '#1E3A5F',
            height: 'sm',
          },
        ],
      },
    },
  };
}

/**
 * 生成票券核銷成功的 Flex Message
 */
export function generateVoucherRedeemSuccessMessage(
  voucherName: string,
  value: string,
  valueType: string,
  organizationName: string,
  redeemedAt: string
): object {
  const valueDisplay = getValueDisplay(value, valueType);

  return {
    type: 'flex',
    altText: `票券核銷成功 - ${voucherName}`,
    contents: {
      type: 'bubble',
      size: 'kilo',
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#065F46',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '✅ 票券核銷成功',
            color: '#FFFFFF',
            size: 'lg',
            weight: 'bold',
          },
          {
            type: 'text',
            text: voucherName,
            color: '#A7F3D0',
            size: 'md',
            margin: 'md',
          },
          {
            type: 'text',
            text: valueDisplay,
            color: '#FFFFFF',
            size: 'xl',
            weight: 'bold',
            margin: 'sm',
          },
          {
            type: 'separator',
            margin: 'lg',
            color: '#10B981',
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'lg',
            contents: [
              {
                type: 'text',
                text: '核銷門市',
                color: '#A7F3D0',
                size: 'xs',
                flex: 1,
              },
              {
                type: 'text',
                text: organizationName,
                color: '#FFFFFF',
                size: 'sm',
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
                text: '核銷時間',
                color: '#A7F3D0',
                size: 'xs',
                flex: 1,
              },
              {
                type: 'text',
                text: redeemedAt,
                color: '#FFFFFF',
                size: 'sm',
                align: 'end',
              },
            ],
          },
        ],
      },
    },
  };
}

/**
 * 生成票券即將到期提醒的 Flex Message
 */
export function generateVoucherExpiryReminderMessage(
  voucherName: string,
  value: string,
  valueType: string,
  expiryDate: string,
  daysRemaining: number,
  organizationName: string
): object {
  const valueDisplay = getValueDisplay(value, valueType);
  const urgencyColor = daysRemaining <= 3 ? '#DC2626' : '#F59E0B';

  return {
    type: 'flex',
    altText: `票券即將到期提醒 - ${voucherName}`,
    contents: {
      type: 'bubble',
      size: 'kilo',
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#1E3A5F',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '⏰ 票券即將到期',
            color: urgencyColor,
            size: 'lg',
            weight: 'bold',
          },
          {
            type: 'text',
            text: `還剩 ${daysRemaining} 天`,
            color: urgencyColor,
            size: 'xxl',
            weight: 'bold',
            margin: 'md',
          },
          {
            type: 'separator',
            margin: 'lg',
            color: '#334155',
          },
          {
            type: 'text',
            text: voucherName,
            color: '#FFFFFF',
            size: 'md',
            margin: 'lg',
            weight: 'bold',
          },
          {
            type: 'text',
            text: valueDisplay,
            color: '#F5D78E',
            size: 'lg',
            margin: 'sm',
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'lg',
            contents: [
              {
                type: 'text',
                text: '有效期限',
                color: '#94A3B8',
                size: 'xs',
                flex: 1,
              },
              {
                type: 'text',
                text: expiryDate,
                color: urgencyColor,
                size: 'sm',
                weight: 'bold',
                align: 'end',
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0F172A',
        paddingAll: '15px',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: '立即預約使用',
              uri: 'https://liff.line.me/placeholder/booking',
            },
            style: 'primary',
            color: urgencyColor,
            height: 'sm',
          },
        ],
      },
    },
  };
}
