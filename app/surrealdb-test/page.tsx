'use client'

import { useState, useEffect } from 'react'
// import surrealDB from '@/lib/surrealdb' // Temporarily disabled for deployment

export default function SurrealDBTest() {
  const [status, setStatus] = useState<string>('Connecting...')
  const [testData, setTestData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testSurrealDB()
  }, [])

  const testSurrealDB = async () => {
    try {
      setStatus('SurrealDB temporarily disabled for deployment...')
      setError('SurrealDB integration is temporarily disabled for deployment to Vercel')
      
    } catch (err) {
      console.error('SurrealDB test error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('Test failed')
    }
  }

  const clearTestData = async () => {
    try {
      setStatus('SurrealDB temporarily disabled for deployment...')
      setError('SurrealDB integration is temporarily disabled for deployment to Vercel')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const fixUsers = async () => {
    try {
      setStatus('SurrealDB temporarily disabled for deployment...')
      setError('SurrealDB integration is temporarily disabled for deployment to Vercel')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const fixDateFields = async () => {
    try {
      setStatus('SurrealDB temporarily disabled for deployment...')
      setError('SurrealDB integration is temporarily disabled for deployment to Vercel')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const fixRecordReferences = async () => {
    try {
      setStatus('SurrealDB temporarily disabled for deployment...')
      setError('SurrealDB integration is temporarily disabled for deployment to Vercel')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const fixSpecificError = async () => {
    try {
      setStatus('SurrealDB temporarily disabled for deployment...')
      setError('SurrealDB integration is temporarily disabled for deployment to Vercel')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const fixAllRecordReferences = async () => {
    try {
      setStatus('SurrealDB temporarily disabled for deployment...')
      setError('SurrealDB integration is temporarily disabled for deployment to Vercel')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
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