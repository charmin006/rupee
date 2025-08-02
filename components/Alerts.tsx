'use client'

import { SpendingAlert } from '@/lib/types'
import { formatCurrency, formatDate, getSeverityColor, getSeverityBadgeClass } from '@/lib/utils'
import { AlertTriangle, TrendingUp, TrendingDown, Bell, X } from 'lucide-react'

interface AlertsProps {
  alerts: SpendingAlert[]
  onMarkAlertAsRead: (id: string) => void
  onDeleteAlert: (id: string) => void
}

export default function Alerts({ alerts, onMarkAlertAsRead, onDeleteAlert }: AlertsProps) {
  const unreadAlerts = alerts.filter(alert => !alert.isRead)
  const readAlerts = alerts.filter(alert => alert.isRead)

  const getAlertIcon = (type: SpendingAlert['type']) => {
    switch (type) {
      case 'budget_limit':
        return <AlertTriangle className="h-5 w-5" />
      case 'overspending':
        return <TrendingUp className="h-5 w-5" />
      case 'category_limit':
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getAlertColor = (type: SpendingAlert['type'], severity: 'low' | 'medium' | 'high') => {
    const severityColor = getSeverityColor(severity)
    return {
      borderColor: severityColor,
      backgroundColor: `${severityColor}10`,
    }
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'day':
        return 'today'
      case 'week':
        return 'this week'
      case 'month':
        return 'this month'
      default:
        return period
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-gray-600">Stay informed about your spending patterns</p>
        </div>
        {unreadAlerts.length > 0 && (
          <span className="badge badge-danger mt-2 sm:mt-0">
            {unreadAlerts.length} new
          </span>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="card text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No alerts yet</p>
            <p className="text-gray-400">You'll see spending alerts and budget notifications here</p>
          </div>
        ) : (
          <>
            {/* Unread Alerts */}
            {unreadAlerts.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="w-2 h-2 bg-danger-500 rounded-full mr-2"></span>
                  New Alerts ({unreadAlerts.length})
                </h2>
                {unreadAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="card border-l-4 ring-2 ring-rupee-200"
                    style={getAlertColor(alert.type, alert.severity)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: getSeverityColor(alert.severity) + '20' }}
                        >
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                            <span className={`badge ${getSeverityBadgeClass(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatDate(alert.date, 'MMM dd, yyyy')}</span>
                            {alert.category && (
                              <span>• {alert.category}</span>
                            )}
                            <span>• {getPeriodLabel(alert.period)}</span>
                          </div>
                          {alert.amount && alert.limit && (
                            <div className="mt-2 text-sm">
                              <span className="text-gray-600">Spent: </span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(alert.amount)}
                              </span>
                              <span className="text-gray-600"> / </span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(alert.limit)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onMarkAlertAsRead(alert.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Mark as read"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Read Alerts */}
            {readAlerts.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">Previous Alerts</h2>
                {readAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="card border-l-4 opacity-75 hover:opacity-100 transition-opacity"
                    style={getAlertColor(alert.type, alert.severity)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: getSeverityColor(alert.severity) + '20' }}
                        >
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                            <span className={`badge ${getSeverityBadgeClass(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatDate(alert.date, 'MMM dd, yyyy')}</span>
                            {alert.category && (
                              <span>• {alert.category}</span>
                            )}
                            <span>• {getPeriodLabel(alert.period)}</span>
                          </div>
                          {alert.amount && alert.limit && (
                            <div className="mt-2 text-sm">
                              <span className="text-gray-600">Spent: </span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(alert.amount)}
                              </span>
                              <span className="text-gray-600"> / </span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(alert.limit)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onDeleteAlert(alert.id)}
                          className="p-1 text-gray-400 hover:text-danger-600 transition-colors"
                          title="Delete alert"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Alert Types Legend */}
      {alerts.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Alert Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
              <span className="text-gray-600">High Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
              <span className="text-gray-600">Medium Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success-500 rounded-full"></div>
              <span className="text-gray-600">Low Priority</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 