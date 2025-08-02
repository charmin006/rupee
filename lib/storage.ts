import { AppData, Expense, Income, Category, User, SavingsGoal, SpendingInsight, SpendingAlert, BudgetLimit, AlertSettings, RecurringExpense, UserProfile, SecuritySettings, Achievement, StreakData, BackupRecord } from './types';
import surrealDB from './surrealdb';

const STORAGE_KEYS = {
  APP_DATA: 'rupee_app_data',
  USER: 'rupee_user',
  EXPENSES: 'rupee_expenses',
  INCOMES: 'rupee_incomes',
  CATEGORIES: 'rupee_categories',
  SAVINGS_GOALS: 'rupee_savings_goals',
  INSIGHTS: 'rupee_insights',
  ALERTS: 'rupee_alerts',
  // Phase 3 additions
  RECURRING_EXPENSES: 'rupee_recurring_expenses',
  PROFILES: 'rupee_profiles',
  ACHIEVEMENTS: 'rupee_achievements',
  BACKUP_HISTORY: 'rupee_backup_history',
  SECURITY_SETTINGS: 'rupee_security_settings',
} as const;

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', color: '#ef4444', icon: '🍽️', isCustom: false, createdAt: new Date().toISOString() },
  { id: '2', name: 'Transportation', color: '#3b82f6', icon: '🚗', isCustom: false, createdAt: new Date().toISOString() },
  { id: '3', name: 'Shopping', color: '#8b5cf6', icon: '🛍️', isCustom: false, createdAt: new Date().toISOString() },
  { id: '4', name: 'Entertainment', color: '#ec4899', icon: '🎬', isCustom: false, createdAt: new Date().toISOString() },
  { id: '5', name: 'Utilities', color: '#f59e0b', icon: '⚡', isCustom: false, createdAt: new Date().toISOString() },
  { id: '6', name: 'Healthcare', color: '#10b981', icon: '🏥', isCustom: false, createdAt: new Date().toISOString() },
  { id: '7', name: 'Education', color: '#06b6d4', icon: '📚', isCustom: false, createdAt: new Date().toISOString() },
  { id: '8', name: 'Travel', color: '#84cc16', icon: '✈️', isCustom: false, createdAt: new Date().toISOString() },
  { id: '9', name: 'Gifts', color: '#f97316', icon: '🎁', isCustom: false, createdAt: new Date().toISOString() },
  { id: '10', name: 'Other', color: '#6b7280', icon: '📝', isCustom: false, createdAt: new Date().toISOString() },
];

// Default alert settings
const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  overspendingAlerts: true,
  budgetLimitAlerts: true,
  savingsGoalAlerts: true,
  weeklyInsights: true,
  emailNotifications: false,
  pushNotifications: true,
};

// Default security settings
const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  pinEnabled: false,
  biometricEnabled: false,
  autoLockTimeout: 5, // 5 minutes
  requireAuthForExport: true,
  requireAuthForSettings: false,
};

// Default streak data
const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  noSpendDays: 0,
  totalNoSpendDays: 0,
  currentNoSpendStreak: 0,
  longestNoSpendStreak: 0,
};

// Default achievements
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    type: 'streak',
    title: 'First Steps',
    description: 'Track expenses for 7 consecutive days',
    icon: '🔥',
    isUnlocked: false,
    progress: 0,
    maxProgress: 7,
    rarity: 'common',
  },
  {
    id: '2',
    type: 'savings',
    title: 'Saver',
    description: 'Save ₹10,000 in total',
    icon: '💰',
    isUnlocked: false,
    progress: 0,
    maxProgress: 10000,
    rarity: 'common',
  },
  {
    id: '3',
    type: 'no_spend',
    title: 'No Spend Day',
    description: 'Complete a day without any expenses',
    icon: '🎯',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    rarity: 'rare',
  },
  {
    id: '4',
    type: 'budget',
    title: 'Budget Master',
    description: 'Stay within budget for 30 consecutive days',
    icon: '📊',
    isUnlocked: false,
    progress: 0,
    maxProgress: 30,
    rarity: 'epic',
  },
  {
    id: '5',
    type: 'goal',
    title: 'Goal Achiever',
    description: 'Complete your first savings goal',
    icon: '🏆',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    rarity: 'legendary',
  },
];

// Default user profile
const DEFAULT_PROFILE: UserProfile = {
  id: '1',
  name: 'Personal',
  role: 'owner',
  permissions: {
    canAddExpenses: true,
    canEditExpenses: true,
    canDeleteExpenses: true,
    canViewIncomes: true,
    canAddIncomes: true,
    canManageCategories: true,
    canManageGoals: true,
    canManageSettings: true,
    canInviteMembers: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Default user
const DEFAULT_USER: User = {
  id: '1',
  email: 'user@example.com',
  name: 'User',
  preferences: {
    currency: '₹',
    theme: 'light',
    notifications: true,
    defaultPaymentMethod: 'cash',
    monthlyBudget: 50000,
    budgetLimits: [],
    alertSettings: DEFAULT_ALERT_SETTINGS,
    // Phase 3 additions
    gamificationEnabled: true,
    autoBackupEnabled: true,
    cloudSyncEnabled: false,
    receiptScanningEnabled: true,
  },
  // Phase 3 additions
  profiles: [DEFAULT_PROFILE],
  activeProfileId: '1',
  securitySettings: DEFAULT_SECURITY_SETTINGS,
  achievements: DEFAULT_ACHIEVEMENTS,
  streaks: DEFAULT_STREAK_DATA,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

class StorageManager {
  private static instance: StorageManager;

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  private getStorage(): Storage {
    if (typeof window === 'undefined') {
      throw new Error('Storage is only available in browser environment');
    }
    return localStorage;
  }

  private setItem(key: string, value: any): void {
    try {
      const storage = this.getStorage();
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to storage: ${error}`);
    }
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const storage = this.getStorage();
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from storage: ${error}`);
      return defaultValue;
    }
  }

  // Initialize app data
  initializeApp(): AppData {
    try {
      const existingData = this.getItem<AppData | null>(STORAGE_KEYS.APP_DATA, null);
      
      if (existingData) {
        // Migrate existing data to include new Phase 3 fields
        const migratedData = this.migrateData(existingData);
        this.setItem(STORAGE_KEYS.APP_DATA, migratedData);
        return migratedData;
      }

      const initialData: AppData = {
        expenses: [],
        incomes: [],
        categories: DEFAULT_CATEGORIES,
        savingsGoals: [],
        insights: [],
        alerts: [],
        user: DEFAULT_USER,
        // Phase 3 additions
        recurringExpenses: [],
        profiles: [DEFAULT_PROFILE],
        achievements: DEFAULT_ACHIEVEMENTS,
        backupHistory: [],
      };

      this.setItem(STORAGE_KEYS.APP_DATA, initialData);
      return initialData;
    } catch (error) {
      console.error('StorageManager: Error in initializeApp:', error);
      // Return default data if there's an error
      return {
        expenses: [],
        incomes: [],
        categories: DEFAULT_CATEGORIES,
        savingsGoals: [],
        insights: [],
        alerts: [],
        user: DEFAULT_USER,
        recurringExpenses: [],
        profiles: [DEFAULT_PROFILE],
        achievements: DEFAULT_ACHIEVEMENTS,
        backupHistory: [],
      };
    }
  }

  // Migrate existing data to include new Phase 3 fields
  private migrateData(existingData: AppData): AppData {
    // Ensure user exists, if not use default user
    const existingUser = existingData.user || DEFAULT_USER;
    const existingPreferences = existingUser.preferences || DEFAULT_USER.preferences;
    
    return {
      ...existingData,
      alerts: existingData.alerts || [],
      user: {
        ...existingUser,
        preferences: {
          ...existingPreferences,
          budgetLimits: existingPreferences.budgetLimits || [],
          alertSettings: existingPreferences.alertSettings || DEFAULT_ALERT_SETTINGS,
          // Phase 3 additions
          gamificationEnabled: existingPreferences.gamificationEnabled ?? true,
          autoBackupEnabled: existingPreferences.autoBackupEnabled ?? true,
          cloudSyncEnabled: existingPreferences.cloudSyncEnabled ?? false,
          receiptScanningEnabled: existingPreferences.receiptScanningEnabled ?? true,
        },
        // Phase 3 additions
        profiles: existingUser.profiles || [DEFAULT_PROFILE],
        activeProfileId: existingUser.activeProfileId || '1',
        securitySettings: existingUser.securitySettings || DEFAULT_SECURITY_SETTINGS,
        achievements: existingUser.achievements || DEFAULT_ACHIEVEMENTS,
        streaks: existingUser.streaks || DEFAULT_STREAK_DATA,
      },
      // Phase 3 additions
      recurringExpenses: existingData.recurringExpenses || [],
      profiles: existingData.profiles || [DEFAULT_PROFILE],
      achievements: existingData.achievements || DEFAULT_ACHIEVEMENTS,
      backupHistory: existingData.backupHistory || [],
    };
  }

  // Save entire app data
  saveAppData(data: AppData): void {
    this.setItem(STORAGE_KEYS.APP_DATA, data);
  }

  // Get entire app data
  getAppData(): AppData {
    return this.getItem<AppData>(STORAGE_KEYS.APP_DATA, {
      expenses: [],
      incomes: [],
      categories: DEFAULT_CATEGORIES,
      savingsGoals: [],
      insights: [],
      alerts: [],
      user: DEFAULT_USER,
      // Phase 3 additions
      recurringExpenses: [],
      profiles: [DEFAULT_PROFILE],
      achievements: DEFAULT_ACHIEVEMENTS,
      backupHistory: [],
    });
  }

  // Expense operations
  saveExpenses(expenses: Expense[]): void {
    const data = this.getAppData();
    data.expenses = expenses;
    this.saveAppData(data);
  }

  getExpenses(): Expense[] {
    return this.getAppData().expenses;
  }

  addExpense(expense: Expense): void {
    const data = this.getAppData();
    data.expenses.push(expense);
    this.saveAppData(data);
  }

  updateExpense(expense: Expense): void {
    const data = this.getAppData();
    const index = data.expenses.findIndex(e => e.id === expense.id);
    if (index !== -1) {
      data.expenses[index] = expense;
      this.saveAppData(data);
    }
  }

  deleteExpense(id: string): void {
    const data = this.getAppData();
    data.expenses = data.expenses.filter(e => e.id !== id);
    this.saveAppData(data);
  }

  // Income operations
  saveIncomes(incomes: Income[]): void {
    const data = this.getAppData();
    data.incomes = incomes;
    this.saveAppData(data);
  }

  getIncomes(): Income[] {
    return this.getAppData().incomes;
  }

  addIncome(income: Income): void {
    const data = this.getAppData();
    data.incomes.push(income);
    this.saveAppData(data);
  }

  updateIncome(income: Income): void {
    const data = this.getAppData();
    const index = data.incomes.findIndex(i => i.id === income.id);
    if (index !== -1) {
      data.incomes[index] = income;
      this.saveAppData(data);
    }
  }

  deleteIncome(id: string): void {
    const data = this.getAppData();
    data.incomes = data.incomes.filter(i => i.id !== id);
    this.saveAppData(data);
  }

  // Category operations
  saveCategories(categories: Category[]): void {
    const data = this.getAppData();
    data.categories = categories;
    this.saveAppData(data);
  }

  getCategories(): Category[] {
    return this.getAppData().categories;
  }

  addCategory(category: Category): void {
    const data = this.getAppData();
    data.categories.push(category);
    this.saveAppData(data);
  }

  updateCategory(category: Category): void {
    const data = this.getAppData();
    const index = data.categories.findIndex(c => c.id === category.id);
    if (index !== -1) {
      data.categories[index] = category;
      this.saveAppData(data);
    }
  }

  deleteCategory(id: string): void {
    const data = this.getAppData();
    data.categories = data.categories.filter(c => c.id !== id);
    this.saveAppData(data);
  }

  // User operations
  saveUser(user: User): void {
    const data = this.getAppData();
    data.user = user;
    this.saveAppData(data);
  }

  getUser(): User {
    return this.getAppData().user;
  }

  updateUserPreferences(preferences: User['preferences']): void {
    const data = this.getAppData();
    // Ensure user and preferences exist
    if (!data.user) {
      data.user = DEFAULT_USER;
    }
    if (!data.user.preferences) {
      data.user.preferences = DEFAULT_USER.preferences;
    }
    data.user.preferences = preferences;
    data.user.updatedAt = new Date().toISOString();
    this.saveAppData(data);
  }

  // Budget limits operations
  addBudgetLimit(budgetLimit: BudgetLimit): void {
    const data = this.getAppData();
    // Ensure user and preferences exist
    if (!data.user) {
      data.user = DEFAULT_USER;
    }
    if (!data.user.preferences) {
      data.user.preferences = DEFAULT_USER.preferences;
    }
    if (!data.user.preferences.budgetLimits) {
      data.user.preferences.budgetLimits = [];
    }
    data.user.preferences.budgetLimits.push(budgetLimit);
    data.user.updatedAt = new Date().toISOString();
    this.saveAppData(data);
  }

  updateBudgetLimit(budgetLimit: BudgetLimit): void {
    const data = this.getAppData();
    // Ensure user and preferences exist
    if (!data.user) {
      data.user = DEFAULT_USER;
    }
    if (!data.user.preferences) {
      data.user.preferences = DEFAULT_USER.preferences;
    }
    if (!data.user.preferences.budgetLimits) {
      data.user.preferences.budgetLimits = [];
    }
    const index = data.user.preferences.budgetLimits.findIndex(b => b.id === budgetLimit.id);
    if (index !== -1) {
      data.user.preferences.budgetLimits[index] = budgetLimit;
      data.user.updatedAt = new Date().toISOString();
      this.saveAppData(data);
    }
  }

  deleteBudgetLimit(id: string): void {
    const data = this.getAppData();
    // Ensure user and preferences exist
    if (!data.user) {
      data.user = DEFAULT_USER;
    }
    if (!data.user.preferences) {
      data.user.preferences = DEFAULT_USER.preferences;
    }
    if (!data.user.preferences.budgetLimits) {
      data.user.preferences.budgetLimits = [];
    }
    data.user.preferences.budgetLimits = data.user.preferences.budgetLimits.filter(b => b.id !== id);
    data.user.updatedAt = new Date().toISOString();
    this.saveAppData(data);
  }

  // Savings goals operations
  saveSavingsGoals(goals: SavingsGoal[]): void {
    const data = this.getAppData();
    data.savingsGoals = goals;
    this.saveAppData(data);
  }

  getSavingsGoals(): SavingsGoal[] {
    return this.getAppData().savingsGoals;
  }

  addSavingsGoal(goal: SavingsGoal): void {
    const data = this.getAppData();
    data.savingsGoals.push(goal);
    this.saveAppData(data);
  }

  updateSavingsGoal(goal: SavingsGoal): void {
    const data = this.getAppData();
    const index = data.savingsGoals.findIndex(g => g.id === goal.id);
    if (index !== -1) {
      data.savingsGoals[index] = goal;
      this.saveAppData(data);
    }
  }

  deleteSavingsGoal(id: string): void {
    const data = this.getAppData();
    data.savingsGoals = data.savingsGoals.filter(g => g.id !== id);
    this.saveAppData(data);
  }

  // Insights operations
  saveInsights(insights: SpendingInsight[]): void {
    const data = this.getAppData();
    data.insights = insights;
    this.saveAppData(data);
  }

  getInsights(): SpendingInsight[] {
    return this.getAppData().insights;
  }

  addInsight(insight: SpendingInsight): void {
    const data = this.getAppData();
    data.insights.push(insight);
    this.saveAppData(data);
  }

  markInsightAsRead(id: string): void {
    const data = this.getAppData();
    const insight = data.insights.find(i => i.id === id);
    if (insight) {
      insight.isRead = true;
      this.saveAppData(data);
    }
  }

  // Alerts operations
  saveAlerts(alerts: SpendingAlert[]): void {
    const data = this.getAppData();
    data.alerts = alerts;
    this.saveAppData(data);
  }

  getAlerts(): SpendingAlert[] {
    return this.getAppData().alerts;
  }

  addAlert(alert: SpendingAlert): void {
    const data = this.getAppData();
    data.alerts.push(alert);
    this.saveAppData(data);
  }

  markAlertAsRead(id: string): void {
    const data = this.getAppData();
    const alert = data.alerts.find(a => a.id === id);
    if (alert) {
      alert.isRead = true;
      this.saveAppData(data);
    }
  }

  deleteAlert(id: string): void {
    const data = this.getAppData();
    data.alerts = data.alerts.filter(a => a.id !== id);
    this.saveAppData(data);
  }

  // Phase 3: Recurring Expenses operations
  saveRecurringExpenses(recurringExpenses: RecurringExpense[]): void {
    const data = this.getAppData();
    data.recurringExpenses = recurringExpenses;
    this.saveAppData(data);
  }

  getRecurringExpenses(): RecurringExpense[] {
    return this.getAppData().recurringExpenses;
  }

  addRecurringExpense(recurringExpense: RecurringExpense): void {
    const data = this.getAppData();
    data.recurringExpenses.push(recurringExpense);
    this.saveAppData(data);
  }

  updateRecurringExpense(recurringExpense: RecurringExpense): void {
    const data = this.getAppData();
    const index = data.recurringExpenses.findIndex(r => r.id === recurringExpense.id);
    if (index !== -1) {
      data.recurringExpenses[index] = recurringExpense;
      this.saveAppData(data);
    }
  }

  deleteRecurringExpense(id: string): void {
    const data = this.getAppData();
    data.recurringExpenses = data.recurringExpenses.filter(r => r.id !== id);
    this.saveAppData(data);
  }

  // Phase 3: User Profiles operations
  saveProfiles(profiles: UserProfile[]): void {
    const data = this.getAppData();
    data.profiles = profiles;
    this.saveAppData(data);
  }

  getProfiles(): UserProfile[] {
    return this.getAppData().profiles;
  }

  addProfile(profile: UserProfile): void {
    const data = this.getAppData();
    data.profiles.push(profile);
    this.saveAppData(data);
  }

  updateProfile(profile: UserProfile): void {
    const data = this.getAppData();
    const index = data.profiles.findIndex(p => p.id === profile.id);
    if (index !== -1) {
      data.profiles[index] = profile;
      this.saveAppData(data);
    }
  }

  deleteProfile(id: string): void {
    const data = this.getAppData();
    data.profiles = data.profiles.filter(p => p.id !== id);
    this.saveAppData(data);
  }

  setActiveProfile(profileId: string): void {
    const data = this.getAppData();
    // Ensure user exists
    if (!data.user) {
      data.user = DEFAULT_USER;
    }
    data.user.activeProfileId = profileId;
    data.user.updatedAt = new Date().toISOString();
    this.saveAppData(data);
  }

  // Phase 3: Achievements operations
  saveAchievements(achievements: Achievement[]): void {
    const data = this.getAppData();
    data.achievements = achievements;
    this.saveAppData(data);
  }

  getAchievements(): Achievement[] {
    return this.getAppData().achievements;
  }

  unlockAchievement(id: string): void {
    const data = this.getAppData();
    const achievement = data.achievements.find(a => a.id === id);
    if (achievement && !achievement.isUnlocked) {
      achievement.isUnlocked = true;
      achievement.unlockedAt = new Date().toISOString();
      this.saveAppData(data);
    }
  }

  updateAchievementProgress(id: string, progress: number): void {
    const data = this.getAppData();
    const achievement = data.achievements.find(a => a.id === id);
    if (achievement) {
      achievement.progress = Math.min(progress, achievement.maxProgress);
      if (achievement.progress >= achievement.maxProgress && !achievement.isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date().toISOString();
      }
      this.saveAppData(data);
    }
  }

  // Phase 3: Security operations
  updateSecuritySettings(securitySettings: SecuritySettings): void {
    const data = this.getAppData();
    // Ensure user exists
    if (!data.user) {
      data.user = DEFAULT_USER;
    }
    data.user.securitySettings = securitySettings;
    data.user.updatedAt = new Date().toISOString();
    this.saveAppData(data);
  }

  getSecuritySettings(): SecuritySettings {
    const data = this.getAppData();
    // Ensure user exists
    if (!data.user) {
      data.user = DEFAULT_USER;
    }
    return data.user.securitySettings || DEFAULT_SECURITY_SETTINGS;
  }

  // Phase 3: Backup operations
  saveBackupHistory(backupHistory: BackupRecord[]): void {
    const data = this.getAppData();
    data.backupHistory = backupHistory;
    this.saveAppData(data);
  }

  getBackupHistory(): BackupRecord[] {
    return this.getAppData().backupHistory;
  }

  addBackupRecord(backupRecord: BackupRecord): void {
    const data = this.getAppData();
    data.backupHistory.push(backupRecord);
    this.saveAppData(data);
  }

  // Phase 3: Streak operations
  updateStreakData(streakData: StreakData): void {
    const data = this.getAppData();
    // Ensure user exists
    if (!data.user) {
      data.user = DEFAULT_USER;
    }
    data.user.streaks = streakData;
    data.user.updatedAt = new Date().toISOString();
    this.saveAppData(data);
  }

  getStreakData(): StreakData {
    const data = this.getAppData();
    // Ensure user exists
    if (!data.user) {
      data.user = DEFAULT_USER;
    }
    return data.user.streaks || DEFAULT_STREAK_DATA;
  }

  // Clear all data
  clearAllData(): void {
    try {
      const storage = this.getStorage();
      Object.keys(STORAGE_KEYS).forEach((key: string) => {
        storage.removeItem(STORAGE_KEYS[key as keyof typeof STORAGE_KEYS]);
      });
    } catch (error) {
      console.error(`Error clearing storage: ${error}`);
    }
  }

  // Phase 3: Enhanced export/import with encryption support
  exportData(encrypted: boolean = false): string {
    const data = this.getAppData();
    const exportData = {
      ...data,
      exportDate: new Date().toISOString(),
      version: '3.0.0',
    };
    
    if (encrypted) {
      // TODO: Implement encryption
      console.warn('Encryption not yet implemented');
    }
    
    return JSON.stringify(exportData, null, 2);
  }

  importData(jsonData: string, encrypted: boolean = false): boolean {
    try {
      if (encrypted) {
        // TODO: Implement decryption
        console.warn('Decryption not yet implemented');
      }
      
      const data = JSON.parse(jsonData);
      
      // Validate data structure
      if (!data.expenses || !data.incomes || !data.categories) {
        throw new Error('Invalid data structure');
      }
      
      // Migrate imported data to current version
      const migratedData = this.migrateData(data);
      this.saveAppData(migratedData);
      return true;
    } catch (error) {
      console.error(`Error importing data: ${error}`);
      return false;
    }
  }

  // Phase 3: Cloud sync placeholder
  async syncToCloud(): Promise<boolean> {
    // TODO: Implement cloud sync
    console.warn('Cloud sync not yet implemented');
    return false;
  }

  async syncFromCloud(): Promise<boolean> {
    // TODO: Implement cloud sync
    console.warn('Cloud sync not yet implemented');
    return false;
  }

  // SurrealDB Integration Methods
  async isSurrealDBAvailable(): Promise<boolean> {
    try {
      await surrealDB.connect();
      return true;
    } catch (error) {
      console.log('SurrealDB not available:', error);
      return false;
    }
  }

  async migrateToSurrealDB(): Promise<boolean> {
    try {
      const isAvailable = await this.isSurrealDBAvailable();
      if (!isAvailable) {
        console.log('SurrealDB not available for migration');
        return false;
      }

      const localData = this.getAppData();
      
      // Create user in SurrealDB
      const user = await surrealDB.createUser(localData.user);
      if (!user) {
        console.error('Failed to create user in SurrealDB');
        return false;
      }

      const userId = typeof user.id === 'object' ? user.id.id : user.id;

      // Migrate expenses
      for (const expense of localData.expenses) {
        await surrealDB.createExpense({
          ...expense,
          userId: userId
        });
      }

      // Migrate incomes
      for (const income of localData.incomes) {
        await surrealDB.createIncome({
          ...income,
          userId: userId
        });
      }

      // Migrate categories
      for (const category of localData.categories) {
        await surrealDB.createCategory({
          ...category,
          userId: userId
        });
      }

      console.log('✅ Successfully migrated data to SurrealDB');
      return true;
    } catch (error) {
      console.error('❌ Error migrating to SurrealDB:', error);
      return false;
    }
  }

  async getSurrealDBStatus(): Promise<{ connected: boolean; message: string }> {
    try {
      const isAvailable = await this.isSurrealDBAvailable();
      if (isAvailable) {
        return { connected: true, message: 'Connected to SurrealDB' };
      } else {
        return { connected: false, message: 'SurrealDB not available' };
      }
    } catch (error) {
      return { connected: false, message: `Error: ${error}` };
    }
  }
}

export const storage = StorageManager.getInstance();
export { DEFAULT_CATEGORIES, DEFAULT_USER, DEFAULT_ALERT_SETTINGS }; 