
"use client";

import React from 'react';
import { trpc } from '@/lib/trpc';
import { useLiffContext } from '@/components/auth/LiffAuthProvider';
import { QueryLoading, QueryError } from '@/components/ui/query-state';
import { toast } from 'sonner';

const LiffShopPage = () => {
  const { user, loading, error: liffError, isAuthenticated } = useLiffContext();
  const organizationId = 1; // TODO: from context

  const { data: products, isLoading, error } = trpc.product.list.useQuery({
    organizationId,
  });

  if (loading || isLoading) {
    return <QueryLoading />;
  }

  if (liffError || error) {
    return <QueryError error={liffError || error} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">商品列表</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products?.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                <p className="text-gray-600 mt-1">${product.price}</p>
                <button 
                  className="mt-4 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
                  onClick={() => toast.success(`${product.name} 已加入購物車`)}
                >
                  加入購物車
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiffShopPage;
