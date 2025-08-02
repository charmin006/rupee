'use client'

import { useEffect, useState } from 'react'
import { AppData } from '@/lib/types'
import { storage } from '@/lib/storage'
import Dashboard from '@/components/Dashboard'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Home() {
  const [appData, setAppData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      console.log('Initializing app data...')
      // Initialize app data
      const data = storage.initializeApp()
      console.log('App data initialized:', data)
      setAppData(data)
      setLoading(false)
    } catch (err) {
      console.error('Error initializing app:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Application</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!appData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">Unable to load application data</p>
        </div>
      </div>
    )
  }

  console.log('Rendering Dashboard with data:', appData)
  return <Dashboard initialData={appData} />
} 