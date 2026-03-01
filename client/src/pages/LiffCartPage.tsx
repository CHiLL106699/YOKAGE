import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useLiffContext } from '@/components/auth/LiffAuthProvider';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Trash2, ShoppingCart, Plus, Minus } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('yokage-cart');
      if (storedCart) setCartItems(JSON.parse(storedCart));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('yokage-cart', JSON.stringify(cartItems)); } catch { /* ignore */ }
  }, [cartItems]);

  const addToCart = (product: { id: string; name: string; price: number; image?: string | null }, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { ...product, quantity, image: product.image || undefined }];
    });
    toast.success(`${product.name} 已加入購物車`);
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
    toast.info('商品已移除');
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => { setCartItems([]); toast.info('購物車已清空'); };

  return { cartItems, addToCart, removeFromCart, updateQuantity, clearCart };
};

export default function LiffCartPage() {
  const { isReady } = useLiffContext();
  const [, navigate] = useLocation();
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const organizationId = 1;

  const { data: productsData, isLoading, error } = trpc.product.list.useQuery(
    { organizationId },
    { enabled: isReady }
  );

  const totalPrice = useMemo(() => cartItems.reduce((t, i) => t + i.price * i.quantity, 0), [cartItems]);

  if (!isReady || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 text-red-500">錯誤: {error.message}</div>;
  }

  const products = productsData?.items ?? productsData?.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-green-600 text-white text-center py-4 sticky top-0 z-10 shadow">
        <h1 className="text-lg font-bold">線上商城</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <h2 className="text-lg font-semibold">所有商品</h2>
        <div className="grid grid-cols-2 gap-3">
          {products.map((product: any) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <ShoppingCart className="text-gray-300" size={32} />
                )}
              </div>
              <div className="p-3">
                <div className="font-medium text-sm truncate">{product.name}</div>
                <div className="text-indigo-600 font-bold text-sm mt-1">${Number(product.price || 0).toLocaleString()}</div>
                <button
                  onClick={() => addToCart({ id: String(product.id), name: product.name, price: product.price, image: product.image })}
                  className="mt-2 w-full py-1.5 bg-indigo-500 text-white text-xs font-medium rounded-lg hover:bg-indigo-600 flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> 加入購物車
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart size={20} /> 我的購物車
          </h2>
          {cartItems.length === 0 ? (
            <p className="text-gray-400 text-center py-8">您的購物車是空的</p>
          ) : (
            <div className="space-y-3 mt-3">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-3 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <ShoppingCart size={16} className="text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{item.name}</div>
                    <div className="text-indigo-600 text-sm">${item.price.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center border rounded-full hover:bg-gray-100">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center border rounded-full hover:bg-gray-100">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">總金額</div>
            <div className="text-xl font-bold text-gray-800">${totalPrice.toLocaleString()}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={clearCart} disabled={cartItems.length === 0} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50">
              清空
            </button>
            <button
              onClick={() => { if (cartItems.length === 0) { toast.warning('購物車是空的'); return; } navigate('/liff/checkout'); }}
              disabled={cartItems.length === 0}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50"
            >
              前往結帳
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
