import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Minus
} from "lucide-react";
import { Link } from "wouter";

// 模擬商品分類
const categories = [
  { id: "all", name: "全部", icon: Sparkles },
  { id: "facial", name: "臉部療程", icon: Sparkles },
  { id: "body", name: "身體療程", icon: Zap },
  { id: "skincare", name: "保養品", icon: Gift },
  { id: "package", name: "療程套組", icon: Clock },
];

// 模擬商品資料
const mockProducts = [
  {
    id: "prod-001",
    name: "玻尿酸填充療程",
    category: "facial",
    price: 15000,
    originalPrice: 18000,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400",
    rating: 4.9,
    reviews: 128,
    sold: 356,
    tags: ["熱銷", "限時優惠"],
    description: "採用進口玻尿酸，自然填充、效果持久"
  },
  {
    id: "prod-002",
    name: "肉毒桿菌除皺",
    category: "facial",
    price: 8000,
    originalPrice: 10000,
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400",
    rating: 4.8,
    reviews: 96,
    sold: 289,
    tags: ["人氣推薦"],
    description: "有效撫平動態紋路，恢復年輕肌膚"
  },
  {
    id: "prod-003",
    name: "皮秒雷射淨膚",
    category: "facial",
    price: 6000,
    originalPrice: 8000,
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400",
    rating: 4.7,
    reviews: 215,
    sold: 523,
    tags: ["熱銷"],
    description: "淡化斑點、縮小毛孔、改善膚質"
  },
  {
    id: "prod-004",
    name: "體雕塑身療程",
    category: "body",
    price: 25000,
    originalPrice: 30000,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
    rating: 4.6,
    reviews: 67,
    sold: 145,
    tags: ["新品上市"],
    description: "非侵入式體雕，輕鬆雕塑完美曲線"
  },
  {
    id: "prod-005",
    name: "美白導入精華",
    category: "skincare",
    price: 2500,
    originalPrice: 3000,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
    rating: 4.9,
    reviews: 342,
    sold: 1256,
    tags: ["熱銷", "回購率高"],
    description: "醫美級美白精華，深層淡斑提亮"
  },
  {
    id: "prod-006",
    name: "術後修護組合",
    category: "skincare",
    price: 3500,
    originalPrice: 4200,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    rating: 4.8,
    reviews: 189,
    sold: 678,
    tags: ["必備"],
    description: "術後專用修護組，加速恢復"
  },
  {
    id: "prod-007",
    name: "年度美肌套組",
    category: "package",
    price: 88000,
    originalPrice: 120000,
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400",
    rating: 5.0,
    reviews: 45,
    sold: 89,
    tags: ["超值", "限量"],
    description: "包含12次療程，全年美肌計畫"
  },
  {
    id: "prod-008",
    name: "新客體驗套組",
    category: "package",
    price: 9999,
    originalPrice: 15000,
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400",
    rating: 4.9,
    reviews: 567,
    sold: 2345,
    tags: ["新客專屬", "超值"],
    description: "首次體驗專屬優惠，含3項熱門療程"
  }
];

// 模擬購物車
interface CartItem {
  productId: string;
  quantity: number;
}

export default function LiffShopPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => {
    const product = mockProducts.find(p => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
    toast.success("已加入購物車");
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
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
          {categories.map(category => (
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

      {/* Hot Products */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            熱銷推薦
          </h2>
          <Button variant="ghost" size="sm" className="text-primary">
            查看更多 <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
          {mockProducts.filter(p => p.tags.includes("熱銷")).slice(0, 4).map(product => (
            <Card key={product.id} className="min-w-[160px] overflow-hidden">
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-[120px] object-cover"
                />
                <button 
                  className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full"
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Heart 
                    className={`w-4 h-4 ${favorites.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} 
                  />
                </button>
                {product.tags[0] && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-xs">
                    {product.tags[0]}
                  </Badge>
                )}
              </div>
              <CardContent className="p-2">
                <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-1 my-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600">{product.rating}</span>
                  <span className="text-xs text-gray-400">({product.reviews})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-red-500 font-bold">NT${product.price.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through ml-1">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 py-2">
        <h2 className="font-bold text-lg mb-3">
          {activeCategory === "all" ? "全部商品" : categories.find(c => c.id === activeCategory)?.name}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map(product => (
            <Link key={product.id} href={`/liff/shop/product/${product.id}`}>
              <Card className="overflow-hidden">
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-[140px] object-cover"
                  />
                  <button 
                    className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(product.id);
                    }}
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} 
                    />
                  </button>
                  {product.tags[0] && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-xs">
                      {product.tags[0]}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 h-10">{product.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-1">{product.description}</p>
                  <div className="flex items-center gap-1 my-2">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{product.rating}</span>
                    <span className="text-xs text-gray-400">| 已售 {product.sold}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-red-500 font-bold">NT${product.price.toLocaleString()}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-gray-400 line-through ml-1">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product.id);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Cart Summary Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">合計</p>
                <p className="font-bold text-lg text-red-500">NT${cartTotal.toLocaleString()}</p>
              </div>
            </div>
            <Link href="/liff/cart">
              <Button className="px-8">
                去結帳
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
