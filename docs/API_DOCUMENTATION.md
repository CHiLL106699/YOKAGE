# YOChiLL SaaS 平台 API 文檔

> **版本**：v2.0  
> **最後更新**：2026-01-18  
> **適用對象**：前端開發者、系統整合工程師

---

## 概述

YOChiLL SaaS 平台採用 **tRPC** 作為 API 框架，提供型別安全的端對端通訊。所有 API 端點均位於 `/api/trpc` 路徑下，使用 SuperJSON 作為序列化工具，支援 Date、BigInt 等複雜型別的自動轉換。

### 認證機制

系統採用 **JWT Cookie** 認證機制，透過 Manus OAuth 完成身份驗證後，系統會自動設置 HTTP-only Cookie。所有需要認證的 API 呼叫都會自動攜帶此 Cookie。

| 認證類型 | 說明 |
|---------|------|
| `publicProcedure` | 公開 API，無需認證 |
| `protectedProcedure` | 需要登入，驗證 `ctx.user` 存在 |
| `adminProcedure` | 需要 Super Admin 權限 |

---

## 核心 API 模組

### 1. 認證模組 (auth)

#### auth.me

獲取當前登入用戶資訊。

```typescript
// 呼叫方式
const { data } = trpc.auth.me.useQuery();

// 回傳型別
interface User {
  id: number;
  openId: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: Date;
}
```

#### auth.logout

登出當前用戶。

```typescript
// 呼叫方式
const mutation = trpc.auth.logout.useMutation();
await mutation.mutateAsync();
```

---

### 2. 客戶管理模組 (customer)

#### customer.list

獲取客戶列表，支援分頁與搜尋。

```typescript
// 輸入參數
interface ListInput {
  page?: number;        // 頁碼，預設 1
  pageSize?: number;    // 每頁筆數，預設 20
  search?: string;      // 搜尋關鍵字（姓名、電話、Email）
  level?: string;       // 會員等級篩選
  tag?: string;         // 標籤篩選
}

// 呼叫方式
const { data } = trpc.customer.list.useQuery({ page: 1, pageSize: 20 });

// 回傳型別
interface ListResponse {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

#### customer.getById

根據 ID 獲取客戶詳情。

```typescript
// 輸入參數
interface GetByIdInput {
  id: number;
}

// 呼叫方式
const { data } = trpc.customer.getById.useQuery({ id: 1 });
```

#### customer.create

新增客戶。

```typescript
// 輸入參數
interface CreateInput {
  name: string;
  phone?: string;
  email?: string;
  birthday?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;
  source?: string;
  level?: string;
  tags?: string[];
}

// 呼叫方式
const mutation = trpc.customer.create.useMutation();
await mutation.mutateAsync({ name: '王小明', phone: '0912345678' });
```

#### customer.update

更新客戶資料。

```typescript
// 輸入參數
interface UpdateInput {
  id: number;
  name?: string;
  phone?: string;
  email?: string;
  birthday?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;
  source?: string;
  level?: string;
  tags?: string[];
}

// 呼叫方式
const mutation = trpc.customer.update.useMutation();
await mutation.mutateAsync({ id: 1, name: '王大明' });
```

#### customer.delete

刪除客戶。

```typescript
// 輸入參數
interface DeleteInput {
  id: number;
}

// 呼叫方式
const mutation = trpc.customer.delete.useMutation();
await mutation.mutateAsync({ id: 1 });
```

#### customer.batchDelete

批次刪除客戶。

```typescript
// 輸入參數
interface BatchDeleteInput {
  ids: number[];
}

// 呼叫方式
const mutation = trpc.customer.batchDelete.useMutation();
await mutation.mutateAsync({ ids: [1, 2, 3] });

// 回傳型別
interface BatchDeleteResponse {
  deletedCount: number;
}
```

#### customer.batchUpdateLevel

批次更新客戶等級。

```typescript
// 輸入參數
interface BatchUpdateLevelInput {
  ids: number[];
  level: string;
}

// 呼叫方式
const mutation = trpc.customer.batchUpdateLevel.useMutation();
await mutation.mutateAsync({ ids: [1, 2, 3], level: 'VIP' });
```

#### customer.batchAddTag

批次新增標籤。

```typescript
// 輸入參數
interface BatchAddTagInput {
  ids: number[];
  tag: string;
}

// 呼叫方式
const mutation = trpc.customer.batchAddTag.useMutation();
await mutation.mutateAsync({ ids: [1, 2, 3], tag: '高消費' });
```

---

### 3. 預約管理模組 (appointment)

#### appointment.list

獲取預約列表。

```typescript
// 輸入參數
interface ListInput {
  page?: number;
  pageSize?: number;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  customerId?: number;
  staffId?: number;
}

// 呼叫方式
const { data } = trpc.appointment.list.useQuery({
  status: 'confirmed',
  startDate: new Date('2024-01-01'),
});
```

#### appointment.create

新增預約。

```typescript
// 輸入參數
interface CreateInput {
  customerId: number;
  staffId?: number;
  serviceId?: number;
  appointmentDate: Date;
  appointmentTime: string;  // HH:mm 格式
  duration?: number;        // 分鐘
  notes?: string;
}

// 呼叫方式
const mutation = trpc.appointment.create.useMutation();
await mutation.mutateAsync({
  customerId: 1,
  appointmentDate: new Date('2024-01-20'),
  appointmentTime: '14:00',
  duration: 60,
});
```

#### appointment.updateStatus

更新預約狀態。

```typescript
// 輸入參數
interface UpdateStatusInput {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  cancelReason?: string;
}

// 呼叫方式
const mutation = trpc.appointment.updateStatus.useMutation();
await mutation.mutateAsync({ id: 1, status: 'confirmed' });
```

#### appointment.batchUpdateStatus

批次更新預約狀態。

```typescript
// 輸入參數
interface BatchUpdateStatusInput {
  ids: number[];
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

// 呼叫方式
const mutation = trpc.appointment.batchUpdateStatus.useMutation();
await mutation.mutateAsync({ ids: [1, 2, 3], status: 'confirmed' });
```

---

### 4. 產品管理模組 (product)

#### product.list

獲取產品列表。

```typescript
// 輸入參數
interface ListInput {
  page?: number;
  pageSize?: number;
  category?: string;
  status?: 'active' | 'inactive';
  search?: string;
}

// 呼叫方式
const { data } = trpc.product.list.useQuery({ category: '療程' });
```

#### product.create

新增產品。

```typescript
// 輸入參數
interface CreateInput {
  name: string;
  category?: string;
  description?: string;
  price: number;
  cost?: number;
  stock?: number;
  minStock?: number;
  unit?: string;
  imageUrl?: string;
  status?: 'active' | 'inactive';
}

// 呼叫方式
const mutation = trpc.product.create.useMutation();
await mutation.mutateAsync({
  name: '玻尿酸 1ml',
  category: '注射類',
  price: 15000,
  cost: 5000,
  stock: 100,
});
```

#### product.batchUpdateStatus

批次更新產品狀態。

```typescript
// 輸入參數
interface BatchUpdateStatusInput {
  ids: number[];
  status: 'active' | 'inactive';
}

// 呼叫方式
const mutation = trpc.product.batchUpdateStatus.useMutation();
await mutation.mutateAsync({ ids: [1, 2, 3], status: 'inactive' });
```

---

### 5. 員工管理模組 (staff)

#### staff.list

獲取員工列表。

```typescript
// 輸入參數
interface ListInput {
  page?: number;
  pageSize?: number;
  role?: string;
  status?: 'active' | 'inactive';
}

// 呼叫方式
const { data } = trpc.staff.list.useQuery({ role: '醫師' });
```

#### staff.create

新增員工。

```typescript
// 輸入參數
interface CreateInput {
  name: string;
  role: string;
  phone?: string;
  email?: string;
  lineUserId?: string;
  hireDate?: Date;
  salary?: number;
  commissionRate?: number;
}

// 呼叫方式
const mutation = trpc.staff.create.useMutation();
await mutation.mutateAsync({
  name: '陳醫師',
  role: '醫師',
  commissionRate: 0.3,
});
```

#### staff.batchUpdateStatus

批次更新員工狀態。

```typescript
// 輸入參數
interface BatchUpdateStatusInput {
  ids: number[];
  status: 'active' | 'inactive';
}

// 呼叫方式
const mutation = trpc.staff.batchUpdateStatus.useMutation();
await mutation.mutateAsync({ ids: [1, 2], status: 'inactive' });
```

---

### 6. 訂單管理模組 (order)

#### order.list

獲取訂單列表。

```typescript
// 輸入參數
interface ListInput {
  page?: number;
  pageSize?: number;
  status?: 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded';
  customerId?: number;
  startDate?: Date;
  endDate?: Date;
}

// 呼叫方式
const { data } = trpc.order.list.useQuery({ status: 'paid' });
```

#### order.create

新增訂單。

```typescript
// 輸入參數
interface CreateInput {
  customerId: number;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  paymentMethod?: string;
  notes?: string;
}

// 呼叫方式
const mutation = trpc.order.create.useMutation();
await mutation.mutateAsync({
  customerId: 1,
  items: [
    { productId: 1, quantity: 1, price: 15000 },
  ],
  paymentMethod: '信用卡',
});
```

#### order.batchUpdateStatus

批次更新訂單狀態。

```typescript
// 輸入參數
interface BatchUpdateStatusInput {
  ids: number[];
  status: 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded';
}

// 呼叫方式
const mutation = trpc.order.batchUpdateStatus.useMutation();
await mutation.mutateAsync({ ids: [1, 2, 3], status: 'completed' });
```

---

### 7. 報表分析模組 (analytics)

#### analytics.dashboard

獲取儀表板統計資料。

```typescript
// 輸入參數
interface DashboardInput {
  startDate?: Date;
  endDate?: Date;
}

// 呼叫方式
const { data } = trpc.analytics.dashboard.useQuery({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
});

// 回傳型別
interface DashboardResponse {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalAppointments: number;
  revenueByDay: Array<{ date: string; revenue: number }>;
  topProducts: Array<{ name: string; sales: number }>;
  customerGrowth: Array<{ date: string; count: number }>;
}
```

#### analytics.rfm

獲取 RFM 分析資料。

```typescript
// 輸入參數
interface RfmInput {
  customerId?: number;
}

// 呼叫方式
const { data } = trpc.analytics.rfm.useQuery({});

// 回傳型別
interface RfmResponse {
  segments: Array<{
    segment: string;
    count: number;
    avgRecency: number;
    avgFrequency: number;
    avgMonetary: number;
  }>;
  customers: Array<{
    id: number;
    name: string;
    recency: number;
    frequency: number;
    monetary: number;
    segment: string;
  }>;
}
```

---

### 8. 通知模組 (notification)

#### notification.send

發送通知。

```typescript
// 輸入參數
interface SendInput {
  channel: 'email' | 'sms' | 'line' | 'system';
  recipientId: number;
  title: string;
  content: string;
  templateId?: string;
  templateData?: Record<string, string | number>;
}

// 呼叫方式
const mutation = trpc.notification.send.useMutation();
await mutation.mutateAsync({
  channel: 'line',
  recipientId: 1,
  title: '預約提醒',
  content: '您明日有預約，請準時到診。',
});
```

#### notification.sendBulk

批次發送通知。

```typescript
// 輸入參數
interface SendBulkInput {
  channel: 'email' | 'sms' | 'line' | 'system';
  recipientIds: number[];
  title: string;
  content: string;
  templateId?: string;
  templateData?: Record<string, string | number>;
}

// 呼叫方式
const mutation = trpc.notification.sendBulk.useMutation();
await mutation.mutateAsync({
  channel: 'sms',
  recipientIds: [1, 2, 3],
  title: '優惠通知',
  content: '本月限定優惠，歡迎預約！',
});
```

---

### 9. 系統管理模組 (system)

#### system.notifyOwner

發送通知給系統擁有者。

```typescript
// 輸入參數
interface NotifyOwnerInput {
  title: string;
  content: string;
}

// 呼叫方式
const mutation = trpc.system.notifyOwner.useMutation();
await mutation.mutateAsync({
  title: '新訂單通知',
  content: '有一筆新訂單，金額 NT$15,000',
});
```

---

## 錯誤處理

所有 API 錯誤都會以 tRPC 標準格式回傳：

```typescript
interface TRPCError {
  code: string;
  message: string;
  data?: {
    code: string;
    httpStatus: number;
    path: string;
  };
}
```

### 常見錯誤碼

| 錯誤碼 | HTTP 狀態碼 | 說明 |
|--------|------------|------|
| `UNAUTHORIZED` | 401 | 未登入或 Token 過期 |
| `FORBIDDEN` | 403 | 權限不足 |
| `NOT_FOUND` | 404 | 資源不存在 |
| `BAD_REQUEST` | 400 | 請求參數錯誤 |
| `TOO_MANY_REQUESTS` | 429 | 請求頻率超過限制 |
| `INTERNAL_SERVER_ERROR` | 500 | 伺服器內部錯誤 |

### 前端錯誤處理範例

```typescript
const mutation = trpc.customer.create.useMutation({
  onError: (error) => {
    if (error.data?.code === 'UNAUTHORIZED') {
      // 重新導向登入頁
      window.location.href = getLoginUrl();
    } else if (error.data?.code === 'TOO_MANY_REQUESTS') {
      toast.error('操作過於頻繁，請稍後再試');
    } else {
      toast.error(error.message);
    }
  },
});
```

---

## 速率限制

為保護系統穩定性，API 實施以下速率限制：

| 類型 | 限制 | 說明 |
|------|------|------|
| 標準 API | 100 次/分鐘 | 一般讀寫操作 |
| 讀取 API | 500 次/分鐘 | 列表查詢等讀取操作 |
| 批次操作 | 10 次/分鐘 | 批次刪除、批次更新 |
| 匯出操作 | 10 次/小時 | 報表匯出、資料匯出 |
| 登入嘗試 | 5 次/15分鐘 | 登入失敗限制 |

超過限制時會回傳 `TOO_MANY_REQUESTS` 錯誤，並在 Response Header 中包含：

```
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705574400
Retry-After: 60
```

---

## 最佳實踐

### 1. 使用 Optimistic Updates

對於即時回饋的操作，建議使用 Optimistic Updates：

```typescript
const utils = trpc.useUtils();

const mutation = trpc.customer.update.useMutation({
  onMutate: async (newData) => {
    await utils.customer.getById.cancel({ id: newData.id });
    const previousData = utils.customer.getById.getData({ id: newData.id });
    utils.customer.getById.setData({ id: newData.id }, (old) => ({
      ...old!,
      ...newData,
    }));
    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.customer.getById.setData(
      { id: newData.id },
      context?.previousData
    );
  },
  onSettled: (data, error, variables) => {
    utils.customer.getById.invalidate({ id: variables.id });
  },
});
```

### 2. 處理載入狀態

```typescript
const { data, isLoading, error } = trpc.customer.list.useQuery({ page: 1 });

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <CustomerList customers={data.customers} />;
```

### 3. 批次操作確認

對於批次刪除等不可逆操作，務必加入確認對話框：

```typescript
const handleBatchDelete = async (ids: number[]) => {
  const confirmed = await confirmDialog({
    title: '確認刪除',
    message: `確定要刪除 ${ids.length} 筆資料嗎？此操作無法復原。`,
    variant: 'destructive',
  });
  
  if (confirmed) {
    await batchDeleteMutation.mutateAsync({ ids });
  }
};
```

---

*API 文檔 - YOChiLL 醫美診所 SaaS 平台 v2.0*
