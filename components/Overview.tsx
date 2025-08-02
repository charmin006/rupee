'use client'

import { useState } from 'react'
import { AppData } from '@/lib/types'
import { calculateFinancialSummary, formatCurrency, formatDate } from '@/lib/utils'
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
import FinancialSummaryCard from './FinancialSummaryCard'
import RecentExpenses from './RecentExpenses'
import SpendingChart from './SpendingChart'
import AddExpenseModal from './AddExpenseModal'
import AddIncomeModal from './AddIncomeModal'

interface OverviewProps {
  appData: AppData
  onAddExpense: (expense: any) => void
  onAddIncome: (income: any) => void
}

export default function Overview({ appData, onAddExpense, onAddIncome }: OverviewProps) {
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')

  const financialSummary = calculateFinancialSummary(
    appData.expenses,
    appData.incomes,
    selectedPeriod
  )

  const periods = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-gray-600">Track your spending and income patterns</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => setShowIncomeModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex space-x-2">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => setSelectedPeriod(period.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedPeriod === period.value
                ? 'bg-rupee-100 text-rupee-700 border border-rupee-300'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialSummaryCard
          title="Total Income"
          amount={financialSummary.totalIncome}
          icon={TrendingUp}
          color="success"
          trend={financialSummary.totalIncome > 0 ? 'positive' : 'neutral'}
        />
        <FinancialSummaryCard
          title="Total Expenses"
          amount={financialSummary.totalExpenses}
          icon={TrendingDown}
          color="danger"
          trend="neutral"
        />
        <FinancialSummaryCard
          title="Net Savings"
          amount={financialSummary.netSavings}
          icon={DollarSign}
          color={financialSummary.netSavings >= 0 ? 'success' : 'danger'}
          trend={financialSummary.netSavings >= 0 ? 'positive' : 'negative'}
        />
        <FinancialSummaryCard
          title="Savings Rate"
          amount={financialSummary.savingsRate}
          icon={Calendar}
          color={financialSummary.savingsRate >= 20 ? 'success' : 'warning'}
          trend={financialSummary.savingsRate >= 20 ? 'positive' : 'neutral'}
          isPercentage
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <SpendingChart
            expenses={appData.expenses}
            categories={appData.categories}
            period={selectedPeriod}
          />
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
          <RecentExpenses
            expenses={appData.expenses.slice(0, 5)}
            categories={appData.categories}
          />
        </div>
      </div>

      {/* AI Insights Preview */}
      {appData.insights.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
          <div className="space-y-3">
            {appData.insights.slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'spending_increase'
                    ? 'bg-danger-50 border-danger-500'
                    : insight.type === 'spending_decrease'
                    ? 'bg-success-50 border-success-500'
                    : 'bg-primary-50 border-primary-500'
                }`}
              >
                <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onAdd={onAddExpense}
        categories={appData.categories}
      />
      
      <AddIncomeModal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onAdd={onAddIncome}
      />
    </div>
  )
} 