import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, differenceInDays, addDays, addWeeks, addMonths, addYears, isSameDay, isToday } from 'date-fns';
import { Expense, Income, FinancialSummary, ExpenseSummary, IncomeSummary, SpendingInsight, SpendingAlert, BudgetLimit, SavingsGoal, RecurringExpense, Achievement, StreakData, ReceiptData, ChartData, ChartDataPoint, CalendarViewData, CalendarDay } from './types';
import CryptoJS from 'crypto-js';

// Date utilities
export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatCurrency = (amount: number, currency: string = '₹'): string => {
  return `${currency}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const getDateRange = (period: 'day' | 'week' | 'month' | 'year') => {
  const now = new Date();
  
  switch (period) {
    case 'day':
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };
    case 'week':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case 'month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    case 'year':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
      };
  }
};

// Filter expenses by date range
export const filterExpensesByPeriod = (expenses: Expense[], period: 'day' | 'week' | 'month' | 'year'): Expense[] => {
  const { start, end } = getDateRange(period);
  
  return expenses.filter(expense => {
    const expenseDate = parseISO(expense.date);
    return isWithinInterval(expenseDate, { start, end });
  });
};

// Filter incomes by date range
export const filterIncomesByPeriod = (incomes: Income[], period: 'day' | 'week' | 'month' | 'year'): Income[] => {
  const { start, end } = getDateRange(period);
  
  return incomes.filter(income => {
    const incomeDate = parseISO(income.date);
    return isWithinInterval(incomeDate, { start, end });
  });
};

// Calculate expense summary
export const calculateExpenseSummary = (expenses: Expense[], period: 'day' | 'week' | 'month' | 'year'): ExpenseSummary => {
  const filteredExpenses = filterExpensesByPeriod(expenses, period);
  
  const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const byCategory: Record<string, number> = {};
  const byDate: Record<string, number> = {};
  
  filteredExpenses.forEach(expense => {
    // Group by category
    byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
    
    // Group by date
    const dateKey = formatDate(expense.date, 'yyyy-MM-dd');
    byDate[dateKey] = (byDate[dateKey] || 0) + expense.amount;
  });
  
  return {
    total,
    byCategory,
    byDate,
    count: filteredExpenses.length,
  };
};

// Calculate income summary
export const calculateIncomeSummary = (incomes: Income[], period: 'day' | 'week' | 'month' | 'year'): IncomeSummary => {
  const filteredIncomes = filterIncomesByPeriod(incomes, period);
  
  const total = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  const bySource: Record<string, number> = {};
  const byDate: Record<string, number> = {};
  
  filteredIncomes.forEach(income => {
    // Group by source
    bySource[income.source] = (bySource[income.source] || 0) + income.amount;
    
    // Group by date
    const dateKey = formatDate(income.date, 'yyyy-MM-dd');
    byDate[dateKey] = (byDate[dateKey] || 0) + income.amount;
  });
  
  return {
    total,
    bySource,
    byDate,
    count: filteredIncomes.length,
  };
};

// Calculate financial summary
export const calculateFinancialSummary = (
  expenses: Expense[],
  incomes: Income[],
  period: 'day' | 'week' | 'month' | 'year'
): FinancialSummary => {
  const expenseSummary = calculateExpenseSummary(expenses, period);
  const incomeSummary = calculateIncomeSummary(incomes, period);
  
  const totalIncome = incomeSummary.total;
  const totalExpenses = expenseSummary.total;
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  
  return {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    period,
  };
};

// Check budget limits and generate alerts
export const checkBudgetLimits = (
  expenses: Expense[],
  budgetLimits: BudgetLimit[],
  period: 'day' | 'week' | 'month'
): SpendingAlert[] => {
  const alerts: SpendingAlert[] = [];
  const filteredExpenses = filterExpensesByPeriod(expenses, period);
  
  budgetLimits.forEach(limit => {
    if (!limit.isActive) return;
    
    const categoryExpenses = filteredExpenses.filter(expense => expense.category === limit.category);
    const totalSpent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    if (totalSpent > limit.amount) {
      const percentage = (totalSpent / limit.amount) * 100;
      const severity = percentage > 150 ? 'high' : percentage > 120 ? 'medium' : 'low';
      
      alerts.push({
        id: `alert-${Date.now()}-${limit.id}`,
        type: 'budget_limit',
        title: `Budget Limit Exceeded`,
        message: `You've exceeded your ${limit.category} budget by ${formatCurrency(totalSpent - limit.amount)} (${percentage.toFixed(1)}% over limit)`,
        category: limit.category,
        amount: totalSpent,
        limit: limit.amount,
        period,
        date: new Date().toISOString(),
        isRead: false,
        severity,
      });
    }
  });
  
  return alerts;
};

// Check overspending patterns
export const checkOverspending = (
  expenses: Expense[],
  monthlyBudget?: number,
  period: 'day' | 'week' | 'month' = 'month'
): SpendingAlert[] => {
  const alerts: SpendingAlert[] = [];
  
  if (!monthlyBudget) return alerts;
  
  const filteredExpenses = filterExpensesByPeriod(expenses, period);
  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate budget for the current period
  let periodBudget: number;
  switch (period) {
    case 'day':
      periodBudget = monthlyBudget / 30;
      break;
    case 'week':
      periodBudget = monthlyBudget / 4;
      break;
    case 'month':
      periodBudget = monthlyBudget;
      break;
  }
  
  if (totalSpent > periodBudget) {
    const percentage = (totalSpent / periodBudget) * 100;
    const severity = percentage > 150 ? 'high' : percentage > 120 ? 'medium' : 'low';
    
    alerts.push({
      id: `alert-${Date.now()}-overspending`,
      type: 'overspending',
      title: `Overspending Alert`,
      message: `You've spent ${formatCurrency(totalSpent)} this ${period}, which is ${formatCurrency(totalSpent - periodBudget)} over your budget`,
      amount: totalSpent,
      limit: periodBudget,
      period,
      date: new Date().toISOString(),
      isRead: false,
      severity,
    });
  }
  
  return alerts;
};

// Calculate savings goal progress
export const calculateSavingsGoalProgress = (goal: SavingsGoal, incomes: Income[], expenses: Expense[]): {
  progress: number;
  remaining: number;
  daysLeft: number;
  isOnTrack: boolean;
} => {
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  
  const progress = Math.min((netSavings / goal.targetAmount) * 100, 100);
  const remaining = Math.max(goal.targetAmount - netSavings, 0);
  
  let daysLeft = 0;
  let isOnTrack = false;
  
  if (goal.targetDate) {
    const targetDate = parseISO(goal.targetDate);
    const today = new Date();
    daysLeft = Math.max(differenceInDays(targetDate, today), 0);
    
    // Calculate if on track to meet goal
    const dailyRequired = remaining / daysLeft;
    const dailyActual = netSavings / Math.max(differenceInDays(today, parseISO(goal.createdAt)), 1);
    isOnTrack = dailyActual >= dailyRequired;
  }
  
  return {
    progress,
    remaining,
    daysLeft,
    isOnTrack,
  };
};

// Generate AI insights with Phase 2 enhancements
export const generateSpendingInsights = (
  expenses: Expense[],
  categories: any[],
  period: 'day' | 'week' | 'month' | 'year',
  budgetLimits: BudgetLimit[] = [],
  savingsGoals: SavingsGoal[] = []
): SpendingInsight[] => {
  const insights: SpendingInsight[] = [];
  const currentPeriodExpenses = filterExpensesByPeriod(expenses, period);
  const previousPeriodExpenses = getPreviousPeriodExpenses(expenses, period);
  
  if (currentPeriodExpenses.length === 0) {
    return insights;
  }
  
  // Calculate current period totals by category
  const currentByCategory: Record<string, number> = {};
  currentPeriodExpenses.forEach(expense => {
    currentByCategory[expense.category] = (currentByCategory[expense.category] || 0) + expense.amount;
  });
  
  // Calculate previous period totals by category
  const previousByCategory: Record<string, number> = {};
  previousPeriodExpenses.forEach(expense => {
    previousByCategory[expense.category] = (previousByCategory[expense.category] || 0) + expense.amount;
  });
  
  // Generate insights for each category
  Object.keys(currentByCategory).forEach(category => {
    const currentAmount = currentByCategory[category];
    const previousAmount = previousByCategory[category] || 0;
    
    if (previousAmount > 0) {
      const percentageChange = ((currentAmount - previousAmount) / previousAmount) * 100;
      
      if (percentageChange > 20) {
        insights.push({
          id: `insight-${Date.now()}-${category}`,
          type: 'spending_increase',
          title: `Spending Increase in ${category}`,
          message: `You spent ${Math.abs(percentageChange).toFixed(1)}% more on ${category} this ${period} compared to last ${period}.`,
          category,
          percentage: percentageChange,
          date: new Date().toISOString(),
          isRead: false,
          severity: percentageChange > 50 ? 'high' : percentageChange > 30 ? 'medium' : 'low',
        });
      } else if (percentageChange < -20) {
        insights.push({
          id: `insight-${Date.now()}-${category}`,
          type: 'spending_decrease',
          title: `Great Job on ${category} Spending!`,
          message: `You spent ${Math.abs(percentageChange).toFixed(1)}% less on ${category} this ${period} compared to last ${period}. Keep it up!`,
          category,
          percentage: percentageChange,
          date: new Date().toISOString(),
          isRead: false,
          severity: 'low',
        });
      }
    }
  });
  
  // Budget limit insights
  budgetLimits.forEach(limit => {
    if (!limit.isActive) return;
    
    const categoryExpenses = currentPeriodExpenses.filter(expense => expense.category === limit.category);
    const totalSpent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    if (totalSpent > limit.amount * 0.8) { // Alert at 80% of budget
      const percentage = (totalSpent / limit.amount) * 100;
      insights.push({
        id: `insight-${Date.now()}-budget-${limit.category}`,
        type: 'budget_alert',
        title: `${limit.category} Budget Alert`,
        message: `You've used ${percentage.toFixed(1)}% of your ${limit.category} budget. Consider slowing down spending in this category.`,
        category: limit.category,
        percentage,
        date: new Date().toISOString(),
        isRead: false,
        severity: percentage > 90 ? 'high' : 'medium',
      });
    }
  });
  
  // Savings goal insights
  savingsGoals.forEach(goal => {
    if (goal.isCompleted) return;
    
    const { progress, daysLeft, isOnTrack } = calculateSavingsGoalProgress(goal, [], currentPeriodExpenses);
    
    if (progress > 50 && !isOnTrack && daysLeft < 30) {
      insights.push({
        id: `insight-${Date.now()}-goal-${goal.id}`,
        type: 'savings_tip',
        title: `Savings Goal: ${goal.name}`,
        message: `You're ${progress.toFixed(1)}% to your goal but need to save ${formatCurrency(goal.targetAmount - progress)} more in ${daysLeft} days.`,
        date: new Date().toISOString(),
        isRead: false,
        severity: 'medium',
      });
    }
  });
  
  // Top spending category insight
  const topCategory = Object.keys(currentByCategory).reduce((a: string, b: string) => 
    currentByCategory[a] > currentByCategory[b] ? a : b
  );
  
  if (topCategory) {
    const topAmount = currentByCategory[topCategory];
    const totalSpending = Object.keys(currentByCategory).reduce((sum: number, key: string) => sum + currentByCategory[key], 0);
    const percentage = (topAmount / totalSpending) * 100;
    
    if (percentage > 40) {
      insights.push({
        id: `insight-${Date.now()}-top-category`,
        type: 'budget_alert',
        title: `${topCategory} is Your Biggest Expense`,
        message: `${topCategory} accounts for ${percentage.toFixed(1)}% of your total spending this ${period}. Consider reviewing your ${topCategory.toLowerCase()} expenses.`,
        category: topCategory,
        percentage,
        date: new Date().toISOString(),
        isRead: false,
        severity: 'medium',
      });
    }
  }
  
  // Savings tip if no other insights
  if (insights.length === 0) {
    insights.push({
      id: `insight-${Date.now()}-savings-tip`,
      type: 'savings_tip',
      title: 'Great Spending Habits!',
      message: `Your spending patterns look healthy this ${period}. Keep tracking your expenses to maintain good financial habits.`,
      date: new Date().toISOString(),
      isRead: false,
      severity: 'low',
    });
  }
  
  return insights;
};

// Get expenses from previous period
const getPreviousPeriodExpenses = (expenses: Expense[], period: 'day' | 'week' | 'month' | 'year'): Expense[] => {
  const now = new Date();
  let start: Date;
  let end: Date;
  
  switch (period) {
    case 'day':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      end = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      end = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'year':
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear() - 1, 11, 31);
      break;
  }
  
  return expenses.filter(expense => {
    const expenseDate = parseISO(expense.date);
    return isWithinInterval(expenseDate, { start, end });
  });
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Validate amount
export const validateAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 999999999;
};

// Format amount for display
export const formatAmount = (amount: number): string => {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
};

// Get category color
export const getCategoryColor = (categoryName: string, categories: any[]): string => {
  const category = categories.find(cat => cat.name === categoryName);
  return category?.color || '#6b7280';
};

// Get category icon
export const getCategoryIcon = (categoryName: string, categories: any[]): string => {
  const category = categories.find(cat => cat.name === categoryName);
  return category?.icon || '📝';
};

// Sort expenses by date (newest first)
export const sortExpensesByDate = (expenses: Expense[]): Expense[] => {
  return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Sort incomes by date (newest first)
export const sortIncomesByDate = (incomes: Income[]): Income[] => {
  return [...incomes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Get severity color
export const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
  switch (severity) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#10b981';
    default:
      return '#6b7280';
  }
};

// Get severity badge class
export const getSeverityBadgeClass = (severity: 'low' | 'medium' | 'high'): string => {
  switch (severity) {
    case 'high':
      return 'badge-danger';
    case 'medium':
      return 'badge-warning';
    case 'low':
      return 'badge-success';
    default:
      return 'badge-primary';
  }
}; 

// Phase 3: Receipt Scanning Utilities
export const processReceiptImage = async (imageFile: File): Promise<ReceiptData> => {
  try {
    // Convert image to base64
    const base64 = await fileToBase64(imageFile);
    
    // TODO: Implement OCR with Tesseract.js
    // For now, return mock data
    const mockReceiptData: ReceiptData = {
      id: generateId(),
      imageUrl: base64,
      ocrText: 'Mock OCR text from receipt',
      extractedData: {
        merchant: 'Sample Store',
        total: 150.00,
        date: new Date().toISOString(),
        items: [
          { name: 'Item 1', quantity: 1, price: 100.00, total: 100.00 },
          { name: 'Item 2', quantity: 1, price: 50.00, total: 50.00 },
        ],
      },
      confidence: 0.85,
      isProcessed: true,
      createdAt: new Date().toISOString(),
    };
    
    return mockReceiptData;
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw error;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Phase 3: Encryption Utilities
export const encryptData = (data: string, password: string): string => {
  return CryptoJS.AES.encrypt(data, password).toString();
};

export const decryptData = (encryptedData: string, password: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, password);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const hashPin = (pin: string): string => {
  return CryptoJS.SHA256(pin).toString();
};

export const verifyPin = (pin: string, hash: string): boolean => {
  return hashPin(pin) === hash;
};

// Phase 3: Recurring Expense Utilities
export const calculateNextDueDate = (recurringExpense: RecurringExpense): string => {
  const currentDate = parseISO(recurringExpense.nextDueDate);
  
  switch (recurringExpense.frequency) {
    case 'daily':
      return addDays(currentDate, 1).toISOString();
    case 'weekly':
      return addWeeks(currentDate, 1).toISOString();
    case 'monthly':
      return addMonths(currentDate, 1).toISOString();
    case 'yearly':
      return addYears(currentDate, 1).toISOString();
    default:
      return currentDate.toISOString();
  }
};

export const isRecurringExpenseDue = (recurringExpense: RecurringExpense): boolean => {
  const dueDate = parseISO(recurringExpense.nextDueDate);
  const today = new Date();
  return isSameDay(dueDate, today) || dueDate < today;
};

export const generateRecurringExpenses = (recurringExpenses: RecurringExpense[]): Expense[] => {
  const today = new Date();
  const generatedExpenses: Expense[] = [];
  
  recurringExpenses.forEach(recurring => {
    if (recurring.isActive && isRecurringExpenseDue(recurring)) {
      const expense: Expense = {
        id: generateId(),
        amount: recurring.amount,
        category: recurring.category,
        date: format(today, 'yyyy-MM-dd'),
        note: recurring.note,
        paymentMethod: recurring.paymentMethod,
        isRecurring: true,
        recurringId: recurring.id,
        profileId: recurring.profileId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      generatedExpenses.push(expense);
    }
  });
  
  return generatedExpenses;
};

// Phase 3: Gamification Utilities
export const calculateStreaks = (expenses: Expense[]): StreakData => {
  const today = new Date();
  const sortedExpenses = expenses
    .map(exp => parseISO(exp.date))
    .sort((a, b) => b.getTime() - a.getTime());
  
  let currentStreak = 0;
  let longestStreak = 0;
  let currentNoSpendStreak = 0;
  let longestNoSpendStreak = 0;
  let noSpendDays = 0;
  let totalNoSpendDays = 0;
  
  // Calculate spending streaks
  let currentDate = today;
  for (let i = 0; i < 365; i++) {
    const hasExpense = sortedExpenses.some(exp => isSameDay(exp, currentDate));
    
    if (hasExpense) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
      noSpendDays++;
      currentNoSpendStreak++;
      longestNoSpendStreak = Math.max(longestNoSpendStreak, currentNoSpendStreak);
    }
    
    currentDate = addDays(currentDate, -1);
  }
  
  return {
    currentStreak,
    longestStreak,
    lastSpendDate: sortedExpenses[0]?.toISOString(),
    noSpendDays,
    totalNoSpendDays: noSpendDays,
    currentNoSpendStreak,
    longestNoSpendStreak,
  };
};

export const checkAchievements = (
  expenses: Expense[],
  savingsGoals: any[],
  budgetLimits: any[],
  currentAchievements: Achievement[]
): Achievement[] => {
  const updatedAchievements = [...currentAchievements];
  const streaks = calculateStreaks(expenses);
  
  // Check streak achievements
  const streakAchievement = updatedAchievements.find(a => a.id === '1');
  if (streakAchievement && !streakAchievement.isUnlocked) {
    streakAchievement.progress = streaks.currentStreak;
    if (streakAchievement.progress >= streakAchievement.maxProgress) {
      streakAchievement.isUnlocked = true;
      streakAchievement.unlockedAt = new Date().toISOString();
    }
  }
  
  // Check no spend day achievement
  const noSpendAchievement = updatedAchievements.find(a => a.id === '3');
  if (noSpendAchievement && !noSpendAchievement.isUnlocked) {
    noSpendAchievement.progress = streaks.noSpendDays > 0 ? 1 : 0;
    if (noSpendAchievement.progress >= noSpendAchievement.maxProgress) {
      noSpendAchievement.isUnlocked = true;
      noSpendAchievement.unlockedAt = new Date().toISOString();
    }
  }
  
  // Check savings achievement
  const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const savingsAchievement = updatedAchievements.find(a => a.id === '2');
  if (savingsAchievement && !savingsAchievement.isUnlocked) {
    savingsAchievement.progress = totalSavings;
    if (savingsAchievement.progress >= savingsAchievement.maxProgress) {
      savingsAchievement.isUnlocked = true;
      savingsAchievement.unlockedAt = new Date().toISOString();
    }
  }
  
  // Check goal achievement
  const completedGoals = savingsGoals.filter(goal => goal.isCompleted).length;
  const goalAchievement = updatedAchievements.find(a => a.id === '5');
  if (goalAchievement && !goalAchievement.isUnlocked) {
    goalAchievement.progress = completedGoals;
    if (goalAchievement.progress >= goalAchievement.maxProgress) {
      goalAchievement.isUnlocked = true;
      goalAchievement.unlockedAt = new Date().toISOString();
    }
  }
  
  return updatedAchievements;
};

// Phase 3: Advanced Chart Utilities
export const generateChartData = (
  expenses: Expense[],
  period: 'day' | 'week' | 'month' | 'year',
  startDate: Date,
  endDate: Date
): ChartData => {
  const data: ChartDataPoint[] = [];
  const categories = new Set<string>();
  let total = 0;
  
  const filteredExpenses = expenses.filter(exp => {
    const expDate = parseISO(exp.date);
    return expDate >= startDate && expDate <= endDate;
  });
  
  // Group expenses by period
  const groupedExpenses = groupExpensesByPeriod(filteredExpenses, period);
  
  Object.entries(groupedExpenses).forEach(([date, periodExpenses]) => {
    const value = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    total += value;
    
    data.push({
      date,
      value,
      label: format(parseISO(date), getDateFormat(period)),
    });
    
    periodExpenses.forEach(exp => categories.add(exp.category));
  });
  
  return {
    period,
    data: data.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()),
    categories: Array.from(categories),
    total,
  };
};

const groupExpensesByPeriod = (expenses: Expense[], period: string): Record<string, Expense[]> => {
  const grouped: Record<string, Expense[]> = {};
  
  expenses.forEach(expense => {
    const date = parseISO(expense.date);
    let key: string;
    
    switch (period) {
      case 'day':
        key = format(date, 'yyyy-MM-dd');
        break;
      case 'week':
        key = format(date, 'yyyy-\'W\'II');
        break;
      case 'month':
        key = format(date, 'yyyy-MM');
        break;
      case 'year':
        key = format(date, 'yyyy');
        break;
      default:
        key = format(date, 'yyyy-MM-dd');
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(expense);
  });
  
  return grouped;
};

const getDateFormat = (period: string): string => {
  switch (period) {
    case 'day':
      return 'MMM dd';
    case 'week':
      return 'MMM dd';
    case 'month':
      return 'MMM yyyy';
    case 'year':
      return 'yyyy';
    default:
      return 'MMM dd';
  }
};

// Phase 3: Calendar View Utilities
export const generateCalendarViewData = (
  expenses: Expense[],
  year: number,
  month: number
): CalendarViewData => {
  const days: CalendarDay[] = [];
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  for (let day = 1; day <= endDate.getDate(); day++) {
    const date = new Date(year, month - 1, day);
    const dateString = format(date, 'yyyy-MM-dd');
    
    const dayExpenses = expenses.filter(exp => exp.date === dateString);
    const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    days.push({
      date: dateString,
      expenses: dayExpenses,
      total,
      hasOverspending: false, // TODO: Check against budget limits
      isNoSpendDay: dayExpenses.length === 0,
    });
  }
  
  return {
    year,
    month,
    days,
  };
};

// Phase 3: Profile Management Utilities
export const hasPermission = (
  profile: any,
  permission: keyof any
): boolean => {
  return profile?.permissions?.[permission] || false;
};

export const canPerformAction = (
  user: any,
  action: string
): boolean => {
  const activeProfile = user.profiles.find((p: any) => p.id === user.activeProfileId);
  return hasPermission(activeProfile, action);
};

// Phase 3: Backup Utilities
export const createBackup = (data: any, type: 'manual' | 'auto' | 'cloud' = 'manual'): any => {
  return {
    id: generateId(),
    type,
    timestamp: new Date().toISOString(),
    size: JSON.stringify(data).length,
    status: 'success' as const,
    data,
  };
};

export const validateBackupData = (data: any): boolean => {
  return !!(data && data.expenses && data.incomes && data.categories);
};

// Phase 3: Security Utilities
export const isAppLocked = (securitySettings: any): boolean => {
  if (!securitySettings.pinEnabled && !securitySettings.biometricEnabled) {
    return false;
  }
  
  const lastUnlock = securitySettings.lastUnlockTime;
  if (!lastUnlock) {
    return true;
  }
  
  const unlockTime = parseISO(lastUnlock);
  const now = new Date();
  const timeoutMinutes = securitySettings.autoLockTimeout || 5;
  
  return (now.getTime() - unlockTime.getTime()) > (timeoutMinutes * 60 * 1000);
};

export const unlockApp = (securitySettings: any): any => {
  return {
    ...securitySettings,
    lastUnlockTime: new Date().toISOString(),
  };
}; 