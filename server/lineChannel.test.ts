import { describe, it, expect } from 'vitest';

describe('LINE Channel 憑證驗證', () => {
  it('LINE_CHANNEL_ACCESS_TOKEN 環境變數已設定', () => {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    expect(token).toBeDefined();
    expect(token).not.toBe('');
    expect(token!.length).toBeGreaterThan(50); // LINE token 通常很長
  });

  it('LINE_USER_ID 環境變數已設定', () => {
    const userId = process.env.LINE_USER_ID;
    expect(userId).toBeDefined();
    expect(userId).not.toBe('');
    expect(userId).toMatch(/^U[a-f0-9]{32}$/); // LINE User ID 格式
  });

  it('LINE Messaging API 連線測試', async () => {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) {
      throw new Error('LINE_CHANNEL_ACCESS_TOKEN 未設定');
    }

    // 使用 LINE Bot Info API 驗證 token 有效性
    const response = await fetch('https://api.line.me/v2/bot/info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // 如果 token 有效，應該返回 200
    // 如果 token 無效，會返回 401
    expect(response.status).toBe(200);

    const botInfo = await response.json();
    console.log('LINE Bot Info:', botInfo);
    
    // 驗證返回的資料結構
    expect(botInfo).toHaveProperty('userId');
    expect(botInfo).toHaveProperty('basicId');
  });

  it('LINE User Profile 查詢測試', async () => {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const userId = process.env.LINE_USER_ID;
    
    if (!token || !userId) {
      throw new Error('LINE 憑證未設定');
    }

    // 使用 LINE Profile API 驗證 User ID 有效性
    const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // 如果 User ID 有效且該用戶已加入 Bot，應該返回 200
    // 如果用戶未加入 Bot，會返回 404
    if (response.status === 200) {
      const profile = await response.json();
      console.log('LINE User Profile:', profile);
      expect(profile).toHaveProperty('userId');
      expect(profile).toHaveProperty('displayName');
    } else if (response.status === 404) {
      // 用戶尚未加入 Bot，但 token 是有效的
      console.log('用戶尚未加入 LINE Bot，但憑證有效');
      expect(response.status).toBe(404);
    } else {
      // 其他錯誤
      throw new Error(`LINE API 錯誤: ${response.status}`);
    }
  });
});
