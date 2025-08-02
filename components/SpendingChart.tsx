'use client'

import { Expense, Category } from '@/lib/types'
import { calculateExpenseSummary, getCategoryColor } from '@/lib/utils'

interface SpendingChartProps {
  expenses: Expense[]
  categories: Category[]
  period: 'day' | 'week' | 'month' | 'year'
}

export default function SpendingChart({ expenses, categories, period }: SpendingChartProps) {
  const summary = calculateExpenseSummary(expenses, period)
  
  if (summary.total === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No spending data for this period</p>
      </div>
    )
  }

  const categoryData = Object.entries(summary.byCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / summary.total) * 100,
      color: getCategoryColor(category, categories),
    }))
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="space-y-4">
      {/* Chart bars */}
      <div className="space-y-3">
        {categoryData.map((item) => (
          <div key={item.category} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">{item.category}</span>
              <span className="text-gray-600">
                ₹{item.amount.toLocaleString()} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Total */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900">Total Spending</span>
          <span className="text-xl font-bold text-gray-900">
            ₹{summary.total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
} 