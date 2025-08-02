'use client'

import { useState } from 'react'
import { SavingsGoal, Income, Expense } from '@/lib/types'

interface SavingsGoalsProps {
  goals: SavingsGoal[]
  incomes: Income[]
  expenses: Expense[]
  onAddGoal: (goal: SavingsGoal) => Promise<void>
  onUpdateGoal: (goal: SavingsGoal) => Promise<void>
  onDeleteGoal: (id: string) => Promise<void>
}

export default function SavingsGoals({ goals, incomes, expenses, onAddGoal, onUpdateGoal, onDeleteGoal }: SavingsGoalsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingGoal) {
      await onUpdateGoal({
        ...editingGoal,
        name: formData.name,
        targetAmount: formData.targetAmount,
        currentAmount: formData.currentAmount,
        targetDate: formData.targetDate
      })
      setEditingGoal(null)
    } else {
      await onAddGoal({
        id: '',
        name: formData.name,
        targetAmount: formData.targetAmount,
        currentAmount: formData.currentAmount,
        targetDate: formData.targetDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCompleted: false
      })
    }
    
    setFormData({ name: '', targetAmount: 0, currentAmount: 0, targetDate: '' })
    setIsModalOpen(false)
  }

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this savings goal?')) {
      await onDeleteGoal(id)
    }
  }

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const availableForSavings = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-600">Track your savings progress</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Available for Savings</h3>
          <p className="text-3xl font-bold text-green-600">₹{availableForSavings.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Goals</h3>
          <p className="text-3xl font-bold text-blue-600">{goals.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Goals</h3>
          <p className="text-3xl font-bold text-purple-600">{goals.filter(g => g.isCompleted).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100
          const isCompleted = goal.isCompleted || goal.currentAmount >= goal.targetAmount
          
          return (
            <div
              key={goal.id}
              className={`bg-white p-6 rounded-lg shadow border-l-4 ${
                isCompleted ? 'border-green-500' : 'border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                  <p className="text-sm text-gray-500">
                    Target: ₹{goal.targetAmount.toLocaleString()}
                  </p>
                  {goal.targetDate && (
                    <p className="text-sm text-gray-500">
                      Due: {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isCompleted ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Current</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{goal.currentAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{(goal.targetAmount - goal.currentAmount).toLocaleString()}
                  </p>
                </div>
              </div>

              {isCompleted && (
                <div className="mt-4 p-2 bg-green-100 rounded-lg">
                  <p className="text-green-800 text-sm font-medium text-center">
                    🎉 Goal Achieved!
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No savings goals yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first savings goal to start tracking your progress
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingGoal ? 'Edit Goal' : 'Add Savings Goal'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Emergency Fund, Vacation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                  min="0"
                  step="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10000"
                  min="0"
                  step="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  {editingGoal ? 'Update' : 'Add'} Goal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingGoal(null)
                    setFormData({ name: '', targetAmount: 0, currentAmount: 0, targetDate: '' })
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 