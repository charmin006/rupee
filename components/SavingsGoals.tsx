'use client'

import { useState } from 'react'
import { SavingsGoal, Income, Expense } from '@/lib/types'
import { formatCurrency, formatDate, calculateSavingsGoalProgress, generateId } from '@/lib/utils'
import { Plus, Target, Calendar, TrendingUp, CheckCircle, Edit, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface SavingsGoalsProps {
  goals: SavingsGoal[]
  incomes: Income[]
  expenses: Expense[]
  onAddGoal: (goal: SavingsGoal) => void
  onUpdateGoal: (goal: SavingsGoal) => void
  onDeleteGoal: (id: string) => void
}

export default function SavingsGoals({
  goals,
  incomes,
  expenses,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}: SavingsGoalsProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
  })
  const [progressAmount, setProgressAmount] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.targetAmount) {
      toast.error('Please fill in all required fields')
      return
    }
    
    const amount = parseFloat(formData.targetAmount)
    if (amount <= 0) {
      toast.error('Target amount must be greater than 0')
      return
    }
    
    if (editingGoal) {
      // Update existing goal
      const updatedGoal: SavingsGoal = {
        ...editingGoal,
        name: formData.name.trim(),
        targetAmount: amount,
        targetDate: formData.targetDate || undefined,
        updatedAt: new Date().toISOString(),
      }
      onUpdateGoal(updatedGoal)
      toast.success('Savings goal updated successfully!')
    } else {
      // Create new goal
      const newGoal: SavingsGoal = {
        id: generateId(),
        name: formData.name.trim(),
        targetAmount: amount,
        currentAmount: 0,
        targetDate: formData.targetDate || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCompleted: false,
      }
      onAddGoal(newGoal)
      toast.success('Savings goal created successfully!')
    }
    
    handleCloseModal()
  }

  const handleProgressUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedGoal || !progressAmount) {
      toast.error('Please enter a valid amount')
      return
    }
    
    const amount = parseFloat(progressAmount)
    if (amount < 0) {
      toast.error('Amount cannot be negative')
      return
    }
    
    const updatedGoal: SavingsGoal = {
      ...selectedGoal,
      currentAmount: amount,
      updatedAt: new Date().toISOString(),
      isCompleted: amount >= selectedGoal.targetAmount,
      completedAt: amount >= selectedGoal.targetAmount ? new Date().toISOString() : undefined,
    }
    
    onUpdateGoal(updatedGoal)
    setShowProgressModal(false)
    setSelectedGoal(null)
    setProgressAmount('')
    toast.success('Progress updated successfully!')
  }

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate || '',
    })
    setShowAddModal(true)
  }

  const handleProgress = (goal: SavingsGoal) => {
    setSelectedGoal(goal)
    setProgressAmount(goal.currentAmount.toString())
    setShowProgressModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingGoal(null)
    setFormData({ name: '', targetAmount: '', targetDate: '' })
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-success-500'
    if (progress >= 75) return 'bg-warning-500'
    if (progress >= 50) return 'bg-primary-500'
    return 'bg-gray-300'
  }

  const getProgressTextColor = (progress: number) => {
    if (progress >= 100) return 'text-success-600'
    if (progress >= 75) return 'text-warning-600'
    if (progress >= 50) return 'text-primary-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-600">Set and track your financial goals</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full">
            <div className="card text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No savings goals yet</p>
              <p className="text-gray-400 mb-4">Create your first savings goal to start tracking progress</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Create Your First Goal
              </button>
            </div>
          </div>
        ) : (
          goals.map((goal) => {
            const { progress, remaining, daysLeft, isOnTrack } = calculateSavingsGoalProgress(goal, incomes, expenses)
            
            return (
              <div
                key={goal.id}
                className={`card hover:shadow-md transition-shadow duration-200 ${
                  goal.isCompleted ? 'ring-2 ring-success-200 bg-success-50' : ''
                }`}
              >
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      {goal.name}
                      {goal.isCompleted && (
                        <CheckCircle className="h-5 w-5 text-success-600 ml-2" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Target: {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {goal.isCompleted && (
                      <span className="badge badge-success">Completed</span>
                    )}
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className={`font-medium ${getProgressTextColor(progress)}`}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Progress Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Savings:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                  
                  {goal.targetDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Days Left:</span>
                      <span className={`font-medium ${daysLeft < 7 ? 'text-danger-600' : 'text-gray-900'}`}>
                        {daysLeft}
                      </span>
                    </div>
                  )}
                  
                  {goal.targetDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${isOnTrack ? 'text-success-600' : 'text-warning-600'}`}>
                        {isOnTrack ? 'On Track' : 'Behind Schedule'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!goal.isCompleted && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <button
                      onClick={() => handleProgress(goal)}
                      className="btn-secondary w-full"
                    >
                      Update Progress
                    </button>
                    <button
                      onClick={() => {
                        const updatedGoal = { ...goal, isCompleted: true, completedAt: new Date().toISOString() }
                        onUpdateGoal(updatedGoal)
                        toast.success('Congratulations! Goal completed! 🎉')
                      }}
                      className="btn-primary w-full"
                      disabled={progress < 100}
                    >
                      {progress >= 100 ? 'Mark as Complete' : 'Complete Goal'}
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Add/Edit Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCloseModal}
            />
            
            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Goal Name */}
                  <div>
                    <label className="form-label">Goal Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      placeholder="e.g., New Phone, Vacation, Emergency Fund"
                    />
                  </div>
                  
                  {/* Target Amount */}
                  <div>
                    <label className="form-label">Target Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                      className="input-field"
                      placeholder="10000"
                    />
                  </div>
                  
                  {/* Target Date */}
                  <div>
                    <label className="form-label">Target Date (Optional)</label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </form>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn-primary w-full sm:w-auto sm:ml-3"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      {showProgressModal && selectedGoal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowProgressModal(false)}
            />
            
            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Update Progress</h3>
                  <button
                    onClick={() => setShowProgressModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">Goal: <span className="font-medium">{selectedGoal.name}</span></p>
                  <p className="text-gray-600">Target: <span className="font-medium">{formatCurrency(selectedGoal.targetAmount)}</span></p>
                </div>
                
                <form onSubmit={handleProgressUpdate} className="space-y-4">
                  {/* Current Amount */}
                  <div>
                    <label className="form-label">Current Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={progressAmount}
                      onChange={(e) => setProgressAmount(e.target.value)}
                      className="input-field"
                      placeholder="0.00"
                    />
                  </div>
                </form>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  onClick={handleProgressUpdate}
                  className="btn-primary w-full sm:w-auto sm:ml-3"
                >
                  Update Progress
                </button>
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 