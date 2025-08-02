'use client'

import { useState } from 'react'
import { User } from '@/lib/types'
import { User as UserIcon, Settings as SettingsIcon, Bell, AlertTriangle, Download, Upload, Database, Trash2 } from 'lucide-react'
import { storage } from '@/lib/storage'
import toast from 'react-hot-toast'

interface SettingsProps {
  user: User
  onUpdateUserPreferences: (preferences: any) => void
}

export default function Settings({ user, onUpdateUserPreferences }: SettingsProps) {
  const [preferences, setPreferences] = useState(user.preferences)

  const handleSave = () => {
    onUpdateUserPreferences(preferences)
  }

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const updateAlertSetting = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      alertSettings: {
        ...prev.alertSettings,
        [key]: value,
      },
    }))
  }

  const handleExportData = () => {
    try {
      const data = storage.exportData(false) // Export without encryption for now
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rupee-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully!')
    } catch (error) {
      toast.error('Failed to export data')
      console.error('Export error:', error)
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string
        const success = storage.importData(data, false) // Import without encryption for now
        
        if (success) {
          toast.success('Data imported successfully! Please refresh the page.')
          // Force page refresh to update all data
          setTimeout(() => window.location.reload(), 1000)
        } else {
          toast.error('Invalid backup file')
        }
      } catch (error) {
        toast.error('Failed to import data')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
    
    // Reset input
    event.target.value = ''
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        localStorage.clear()
        toast.success('All data cleared successfully!')
        // Force page refresh
        setTimeout(() => window.location.reload(), 1000)
      } catch (error) {
        toast.error('Failed to clear data')
        console.error('Clear error:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and notifications</p>
      </div>

      {/* User Profile */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <UserIcon className="h-5 w-5 mr-2" /> User Profile
        </h3>
        <div className="space-y-4">
          <div>
            <label className="form-label">Name</label>
            <input
              type="text"
              value={user.name}
              className="input-field"
              disabled
            />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={user.email}
              className="input-field"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" /> Data Management
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Export Data */}
            <div className="text-center">
              <button
                onClick={handleExportData}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Export Data</span>
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Download a backup of all your financial data
              </p>
            </div>

            {/* Import Data */}
            <div className="text-center">
              <label className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 cursor-pointer">
                <Upload className="h-5 w-5" />
                <span>Import Data</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-600 mt-2">
                Restore data from a backup file
              </p>
            </div>

            {/* Clear Data */}
            <div className="text-center">
              <button
                onClick={handleClearData}
                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 className="h-5 w-5" />
                <span>Clear All Data</span>
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Permanently delete all your data
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Data Safety</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your data is stored locally in your browser. Regular backups are recommended to prevent data loss.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* General Preferences */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <SettingsIcon className="h-5 w-5 mr-2" /> General Preferences
        </h3>
        <div className="space-y-4">
          {/* Currency */}
          <div>
            <label className="form-label">Currency</label>
            <select
              value={preferences.currency}
              onChange={(e) => updatePreference('currency', e.target.value)}
              className="input-field"
            >
              <option value="₹">₹ Indian Rupee</option>
              <option value="$">$ US Dollar</option>
              <option value="€">€ Euro</option>
              <option value="£">£ British Pound</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="form-label">Theme</label>
            <select
              value={preferences.theme}
              onChange={(e) => updatePreference('theme', e.target.value)}
              className="input-field"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>

          {/* Monthly Budget */}
          <div>
            <label className="form-label">Monthly Budget (₹)</label>
            <input
              type="number"
              step="0.01"
              value={preferences.monthlyBudget || ''}
              onChange={(e) => updatePreference('monthlyBudget', parseFloat(e.target.value) || undefined)}
              className="input-field"
              placeholder="50000"
            />
            <p className="text-sm text-gray-500 mt-1">
              Set your monthly spending limit to get overspending alerts
            </p>
          </div>

          {/* Default Payment Method */}
          <div>
            <label className="form-label">Default Payment Method</label>
            <select
              value={preferences.defaultPaymentMethod}
              onChange={(e) => updatePreference('defaultPaymentMethod', e.target.value)}
              className="input-field"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2" /> Alert Settings
        </h3>
        <div className="space-y-4">
          {/* Overspending Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Overspending Alerts</h4>
              <p className="text-sm text-gray-600">Get notified when you exceed your monthly budget</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.alertSettings.overspendingAlerts}
                onChange={(e) => updateAlertSetting('overspendingAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rupee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rupee-600"></div>
            </label>
          </div>

          {/* Budget Limit Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Budget Limit Alerts</h4>
              <p className="text-sm text-gray-600">Get notified when you exceed category budget limits</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.alertSettings.budgetLimitAlerts}
                onChange={(e) => updateAlertSetting('budgetLimitAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rupee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rupee-600"></div>
            </label>
          </div>

          {/* Savings Goal Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Savings Goal Alerts</h4>
              <p className="text-sm text-gray-600">Get notified about your savings goal progress</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.alertSettings.savingsGoalAlerts}
                onChange={(e) => updateAlertSetting('savingsGoalAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rupee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rupee-600"></div>
            </label>
          </div>

          {/* Weekly Insights */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Weekly Insights</h4>
              <p className="text-sm text-gray-600">Receive weekly AI-powered spending insights</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.alertSettings.weeklyInsights}
                onChange={(e) => updateAlertSetting('weeklyInsights', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rupee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rupee-600"></div>
            </label>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Push Notifications</h4>
              <p className="text-sm text-gray-600">Receive notifications in your browser</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.alertSettings.pushNotifications}
                onChange={(e) => updateAlertSetting('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rupee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rupee-600"></div>
            </label>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.alertSettings.emailNotifications}
                onChange={(e) => updateAlertSetting('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rupee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rupee-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Database Section */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Database className="h-5 w-5 text-rupee-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Database Settings</h3>
        </div>
        
        <div className="space-y-4">
          {/* SurrealDB Status */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">SurrealDB Connection</h4>
              <p className="text-sm text-gray-600">Connect to SurrealDB for cloud storage</p>
            </div>
            <button
              onClick={async () => {
                const status = await storage.getSurrealDBStatus();
                if (status.connected) {
                  toast.success('Connected to SurrealDB!');
                } else {
                  toast.error(status.message);
                }
              }}
              className="btn-secondary text-sm"
            >
              Test Connection
            </button>
          </div>

          {/* Migrate to SurrealDB */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Migrate to SurrealDB</h4>
              <p className="text-sm text-gray-600">Move your local data to SurrealDB</p>
            </div>
            <button
              onClick={async () => {
                const success = await storage.migrateToSurrealDB();
                if (success) {
                  toast.success('Data migrated to SurrealDB successfully!');
                } else {
                  toast.error('Failed to migrate data to SurrealDB');
                }
              }}
              className="btn-primary text-sm"
            >
              Migrate Data
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="btn-primary"
        >
          Save Preferences
        </button>
      </div>
    </div>
  )
} 