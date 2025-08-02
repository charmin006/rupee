import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'
import { Expense, Income, Category, SavingsGoal, BudgetLimit, SpendingInsight, SpendingAlert, User } from './types'

class SupabaseService {
  private static instance: SupabaseService
  private currentUserId: string | null = null

  private constructor() {}

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService()
    }
    return SupabaseService.instance
  }

  // Initialize user (create if doesn't exist)
  async initializeUser(userData: Partial<User>): Promise<User> {
    try {
      // For now, we'll use a default user ID since we don't have auth
      this.currentUserId = 'default-user-id'
      
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', this.currentUserId)
        .single()

      if (existingUser) {
        return existingUser as User
      }

      // Create new user
      const newUser: User = {
        id: this.currentUserId,
        email: userData.email || 'user@example.com',
        name: userData.name || 'User',
        preferences: {
          currency: '₹',
          theme: 'light',
          notifications: true,
          defaultPaymentMethod: 'cash',
          monthlyBudget: 50000,
          budgetLimits: [],
          alertSettings: {
            overspendingAlerts: true,
            budgetLimitAlerts: true,
            savingsGoalAlerts: true,
            weeklyInsights: true,
            emailNotifications: false,
            pushNotifications: true
          },
          gamificationEnabled: true,
          autoBackupEnabled: false,
          cloudSyncEnabled: false,
          receiptScanningEnabled: false
        },
        profiles: [],
        activeProfileId: '',
        securitySettings: {
          pinEnabled: false,
          biometricEnabled: false,
          autoLockTimeout: 5,
          requireAuthForExport: true,
          requireAuthForSettings: false
        },
        achievements: [],
        streaks: {
          currentStreak: 0,
          longestStreak: 0,
          noSpendDays: 0,
          totalNoSpendDays: 0,
          currentNoSpendStreak: 0,
          longestNoSpendStreak: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single()

      if (error) throw error
      return data as User
    } catch (error) {
      console.error('Error initializing user:', error)
      throw error
    }
  }

  // Expense operations
  async getExpenses(): Promise<Expense[]> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', this.currentUserId)
        .order('date', { ascending: false })

      if (error) throw error
      return (data || []).map(expense => ({
        id: expense.id,
        amount: expense.amount,
        note: expense.description,
        category: expense.category_id,
        date: expense.date,
        paymentMethod: expense.payment_method,
        createdAt: expense.created_at,
        updatedAt: expense.updated_at
      }))
    } catch (error) {
      console.error('Error fetching expenses:', error)
      return []
    }
  }

  async addExpense(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    try {
      const newExpense = {
        id: uuidv4(),
        user_id: this.currentUserId,
        amount: expenseData.amount,
        description: expenseData.note || '',
        category_id: expenseData.category,
        date: expenseData.date,
        payment_method: expenseData.paymentMethod
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert([newExpense])
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        amount: data.amount,
        note: data.description,
        category: data.category_id,
        date: data.date,
        paymentMethod: data.payment_method,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('Error adding expense:', error)
      throw error
    }
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    try {
      const updateData: any = {}
      if (updates.amount !== undefined) updateData.amount = updates.amount
      if (updates.note !== undefined) updateData.description = updates.note
      if (updates.category !== undefined) updateData.category_id = updates.category
      if (updates.date !== undefined) updateData.date = updates.date
      if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod

      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', this.currentUserId)
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        amount: data.amount,
        note: data.description,
        category: data.category_id,
        date: data.date,
        paymentMethod: data.payment_method,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('Error updating expense:', error)
      throw error
    }
  }

  async deleteExpense(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', this.currentUserId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting expense:', error)
      throw error
    }
  }

  // Income operations
  async getIncomes(): Promise<Income[]> {
    try {
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .eq('user_id', this.currentUserId)
        .order('date', { ascending: false })

      if (error) throw error
      return (data || []).map(income => ({
        id: income.id,
        amount: income.amount,
        source: income.source,
        date: income.date,
        createdAt: income.created_at,
        updatedAt: income.updated_at
      }))
    } catch (error) {
      console.error('Error fetching incomes:', error)
      return []
    }
  }

  async addIncome(incomeData: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>): Promise<Income> {
    try {
      const newIncome = {
        id: uuidv4(),
        user_id: this.currentUserId,
        amount: incomeData.amount,
        source: incomeData.source,
        date: incomeData.date
      }

      const { data, error } = await supabase
        .from('incomes')
        .insert([newIncome])
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        amount: data.amount,
        source: data.source,
        date: data.date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('Error adding income:', error)
      throw error
    }
  }

  async updateIncome(id: string, updates: Partial<Income>): Promise<Income> {
    try {
      const updateData: any = {}
      if (updates.amount !== undefined) updateData.amount = updates.amount
      if (updates.source !== undefined) updateData.source = updates.source
      if (updates.date !== undefined) updateData.date = updates.date

      const { data, error } = await supabase
        .from('incomes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', this.currentUserId)
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        amount: data.amount,
        source: data.source,
        date: data.date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('Error updating income:', error)
      throw error
    }
  }

  async deleteIncome(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id)
        .eq('user_id', this.currentUserId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting income:', error)
      throw error
    }
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', this.currentUserId)
        .order('name')

      if (error) throw error
      return (data || []).map(category => ({
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        isCustom: category.is_custom,
        createdAt: category.created_at,
        updatedAt: category.updated_at
      }))
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  async addCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    try {
      const newCategory = {
        id: uuidv4(),
        user_id: this.currentUserId,
        name: categoryData.name,
        color: categoryData.color,
        icon: categoryData.icon,
        is_custom: categoryData.isCustom
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([newCategory])
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        name: data.name,
        color: data.color,
        icon: data.icon,
        isCustom: data.is_custom,
        createdAt: data.created_at
      }
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    try {
      const updateData: any = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.color !== undefined) updateData.color = updates.color
      if (updates.icon !== undefined) updateData.icon = updates.icon
      if (updates.isCustom !== undefined) updateData.is_custom = updates.isCustom

      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', this.currentUserId)
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        name: data.name,
        color: data.color,
        icon: data.icon,
        isCustom: data.is_custom,
        createdAt: data.created_at
      }
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', this.currentUserId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }

  // Savings goals operations
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', this.currentUserId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(goal => ({
        id: goal.id,
        name: goal.name,
        targetAmount: goal.target_amount,
        currentAmount: goal.current_amount,
        targetDate: goal.target_date,
        createdAt: goal.created_at,
        updatedAt: goal.updated_at,
        isCompleted: goal.current_amount >= goal.target_amount
      }))
    } catch (error) {
      console.error('Error fetching savings goals:', error)
      return []
    }
  }

  async addSavingsGoal(goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'>): Promise<SavingsGoal> {
    try {
      const newGoal = {
        id: uuidv4(),
        user_id: this.currentUserId,
        name: goalData.name,
        target_amount: goalData.targetAmount,
        current_amount: goalData.currentAmount,
        target_date: goalData.targetDate
      }

      const { data, error } = await supabase
        .from('savings_goals')
        .insert([newGoal])
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        name: data.name,
        targetAmount: data.target_amount,
        currentAmount: data.current_amount,
        targetDate: data.target_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isCompleted: data.current_amount >= data.target_amount
      }
    } catch (error) {
      console.error('Error adding savings goal:', error)
      throw error
    }
  }

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
    try {
      const updateData: any = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount
      if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount
      if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate

      const { data, error } = await supabase
        .from('savings_goals')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', this.currentUserId)
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        name: data.name,
        targetAmount: data.target_amount,
        currentAmount: data.current_amount,
        targetDate: data.target_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isCompleted: data.current_amount >= data.target_amount
      }
    } catch (error) {
      console.error('Error updating savings goal:', error)
      throw error
    }
  }

  async deleteSavingsGoal(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', this.currentUserId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting savings goal:', error)
      throw error
    }
  }

  // Budget limits operations
  async getBudgetLimits(): Promise<BudgetLimit[]> {
    try {
      const { data, error } = await supabase
        .from('budget_limits')
        .select('*')
        .eq('user_id', this.currentUserId)
        .eq('is_active', true)

      if (error) throw error
      return (data || []).map(limit => ({
        id: limit.id,
        category: limit.category_id,
        amount: limit.amount,
        period: limit.period,
        isActive: limit.is_active,
        createdAt: limit.created_at,
        updatedAt: limit.updated_at
      }))
    } catch (error) {
      console.error('Error fetching budget limits:', error)
      return []
    }
  }

  async addBudgetLimit(limitData: Omit<BudgetLimit, 'id' | 'createdAt' | 'updatedAt'>): Promise<BudgetLimit> {
    try {
      const newLimit = {
        id: uuidv4(),
        user_id: this.currentUserId,
        category_id: limitData.category,
        amount: limitData.amount,
        period: limitData.period,
        is_active: limitData.isActive
      }

      const { data, error } = await supabase
        .from('budget_limits')
        .insert([newLimit])
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        category: data.category_id,
        amount: data.amount,
        period: data.period,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('Error adding budget limit:', error)
      throw error
    }
  }

  async updateBudgetLimit(id: string, updates: Partial<BudgetLimit>): Promise<BudgetLimit> {
    try {
      const updateData: any = {}
      if (updates.category !== undefined) updateData.category_id = updates.category
      if (updates.amount !== undefined) updateData.amount = updates.amount
      if (updates.period !== undefined) updateData.period = updates.period
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive

      const { data, error } = await supabase
        .from('budget_limits')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', this.currentUserId)
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        category: data.category_id,
        amount: data.amount,
        period: data.period,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('Error updating budget limit:', error)
      throw error
    }
  }

  async deleteBudgetLimit(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('budget_limits')
        .delete()
        .eq('id', id)
        .eq('user_id', this.currentUserId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting budget limit:', error)
      throw error
    }
  }

  // User operations
  async getUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', this.currentUserId)
        .single()

      if (error) throw error
      return data as User
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  async updateUser(updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', this.currentUserId)
        .select()
        .single()

      if (error) throw error
      return data as User
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  // Insights operations
  async getInsights(): Promise<SpendingInsight[]> {
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', this.currentUserId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(insight => ({
        id: insight.id,
        type: insight.type,
        title: insight.title,
        message: insight.description,
        date: insight.created_at,
        isRead: insight.is_read,
        severity: 'medium'
      }))
    } catch (error) {
      console.error('Error fetching insights:', error)
      return []
    }
  }

  async addInsight(insightData: Omit<SpendingInsight, 'id' | 'date'>): Promise<SpendingInsight> {
    try {
      const newInsight = {
        id: uuidv4(),
        user_id: this.currentUserId,
        type: insightData.type,
        title: insightData.title,
        description: insightData.message,
        is_read: insightData.isRead
      }

      const { data, error } = await supabase
        .from('insights')
        .insert([newInsight])
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        type: data.type,
        title: data.title,
        message: data.description,
        date: data.created_at,
        isRead: data.is_read,
        severity: 'medium'
      }
    } catch (error) {
      console.error('Error adding insight:', error)
      throw error
    }
  }

  async markInsightAsRead(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('insights')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', this.currentUserId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking insight as read:', error)
      throw error
    }
  }

  // Alerts operations
  async getAlerts(): Promise<SpendingAlert[]> {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', this.currentUserId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(alert => ({
        id: alert.id,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        date: alert.created_at,
        isRead: alert.is_read,
        amount: 0,
        limit: 0,
        period: 'month'
      }))
    } catch (error) {
      console.error('Error fetching alerts:', error)
      return []
    }
  }

  async addAlert(alertData: Omit<SpendingAlert, 'id' | 'date'>): Promise<SpendingAlert> {
    try {
      const newAlert = {
        id: uuidv4(),
        user_id: this.currentUserId,
        type: alertData.type,
        title: alertData.title,
        message: alertData.message,
        severity: alertData.severity,
        is_read: alertData.isRead
      }

      const { data, error } = await supabase
        .from('alerts')
        .insert([newAlert])
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        type: data.type,
        title: data.title,
        message: data.message,
        severity: data.severity,
        date: data.created_at,
        isRead: data.is_read,
        amount: 0,
        limit: 0,
        period: 'month'
      }
    } catch (error) {
      console.error('Error adding alert:', error)
      throw error
    }
  }

  async markAlertAsRead(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', this.currentUserId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking alert as read:', error)
      throw error
    }
  }

  async deleteAlert(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id)
        .eq('user_id', this.currentUserId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting alert:', error)
      throw error
    }
  }

  // Recurring expenses operations
  async getRecurringExpenses(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('user_id', this.currentUserId)
        .eq('is_active', true)
        .order('next_due_date')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching recurring expenses:', error)
      return []
    }
  }

  async addRecurringExpense(expenseData: any): Promise<any> {
    try {
      const newExpense = {
        id: uuidv4(),
        user_id: this.currentUserId,
        amount: expenseData.amount,
        description: expenseData.description,
        category_id: expenseData.category_id,
        frequency: expenseData.frequency,
        next_due_date: expenseData.next_due_date,
        is_active: expenseData.is_active
      }

      const { data, error } = await supabase
        .from('recurring_expenses')
        .insert([newExpense])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding recurring expense:', error)
      throw error
    }
  }

  async updateRecurringExpense(id: string, updates: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', this.currentUserId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating recurring expense:', error)
      throw error
    }
  }

  async deleteRecurringExpense(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', this.currentUserId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting recurring expense:', error)
      throw error
    }
  }
}

export const supabaseService = SupabaseService.getInstance() 