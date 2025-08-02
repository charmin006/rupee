'use client'

import { useState } from 'react'
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  Tag, 
  Lightbulb, 
  Settings, 
  Target, 
  Bell, 
  BarChart3, 
  Users, 
  Trophy, 
  Repeat 
} from 'lucide-react'

type TabType = 'overview' | 'expenses' | 'incomes' | 'categories' | 'insights' | 'settings' | 'goals' | 'budgets' | 'alerts' | 'recurring' | 'gamification' | 'analytics' | 'profiles'

interface SidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Overview', tab: 'overview' as TabType, icon: Home },
  { name: 'Expenses', tab: 'expenses' as TabType, icon: CreditCard },
  { name: 'Incomes', tab: 'incomes' as TabType, icon: TrendingUp },
  { name: 'Categories', tab: 'categories' as TabType, icon: Tag },
  { name: 'Insights', tab: 'insights' as TabType, icon: Lightbulb },
  { name: 'Savings Goals', tab: 'goals' as TabType, icon: Target },
  { name: 'Budget Limits', tab: 'budgets' as TabType, icon: BarChart3 },
  { name: 'Alerts', tab: 'alerts' as TabType, icon: Bell },
  { name: 'Recurring Expenses', tab: 'recurring' as TabType, icon: Repeat },
  { name: 'Achievements', tab: 'gamification' as TabType, icon: Trophy },
  { name: 'Advanced Analytics', tab: 'analytics' as TabType, icon: BarChart3 },
  { name: 'Profiles', tab: 'profiles' as TabType, icon: Users },
  { name: 'Settings', tab: 'settings' as TabType, icon: Settings },
]

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-rupee-600">Rupee</h1>
            <p className="text-xs text-gray-600">Finance Tracker</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.tab
              
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    onTabChange(item.tab)
                    onClose()
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 group relative
                    ${isActive 
                      ? 'bg-rupee-50 text-rupee-700 border-r-2 border-rupee-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-rupee-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="font-medium">{item.name}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Version 1.0.0</p>
            <p className="text-xs text-gray-400 mt-1">AI-Powered Finance Tracking</p>
          </div>
        </div>
      </div>
    </>
  )
} 