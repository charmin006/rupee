'use client'

import { useState } from 'react'
import { SpendingInsight } from '@/lib/types'

interface InsightsProps {
  insights: SpendingInsight[]
  onMarkInsightAsRead: (id: string) => Promise<void>
}

export default function Insights({ insights, onMarkInsightAsRead }: InsightsProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const handleMarkAsRead = async (id: string) => {
    await onMarkInsightAsRead(id)
  }

  const filteredInsights = insights.filter(insight => {
    if (filter === 'unread') return !insight.isRead
    if (filter === 'read') return insight.isRead
    return true
  })

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'spending_increase':
        return '📈'
      case 'spending_decrease':
        return '📉'
      case 'budget_alert':
        return '💰'
      case 'savings_tip':
        return '💡'
      case 'overspending_alert':
        return '⚠️'
      case 'goal_achieved':
        return '🎉'
      default:
        return '📊'
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'spending_increase':
        return 'border-orange-500 bg-orange-50'
      case 'spending_decrease':
        return 'border-green-500 bg-green-50'
      case 'budget_alert':
        return 'border-red-500 bg-red-50'
      case 'savings_tip':
        return 'border-blue-500 bg-blue-50'
      case 'overspending_alert':
        return 'border-red-500 bg-red-50'
      case 'goal_achieved':
        return 'border-purple-500 bg-purple-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
          <p className="text-gray-600">Smart insights about your spending patterns</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Insights</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Insights</h3>
          <p className="text-3xl font-bold text-blue-600">{insights.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unread</h3>
          <p className="text-3xl font-bold text-orange-600">{insights.filter(i => !i.isRead).length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">This Month</h3>
          <p className="text-3xl font-bold text-green-600">
            {insights.filter(i => {
              const insightDate = new Date(i.date)
              const now = new Date()
              return insightDate.getMonth() === now.getMonth() && insightDate.getFullYear() === now.getFullYear()
            }).length}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Start tracking your expenses to get personalized insights!' 
                : `No ${filter} insights to show.`
              }
            </p>
          </div>
        ) : (
          filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className={`bg-white p-6 rounded-lg shadow border-l-4 ${
                insight.isRead ? 'opacity-75' : ''
              } ${getInsightColor(insight.type)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      {!insight.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{insight.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{new Date(insight.date).toLocaleDateString()}</span>
                      {insight.category && (
                        <span>Category: {insight.category}</span>
                      )}
                      {insight.percentage && (
                        <span>Change: {insight.percentage > 0 ? '+' : ''}{insight.percentage}%</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!insight.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(insight.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 