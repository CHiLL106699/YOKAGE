
import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Plus, MoreVertical, Search, ChevronDown, ChevronsUpDown, Award, Ticket, Gem, Star, Trophy } from 'lucide-react';

// --- MOCK DATA & TYPES ---
type Prize = {
  id: string;
  tier: string;
  name: string;
  quantity: number;
  probability: number;
  cost: number;
  image: string;
};

type SlotSymbol = {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  rarity: 'common' | 'uncommon' | 'rare';
};

type Payout = {
  id: string;
  combination: string[];
  payout: string;
};

type Campaign = {
  id: string;
  name: string;
  participants: number;
  redemptionRate: number;
  isActive: boolean;
};

const mockPrizes: Prize[] = [
  { id: 'A', tier: 'A賞', name: '高級無線耳機', quantity: 10, probability: 1, cost: 5000, image: '/placeholder.svg' },
  { id: 'B', tier: 'B賞', name: '品牌保溫瓶', quantity: 50, probability: 5, cost: 1000, image: '/placeholder.svg' },
  { id: 'C', tier: 'C賞', name: 'YOChiLL 點數 500點', quantity: 200, probability: 15, cost: 500, image: '/placeholder.svg' },
  { id: 'D', tier: 'D賞', name: 'YOChiLL 點數 100點', quantity: 500, probability: 30, cost: 100, image: '/placeholder.svg' },
  { id: 'E', tier: 'E賞', name: 'YOChiLL 點數 10點', quantity: 1000, probability: 49, cost: 10, image: '/placeholder.svg' },
];

const mockSlotSymbols: SlotSymbol[] = [
  { id: 's1', name: 'YOChiLL Logo', icon: Gem, rarity: 'rare' },
  { id: 's2', name: 'Trophy', icon: Trophy, rarity: 'uncommon' },
  { id: 's3', name: 'Star', icon: Star, rarity: 'common' },
  { id: 's4', name: 'Award', icon: Award, rarity: 'common' },
];

const mockPayouts: Payout[] = [
  { id: 'p1', combination: ['YOChiLL Logo', 'YOChiLL Logo', 'YOChiLL Logo'], payout: '免費療程一次' },
  { id: 'p2', combination: ['Trophy', 'Trophy', 'Trophy'], payout: 'YOChiLL 點數 1000點' },
  { id: 'p3', combination: ['Star', 'Star', 'Star'], payout: 'YOChiLL 點數 100點' },
  { id: 'p4', combination: ['Award', 'Award', 'Award'], payout: 'YOChiLL 點數 50點' },
];

const mockCampaigns: Campaign[] = [
  { id: 'camp1', name: '夏季一番賞挑戰', participants: 876, redemptionRate: 62, isActive: true },
  { id: 'camp2', name: '新年開運拉霸機', participants: 1203, redemptionRate: 33, isActive: false },
  { id: 'camp3', name: '春季新品一番賞', participants: 451, redemptionRate: 78, isActive: true },
];

// --- HELPER COMPONENTS ---
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg ${className}`}>{children}</div>
);

const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>
);

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const Button = ({ children, className, variant = 'primary', ...props }: { children: React.ReactNode; className?: string; variant?: 'primary' | 'secondary' | 'ghost'; onClick?: () => void; [key: string]: any }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700',
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  // This is a mock layout. In a real app, this would be a shared component.
  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4 hidden md:block">
        <div className="flex items-center mb-8">
            <Gem className="h-8 w-8 text-indigo-500" />
            <h1 className="text-2xl font-bold ml-2 bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">YOChiLL</h1>
        </div>
        <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center p-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                Dashboard
            </Link>
            <Link href="/dashboard/gamification" className="flex items-center p-2 text-gray-900 dark:text-gray-50 bg-gray-100 dark:bg-gray-700 rounded-lg">
                Gamification
            </Link>
             <Link href="/dashboard/settings" className="flex items-center p-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                Settings
            </Link>
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

// --- MAIN COMPONENT ---
const StatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: React.FC<{ className?: string }> }) => (
  <Card>
    <CardContent className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
        <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      </div>
    </CardContent>
  </Card>
);

const PrizeEditModal = ({ prize, isOpen, onClose }: { prize: Prize | null; isOpen: boolean; onClose: () => void }) => {
    if (!isOpen || !prize) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Prize: {prize.tier}</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">品名 (Name)</label>
                        <input type="text" defaultValue={prize.name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">數量 (Quantity)</label>
                        <input type="number" defaultValue={prize.quantity} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">機率 (Probability %)</label>
                        <input type="number" defaultValue={prize.probability} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm" />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button onClick={onClose}>Save Changes</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const CampaignWizard = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Campaign Wizard</h2>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">Campaign creation wizard placeholder. This would be a multi-step form to configure a new lottery or slot machine campaign.</p>
                    <div className="flex justify-end mt-6">
                         <Button variant="secondary" onClick={onClose}>Close</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const GamificationDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'ichiban' | 'slots'>('ichiban');
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);

  const handleEditPrize = (prize: Prize) => {
    setSelectedPrize(prize);
    setIsPrizeModalOpen(true);
  };

  if (isLoading) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout><div>Error: {error}</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gamification Marketing</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Engage your customers with lotteries and slot machines.</p>
            </div>
                        <Button onClick={() => setIsWizardOpen(true)} className="mt-4 md:mt-0 px-4 py-2">
                <Plus className="mr-2 h-4 w-4" /> Create New Campaign
            </Button>
        </header>

                {/* --- Stats --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="總參與次數" value="1,234" icon={Ticket} />
            <StatCard title="兌獎率" value="45%" icon={Award} />
            <StatCard title="帶動消費" value="NT$890,000" icon={Star} />
        </div>

        {/* --- Main Content --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3 space-y-8">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('ichiban')}
                            className={`${activeTab === 'ichiban' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            一番賞設定 (Lottery)
                        </button>
                        <button
                            onClick={() => setActiveTab('slots')}
                            className={`${activeTab === 'slots' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            拉霸機設定 (Slot Machine)
                        </button>
                    </nav>
                </div>

                {activeTab === 'ichiban' && (
                    <section id="ichiban-kuji">
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">一番賞獎品設定</h2>
                            </CardHeader>
                            <CardContent>
                                
<div className="space-y-8">
    {/* Prize Settings Table */}
    <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                    <thead>
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-0">賞 (Tier)</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">品名 (Name)</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">數量 (Qty)</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">機率 (Prob. %)</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">成本 (Cost)</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                <span className="sr-only">Edit</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {mockPrizes.map((prize) => (
                            <tr key={prize.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-0">{prize.tier}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <img className="h-10 w-10 rounded-full object-cover" src={prize.image} alt={prize.name} />
                                        </div>
                                        <div className="ml-4">{prize.name}</div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{prize.quantity}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{prize.probability}%</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">NT${prize.cost.toLocaleString()}</td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                    <Button onClick={() => handleEditPrize(prize)} variant="ghost" className="px-2 py-1"><MoreVertical className="h-4 w-4" /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    {/* Active Campaigns List */}
    <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Active Campaigns</h3>
        <ul role="list" className="mt-4 divide-y divide-gray-200 dark:divide-gray-700 border-t border-b border-gray-200 dark:border-gray-700">
            {mockCampaigns.filter(c => c.isActive).map((campaign) => (
                <li key={campaign.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center">
                        <Ticket className="h-5 w-5 text-green-500" />
                        <p className="ml-3 text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Participants: {campaign.participants}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Redemption: {campaign.redemptionRate}%</div>
                        <Button variant="secondary" className="px-3 py-1 text-xs">View Details</Button>
                    </div>
                </li>
            ))}
        </ul>
    </div>
</div>

                            </CardContent>
                        </Card>
                    </section>
                )}

                {activeTab === 'slots' && (
                    <section id="slot-machine">
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">拉霸機設定</h2>
                            </CardHeader>
                            <CardContent>
                                
<div className="space-y-8">
    {/* Symbol Configuration */}
    <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Symbol Configuration</h3>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockSlotSymbols.map(symbol => (
                <div key={symbol.id} className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <symbol.icon className="h-10 w-10 text-indigo-500" />
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{symbol.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{symbol.rarity}</p>
                </div>
            ))}
        </div>
    </div>

    {/* Payout Table */}
    <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Payout Table</h3>
        <div className="mt-4 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                        <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-0">Combination</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Payout</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {mockPayouts.map((payout) => (
                                <tr key={payout.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-0">
                                        <div className="flex items-center space-x-2">
                                            {payout.combination.map((symbolName, index) => {
                                                const symbol = mockSlotSymbols.find(s => s.name === symbolName);
                                                return symbol ? <symbol.icon key={index} className="h-6 w-6 text-gray-500" /> : null;
                                            })}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{payout.payout}</td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                        <Button variant="ghost" className="px-2 py-1"><MoreVertical className="h-4 w-4" /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    {/* Daily Play Limit */}
    <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Daily Play Limit</h3>
        <div className="mt-2 max-w-xs">
            <label htmlFor="daily-limit" className="sr-only">Daily Play Limit</label>
            <input
                type="number"
                name="daily-limit"
                id="daily-limit"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                placeholder="e.g., 5"
                defaultValue={3}
            />
        </div>
    </div>
</div>

                            </CardContent>
                        </Card>
                    </section>
                )}
            </div>
        </div>
      </div>
      <PrizeEditModal prize={selectedPrize} isOpen={isPrizeModalOpen} onClose={() => setIsPrizeModalOpen(false)} />
      <CampaignWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </DashboardLayout>
  );
};

export default GamificationDashboard;
