
export interface Transaction {
  id: string;
  amount: number;
  category: string;
  merchant: string;
  date: string;
  note?: string;
  currency: string;
  type: 'income' | 'expense' | 'transfer' | 'debt';
  status: 'completed' | 'pending';
  accountId?: string;
  toAccountId?: string;
  receiptImage?: string;
  isGhost?: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: 'Cash' | 'Bank' | 'Wallet' | 'Card' | 'CCP';
  balance: number;
  currency: string;
  color: string;
  virtualPots?: { name: string; amount: number }[]; // الحصالة أو الرصيد المحجوز
}

export interface Debt {
  id: string;
  person: string;
  amount: number;
  remainingAmount: number;
  type: 'lent' | 'borrowed';
  dueDate?: string;
  isPaid: boolean;
  history: { amount: number; date: string; note?: string }[]; // تتبع الدفعات الجزئية
}

export interface Djam3iaMember {
  id: string;
  name: string;
  phone?: string;
  paidMonths: number[];
}

export interface Djam3ia {
    id: string;
    name: string;
    totalAmount: number;
    monthlyPayment: number;
    membersCount: number;
    myTurnMonth: number;
    startDate: string;
    status: 'active' | 'completed';
    members: Djam3iaMember[];
}

export interface AppSettings {
    isOnboarded: boolean;
    userName?: string;
    currency: string;
    currencySymbol: string;
    themeColor: string; // ID of preset or 'custom'
    securityPin?: string;
    isDemoMode?: boolean;
    backgroundImage?: string;
    autoThemeFromWallpaper?: boolean;
    customThemeHex?: string; // The actual hex color
    backgroundBlur?: number; // Controls Glass Cards Frosting
    wallpaperBlur?: number; // Controls Fixed Blur Layer over Background (0-20)
    backgroundOverlayOpacity?: number; // 0.0 to 1.0
    cardStyle: 'glass' | 'solid' | 'outline';
    enableAnimations?: boolean;
    privacyMode?: boolean;
    merchantMap?: Record<string, string>;
    spentXP?: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  CALENDAR = 'CALENDAR',
  BUDGETS = 'BUDGETS',
  ANALYTICS = 'ANALYTICS',
  ACCOUNTS = 'ACCOUNTS',
  DEBTS = 'DEBTS',
  DJAM3IA = 'DJAM3IA',
  SIMULATOR = 'SIMULATOR',
  ZAKAT = 'ZAKAT',
  SETTINGS = 'SETTINGS',
  ASSISTANT = 'ASSISTANT',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
  RECEIPTS = 'RECEIPTS',
  REPORTS = 'REPORTS',
  REWARDS = 'REWARDS',
  PRICING = 'PRICING',
  SHOP = 'SHOP',
  VISION = 'VISION',
  FAMILY = 'FAMILY'
}

export interface ReceiptData {
    total?: number;
    merchant?: string;
    date?: string;
}

export interface FullContext {
    transactions?: Transaction[];
    accounts?: Account[];
    debts?: Debt[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    isThinking?: boolean;
}

export interface Budget {
    id: string;
    category: string;
    limit: number;
    spent: number;
    color: string;
}

export interface SavingsGoal {
    id: string;
    name: string;
    target: number;
    saved: number;
    emoji: string;
    color: string;
}

export type Language = 'en' | 'ar' | 'fr';

export type ThemeColor = 'bronze' | 'blue' | 'emerald' | 'violet' | 'rose' | 'amber' | 'cyan' | 'custom';

export interface SharedUser {
    id: string;
    name: string;
    email: string;
    role: 'Owner' | 'Editor' | 'Viewer';
    avatarColor: string;
}

export interface Badge {
    id: string;
    key: string;
    descriptionKey: string;
    icon: string;
    unlocked: boolean;
}

export interface Subscription {
    id: string;
    name: string;
    amount: number;
    billingCycle: 'monthly' | 'yearly';
    nextBillingDate: string;
    icon: string;
    color: string;
    category: string;
    autoDeduct?: boolean;
}

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: 'theme' | 'icon';
    value: string;
    isOwned: boolean;
}

export interface CategoryDef {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'expense' | 'income' | 'both';
}

export interface StorySlide {
    type: 'warning' | 'summary' | 'info';
    emoji: string;
    title: string;
    text: string;
    dataPoint?: string;
}

export interface AiInsight {
    type: 'alert' | 'tip' | 'praise';
    text: string;
    icon: string;
}
