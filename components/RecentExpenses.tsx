'use client'

import { Expense, Category } from '@/lib/types'
import { formatCurrency, formatDate, getCategoryColor, getCategoryIcon } from '@/lib/utils'

interface RecentExpensesProps {
  expenses: Expense[]
  categories: Category[]
}

export default function RecentExpenses({ expenses, categories }: RecentExpensesProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No expenses yet</p>
        <p className="text-sm text-gray-400">Add your first expense to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const categoryColor = getCategoryColor(expense.category, categories)
        const categoryIcon = getCategoryIcon(expense.category, categories)
        
        return (
          <div
            key={expense.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: `${categoryColor}20` }}
              >
                {categoryIcon}
              </div>
              <div>
                <p className="font-medium text-gray-900">{expense.category}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(expense.date)} • {expense.paymentMethod}
                </p>
                {expense.note && (
                  <p className="text-xs text-gray-500 truncate max-w-32">{expense.note}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
} 