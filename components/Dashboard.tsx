'use client'

import { useState, useEffect } from 'react'
import { AppData, Expense, Income, Category, SavingsGoal, BudgetLimit, SpendingAlert } from '@/lib/types'
import { storage } from '@/lib/storage'

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

  // Update app data when it changes
  useEffect(() => {
    setAppData(initialData)
  }, [initialData])

  const onAddExpense = (expense: Expense) => {
    const updatedExpenses = [...appData.expenses, expense]
    const updatedData = { ...appData, expenses: updatedExpenses }
    setAppData(updatedData)
    storage.saveExpenses(updatedExpenses)
  }

  const onUpdateExpense = (expense: Expense) => {
    const updatedExpenses = appData.expenses.map(exp => 
      exp.id === expense.id ? expense : exp
    )
    const updatedData = { ...appData, expenses: updatedExpenses }
    setAppData(updatedData)
    storage.saveExpenses(updatedExpenses)
  }

  const onDeleteExpense = (id: string) => {
    const updatedExpenses = appData.expenses.filter(exp => exp.id !== id)
    const updatedData = { ...appData, expenses: updatedExpenses }
    setAppData(updatedData)
    storage.saveExpenses(updatedExpenses)
  }

  const onAddIncome = (income: Income) => {
    const updatedIncomes = [...appData.incomes, income]
    const updatedData = { ...appData, incomes: updatedIncomes }
    setAppData(updatedData)
    storage.saveIncomes(updatedIncomes)
  }

  const onUpdateIncome = (income: Income) => {
    const updatedIncomes = appData.incomes.map(inc => 
      inc.id === income.id ? income : inc
    )
    const updatedData = { ...appData, incomes: updatedIncomes }
    setAppData(updatedData)
    storage.saveIncomes(updatedIncomes)
  }

  const onDeleteIncome = (id: string) => {
    const updatedIncomes = appData.incomes.filter(inc => inc.id !== id)
    const updatedData = { ...appData, incomes: updatedIncomes }
    setAppData(updatedData)
    storage.saveIncomes(updatedIncomes)
  }

  const onAddCategory = (category: Category) => {
    const updatedCategories = [...appData.categories, category]
    const updatedData = { ...appData, categories: updatedCategories }
    setAppData(updatedData)
    storage.saveCategories(updatedCategories)
  }

  const onUpdateCategory = (category: Category) => {
    const updatedCategories = appData.categories.map(cat => 
      cat.id === category.id ? category : cat
    )
    const updatedData = { ...appData, categories: updatedCategories }
    setAppData(updatedData)
    storage.saveCategories(updatedCategories)
  }

  const onDeleteCategory = (id: string) => {
    const updatedCategories = appData.categories.filter(cat => cat.id !== id)
    const updatedData = { ...appData, categories: updatedCategories }
    setAppData(updatedData)
    storage.saveCategories(updatedCategories)
  }

  const onAddGoal = (goal: SavingsGoal) => {
    const updatedGoals = [...appData.savingsGoals, goal]
    const updatedData = { ...appData, savingsGoals: updatedGoals }
    setAppData(updatedData)
    storage.saveSavingsGoals(updatedGoals)
  }

  const onUpdateGoal = (goal: SavingsGoal) => {
    const updatedGoals = appData.savingsGoals.map(g => 
      g.id === goal.id ? goal : g
    )
    const updatedData = { ...appData, savingsGoals: updatedGoals }
    setAppData(updatedData)
    storage.saveSavingsGoals(updatedGoals)
  }

  const onDeleteGoal = (id: string) => {
    const updatedGoals = appData.savingsGoals.filter(g => g.id !== id)
    const updatedData = { ...appData, savingsGoals: updatedGoals }
    setAppData(updatedData)
    storage.saveSavingsGoals(updatedGoals)
  }

  const onUpdateUserPreferences = (preferences: any) => {
    const updatedUser = { ...appData.user, preferences }
    const updatedData = { ...appData, user: updatedUser }
    setAppData(updatedData)
    storage.saveUser(updatedUser)
  }

  const onMarkInsightAsRead = (id: string) => {
    const updatedInsights = appData.insights.map(insight => 
      insight.id === id ? { ...insight, isRead: true } : insight
    )
    const updatedData = { ...appData, insights: updatedInsights }
    setAppData(updatedData)
    storage.saveInsights(updatedInsights)
  }

  const onAddBudgetLimit = (limit: BudgetLimit) => {
    // Ensure user and preferences exist
    const user = appData.user || storage.getUser()
    const preferences = user.preferences || storage.getUser().preferences
    const budgetLimits = preferences.budgetLimits || []
    
    const updatedUser = {
      ...user,
      preferences: {
        ...preferences,
        budgetLimits: [...budgetLimits, limit],
      },
    }
    const updatedData = { ...appData, user: updatedUser }
    setAppData(updatedData)
    storage.saveUser(updatedUser)
  }

  const onUpdateBudgetLimit = (limit: BudgetLimit) => {
    // Ensure user and preferences exist
    const user = appData.user || storage.getUser()
    const preferences = user.preferences || storage.getUser().preferences
    const budgetLimits = preferences.budgetLimits || []
    
    const updatedUser = {
      ...user,
      preferences: {
        ...preferences,
        budgetLimits: budgetLimits.map(l => 
          l.id === limit.id ? limit : l
        ),
      },
    }
    const updatedData = { ...appData, user: updatedUser }
    setAppData(updatedData)
    storage.saveUser(updatedUser)
  }

  const onDeleteBudgetLimit = (id: string) => {
    // Ensure user and preferences exist
    const user = appData.user || storage.getUser()
    const preferences = user.preferences || storage.getUser().preferences
    const budgetLimits = preferences.budgetLimits || []
    
    const updatedUser = {
      ...user,
      preferences: {
        ...preferences,
        budgetLimits: budgetLimits.filter(l => l.id !== id),
      },
    }
    const updatedData = { ...appData, user: updatedUser }
    setAppData(updatedData)
    storage.saveUser(updatedUser)
  }

  const onMarkAlertAsRead = (id: string) => {
    const updatedAlerts = appData.alerts.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    )
    const updatedData = { ...appData, alerts: updatedAlerts }
    setAppData(updatedData)
    storage.saveAlerts(updatedAlerts)
  }

  const onDeleteAlert = (id: string) => {
    const updatedAlerts = appData.alerts.filter(alert => alert.id !== id)
    const updatedData = { ...appData, alerts: updatedAlerts }
    setAppData(updatedData)
    storage.saveAlerts(updatedAlerts)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Overview
            appData={appData}
            onAddExpense={onAddExpense}
            onAddIncome={onAddIncome}
          />
        )
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
          <RecurringExpenses onExpenseCreated={onAddExpense} />
        )
      case 'gamification':
        return <Gamification />
      case 'analytics':
        return (
          <AdvancedCharts expenses={appData.expenses} />
        )
      case 'profiles':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Profiles</h1>
              <p className="text-gray-600">Manage family and team expense tracking</p>
            </div>
            <div className="card">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Multi-Profile Support</h3>
                <p className="text-gray-600 mb-4">
                  This feature is ready for implementation. It will allow you to manage expenses for multiple family members or team members.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• Create profiles for family members</p>
                  <p>• Set role-based permissions</p>
                  <p>• Track shared expenses</p>
                  <p>• Collaborative savings goals</p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'settings':
        return (
          <Settings
            user={appData.user}
            onUpdateUserPreferences={onUpdateUserPreferences}
          />
        )
      default:
        return (
          <Overview
            appData={appData}
            onAddExpense={onAddExpense}
            onAddIncome={onAddIncome}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 lg:ml-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          user={appData.user}
        />
        <main className="p-4 lg:p-8">
          <div className="animate-fade-in-scale">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
} 