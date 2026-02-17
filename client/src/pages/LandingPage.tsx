
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Clock, Calendar, Users, Bot, BarChart, MessageSquare, ShieldCheck, ChevronDown, Menu, X } from 'lucide-react';

// --- TYPES --- //
interface Testimonial {
  quote: string;
  name: string;
  clinic: string;
}

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  features: string[];
  isRecommended: boolean;
}

interface FaqItem {
  question: string;
  answer: string;
}

// --- MOCK DATA --- //
const testimonials: Testimonial[] = [
  { quote: 'YOChiLL 徹底改變了我們的營運方式，預約管理從未如此輕鬆。', name: '陳醫師', clinic: '亮采美學診所' },
  { quote: 'AI 對話機器人讓我們能 24/7 回應客戶，客戶滿意度大幅提升。', name: '王經理', clinic: '非凡尚水診所' },
  { quote: '數據儀表板一目了然，幫助我們做出更精準的商業決策。', name: '林院長', clinic: '光采整形外科' },
];

const coreFeatures: Feature[] = [
  { icon: Clock, title: '智慧打卡', description: 'GPS/IP 驗證，確保出勤真實性' },
  { icon: Calendar, title: '排班管理', description: '彈性排班，自動計算工時與加班費' },
  { icon: Users, title: 'CRM 客戶關係', description: '完整客戶標籤與療程記錄' },
  { icon: Bot, title: 'AI 對話', description: '自動回覆常見問題，引導預約' },
  { icon: BarChart, title: 'BI 儀表板', description: '營運數據視覺化，洞察業績趨勢' },
  { icon: MessageSquare, title: 'LINE 行銷引擎', description: '分眾訊息推播，提升客戶回訪率' },
];

const pricingPlans: Plan[] = [
  {
    name: '核心版',
    price: '2,990',
    period: '/月',
    features: ['5 位員工帳號', '智慧打卡', '排班管理', 'CRM 客戶關係', 'LINE 官方帳號串接'],
    isRecommended: false,
  },
  {
    name: '專業版',
    price: '7,990',
    period: '/月',
    features: ['無上限員工帳號', '含核心版所有功能', 'AI 對話機器人', 'BI 數據儀表板', 'LINE 行銷引擎', '優先技術支援'],
    isRecommended: true,
  },
];

const faqItems: FaqItem[] = [
  { question: 'YOChiLL 適合哪種規模的診所？', answer: 'YOChiLL 的模組化設計適用於從個人工作室到大型連鎖診所的各種規模。您可以根據需求選擇核心版或專業版，並隨時擴充功能。' },
  { question: '導入 YOChiLL 需要多久時間？', answer: '我們的導入流程非常迅速。在資料準備齊全的情況下，通常 3-5 個工作天即可完成系統設定與員工教學，讓您無痛轉換。' },
  { question: '我的資料是否安全？', answer: '絕對安全。我們採用銀行等級的 RLS (Row-Level Security) 資料隔離技術，並全程使用 SSL 加密傳輸。同時，我們的基礎設施符合 SOC2 和 HIPAA 規範。' },
  { question: '是否支援現有的 LINE 官方帳號？', answer: '是的，YOChiLL 可以與您現有的 LINE 官方帳號無縫整合，保留您所有的好友和歷史記錄，並在此基礎上提供更強大的行銷與客服功能。' },
  { question: '如果我需要客製化功能怎麼辦？', answer: '除了標準方案，我們也提供企業級的客製化開發服務。我們的顧問團隊將與您深入溝通，打造最符合您營運流程的專屬解決方案。' },
  { question: '有提供試用嗎？', answer: '當然！我們提供 14 天的全功能免費試用，無需綁定信用卡。讓您在無壓力的情況下，親身體驗 YOChiLL 帶來的便利與強大。' },
];

// --- SUB-COMPONENTS --- //

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [
    { name: '功能', href: '#features' },
    { name: '價格', href: '#pricing' },
    { name: '安全', href: '#security' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/">
              <a className="text-2xl font-bold text-white">
                YO<span className="text-indigo-400">ChiLL</span>
              </a>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {link.name}
                </a>
              ))}
              <Link href="/login">
                <a className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  租戶登入
                </a>
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors">
                {link.name}
              </a>
            ))}
            <Link href="/login">
              <a className="bg-indigo-500 hover:bg-indigo-600 text-white block px-3 py-2 rounded-md text-base font-medium transition-colors">
                租戶登入
              </a>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

const Hero = () => (
  <section className="py-20 md:py-32 bg-gray-900 text-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-500">
        讓診所管理簡單而強大
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
        專為醫美診所打造的 All-in-One SaaS 平台，整合排班、客戶關係、LINE 行銷與數據分析，釋放您的營運潛力。
      </p>
      <div className="mt-8 flex justify-center space-x-4">
        <Link href="/trial">
          <a className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105">
            免費試用 14 天
          </a>
        </Link>
        <Link href="/login">
          <a className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105">
            租戶登入
          </a>
        </Link>
      </div>
    </div>
  </section>
);

const SocialProof = () => (
  <section className="py-16 bg-gray-800">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div className="p-4">
          <p className="text-4xl font-bold text-indigo-400">500+</p>
          <p className="mt-2 text-gray-300">合作診所</p>
        </div>
        <div className="p-4">
          <p className="text-4xl font-bold text-indigo-400">50,000+</p>
          <p className="mt-2 text-gray-300">管理客戶</p>
        </div>
        <div className="p-4">
          <p className="text-4xl font-bold text-indigo-400">99.9%</p>
          <p className="mt-2 text-gray-300">系統可用性</p>
        </div>
        <div className="p-4">
          <p className="text-4xl font-bold text-indigo-400">40%</p>
          <p className="mt-2 text-gray-300">行政效率提升</p>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-gray-900 p-6 rounded-lg">
            <p className="text-gray-300">"{testimonial.quote}"</p>
            <div className="mt-4 text-right">
              <p className="font-semibold text-white">- {testimonial.name}</p>
              <p className="text-sm text-indigo-400">{testimonial.clinic}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const PainPoints = () => (
  <section className="py-20 bg-gray-900">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white">還在為這些問題煩惱嗎？</h2>
        <p className="mt-4 text-lg text-gray-400">傳統的管理方式，正在消耗您的寶貴時間與資源。</p>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-800 p-8 rounded-lg">
          <h3 className="text-xl font-bold text-white">手動排班混亂</h3>
          <p className="mt-2 text-gray-400">人員調動、請假、加班計算複雜，耗費大量人力且容易出錯。</p>
        </div>
        <div className="bg-gray-800 p-8 rounded-lg">
          <h3 className="text-xl font-bold text-white">客戶流失無感</h3>
          <p className="mt-2 text-gray-400">缺乏系統化追蹤，無法即時掌握客戶回訪週期，錯失再行銷良機。</p>
        </div>
        <div className="bg-gray-800 p-8 rounded-lg">
          <h3 className="text-xl font-bold text-white">營運數據斷裂</h3>
          <p className="mt-2 text-gray-400">財務、客戶、療程數據分散，難以整合分析，無法作為決策依據。</p>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => (
  <section id="features" className="py-20 bg-gray-800">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white">六大核心功能，一個平台搞定</h2>
        <p className="mt-4 text-lg text-gray-400">從內部管理到外部行銷，YOChiLL 為您提供全方位解決方案。</p>
      </div>
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {coreFeatures.map((feature, index) => (
          <div key={index} className="bg-gray-900 p-6 rounded-lg flex items-start space-x-4">
            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-indigo-500">
              <feature.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">{feature.title}</h3>
              <p className="mt-1 text-gray-400">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Pricing = () => (
  <section id="pricing" className="py-20 bg-gray-900">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white">靈活定價，隨需成長</h2>
        <p className="mt-4 text-lg text-gray-400">選擇最適合您的方案，今天就開始數位轉型。</p>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <div key={index} className={`border-2 rounded-lg p-8 flex flex-col ${plan.isRecommended ? 'border-indigo-500' : 'border-gray-700'}`}>
            {plan.isRecommended && (
              <div className="text-center mb-4">
                <span className="bg-indigo-500 text-white text-sm font-bold px-3 py-1 rounded-full">最多診所選擇</span>
              </div>
            )}
            <h3 className="text-2xl font-bold text-white text-center">{plan.name}</h3>
            <div className="mt-4 text-center">
              <span className="text-4xl font-extrabold text-white">NT${plan.price}</span>
              <span className="text-gray-400">{plan.period}</span>
            </div>
            <ul className="mt-6 space-y-4 text-gray-300">
              {plan.features.map((feature, fIndex) => (
                <li key={fIndex} className="flex items-start">
                  <ShieldCheck className="h-6 w-6 text-green-400 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <a href="#" className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md ${plan.isRecommended ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                選擇方案
              </a>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center text-gray-400">
        <p>需要更多功能？我們提供<span className="text-indigo-400">「營運儀表板」、「進銷庫存」、「會計總帳」</span>等附加模組，歡迎洽詢。</p>
      </div>
    </div>
  </section>
);

const Security = () => (
  <section id="security" className="py-20 bg-gray-800">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white">企業級安全防護</h2>
        <p className="mt-4 text-lg text-gray-400">您的資料安全是我們的第一優先。</p>
      </div>
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="text-center">
          <ShieldCheck className="h-12 w-12 mx-auto text-indigo-400" />
          <h3 className="mt-4 text-lg font-medium text-white">RLS 資料隔離</h3>
          <p className="mt-2 text-gray-400">採用 Supabase Row-Level Security，確保租戶間資料完全隔離。</p>
        </div>
        <div className="text-center">
          <ShieldCheck className="h-12 w-12 mx-auto text-indigo-400" />
          <h3 className="mt-4 text-lg font-medium text-white">全程加密傳輸</h3>
          <p className="mt-2 text-gray-400">所有數據在傳輸過程中均使用 SSL/TLS 進行加密。</p>
        </div>
        <div className="text-center">
          <ShieldCheck className="h-12 w-12 mx-auto text-indigo-400" />
          <h3 className="mt-4 text-lg font-medium text-white">SOC2 規範</h3>
          <p className="mt-2 text-gray-400">基礎設施符合 SOC2 標準，保障服務的安全性與可用性。</p>
        </div>
        <div className="text-center">
          <ShieldCheck className="h-12 w-12 mx-auto text-indigo-400" />
          <h3 className="mt-4 text-lg font-medium text-white">HIPAA 合規</h3>
          <p className="mt-2 text-gray-400">符合美國健康保險流通與責任法案的嚴格要求。</p>
        </div>
      </div>
    </div>
  </section>
);

const FaqAccordionItem = ({ item, isOpen, onClick }: { item: FaqItem; isOpen: boolean; onClick: () => void; }) => (
  <div className="border-b border-gray-700">
    <button onClick={onClick} className="w-full flex justify-between items-center py-5 text-left text-lg font-medium text-white">
      <span>{item.question}</span>
      <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
      <div className="pb-5 pr-4 text-gray-300">
        {item.answer}
      </div>
    </div>
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">常見問題</h2>
        </div>
        <div className="mt-12">
          {faqItems.map((item, index) => (
            <FaqAccordionItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-gray-800">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center">
        <p className="text-gray-400">&copy; {new Date().getFullYear()} YOChiLL. All rights reserved.</p>
        <div className="flex space-x-4">
          <a href="#" className="text-gray-400 hover:text-white">隱私權政策</a>
          <a href="#" className="text-gray-400 hover:text-white">服務條款</a>
        </div>
      </div>
    </div>
  </footer>
);

// --- MAIN COMPONENT --- //

const LandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      try {
        // In a real app, you would fetch data here.
        // If successful:
        setLoading(false);
      } catch (e) {
        // If fetching fails:
        setError('無法載入頁面資料，請稍後再試。');
        setLoading(false);
      }
    }, 1000); // Simulate 1 second loading time

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900">
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <PainPoints />
        <Features />
        <Pricing />
        <Security />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
