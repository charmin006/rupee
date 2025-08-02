'use client'

import { useState } from 'react'
import { BudgetLimit, Category } from '@/lib/types'
import { formatCurrency, generateId, getCategoryColor, getCategoryIcon } from '@/lib/utils'
import { Plus, AlertTriangle, Settings, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface BudgetLimitsProps {
  budgetLimits: BudgetLimit[]
  categories: Category[]
  onAddBudgetLimit: (limit: BudgetLimit) => void
  onUpdateBudgetLimit: (limit: BudgetLimit) => void
  onDeleteBudgetLimit: (id: string) => void
}

export default function BudgetLimits({
  budgetLimits,
  categories,
  onAddBudgetLimit,
  onUpdateBudgetLimit,
  onDeleteBudgetLimit,
}: BudgetLimitsProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'month' as 'day' | 'week' | 'month',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category || !formData.amount) {
      toast.error('Please fill in all required fields')
      return
    }
    
    const amount = parseFloat(formData.amount)
    if (amount <= 0) {
      toast.error('Budget amount must be greater than 0')
      return
    }
    
    // Check if budget limit already exists for this category and period
    const existingLimit = budgetLimits.find(
      limit => limit.category === formData.category && limit.period === formData.period
    )
    
    if (existingLimit) {
      toast.error(`Budget limit already exists for ${formData.category} (${formData.period})`)
      return
    }
    
    const newLimit: BudgetLimit = {
      id: generateId(),
      category: formData.category,
      amount: amount,
      period: formData.period,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    onAddBudgetLimit(newLimit)
    setShowAddModal(false)
    setFormData({ category: '', amount: '', period: 'month' })
    toast.success('Budget limit created successfully!')
  }

  const toggleBudgetLimit = (limit: BudgetLimit) => {
    const updatedLimit = { ...limit, isActive: !limit.isActive }
    onUpdateBudgetLimit(updatedLimit)
    toast.success(`Budget limit ${updatedLimit.isActive ? 'enabled' : 'disabled'}`)
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'day':
        return 'Daily'
      case 'week':
        return 'Weekly'
      case 'month':
        return 'Monthly'
      default:
        return period
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.name === categoryId)
    return category?.name || categoryId
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Limits</h1>
          <p className="text-gray-600">Set spending limits for different categories</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Limit</span>
        </button>
      </div>

      {/* Budget Limits List */}
      <div className="space-y-4">
        {budgetLimits.length === 0 ? (
          <div className="card text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No budget limits set</p>
            <p className="text-gray-400 mb-4">Create budget limits to get alerts when you exceed spending</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Set Your First Limit
            </button>
          </div>
        ) : (
          budgetLimits.map((limit) => {
            const category = categories.find(cat => cat.name === limit.category)
            
            return (
              <div
                key={limit.id}
                className={`card hover:shadow-md transition-shadow duration-200 ${
                  !limit.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Category Info */}
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: category?.color || '#6b7280' }}
                    >
                      <span className="text-lg">{category?.icon || '📝'}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getCategoryName(limit.category)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(limit.amount)} per {getPeriodLabel(limit.period).toLowerCase()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Status Badge */}
                    <span className={`badge ${limit.isActive ? 'badge-success' : 'badge-secondary'}`}>
                      {limit.isActive ? 'Active' : 'Inactive'}
                    </span>
                    
                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleBudgetLimit(limit)}
                      className={`p-2 rounded-md transition-colors ${
                        limit.isActive
                          ? 'text-warning-600 hover:bg-warning-50'
                          : 'text-success-600 hover:bg-success-50'
                      }`}
                      title={limit.isActive ? 'Disable limit' : 'Enable limit'}
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this budget limit?')) {
                          onDeleteBudgetLimit(limit.id)
                          toast.success('Budget limit deleted')
                        }
                      }}
                      className="p-2 rounded-md text-danger-600 hover:bg-danger-50 transition-colors"
                      title="Delete limit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Budget Limit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowAddModal(false)}
            />
            
            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Budget Limit</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category Selection */}
                  <div>
                    <label className="form-label">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Amount */}
                  <div>
                    <label className="form-label">Budget Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="input-field"
                      placeholder="1000"
                    />
                  </div>
                  
                  {/* Period */}
                  <div>
                    <label className="form-label">Period</label>
                    <select
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value as 'day' | 'week' | 'month' })}
                      className="input-field"
                    >
                      <option value="day">Daily</option>
                      <option value="week">Weekly</option>
                      <option value="month">Monthly</option>
                    </select>
                  </div>
                </form>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn-primary w-full sm:w-auto sm:ml-3"
                >
                  Create Limit
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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