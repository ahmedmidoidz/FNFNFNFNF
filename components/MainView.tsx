import React, { Suspense, lazy, useEffect, ErrorInfo } from 'react';
import { AppView, Transaction, Budget, Account, SavingsGoal, Debt, AppSettings, Subscription, Djam3ia, ShopItem } from '../types';
import { useLanguage } from './LanguageContext';

const Dashboard = lazy(() => import('./Dashboard'));
const TransactionsView = lazy(() => import('./TransactionsView'));
const Budgets = lazy(() => import('./Budgets'));
const Analytics = lazy(() => import('./Analytics'));
const Accounts = lazy(() => import('./Accounts'));
const Settings = lazy(() => import('./Settings'));
const Receipts = lazy(() => import('./Receipts'));
const Reports = lazy(() => import('./Reports'));
const Rewards = lazy(() => import('./Rewards'));
const Debts = lazy(() => import('./Debts'));
const Assistant = lazy(() => import('./Assistant'));
const CalendarView = lazy(() => import('./CalendarView'));
const Subscriptions = lazy(() => import('./Subscriptions'));
const Pricing = lazy(() => import('./Pricing')); 
const Djam3iaView = lazy(() => import('./Djam3iaView'));
const SimulatorView = lazy(() => import('./SimulatorView'));
const ShopView = lazy(() => import('./ShopView'));
const VisionView = lazy(() => import('./VisionView'));
const FamilyView = lazy(() => import('./FamilyView'));
const ZakatView = lazy(() => import('./ZakatView'));

interface MainViewProps {
    view: AppView;
    data: {
        transactions: Transaction[];
        budgets: Budget[];
        accounts: Account[];
        savingsGoals: SavingsGoal[];
        debts: Debt[];
        subscriptions: Subscription[];
        djam3ias: Djam3ia[];
        shopItems: ShopItem[];
        customCategories: string[];
        settings: AppSettings;
        stats: { income: number; expense: number; balance: number; };
        darkMode: boolean;
        xpBalance?: number;
        privacyMode?: boolean;
        dailyBriefing?: { text: string; mood: 'happy' | 'neutral' | 'concerned' } | null;
    };
    actions: {
        setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
        setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
        setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
        setSavingsGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>;
        setDebts: React.Dispatch<React.SetStateAction<Debt[]>>;
        setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
        setDjam3ias: React.Dispatch<React.SetStateAction<Djam3ia[]>>;
        setShopItems: React.Dispatch<React.SetStateAction<ShopItem[]>>;
        setCustomCategories: React.Dispatch<React.SetStateAction<string[]>>;
        setDailyBriefing?: React.Dispatch<React.SetStateAction<{ text: string; mood: 'happy' | 'neutral' | 'concerned' } | null>>;
        toggleDarkMode: () => void;
        deleteTransaction: (id: string) => void;
        addTransaction: (t: Omit<Transaction, 'id'>) => void;
        settleDebt: (debtId: string, accountId: string) => void; 
        payDjam3iaInstallment: (djam3iaId: string, accountId: string) => void; 
        buyShopItem: (id: string) => boolean;
        equipShopItem: (id: string, type: 'theme' | 'icon') => void;
        showNotification: (msg: string) => void;
        clearAllData: () => void;
        updateSettings: (s: Partial<AppSettings>) => void;
        setShowAddModal: (b: boolean) => void;
        togglePrivacy: () => void;
        importData: (json: string) => void;
    };
    formatCurrency: (amount: number) => string;
    onChangeView: (view: AppView) => void;
}

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-full w-full bg-slate-50 dark:bg-[#050810]">
        <div className="w-12 h-12 border-4 border-brand-mint border-t-transparent rounded-full animate-spin"></div>
    </div>
);

interface ErrorBoundaryProps {
    children?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 dark:bg-[#050810]">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Something went wrong</h2>
                    <p className="text-slate-500 mb-6">Failed to load the component. Please refresh.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-6 py-3 bg-brand-mint text-black font-bold rounded-xl"
                    >
                        Reload App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const MainView: React.FC<MainViewProps> = ({ view, data, actions, formatCurrency, onChangeView }) => {
    const { t } = useLanguage();

    // Listen for custom transfer events from Accounts component
    useEffect(() => {
        const handleTransfer = (e: any) => {
            const { from, to, amount } = e.detail;
            actions.addTransaction({
                amount: amount,
                category: 'Transfer',
                merchant: 'تحويل داخلي',
                date: new Date().toISOString().split('T')[0],
                type: 'transfer',
                currency: 'DZD',
                status: 'completed',
                accountId: from,
                toAccountId: to
            });
            actions.showNotification("تم التحويل بنجاح 💸");
        };

        window.addEventListener('spendwise-transfer', handleTransfer);
        return () => window.removeEventListener('spendwise-transfer', handleTransfer);
    }, [actions]);

    const handleExportCSV = () => {
        const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Currency', 'Type'].join(',');
        const rows = data.transactions.map(t => `${t.date},"${t.merchant}",${t.category},${t.amount},${t.currency},${t.type}`).join('\n');
        const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${headers}\n${rows}`);
        const link = document.createElement("a");
        link.href = encodedUri; link.download = "spendwise_data.csv"; link.click();
    };

    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
                {view === AppView.DASHBOARD && (
                    <Dashboard 
                        transactions={data.transactions} 
                        totalIncome={data.stats.income}
                        totalExpense={data.stats.expense}
                        totalBalance={data.stats.balance}
                        formatCurrency={formatCurrency}
                        userName={data.settings.userName}
                        accounts={data.accounts}
                        debts={data.debts}
                        subscriptions={data.subscriptions}
                        budgets={data.budgets}
                        djam3ias={data.djam3ias}
                        onAddTransaction={actions.addTransaction}
                        showNotification={actions.showNotification}
                        privacyMode={data.privacyMode}
                        togglePrivacy={actions.togglePrivacy}
                        onChangeView={onChangeView}
                        dailyBriefing={data.dailyBriefing}
                        setDailyBriefing={actions.setDailyBriefing}
                    />
                )}
                
                {view === AppView.TRANSACTIONS && (
                <TransactionsView 
                        transactions={data.transactions}
                        customCategories={data.customCategories}
                        accounts={data.accounts}
                        formatCurrency={formatCurrency}
                        onEdit={() => {}}
                        onDelete={actions.deleteTransaction}
                        onExport={handleExportCSV}
                        subscriptions={data.subscriptions}
                />
                )}

                {view === AppView.CALENDAR && (
                    <CalendarView 
                        transactions={data.transactions}
                        subscriptions={data.subscriptions}
                        formatCurrency={formatCurrency}
                    />
                )}

                {view === AppView.SUBSCRIPTIONS && (
                    <Subscriptions 
                        subscriptions={data.subscriptions}
                        onAdd={(sub) => { actions.setSubscriptions(prev => [...prev, { ...sub, id: Date.now().toString() }]); }}
                        onDelete={(id) => { actions.setSubscriptions(prev => prev.filter(s => s.id !== id)); }}
                        formatCurrency={formatCurrency}
                    />
                )}
                
                {view === AppView.BUDGETS && (
                    <Budgets 
                        budgets={data.budgets} 
                        transactions={data.transactions}
                        savingsGoals={data.savingsGoals}
                        onAddGoal={(g) => { actions.setSavingsGoals(prev => [...prev, { ...g, id: Date.now().toString(), saved: 0 }]); }}
                        onUpdateGoal={(id, amount) => { actions.setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, saved: g.saved + amount } : g)); }}
                        onAddBudget={(b) => { actions.setBudgets(prev => [...prev, { ...b, id: Date.now().toString(), spent: 0 }]); }}
                        formatCurrency={formatCurrency}
                    />
                )}
                
                {view === AppView.ANALYTICS && <Analytics transactions={data.transactions} formatCurrency={formatCurrency} />}
                {view === AppView.RECEIPTS && <Receipts transactions={data.transactions} formatCurrency={formatCurrency} />}
                {view === AppView.ACCOUNTS && <Accounts accounts={data.accounts} onAddAccount={(acc) => { actions.setAccounts(prev => [...prev, { ...acc, id: Date.now().toString() }]); }} formatCurrency={formatCurrency} />}
                
                {view === AppView.DEBTS && (
                    <Debts 
                        debts={data.debts} 
                        accounts={data.accounts}
                        onAddDebt={(d) => { actions.setDebts(prev => [...prev, { ...d, id: Date.now().toString() }]); }} 
                        onSettleDebt={actions.settleDebt}
                        formatCurrency={formatCurrency} 
                    />
                )}
                
                {view === AppView.DJAM3IA && (
                    <Djam3iaView 
                        djam3ias={data.djam3ias} 
                        accounts={data.accounts}
                        onAdd={(d) => { actions.setDjam3ias(prev => [...prev, { ...d, id: Date.now().toString() }]); }} 
                        onPayInstallment={actions.payDjam3iaInstallment}
                        formatCurrency={formatCurrency} 
                    />
                )}

                {view === AppView.ASSISTANT && <Assistant data={data as any} />}
                {view === AppView.SETTINGS && (
                    <Settings 
                        onClearData={actions.clearAllData} 
                        customCategories={data.customCategories}
                        onAddCategory={(cat) => { actions.setCustomCategories([...data.customCategories, cat]); }}
                        onRemoveCategory={(cat) => actions.setCustomCategories(data.customCategories.filter(c => c !== cat))}
                        darkMode={data.darkMode}
                        toggleDarkMode={actions.toggleDarkMode}
                        onImportData={actions.importData}
                        settings={data.settings}
                        onUpdateSettings={actions.updateSettings}
                    />
                )}

                {view === AppView.REPORTS && <Reports onExport={handleExportCSV} />}
                {view === AppView.REWARDS && <Rewards transactions={data.transactions} budgets={data.budgets} />}
                {view === AppView.PRICING && <Pricing settings={data.settings} />}
                {view === AppView.SIMULATOR && <SimulatorView transactions={data.transactions} subscriptions={data.subscriptions} accounts={data.accounts} formatCurrency={formatCurrency} />}
                {view === AppView.SHOP && (
                    <ShopView 
                        items={data.shopItems} 
                        xpBalance={data.settings.spentXP || 0} 
                        onBuy={actions.buyShopItem} 
                        onEquip={actions.equipShopItem} 
                    />
                )}
                {view === AppView.VISION && <VisionView />}
                {view === AppView.FAMILY && <FamilyView />}
                {view === AppView.ZAKAT && <ZakatView accounts={data.accounts} formatCurrency={formatCurrency} />}
            </Suspense>
        </ErrorBoundary>
    );
};

export default MainView;