import React from 'react';
import { PageTemplate } from '@/components/PageTemplate'; 
import { trpc } from '@/lib/trpc'; 

const IntelligentSchedulingPage: React.FC = () => {
  const { data, isLoading, error } = trpc.staff.list.useQuery();

  const pageTitle = "智能排程中心";
  const pageDescription = "透過 AI 演算法優化您的資源分配與時間表。所有敏感操作均在後端處理，確保資安。";

  return (
    <PageTemplate
      title={pageTitle}
      description={pageDescription}
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-300"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <h3 className="text-red-300 font-semibold">
              資料載入錯誤
            </h3>
          </div>
        )}

        {!isLoading && !error && data && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <pre className="text-amber-300 text-sm overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 text-center">
              <p className="text-amber-300">
                智能排程操作介面 (待實作)
              </p>
            </div>
          </div>
        )}
        
        {!isLoading && !error && !data && (
          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <p className="text-amber-300">
              尚未取得排程資料
            </p>
          </div>
        )}
      </div>
    </PageTemplate>
  );
};

export default IntelligentSchedulingPage;
