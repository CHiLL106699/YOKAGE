import { ENV } from './_core/env';

const env = ENV;

const LEMONSQUEEZY_API_BASE = 'https://api.lemonsqueezy.com/v1';

interface LemonSqueezyApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
}

/**
 * LemonSqueezy API 請求封裝
 */
async function lemonsqueezyRequest(endpoint: string, options: LemonSqueezyApiOptions = {}) {
  const { method = 'GET', body } = options;
  
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    'Authorization': `Bearer ${env.lemonsqueezyApiKey}`,
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PATCH')) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${LEMONSQUEEZY_API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`LemonSqueezy API Error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

/**
 * 取得當前用戶資訊
 */
export async function getCurrentUser() {
  return lemonsqueezyRequest('/users/me');
}

/**
 * 取得商店列表
 */
export async function getStores() {
  return lemonsqueezyRequest('/stores');
}

/**
 * 取得商店詳情
 */
export async function getStore(storeId: string) {
  return lemonsqueezyRequest(`/stores/${storeId}`);
}

/**
 * 取得產品列表
 */
export async function getProducts(storeId: string) {
  return lemonsqueezyRequest(`/products?filter[store_id]=${storeId}`);
}

/**
 * 取得產品詳情
 */
export async function getProduct(productId: string) {
  return lemonsqueezyRequest(`/products/${productId}`);
}

/**
 * 取得產品變體列表
 */
export async function getVariants(productId: string) {
  return lemonsqueezyRequest(`/variants?filter[product_id]=${productId}`);
}

/**
 * 建立 Checkout URL（用於訂閱或一次性付款）
 */
export async function createCheckout(data: {
  storeId: string;
  variantId: string;
  customData?: Record<string, any>;
  checkoutOptions?: {
    embed?: boolean;
    media?: boolean;
    logo?: boolean;
    desc?: boolean;
    discount?: boolean;
    dark?: boolean;
    subscription_preview?: boolean;
    button_color?: string;
  };
  checkoutData?: {
    email?: string;
    name?: string;
    billing_address?: Record<string, string>;
    tax_number?: string;
    discount_code?: string;
    custom?: Record<string, any>;
  };
  expiresAt?: string;
  preview?: boolean;
  testMode?: boolean;
}) {
  return lemonsqueezyRequest('/checkouts', {
    method: 'POST',
    body: {
      data: {
        type: 'checkouts',
        attributes: {
          store_id: data.storeId,
          variant_id: data.variantId,
          custom_data: data.customData,
          checkout_options: data.checkoutOptions,
          checkout_data: data.checkoutData,
          expires_at: data.expiresAt,
          preview: data.preview,
          test_mode: data.testMode,
        },
      },
    },
  });
}

/**
 * 取得訂閱列表
 */
export async function getSubscriptions(params?: {
  storeId?: string;
  orderId?: string;
  orderItemId?: string;
  productId?: string;
  variantId?: string;
  status?: string;
  page?: number;
  perPage?: number;
}) {
  const queryParams = new URLSearchParams();
  
  if (params?.storeId) queryParams.append('filter[store_id]', params.storeId);
  if (params?.orderId) queryParams.append('filter[order_id]', params.orderId);
  if (params?.orderItemId) queryParams.append('filter[order_item_id]', params.orderItemId);
  if (params?.productId) queryParams.append('filter[product_id]', params.productId);
  if (params?.variantId) queryParams.append('filter[variant_id]', params.variantId);
  if (params?.status) queryParams.append('filter[status]', params.status);
  if (params?.page) queryParams.append('page[number]', params.page.toString());
  if (params?.perPage) queryParams.append('page[size]', params.perPage.toString());

  const query = queryParams.toString();
  return lemonsqueezyRequest(`/subscriptions${query ? `?${query}` : ''}`);
}

/**
 * 取得訂閱詳情
 */
export async function getSubscription(subscriptionId: string) {
  return lemonsqueezyRequest(`/subscriptions/${subscriptionId}`);
}

/**
 * 更新訂閱
 */
export async function updateSubscription(subscriptionId: string, data: {
  pause?: { mode: 'void' | 'free' };
  cancelled?: boolean;
  invoiceImmediately?: boolean;
}) {
  return lemonsqueezyRequest(`/subscriptions/${subscriptionId}`, {
    method: 'PATCH',
    body: {
      data: {
        type: 'subscriptions',
        id: subscriptionId,
        attributes: data,
      },
    },
  });
}

/**
 * 取消訂閱
 */
export async function cancelSubscription(subscriptionId: string) {
  return updateSubscription(subscriptionId, { cancelled: true });
}

/**
 * 取得訂單列表
 */
export async function getOrders(params?: {
  storeId?: string;
  userEmail?: string;
  page?: number;
  perPage?: number;
}) {
  const queryParams = new URLSearchParams();
  
  if (params?.storeId) queryParams.append('filter[store_id]', params.storeId);
  if (params?.userEmail) queryParams.append('filter[user_email]', params.userEmail);
  if (params?.page) queryParams.append('page[number]', params.page.toString());
  if (params?.perPage) queryParams.append('page[size]', params.perPage.toString());

  const query = queryParams.toString();
  return lemonsqueezyRequest(`/orders${query ? `?${query}` : ''}`);
}

/**
 * 取得訂單詳情
 */
export async function getOrder(orderId: string) {
  return lemonsqueezyRequest(`/orders/${orderId}`);
}

/**
 * 建立退款
 */
export async function createRefund(orderId: string, amount?: number) {
  return lemonsqueezyRequest('/refunds', {
    method: 'POST',
    body: {
      data: {
        type: 'refunds',
        attributes: {
          order_id: orderId,
          amount: amount, // 若不提供則全額退款
        },
      },
    },
  });
}

/**
 * 取得退款列表
 */
export async function getRefunds(params?: {
  orderId?: string;
  page?: number;
  perPage?: number;
}) {
  const queryParams = new URLSearchParams();
  
  if (params?.orderId) queryParams.append('filter[order_id]', params.orderId);
  if (params?.page) queryParams.append('page[number]', params.page.toString());
  if (params?.perPage) queryParams.append('page[size]', params.perPage.toString());

  const query = queryParams.toString();
  return lemonsqueezyRequest(`/refunds${query ? `?${query}` : ''}`);
}

/**
 * 取得客戶列表
 */
export async function getCustomers(params?: {
  storeId?: string;
  email?: string;
  page?: number;
  perPage?: number;
}) {
  const queryParams = new URLSearchParams();
  
  if (params?.storeId) queryParams.append('filter[store_id]', params.storeId);
  if (params?.email) queryParams.append('filter[email]', params.email);
  if (params?.page) queryParams.append('page[number]', params.page.toString());
  if (params?.perPage) queryParams.append('page[size]', params.perPage.toString());

  const query = queryParams.toString();
  return lemonsqueezyRequest(`/customers${query ? `?${query}` : ''}`);
}

/**
 * 取得客戶詳情
 */
export async function getCustomer(customerId: string) {
  return lemonsqueezyRequest(`/customers/${customerId}`);
}

/**
 * 驗證 Webhook 簽名
 */
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  return digest === signature;
}

export default {
  getCurrentUser,
  getStores,
  getStore,
  getProducts,
  getProduct,
  getVariants,
  createCheckout,
  getSubscriptions,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  getOrders,
  getOrder,
  createRefund,
  getRefunds,
  getCustomers,
  getCustomer,
  verifyWebhookSignature,
};
