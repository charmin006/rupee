'use client'

import { useState } from 'react'
import { User, Expense, SavingsGoal } from '@/lib/types'

interface GamificationProps {
  user: User
  expenses: Expense[]
  goals: SavingsGoal[]
  onUpdateUser: (preferences: any) => Promise<void>
}

export default function Gamification({ user, expenses, goals, onUpdateUser }: GamificationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null)

  const calculateStreak = () => {
    // Calculate current streak based on daily expense tracking
    const today = new Date()
    const lastExpenseDate = expenses.length > 0 
      ? new Date(Math.max(...expenses.map(e => new Date(e.date).getTime())))
      : null
    
    if (!lastExpenseDate) return 0
    
    const diffTime = Math.abs(today.getTime() - lastExpenseDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays <= 1 ? user.streaks.currentStreak : 0
  }

  const calculateSavingsRate = () => {
    const totalIncome = user.preferences.monthlyBudget || 0
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    return totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
  }

  const getAchievementProgress = (achievement: any) => {
    switch (achievement.type) {
      case 'streak':
        return Math.min(calculateStreak(), achievement.maxProgress)
      case 'savings':
        return Math.min(calculateSavingsRate(), achievement.maxProgress)
      case 'goal':
        return goals.filter(g => g.isCompleted).length
      case 'no_spend':
        return user.streaks.noSpendDays
      default:
        return 0
    }
  }

  const handleUnlockAchievement = async (achievementId: string) => {
    const updatedAchievements = user.achievements.map(ach => 
      ach.id === achievementId 
        ? { ...ach, isUnlocked: true, unlockedAt: new Date().toISOString() }
        : ach
    )
    
    await onUpdateUser({ achievements: updatedAchievements })
  }

  const currentStreak = calculateStreak()
  const savingsRate = calculateSavingsRate()
  const completedGoals = goals.filter(g => g.isCompleted).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gamification</h1>
          <p className="text-gray-600">Track your progress and unlock achievements</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Streak</h3>
          <p className="text-3xl font-bold text-blue-600">{currentStreak} days</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Savings Rate</h3>
          <p className="text-3xl font-bold text-green-600">{savingsRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Goals Completed</h3>
          <p className="text-3xl font-bold text-purple-600">{completedGoals}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Achievements</h3>
          <p className="text-3xl font-bold text-orange-600">
            {user.achievements.filter(a => a.isUnlocked).length}/{user.achievements.length}
          </p>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.achievements.map((achievement) => {
            const progress = getAchievementProgress(achievement)
            const progressPercent = (progress / achievement.maxProgress) * 100
            const isUnlocked = achievement.isUnlocked || progress >= achievement.maxProgress
            
            return (
              <div
                key={achievement.id}
                className={`p-6 rounded-lg border-2 transition-all ${
                  isUnlocked 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`text-3xl ${isUnlocked ? 'opacity-100' : 'opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isUnlocked ? 'text-gray-900' : 'text-gray-700'}`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-500'}`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {progress}/{achievement.maxProgress}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isUnlocked ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {isUnlocked && !achievement.isUnlocked && (
                  <button
                    onClick={() => handleUnlockAchievement(achievement.id)}
                    className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Unlock Achievement! 🎉
                  </button>
                )}

                {achievement.isUnlocked && (
                  <div className="mt-4 p-2 bg-green-100 rounded-lg">
                    <p className="text-green-800 text-sm font-medium text-center">
                      🎉 Unlocked!
                    </p>
                    {achievement.unlockedAt && (
                      <p className="text-green-600 text-xs text-center mt-1">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Streak Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Streak Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Current Streak</h3>
            <p className="text-2xl font-bold text-blue-600">{currentStreak} days</p>
            <p className="text-sm text-gray-600 mt-1">
              Keep tracking expenses daily to maintain your streak!
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Longest Streak</h3>
            <p className="text-2xl font-bold text-purple-600">{user.streaks.longestStreak} days</p>
            <p className="text-sm text-gray-600 mt-1">
              Your best streak so far
            </p>
          </div>
        </div>
      </div>

      {/* No-Spend Days */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">No-Spend Days</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Current No-Spend Streak</h3>
            <p className="text-2xl font-bold text-green-600">{user.streaks.currentNoSpendStreak} days</p>
            <p className="text-sm text-gray-600 mt-1">
              Days without any expenses
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Total No-Spend Days</h3>
            <p className="text-2xl font-bold text-orange-600">{user.streaks.totalNoSpendDays} days</p>
            <p className="text-sm text-gray-600 mt-1">
              Total days without spending
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 