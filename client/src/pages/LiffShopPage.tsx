import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  ShoppingCart,
  Heart,
  Star,
  ChevronRight,
  Sparkles,
  Zap,
  Gift,
  Clock,
  Plus,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useStaffContext } from "@/hooks/useStaffContext";
import { PageLoadingSkeleton, PageError } from "@/components/ui/page-skeleton";

const categories = [
  { id: "all", name: "全部", icon: Sparkles },
  { id: "facial", name: "臉部療程", icon: Sparkles },
  { id: "body", name: "身體療程", icon: Zap },
  { id: "skincare", name: "保養品", icon: Gift },
  { id: "package", name: "療程套組", icon: Clock },
];

export default function LiffShopPage() {
  const { organizationId, staffId: customerId, isLoading: ctxLoading } = useStaffContext();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);

  const utils = trpc.useUtils();

  // Fetch products from API
  const productsQuery = trpc.product.list.useQuery(
    { organizationId, limit: 100 },
    { enabled: !ctxLoading }
  );

  // Fetch cart count
  const cartQuery = trpc.cart.list.useQuery(
    { organizationId, customerId },
    { enabled: !ctxLoading }
  );

  // Add to cart mutation
  const addToCartMut = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      toast.success("已加入購物車");
    },
    onError: (err) => {
      toast.error(`加入購物車失敗: ${err.message}`);
    },
  });

  if (ctxLoading || productsQuery.isLoading) {
    return <PageLoadingSkeleton message="載入商城..." />;
  }

  if (productsQuery.isError) {
    return <PageError message="無法載入商品" onRetry={() => productsQuery.refetch()} />;
  }

  const rawProducts = productsQuery.data;
  const allProducts: any[] = Array.isArray(rawProducts) ? rawProducts : (rawProducts as any)?.data ?? [];

  const filteredProducts = allProducts.filter((product: any) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = (product.name ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartItems: any[] = Array.isArray(cartQuery.data) ? cartQuery.data : [];
  const cartItemCount = cartItems.reduce((sum: number, item: any) => sum + (item.quantity ?? 1), 0);

  const addToCart = (product: any) => {
    addToCartMut.mutate({
      organizationId,
      customerId,
      productId: product.id,
      productName: product.name,
      productImage: product.image ?? product.imageUrl,
      price: Number(product.price ?? 0),
      originalPrice: Number(product.originalPrice ?? product.price ?? 0),
      quantity: 1,
    });
  };

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">YOChiLL 商城</h1>
            <Link href="/liff/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜尋療程或商品..."
              className="pl-10 bg-gray-100 border-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {/* Categories */}
        <div className="flex overflow-x-auto px-4 pb-3 gap-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setActiveCategory(category.id)}
            >
              <category.icon className="w-4 h-4 mr-1" />
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-5 h-5" />
            <span className="font-bold">新客專屬優惠</span>
          </div>
          <p className="text-sm opacity-90 mb-2">首次消費享 8 折優惠，再送術後保養組</p>
          <Button size="sm" variant="secondary">
            立即領取
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            精選商品
          </h2>
          <span className="text-sm text-gray-400">{filteredProducts.length} 件商品</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">找不到符合的商品</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {filteredProducts.map((product: any) => {
              const price = Number(product.price ?? 0);
              const originalPrice = Number(product.originalPrice ?? product.price ?? 0);
              const hasDiscount = originalPrice > price;

              return (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative">
                    <div className="aspect-square bg-gray-100">
                      {(product.image || product.imageUrl) ? (
                        <img
                          src={product.image ?? product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Sparkles className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <button
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(product.id);
                      }}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favorites.includes(product.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                    {hasDiscount && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        {Math.round((1 - price / originalPrice) * 100)}% OFF
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-xs text-gray-500 line-clamp-1 mb-2">{product.description}</p>
                    )}
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-red-500 font-bold">NT${price.toLocaleString()}</span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through ml-1">
                            ${originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Button
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => addToCart(product)}
                        disabled={addToCartMut.isPending}
                      >
                        {addToCartMut.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
