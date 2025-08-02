'use client'

import { useState } from 'react'
import { SpendingAlert } from '@/lib/types'

interface AlertsProps {
  alerts: SpendingAlert[]
  onMarkAlertAsRead: (id: string) => Promise<void>
  onDeleteAlert: (id: string) => Promise<void>
}

export default function Alerts({ alerts, onMarkAlertAsRead, onDeleteAlert }: AlertsProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const handleMarkAsRead = async (id: string) => {
    await onMarkAlertAsRead(id)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      await onDeleteAlert(id)
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.isRead
    if (filter === 'read') return alert.isRead
    return true
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'budget_limit':
        return '💰'
      case 'overspending':
        return '⚠️'
      case 'category_limit':
        return '📊'
      default:
        return '🔔'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-600">Stay informed about your finances</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Alerts</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Alerts</h3>
          <p className="text-3xl font-bold text-blue-600">{alerts.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unread</h3>
          <p className="text-3xl font-bold text-red-600">{alerts.filter(a => !a.isRead).length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">High Priority</h3>
          <p className="text-3xl font-bold text-orange-600">{alerts.filter(a => a.severity === 'high').length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'You\'re all caught up! No alerts to show.' 
                : `No ${filter} alerts to show.`
              }
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white p-6 rounded-lg shadow border-l-4 ${
                alert.isRead ? 'opacity-75' : ''
              }`}
              style={{
                borderLeftColor: alert.severity === 'high' ? '#EF4444' : 
                               alert.severity === 'medium' ? '#F59E0B' : '#3B82F6'
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      {!alert.isRead && (
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{alert.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{new Date(alert.date).toLocaleDateString()}</span>
                      {alert.category && (
                        <span>Category: {alert.category}</span>
                      )}
                      {alert.amount > 0 && (
                        <span>Amount: ₹{alert.amount.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete alert"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 