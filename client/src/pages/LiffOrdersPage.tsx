
import React from 'react';
import { useLiffContext } from '@/components/auth/LiffAuthProvider';
import { trpc } from '@/lib/trpc';
import { QueryLoading, QueryError } from '@/components/ui/query-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const LiffOrdersPage: React.FC = () => {
  const { user, loading, error: liffError, isAuthenticated } = useLiffContext();
  const organizationId = 1; // TODO: from context

  const { data: orders, isLoading, error } = (trpc as any).order.list.useQuery({
    organizationId,
  });

  if (loading || isLoading) {
    return <QueryLoading />;
  }

  if (liffError || error) {
    return <QueryError error={liffError || error} />;
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">我的訂單</h1>
      <div className="space-y-4">
        {orders && orders.length > 0 ? (
          orders.map((order: any) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">訂單 #{order.id}</CardTitle>
                  <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <p>{item.productName}</p>
                      <p>${item.price}</p>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <p>總計</p>
                    <p>${order.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>沒有找到任何訂單。</p>
        )}
      </div>
    </div>
  );
};

export default LiffOrdersPage;
