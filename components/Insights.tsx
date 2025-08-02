'use client'

import { SpendingInsight } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'

interface InsightsProps {
  insights: SpendingInsight[]
  onMarkInsightAsRead: (id: string) => void
}

export default function Insights({ insights, onMarkInsightAsRead }: InsightsProps) {
  const getInsightIcon = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'spending_increase':
        return <TrendingUp className="h-5 w-5 text-danger-600" />
      case 'spending_decrease':
        return <TrendingDown className="h-5 w-5 text-success-600" />
      case 'budget_alert':
        return <AlertTriangle className="h-5 w-5 text-warning-600" />
      case 'savings_tip':
        return <CheckCircle className="h-5 w-5 text-success-600" />
      default:
        return <Lightbulb className="h-5 w-5 text-primary-600" />
    }
  }

  const getInsightColor = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'spending_increase':
        return 'bg-danger-50 border-danger-500'
      case 'spending_decrease':
        return 'bg-success-50 border-success-500'
      case 'budget_alert':
        return 'bg-warning-50 border-warning-500'
      case 'savings_tip':
        return 'bg-success-50 border-success-500'
      default:
        return 'bg-primary-50 border-primary-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
        <p className="text-gray-600">Intelligent analysis of your spending patterns</p>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="card text-center py-12">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No insights yet</p>
            <p className="text-gray-400">Add some expenses to get AI-powered insights</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`card border-l-4 ${getInsightColor(insight.type)} ${
                !insight.isRead ? 'ring-2 ring-rupee-200' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{insight.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(insight.date)}
                      </span>
                      {!insight.isRead && (
                        <span className="h-2 w-2 bg-rupee-500 rounded-full"></span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-1">{insight.message}</p>
                  {insight.category && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {insight.category}
                      </span>
                    </div>
                  )}
                </div>
                {!insight.isRead && (
                  <button
                    onClick={() => onMarkInsightAsRead(insight.id)}
                    className="text-sm text-rupee-600 hover:text-rupee-700 font-medium"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 