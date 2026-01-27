import { describe, it, expect } from 'vitest';

describe('LemonSqueezy API 連線測試', () => {
  it('應該成功驗證 API Key 並取得商店資訊', async () => {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe('');

    // 測試 LemonSqueezy API 連線
    const response = await fetch('https://api.lemonsqueezy.com/v1/users/me', {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('type', 'users');
    expect(data.data).toHaveProperty('id');
    expect(data.data).toHaveProperty('attributes');

    console.log('LemonSqueezy User Info:', {
      id: data.data.id,
      email: data.data.attributes.email,
      name: data.data.attributes.name,
    });
  });

  it('應該成功取得商店列表', async () => {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;

    const response = await fetch('https://api.lemonsqueezy.com/v1/stores', {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);

    if (data.data.length > 0) {
      const store = data.data[0];
      expect(store).toHaveProperty('type', 'stores');
      expect(store).toHaveProperty('id');
      expect(store).toHaveProperty('attributes');

      console.log('LemonSqueezy Store Info:', {
        id: store.id,
        name: store.attributes.name,
        domain: store.attributes.domain,
        currency: store.attributes.currency,
      });
    }
  });
});
