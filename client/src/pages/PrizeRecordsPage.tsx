import React from 'react';
import { PageTemplate } from '@/components/PageTemplate';
import { useQuery } from '@tanstack/react-query'; // 模擬 tRPC useQuery

// 模擬 tRPC 類型和 hook
interface PrizeRecord {
  id: string;
  prizeName: string;
  drawDate: string;
  status: '已領取' | '待領取' | '已過期';
}

// 模擬 tRPC hook
const trpc = {
  prize: {
    getRecords: {
      useQuery: () => {
        // 模擬 API 延遲
        const { data, isLoading, isError, error } = useQuery<PrizeRecord[], Error>({
          queryKey: ['prizeRecords'],
          queryFn: () => new Promise((resolve) => {
            setTimeout(() => {
              // 模擬成功返回數據
              resolve([
                { id: '1', prizeName: '尊爵限量禮包', drawDate: '2026-01-15', status: '已領取' },
                { id: '2', prizeName: '黃金 VIP 體驗卡', drawDate: '2026-01-20', status: '待領取' },
                { id: '3', prizeName: '深藍主題桌布', drawDate: '2026-01-25', status: '已過期' },
              ]);
              // 模擬錯誤: reject(new Error('無法載入中獎紀錄'));
            }, 1000);
          }),
          // 實際應用中應配置正確的 tRPC client
        });
        return { data, isLoading, isError, error };
      },
    },
  },
};

// 尊爵燙金深藍主題樣式
const themeStyles = {
  // 深色背景
  pageBg: 'bg-gray-900 min-h-screen',
  // 燙金淺色文字
  textPrimary: 'text-yellow-300',
  textSecondary: 'text-gray-400',
  // 卡片背景
  cardBg: 'bg-gray-800/70 border border-yellow-500/30',
  // 狀態顏色
  statusClaimed: 'text-green-400',
  statusPending: 'text-yellow-400',
  statusExpired: 'text-red-400',
};

const PrizeRecordsPage: React.FC = () => {
  // 4. 使用 trpc hooks 取得資料
  const { data: records, isLoading, isError, error } = trpc.prize.getRecords.useQuery();

  // 載入動畫 (由 PageTemplate 處理，但我們可以在這裡定義內容)
  const LoadingContent = (
    <div className="flex justify-center items-center h-64">
      <p className={`text-xl ${themeStyles.textPrimary}`}>
        <span className="animate-pulse">正在載入您的尊爵中獎紀錄...</span>
      </p>
    </div>
  );

  // 錯誤提示 (由 PageTemplate 處理，但我們可以在這裡定義內容)
  const ErrorContent = (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold text-red-500">資料載入失敗</h2>
      <p className={`mt-2 ${themeStyles.textSecondary}`}>
        {error?.message || '無法取得中獎紀錄，請稍後再試。'}
      </p>
    </div>
  );

  // 主要內容
  const MainContent = (
    <div className={`p-4 space-y-4 ${themeStyles.pageBg}`}>
      {records && records.length > 0 ? (
        records.map((record) => (
          <div key={record.id} className={`p-4 rounded-lg shadow-xl ${themeStyles.cardBg}`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-xl font-semibold ${themeStyles.textPrimary}`}>{record.prizeName}</h3>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  record.status === '已領取' ? themeStyles.statusClaimed :
                  record.status === '待領取' ? themeStyles.statusPending :
                  themeStyles.statusExpired
                }`}
              >
                {record.status}
              </span>
            </div>
            <p className={`mt-1 text-sm ${themeStyles.textSecondary}`}>
              抽獎日期: {record.drawDate}
            </p>
          </div>
        ))
      ) : (
        <div className="text-center p-8">
          <p className={`text-lg ${themeStyles.textSecondary}`}>您目前沒有任何中獲紀錄。</p>
        </div>
      )}
    </div>
  );

  return (
    // 1. 使用 PageTemplate 組件
    <PageTemplate
      title="中獎紀錄" // 3. 包含標題
      description="查看您的所有尊爵獎勵領取狀態與歷史紀錄。" // 3. 包含描述
      isLoading={isLoading} // 3. 載入動畫
      isError={isError} // 3. 錯誤提示
      loadingContent={LoadingContent}
      errorContent={ErrorContent}
      // 5. 應用尊爵燙金深藍主題
      className={themeStyles.pageBg}
      contentClassName="max-w-4xl mx-auto"
    >
      {MainContent}
    </PageTemplate>
  );
};

export default PrizeRecordsPage;
