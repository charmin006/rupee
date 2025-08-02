export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  paymentMethod?: PaymentMethod;
  receiptImage?: string;
  createdAt: string;
  updatedAt: string;
  // Phase 3 additions
  isRecurring?: boolean;
  recurringId?: string;
  profileId?: string;
  receiptData?: ReceiptData;
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isCustom: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  // Phase 3 additions
  profiles: UserProfile[];
  activeProfileId: string;
  securitySettings: SecuritySettings;
  achievements: Achievement[];
  streaks: StreakData;
}

export interface UserPreferences {
  currency: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  defaultPaymentMethod: PaymentMethod;
  monthlyBudget?: number;
  budgetLimits: BudgetLimit[];
  alertSettings: AlertSettings;
  // Phase 3 additions
  gamificationEnabled: boolean;
  autoBackupEnabled: boolean;
  cloudSyncEnabled: boolean;
  receiptScanningEnabled: boolean;
}

export interface BudgetLimit {
  id: string;
  category: string;
  amount: number;
  period: 'day' | 'week' | 'month';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AlertSettings {
  overspendingAlerts: boolean;
  budgetLimitAlerts: boolean;
  savingsGoalAlerts: boolean;
  weeklyInsights: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface SpendingInsight {
  id: string;
  type: 'spending_increase' | 'spending_decrease' | 'budget_alert' | 'savings_tip' | 'overspending_alert' | 'goal_achieved';
  title: string;
  message: string;
  category?: string;
  percentage?: number;
  date: string;
  isRead: boolean;
  severity: 'low' | 'medium' | 'high';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface SpendingAlert {
  id: string;
  type: 'budget_limit' | 'overspending' | 'category_limit';
  title: string;
  message: string;
  category?: string;
  amount: number;
  limit: number;
  period: 'day' | 'week' | 'month';
  date: string;
  isRead: boolean;
  severity: 'low' | 'medium' | 'high';
}

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';

export interface ExpenseSummary {
  total: number;
  byCategory: Record<string, number>;
  byDate: Record<string, number>;
  count: number;
}

export interface IncomeSummary {
  total: number;
  bySource: Record<string, number>;
  byDate: Record<string, number>;
  count: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  period: 'day' | 'week' | 'month' | 'year';
}

export interface AppData {
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];
  savingsGoals: SavingsGoal[];
  insights: SpendingInsight[];
  alerts: SpendingAlert[];
  user: User;
  // Phase 3 additions
  recurringExpenses: RecurringExpense[];
  profiles: UserProfile[];
  achievements: Achievement[];
  backupHistory: BackupRecord[];
}

// Phase 3 New Interfaces

export interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  isActive: boolean;
  note?: string;
  paymentMethod?: PaymentMethod;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'member' | 'viewer';
  permissions: ProfilePermissions;
  createdAt: string;
  updatedAt: string;
}

export interface ProfilePermissions {
  canAddExpenses: boolean;
  canEditExpenses: boolean;
  canDeleteExpenses: boolean;
  canViewIncomes: boolean;
  canAddIncomes: boolean;
  canManageCategories: boolean;
  canManageGoals: boolean;
  canManageSettings: boolean;
  canInviteMembers: boolean;
}

export interface SecuritySettings {
  pinEnabled: boolean;
  pinHash?: string;
  biometricEnabled: boolean;
  autoLockTimeout: number; // minutes
  requireAuthForExport: boolean;
  requireAuthForSettings: boolean;
  lastUnlockTime?: string;
}

export interface ReceiptData {
  id: string;
  imageUrl: string;
  ocrText?: string;
  extractedData?: {
    merchant?: string;
    total?: number;
    date?: string;
    items?: ReceiptItem[];
  };
  confidence: number;
  isProcessed: boolean;
  createdAt: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Achievement {
  id: string;
  type: 'streak' | 'savings' | 'budget' | 'no_spend' | 'goal' | 'milestone';
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastSpendDate?: string;
  noSpendDays: number;
  totalNoSpendDays: number;
  currentNoSpendStreak: number;
  longestNoSpendStreak: number;
}

export interface BackupRecord {
  id: string;
  type: 'manual' | 'auto' | 'cloud';
  timestamp: string;
  size: number;
  status: 'success' | 'failed' | 'in_progress';
  data?: AppData;
  error?: string;
}

export interface ChartData {
  period: 'day' | 'week' | 'month' | 'year';
  data: ChartDataPoint[];
  categories: string[];
  total: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  category?: string;
  label: string;
}

export interface CalendarViewData {
  year: number;
  month: number;
  days: CalendarDay[];
}

export interface CalendarDay {
  date: string;
  expenses: Expense[];
  total: number;
  hasOverspending: boolean;
  isNoSpendDay: boolean;
} 