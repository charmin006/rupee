'use client'

import { useState } from 'react'
import { Menu, Bell, User, X } from 'lucide-react'
import { User as UserType, SpendingAlert } from '@/lib/types'
import { storage } from '@/lib/storage'

interface HeaderProps {
  onMenuClick: () => void
  user: UserType
}

export default function Header({ onMenuClick, user }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [alerts] = useState<SpendingAlert[]>(() => storage.getAlerts())

  const unreadAlerts = alerts.filter(alert => !alert.isRead)
  const hasUnread = unreadAlerts.length > 0

  const markAsRead = (alertId: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    )
    storage.saveAlerts(updatedAlerts)
    // Force re-render by updating state
    window.location.reload()
  }

  const markAllAsRead = () => {
    const updatedAlerts = alerts.map(alert => ({ ...alert, isRead: true }))
    storage.saveAlerts(updatedAlerts)
    setShowNotifications(false)
    // Force re-render by updating state
    window.location.reload()
  }

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🔵'
      default: return '⚪'
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-4 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-rupee-500"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Logo and title */}
        <div className="flex items-center">
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-rupee-600">Rupee</h1>
            <p className="text-sm text-gray-600">AI-Powered Finance Tracker</p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-rupee-500 relative"
            >
              <Bell className="h-6 w-6" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      {hasUnread && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            !alert.isRead ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(alert.date).toLocaleDateString()} at{' '}
                                  {new Date(alert.date).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            {!alert.isRead && (
                              <button
                                onClick={() => markAsRead(alert.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {alerts.length > 0 && (
                  <div className="p-4 border-t border-gray-200">
                    <button
                      onClick={() => window.location.href = '#alerts'}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all alerts
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-600">{user.email}</p>
            </div>
            <div className="h-8 w-8 bg-rupee-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-rupee-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </header>
  )
} 