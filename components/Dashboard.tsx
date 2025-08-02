'use client'

import { useState, useEffect } from 'react'
import { AppData, Expense, Income, Category, SavingsGoal, BudgetLimit, SpendingAlert } from '@/lib/types'
import { supabaseService } from '@/lib/supabase-service'

type TabType = 'overview' | 'expenses' | 'incomes' | 'categories' | 'insights' | 'settings' | 'goals' | 'budgets' | 'alerts' | 'recurring' | 'gamification' | 'analytics' | 'profiles'
import Header from './Header'
import Sidebar from './Sidebar'
import Overview from './Overview'
import Expenses from './Expenses'
import Incomes from './Incomes'
import Categories from './Categories'
import Insights from './Insights'
import SavingsGoals from './SavingsGoals'
import BudgetLimits from './BudgetLimits'
import Alerts from './Alerts'
import Settings from './Settings'
import RecurringExpenses from './RecurringExpenses'
import Gamification from './Gamification'
import AdvancedCharts from './AdvancedCharts'

interface DashboardProps {
  initialData: AppData
}

export default function Dashboard({ initialData }: DashboardProps) {
  const [appData, setAppData] = useState<AppData>(initialData)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Initialize user and load data from Supabase
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        // Initialize user in Supabase
        const user = await supabaseService.initializeUser({
          email: 'user@example.com',
          name: 'User'
        })

        // Load all data from Supabase
        const [expenses, incomes, categories, savingsGoals, insights, alerts] = await Promise.all([
          supabaseService.getExpenses(),
          supabaseService.getIncomes(),
          supabaseService.getCategories(),
          supabaseService.getSavingsGoals(),
          supabaseService.getInsights(),
          supabaseService.getAlerts()
        ])

        // Update app data with Supabase data
        setAppData({
          ...initialData,
          expenses: expenses as any,
          incomes: incomes as any,
          categories: categories as any,
          savingsGoals: savingsGoals as any,
          insights: insights as any,
          alerts: alerts as any,
          user: user as any
        })
      } catch (error) {
        console.error('Error initializing data:', error)
        // Fallback to initial data if Supabase fails
        setAppData(initialData)
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [initialData])

  const onAddExpense = async (expense: Expense) => {
    try {
      const newExpense = await supabaseService.addExpense({
        amount: expense.amount,
        note: expense.note || '',
        category: expense.category,
        date: expense.date,
        paymentMethod: expense.paymentMethod || 'cash'
      })
      
      const updatedExpenses = [...appData.expenses, newExpense as any]
      const updatedData = { ...appData, expenses: updatedExpenses }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  const onUpdateExpense = async (expense: Expense) => {
    try {
      const updatedExpense = await supabaseService.updateExpense(expense.id, {
        amount: expense.amount,
        note: expense.note || '',
        category: expense.category,
        date: expense.date,
        paymentMethod: expense.paymentMethod || 'cash'
      })
      
      const updatedExpenses = appData.expenses.map(exp => 
        exp.id === expense.id ? updatedExpense as any : exp
      )
      const updatedData = { ...appData, expenses: updatedExpenses }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error updating expense:', error)
    }
  }

  const onDeleteExpense = async (id: string) => {
    try {
      await supabaseService.deleteExpense(id)
      const updatedExpenses = appData.expenses.filter(exp => exp.id !== id)
      const updatedData = { ...appData, expenses: updatedExpenses }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const onAddIncome = async (income: Income) => {
    try {
      const newIncome = await supabaseService.addIncome({
        amount: income.amount,
        source: income.source,
        date: income.date
      })
      
      const updatedIncomes = [...appData.incomes, newIncome as any]
      const updatedData = { ...appData, incomes: updatedIncomes }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error adding income:', error)
    }
  }

  const onUpdateIncome = async (income: Income) => {
    try {
      const updatedIncome = await supabaseService.updateIncome(income.id, {
        amount: income.amount,
        source: income.source,
        date: income.date
      })
      
      const updatedIncomes = appData.incomes.map(inc => 
        inc.id === income.id ? updatedIncome as any : inc
      )
      const updatedData = { ...appData, incomes: updatedIncomes }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error updating income:', error)
    }
  }

  const onDeleteIncome = async (id: string) => {
    try {
      await supabaseService.deleteIncome(id)
      const updatedIncomes = appData.incomes.filter(inc => inc.id !== id)
      const updatedData = { ...appData, incomes: updatedIncomes }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error deleting income:', error)
    }
  }

  const onAddCategory = async (category: Category) => {
    try {
      const newCategory = await supabaseService.addCategory({
        name: category.name,
        color: category.color,
        icon: category.icon,
        isCustom: category.isCustom
      })
      
      const updatedCategories = [...appData.categories, newCategory as any]
      const updatedData = { ...appData, categories: updatedCategories }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const onUpdateCategory = async (category: Category) => {
    try {
      const updatedCategory = await supabaseService.updateCategory(category.id, {
        name: category.name,
        color: category.color,
        icon: category.icon,
        isCustom: category.isCustom
      })
      
      const updatedCategories = appData.categories.map(cat => 
        cat.id === category.id ? updatedCategory as any : cat
      )
      const updatedData = { ...appData, categories: updatedCategories }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const onDeleteCategory = async (id: string) => {
    try {
      await supabaseService.deleteCategory(id)
      const updatedCategories = appData.categories.filter(cat => cat.id !== id)
      const updatedData = { ...appData, categories: updatedCategories }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const onAddGoal = async (goal: SavingsGoal) => {
    try {
      const newGoal = await supabaseService.addSavingsGoal({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate
      })
      
      const updatedGoals = [...appData.savingsGoals, newGoal as any]
      const updatedData = { ...appData, savingsGoals: updatedGoals }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error adding savings goal:', error)
    }
  }

  const onUpdateGoal = async (goal: SavingsGoal) => {
    try {
      const updatedGoal = await supabaseService.updateSavingsGoal(goal.id, {
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate
      })
      
      const updatedGoals = appData.savingsGoals.map(g => 
        g.id === goal.id ? updatedGoal as any : g
      )
      const updatedData = { ...appData, savingsGoals: updatedGoals }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error updating savings goal:', error)
    }
  }

  const onDeleteGoal = async (id: string) => {
    try {
      await supabaseService.deleteSavingsGoal(id)
      const updatedGoals = appData.savingsGoals.filter(g => g.id !== id)
      const updatedData = { ...appData, savingsGoals: updatedGoals }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error deleting savings goal:', error)
    }
  }

  const onUpdateUserPreferences = async (preferences: any) => {
    try {
      const updatedUser = await supabaseService.updateUser({
        preferences: { ...appData.user.preferences, ...preferences }
      })
      
      const updatedData = { ...appData, user: updatedUser as any }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error updating user preferences:', error)
    }
  }

  const onMarkInsightAsRead = async (id: string) => {
    try {
      await supabaseService.markInsightAsRead(id)
      const updatedInsights = appData.insights.map(insight => 
        insight.id === id ? { ...insight, isRead: true } : insight
      )
      const updatedData = { ...appData, insights: updatedInsights }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error marking insight as read:', error)
    }
  }

  const onAddBudgetLimit = async (limit: BudgetLimit) => {
    try {
      const newLimit = await supabaseService.addBudgetLimit({
        category: limit.category,
        amount: limit.amount,
        period: limit.period,
        isActive: limit.isActive
      })
      
      const updatedLimits = [...appData.user.preferences.budgetLimits, newLimit as any]
      const updatedUser = {
        ...appData.user,
        preferences: { ...appData.user.preferences, budgetLimits: updatedLimits }
      }
      const updatedData = { ...appData, user: updatedUser }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error adding budget limit:', error)
    }
  }

  const onUpdateBudgetLimit = async (limit: BudgetLimit) => {
    try {
      const updatedLimit = await supabaseService.updateBudgetLimit(limit.id, {
        category: limit.category,
        amount: limit.amount,
        period: limit.period,
        isActive: limit.isActive
      })
      
      const updatedLimits = appData.user.preferences.budgetLimits.map(l => 
        l.id === limit.id ? updatedLimit as any : l
      )
      const updatedUser = {
        ...appData.user,
        preferences: { ...appData.user.preferences, budgetLimits: updatedLimits }
      }
      const updatedData = { ...appData, user: updatedUser }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error updating budget limit:', error)
    }
  }

  const onDeleteBudgetLimit = async (id: string) => {
    try {
      await supabaseService.deleteBudgetLimit(id)
      const updatedLimits = appData.user.preferences.budgetLimits.filter(l => l.id !== id)
      const updatedUser = {
        ...appData.user,
        preferences: { ...appData.user.preferences, budgetLimits: updatedLimits }
      }
      const updatedData = { ...appData, user: updatedUser }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error deleting budget limit:', error)
    }
  }

  const onMarkAlertAsRead = async (id: string) => {
    try {
      await supabaseService.markAlertAsRead(id)
      const updatedAlerts = appData.alerts.map(alert => 
        alert.id === id ? { ...alert, isRead: true } : alert
      )
      const updatedData = { ...appData, alerts: updatedAlerts }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const onDeleteAlert = async (id: string) => {
    try {
      await supabaseService.deleteAlert(id)
      const updatedAlerts = appData.alerts.filter(alert => alert.id !== id)
      const updatedData = { ...appData, alerts: updatedAlerts }
      setAppData(updatedData)
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your data...</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return <Overview appData={appData} onAddExpense={onAddExpense} onAddIncome={onAddIncome} />
      case 'expenses':
        return (
          <Expenses
            expenses={appData.expenses}
            categories={appData.categories}
            onAddExpense={onAddExpense}
            onUpdateExpense={onUpdateExpense}
            onDeleteExpense={onDeleteExpense}
          />
        )
      case 'incomes':
        return (
          <Incomes
            incomes={appData.incomes}
            onAddIncome={onAddIncome}
            onUpdateIncome={onUpdateIncome}
            onDeleteIncome={onDeleteIncome}
          />
        )
      case 'categories':
        return (
          <Categories
            categories={appData.categories}
            onAddCategory={onAddCategory}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
          />
        )
      case 'insights':
        return (
          <Insights
            insights={appData.insights}
            onMarkInsightAsRead={onMarkInsightAsRead}
          />
        )
      case 'goals':
        return (
          <SavingsGoals
            goals={appData.savingsGoals}
            incomes={appData.incomes}
            expenses={appData.expenses}
            onAddGoal={onAddGoal}
            onUpdateGoal={onUpdateGoal}
            onDeleteGoal={onDeleteGoal}
          />
        )
      case 'budgets':
        return (
          <BudgetLimits
            budgetLimits={appData.user.preferences.budgetLimits}
            categories={appData.categories}
            onAddBudgetLimit={onAddBudgetLimit}
            onUpdateBudgetLimit={onUpdateBudgetLimit}
            onDeleteBudgetLimit={onDeleteBudgetLimit}
          />
        )
      case 'alerts':
        return (
          <Alerts
            alerts={appData.alerts}
            onMarkAlertAsRead={onMarkAlertAsRead}
            onDeleteAlert={onDeleteAlert}
          />
        )
      case 'recurring':
        return (
          <RecurringExpenses
            onExpenseCreated={onAddExpense}
          />
        )
      case 'gamification':
        return (
          <Gamification
            user={appData.user}
            expenses={appData.expenses}
            goals={appData.savingsGoals}
            onUpdateUser={onUpdateUserPreferences}
          />
        )
      case 'analytics':
        return <AdvancedCharts expenses={appData.expenses} />
      case 'settings':
        return (
          <Settings
            user={appData.user}
            onUpdateUserPreferences={onUpdateUserPreferences}
          />
        )
      default:
        return <Overview appData={appData} onAddExpense={onAddExpense} onAddIncome={onAddIncome} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        user={appData.user}
      />
      
      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
} 