'use client'

import { LucideIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface FinancialSummaryCardProps {
  title: string
  amount: number
  icon: LucideIcon
  color: 'success' | 'danger' | 'warning' | 'primary'
  trend: 'positive' | 'negative' | 'neutral'
  isPercentage?: boolean
}

const colorClasses = {
  success: 'text-success-600 bg-success-50',
  danger: 'text-danger-600 bg-danger-50',
  warning: 'text-warning-600 bg-warning-50',
  primary: 'text-primary-600 bg-primary-50',
}

const trendIcons = {
  positive: '↗️',
  negative: '↘️',
  neutral: '→',
}

export default function FinancialSummaryCard({
  title,
  amount,
  icon: Icon,
  color,
  trend,
  isPercentage = false,
}: FinancialSummaryCardProps) {
  const formatAmount = () => {
    if (isPercentage) {
      return `${amount.toFixed(1)}%`
    }
    return formatCurrency(amount)
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formatAmount()}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {trend !== 'neutral' && (
        <div className="mt-3 flex items-center text-sm">
          <span className="mr-1">{trendIcons[trend]}</span>
          <span className={trend === 'positive' ? 'text-success-600' : 'text-danger-600'}>
            {trend === 'positive' ? 'Good' : 'Needs attention'}
          </span>
        </div>
      )}
    </div>
  )
} 