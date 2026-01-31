import React from 'react';
// 假設 PageTemplate 位於正確的路徑
import PageTemplate from '@/components/PageTemplate'; 
// 假設 trpc 已經配置好，並有一個 intelligentScheduling.getData 的 procedure
import { trpc } from '@/utils/trpc'; 

/**
 * IntelligentSchedulingPage 組件
 * 負責顯示智能排程中心的介面。
 * 遵循尊爵燙金深藍主題。
 */
const IntelligentSchedulingPage: React.FC = () => {
  // 透過 trpc hook 取得資料
  // 這裡假設 trpc.intelligentScheduling.getData 是一個已經定義的查詢
  const { data, isLoading, error } = trpc.intelligentScheduling.getData.useQuery();

  const pageTitle = "智能排程中心";
  const pageDescription = "透過 AI 演算法優化您的資源分配與時間表。所有敏感操作均在後端處理，確保資安。";

  return (
    <PageTemplate
      title={pageTitle}
      description={pageDescription}
      // 尊爵燙金深藍主題樣式
      // bg-gray-900 提供深色背景
      // text-amber-300 提供燙金淺色文字
      className="bg-gray-900 text-amber-300 min-h-screen p-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* 載入動畫 */}
        {isLoading && (
          <div className="flex flex-col justify-center items-center h-64">
            {/* 燙金色的載入動畫 */}
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-400"></div>
            <p className="mt-4 text-xl font-semibold text-amber-300">正在進行智能排程運算...</p>
          </div>
        )}

        {/* 錯誤提示功能 */}
        {error && (
          <div className="p-6 bg-red-900/70 border border-red-600 text-red-300 rounded-xl shadow-2xl transition duration-300 hover:shadow-red-500/50">
            <h3 className="text-2xl font-bold mb-2 text-red-200">
              <span role="img" aria-label="error">⚠️</span> 資料載入錯誤
            </h3>
            <p className="text-lg">無法取得排程資料，請檢查後端服務狀態。</p>
            <p className="text-sm mt-3 font-mono break-all">錯誤詳情：{error.message}</p>
            <p className="text-sm mt-2 text-red-400">請聯繫技術支援，並提供上述錯誤詳情。</p>
          </div>
        )}

        {/* 頁面主要內容 - 資料顯示區 */}
        {!isLoading && !error && data && (
          <div className="mt-8 p-8 bg-gray-800/90 rounded-2xl shadow-3xl border border-amber-500/50 transition duration-300 hover:border-amber-400">
            <h2 className="text-3xl font-extrabold mb-6 text-amber-200 border-b border-amber-500/50 pb-2">排程結果與操作面板</h2>
            
            <p className="text-lg mb-4 text-gray-300">以下是智能排程系統為您計算出的最佳方案概覽：</p>

            {/* 顯示 trpc 取得的資料 */}
            <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto font-mono text-sm text-green-400">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>

            {/* 實際的排程操作介面將在此處實作 */}
            <div className="mt-8 text-center p-4 border-t border-amber-500/30">
              <p className="text-xl font-bold text-amber-400">
                <span role="img" aria-label="schedule">🗓️</span> 智能排程操作介面 (待實作)
              </p>
              <p className="text-sm text-gray-400 mt-2">此處將包含排程視覺化、調整與確認等功能。</p>
            </div>
          </div>
        )}
        
        {/* 預設內容，當沒有資料時顯示 */}
        {!isLoading && !error && !data && (
            <div className="mt-8 p-8 bg-gray-800/90 rounded-2xl shadow-3xl border border-blue-500/50 text-center">
                <p className="text-xl font-bold text-blue-300">
                    <span role="img" aria-label="info">ℹ️</span> 尚未取得排程資料
                </p>
                <p className="text-md text-gray-400 mt-2">請確認後端服務是否已啟動並配置 Intelligent Scheduling API。</p>
            </div>
        )}
      </div>
    </PageTemplate>
  );
};

export default IntelligentSchedulingPage;
