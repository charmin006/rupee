'use client'

import { useState, useEffect } from 'react'
import surrealDB from '@/lib/surrealdb'

export default function SurrealDBTest() {
  const [status, setStatus] = useState<string>('Connecting...')
  const [testData, setTestData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testSurrealDB()
  }, [])

  const testSurrealDB = async () => {
    try {
      setStatus('Connecting to SurrealDB...')
      
      // Test connection
      await surrealDB.connect()
      setStatus('Connected to SurrealDB!')
      
      // Test creating a user
      setStatus('Creating test user...')
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        preferences: {
          currency: '₹',
          theme: 'light',
          monthlyBudget: 50000,
          notifications: true,
          defaultPaymentMethod: 'cash',
          budgetLimits: [],
          alertSettings: {
            overspendingAlerts: true,
            budgetLimitAlerts: true,
            savingsGoalAlerts: true,
            weeklyInsights: true,
            emailNotifications: false,
            pushNotifications: true
          },
          gamificationEnabled: true,
          autoBackupEnabled: false,
          cloudSyncEnabled: false,
          receiptScanningEnabled: false
        },
        profiles: [],
        activeProfileId: '',
        securitySettings: {
          pinEnabled: false,
          biometricEnabled: false,
          autoLockTimeout: 5,
          requireAuthForExport: true,
          requireAuthForSettings: false
        },
        achievements: [],
        streaks: {
          currentStreak: 0,
          longestStreak: 0,
          noSpendDays: 0,
          totalNoSpendDays: 0,
          currentNoSpendStreak: 0,
          longestNoSpendStreak: 0
        }
      }
      
      const user = await surrealDB.createUser(userData)
      console.log('Created user:', user) // Debug log
      setStatus('Test user created!')
      
      // Fix any existing users with NONE values
      setStatus('Fixing existing users...')
      await surrealDB.fixAllUsers()
      setStatus('All users fixed!')
      
      // Fix any existing records with string dates
      setStatus('Fixing date fields...')
      await surrealDB.fixDateFieldsSimple()
      setStatus('Date fields fixed!')
      
      // Fix any existing records with record references
      setStatus('Fixing record references...')
      await surrealDB.fixRecordReferences()
      setStatus('Record references fixed!')
      
      // Test creating an expense
      setStatus('Creating test expense...')
      // Extract user ID safely
      let userId = user.id
      if (typeof userId === 'object' && userId.id) {
        // Handle _RecordId object
        userId = userId.id
      } else if (typeof userId === 'string' && userId.includes(':')) {
        // Handle string record reference
        userId = userId.split(':')[1]
      }
      
      const expenseData = {
        userId: userId,
        amount: 1500,
        description: 'Test lunch expense',
        categoryId: 'food',
        date: new Date(),
        paymentMethod: 'cash'
      }
      
      const expense = await surrealDB.createExpense(expenseData)
      setStatus('Test expense created!')
      
      // Test retrieving data
      setStatus('Retrieving test data...')
      const expenses = await surrealDB.getExpenses(user.id)
      const retrievedUser = await surrealDB.getUser(user.id)
      
      setTestData({
        user: retrievedUser,
        expenses: expenses,
        createdExpense: expense
      })
      
      setStatus('All tests completed successfully! 🎉')
      
    } catch (err) {
      console.error('SurrealDB test error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('Test failed')
    }
  }

  const clearTestData = async () => {
    try {
      setStatus('Clearing test data...')
      if (testData?.user?.id) {
        await surrealDB.deleteUser(testData.user.id)
      }
      setTestData(null)
      setStatus('Test data cleared!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const fixUsers = async () => {
    try {
      setStatus('Fixing users with NONE values...')
      await surrealDB.fixAllUsers()
      setStatus('All users fixed!')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('Fix failed')
    }
  }

  const fixDateFields = async () => {
    try {
      setStatus('Fixing date fields...')
      await surrealDB.fixDateFieldsSimple()
      setStatus('Date fields fixed!')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('Fix failed')
    }
  }

  const fixRecordReferences = async () => {
    try {
      setStatus('Fixing record references...')
      await surrealDB.fixRecordReferences()
      setStatus('Record references fixed!')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('Fix failed')
    }
  }

  const fixSpecificError = async () => {
    try {
      setStatus('Fixing specific record error...')
      const result = await surrealDB.fixSpecificRecordError()
      if (result.fixed) {
        setStatus('Specific record error fixed!')
      } else {
        setStatus('No specific record found to fix')
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('Fix failed')
    }
  }

  const fixAllRecordReferences = async () => {
    try {
      setStatus('Fixing all record references...')
      const result = await surrealDB.fixAllRecordReferences()
      setStatus(`Fixed ${result.fixedCount || 0} record references!`)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('Fix failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">SurrealDB Integration Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Connection Status</h2>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${status.includes('Connected') ? 'bg-green-500' : status.includes('failed') ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
            <span className="text-gray-700">{status}</span>
          </div>
          
          <div className="flex space-x-4 flex-wrap gap-2">
            <button
              onClick={fixUsers}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Fix Users with NONE Values
            </button>
            <button
              onClick={fixDateFields}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Fix Date Fields
            </button>
            <button
              onClick={fixRecordReferences}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              Fix Record References
            </button>
            <button
              onClick={fixSpecificError}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Fix Specific Record Error
            </button>
            <button
              onClick={fixAllRecordReferences}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              Fix All Record References
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {testData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Test Results</h2>
              <button
                onClick={clearTestData}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Clear Test Data
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Created User</h3>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(testData.user, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Created Expense</h3>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(testData.createdExpense, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">All Expenses for User</h3>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-40">
                {JSON.stringify(testData.expenses, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Next Steps</h2>
          <div className="space-y-3 text-blue-700">
            <p>✅ SurrealDB is now integrated with your Rupee Finance Tracker!</p>
            <p>📊 The database schema includes tables for:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Users and their preferences</li>
              <li>Expenses and incomes</li>
              <li>Categories and budget limits</li>
              <li>Savings goals and achievements</li>
              <li>Insights and alerts</li>
              <li>Recurring expenses and profiles</li>
            </ul>
            <p>🚀 You can now replace the localStorage implementation with SurrealDB for production use!</p>
          </div>
        </div>
      </div>
    </div>
  )
} 