
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, Budget, Account, SavingsGoal, Debt, AppSettings, Subscription, Djam3ia, ShopItem } from '../types';

const DEFAULT_SETTINGS: AppSettings = {
    isOnboarded: false,
    isDemoMode: false,
    currency: 'DZD',
    currencySymbol: 'د.ج',
    themeColor: 'bronze',
    customThemeHex: '#8C6A4B',
    cardStyle: 'glass',
    enableAnimations: true,
    privacyMode: false,
    autoThemeFromWallpaper: true,
    backgroundBlur: 16,
    wallpaperBlur: 0,
    securityPin: '1234',
    merchantMap: {},
    spentXP: 0
};

export const useFinanceData = () => {
    const getStored = (key: string, fallback: any) => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : fallback;
        } catch (e) {
            return fallback;
        }
    };

    const [isDemoMode, setIsDemoMode] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>(() => getStored('transactions', []));
    const [budgets, setBudgets] = useState<Budget[]>(() => getStored('budgets', []));
    const [accounts, setAccounts] = useState<Account[]>(() => getStored('accounts', []));
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => getStored('savingsGoals', []));
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => getStored('subscriptions', []));
    const [debts, setDebts] = useState<Debt[]>(() => getStored('debts', []));
    const [djam3ias, setDjam3ias] = useState<Djam3ia[]>(() => getStored('djam3ias', []));
    const [customCategories, setCustomCategories] = useState<string[]>(() => getStored('customCategories', []));
    const [shopItems, setShopItems] = useState<ShopItem[]>(() => getStored('shopItems', [
        { id: 'theme_rose', name: 'Rose Red Theme', description: 'A passionate red theme.', cost: 100, type: 'theme', value: 'rose', isOwned: false },
        { id: 'theme_violet', name: 'Ultra Violet', description: 'Deep purple vibes.', cost: 200, type: 'theme', value: 'violet', isOwned: false },
        { id: 'theme_amber', name: 'Sunset Amber', description: 'Warm and energetic.', cost: 150, type: 'theme', value: 'amber', isOwned: false },
        { id: 'icon_king', name: 'King Status', description: 'Unlock the crown icon.', cost: 500, type: 'icon', value: '👑', isOwned: false },
    ]));
    const [settings, setSettings] = useState<AppSettings>(() => getStored('appSettings', DEFAULT_SETTINGS));
    
    // Daily Briefing State (Session only)
    const [dailyBriefing, setDailyBriefing] = useState<{ text: string; mood: 'happy' | 'neutral' | 'concerned' } | null>(null);

    // Default to Dark Mode (true) if not explicitly set to 'false'
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved !== 'false'; 
    });
    
    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = useCallback((msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    }, []);

    useEffect(() => { localStorage.setItem('darkMode', JSON.stringify(darkMode)); }, [darkMode]);
    
    const saveState = useCallback(() => {
        // ALLOW saving even in demo mode so settings persist during session.
        localStorage.setItem('transactions', JSON.stringify(transactions));
        localStorage.setItem('accounts', JSON.stringify(accounts));
        localStorage.setItem('debts', JSON.stringify(debts));
        localStorage.setItem('budgets', JSON.stringify(budgets));
        localStorage.setItem('appSettings', JSON.stringify(settings));
        localStorage.setItem('djam3ias', JSON.stringify(djam3ias));
        localStorage.setItem('shopItems', JSON.stringify(shopItems));
        localStorage.setItem('customCategories', JSON.stringify(customCategories));
        localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    }, [transactions, accounts, debts, budgets, settings, djam3ias, shopItems, customCategories, savingsGoals, subscriptions]);

    useEffect(() => { saveState(); }, [saveState]);

    const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
        const newId = Date.now().toString();
        const newTxn: Transaction = { ...t, id: newId };
        
        setTransactions(prev => [newTxn, ...prev]);

        // Smart XP System: Add XP for adding transactions
        if (!isDemoMode) {
            setSettings(prev => ({ ...prev, spentXP: (prev.spentXP || 0) + 10 }));
        }

        setAccounts(prev => prev.map(acc => {
            // Case 1: Deduct from source account
            if (acc.id === t.accountId) {
                let diff = 0;
                if (t.type === 'income') diff = t.amount;
                else if (t.type === 'expense' || t.type === 'transfer') diff = -t.amount;
                
                return { ...acc, balance: acc.balance + diff };
            }
            // Case 2: Add to destination account (Transfer)
            if (t.type === 'transfer' && t.toAccountId && acc.id === t.toAccountId) {
                return { ...acc, balance: acc.balance + t.amount };
            }
            return acc;
        }));

        if (t.type === 'expense') {
            setBudgets(prev => prev.map(b => 
                b.category === t.category ? { ...b, spent: b.spent + t.amount } : b
            ));
        }

        return newTxn;
    }, [isDemoMode]);

    // Settle/Partial Debt Logic
    const settleDebt = useCallback((debtId: string, accountId: string, partialAmount?: number) => {
        const debt = debts.find(d => d.id === debtId);
        if (!debt) return;

        const amountToSettle = partialAmount !== undefined ? Math.min(partialAmount, debt.remainingAmount) : debt.remainingAmount;
        
        // Log transaction
        addTransaction({
            amount: amountToSettle,
            category: 'DebtRepayment',
            merchant: `تسديد دين: ${debt.person}`,
            date: new Date().toISOString().split('T')[0],
            type: debt.type === 'lent' ? 'income' : 'expense',
            currency: 'DZD',
            status: 'completed',
            accountId: accountId
        });

        // Update debt state
        setDebts(prev => prev.map(d => {
            if (d.id === debtId) {
                const newRemaining = d.remainingAmount - amountToSettle;
                return { 
                    ...d, 
                    remainingAmount: newRemaining,
                    isPaid: newRemaining <= 0,
                    history: [...(d.history || []), { amount: amountToSettle, date: new Date().toLocaleDateString(), note: 'Partial payment' }]
                };
            }
            return d;
        }));

        showNotification(amountToSettle < debt.remainingAmount ? "تم تسجيل الدفعة الجزئية ✅" : "تم تسديد الدين بالكامل ✅");
    }, [debts, addTransaction, showNotification]);

    const payDjam3iaInstallment = useCallback((djam3iaId: string, accountId: string) => {
        const djam = djam3ias.find(d => d.id === djam3iaId);
        if (!djam) return;

        addTransaction({
            amount: djam.monthlyPayment,
            category: 'Transfer',
            merchant: `قسط الجمعية: ${djam.name}`,
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            currency: 'DZD',
            status: 'completed',
            accountId: accountId
        });

        showNotification("تم دفع قسط الجمعية بنجاح 🚀");
    }, [djam3ias, addTransaction, showNotification]);

    const buyShopItem = useCallback((itemId: string) => {
        const item = shopItems.find(i => i.id === itemId);
        if (!item) return false;
        
        const currentXP = settings.spentXP || 0;
        if (currentXP < item.cost) return false;

        setSettings(prev => ({ ...prev, spentXP: currentXP - item.cost }));
        setShopItems(prev => prev.map(i => i.id === itemId ? { ...i, isOwned: true } : i));
        showNotification(`مبروك! شريت ${item.name} 🎉`);
        return true;
    }, [shopItems, settings.spentXP, showNotification]);

    const equipShopItem = useCallback((itemId: string, type: 'theme' | 'icon') => {
        const item = shopItems.find(i => i.id === itemId);
        if (!item || !item.isOwned) return;

        if (type === 'theme') {
            setSettings(prev => ({ ...prev, themeColor: item.value, autoThemeFromWallpaper: false }));
            showNotification(`تم تفعيل الثيم: ${item.name} 🎨`);
        }
    }, [shopItems, showNotification]);

    const importData = useCallback((json: string) => {
        try {
            const data = JSON.parse(json);
            if (data.transactions) localStorage.setItem('transactions', JSON.stringify(data.transactions));
            if (data.accounts) localStorage.setItem('accounts', JSON.stringify(data.accounts));
            if (data.budgets) localStorage.setItem('budgets', JSON.stringify(data.budgets));
            if (data.savingsGoals) localStorage.setItem('savingsGoals', JSON.stringify(data.savingsGoals));
            if (data.debts) localStorage.setItem('debts', JSON.stringify(data.debts));
            if (data.customCategories) localStorage.setItem('customCategories', JSON.stringify(data.customCategories));
            
            showNotification("تم استيراد البيانات بنجاح. جاري التحديث...");
            setTimeout(() => window.location.reload(), 1000);
        } catch (e) {
            console.error("Import failed", e);
            showNotification("فشل الاستيراد. الملف غير صالح.");
        }
    }, [showNotification]);

    const stats = useMemo(() => ({
        income: transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        balance: accounts.reduce((s, a) => s + a.balance, 0)
    }), [transactions, accounts]);

    const setupAdminDemo = useCallback(() => {
        setIsDemoMode(true);
        
        // 1. Accounts
        const demoAccounts: Account[] = [
            { id: 'acc_ccp', name: 'CCP الجزائر', type: 'CCP', balance: 45000, currency: 'DZD', color: 'bg-yellow-500' },
            { id: 'acc_baridi', name: 'BaridiMob', type: 'Card', balance: 12000, currency: 'DZD', color: 'bg-blue-600' },
            { id: 'acc_cash', name: 'المحفظة (Espece)', type: 'Cash', balance: 3500, currency: 'DZD', color: 'bg-emerald-500' },
            { id: 'acc_saving', name: 'تحت البلاطة', type: 'Cash', balance: 150000, currency: 'DZD', color: 'bg-purple-600' }
        ];
        setAccounts(demoAccounts);

        // 2. Budgets (Some healthy, some critical)
        setBudgets([
            { id: 'b1', category: 'Food', limit: 25000, spent: 22000, color: 'bg-orange-500' },
            { id: 'b2', category: 'Transport', limit: 6000, spent: 4500, color: 'bg-blue-500' },
            { id: 'b3', category: 'Shopping', limit: 10000, spent: 12500, color: 'bg-pink-500' }, // Over budget
            { id: 'b4', category: 'Utilities', limit: 5000, spent: 1600, color: 'bg-yellow-500' }
        ]);

        // 3. Helper to generate dates relative to today
        const getRelativeDate = (daysAgo: number) => {
            const d = new Date();
            d.setDate(d.getDate() - daysAgo);
            return d.toISOString().split('T')[0];
        };

        // 4. Rich Transactions History (Last 60 Days)
        const demoTxns: Transaction[] = [
            // Income
            { id: 't1', amount: 65000, category: 'Salary', merchant: 'الراتب الشهري', date: getRelativeDate(2), type: 'income', currency: 'DZD', accountId: 'acc_ccp', status: 'completed' },
            { id: 't2', amount: 15000, category: 'Freelance', merchant: 'Design Project', date: getRelativeDate(15), type: 'income', currency: 'DZD', accountId: 'acc_baridi', status: 'completed' },
            { id: 't3', amount: 65000, category: 'Salary', merchant: 'الراتب الشهري', date: getRelativeDate(32), type: 'income', currency: 'DZD', accountId: 'acc_ccp', status: 'completed' },
            
            // Expenses - Big
            { id: 't4', amount: 25000, category: 'General', merchant: 'الكراء (Loyer)', date: getRelativeDate(5), type: 'expense', currency: 'DZD', accountId: 'acc_ccp', status: 'completed' },
            { id: 't5', amount: 4500, category: 'Utilities', merchant: 'Sonelgaz Trimestre', date: getRelativeDate(10), type: 'expense', currency: 'DZD', accountId: 'acc_ccp', status: 'completed' },
            
            // Expenses - Daily Life
            { id: 't6', amount: 2500, category: 'Food', merchant: 'Supérette Amine', date: getRelativeDate(0), type: 'expense', currency: 'DZD', accountId: 'acc_cash', status: 'completed' },
            { id: 't7', amount: 350, category: 'Food', merchant: 'Boulangerie', date: getRelativeDate(0), type: 'expense', currency: 'DZD', accountId: 'acc_cash', status: 'completed' },
            { id: 't8', amount: 600, category: 'Transport', merchant: 'Yassir', date: getRelativeDate(1), type: 'expense', currency: 'DZD', accountId: 'acc_cash', status: 'completed' },
            { id: 't9', amount: 1200, category: 'Food', merchant: 'Moul Tacos', date: getRelativeDate(2), type: 'expense', currency: 'DZD', accountId: 'acc_cash', status: 'completed' },
            { id: 't10', amount: 200, category: 'Transport', merchant: 'Bus Etusa', date: getRelativeDate(3), type: 'expense', currency: 'DZD', accountId: 'acc_cash', status: 'completed' },
            { id: 't11', amount: 1000, category: 'Flexy', merchant: 'Flexy Mobilis', date: getRelativeDate(4), type: 'expense', currency: 'DZD', accountId: 'acc_baridi', status: 'completed' },
            { id: 't12', amount: 5000, category: 'Shopping', merchant: 'Zara (Soldes)', date: getRelativeDate(6), type: 'expense', currency: 'DZD', accountId: 'acc_baridi', status: 'completed' },
            { id: 't13', amount: 800, category: 'Health', merchant: 'Pharmacie de garde', date: getRelativeDate(7), type: 'expense', currency: 'DZD', accountId: 'acc_cash', status: 'completed' },
            { id: 't14', amount: 4000, category: 'Food', merchant: 'Qadjan Semaine', date: getRelativeDate(8), type: 'expense', currency: 'DZD', accountId: 'acc_cash', status: 'completed' },
            { id: 't15', amount: 120, category: 'Food', merchant: 'Café Press', date: getRelativeDate(0), type: 'expense', currency: 'DZD', accountId: 'acc_cash', status: 'completed' },
            { id: 't16', amount: 120, category: 'Food', merchant: 'Café Press', date: getRelativeDate(1), type: 'expense', currency: 'DZD', accountId: 'acc_cash', status: 'completed' },
            { id: 't17', amount: 2000, category: 'Entertainment', merchant: 'Netflix', date: getRelativeDate(12), type: 'expense', currency: 'DZD', accountId: 'acc_baridi', status: 'completed' },
            { id: 't18', amount: 1600, category: 'Utilities', merchant: 'ADSL Idoom', date: getRelativeDate(20), type: 'expense', currency: 'DZD', accountId: 'acc_ccp', status: 'completed' }
        ];
        
        // Add random filler data for the graph
        for(let i=0; i<30; i++) {
            demoTxns.push({
                id: `filler_${i}`,
                amount: Math.floor(Math.random() * 1000) + 200,
                category: i % 3 === 0 ? 'Food' : i % 2 === 0 ? 'Transport' : 'Shopping',
                merchant: i % 3 === 0 ? 'Hanout' : 'Taxi',
                date: getRelativeDate(i + 1),
                type: 'expense',
                currency: 'DZD',
                accountId: 'acc_cash',
                status: 'completed'
            });
        }
        setTransactions(demoTxns);

        // 5. Debts (Credits)
        setDebts([
            { id: 'd1', person: 'خالد (Epicerie)', amount: 3500, remainingAmount: 1500, type: 'borrowed', isPaid: false, history: [{ amount: 2000, date: getRelativeDate(5) }] },
            { id: 'd2', person: 'ياسين ولد عمتي', amount: 10000, remainingAmount: 10000, type: 'lent', isPaid: false, history: [] },
            { id: 'd3', person: 'مول الدار', amount: 5000, remainingAmount: 0, type: 'borrowed', isPaid: true, history: [{ amount: 5000, date: getRelativeDate(20) }] }
        ]);

        // 6. Savings Goals
        setSavingsGoals([
            { id: 'g1', name: 'Golf 7', target: 3500000, saved: 450000, emoji: '🚗', color: 'bg-slate-900' },
            { id: 'g2', name: 'عطلة الصيف', target: 150000, saved: 30000, emoji: '🏖️', color: 'bg-blue-500' },
            { id: 'g3', name: 'عمرة', target: 250000, saved: 80000, emoji: '🕋', color: 'bg-emerald-500' }
        ]);

        // 7. Subscriptions
        setSubscriptions([
            { id: 's1', name: 'Netflix Premium', amount: 2000, billingCycle: 'monthly', nextBillingDate: getRelativeDate(-10), icon: 'N', color: 'bg-red-600', category: 'Entertainment', autoDeduct: true },
            { id: 's2', name: 'Salle de Sport', amount: 3000, billingCycle: 'monthly', nextBillingDate: getRelativeDate(-2), icon: '🏋️', color: 'bg-slate-800', category: 'Health', autoDeduct: false },
            { id: 's3', name: 'Spotify Duo', amount: 800, billingCycle: 'monthly', nextBillingDate: getRelativeDate(-15), icon: 'S', color: 'bg-green-500', category: 'Entertainment', autoDeduct: true }
        ]);

        // 8. Djam3ia (Traditional Association)
        setDjam3ias([
            {
                id: 'dj1',
                name: 'جمعية الخدمة',
                totalAmount: 120000,
                monthlyPayment: 10000,
                membersCount: 12,
                myTurnMonth: 8,
                startDate: getRelativeDate(60),
                status: 'active',
                members: [
                    { id: 'm1', name: 'أحمد', paidMonths: [1, 2] },
                    { id: 'm2', name: 'سمير', paidMonths: [1, 2] },
                    { id: 'm3', name: 'أنا', paidMonths: [1, 2] },
                    { id: 'm4', name: 'ليلى', paidMonths: [1] }
                ]
            }
        ]);

        // 9. App Settings
        setSettings(prev => ({ 
            ...prev, 
            userName: 'أمين', 
            isOnboarded: true, 
            isDemoMode: true, 
            currency: 'DZD',
            currencySymbol: 'د.ج',
            spentXP: 450,
            themeColor: 'bronze',
            customThemeHex: '#8C6A4B'
        }));

        showNotification("تم تفعيل وضع الديمو ببيانات جزائرية واقعية 🇩🇿");

    }, [showNotification]);

    return {
        transactions, budgets, accounts, savingsGoals, subscriptions, debts, djam3ias, shopItems, settings, darkMode, isDemoMode, customCategories, notification, dailyBriefing,
        setDarkMode, setTransactions, setBudgets, setAccounts, setSavingsGoals, setSubscriptions, setDebts, setDjam3ias, setShopItems, setCustomCategories, setDailyBriefing,
        addTransaction, settleDebt, payDjam3iaInstallment, buyShopItem, equipShopItem, showNotification, importData,
        setupAdminDemo, exitDemoMode: () => { localStorage.clear(); window.location.reload(); },
        updateSettings: (s: Partial<AppSettings>) => setSettings(prev => ({ ...prev, ...s })),
        clearAllData: () => { localStorage.clear(); window.location.reload(); },
        stats
    };
};
