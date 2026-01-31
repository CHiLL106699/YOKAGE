import React, { useState } from 'react';
import { PageTemplate } from '@/components/PageTemplate';

// 假設 trpc 實例和 hook 已經定義
// 實際專案中，這裡會是從 trpc 客戶端匯入
// 這裡使用一個模擬的 trpc hook 結構
const trpc = {
  commission: {
    getAllocationData: {
      useQuery: (input: { year: number }) => {
        // 模擬 trpc 數據獲取
        const [data, setData] = useState<any[] | undefined>(undefined);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<Error | null>(null);

        React.useEffect(() => {
          // 模擬 API 延遲
          const timer = setTimeout(() => {
            if (input.year === 2025) {
              setData([
                { id: 1, agent: 'Agent A', commission: 15000, allocated: 12000, date: '2025-01-01' },
                { id: 2, agent: 'Agent B', commission: 22000, allocated: 22000, date: '2025-01-05' },
                { id: 3, agent: 'Agent C', commission: 8000, allocated: 0, date: '2025-01-10' },
              ]);
              setIsLoading(false);
            } else if (input.year === 2024) {
              setError(new Error('2024 年數據獲取失敗，請稍後再試。'));
              setIsLoading(false);
            } else {
              setData([]);
              setIsLoading(false);
            }
          }, 1500);
          return () => clearTimeout(timer);
        }, [input.year]);

        return { data, isLoading, error };
      },
    },
  },
};

// 樣式定義：符合「尊爵燙金深藍主題」
const themeStyles = {
  container: {
    backgroundColor: '#000033', // 深藍色背景
    color: '#FFD700', // 燙金淺色文字
    minHeight: '100vh',
    padding: '20px',
  },
  title: {
    color: '#FFD700',
    borderBottom: '2px solid #FFD700',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  description: {
    color: '#ADD8E6', // 淺藍色用於描述文字
    marginBottom: '30px',
  },
  loading: {
    color: '#FFD700',
    fontSize: '1.5em',
    textAlign: 'center' as const,
  },
  error: {
    color: '#FF6347', // 番茄紅用於錯誤提示
    backgroundColor: '#330000',
    padding: '15px',
    borderRadius: '5px',
  },
  tableHeader: {
    color: '#FFD700',
    backgroundColor: '#000055',
    padding: '10px',
    borderBottom: '1px solid #FFD700',
  },
  tableRow: {
    color: '#FFFFFF',
    padding: '10px',
    borderBottom: '1px solid #000055',
  }
};

const CommissionAllocationPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const { data, isLoading, error } = trpc.commission.getAllocationData.useQuery({ year: selectedYear });

  const title = '佣金分配概覽 (Commission Allocation Overview)';
  const description = '此頁面顯示各代理人的佣金總額與已分配金額。數據透過 trpc hook 實時獲取。';

  const renderContent = () => {
    if (isLoading) {
      return <div style={themeStyles.loading}>載入中... 請稍候 (Loading data...)</div>;
    }

    if (error) {
      return (
        <div style={themeStyles.error}>
          <strong>錯誤提示:</strong> 無法載入數據。
          <p>{error.message}</p>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return <div style={{ ...themeStyles.description, textAlign: 'center' }}>目前沒有 {selectedYear} 年的佣金分配數據。</div>;
    }

    return (
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={themeStyles.tableHeader}>ID</th>
              <th style={themeStyles.tableHeader}>代理人</th>
              <th style={themeStyles.tableHeader}>佣金總額</th>
              <th style={themeStyles.tableHeader}>已分配金額</th>
              <th style={themeStyles.tableHeader}>日期</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} style={themeStyles.tableRow}>
                <td style={{ padding: '10px' }}>{item.id}</td>
                <td style={{ padding: '10px' }}>{item.agent}</td>
                <td style={{ padding: '10px' }}>${item.commission.toLocaleString()}</td>
                <td style={{ padding: '10px' }}>${item.allocated.toLocaleString()}</td>
                <td style={{ padding: '10px' }}>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={themeStyles.container}>
      <PageTemplate
        title={title}
        description={description}
      >
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="year-select" style={{ color: themeStyles.title.color, marginRight: '10px' }}>選擇年份:</label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{
              backgroundColor: '#000055',
              color: '#FFD700',
              border: '1px solid #FFD700',
              padding: '5px',
            }}
          >
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
        </div>
        {renderContent()}
      </PageTemplate>
    </div>
  );
};

export default CommissionAllocationPage;
